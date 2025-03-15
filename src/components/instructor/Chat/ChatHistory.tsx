import React, { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, Video, VideoIcon, X } from "lucide-react";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { useSocketContext } from "../../../contexts/SocketContext";
import { RootState } from "../../../redux/store";
import { toast } from "react-hot-toast";

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
  sender: string | {
    _id?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    profile?: any;
  };
  senderName?: string;
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
  const { socket, initiateVideoCall, endVideoCall, isVideoCallActive, localStream, remoteStream, setIsVideoCallActive } = useSocketContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const instructorName = user.username;
  const instructorId = user._id;
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
  
  useEffect(() => {
    if (socket && chat?._id) {
      socket.emit("join", { chatId: chat._id, userId: instructorId });
      
      const handleNewMessage = (newMessage: Message) => {
        console.log("Received message:", newMessage);
        setMessages(prev => {
          const exists = prev.some(m => 
            m._id === newMessage._id || 
            (m.content === newMessage.content && 
             m.sender === newMessage.sender && 
             m.createdAt === newMessage.createdAt)
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });
        setTimeout(scrollToBottom, 100);
      };

      const handleMessageSent = (data: { success: boolean, messageId: string }) => {
        console.log("Message sent confirmation:", data);
        setIsSending(false);
      };

      const handleMessageError = (error: any) => {
        console.error("Message error:", error);
        setIsSending(false);
        toast.error("Failed to send message. Please try again.");
      };
      
      socket.on("message", handleNewMessage);
      socket.on("messageSent", handleMessageSent);
      socket.on("messageError", handleMessageError);
      
      const handleVideoCallStarted = () => {
        setIsVideoCallActive(true);
        toast.success("Video call started. Join now!");
      };

      const handleVideoCallEnded = () => {
        setIsVideoCallActive(false);
        toast.success("Video call ended.");
      };

      socket.on("videoCallStarted", handleVideoCallStarted);
      socket.on("videoCallEnded", handleVideoCallEnded);
      
      return () => {
        socket.off("message", handleNewMessage);
        socket.off("messageSent", handleMessageSent);
        socket.off("messageError", handleMessageError);
        socket.off("videoCallStarted", handleVideoCallStarted);
        socket.off("videoCallEnded", handleVideoCallEnded);
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
    if (!newMessage.trim() || !chat?._id || isSending) return;

    try {
      setIsSending(true);

      const messageData = {
        content: newMessage,
        sender: instructorId,
        chatId: chat._id,
        senderName: user?.username,
        type: "message" as const,
        contentType: ContentType.TEXT,
        createdAt: new Date().toISOString(),
      };

      if (socket) {
        socket.emit("sendMessage", messageData);
      }

      // Clear input immediately
      setNewMessage("");
      
      // Optimistically add message
      // setMessages(prev => [...prev, messageData]);
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsSending(false);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSenderName = (message: Message): string => {
    // First check if senderName is available
    if (message.senderName) {
      return message.sender === user._id || 
             (typeof message.sender === 'object' && message.sender?._id === user._id) 
             ? 'You' : message.senderName;
    }
    
    // Fall back to previous logic
    if (typeof message.sender === 'object') {
      if (message.sender?._id === user._id) {
        return 'You';
      }
      return message.sender?.username || 'Unknown User';
    }
    if (typeof message.sender === 'string') {
      return message.sender === user._id ? 'You' : 'Unknown User';
    }
    return 'Unknown User';
  };

  const getSenderInitials = (message: Message): string => {
    if (typeof message.sender === 'object' && message.sender?.username) {
      return message.sender.username[0].toUpperCase();
    }
    // Fallback to previous logic
    const name = getSenderName(message);
    return name[0].toUpperCase();
  };

  const formatMessageDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleVideoCall = async () => {
    try {
      if (isVideoCallActive) {
        endVideoCall(chat._id);
        setShowVideoModal(false);
      } else {
        setShowVideoModal(true);  // Show modal first
        await initiateVideoCall(chat._id);  // Then initiate call
      }
    } catch (error) {
      console.error('Error handling video call:', error);
      setShowVideoModal(false);
    }
  };

  const joinVideoCall = () => {
    // Logic to join the video call, e.g., open a new window or modal
    console.log("Joining video call...");
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (isVideoCallActive) {
        endVideoCall(chat._id);
      }
    };
  }, []);

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
      <div className="p-4 bg-white/80 shadow-sm backdrop-blur-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{chat.groupName}</h2>
          <p className="text-sm text-gray-500">{chat.users.length} participants</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleVideoCall} 
            className={`p-2 transition-colors ${
              isVideoCallActive ? 'text-red-500 hover:text-red-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Video className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Video call modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Video Call</h3>
              <button onClick={() => {
                endVideoCall(chat._id);
                setShowVideoModal(false);
              }} className="text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {localStream && (
                <div className="relative">
                  <video
                    ref={video => {
                      if (video) video.srcObject = localStream;
                    }}
                    autoPlay
                    muted
                    className="w-full rounded-lg"
                  />
                  <p className="absolute bottom-2 left-2 text-white">You</p>
                </div>
              )}
              {remoteStream && (
                <div className="relative">
                  <video
                    ref={video => {
                      if (video) video.srcObject = remoteStream;
                    }}
                    autoPlay
                    className="w-full rounded-lg"
                  />
                  <p className="absolute bottom-2 left-2 text-white">Remote User</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              const isOwnMessage = typeof message.sender === 'string' 
                ? message.sender === user._id
                : message.sender._id === user._id;
              
              // Check if this message is from the same sender as the previous one
              const isSameSender = index > 0 && (
                typeof message.sender === 'string' 
                  ? message.sender === messages[index - 1].sender
                  : message.sender._id === (messages[index - 1].sender as any)._id
              );
              
              const timestamp = message.createdAt 
                ? new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

              const showDateHeader = index === 0 || (
                message.createdAt && messages[index - 1].createdAt &&
                formatMessageDate(message.createdAt as string | Date) !== formatMessageDate(messages[index - 1].createdAt as string | Date)
              );
              
              return (
                <React.Fragment key={message._id || index}>
                  {showDateHeader && message.createdAt && (
                    <div className="flex justify-center my-4">
                      <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatMessageDate(message.createdAt)}
                      </div>
                    </div>
                  )}
                  <div className="w-full flex flex-col items-center">
                    {message.type === "newUser" ? (
                      <div className="bg-gray-200 text-gray-600 text-sm italic px-4 py-2 rounded-lg shadow-sm">
                        {message.content}
                      </div>
                    ) : (
                      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} w-full group mb-1`}>
                        {!isOwnMessage && !isSameSender && (
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                            <span className="text-xs font-medium text-indigo-600">
                              {getSenderInitials(message)}
                            </span>
                          </div>
                        )}
                        {!isOwnMessage && isSameSender && <div className="w-6 mr-2" />} {/* Spacer for alignment */}
                        <div
                          className={`max-w-[70%] rounded-xl py-2 px-3 shadow-sm transition-shadow group-hover:shadow-md ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white"
                              : "bg-white text-gray-900"
                          }`}
                        >
                          {!isSameSender && (
                            <p className={`text-[11px] font-medium ${isOwnMessage ? "text-gray-300" : "text-gray-500"} ${isOwnMessage ? "text-right" : "text-left"}`}>
                              {isOwnMessage ? "You" : getSenderName(message)}
                            </p>
                          )}
                          <p className="text-sm leading-snug">{message.content}</p>
                          <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                            <p className={`text-[10px] ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>
                              {timestamp}
                            </p>
                            {isOwnMessage && (
                              <span className="ml-1 text-[10px] text-blue-100">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
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