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

interface Message {
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
  
  const { socket, onlineUsers, messages, sendMessage } = useSocketContext();
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
            console.log(chatResponse.data._id,"not seen")
            markMessagesAsSeen(chatResponse.data._id);
          }
        }
      }
    } catch (error:any) {
      console.error("Error fetching group chat:",error);
      toast.error(`${error.response.data.message}`);
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

  const handleSendMessage = async () => {
    if (input.trim()) {
      // try {
        // If we don't have a chat yet, create a new group chat
      //   if (!chatData) {
      //     const newChatResponse = await commonRequest(
      //       'POST',
      //       `${URL}/chat/create-group`,
      //       {
      //         groupName: `${courseName} - Group Chat`,
      //         courseId: courseId,
      //         instructorId: instructorId,
      //         // The backend will add all course enrollments to users
      //       },
      //       config
      //     );
          
      //     if (newChatResponse.data && newChatResponse.data.chat) {
      //       setChatData(newChatResponse.data.chat);
      //       setParticipantsCount(newChatResponse.data.chat.users?.length || 0);
      //     }
      //   }
        
      //   // Send the message using the chat ID
      //   const response = await commonRequest(
      //     'POST',
      //     `${URL}/chat/message`,
      //     {
      //       content: input,
      //       chatId: chatData?._id || "",
      //       sender: user._id,
      //       senderName: `${user.firstName} ${user.lastName}`,
      //       contentType: ContentType.TEXT,
      //       recieverSeen: false
      //     },
      //     config
      //   );
        
      //   if (response.data && response.data.message) {
      //     // Update local messages state with the new message
      //     setChatMessages(prevMessages => [...prevMessages, response.data.message]);
          
      //     // Update socket if needed
      //     if (socket) {
      //       sendMessage({
      //         text: input,
      //         sender: user._id,
      //         senderName: `${user.firstName} ${user.lastName}`,
      //         chatId: chatData?._id,
      //         courseId: courseId,
      //         contentType: ContentType.TEXT,
      //         isGroupMessage: true
      //       });
      //     }
      //   }
        
      //   setInput("");
      // } catch (error) {
      //   console.error("Error sending message:", error);
      // }
    }
  };
  
  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, messages]);

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

  return (
    <div className="fixed bottom-4 right-4">
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
          <div className="h-80 overflow-y-auto p-2 bg-gray-50/90 rounded">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading messages...</p>
              </div>
            ) : chatMessages.length > 0 ? (
              /* Temporarily using chatMessages instead of displayMessages */
              chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`my-2 ${
                    msg.type === "newUser" 
                      ? "flex justify-center" 
                      : msg.sender === user._id 
                        ? "flex justify-end" 
                        : ""
                  }`}
                >
                  <div className={`${msg.type === "newUser" ? "max-w-full" : "max-w-xs"}`}>
                    {/* Show sender name for messages not from current user and not new user notifications */}
                    {msg.sender !== user._id && msg.type !== "newUser" && (
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-xs font-medium text-gray-700">{getSenderName(msg)}</span>
                      </div>
                    )}
                    
                    <div 
                      className={`p-2 text-sm rounded ${
                        msg.type === "newUser" 
                          ? "bg-gray-400 text-center rounded-full" 
                          : msg.sender === user._id 
                            ? "bg-purple-300 text-right" 
                            : "bg-gray-300 text-left"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {getContentIcon(msg.contentType as ContentType)}
                        <p>{msg.content}</p>
                      </div>
                      
                      {/* Only show time for regular messages, not for system messages */}
                      {msg.type !== "newUser" && (
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
                          <span>
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {msg.sender === user._id && (
                            <span className="ml-2">
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                              : "N/A"}
                          </span>
                          
                          )}
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
            <div ref={messagesEndRef} />
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