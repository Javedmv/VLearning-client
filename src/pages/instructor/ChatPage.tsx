import React, { useState, useEffect } from 'react';
import { UserList } from '../../components/instructor/Chat/UserList';
import { ChatHistory } from '../../components/instructor/Chat/ChatHistory';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import { useSocketContext } from '../../context/SocketProvider';

interface Chat {
  _id: string;
  groupName: string;
  courseId: string;
  instructorId: string;
  users: string[];
  latestMessage: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get socket context properly
  const { socket, onlineUsers } = useSocketContext();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await commonRequest(
        "GET",
        `${URL}/chat/instructor-chats`,
        {},
        config
      );
      
      if (response.data) {
        console.log(response.data)
        setChats(response.data);
        
        // If there are chats and none is selected, select the first one
        if (response.data.length > 0 && !selectedChatId) {
          setSelectedChatId(response.data[0]._id);
        }
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      console.error('Failed to fetch chats', error);
      setError('Failed to load chats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
    
    // Setup socket listeners for chat-related events
    if (socket) {
      // Listen for new chat creation
      socket.on('newChat', (newChat: Chat) => {
        setChats(prevChats => [...prevChats, newChat]);
      });
      
      // Listen for chat updates (e.g., new members, name changes)
      socket.on('chatUpdated', (updatedChat: Chat) => {
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === updatedChat._id ? updatedChat : chat
          )
        );
      });
      
      // Listen for new messages to update latest message preview
      socket.on('message', (message: any) => {
        if (message.chatId) {
          setChats(prevChats => 
            prevChats.map(chat => 
              chat._id === message.chatId 
                ? { ...chat, latestMessage: message.content || "New message" } 
                : chat
            )
          );
        }
      });
      
      return () => {
        socket.off('newChat');
        socket.off('chatUpdated');
        socket.off('message');
      };
    }
  }, [socket]);

  const selectedChat = Array.isArray(chats) 
  ? chats.find(chat => chat._id === selectedChatId) 
  : undefined;

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="h-[calc(100vh-64px)] flex shadow-2xl max-w-7xl mx-auto bg-white/80 backdrop-blur-sm">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading chats...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <UserList
              users={chats}
              selectedUserId={selectedChatId}
              onSelectUser={setSelectedChatId}
            />
            {selectedChat && (
              <ChatHistory
                chat={selectedChat}
                selectedUser={null}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;