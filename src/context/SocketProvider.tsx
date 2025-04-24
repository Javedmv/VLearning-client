import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../redux/store";
import { Message } from "../types/Message";
import { toast } from "react-hot-toast";
import { logout } from '../redux/actions/user/userAction';
const SOCKET_URL = import.meta.env.VITE_REACT_APP_CHAT_URL;

interface TypingUser {
  chatId: string;
  userId: string;
  username: string;
  timestamp: number;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  userId: string;
  stream: MediaStream | null;
}

// Define the type for the peer connections map
type PeerConnectionsMap = Map<string, PeerConnection>;

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  joinChatRoom: (chatId: string) => void;
  leaveChatRoom: (chatId: string) => void;
  sendMessage: (message: Partial<Message>) => void;
  handleTyping: (chatId: string) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  currentChatId: string | null;
  // Streaming properties
  streamViewers: string[];
  streamViewerNames: { [userId: string]: string };
  isStreaming: boolean;
  initiateStream: (chatId: string) => Promise<void>;
  joinStream: (chatId: string) => Promise<() => void>;
  endStream: (chatId: string) => void;
  leaveStream: (chatId: string) => void;
  localStream: MediaStream | null;
  callStatus: 'idle' | 'connecting' | 'connected' | 'failed' | 'ended';
  cleanupAllPeerConnections: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  joinChatRoom: () => {},
  leaveChatRoom: () => {},
  sendMessage: () => {},
  handleTyping: () => {},
  toggleAudio: () => {},
  toggleVideo: () => {},
  isAudioEnabled: true,
  isVideoEnabled: true,
  currentChatId: null,
  // Streaming properties
  streamViewers: [],
  streamViewerNames: {},
  isStreaming: false,
  initiateStream: async () => {},
  joinStream: async () => () => {},
  endStream: () => {},
  leaveStream: () => {},
  localStream: null,
  callStatus: 'idle',
  cleanupAllPeerConnections: () => {},
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
  const [typingUsers, setTypingsUsers] = useState<TypingUser[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [peerConnections, setPeerConnections] = useState<PeerConnectionsMap>(new Map());
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed' | 'ended'>('idle');
  
  // Streaming state variables
  const [streamViewers, setStreamViewers] = useState<string[]>([]);
  const [streamViewerNames, setStreamViewerNames] = useState<{ [userId: string]: string }>({});
  const [isStreaming, setIsStreaming] = useState(false);
  
  const peerConnectionsRef = useRef<PeerConnectionsMap>(new Map());
  
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  // Update the ref when the state changes
  useEffect(() => {
    peerConnectionsRef.current = peerConnections;
  }, [peerConnections]);

  const createPeerConnection = (targetUserId: string): RTCPeerConnection | undefined => {
    try {
      // Check if we already have a connection
      if (peerConnectionsRef.current.has(targetUserId)) {
        console.log(`Using existing peer connection for ${targetUserId}`);
        return peerConnectionsRef.current.get(targetUserId)?.connection;
      }
      
      console.log(`Creating new peer connection for ${targetUserId}`);
      
      // Create a new RTCPeerConnection
      const connection = new RTCPeerConnection(iceServers);
      
      // Add the local stream tracks to the connection (if we're the instructor)
      if (localStream && user?.role === 'instructor') {
        console.log('Adding instructor tracks to peer connection');
        localStream.getTracks().forEach(track => {
          if (localStream) {
            connection.addTrack(track, localStream);
          }
        });
      }
      
      // Set up ICE candidate handling
      connection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log(`Sending ICE candidate to ${targetUserId}`);
          socket.emit('streamIceCandidate', {
            chatId: currentChatId,
            from: user?.id,
            to: targetUserId,
            candidate: event.candidate
          });
        }
      };
      
      // Handle connection state changes
      connection.onconnectionstatechange = () => {
        console.log(`Connection state changed: ${connection.connectionState}`);
        if (connection.connectionState === 'failed' || 
            connection.connectionState === 'closed' ||
            connection.connectionState === 'disconnected') {
          cleanupPeerConnection(targetUserId);
        }
      };
      
      // Store the connection
      peerConnectionsRef.current.set(targetUserId, {
        connection,
        userId: targetUserId,
        stream: null
      });
      
      return connection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return undefined;
    }
  };

  const cleanupPeerConnection = (userId: string) => {
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      console.log('Cleaning up peer connection for user:', userId);
      pc.connection.close();
      peerConnectionsRef.current.delete(userId);
      setPeerConnections(new Map(peerConnectionsRef.current));
    }
  };

  const cleanupAllPeerConnections = () => {
    console.log('Cleaning up all peer connections');
    peerConnectionsRef.current.forEach((pc) => {
      pc.connection.close();
    });
    peerConnectionsRef.current.clear();
    setPeerConnections(new Map());
  };

  const getUserMedia = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Wait a moment for resources to be released
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      };
      
      // Try with both video and audio first
      try {
        console.log("Attempting to get user media with video and audio");
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Successfully got media stream with video and audio:", stream);
        return stream;
      } catch (error) {
        console.warn("Failed to get both video and audio, trying with just audio:", error);
        
        // If that fails, try with just audio
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        console.log("Successfully got audio-only stream:", audioOnlyStream);
        return audioOnlyStream;
      }
    } catch (error) {
      console.error("Error getting user media:", error);
      throw error;
    }
  };

  const checkMediaPermissions = async () => {
    try {
      // Check if permissions are already granted
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permissions.state === 'granted') {
        console.log("Camera permissions already granted");
        return true;
      }
      
      if (permissions.state === 'prompt') {
        console.log("Camera permissions will be requested");
        // Let the getUserMedia function handle the permission request
        return true;
      }
      
      // For denied state or other cases, try to request permissions directly
      console.log("Attempting to request camera and microphone permissions");
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Permissions granted successfully");
      return true;
    } catch (error) {
      console.error("Media permissions error:", error);
      
      // Check if this is a NotAllowedError (permission denied)
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        toast.error("Please allow camera and microphone access");
        
        const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        
        let settingsMessage = "You need to enable camera and microphone permissions to use video calls.";
        
        if (isChrome) {
          settingsMessage += " Click the camera icon in your address bar and select 'Always allow'.";
        } else if (isFirefox) {
          settingsMessage += " Click the camera icon in your address bar and select 'Allow'.";
        } else {
          settingsMessage += " Please check your browser settings to enable camera and microphone access.";
        }
        
        toast.error(settingsMessage, { duration: 5000 });
        showPermissionsModal();
      } else if (error instanceof DOMException && error.name === "NotFoundError") {
        toast.error("No camera or microphone found. Please connect a device and try again.");
      } else {
        toast.error("Error accessing media devices. Please try again.");
      }
      
      return false;
    }
  };

  const showPermissionsModal = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Camera and Microphone Access Required
              </p>
              <p className="mt-1 text-sm text-gray-500">
                To use video calls, you need to allow access to your camera and microphone.
              </p>
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">How to enable permissions:</p>
                <ol className="text-xs text-gray-500 list-decimal pl-4">
                  <li>Click the camera/lock icon in your browser's address bar</li>
                  <li>Select "Allow" for both camera and microphone</li>
                  <li>Refresh the page and try again</li>
                </ol>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    // Try to get media again after user interaction
                    getUserMedia()
                      .then(stream => {
                        setLocalStream(stream);
                        toast.success("Permissions granted! You can now make video calls.");
                        // If we're in a call, reconnect
                        if (currentChatId && isStreaming) {
                          createAndSendOffer(currentChatId);
                        }
                      })
                      .catch(err => {
                        console.error("Still no permissions:", err);
                        toast.error("Please try again after allowing camera and microphone access");
                      });
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 15000 });
  };

  const createAndSendOffer = async (targetUserId: string) => {
    if (!localStream || !currentChatId || !socket || !user?._id) {
      console.error("Cannot create offer: missing required data");
      return;
    }

    try {
      let pc = peerConnectionsRef.current.get(targetUserId)?.connection;
      
      if (!pc || pc.connectionState === 'failed') {
        pc = createPeerConnection(targetUserId);
        if (!pc) throw new Error("Failed to create peer connection");
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true
      });

      await pc.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            resolve();
          } else {
            setTimeout(checkState, 500);
          }
        };
        
        const timeout = setTimeout(() => {
          console.log('ICE gathering timed out, sending offer anyway');
          resolve();
        }, 5000);
        
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve();
        } else {
          checkState();
        }
      });

      socket.emit("offer", {
        chatId: currentChatId,
        offer: pc.localDescription,
        targetUserId,
        fromUserId: user._id
      });
      console.log(`Sent offer to ${targetUserId}`);
      
      setCallStatus('connecting');
    } catch (error) {
      console.error(`Error creating offer for ${targetUserId}:`, error);
      toast.error("Connection failed. Trying to reconnect...");
      
      setTimeout(() => {
        if (isStreaming) {
          createAndSendOffer(targetUserId);
        }
      }, 3000);
    }
  };

  const handleOffer = async (fromUserId: string, offer: RTCSessionDescriptionInit, chatId: string) => {
    if (!localStream || !socket || !user?._id) {
      console.error("Cannot handle offer: No local stream or socket");
      return;
    }

    try {
      let pc = peerConnectionsRef.current.get(fromUserId)?.connection;
      
      if (!pc || pc.connectionState === 'failed') {
        pc = createPeerConnection(fromUserId);
        if (!pc) throw new Error("Failed to create peer connection");
      }

      if (pc.signalingState !== 'stable') {
        console.log('Signaling state not stable, rolling back');
        await pc.setLocalDescription({type: 'rollback'});
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            resolve();
          } else {
            setTimeout(checkState, 500);
          }
        };
        
        const timeout = setTimeout(() => {
          console.log('ICE gathering timed out, sending answer anyway');
          resolve();
        }, 5000);
        
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timeout);
          resolve();
        } else {
          checkState();
        }
      });

      socket.emit("answer", {
        chatId,
        answer: pc.localDescription,
        targetUserId: fromUserId,
        fromUserId: user._id
      });
      console.log(`Sent answer to ${fromUserId}`);
      
      setCallStatus('connecting');
    } catch (error) {
      console.error(`Error handling offer from ${fromUserId}:`, error);
      toast.error("Failed to connect to peer. Trying again...");
      
      setTimeout(() => {
        const pc = peerConnectionsRef.current.get(fromUserId)?.connection;
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(fromUserId);
        }
        
        if (isStreaming && chatId === currentChatId) {
          socket.emit("requestConnection", {
            chatId,
            targetUserId: fromUserId,
            fromUserId: user._id
          });
        }
      }, 2000);
    }
  };

  const handleAnswer = async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionsRef.current.get(fromUserId)?.connection;
      if (pc && pc.signalingState !== "stable") {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Set remote description for ${fromUserId} from answer`);
      }
    } catch (error) {
      console.error(`Error handling answer from ${fromUserId}:`, error);
    }
  };

  const handleIceCandidate = async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionsRef.current.get(fromUserId)?.connection;
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`Added ICE candidate from ${fromUserId}`);
      }
    } catch (error) {
      console.error(`Error handling ICE candidate from ${fromUserId}:`, error);
    }
  };

  const handleUserJoinedCall = (data: { chatId: string, userId: string, username: string }) => {
    console.log(`User joined call: ${data.username} (${data.userId})`);
    
    if (data.chatId !== currentChatId || data.userId === user?._id || !localStream || !socket) return;

    try {
      let pc = peerConnectionsRef.current.get(data.userId)?.connection;
      if (!pc) {
        pc = createPeerConnection(data.userId);
        if (!pc) throw new Error("Failed to create peer connection");
      }

      const peerConnection: RTCPeerConnection = pc;
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          if (peerConnection.localDescription) {
            console.log(`Sending offer to ${data.userId}`);
            socket.emit("offer", {
              chatId: currentChatId,
              toUserId: data.userId,
              fromUserId: user!._id,
              offer: peerConnection.localDescription
            });
          }
        })
        .catch(error => {
          console.error("Error creating offer:", error);
        });
    } catch (error) {
      console.error(`Error handling user joined call for ${data.userId}:`, error);
    }
  };

  const handleConnectionRequest = (data: { chatId: string, userId: string }) => {
    console.log(`Connection requested by ${data.userId}`);
    
    if (data.chatId !== currentChatId || data.userId === user?._id || !localStream || !socket) return;

    try {
      let pc = peerConnectionsRef.current.get(data.userId)?.connection;
      if (!pc) {
        pc = createPeerConnection(data.userId);
        if (!pc) throw new Error("Failed to create peer connection");
      }

      const peerConnection: RTCPeerConnection = pc;
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          if (peerConnection.localDescription) {
            console.log(`Sending offer to ${data.userId}`);
            socket.emit("offer", {
              chatId: currentChatId,
              toUserId: data.userId,
              fromUserId: user!._id,
              offer: peerConnection.localDescription
            });
          }
        })
        .catch(error => {
          console.error("Error creating offer:", error);
        });
    } catch (error) {
      console.error(`Error handling connection request from ${data.userId}:`, error);
    }
  };

  const handleOfferMessage = (data: { chatId: string, offer: RTCSessionDescriptionInit, fromUserId: string, toUserId: string }) => {
    console.log(`Received offer from ${data.fromUserId}`);
    
    if (data.chatId !== currentChatId || data.toUserId !== user?._id || !localStream || !socket) return;

    try {
      let pc = peerConnectionsRef.current.get(data.fromUserId)?.connection;
      if (!pc) {
        pc = createPeerConnection(data.fromUserId);
        if (!pc) throw new Error("Failed to create peer connection");
      }

      const peerConnection: RTCPeerConnection = pc;
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
        .then(() => peerConnection.createAnswer())
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
          if (peerConnection.localDescription) {
            console.log(`Sending answer to ${data.fromUserId}`);
            socket.emit("answer", {
              chatId: currentChatId,
              toUserId: data.fromUserId,
              fromUserId: user!._id,
              answer: peerConnection.localDescription
            });
          }
        })
        .catch(error => {
          console.error("Error handling offer:", error);
        });
    } catch (error) {
      console.error(`Error handling offer from ${data.fromUserId}:`, error);
    }
  };

  const handleAnswerMessage = (data: { chatId: string, answer: RTCSessionDescriptionInit, fromUserId: string, toUserId: string }) => {
    console.log(`Received answer from ${data.fromUserId}`);
    
    if (data.chatId !== currentChatId || data.toUserId !== user?._id) return;

    const pc = peerConnectionsRef.current.get(data.fromUserId)?.connection;
    if (pc) {
      pc.setRemoteDescription(new RTCSessionDescription(data.answer))
        .catch(error => {
          console.error("Error setting remote description:", error);
        });
    } else {
      console.error(`No peer connection found for ${data.fromUserId}`);
    }
  };

  const handleIceCandidateMessage = (data: { chatId: string, candidate: RTCIceCandidateInit, fromUserId: string, toUserId: string }) => {
    console.log(`Received ICE candidate from ${data.fromUserId}`);
    
    if (data.chatId !== currentChatId || data.toUserId !== user?._id) return;

    const pc = peerConnectionsRef.current.get(data.fromUserId)?.connection;
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        .catch(error => {
          console.error("Error adding ICE candidate:", error);
        });
    } else {
      console.error(`No peer connection found for ${data.fromUserId}`);
    }
  };

  const handleUserLeftCall = (data: { chatId: string, userId: string, role: string }) => {
    if (data.chatId === currentChatId) {
      // Remove user from participants list
      setStreamViewers(prev => prev.filter(id => id !== data.userId));
      
      // Clean up peer connection
      const pc = peerConnectionsRef.current.get(data.userId)?.connection;
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(data.userId);
      }
      
      // Remove stream from participants
      setStreamViewers(prev => prev.filter(id => id !== data.userId));
      
      // If instructor left, end call for everyone
      if (data.role === 'instructor' && user?.role !== 'instructor') {
        toast.success("The instructor has ended the call");
        endStream(currentChatId);
      }
    }
  };

  const handleForceLogout = (data: { reason: string }) => {
    console.log("Force logout received:", data);
    toast.error(data.reason || "You have been logged out by an administrator");
    
    // Dispatch logout action
    dispatch(logout());
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    if (!user?._id || !SOCKET_URL || (user.role !== "instructor" && user.role !== "student")) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId: user._id },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    setSocket(newSocket);

    // Event handler definitions

    const handleConnect = () => {
      console.log("Socket connected");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const handleOnlineUsers = (users: string[]) => {
      setOnlineUsers(users);
    };

    const handleIncomingMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleUserTyping = ({ chatId, userId, username }: { chatId: string; userId: string; username: string }) => {
      setTypingsUsers((prev) => {
        const now = Date.now();
        const filtered = prev.filter((u) => u.userId !== userId && now - u.timestamp < 5000);
        
        // Then add the new typing indicator
        const newTypingUser: TypingUser = {
          chatId,
          userId,
          username,
          timestamp: now,
        };
        return [...filtered, newTypingUser];
      });
    };

    // Streaming event handlers
    const handleStreamStarted = (data: { chatId: string, streamerId: string, streamerName: string }) => {
      console.log("Stream started:", data);
      // Only show toast for students, not for the instructor who initiated the stream
      if (user?.role === "student" && data.streamerId !== user?._id && !isStreaming) {
        toast.success(`${data.streamerName} started a live stream`);
      }
    };

    const handleUserJoinedStream = (data: { chatId: string, userId: string, username: string }) => {
      console.log(`User joined stream: ${data.username} (${data.userId})`);
      
      if (data.chatId === currentChatId && isStreaming) {
        // Only update the viewer lists if this is a new viewer
        setStreamViewers(prev => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
        
        setStreamViewerNames(prev => ({
          ...prev,
          [data.userId]: data.username
        }));
        
        // Only show toast if we're the instructor (prevent duplicate toasts)
        if (user?.role === 'instructor' && user?._id !== data.userId && !streamViewers.includes(data.userId)) {
          toast.success(`${data.username} joined the stream`);
        }
      }
    };

    const handleUserLeftStream = (data: { chatId: string, userId: string, username: string }) => {
      console.log(`User left stream: ${data.username} (${data.userId})`);
      
      if (data.chatId === currentChatId && isStreaming) {
        // Update viewers list
        setStreamViewers(prev => prev.filter(id => id !== data.userId));
        
        // Update viewer names
        setStreamViewerNames(prev => {
          const updated = { ...prev };
          delete updated[data.userId];
          return updated;
        });
        
        if (user?.role === 'instructor' && user?._id !== data.userId) {
          toast.success(`${data.username} left the stream`);
        }
      }
    };
    
    const handleStreamEnded = (data: { chatId: string, userId: string, streamerName: string }) => {
      console.log(`Stream ended by ${data.streamerName} in chat ${data.chatId}`);
      
      if (data.chatId === currentChatId) {
        if (data.userId !== user?._id) {
          toast.success(`${data.streamerName} ended the stream`);
        }
        
        if (isStreaming) {
          setIsStreaming(false);
          setStreamViewers([]);
          setStreamViewerNames({});
          setCallStatus('ended');
          
          // Clean up stream resources
          if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
          }
          cleanupAllPeerConnections();
        }
      }
    };

    const handleNewStreamViewer = async (data: { chatId: string, viewerId: string, viewerName: string }) => {
      console.log(`New stream viewer: ${data.viewerName} (${data.viewerId})`);
      
      // Only instructors need to establish connections with new viewers
      if (user?.role !== 'instructor' || !isStreaming || data.chatId !== currentChatId) return;
      
      try {
        // Update UI immediately to show new viewer
        setStreamViewers(prev => {
          if (!prev.includes(data.viewerId)) {
            return [...prev, data.viewerId];
          }
          return prev;
        });
        
        setStreamViewerNames(prev => ({
          ...prev,
          [data.viewerId]: data.viewerName
        }));
        
        // Create a peer connection for this viewer
        const pc = new RTCPeerConnection(iceServers);
        
        // Add ICE candidate handler
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Instructor sending ICE candidate to viewer:", data.viewerId);
            socket?.emit("streamIceCandidate", {
              chatId: data.chatId,
              to: data.viewerId,
              from: user._id,
              candidate: event.candidate
            });
          }
        };
        
        // Add all tracks from our local stream to the peer connection
        if (localStream) {
          console.log("Instructor adding tracks to stream for viewer:", data.viewerId);
          localStream.getTracks().forEach(track => {
            console.log(`Adding track: ${track.kind} to connection for ${data.viewerId}`);
            pc.addTrack(track, localStream);
          });
        } else {
          console.error("No local stream available to share with viewer:", data.viewerId);
          toast.error("Cannot share stream - no camera available");
          return;
        }
        
        // Store the peer connection
        peerConnectionsRef.current.set(data.viewerId, {
          connection: pc,
          userId: data.viewerId,
          stream: null
        });
        
        // Create and send an offer to the viewer
        try {
          console.log("Creating offer for viewer:", data.viewerId);
          const offer = await pc.createOffer({
            offerToReceiveAudio: false,  // We don't need to receive audio from students
            offerToReceiveVideo: false   // We don't need to receive video from students
          });
          
          await pc.setLocalDescription(offer);
          
          console.log("Sending offer to viewer:", data.viewerId);
          socket?.emit("streamOffer", {
            chatId: data.chatId,
            to: data.viewerId,
            from: user._id,
            offer: pc.localDescription
          });
        } catch (offerError) {
          console.error("Error creating/sending offer to viewer:", offerError);
        }
      } catch (error) {
        console.error(`Error establishing connection with viewer ${data.viewerId}:`, error);
      }
    };
    
    // Handle stream offer received (student side)
    const handleStreamOffer = async (data: { chatId: string, from: string, to: string, offer: RTCSessionDescriptionInit }) => {
      console.log('Received stream offer:', data);
      
      if (!socket || !user?._id) {
        console.error("Socket or user ID not available when handling stream offer");
        return;
      }
      
      try {
        // Create a new peer connection if one doesn't exist
        if (!peerConnectionsRef.current.has(data.from)) {
          console.log('Creating new peer connection for instructor:', data.from);
          const pc = new RTCPeerConnection({
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
          });
          
          // Set up event handlers for the new connection
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              console.log('Sending ICE candidate to instructor');
              socket.emit('streamIceCandidate', {
                chatId: data.chatId,
                to: data.from,
                from: user._id,
                candidate: event.candidate
              });
            }
          };

          pc.onconnectionstatechange = () => {
            console.log('Connection state changed:', pc.connectionState);
            if (pc.connectionState === 'connected') {
              setCallStatus('connected');
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
              setCallStatus('failed');
              cleanupPeerConnection(data.from);
            }
          };

          pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state changed:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'failed') {
              setCallStatus('failed');
              cleanupPeerConnection(data.from);
            }
          };

          // Handle incoming tracks
          pc.ontrack = (event) => {
            console.log('Received track:', event.track.kind);
            if (event.streams && event.streams[0]) {
              setLocalStream(event.streams[0]);
              setCallStatus('connected');
            }
          };

          // Store the connection
          const peerConnection: PeerConnection = {
            connection: pc,
            userId: data.from,
            stream: null
          };
          peerConnectionsRef.current.set(data.from, peerConnection);

          // Set the remote description
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          
          // Create and send answer
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          console.log('Sending stream answer to instructor');
          socket.emit('streamAnswer', {
            chatId: data.chatId,
            to: data.from,
            from: user._id,
            answer: answer
          });
        }
      } catch (error) {
        console.error('Error handling stream offer:', error);
        setCallStatus('failed');
        cleanupPeerConnection(data.from);
      }
    };
    
    // Handle stream answer received (instructor side)
    const handleStreamAnswer = async (data: { chatId: string, from: string, to: string, answer: RTCSessionDescriptionInit }) => {
      console.log(`Instructor received stream answer from student ${data.from} to ${data.to}`, {
        currentUser: user?._id,
        currentRole: user?.role,
        isStreaming,
        currentChatId,
        targetChatId: data.chatId
      });
      
      // Only process if we're an instructor and in the current chat
      if (user?.role !== 'instructor' || !isStreaming || data.chatId !== currentChatId) {
        console.log('Ignoring stream answer - conditions not met', {
          isInstructor: user?.role === 'instructor',
          isStreaming,
          chatIdMatch: data.chatId === currentChatId
        });
        return;
      }
      
      try {
        // Get the peer connection for this viewer
        const pc = peerConnectionsRef.current.get(data.from)?.connection;
        if (!pc) {
          console.error(`No peer connection found for ${data.from}`);
          return;
        }
        
        // Set the remote description from the answer
        console.log(`Setting remote description from student ${data.from}`);
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log(`Successfully set remote description for ${data.from}, signaling state: ${pc.signalingState}`);
        
        // Ensure this student is in our viewers list
        setStreamViewers(prev => {
          if (!prev.includes(data.from)) {
            console.log(`Adding ${data.from} to stream viewers after answer`);
            return [...prev, data.from];
          }
          return prev;
        });
      } catch (error) {
        console.error(`Error handling stream answer from ${data.from}:`, error);
        
        // Remove from viewers list if we can't establish connection
        setStreamViewers(prev => prev.filter(id => id !== data.from));
        setStreamViewerNames(prev => {
          const updated = { ...prev };
          delete updated[data.from];
          return updated;
        });
      }
    };
    
    // Handle stream ICE candidate (both instructor and student)
    const handleStreamIceCandidate = async (data: { chatId: string, from: string, to: string, candidate: RTCIceCandidateInit }) => {
      console.log(`Received stream ICE candidate from ${data.from}`);
      
      if (data.chatId !== currentChatId || data.to !== user?._id) return;
      
      try {
        const pc = peerConnectionsRef.current.get(data.from)?.connection;
        if (pc) {
          console.log(`Adding ICE candidate from ${data.from}`);
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          console.warn(`Received ICE candidate but no peer connection exists for ${data.from}`);
        }
      } catch (error) {
        console.error(`Error handling stream ICE candidate:`, error);
      }
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("getOnlineUsers", handleOnlineUsers);
    newSocket.on("receiveMessage", handleIncomingMessage);
    newSocket.on("userTyping", handleUserTyping);
    
    // Streaming event handlers
    newSocket.on("streamStarted", handleStreamStarted);
    newSocket.on("userJoinedStream", handleUserJoinedStream);
    newSocket.on("userLeftStream", handleUserLeftStream);
    newSocket.on("streamEnded", handleStreamEnded);
    newSocket.on("newStreamViewer", handleNewStreamViewer);
    newSocket.on("streamOffer", handleStreamOffer);
    newSocket.on("streamAnswer", handleStreamAnswer);
    newSocket.on("streamIceCandidate", handleStreamIceCandidate);

    // Return cleanup function
    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("getOnlineUsers", handleOnlineUsers);
      newSocket.off("receiveMessage", handleIncomingMessage);
      newSocket.off("userTyping", handleUserTyping);
      
      // Streaming event cleanup
      newSocket.off("streamStarted", handleStreamStarted);
      newSocket.off("userJoinedStream", handleUserJoinedStream);
      newSocket.off("userLeftStream", handleUserLeftStream);
      newSocket.off("streamEnded", handleStreamEnded);
      newSocket.off("newStreamViewer", handleNewStreamViewer);
      newSocket.off("streamOffer", handleStreamOffer);
      newSocket.off("streamAnswer", handleStreamAnswer);
      newSocket.off("streamIceCandidate", handleStreamIceCandidate);
      
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const typingTimeout = setInterval(() => {
      const now = Date.now();
      setTypingsUsers((prev) => prev.filter((user) => now - user.timestamp < 3000));
    }, 1000);

    return () => clearInterval(typingTimeout);
  }, []);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      cleanupAllPeerConnections();
    };
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
      socket.emit("typing", { chatId, userId: user._id, username: user?.username });
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setIsAudioEnabled(enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setIsVideoEnabled(enabled);
      }
    }
  };

  // Instructor-only: Start a live stream
  const initiateStream = async (chatId: string) => {
    try {
      // Check if user has necessary permissions
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) return;

      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      cleanupAllPeerConnections();

      // Set status to connecting
      setCallStatus('connecting');
      
      // Get user media
      const stream = await getUserMedia();
      
      // Make sure we have video
      if (!stream.getVideoTracks().length) {
        toast.error("Unable to access camera. Video stream is required for streaming.");
        throw new Error("Video stream required");
      }
      
      setLocalStream(stream);
      setCurrentChatId(chatId);

      // Notify server about stream start
      if (socket) {
        socket.emit("initiateStream", {
          chatId,
          streamerId: user?._id,
          streamerName: user?.username || `${user?.firstName} ${user?.lastName}`
        });
      }

      // Update state
      setIsStreaming(true);
      setStreamViewers([]);
      setStreamViewerNames({});
      
      // Update call status when stream is ready
      setTimeout(() => {
        setCallStatus('connected')
        toast.success("Live stream started successfully. Students can now join.");
      }, 1000);
      
    } catch (error) {
      console.error("Error initiating stream:", error);
      toast.error("Failed to start stream. Please check your camera and microphone.");
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setIsStreaming(false);
      setCallStatus('failed');
    }
  };

  // Student-only: Join a live stream
  const joinStream = async (chatId: string): Promise<() => void> => {
    console.log('Joining stream for chat:', chatId);
    
    if (!socket || !user?._id) {
      console.error("Socket or user ID not available");
      toast.error("Connection error. Please refresh the page.");
      return () => {};
    }

    // Create a local reference to track connection attempts
    const connectionRef = {
      isCancelled: false,
      timeoutId: null as NodeJS.Timeout | null,
      intervalId: null as NodeJS.Timeout | null,
      retryCount: 0
    };

    try {
      setCallStatus('connecting');
      setCurrentChatId(chatId);
      
      cleanupAllPeerConnections();
      
      // Create an empty audio stream to request microphone access
      const emptyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      emptyStream.getTracks().forEach(track => track.stop());
      
      // Join the stream room
      socket.emit('joinStream', {
        chatId,
        userId: user._id,
        username: user.username
      });
      
      // Set up a timeout to check if connection was successful
      connectionRef.timeoutId = setTimeout(() => {
        if (connectionRef.isCancelled) return;
        
        if (callStatus === 'connecting') {
          console.log('Connection timeout, attempting to reconnect...');
          toast.error('Connection timed out. Attempting to reconnect...');
          
          // Start a new connection attempt without creating a new cleanup function
          socket.emit('joinStream', {
            chatId,
            userId: user._id,
            username: user.username
          });
        }
      }, 10000); // 10 second timeout
      
      // Set up a retry mechanism
      const maxRetries = 3;
      const retryInterval = 5000; // 5 seconds
      
      connectionRef.intervalId = setInterval(() => {
        if (connectionRef.isCancelled) {
          if (connectionRef.intervalId) clearInterval(connectionRef.intervalId);
          return;
        }
        
        if (callStatus === 'ended') {
          console.log('Stream ended, stopping retry attempts');
          if (connectionRef.intervalId) clearInterval(connectionRef.intervalId);
          return;
        }
        
        if (callStatus === 'connecting' && connectionRef.retryCount < maxRetries) {
          connectionRef.retryCount++;
          console.log(`Retry attempt ${connectionRef.retryCount} of ${maxRetries}`);
          socket.emit('joinStream', {
            chatId,
            userId: user._id,
            username: user.username
          });
        } else if (connectionRef.retryCount >= maxRetries) {
          if (connectionRef.intervalId) clearInterval(connectionRef.intervalId);
          
          if (callStatus === 'connecting' && !connectionRef.isCancelled) {
            setCallStatus('failed');
            toast.error('Failed to connect after multiple attempts. Please try again later.');
          }
        }
      }, retryInterval);
      
      // Cleanup function - IMPORTANT! This is called when StreamingModal unmounts
      return () => {
        console.log('Cleanup function called - cancelling all connection attempts');
        connectionRef.isCancelled = true;
        
        if (connectionRef.timeoutId) clearTimeout(connectionRef.timeoutId);
        if (connectionRef.intervalId) clearInterval(connectionRef.intervalId);
        
        // Only clean up connections if we haven't already connected
        if (callStatus !== 'connected') {
          cleanupAllPeerConnections();
        }
        
        // Set status to ended or idle depending on context
        setCallStatus(prev => prev === 'connecting' ? 'idle' : prev);
      };
      
    } catch (error) {
      console.error('Error joining stream:', error);
      setCallStatus('failed');
      toast.error('Failed to join stream. Please check your permissions and try again.');
      return () => {
        connectionRef.isCancelled = true;
        if (connectionRef.timeoutId) clearTimeout(connectionRef.timeoutId);
        if (connectionRef.intervalId) clearInterval(connectionRef.intervalId);
      };
    }
  };

  // End a streaming session (instructor only)
  const endStream = (chatId: string) => {
    if (!socket || !user?._id) {
      console.error("Socket or user ID not available");
      toast.error("Connection error. Please refresh the page.");
      return;
    }
    
    try {
      console.log('Ending stream for chat:', chatId);
      
      // Force audio and video off before ending stream
      if (localStream) {
        // Turn off audio tracks
        const audioTracks = localStream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks.forEach(track => {
            track.enabled = false;
          });
          setIsAudioEnabled(false);
        }
        
        // Turn off video tracks
        const videoTracks = localStream.getVideoTracks();
        if (videoTracks.length > 0) {
          videoTracks.forEach(track => {
            track.enabled = false;
          });
          setIsVideoEnabled(false);
        }
      }
      
      // Notify server
      socket.emit('endStream', {
        chatId,
        userId: user._id,
        role: user.role
      });
      
      // Stop all media tracks
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
        setLocalStream(null);
      }
      
      // Clean up all peer connections
      cleanupAllPeerConnections();
      
      // Reset state
      setCurrentChatId(null);
      setCallStatus('ended');
      setIsStreaming(false);
      setStreamViewers([]);
      setStreamViewerNames({});
      
      toast.success("Stream ended successfully");
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end stream properly. Please refresh the page.');
      
      // Attempt to clean up even if there was an error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      cleanupAllPeerConnections();
      setIsStreaming(false);
    }
  };

  // Leave a streaming session (student only)
  const leaveStream = (chatId: string) => {
    if (!socket || !user?._id) {
      console.error("Socket or user ID not available");
      toast.error("Connection error. Please refresh the page.");
      return;
    }
    
    try {
      console.log('Leaving stream for chat:', chatId);
      
      setCallStatus('ended');
     
      socket.emit('leaveStream', {
        chatId,
        userId: user._id,
        username: user.username || `${user.firstName} ${user.lastName}`
      });
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
        setLocalStream(null);
      }
      cleanupAllPeerConnections();
      
      setCurrentChatId(null);
      
      toast.success("Left stream successfully");
    } catch (error) {
      console.error('Error leaving stream:', error);
      toast.error('Failed to leave stream properly. Please refresh the page.');
      
      // Attempt to clean up even if there was an error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      cleanupAllPeerConnections();
    }
  };

  const contextValue: SocketContextType = {
    socket,
    messages,
    onlineUsers,
    typingUsers,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    handleTyping,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    currentChatId,
    // Streaming properties
    localStream,
    callStatus,
    cleanupAllPeerConnections,
    streamViewers,
    streamViewerNames,
    isStreaming,
    initiateStream,
    joinStream,
    endStream,
    leaveStream,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};