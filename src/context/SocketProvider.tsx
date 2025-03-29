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

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  joinChatRoom: (chatId: string) => void;
  leaveChatRoom: (chatId: string) => void;
  sendMessage: (message: Partial<Message>) => void;
  initiateVideoCall: (chatId: string) => void;
  joinVideoCall: (chatId: string) => void;
  endVideoCall: (chatId: string) => void;
  isVideoCallActive: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  setIsVideoCallActive: (isActive: boolean) => void;
  handleTyping: (chatId: string) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  participantStreams: { [userId: string]: MediaStream };
  currentChatId: string | null;
  reconnectToCall: (chatId: string) => void;
  callStatus: 'idle' | 'connecting' | 'connected' | 'failed' | 'ended';
  callParticipants: string[];
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
  initiateVideoCall: () => {},
  joinVideoCall: () => {},
  endVideoCall: () => {},
  isVideoCallActive: false,
  remoteStream: null,
  localStream: null,
  setIsVideoCallActive: () => {},
  handleTyping: () => {},
  toggleAudio: () => {},
  toggleVideo: () => {},
  isAudioEnabled: true,
  isVideoEnabled: true,
  participantStreams: {},
  currentChatId: null,
  reconnectToCall: () => {},
  callStatus: 'idle',
  callParticipants: [],
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
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [participantStreams, setParticipantStreams] = useState<{ [userId: string]: MediaStream }>({});
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [peerConnections, setPeerConnections] = useState<Map<string, PeerConnection>>(new Map());
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed' | 'ended'>('idle');
  const [callParticipants, setCallParticipants] = useState<string[]>([]);
  
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  const createPeerConnection = (targetUserId: string): RTCPeerConnection | undefined => {
    try {
      console.log(`Creating peer connection for ${targetUserId}`);
      
      const existingConnection = peerConnectionsRef.current.get(targetUserId);
      if (existingConnection) {
        console.log(`Closing existing connection for ${targetUserId}`);
        existingConnection.close();
        peerConnectionsRef.current.delete(targetUserId);
      }
      
      const pc = new RTCPeerConnection(iceServers);
      
      if (localStream) {
        localStream.getTracks().forEach(track => {
          pc.addTrack(track, localStream);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate to:", targetUserId);
          socket?.emit("ice-candidate", {
            chatId: currentChatId,
            toUserId: targetUserId,
            fromUserId: user?._id,
            candidate: event.candidate,
          });
        }
      };
      
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state with ${targetUserId}: ${pc.iceConnectionState}`);
        
        if (pc.iceConnectionState === 'disconnected' || 
            pc.iceConnectionState === 'failed' ||
            pc.iceConnectionState === 'closed') {
          console.log(`Connection with ${targetUserId} was lost or failed`);
          
          if (pc.iceConnectionState === 'failed' && isVideoCallActive) {
            console.log(`Attempting to reconnect with ${targetUserId}`);
            pc.close();
            peerConnectionsRef.current.delete(targetUserId);
            
            setTimeout(() => {
              if (isVideoCallActive) {
                createAndSendOffer(targetUserId);
              }
            }, 2000);
          }
        }
      };
      
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${targetUserId}: ${pc.connectionState}`);
        if (pc.connectionState === 'disconnected' || 
            pc.connectionState === 'failed' || 
            pc.connectionState === 'closed') {
          console.log(`Connection with ${targetUserId} was lost`);
          peerConnectionsRef.current.delete(targetUserId);
          setParticipantStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[targetUserId];
            return newStreams;
          });
        }
      };

      pc.ontrack = (event) => {
        console.log(`Received track from ${targetUserId}`);
        if (event.streams && event.streams[0]) {
          setParticipantStreams(prev => ({
            ...prev,
            [targetUserId]: event.streams[0]
          }));
          
          setCallStatus('connected');
        }
      };

      pc.onnegotiationneeded = async () => {
        try {
          if (isVideoCallActive && currentChatId) {
            console.log(`Negotiation needed for connection with ${targetUserId}`);
            await createAndSendOffer(targetUserId);
          }
        } catch (error) {
          console.error('Error handling negotiation:', error);
        }
      };

      peerConnectionsRef.current.set(targetUserId, pc);
      return pc;
    } catch (error) {
      console.error(`Error creating peer connection for ${targetUserId}:`, error);
      return undefined;
    }
  };

  const cleanupPeerConnection = (userId: string) => {
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
      setParticipantStreams(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      console.log(`Cleaned up peer connection for ${userId}`);
    }
  };

  const cleanupAllPeerConnections = () => {
    peerConnectionsRef.current.forEach((pc, userId) => {
      pc.close();
      console.log(`Closed peer connection for ${userId}`);
    });
    peerConnectionsRef.current.clear();
    setParticipantStreams({});
    setRemoteStream(null);
  };

  const getUserMedia = async () => {
    try {
      // First try to release any existing tracks
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
                        if (currentChatId && isVideoCallActive) {
                          reconnectToCall(currentChatId);
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

  const initiateVideoCall = async (chatId: string) => {
    try {
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) return;

      // Stop any existing streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Clear any existing peer connections
      cleanupAllPeerConnections();

      // Set status to connecting before getting media
      setCallStatus('connecting');
      
      try {
        const stream = await getUserMedia();
        setLocalStream(stream);
        setCurrentChatId(chatId);

        if (socket) {
          socket.emit("initiateCall", {
            chatId,
            callerId: user?._id,
            callerName: user?.username || `${user?.firstName} ${user?.lastName}`
          });
        }

        setIsVideoCallActive(true);
        console.log("Video call initiated for chat:", chatId);
      } catch (error) {
        console.error("Failed to get media:", error);
        
        // Try one more time with just audio
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          });
          
          setLocalStream(audioOnlyStream);
          setIsVideoEnabled(false);
          
          if (socket) {
            socket.emit("initiateCall", {
              chatId,
              callerId: user?._id,
              callerName: user?.username || `${user?.firstName} ${user?.lastName}`
            });
          }
          
          setIsVideoCallActive(true);
          toast.success("Video unavailable. Joining with audio only.");
        } catch (audioError) {
          console.error("Failed to get audio-only stream:", audioError);
          throw audioError;
        }
      }
    } catch (error) {
      console.error("Error initiating video call:", error);
      toast.error("Failed to start call. Please check your camera and microphone.");
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      setIsVideoCallActive(false);
      setCallStatus('failed');
    }
  };

  const joinVideoCall = async (chatId: string) => {
    try {
      console.log(`Joining video call in chat ${chatId}`);
      setCallStatus('connecting');
      
      // First check permissions without immediately trying to get the stream
      const hasPermissions = await checkMediaPermissions();
      if (!hasPermissions) {
        setCallStatus('failed');
        return;
      }

      // Stop any existing streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      // Clear any existing peer connections
      cleanupAllPeerConnections();
      
      try {
        // Now get the user media stream
        console.log("Getting user media for video call");
        const stream = await getUserMedia();
        console.log("Successfully got media stream:", stream);
        
        setLocalStream(stream);
        setIsVideoCallActive(true);
        setCurrentChatId(chatId);

        // Check if we have video tracks and update UI accordingly
        const hasVideoTracks = stream.getVideoTracks().length > 0;
        setIsVideoEnabled(hasVideoTracks);

        socket?.emit("joinVideoCall", { 
          chatId, 
          userId: user?._id,
          username: user?.username,
          role: user?.role
        });

        setCallParticipants(prev => {
          if (!prev.includes(user?._id || '')) {
            return [...prev, user?._id || ''];
          }
          return prev;
        });

        console.log("Joined video call successfully, waiting for connections");
      } catch (error) {
        console.error("Failed to get media stream:", error);
        
        // Show a more specific error message
        if (error instanceof DOMException) {
          if (error.name === "NotAllowedError") {
            toast.error("Camera and microphone access denied. Please allow access and try again.");
            showPermissionsModal();
          } else if (error.name === "NotFoundError") {
            toast.error("No camera or microphone found. Please connect a device and try again.");
          } else if (error.name === "NotReadableError") {
            toast.error("Camera or microphone is already in use by another application.");
          } else {
            toast.error(`Media error: ${error.name}. Please try again.`);
          }
        } else {
          toast.error("Failed to access camera and microphone. Please try again.");
        }
        
        setCallStatus('failed');
      }
    } catch (error: any) {
      console.error("Error joining video call:", error);
      setCallStatus('failed');
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        showPermissionsModal();
      } else if (error.name === "NotReadableError" || error.name === "AbortError") {
        toast.error("Camera or microphone is already in use by another application. Please close other applications and try again.");
      } else {
        toast.error(error.message || "Failed to join video call");
      }
    }
  };

  const endVideoCall = (chatId: string) => {
    try {
      setCallStatus('ended');
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      peerConnectionsRef.current.forEach((pc, userId) => {
        pc.close();
        console.log(`Closed peer connection for ${userId}`);
      });
      peerConnectionsRef.current.clear();
      setParticipantStreams({});

      if (socket && chatId) {
        socket.emit("endVideoCall", { 
          chatId, 
          userId: user?._id,
          role: user?.role
        });
      }

      setIsVideoCallActive(false);
      setCurrentChatId(null);
      setCallParticipants([]);
      console.log("Video call ended for chat:", chatId);
    } catch (error) {
      console.error("Error ending video call:", error);
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

  const createAndSendOffer = async (targetUserId: string) => {
    if (!localStream || !currentChatId || !socket || !user?._id) {
      console.error("Cannot create offer: missing required data");
      return;
    }

    try {
      let pc = peerConnectionsRef.current.get(targetUserId);
      
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
        if (isVideoCallActive) {
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
      let pc = peerConnectionsRef.current.get(fromUserId);
      
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
        const pc = peerConnectionsRef.current.get(fromUserId);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(fromUserId);
        }
        
        if (isVideoCallActive && chatId === currentChatId) {
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
      const pc = peerConnectionsRef.current.get(fromUserId);
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
      const pc = peerConnectionsRef.current.get(fromUserId);
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

    // Add user to participants list
    setCallParticipants(prev => {
      if (!prev.includes(data.userId)) {
        return [...prev, data.userId];
      }
      return prev;
    });

    try {
      let pc = peerConnectionsRef.current.get(data.userId) || createPeerConnection(data.userId);
      if (!pc) throw new Error("Failed to create peer connection");

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
      let pc = peerConnectionsRef.current.get(data.userId) || createPeerConnection(data.userId);
      if (!pc) throw new Error("Failed to create peer connection");

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
      let pc = peerConnectionsRef.current.get(data.fromUserId) || createPeerConnection(data.fromUserId);
      if (!pc) throw new Error("Failed to create peer connection");

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

    const pc = peerConnectionsRef.current.get(data.fromUserId);
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

    const pc = peerConnectionsRef.current.get(data.fromUserId);
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
      setCallParticipants(prev => prev.filter(id => id !== data.userId));
      
      // Clean up peer connection
      const pc = peerConnectionsRef.current.get(data.userId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(data.userId);
      }
      
      // Remove stream from participants
      setParticipantStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[data.userId];
        return newStreams;
      });
      
      // If instructor left, end call for everyone
      if (data.role === 'instructor' && user?.role !== 'instructor') {
        toast.success("The instructor has ended the call");
        endVideoCall(currentChatId);
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
      path: "/socket.io/",
      query: { userId: user._id },
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
      if (userId !== user._id) {
        console.log(`Received typing from ${username} (${userId}) in chat ${chatId}`);
        setTypingsUsers((prev) => {
          const filtered = prev.filter((u) => u.userId !== userId && u.chatId === chatId);
          return [...filtered, { chatId, userId, username, timestamp: Date.now() }];
        });
      }
    };

    const handleIncomingCall = (callData: { chatId: string; callerId: string; callerName: string }) => {
      console.log("Incoming call:", callData);
      if (callData.callerId !== user._id) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2355/2355-preview.mp3');
        audio.loop = true;
        audio.play().catch(error => console.error('Error playing ringtone:', error));
        (window as any).incomingCallAudio = audio;

        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Incoming call from {callData.callerName}
                  </p>
                  <div className="mt-3 flex space-x-4">
                    <button
                      onClick={() => {
                        if ((window as any).incomingCallAudio) {
                          (window as any).incomingCallAudio.pause();
                          (window as any).incomingCallAudio = null;
                        }
                        newSocket.emit("rejectCall", {
                          chatId: callData.chatId,
                          rejecterId: user._id
                        });
                        toast.dismiss(t.id);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => {
                        if ((window as any).incomingCallAudio) {
                          (window as any).incomingCallAudio.pause();
                          (window as any).incomingCallAudio = null;
                        }
                        newSocket.emit("acceptCall", {
                          chatId: callData.chatId,
                          accepterId: user._id
                        });
                        joinVideoCall(callData.chatId);
                        toast.dismiss(t.id);
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 30000 });
      }
    };

    const handleCallAccepted = (data: { chatId: string; accepterId: string }) => {
      console.log("Call accepted:", data);
      if ((window as any).incomingCallAudio) {
        (window as any).incomingCallAudio.pause();
        (window as any).incomingCallAudio = null;
      }
      
      if (data.accepterId !== user._id && isVideoCallActive) {
        createAndSendOffer(data.accepterId);
      }
    };

    const handleCallRejected = (data: { chatId: string; rejecterId: string }) => {
      console.log("Call rejected:", data);
      if ((window as any).incomingCallAudio) {
        (window as any).incomingCallAudio.pause();
        (window as any).incomingCallAudio = null;
      }
      
      if (data.rejecterId !== user._id) {
        toast.error("Call was declined");
      }
    };

    const handleSocketOffer = (data: { chatId: string; offer: RTCSessionDescriptionInit; fromUserId: string }) => {
      console.log("Received offer:", data);
      if (data.fromUserId !== user._id) {
        handleOffer(data.fromUserId, data.offer, data.chatId);
      }
    };

    const handleSocketAnswer = (data: { answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      console.log("Received answer:", data);
      if (data.fromUserId !== user._id) {
        handleAnswer(data.fromUserId, data.answer);
      }
    };

    const handleSocketIceCandidate = (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      console.log("Received ICE candidate:", data);
      if (data.fromUserId !== user._id) {
        handleIceCandidate(data.fromUserId, data.candidate);
      }
    };

    const handleVideoCallEnded = (data: { chatId: string; userId: string }) => {
      console.log("Video call ended:", data);
      
      if (data.userId !== user._id) {
        toast.success("Call ended by another participant");
      }
      
      if (isVideoCallActive) {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
        cleanupAllPeerConnections();
        setIsVideoCallActive(false);
        setCurrentChatId(null);
      }
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("getOnlineUsers", handleOnlineUsers);
    newSocket.on("receiveMessage", handleIncomingMessage);
    newSocket.on("userTyping", handleUserTyping);
    newSocket.on("incomingCall", handleIncomingCall);
    newSocket.on("callAccepted", handleCallAccepted);
    newSocket.on("callRejected", handleCallRejected);
    newSocket.on("userJoinedCall", handleUserJoinedCall);
    newSocket.on("offer", handleSocketOffer);
    newSocket.on("answer", handleSocketAnswer);
    newSocket.on("ice-candidate", handleSocketIceCandidate);
    newSocket.on("videoCallEnded", handleVideoCallEnded);
    newSocket.on("userLeftCall", handleUserLeftCall);
    newSocket.on("forceLogout", handleForceLogout);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("getOnlineUsers", handleOnlineUsers);
      newSocket.off("receiveMessage", handleIncomingMessage);
      newSocket.off("userTyping", handleUserTyping);
      newSocket.off("incomingCall", handleIncomingCall);
      newSocket.off("callAccepted", handleCallAccepted);
      newSocket.off("callRejected", handleCallRejected);
      newSocket.off("userJoinedCall", handleUserJoinedCall);
      newSocket.off("offer", handleSocketOffer);
      newSocket.off("answer", handleSocketAnswer);
      newSocket.off("ice-candidate", handleSocketIceCandidate);
      newSocket.off("videoCallEnded", handleVideoCallEnded);
      newSocket.off("userLeftCall", handleUserLeftCall);
      newSocket.off("forceLogout", handleForceLogout);
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

  const reconnectToCall = (chatId: string) => {
    if (!isVideoCallActive || !localStream) {
      joinVideoCall(chatId);
      return;
    }
    
    callParticipants.forEach(userId => {
      if (userId !== user?._id) {
        createAndSendOffer(userId);
      }
    });
    
    toast.success("Attempting to reconnect to call...");
  };

  const contextValues: SocketContextType = {
    socket,
    messages,
    onlineUsers,
    typingUsers,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    initiateVideoCall,
    joinVideoCall,
    endVideoCall,
    isVideoCallActive,
    remoteStream,
    localStream,
    setIsVideoCallActive,
    handleTyping,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    participantStreams,
    currentChatId,
    reconnectToCall,
    callStatus,
    callParticipants,
    cleanupAllPeerConnections,
  };

  return (
    <SocketContext.Provider value={contextValues}>
      {children}
    </SocketContext.Provider>
  );
};