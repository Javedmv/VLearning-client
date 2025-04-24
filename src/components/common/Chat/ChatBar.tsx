import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Image, FileText, Mic, Users, Smile, Cast } from "lucide-react";
import { useSocketContext } from "../../../context/SocketProvider";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import ParticipantsModal from "./ParticipantsModal";
import StreamingModal from "./StreamingModal";
import EmojiPicker from 'emoji-picker-react';
import { TOBE } from "../../../common/constants";

enum ContentType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  FILE = "file",
}

interface ChatBarProp {
  enrollment: TOBE;
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

interface ChatMember {
  _id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  role: string;
}

interface Chat {
  _id: string;
  groupName: string;
  courseId: string;
  instructorId: string;
  users: string[];
  members?: ChatMember[];
  latestMessage: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const ChatBar: React.FC<ChatBarProp> = ({ enrollment }) => {
  const { user } = useSelector((state: RootState) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatData, setChatData] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isParticipantsModalOpen ,setIsParticipantsModalOpen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const courseId = enrollment?.courseId?._id;
  const courseName = enrollment?.courseId?.title || "Course Chat";
  const instructorId = enrollment?.courseId?.instructorId;
  const instructorName = enrollment?.courseId?.instructor?.firstName + " " + enrollment?.courseId?.instructor?.lastName;

  const {
    socket,
    streamViewers,
    streamViewerNames,
    isStreaming,
    joinStream,
    leaveStream,
    handleTyping,
    typingUsers,
  } = useSocketContext();

  const [isSending, setIsSending] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);

  const [streamNotification, setStreamNotification] = useState<{
    chatId: string;
    streamerId: string;
    streamerName: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingChat();
    }
  }, [isOpen]);

  const fetchExistingChat = async () => {
    try {
      setIsLoading(true);
      const chatResponse = await commonRequest(
        "GET",
        `${URL}/chat/get-chat?courseId=${courseId}`,
        null,
        config
      );

      if (chatResponse.success && chatResponse.data) {
        setChatData(chatResponse.data);
        setParticipants(chatResponse.data.users || []);

        const messagesResponse = await commonRequest(
          "GET",
          `${URL}/chat/messages/${chatResponse.data._id}`,
          null,
          config
        );

        if (messagesResponse.data && messagesResponse.success) {
          setChatMessages(messagesResponse.data);

          if (
            messagesResponse.data.some(
              (msg: Message) =>
                msg.sender !== user._id &&
                (!msg.recieverSeen || !msg.recieverSeen.includes(user._id))
            )
          ) {
            markMessagesAsSeen(chatResponse.data._id);
          }
        }
      }
    } catch (error: any) {
      console.error("Error fetching group chat:", error);
      toast.error(`${error.response.data.message}` || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsSeen = async (chatId: string) => {
    try {
      await commonRequest("PUT", `${URL}/chat/mark-seen`, { chatId, userId: user._id }, config);
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (socket && chatData?._id) {
      socket.emit("join", { chatId: chatData._id, userId: user._id });

      const handleNewMessage = (message: Message) => {
        console.log("Received message:", message);
        setChatMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m._id === message._id ||
              (m.content === message.content &&
                m.sender === message.sender &&
                m.createdAt === message.createdAt)
          );
          if (exists) return prev;
          return [...prev, message];
        });
      };

      const handleMessageSent = (data: { success: boolean; messageId: string }) => {
        console.log("Message sent confirmation:", data);
        setIsSending(false);
      };

      const handleMessageError = (error: TOBE) => {
        console.error("Message error:", error);
        setIsSending(false);
        toast.error("Failed to send message. Please try again.");
      };

      const handleStreamStarted = (data: { chatId: string; streamerId: string; streamerName: string }) => {
        console.log("Stream notification:", data);
        if (data.chatId === chatData?._id && !isStreaming && data.streamerId !== user?._id) {
          setStreamNotification({
            chatId: data.chatId,
            streamerId: data.streamerId,
            streamerName: data.streamerName,
          });
          toast.success(`${data.streamerName} started a live stream`);
        }
      };

      const handleStreamEnded = (data: { chatId: string; userId: string; streamerName: string }) => {
        console.log("Stream ended:", data);
        if (data.chatId === chatData?._id) {
          setStreamNotification(null);
          
          if (isStreaming) {
            setShowStreamingModal(false);
          }
          
          if (data.userId !== user?._id) {
            toast.success(`${data.streamerName} ended the stream`);
          }
        }
      };

      socket.on("message", handleNewMessage);
      socket.on("messageSent", handleMessageSent);
      socket.on("messageError", handleMessageError);
      socket.on("streamStarted", handleStreamStarted);
      socket.on("streamEnded", handleStreamEnded);

      return () => {
        socket.off("message", handleNewMessage);
        socket.off("messageSent", handleMessageSent);
        socket.off("messageError", handleMessageError);
        socket.off("streamStarted", handleStreamStarted);
        socket.off("streamEnded", handleStreamEnded);
      };
    }
  }, [socket, chatData?._id, user._id]);

  useEffect(() => {
    let typingInterval: NodeJS.Timeout | null = null;

    if (isInputFocused && socket && chatData?._id && input.length > 0) {
      handleTyping(chatData._id);
      typingInterval = setInterval(() => {
        handleTyping(chatData._id);
      }, 2000);
    }

    return () => {
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [isInputFocused, socket, chatData?._id, input, handleTyping]);

  const handleSendMessage = async () => {
    if (input.trim() && socket && chatData?._id && !isSending) {
      try {
        setIsSending(true);

        const messageData = {
          content: input,
          chatId: chatData._id,
          sender: user?._id,
          senderName: user?.username,
          contentType: ContentType.TEXT,
          recieverSeen: [user?._id],
          type: "message" as const,
          createdAt: new Date().toISOString(),
        };

        socket.emit("sendMessage", messageData);
        setInput("");
      } catch (error: any) {
        console.error("Error sending message:", error);
        setIsSending(false);
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isOpen]);

  const getContentIcon = (contentType?: ContentType) => {
    switch (contentType) {
      case ContentType.IMAGE:
        return <Image className="w-4 h-4 mr-1" />;
      case ContentType.AUDIO:
        return <Mic className="w-4 h-4 mr-1" />;
      case ContentType.VIDEO:
        return <Mic className="w-4 h-4 mr-1" />;
      case ContentType.FILE:
        return <FileText className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const getSenderName = (msg: Message) => {
    if (msg.senderName) return msg.senderName;
    if (typeof msg.sender !== "string" && msg.sender.username) {
      return msg.sender.username;
    }

    const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender._id;

    if (senderId === user._id) return user.username || "You";
    if (senderId === instructorId) {
      const instructorUsername = enrollment?.courseId?.instructor?.username;
      return instructorUsername || "Instructor";
    }

    const member = chatData?.members?.find((m) => m._id === senderId);
    if (member) return `${member.firstName} ${member.lastName}` || `User-${member._id?.substring(0, 4)}`;
    return "Unknown User";
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

  const isCurrentUserMessage = (msg: Message): boolean => {
    const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender._id;
    return senderId === user._id;
  };

  // Construct the typing message using typingUsers from context
  const getTypingMessage = () => {
    const currentChatTypingUsers = typingUsers.filter((u) => u.chatId === chatData?._id);
    if (currentChatTypingUsers.length === 0) return "";
    if (currentChatTypingUsers.length === 1) return `${currentChatTypingUsers[0].username} is typing...`;
    if (currentChatTypingUsers.length === 2)
      return `${currentChatTypingUsers[0].username} and ${currentChatTypingUsers[1].username} are typing...`;
    return `${currentChatTypingUsers.length} people are typing...`;
  };

  const handleEmojiClick = (emojiData: TOBE) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Streaming notification */}
      {streamNotification && !showStreamingModal && (
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-xl max-w-sm">
          <h3 className="text-lg font-semibold mb-2">Live Stream</h3>
          <p className="mb-4">{streamNotification.streamerName} is streaming...</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setStreamNotification(null)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Ignore
            </button>
            <button
              onClick={() => {
                if (!showStreamingModal && streamNotification) {
                  // Only try to join if not already in a streaming session
                  joinStream(streamNotification.chatId);
                  setShowStreamingModal(true);
                }
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Join Stream
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-400/80 shadow-lg rounded-lg p-4 border border-gray-300 transition-all duration-300">
          {/* Chat header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-800">
                {courseName}
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsParticipantsModalOpen(true)} 
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <Users className="w-5 h-5" />
              </button>
              <button onClick={toggleChat} className="p-1 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && typingUsers.some(u => u.chatId === chatData?._id) && (
            <div className="text-xs text-gray-600 italic mb-2">
              {getTypingMessage()}
            </div>
          )}

          <ParticipantsModal
            isOpen={isParticipantsModalOpen}
            onClose={() => setIsParticipantsModalOpen(false)}
            participants={participants} 
          />

          {/* Streaming modal */}
          {showStreamingModal && streamNotification && (
            <StreamingModal
              chatId={streamNotification.chatId}
              onClose={() => {
                leaveStream(streamNotification.chatId);
                setShowStreamingModal(false);
              }}
              isInstructor={false}
            />
          )}

          <div className="h-80 overflow-y-auto p-2 bg-gray-50/90 rounded scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading messages...</p>
              </div>
            ) : chatMessages.length > 0 ? (
              chatMessages.map((msg, index) => {
                const isOwnMessage = isCurrentUserMessage(msg);
                const isSameSender =
                  index > 0 &&
                  (typeof msg.sender === "string" && typeof chatMessages[index - 1].sender === "string"
                    ? msg.sender === chatMessages[index - 1].sender
                    : typeof msg.sender !== "string" &&
                      typeof chatMessages[index - 1].sender !== "string"
                    ? (msg.sender as { _id?: string })._id ===
                      (chatMessages[index - 1].sender as { _id?: string })._id
                    : false);

                const showDateHeader =
                  index === 0 ||
                  (msg.createdAt &&
                    chatMessages[index - 1].createdAt &&
                    formatMessageDate(msg.createdAt as string | Date) !==
                      formatMessageDate(chatMessages[index - 1].createdAt as string | Date));

                return (
                  <React.Fragment key={index}>
                    {showDateHeader && msg.createdAt && (
                      <div className="flex justify-center my-2">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {formatMessageDate(msg.createdAt)}
                        </div>
                      </div>
                    )}
                    <div
                      className={`my-2 ${
                        msg.type === "newUser"
                          ? "flex justify-center"
                          : isOwnMessage
                          ? "flex justify-end"
                          : "flex justify-start"
                      }`}
                    >
                      <div
                        className={`${msg.type === "newUser" ? "max-w-full" : "max-w-[75%] mt-1"}`}
                      >
                        {msg.type !== "newUser" && (
                          <>
                            {!isOwnMessage && !isSameSender && (
                              <div className="flex items-center mb-1">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium bg-purple-500 mr-1">
                                  {getSenderName(msg).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[11px] font-medium text-gray-700">
                                  {getSenderName(msg)}
                                </span>
                              </div>
                            )}
                            {!isOwnMessage && isSameSender && <div className="w-6 mr-2" />}
                          </>
                        )}

                        <div
                          className={`p-2 rounded-xl py-2 px-3 shadow-sm transition-shadow group-hover:shadow-md ${
                            msg.type === "newUser"
                              ? "bg-gray-300 text-center px-2 py-1 rounded-full text-sm"
                              : isOwnMessage
                              ? "bg-purple-500 text-white"
                              : typeof msg.sender === "string" && msg.sender === instructorId
                              ? "bg-green-500 text-white"
                              : typeof msg.sender !== "string" && msg.sender._id === instructorId
                              ? "bg-green-500 text-white"
                              : "bg-gray-400"
                          }`}
                        >
                          {msg.type !== "newUser" && !isSameSender && isOwnMessage && (
                            <p className="text-[11px] font-medium text-gray-300 text-right">You</p>
                          )}
                          <p className="text-sm leading-snug">{msg.content}</p>
                          {msg.type !== "newUser" && (
                            <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                              <span
                                className={`text-[10px] ${
                                  isOwnMessage ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  : "N/A"}
                              </span>
                              {isOwnMessage && (
                                <span className="ml-1 text-[10px] text-blue-100">✓</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} className="pt-2" />
          </div>

          <div className="flex mt-2 relative">
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="bg-gray-200 text-gray-700 px-3 rounded-l hover:bg-gray-300"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="flex-1 border border-gray-300 p-2 rounded-none text-sm"
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