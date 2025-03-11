import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User, Image, FileText, Video, Mic, Users } from "lucide-react";
import { useSocketContext } from "../../../context/SocketProvider";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";

// Content types enum
enum ContentType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file"
}

interface ChatBarProp {
  enrollment: any;
}

export interface Message {
  _id?: string;
  content?: string;
  sender: string;
  chatId?: string;
  contentType?: ContentType;
  recieverSeen?: [string];
  type: "newUser" | "message"
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface ChatMember {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: string; // 'student' or 'instructor'
}

interface Chat {
  _id: string;
  groupName: string;
  courseId: string;
  instructorId: string;
  users: string[];
  members?: ChatMember[]; // Added for storing user details
  latestMessage: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const ChatBar: React.FC<ChatBarProp> = ({enrollment}) => {
  const { user } = useSelector((state: RootState) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatData, setChatData] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const courseId = enrollment?.courseId?._id;
  const courseName = enrollment?.courseId?.title || "Course Chat";
  const instructorId = enrollment?.courseId?.instructorId;
  const instructorName = enrollment?.courseId?.instructor?.firstName + " " + enrollment?.courseId?.instructor?.lastName;
  
  const { socket, onlineUsers, messages } = useSocketContext();
  // Fetch existing chat messages when chat is opened
  useEffect(() => {
    if (isOpen) {
      fetchExistingChat();
    }
  }, [isOpen]);

  // Fetch existing group chat for the course
  const fetchExistingChat = async () => {
    try {
      setIsLoading(true);
      
      // Get or create a group chat for this course
      const chatResponse = await commonRequest(
        'GET', 
        `${URL}/chat/get-chat?courseId=${courseId}`,
        null,
        config
      );
      
      if (chatResponse.success && chatResponse.data) {
        setChatData(chatResponse.data);
        {{console.log(chatResponse.data)}}
        setParticipantsCount(chatResponse.data.users?.length || 0);
        
        // Fetch messages for this chat
        const messagesResponse = await commonRequest(
          'GET',
          `${URL}/chat/messages/${chatResponse.data._id}`,
          null,
          config
        );
        
        if (messagesResponse.data && messagesResponse.success) {
          setChatMessages(messagesResponse.data);
          
          if (messagesResponse.data.some((msg: Message) => 
              msg.sender !== user._id && (!msg.recieverSeen || !msg.recieverSeen.includes(user._id))
          )) {
            markMessagesAsSeen(chatResponse.data._id);
          }
        }
      }
    } catch (error:any) {
      console.error("Error fetching group chat:",error);
      toast.error(`${error.response.data.message}` || "something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Mark messages as seen
  const markMessagesAsSeen = async (chatId: string) => {
    try {
      await commonRequest(
        'PUT',
        `${URL}/chat/mark-seen`,
        {
          chatId: chatId,
          userId: user._id
        },
        config
      );
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  // Listen for socket messages
  useEffect(() => {
    if (socket && chatData?._id) {
      // Join the chat room
      socket.emit("join", { chatId: chatData._id, userId: user._id });
      
      // Listen for new messages
      const handleNewMessage = (message: Message) => {
        if (message.chatId === chatData._id) {
          setChatMessages(prev => {
            // Avoid duplicate messages
            if (prev.some(m => m._id === message._id)) {
              return prev;
            }
            return [...prev, message];
          });
        }
      };
      
      socket.on("message", handleNewMessage);
      
      return () => {
        socket.off("message", handleNewMessage);
      };
    }
  }, [socket, chatData?._id, user._id]);

  const handleSendMessage = async () => {
    if (input.trim() && socket && chatData?._id) {
      try {
        const messageData = {
          content: input,
          chatId: chatData._id,
          sender: user?._id,
          senderName: `${user?.username}`,
          contentType: ContentType.TEXT,
          recieverSeen: [user?._id],
          type: "message"
        };
        
        // Send message via socket first for immediate feedback
        socket.emit("sendMessage", messageData);
        
        // Optimistically add message to UI
        const tempMessage = {
          ...messageData,
          createdAt: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, {
          ...tempMessage,
          recieverSeen: [user?._id] as [string],
          type: "message" as "message"
        }]);
        
        // Then save to database via API
        const response = await commonRequest(
          'POST',
          `${URL}/chat/message`,
          messageData,
          config
        );
        
        // Update with server response if needed
        if (response.data && response.data._id) {
          setChatMessages(prev => 
            prev.map(msg => 
              (msg.content === tempMessage.content && 
               msg.sender === tempMessage.sender && 
               msg.createdAt === tempMessage.createdAt) ? response.data : msg
            )
          );
        }
        
        setInput("");
      } catch (error:any) {
        console.error("Error sending message:", error);
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  
  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, messages]);

  // Add this useEffect for scrolling
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]); // Scroll when messages change or chat opens

  // Get content icon based on content type
  const getContentIcon = (contentType?: ContentType) => {
    switch(contentType) {
      case ContentType.IMAGE:
        return <Image className="w-4 h-4 mr-1" />;
      case ContentType.AUDIO:
        return <Mic className="w-4 h-4 mr-1" />;
      case ContentType.VIDEO:
        return <Video className="w-4 h-4 mr-1" />;
      case ContentType.FILE:
        return <FileText className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  // Get sender name from message or chatData members
  const getSenderName = (msg: Message) => {
    // if (msg.senderName) return msg.senderName;
    
    if (msg.sender === user._id) return `${user.firstName} ${user.lastName}`;
    
    if (msg.sender === instructorId) return instructorName;
    
    // Try to find in chat members
    const member = chatData?.members?.find(m => m._id === msg.sender);
    if (member) return `${member.firstName} ${member.lastName}`;
    
    return "Unknown User";
  };

  // Combine local chat history with socket messages
  // This will be uncommented when your backend is ready
  // const displayMessages = [...chatMessages, ...messages.filter(msg => 
  //   msg.chatId === chatData?._id && // Only messages for this chat
  //   !chatMessages.some(cm => (cm._id === msg._id) || 
  //   ((cm.content === msg.text || cm.text === msg.text) && cm.sender === msg.sender))
  // )].sort((a, b) => {
  //   const timeA = new Date(a.time || a.createdAt || Date.now()).getTime();
  //   const timeB = new Date(b.time || b.createdAt || Date.now()).getTime();
  //   return timeA - timeB;
  // });

  // When displaying messages, make sure they're sorted correctly
  // And scroll to the bottom of the container when new messages arrive

  useEffect(() => {
    // Scroll to bottom of chat container when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-40"> {/* Add z-40 to ensure proper stacking */}
      {/* Chat Box */}
      {isOpen && (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-400/80 shadow-lg rounded-lg p-4 border border-gray-300 transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <div>
              <h3 className="font-semibold text-lg">
                {chatData?.groupName || `${courseName} Chat`}
              </h3>
              <div className="flex items-center text-xs text-gray-600">
                <Users className="w-3 h-3 mr-1" />
                <span>{participantsCount} participants</span>
              </div>
            </div>
            <button onClick={toggleChat} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-2 bg-gray-50/90 rounded scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading messages...</p>
              </div>
            ) : chatMessages.length > 0 ? (
              chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`my-2 ${
                    msg.type === "newUser" 
                      ? "flex justify-center" 
                      : msg.sender === user._id 
                        ? "flex justify-end" 
                        : "flex justify-start"
                  }`}
                >
                  <div className={`${
                    msg.type === "newUser" 
                      ? "max-w-full" 
                      : "max-w-[75%] mt-1"
                  }`}>
                    {/* Show sender name for messages not from current user and not new user notifications */}
                    {msg.sender !== user._id && msg.type !== "newUser" && (
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium bg-purple-500 mr-1">
                          {getSenderName(msg).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{getSenderName(msg)}</span>
                      </div>
                    )}
                    
                    <div 
                      className={`p-2 text-sm rounded-lg ${
                        msg.type === "newUser" 
                          ? "bg-gray-200 text-center px-4 py-1 rounded-full text-sm" 
                          : msg.sender === user._id 
                            ? "bg-purple-500 text-white"
                            : "bg-gray-400"
                      }`}
                    >
                      <div className="flex items-center">
                        {getContentIcon(msg.contentType as ContentType)}
                        <p className={msg.sender === user._id ? "text-white" : "text-gray-800"}>
                          {msg.content}
                        </p>
                      </div>
                      
                      {msg.type !== "newUser" && (
                        <div className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"} items-center mt-1`}>
                          <span className="text-xs opacity-75">
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { 
                                  hour: "2-digit", 
                                  minute: "2-digit", 
                                  hour12: true 
                                })
                              : "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} className="pt-2" /> {/* Add padding-top for smoother scroll */}
          </div>

          {/* Input Field */}
          <div className="flex mt-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 border border-gray-300 p-2 rounded-l text-sm"
              placeholder="Type a message..."
            />
            <button 
              onClick={handleSendMessage} 
              className="bg-purple-600 text-white px-4 rounded-r hover:bg-purple-700"
              disabled={isLoading}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="rounded-full p-3 shadow-lg bg-purple-600 text-white hover:bg-purple-700 transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatBar;