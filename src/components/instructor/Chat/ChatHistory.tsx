import React, { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, X, Cast } from "lucide-react";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { useSocketContext } from "../../../context/SocketProvider";
import { RootState } from "../../../redux/store";
import { toast } from "react-hot-toast";
import ParticipantsModal from "../../common/Chat/ParticipantsModal";
import StreamingModal from "../../common/Chat/StreamingModal";
import type { StreamingModalProps } from "../../common/Chat/StreamingModal";
import EmojiPicker from 'emoji-picker-react';
import { TOBE } from "../../../common/constants";

enum ContentType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file",
}

interface Message {
  _id?: string;
  content?: string;
  sender:
    | string
    | {
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
  selectedUser: TOBE;
}

export function ChatHistory({ chat }: ChatHistoryProps) {
  const { user } = useSelector((state: RootState) => state?.user);
  const {
    socket,
    typingUsers,
    handleTyping,
    activeStreams,
  } = useSocketContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [activeRoomUrl, setActiveRoomUrl] = useState<string | null>(null);
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [isStreamLoading, setIsStreamLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const instructorName = user?.username;
  const instructorId = user?._id;

  const isStreamActiveInContext = activeStreams?.has(chat?._id);

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
        setMessages((prev) => {
          const newMsgSenderId = typeof newMessage.sender === 'string' ? newMessage.sender : newMessage.sender?._id;
          const exists = prev.some((m) => {
            const mSenderId = typeof m.sender === 'string' ? m.sender : m.sender?._id;
            return (
                m._id === newMessage._id ||
                (m.content === newMessage.content &&
                mSenderId === newMsgSenderId &&
                m.createdAt === newMessage.createdAt)
            );
          });
          if (exists) return prev;
          return [...prev, newMessage];
        });
        setTimeout(scrollToBottom, 100);
      };

      const handleMessageSent = (data: { success: boolean; messageId?: string }) => {
        console.log("Message sent confirmation:", data);
        setIsSending(false);
      };

      const handleMessageError = (error: TOBE) => {
        console.error("Message error:", error);
        setIsSending(false);
        toast.error("Failed to send message. Please try again.");
      };

      socket.on("message", handleNewMessage);
      socket.on("messageSent", handleMessageSent);
      socket.on("messageError", handleMessageError);

      return () => {
        socket.off("message", handleNewMessage);
        socket.off("messageSent", handleMessageSent);
        socket.off("messageError", handleMessageError);
      };
    }
  }, [socket, chat?._id, instructorId]);

  useEffect(() => {
    let typingInterval: NodeJS.Timeout | null = null;

    if (isInputFocused && socket && chat?._id && newMessage.length > 0) {
      handleTyping(chat._id);
      typingInterval = setInterval(() => {
        handleTyping(chat._id);
      }, 2000);
    }

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isInputFocused, socket, chat?._id, newMessage, handleTyping]);

  async function fetchMessages(chatId: string) {
    if (!chatId) return;
    try {
      setLoading(true);
      const response = await commonRequest("GET", `${URL}/chat/messages/${chatId}`, {}, config);
      console.log("Message fetch response", response);
      if(response.success && Array.isArray(response.data)) {
          setMessages(response.data);
      } else {
          setMessages([]);
          console.error("Failed to fetch messages or invalid data format:", response.message);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      toast.error("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMessages([]);
    setActiveRoomUrl(null);
    setActiveMeetingId(null);
    setShowStreamingModal(false);
    if (chat?._id) {
      fetchMessages(chat._id);
    }
    if (activeMeetingId && chat?._id) {
        handleStopStream(true);
    }
  }, [chat?._id]);

  useEffect(() => {
    if (messages.length > 0) {
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

      setNewMessage("");
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsSending(false);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUsernameFromMessages = (senderId: string): string => {
    const messageWithUsername = messages.find((m) => {
      const mSenderId = typeof m.sender === "string" ? m.sender : m.sender?._id;
      return mSenderId === senderId && 
             ((typeof m.sender === "object" && m.sender?.username) || m.senderName);
    });

    if (messageWithUsername) {
      return (typeof messageWithUsername.sender === "object" && messageWithUsername.sender?.username) || 
             messageWithUsername.senderName || 
             "Unknown User";
    }
    return `User-${senderId.substring(0, 4)}`;
  };

  const getSenderName = (message: Message): string => {
    const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;

    if (senderId === user?._id) {
      return "You";
    }

    if (typeof message?.sender === "object" && message?.sender) {
        return message?.sender?.username || `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || `User-${senderId?.substring(0,4)}`;
    }
    if(message.senderName) return message.senderName;

    return getUsernameFromMessages(senderId!);
  };

  const getSenderInitials = (message: Message): string => {
    const name = getSenderName(message);
    if (!name || name === "You") return "U";
    return name[0].toUpperCase();
  };

  const formatMessageDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const getTypingMessage = () => {
    const currentChatTypingUsers = typingUsers.filter((u) => u.chatId === chat?._id && u.userId !== user?._id);
    if (currentChatTypingUsers.length === 0) return "";
    if (currentChatTypingUsers.length === 1) return `${currentChatTypingUsers[0]?.username} is typing...`;
    if (currentChatTypingUsers.length === 2)
      return `${currentChatTypingUsers[0]?.username} and ${currentChatTypingUsers[1]?.username} are typing...`;
    return `${currentChatTypingUsers.length} people are typing...`;
  };

  const getParticipantsWithUsernames = () => {
    if (!Array.isArray(chat?.users)) return []; 
    return chat.users.map((userId) => ({
      _id: userId,
      username: userId === instructorId ? (instructorName || 'Instructor') : (getUsernameFromMessages(userId) || `User...${userId.slice(-4)}`),
    }));
  };

  const handleStartStream = async () => {
    if (!chat?._id || isStreamLoading) return;
    
    setIsStreamLoading(true);
    try {
      console.log(`Requesting to start stream for chat: ${chat._id}`);
      const response = await commonRequest(
        "POST",
        `${URL}/chat/streaming/start`, 
        { chatId: chat._id },
        config
      );

      console.log("Start stream response:", response);

      if (response.success && response.data?.hostRoomUrl && response.data?.meetingId) {
        setActiveRoomUrl(response.data.hostRoomUrl);
        setActiveMeetingId(response.data.meetingId);
        setShowStreamingModal(true);
        toast.success("Stream started successfully!");
      } else {
        throw new Error(response.message || "Failed to get stream details from server");
      }
    } catch (error: any) {
      console.error("Error starting stream:", error);
      toast.error(`Failed to start stream: ${error.message || "Unknown error"}`);
      setActiveRoomUrl(null);
      setActiveMeetingId(null);
      setShowStreamingModal(false);
    } finally {
        setIsStreamLoading(false);
    }
  };

  const handleStopStream = async (isCleanup = false) => {
      if (!chat?._id || !activeMeetingId || isStreamLoading) return; 

      setIsStreamLoading(true);
      try {
          console.log(`Requesting to stop stream for chat: ${chat._id}, meeting: ${activeMeetingId}`);
          const response = await commonRequest(
              "POST",
              `${URL}/chat/streaming/stop/${chat._id}`,
              { meetingId: activeMeetingId },
              config
          );

          console.log("Stop stream response:", response);

          if (response.success) {
              if (!isCleanup) toast.success("Stream stopped successfully!");
          } else {
              throw new Error(response.message || "Server failed to stop stream, closing locally.");
          }
      } catch (error: any) {
          console.error("Error stopping stream:", error);
          if (!isCleanup) toast.error(`Failed to stop stream: ${error.message || "Unknown error"}`);
      } finally {
          setActiveRoomUrl(null);
          setActiveMeetingId(null);
          setShowStreamingModal(false);
          setIsStreamLoading(false);
      }
  };

  const handleEmojiClick = (emojiData: TOBE) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (!chat?._id) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-200 to-indigo-50">
        <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome Back, Professor!</h3>
          <p className="text-gray-600 text-lg">
            Select a course chat from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const isCurrentlyStreaming = !!activeRoomUrl;

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-200 to-indigo-50 h-full">
      <div className="p-4 bg-white/80 shadow-sm backdrop-blur-sm flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{chat.groupName}</h2>
          <button
            onClick={() => setIsParticipantsModalOpen(true)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
          >
            <span>{Array.isArray(chat.users) ? chat.users.length : 0} participants</span>
            {typingUsers.filter((u) => u.chatId === chat?._id && u.userId !== user?._id).length > 0 && (
              <span className="ml-2 italic text-gray-600 animate-pulse">
                • {getTypingMessage()}
              </span>
            )}
          </button>
        </div>
        <div className="flex space-x-2">
          {user.role === "instructor" && (
            <button
              onClick={isCurrentlyStreaming ? () => handleStopStream() : handleStartStream}
              disabled={isStreamLoading}
              className={`p-2 transition-colors disabled:opacity-50 disabled:cursor-wait ${
                isCurrentlyStreaming ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-700"
              }`}
              title={isCurrentlyStreaming ? "End Live Stream" : "Start Live Stream"}
            >
              <Cast className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={getParticipantsWithUsernames()}
      />

      {showStreamingModal && activeRoomUrl && (
        <StreamingModal
          roomUrl={activeRoomUrl}
          onClose={() => handleStopStream()}
          isInstructor={true}
        />
      )}

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <div className="space-y-6 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;
              const isOwnMessage = senderId === user?._id;

              const prevSender = index > 0 ? messages[index - 1].sender : null;
              const prevSenderId = prevSender ? (typeof prevSender === "string" ? prevSender : (typeof prevSender === 'object' ? prevSender?._id : null)) : null;
              const isSameSender = senderId === prevSenderId;

              const timestamp = message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              const showDateHeader =
                index === 0 ||
                (message.createdAt &&
                  messages[index - 1].createdAt &&
                  formatMessageDate(message.createdAt as string | Date) !==
                    formatMessageDate(messages[index - 1].createdAt as string | Date));

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
                      <div className="bg-gray-200 text-gray-600 text-sm italic px-4 py-2 rounded-lg shadow-sm text-center w-auto max-w-md mx-auto">
                        {message.content}
                      </div>
                    ) : (
                      <div
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} w-full group mb-1`}
                      >
                        {!isOwnMessage && !isSameSender && (
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                            <span className="text-xs font-medium text-indigo-600">
                              {getSenderInitials(message)}
                            </span>
                          </div>
                        )}
                        {!isOwnMessage && isSameSender && <div className="w-6 mr-2 flex-shrink-0" />}
                        <div
                          className={`max-w-[70%] rounded-xl py-2 px-3 shadow-sm transition-shadow group-hover:shadow-md ${isOwnMessage ? "ml-auto" : "mr-auto"} ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white"
                              : "bg-white text-gray-900"
                          }`}
                        >
                          {!isSameSender && (
                            <p
                              className={`text-[11px] font-medium mb-0.5 ${
                                isOwnMessage ? "text-gray-300" : "text-gray-500"
                              } ${isOwnMessage ? "text-right" : "text-left"}`}
                            >
                              {getSenderName(message)}
                            </p>
                          )}
                          <p className="text-sm leading-snug break-words">{message.content}</p>
                          <div className={`flex items-center mt-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                            <p
                              className={`text-[10px] ${
                                isOwnMessage ? "text-fuchsia-100" : "text-gray-500"
                              }`}
                            >
                              {timestamp}
                            </p>
                            {isOwnMessage && (
                              <span className="ml-1 text-[10px] text-fuchsia-100">✓</span>
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
        <div ref={messagesEndRef} className="h-0" />
      </div>

      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-300 flex-shrink-0">
        <div className="flex items-center space-x-4 relative">
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-10">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-white rounded-full border border-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none text-gray-900 placeholder-gray-400 shadow-sm"
            />
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>
          </div>
          <button
            className={`p-4 rounded-full transition-colors duration-200 flex items-center justify-center ${
              newMessage.trim()
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}