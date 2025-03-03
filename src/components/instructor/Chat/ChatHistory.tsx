import React, { useState } from 'react';
import { Chat, User } from './mockData';
import { Send, Smile, PaperclipIcon } from 'lucide-react';

interface ChatHistoryProps {
  chat: Chat | undefined;
  selectedUser: User | undefined;
}


export function ChatHistory({ chat, selectedUser }: ChatHistoryProps) {
  const [message, setMessage] = useState('');

  if (!chat || !selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-300 to-blue-50">
        <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome Back, Professor!</h3>
          <p className="text-gray-600 text-lg">Select a student from the list to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-pink-300 to-pink-200">
      <div className="p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={selectedUser.avatar}
              alt={selectedUser.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
            />
            {selectedUser.lastSeen === 'online' && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedUser.name}
            </h2>
            <p className={`text-sm ${
              selectedUser.lastSeen === 'online'
                ? 'text-green-600 font-medium'
                : 'text-gray-500'
            }`}>
              {selectedUser.lastSeen}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chat.messages.map((message) => {
          const isInstructor = message.userId === 'instructor';
          return (
            <div
              key={message.id}
              className={`flex ${isInstructor ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-4 shadow-md transition-shadow group-hover:shadow-lg ${
                  isInstructor
                    ? 'bg-gradient-to-r from-fuchsia-700 to-fuchsia-800 text-white'
                    : 'bg-white text-gray-900'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    isInstructor ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-6 bg-white/80 backdrop-blur-sm border-t border-gray-300">
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-6 py-4 bg-white rounded-full border border-gray-400 focus:ring-2 focus:ring-fuchsia-800 focus:outline-none text-gray-900 placeholder-gray-400 shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Smile className="w-6 h-6" />
            </button>
          </div>
          <button 
            className={`p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
              message.trim()
                ? 'bg-gradient-to-r from-fuchsia-700 to-fuchsia-900 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}