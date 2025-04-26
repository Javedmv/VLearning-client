import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Image, FileText, Mic, Users, Smile, Cast, Loader2 } from "lucide-react";
import { useSocketContext } from "../../../context/SocketProvider";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import toast from "react-hot-toast";
import ParticipantsModal from "./ParticipantsModal";
import StreamingModal from "./StreamingModal";
import EmojiPicker, { Theme } from 'emoji-picker-react';
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
  const [participants, setParticipants] = useState<ChatMember[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isParticipantsModalOpen ,setIsParticipantsModalOpen] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const courseId = enrollment?.courseId?._id;
  const courseName = enrollment?.courseId?.title || "Course Chat";
  const instructorId = enrollment?.courseId?.instructorId;
  const instructorName = `${enrollment?.courseId?.instructor?.firstName || ''} ${enrollment?.courseId?.instructor?.lastName || ''}`.trim();

  const {
    socket,
    handleTyping,
    typingUsers,
    activeStreams,
  } = useSocketContext();

  const [isSending, setIsSending] = useState(false);
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const [isJoiningStream, setIsJoiningStream] = useState<boolean>(false);
  const [viewerRoomUrl, setViewerRoomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchExistingChat();
    } else if (!isOpen) {
        setChatData(null);
        setChatMessages([]);
        setParticipants([]);
        setShowStreamingModal(false);
        setViewerRoomUrl(null);
    }
  }, [isOpen, courseId]);

  const fetchExistingChat = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const chatResponse = await commonRequest("GET", `${URL}/chat/get-chat?courseId=${courseId}`, null, config);

      if (chatResponse.success && chatResponse.data) {
        setChatData(chatResponse.data);
        setParticipants(chatResponse.data.members || chatResponse.data.users || []);
        
        const chatId = chatResponse.data._id;
        const messagesResponse = await commonRequest("GET", `${URL}/chat/messages/${chatId}`, null, config);

        if (messagesResponse.success && messagesResponse.data) {
          setChatMessages(messagesResponse.data);
          if (messagesResponse.data.some((msg: Message) => 
               (typeof msg.sender === 'string' ? msg.sender !== user._id : msg.sender?._id !== user._id) &&
               (!msg.recieverSeen || !msg.recieverSeen.includes(user._id))
             ))
           {
            markMessagesAsSeen(chatId);
          }
        } else {
            console.error("Failed to fetch messages:", messagesResponse.message);
            setChatMessages([]);
        }
      } else {
        console.error("Failed to fetch chat data:", chatResponse.message);
        setChatData(null); 
        setChatMessages([]);
        toast.error(chatResponse.message || "Could not load chat data.");
      }
    } catch (error: any) {
      console.error("Error fetching group chat:", error);
      toast.error(error.response?.data?.message || "Something went wrong loading chat");
      setChatData(null);
      setChatMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markMessagesAsSeen = async (chatId: string) => {
    if (!chatId || !user?._id) return;
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
         if (message.chatId !== chatData._id) return;
        console.log("Received message:", message);
        setChatMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
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
  }, [socket, chatData?._id, user?._id]);

  useEffect(() => {
    let typingInterval: NodeJS.Timeout | null = null;
    if (isInputFocused && socket && chatData?._id && input.length > 0) {
      handleTyping(chatData._id);
      typingInterval = setInterval(() => { handleTyping(chatData._id); }, 2000);
    }
    return () => { if (typingInterval) clearInterval(typingInterval); };
  }, [isInputFocused, socket, chatData?._id, input, handleTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || !socket || !chatData?._id || isSending) return;
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
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setIsSending(false);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  useEffect(() => {
    if (isOpen) {
         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [chatMessages, isOpen]);

  const handleJoinStream = async () => {
    if (!chatData?._id || isJoiningStream) return;

    setIsJoiningStream(true);
    try {
        console.log(`Fetching stream details for chat: ${chatData._id}`);
        const response = await commonRequest(
            "GET",
            `${URL}/chat/streaming/details/${chatData._id}`,
            null,
            config
        );
        console.log("Stream details response:", response);

        if (response.success && response.data?.isActive && response.data?.roomUrl) {
            setViewerRoomUrl(response.data.roomUrl);
            setShowStreamingModal(true);
            toast.success("Joining stream...");
        } else {
            throw new Error(response.data?.message || "Stream is not active or details are unavailable.");
        }
    } catch (error: any) {
        console.error("Error joining stream:", error);
        toast.error(`Failed to join stream: ${error.message || "Unknown error"}`);
        setViewerRoomUrl(null);
        setShowStreamingModal(false);
    } finally {
        setIsJoiningStream(false);
    }
  };

  const getSenderName = (msg: Message) => {
    const senderObj = typeof msg.sender !== 'string' ? msg.sender : null;
    const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;

    if (senderId === user?._id) return user?.username || "You";
    if (msg.senderName) return msg.senderName;
    if (senderObj?.username) return senderObj.username;
    if (senderObj?.firstName) return `${senderObj.firstName} ${senderObj.lastName || ''}`.trim();
    
    const member = participants.find((p) => p._id === senderId);
    if (member) return `${member.firstName} ${member.lastName}`.trim() || `User...${senderId?.slice(-4)}`;

    return `User...${senderId?.slice(-4) || '?'}`;
  };

  const formatMessageDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) { return "Today"; }
    if (date.toDateString() === yesterday.toDateString()) { return "Yesterday"; }
    return date.toLocaleDateString("en-US", {
        month: "short", day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const isCurrentUserMessage = (msg: Message): boolean => {
    const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
    return senderId === user._id;
  };

  const getTypingMessage = () => {
    const currentChatTypingUsers = typingUsers.filter((u) => u.chatId === chatData?._id && u.userId !== user._id);
    if (currentChatTypingUsers.length === 0) return "";
    if (currentChatTypingUsers.length === 1) return `${currentChatTypingUsers[0].username} is typing...`;
    if (currentChatTypingUsers.length === 2) return `${currentChatTypingUsers[0].username} and ${currentChatTypingUsers[1].username} are typing...`;
    return `${currentChatTypingUsers.length} people are typing...`;
  };

  const handleEmojiClick = (emojiData: TOBE) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const isStreamActive = chatData?._id ? activeStreams?.has(chatData._id) : false;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-100 shadow-lg rounded-lg p-4 border border-gray-300 transition-all duration-300 flex flex-col max-h-[75vh]">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-800">
                {chatData?.groupName || courseName} 
              </span>
               {isStreamActive && user?._id !== instructorId && !showStreamingModal && (
                 <button 
                    onClick={handleJoinStream}
                    disabled={isJoiningStream}
                    className="ml-3 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center"
                 >
                    {isJoiningStream ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin"/>
                    ) : (
                        <Cast className="w-4 h-4 mr-1"/>
                    )}
                    Join Stream
                 </button>
               )}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsParticipantsModalOpen(true)} 
                className="p-1 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800"
                title="View Participants"
              >
                <Users className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleChat} 
                className="p-1 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {typingUsers.length > 0 && typingUsers.some(u => u.chatId === chatData?._id && u.userId !== user._id) && (
            <div className="text-xs text-gray-600 italic mb-2 flex-shrink-0">
              {getTypingMessage()}
            </div>
          )}

          <ParticipantsModal
            isOpen={isParticipantsModalOpen}
            onClose={() => setIsParticipantsModalOpen(false)}
            participants={participants} 
          />

          {showStreamingModal && viewerRoomUrl && (
            <StreamingModal
              roomUrl={viewerRoomUrl}
              onClose={() => { 
                  setShowStreamingModal(false);
                  setViewerRoomUrl(null); 
              }}
              isInstructor={false}
            />
          )}

          <div className="flex-1 overflow-y-auto p-2 mb-4 bg-white rounded scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {isLoading ? (
              <div className="flex justify-center items-center h-full text-gray-500"> <Loader2 className="w-5 h-5 animate-spin mr-2"/> Loading messages...</div>
            ) : chatMessages.length > 0 ? (
              chatMessages.map((msg, index) => {
                const isOwnMessage = isCurrentUserMessage(msg);
                const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
                const prevSender = index > 0 ? chatMessages[index - 1].sender : null;
                const prevSenderId = prevSender ? (typeof prevSender === "string" ? prevSender : (typeof prevSender === 'object' ? prevSender?._id : null)) : null;
                const isSameSender = senderId === prevSenderId;

                const showDateHeader = index === 0 || (msg.createdAt && chatMessages[index - 1].createdAt && formatMessageDate(msg.createdAt as string | Date) !== formatMessageDate(chatMessages[index - 1].createdAt as string | Date));

                return (
                  <React.Fragment key={msg._id || index}>
                    {showDateHeader && msg.createdAt && (
                      <div className="flex justify-center my-2"><div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{formatMessageDate(msg.createdAt)}</div></div>
                    )}
                    <div className={`my-1 flex ${ msg.type === "newUser" ? "justify-center" : isOwnMessage ? "justify-end" : "justify-start" }`}>
                      <div className={`${msg.type === "newUser" ? "max-w-full" : "max-w-[75%]"}`}>
                        {msg.type !== "newUser" && !isOwnMessage && !isSameSender && (
                          <div className="flex items-center mb-1">
                             <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium bg-purple-500 mr-2 flex-shrink-0">
                               {getSenderName(msg)?.charAt(0).toUpperCase() || 'U'}
                             </div>
                             <span className="text-[11px] font-medium text-gray-700">{getSenderName(msg)}</span>
                           </div>
                        )}
                         {!isOwnMessage && isSameSender && <div className="w-8 mr-0" />}
                        <div className={`p-2 rounded-lg shadow-sm ${msg.type === "newUser" ? "bg-gray-200 text-gray-600 text-center text-xs italic px-3 py-1" : isOwnMessage ? "bg-purple-500 text-white" : (senderId === instructorId ? "bg-green-100 text-green-900 border border-green-200" : "bg-gray-200 text-gray-800")} `}>
                          {msg.type !== "newUser" && !isSameSender && isOwnMessage && (
                            <p className="text-[11px] font-medium text-purple-100 text-right mb-0.5">You</p>
                          )}
                          <p className="text-sm leading-snug break-words">{msg.content}</p>
                          {msg.type !== "newUser" && (
                            <div className={`flex items-center mt-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                              <span className={`text-[10px] ${isOwnMessage ? "text-purple-100" : "text-gray-500"}`}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : ""}
                              </span>
                              {isOwnMessage && (
                                <span className="ml-1 text-[10px] text-purple-100">✓</span>
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
            <div ref={messagesEndRef} className="h-1" />
          </div>

          <div className="flex mt-auto relative flex-shrink-0">
            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-10">
                <EmojiPicker onEmojiClick={handleEmojiClick} theme={Theme.LIGHT} />
              </div>
            )}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 bg-gray-200 text-gray-700 rounded-l hover:bg-gray-300 flex items-center justify-center"
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="flex-1 border border-gray-300 p-2 text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className={`p-3 rounded-r flex items-center justify-center transition-colors duration-200 ${isSending || !input.trim() ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"}`}
              disabled={isSending || !input.trim()}
              title="Send Message"
            >
             {isSending ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="rounded-full p-3 shadow-lg bg-purple-600 text-white hover:bg-purple-700 transition-all fixed bottom-4 right-4 z-30"
        title="Toggle Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatBar;