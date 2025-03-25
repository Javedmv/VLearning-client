import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../redux/store";
import { Message } from "../types/Message";
import { toast } from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_REACT_APP_CHAT_URL;

// Define typing user interface
interface TypingUser {
  chatId: string;
  userId: string;
  username: string;
  timestamp: number;
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: TypingUser[]; // Added typing users to context
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
  handleTyping: (chatId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [], // Default empty array
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
  setIsVideoCallActive: () => {},
  handleTyping: () => {},
});

export const useSocketContext = (): SocketContextType => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingsUsers] = useState<TypingUser[]>([]); // State for typing users
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
    ],
  };

  const createPeerConnection = () => {
    try {
      const pc = new RTCPeerConnection(iceServers);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("ice-candidate", { candidate: event.candidate });
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
      console.error("Error creating peer connection:", error);
      return null;
    }
  };

  const checkMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      return true;
    } catch (error) {
      console.error("Media permissions error:", error);
      toast.error("Please allow camera and microphone access");
      return false;
    }
  };

  const initiateVideoCall = async (chatId: string) => {
    try {
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) return;

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      const pc = createPeerConnection();
      if (!pc) {
        throw new Error("Failed to create peer connection");
      }

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      await pc.setLocalDescription(offer);

      socket?.emit("startVideoCall", { chatId, offer });
      setIsVideoCallActive(true);

      console.log("Video call initiated successfully");
    } catch (error: any) {
      console.error("Error starting video call:", error);
      toast.error(error.message || "Failed to start video call");

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
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
        throw new Error("Failed to create peer connection");
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      socket?.emit("joinVideoCall", { chatId });
      setIsVideoCallActive(true);
    } catch (error) {
      console.error("Error joining video call:", error);
      toast.error("Failed to join video call");
    }
  };

  const endVideoCall = (chatId: string) => {
    try {
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        setLocalStream(null);
      }

      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => {
          track.stop();
        });
        setRemoteStream(null);
      }

      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }

      setIsVideoCallActive(false);
      socket?.emit("endVideoCall", { chatId });
    } catch (error) {
      console.error("Error ending video call:", error);
    }
  };

  useEffect(() => {
    if ((user?.role === "instructor" || user?.role === "student") && SOCKET_URL) {
      const newSocket = io(SOCKET_URL, {
        path: "/socket.io/",
        query: {
          userId: user._id,
        },
        transports: ["polling", "websocket"],
        reconnectionAttempts: 5,
        timeout: 10000,
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
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      const handleUserTyping = ({ chatId, userId, username }: { chatId: string; userId: string; username: string }) => {
        if (userId !== user?._id) {
          console.log(`Received typing from ${username} (${userId}) in chat ${chatId}`);
          setTypingsUsers((prev) => {
            const filtered = prev.filter((u) => u.userId !== userId && u.chatId === chatId);
            return [...filtered, { chatId, userId, username, timestamp: Date.now() }];
          });
        }
      };

      newSocket.on("connect_error", (error) => {
        console.error("Connection error:", error);
      });
      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("getOnlineUsers", handleOnlineUsers);
      newSocket.on("receiveMessage", handleIncomingMessage);
      newSocket.on("userTyping", handleUserTyping);

      newSocket.on("offer", async ({ offer }) => {
        try {
          const pc = createPeerConnection();
          if (!pc) throw new Error("Failed to create peer connection");

          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          newSocket.emit("answer", { answer });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });

      newSocket.on("answer", async ({ answer }) => {
        try {
          if (peerConnection && answer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          }
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      });

      newSocket.on("ice-candidate", async ({ candidate }) => {
        try {
          if (peerConnection && candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (error) {
          console.error("Error handling ICE candidate:", error);
        }
      });

      newSocket.on("videoCallStarted", () => {
        setIsVideoCallActive(true);
        toast.success("Video call started");
      });

      newSocket.on("videoCallEnded", () => {
        endVideoCall("");
        toast.success("Video call ended");
      });

      return () => {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("getOnlineUsers", handleOnlineUsers);
        newSocket.off("receiveMessage", handleIncomingMessage);
        newSocket.off("userTyping", handleUserTyping);
        newSocket.off("offer");
        newSocket.off("answer");
        newSocket.off("ice-candidate");
        newSocket.off("videoCallStarted");
        newSocket.off("videoCallEnded");
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Cleanup typing indicators
  useEffect(() => {
    const typingTimeout = setInterval(() => {
      const now = Date.now();
      setTypingsUsers((prev) => prev.filter((user) => now - user.timestamp < 3000));
    }, 1000);

    return () => clearInterval(typingTimeout);
  }, []);

  const joinChatRoom = (chatId: string) => {
    if (socket && user?._id && chatId) {
      socket.emit("join", { chatId, userId: user._id });
      console.log(`Joined chat room ${chatId}`);
    }
  };

  const leaveChatRoom = (chatId: string) => {
    if (socket && user?._id && chatId) {
      socket.emit("leave", { chatId, userId: user._id });
      console.log(`Left chat room ${chatId}`);
    }
  };

  const sendMessage = (message: Partial<Message>) => {
    if (socket && user?._id && message.chatId) {
      const fullMessage = {
        ...message,
        sender: user._id,
        type: message.type || "message",
        contentType: message.contentType || "text",
      };
      socket.emit("sendMessage", fullMessage);
    }
  };

  const handleTyping = (chatId: string) => {
    if (socket && user?._id && chatId) {
      socket.emit("typing", { chatId, userId: user._id, username: user.username });
    }
  };

  const contextValues: SocketContextType = {
    socket,
    messages,
    onlineUsers,
    typingUsers, // Expose typing users
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
    setIsVideoCallActive,
    handleTyping,
  };

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [localStream, remoteStream]);

  return (
    <SocketContext.Provider value={contextValues}>
      {children}
    </SocketContext.Provider>
  );
};