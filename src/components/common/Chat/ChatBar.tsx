import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
  time: string;
}

const ChatBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hey there! Need any help? 😊", sender: "bot", time: "10:00 AM" },
    { text: "Yes! How do I mark a lesson as completed?", sender: "user", time: "10:02 AM" },
    { text: "Once you finish watching, it will be marked automatically. 👍", sender: "bot", time: "10:03 AM" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const botReplyTimeout = useRef<NodeJS.Timeout | null>(null); // Store timeout reference

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const newMessage: Message = {
        text: input,
        sender: "user",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput("");

      // Simulate bot reply after 1s
      botReplyTimeout.current = setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Got it! Let me know if you need anything else. 😊", sender: "bot", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
        ]);
      }, 1000);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Cleanup timeout on component unmount
    return () => {
      if (botReplyTimeout.current) {
        clearTimeout(botReplyTimeout.current);
      }
    };
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4">
      {/* Chat Box */}
      {isOpen && (
        <div className="w-80 bg-gray-400/80 shadow-lg rounded-lg p-4 border border-gray-300 transition-all duration-300">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h3 className="font-semibold text-lg">Chat</h3>
            <button onClick={toggleChat} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-48 overflow-y-auto p-2 bg-gray-50/90 rounded">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-center my-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "bot" && <User className="w-5 h-5 text-gray-500 mr-2" />}
                <div className={`p-2 text-sm rounded max-w-xs ${msg.sender === "user" ? "bg-purple-300 text-right" : "bg-gray-300 text-left"}`}>
                  <p>{msg.text}</p>
                  <span className="text-xs text-gray-600 block mt-1">{msg.time}</span>
                </div>
                {msg.sender === "user" && <User className="w-5 h-5 text-gray-500 ml-2" />}
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
              className="flex-1 border border-gray-300 p-2 rounded-l text-sm"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="bg-purple-600 text-white px-4 rounded-r hover:bg-purple-700">
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
