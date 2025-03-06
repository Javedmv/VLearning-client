import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";
import { AppDispatch, RootState } from "../redux/store";

const SOCKET_URL = import.meta.env.VITE_REACT_APP_CHAT_URL;

interface Message {
  text: string;
  sender: string;
  receiver: string;
  time: string;
  enrollmentId?: string;
}

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  onlineUsers: string[];
  sendMessage: (message: Omit<Message, 'time'>) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  messages: [],
  onlineUsers: [],
  sendMessage: () => {}
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

      // Attach event listeners
      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      })
      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('getOnlineUsers', handleOnlineUsers);
      newSocket.on('receiveMessage', handleIncomingMessage);

      // Cleanup function
      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('getOnlineUsers', handleOnlineUsers);
        newSocket.off('receiveMessage', handleIncomingMessage);
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Send message method
  const sendMessage = (messageData: Omit<Message, 'time'>) => {
    if (socket) {
      const messageWithTime = {
        ...messageData,
        time: new Date().toISOString()
      };
      
      // Emit message to server
      socket.emit('sendMessage', messageWithTime);
      
      // Optimistically add message to local state
      setMessages(prevMessages => [...prevMessages, messageWithTime]);
    }
  };

  const contextValues: SocketContextType = {
    socket,
    messages,
    onlineUsers,
    sendMessage
  };

  return (
    <SocketContext.Provider value={contextValues}>
      {children}
    </SocketContext.Provider>
  );
};