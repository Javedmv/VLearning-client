import React from 'react';
import { User } from './mockData';
import { Users, Search } from 'lucide-react';

interface UserListProps {
  users: User[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

export function UserList({ users, selectedUserId, onSelectUser }: UserListProps) {
  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-fuchsia-800 to-fuchsia-900">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-7 h-7 text-white" />
          <h2 className="text-2xl font-bold text-white">Students</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <Search className="w-5 h-5 text-white/70 absolute left-3 top-2.5" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 border-l-4 ${
              selectedUserId === user.id
                ? 'border-l-pink-600 bg-blue-50'
                : 'border-l-transparent'
            }`}
            onClick={() => onSelectUser(user.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md"
                />
                {user.lastSeen === 'online' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {user.name}
                </h3>
                <p className={`text-sm ${
                  user.lastSeen === 'online'
                    ? 'text-green-600 font-medium'
                    : 'text-gray-500'
                }`}>
                  {user.lastSeen}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}