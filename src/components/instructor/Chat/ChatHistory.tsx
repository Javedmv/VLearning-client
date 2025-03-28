import React, { useState, useEffect, useRef } from "react";
import { Send, Smile, Paperclip, Video, X } from "lucide-react";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { useSocketContext } from "../../../context/SocketProvider";
import { RootState } from "../../../redux/store";
import { toast } from "react-hot-toast";
import ParticipantsModal from "../../common/Chat/ParticipantsModal";
import VideoCallModal from "../../common/Chat/VideoCallModal";
import EmojiPicker from 'emoji-picker-react';

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
  selectedUser: any;
}

export function ChatHistory({ chat }: ChatHistoryProps) {
  const { user } = useSelector((state: RootState) => state.user);
  const {
    socket,
    initiateVideoCall,
    endVideoCall,
    isVideoCallActive,
    localStream,
    remoteStream,
    setIsVideoCallActive,
    typingUsers,
    handleTyping,
    joinVideoCall,
  } = useSocketContext();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    chatId: string;
    callerId: string;
    callerName: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
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

      const handleMessageSent = (data: { success: boolean; messageId: string }) => {
        console.log("Message sent confirmation:", data);
        setIsSending(false);
      };

      const handleMessageError = (error: any) => {
        console.error("Message error:", error);
        setIsSending(false);
        toast.error("Failed to send message. Please try again.");
      };

      const handleIncomingCall = (callData: { chatId: string; callerId: string; callerName: string }) => {
        console.log("Incoming call:", callData);
        if (callData.callerId !== user._id) {  // Don't show notification to caller
          setIncomingCall(callData);
          // Use a valid audio URL that's guaranteed to work
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2355/2355-preview.mp3');
          audio.loop = true;  // Make the ringtone loop
          audio.play().catch(error => console.error('Error playing ringtone:', error));
          // Store audio reference to stop it later
          (window as any).incomingCallAudio = audio;
        }
      };

      const handleCallAccepted = (data: { chatId: string; accepterId: string }) => {
        console.log("Call accepted:", data);
        if ((window as any).incomingCallAudio) {
          (window as any).incomingCallAudio.pause();
          (window as any).incomingCallAudio = null;
        }
        if (data.chatId === chat._id) {
          setShowVideoModal(true);
          if (data.accepterId !== user._id) {
            initiateVideoCall(chat._id);
          }
        }
      };

      const handleCallRejected = (data: { chatId: string; rejecterId: string }) => {
        console.log("Call rejected:", data);
        // Stop ringtone if it's playing
        if ((window as any).incomingCallAudio) {
          (window as any).incomingCallAudio.pause();
          (window as any).incomingCallAudio = null;
        }
        if (data.chatId === chat._id && data.rejecterId !== user._id) {
          toast.error("Call was rejected");
          setShowVideoModal(false);
          setIncomingCall(null);
        }
      };

      socket.on("message", handleNewMessage);
      socket.on("messageSent", handleMessageSent);
      socket.on("messageError", handleMessageError);
      socket.on("incomingCall", handleIncomingCall);
      socket.on("callAccepted", handleCallAccepted);
      socket.on("callRejected", handleCallRejected);

      const handleVideoCallStarted = () => {
        setIsVideoCallActive(true);
        toast.success("Video call started. Join now!");
      };

      const handleVideoCallEnded = () => {
        setIsVideoCallActive(false);
        setShowVideoModal(false);
        setIncomingCall(null);
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
        socket.off("incomingCall", handleIncomingCall);
        socket.off("callAccepted", handleCallAccepted);
        socket.off("callRejected", handleCallRejected);
      };
    }
  }, [socket, chat?._id, instructorId, user._id]);

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
    try {
      setLoading(true);
      const response = await commonRequest("GET", `${URL}/chat/messages/${chatId}`, {}, config);
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

  // Function to get username from messages based on sender ID
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
    return `User-${senderId.substring(0, 4)}`; // Fallback if no username found
  };

  const getSenderName = (message: Message): string => {
    const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;

    if (senderId === user._id) {
      return "You";
    }

    return getUsernameFromMessages(senderId!);
  };

  const getSenderInitials = (message: Message): string => {
    const name = getSenderName(message);
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

  const handleVideoCall = async () => {
    try {
      if (isVideoCallActive) {
        endVideoCall(chat._id);
        setShowVideoModal(false);
      } else {
        // Emit call initiation event instead of directly starting the call
        socket?.emit("initiateCall", { 
          chatId: chat._id, 
          callerId: user._id,
          callerName: user.username 
        });
        toast.success("Calling participants...");
      }
    } catch (error) {
      console.error("Error handling video call:", error);
      setShowVideoModal(false);
    }
  };

  const getTypingMessage = () => {
    const currentChatTypingUsers = typingUsers.filter((u) => u.chatId === chat?._id);
    if (currentChatTypingUsers.length === 0) return "";
    if (currentChatTypingUsers.length === 1) return `${currentChatTypingUsers[0].username} is typing...`;
    if (currentChatTypingUsers.length === 2)
      return `${currentChatTypingUsers[0].username} and ${currentChatTypingUsers[1].username} are typing...`;
    return `${currentChatTypingUsers.length} people are typing...`;
  };

  // Create participants list with usernames from messages
  const getParticipantsWithUsernames = () => {
    return chat.users.map((userId) => ({
      _id: userId,
      username: userId === instructorId ? instructorName : getUsernameFromMessages(userId),
    }));
  };

  useEffect(() => {
    return () => {
      if (isVideoCallActive) {
        endVideoCall(chat._id);
      }
    };
  }, []);

  const handleAcceptCall = () => {
    if (incomingCall && socket) {
      socket.emit("acceptCall", { 
        chatId: incomingCall.chatId,
        accepterId: user._id 
      });
      setIncomingCall(null);
      setShowVideoModal(true);
      joinVideoCall(incomingCall.chatId);
    }
  };

  const handleRejectCall = () => {
    if (incomingCall && socket) {
      socket.emit("rejectCall", { 
        chatId: incomingCall.chatId,
        rejecterId: user._id 
      });
      setIncomingCall(null);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
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

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-200 to-indigo-50">
      {/* Chat header */}
      <div className="p-4 bg-white/80 shadow-sm backdrop-blur-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{chat.groupName}</h2>
          <button
            onClick={() => setIsParticipantsModalOpen(true)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors duration-200"
          >
            <span>{chat.users.length} participants</span>
            {typingUsers.filter((u) => u.chatId === chat?._id).length > 0 && (
              <span className="ml-2 italic text-gray-600 animate-pulse">
                • {getTypingMessage()}
              </span>
            )}
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleVideoCall}
            className={`p-2 transition-colors ${
              isVideoCallActive ? "text-red-500 hover:text-red-700" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Video className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Participants Modal */}
      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={getParticipantsWithUsernames()}
      />

      {/* Video call modal */}
      {showVideoModal && (
        <VideoCallModal
          localStream={localStream}
          remoteStream={remoteStream}
          onEndCall={() => {
            endVideoCall(chat._id);
            setShowVideoModal(false);
          }}
          isInstructor={true}
        />
      )}

      {/* Add Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Incoming Video Call</h3>
            <p className="mb-6">{incomingCall.callerName} is calling...</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleRejectCall}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptCall}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
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
              const isOwnMessage =
                typeof message.sender === "string"
                  ? message.sender === user._id
                  : message.sender._id === user._id;

              const isSameSender =
                index > 0 &&
                (typeof message.sender === "string"
                  ? message.sender === messages[index - 1].sender
                  : message.sender._id === (messages[index - 1].sender as any)._id);

              const timestamp = message.createdAt
                ? new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

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
                      <div className="bg-gray-200 text-gray-600 text-sm italic px-4 py-2 rounded-lg shadow-sm">
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
                        {!isOwnMessage && isSameSender && <div className="w-6 mr-2" />}
                        <div
                          className={`max-w-[70%] rounded-xl py-2 px-3 shadow-sm transition-shadow group-hover:shadow-md ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 text-white"
                              : "bg-white text-gray-900"
                          }`}
                        >
                          {!isSameSender && (
                            <p
                              className={`text-[11px] font-medium ${
                                isOwnMessage ? "text-gray-300" : "text-gray-500"
                              } ${isOwnMessage ? "text-right" : "text-left"}`}
                            >
                              {getSenderName(message)}
                            </p>
                          )}
                          <p className="text-sm leading-snug">{message.content}</p>
                          <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                            <p
                              className={`text-[10px] ${
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
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