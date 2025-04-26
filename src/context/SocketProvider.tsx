import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

// Interface for tracking active streams notified by the backend
interface ActiveStreamInfo {
    chatId: string;
    meetingId?: string; // May not be needed on client, but could be useful
    // Add other relevant details if your backend sends them
}

// Store active streams, mapping chatId to stream info
type ActiveStreamsMap = Map<string, ActiveStreamInfo>;

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  typingUsers: TypingUser[];
  joinChatRoom: (chatId: string) => void;
  leaveChatRoom: (chatId: string) => void;
  sendMessage: (message: Partial<Message>) => void;
  handleTyping: (chatId: string) => void;
  // New state for Whereby streams
  activeStreams: ActiveStreamsMap;
  // No longer exposing WebRTC functions/state
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
  // New state default
  activeStreams: new Map(),
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
  // New state for tracking active streams
  const [activeStreams, setActiveStreams] = useState<ActiveStreamsMap>(new Map());

  const handleForceLogout = async (data: { reason: string }) => {
    console.log("Force logout received:", data);
    toast.error(data.reason || "You have been logged out by an administrator");
    
    // Dispatch logout action
    await dispatch(logout());
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    if (!user?._id || !SOCKET_URL ) return;

    const newSocket = io(SOCKET_URL, {
      query: { userId: user._id },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
    });

    console.log("Initializing socket connection to:", SOCKET_URL);
    
    setSocket(newSocket);

    // Basic Event handler definitions
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
        // Filter out the old typing indicator for this user AND any expired indicators
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

    // --- Whereby Stream Notification Handlers ---

    // Listener for when a stream starts (using your backend event name 'stream-started')
    const handleBackendStreamStarted = (data: { chatId: string; meetingId?: string /* include other data if sent */ }) => {

            // --- DEBUG LOG ---
            console.log("%%% Received 'stream-started' event from backend: %%%", data);
            // --- END DEBUG LOG -
      console.log(`Stream started notification received for chat: ${data.chatId}`);
      setActiveStreams(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(data.chatId, { chatId: data.chatId, meetingId: data.meetingId });
        return newMap;
      });
      // toast.success(`Live stream started in chat ${data.chatId}!`); // Optional: Inform user
    };

    // Listener for when a stream stops (using your backend event name 'stream-stopped')
    const handleBackendStreamStopped = (data: { chatId: string }) => {
      console.log(`Stream stopped notification received for chat: ${data.chatId}`);
            // --- DEBUG LOG ---
            console.log("%%% Received 'stream-stopped' event from backend: %%%", data);
            // --- END DEBUG LOG ---
      setActiveStreams(prevMap => {
        const newMap = new Map(prevMap);
        if (newMap.has(data.chatId)) {
          newMap.delete(data.chatId);
          console.log(`Removed active stream entry for chat: ${data.chatId}`);
          } else {
            console.warn(`Received stream-stopped for chat ${data.chatId}, but it wasn't tracked as active.`);
        }
        return newMap;
      });
      // toast.info(`Live stream ended in chat ${data.chatId}.`); // Optional: Inform user
    };

    // --- Register Listeners ---
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("getOnlineUsers", handleOnlineUsers);
    newSocket.on("receiveMessage", handleIncomingMessage); // Assuming this comes from backend "message" event
    newSocket.on("userTyping", handleUserTyping);
    newSocket.on("forceLogout", handleForceLogout); 

    // Register new Whereby stream status listeners using your backend event names
    newSocket.on("stream-started", handleBackendStreamStarted);
    newSocket.on("stream-stopped", handleBackendStreamStopped);

    // --- Cleanup ---
    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("getOnlineUsers", handleOnlineUsers);
      newSocket.off("receiveMessage", handleIncomingMessage);
      newSocket.off("userTyping", handleUserTyping);
      newSocket.off("forceLogout", handleForceLogout); 

      // Cleanup new Whereby listeners
      newSocket.off("stream-started", handleBackendStreamStarted);
      newSocket.off("stream-stopped", handleBackendStreamStopped);
      
      // Removed cleanup for old WebRTC/stream events
      
      newSocket.disconnect();
    };
  }, [user, dispatch]); 

  // Effect to clear typing indicators periodically
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
        senderName: user.username || `${user.firstName} ${user.lastName}`, 
        type: message.type || "message",
        contentType: message.contentType || "text",
        createdAt: new Date().toISOString(),
      };
      socket.emit("sendMessage", fullMessage);
    }
  };

  const handleTyping = (chatId: string) => {
    if (socket && user?._id && chatId) {
      socket.emit("typing", { chatId, userId: user._id, username: user?.username || 'User' });
    }
  };

  // --- Updated Context Value ---
  const contextValue: SocketContextType = {
    socket,
    messages,
    onlineUsers,
    typingUsers,
    joinChatRoom,
    leaveChatRoom,
    sendMessage,
    handleTyping,
    // New state exposed
    activeStreams, 
    // Removed all WebRTC related values
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};