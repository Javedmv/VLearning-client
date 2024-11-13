import React from 'react';
import { Search, Star, MoreVertical } from 'lucide-react';

const Messages:React.FC = () => {
  const messages = [
    {
      id: 1,
      sender: 'John Doe',
      subject: 'Question about Web Development Course',
      preview: 'Hi, I have a question regarding the JavaScript module...',
      time: '10:30 AM',
      unread: true,
      starred: false,
    },
    {
      id: 2,
      sender: 'Emily White',
      subject: 'Course Update Notification',
      preview: 'The new course materials have been uploaded...',
      time: 'Yesterday',
      unread: false,
      starred: true,
    },
    {
      id: 3,
      sender: 'Michael Chen',
      subject: 'Technical Support Required',
      preview: 'I\'m experiencing issues with the video player...',
      time: 'Mar 15',
      unread: true,
      starred: false,
    },
    {
      id: 4,
      sender: 'Sarah Wilson',
      subject: 'New Course Proposal',
      preview: 'I would like to propose a new course on mobile development...',
      time: 'Mar 14',
      unread: false,
      starred: true,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Manage your communications</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Compose
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center ${
                message.unread ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                {message.sender.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${
                    message.unread ? 'text-gray-900' : 'text-gray-600'
                  }`}>
                    {message.sender}
                  </h3>
                  <span className="text-sm text-gray-500">{message.time}</span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm ${
                    message.unread ? 'font-medium text-gray-900' : 'text-gray-600'
                  }`}>
                    {message.subject}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className={`text-gray-400 hover:text-yellow-400 ${
                      message.starred ? 'text-yellow-400' : ''
                    }`}>
                      <Star className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 truncate mt-1">
                  {message.preview}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;