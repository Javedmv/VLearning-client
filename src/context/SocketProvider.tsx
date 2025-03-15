import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../redux/store";
import { Message } from "../types/Message";
import { toast } from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_REACT_APP_CHAT_URL;

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  joinChatRoom: (chatId: string) => void;
  leaveChatRoom: (chatId: string) => void;
  sendMessage: (message: Partial<Message>) => void;
  initiateVideoCall: (chatId: string) => void;
  joinVideoCall: (chatId: string) => void;
  endVideoCall: (chatId: string) => void;
  peerConnection: RTCPeerConnection | null;
  isVideoCallActive: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  setIsVideoCallActive: (isActive: boolean) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  messages: [],
  onlineUsers: [],
  joinChatRoom: () => {},
  leaveChatRoom: () => {},
  sendMessage: () => {},
  initiateVideoCall: () => {},
  joinVideoCall: () => {},
  endVideoCall: () => {},
  peerConnection: null,
  isVideoCallActive: false,
  remoteStream: null,
  localStream: null,
  setIsVideoCallActive: () => {}
});

export const useSocketContext = (): SocketContextType => {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection(iceServers);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('ice-candidate', { candidate: event.candidate });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
      };

      setPeerConnection(pc);
      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };

  const checkMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      return true;
    } catch (error) {
      console.error('Media permissions error:', error);
      toast.error('Please allow camera and microphone access');
      return false;
    }
  };

  const initiateVideoCall = async (chatId: string) => {
    try {
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) return;

      // First check if we already have a stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Get new media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setLocalStream(stream);

      const pc = createPeerConnection();
      if (!pc) {
        throw new Error('Failed to create peer connection');
      }

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create and set local description
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);

      // Emit the offer to the other peer
      socket?.emit('startVideoCall', { chatId, offer });
      setIsVideoCallActive(true);
      
      console.log('Video call initiated successfully');
    } catch (error: any) {
      console.error('Error starting video call:', error);
      toast.error(error.message || 'Failed to start video call');
      
      // Cleanup on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
      setIsVideoCallActive(false);
    }
  };

  const joinVideoCall = async (chatId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = createPeerConnection();
      if (!pc) {
        throw new Error('Failed to create peer connection');
      }
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      socket?.emit('joinVideoCall', { chatId });
      setIsVideoCallActive(true);
    } catch (error) {
      console.error('Error joining video call:', error);
      toast.error('Failed to join video call');
    }
  };

  const endVideoCall = (chatId: string) => {
    try {
      // Stop all tracks in the local stream
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
        });
        setLocalStream(null);
      }

      // Clear remote stream
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => {
          track.stop();
        });
        setRemoteStream(null);
      }

      // Close peer connection
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }

      setIsVideoCallActive(false);
      socket?.emit('endVideoCall', { chatId });
    } catch (error) {
      console.error('Error ending video call:', error);
    }
  };

  useEffect(() => {
    // Ensure user is logged in and socket URL is available
    if ((user?.role === "instructor" || user?.role === "student") && SOCKET_URL) {
      // Create socket connection
      const newSocket = io(SOCKET_URL, {
        path: "/socket.io/",
        query: {
            userId: user._id,
        },
        transports: ['polling', 'websocket'], // Try both transports
        reconnectionAttempts: 5,
        timeout: 10000
    });

      const handleConnect = () => {
        console.log("Socket connected");
        setSocket(newSocket);
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
        setSocket(null);
      };

      const handleOnlineUsers = (users: string[]) => {
        console.log("Online users:", users);
        setOnlineUsers(users);
      };

      const handleIncomingMessage = (message: Message) => {
        setMessages(prevMessages => [...prevMessages, message]);
      };

      const handleVideoCallStarted = () => {
        console.log("Video call started");
        // You might want to update some state here to reflect the video call status
      };

      const handleVideoCallEnded = () => {
        console.log("Video call ended");
        // Update state to reflect the video call has ended
      };

      // Attach event listeners
      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      })
      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('getOnlineUsers', handleOnlineUsers);
      newSocket.on('receiveMessage', handleIncomingMessage);
      newSocket.on('videoCallStarted', handleVideoCallStarted);
      newSocket.on('videoCallEnded', handleVideoCallEnded);

      if (socket) {
        socket.on('offer', async ({ offer }) => {
          try {
            const pc = createPeerConnection();
            if (!pc) throw new Error('Failed to create peer connection');

            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            socket.emit('answer', { answer });
          } catch (error) {
            console.error('Error handling offer:', error);
          }
        });

        socket.on('answer', async ({ answer }) => {
          try {
            if (peerConnection && answer) {
              await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        });

        socket.on('ice-candidate', async ({ candidate }) => {
          try {
            if (peerConnection && candidate) {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
          } catch (error) {
            console.error('Error handling ICE candidate:', error);
          }
        });

        socket.on('videoCallStarted', () => {
          setIsVideoCallActive(true);
          toast.success('Video call started');
        });

        socket.on('videoCallEnded', () => {
          endVideoCall('');  // Pass empty string since we're just cleaning up
          toast.success('Video call ended');
        });
      }

      // Cleanup function
      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('getOnlineUsers', handleOnlineUsers);
        newSocket.off('receiveMessage', handleIncomingMessage);
        newSocket.off('videoCallStarted', handleVideoCallStarted);
        newSocket.off('videoCallEnded', handleVideoCallEnded);
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Function to join a chat room
  const joinChatRoom = (chatId: string) => {
    if (socket && user?._id && chatId) {
      socket.emit("join", { chatId, userId: user._id });
    }
  };

  // Function to leave a chat room
  const leaveChatRoom = (chatId: string) => {
    if (socket && user?._id && chatId) {
      socket.emit("leave", { chatId, userId: user._id });
    }
  };

  // Function to send a message
  const sendMessage = (message: Partial<Message>) => {
    if (socket && user?._id && message.chatId) {
      const fullMessage = {
        ...message,
        sender: user._id,
        type: message.type || "message",
        contentType: message.contentType || "text"
      };
      socket.emit("sendMessage", fullMessage);
    }
  };

  const contextValues: SocketContextType = {
    socket,
    messages,
    onlineUsers,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    initiateVideoCall,
    joinVideoCall,
    endVideoCall,
    peerConnection,
    isVideoCallActive,
    remoteStream,
    localStream,
    setIsVideoCallActive
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream, remoteStream]);

  return (
    <SocketContext.Provider value={contextValues}>
      {children}
    </SocketContext.Provider>
  );
};