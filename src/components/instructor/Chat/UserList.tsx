import { useState } from "react";
import { Users, Search } from "lucide-react";

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

interface UserListProps {
  users: Chat[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

export function UserList({ users, selectedUserId, onSelectUser }: UserListProps) {
  const [search, setSearch] = useState("");

  const filteredChats = users.filter((chat) =>
    chat.groupName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="w-7 h-7 text-white" />
          <h2 className="text-2xl font-bold text-white">Course Chats</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="w-5 h-5 text-white/70 absolute left-3 top-2.5" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50 border-l-4 ${
                selectedUserId === chat._id
                  ? "border-l-indigo-600 bg-blue-50"
                  : "border-l-transparent"
              }`}
              onClick={() => onSelectUser(chat._id)}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {chat.groupName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {chat.groupName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.latestMessage || "No messages yet"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {chat.users.length} participants
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No chats found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}