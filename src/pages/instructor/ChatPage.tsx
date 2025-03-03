import React, { useState } from 'react';
import { UserList } from '../../components/instructor/Chat/UserList';
import { ChatHistory } from '../../components/instructor/Chat/ChatHistory';
import { users, chats } from '../../components/instructor/Chat/mockData';

const ChatPage:React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const selectedUser = users.find(user => user.id === selectedUserId);
  const selectedChat = chats.find(chat => chat.userId === selectedUserId);

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="min-h-[88vh] flex shadow-2xl max-w-7xl mx-auto bg-white/80 backdrop-blur-sm">
        <UserList
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
        />
        <ChatHistory
          chat={selectedChat}
          selectedUser={selectedUser}
        />
      </div>
    </div>
  );
}

export default ChatPage;