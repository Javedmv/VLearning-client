import React, { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { useSocketContext } from "../../../contexts/SocketContext";
import { RootState } from "../../../redux/store";

enum ContentType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file"
}

interface Message {
  _id?: string;
  content?: string;
  sender: string;
  chatId?: string;
  contentType?: ContentType;
  recieverSeen?: string[];
  type: "newUser" | "message";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

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

interface ChatHistoryProps {
  chat: Chat;
  selectedUser: any; // This seems like it might be unused based on your interfaces
}

export function ChatHistory({ chat }: ChatHistoryProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const { socket } = useSocketContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const instructorName = user.username;
  const instructorId = user._id;
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
  
  useEffect(() => {
    // Join the chat room using the existing socket
    if (socket && chat?._id) {
      socket.emit("join", { chatId: chat._id, userId: instructorId });
      
      // Listen for new messages
      socket.on("message", (newMessage: Message) => {
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setTimeout(scrollToBottom, 100);
      });

      // Listen for user joined events
      socket.on("userJoined", (data: { message: string }) => {
        console.log(data.message);
      });
      
      // Cleanup listeners on unmount or when chat changes
      return () => {
        socket.off("message");
        socket.off("userJoined");
      };
    }
  }, [socket, chat?._id, instructorId]);

  async function fetchMessages(chatId:string) {
    try {
      setLoading(true);
      const response = await commonRequest(
        "GET", 
        `${URL}/chat/messages/${chatId}`,
        {},
        config
      );
      console.log("response", response.data);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!chat?._id) return;
    fetchMessages(chat._id);
  }, [chat?._id]);
  
  useEffect(() => {
    if (messages.length > 0) {
      // Use a slight delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat?._id) return;

    const messageData: Message = {
      content: newMessage,
      sender: instructorId,
      chatId: chat._id,
      type: "message",
      contentType: ContentType.TEXT,
      createdAt: new Date().toISOString(), // Add timestamp when creating message
    };

    try {
      // Use the socket from context
      if (socket) {
        socket.emit("sendMessage", messageData);
      }

      // Clear input field
      setNewMessage("");

      // Also send to server via API for persistence
      await commonRequest(
        "POST", 
        `${URL}/chat/message`,
        messageData,
        config
      );

      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!chat?._id) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-50">
        <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Welcome Back, Professor!
          </h3>
          <p className="text-gray-600 text-lg">
            Select a course chat from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-200 to-indigo-50">
      {/* Chat header */}
      <div className="p-4 bg-white/80 shadow-sm backdrop-blur-sm flex items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{chat.groupName}</h2>
          <p className="text-sm text-gray-500">{chat.users.length} participants</p>
        </div>
      </div>

      {/* Messages area - this is the scrollable container */}
      <div className="flex-1 overflow-y-auto p-6" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="space-y-6 flex-grow">
          {loading ? (
            <div className="flex justify-center">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isInstructor = message.sender === instructorId;
              const timestamp = message.createdAt 
                ? new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                
                return (
                  <div key={message._id || index} className="w-full flex flex-col items-center">
                    {message.type === "newUser" ? (
                      // Display info message centered
                      <div className="bg-gray-200 text-gray-600 text-sm italic px-4 py-2 rounded-lg shadow-sm">
                        {message.content}
                      </div>
                    ) : (
                      // Regular message (left for students, right for instructor)
                      <div
                        className={`flex ${isInstructor ? "justify-end" : "justify-start"} w-full group`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-2 shadow-md transition-shadow group-hover:shadow-lg ${
                            isInstructor
                              ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white"
                              : "bg-white text-gray-900"
                          }`}
                        >
                          {!isInstructor && (
                            <p className="text-xs font-medium mb-1 text-gray-500">
                              {message.sender}
                            </p>
                          )}
                          <p className="text-[15px] leading-relaxed">{message.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              isInstructor ? "text-blue-100" : "text-gray-500"
                            }`}
                          >
                            {timestamp}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );              
            })
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-300">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-white rounded-full border border-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-gray-900 placeholder-gray-400 shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Smile className="w-6 h-6" />
            </button>
          </div>
          <button
            className={`p-4 rounded-full ${
              newMessage.trim()
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}