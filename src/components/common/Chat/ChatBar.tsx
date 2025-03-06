import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { useSocketContext } from "../../../context/SocketProvider";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface ChatBarProp {
  enrollment: any;
}

const ChatBar: React.FC<ChatBarProp> = ({enrollment}) => {
  const { user } = useSelector((state: RootState) => state.user);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const instructorId = enrollment?.courseId?._id
  const instructorName = enrollment?.courseId?.instructor?.firstName + " " + enrollment?.courseId?.instructor?.lastName
  const enrollmentId = enrollment?._id
  
  const {socket, onlineUsers, messages, sendMessage } = useSocketContext();

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async () => {
    if (input.trim() && socket) {
      try {
        const response = await commonRequest('POST',`${URL}/chat/message`,{content:input, chatId:"", sender:user._id, reciever: instructorId},config)
      } catch (error) {
        
      }
      // sendMessage({
      //   text: input,
      //   sender: userId,
      //   receiver: instructorId,
      //   enrollmentId: enrollmentId
      // });
      // setInput("");
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4">
      {/* Chat Box */}
      {isOpen && (
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-gray-400/80 shadow-lg rounded-lg p-4 border border-gray-300 transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h3 className="font-semibold text-lg">{instructorName}</h3>
            <button onClick={toggleChat} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-2 bg-gray-50/90 rounded">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex items-center my-2 ${msg.sender === user._id ? "justify-end" : "justify-start"}`}
              >
                {msg.sender !== user._id && <User className="w-5 h-5 text-gray-500 mr-2" />}
                <div 
                  className={`p-2 text-sm rounded max-w-xs ${
                    msg.sender === user._id ? "bg-purple-300 text-right" : "bg-gray-300 text-left"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-xs text-gray-600 block mt-1">
                    {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {msg.sender === user._id && <User className="w-5 h-5 text-gray-500 ml-2" />}
              </div>
            ))}
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