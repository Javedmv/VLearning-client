import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Book, PlusCircle, DollarSign, MessageSquare } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-full md:w-64 bg-fuchsia-900 text-pink-200 min-h-16 md:min-h-screen">
      <nav className="mt-6">
        <Link to="/instructor/" className="block px-4 py-2 hover:bg-fuchsia-800 transition-colors">
          <Home className="inline-block mr-2" size={18} />
          Dashboard
        </Link>
        <Link to="/instructor/courses" className="block px-4 py-2 hover:bg-fuchsia-800 transition-colors">
          <Book className="inline-block mr-2" size={18} />
          My Courses
        </Link>
        <Link to="/instructor/add-course" className="block px-4 py-2 hover:bg-fuchsia-800 transition-colors">
          <PlusCircle className="inline-block mr-2" size={18} />
          Add New Course
        </Link>
        <Link to="/instructor/chat" className="block px-4 py-2 hover:bg-fuchsia-800 transition-colors">
          <MessageSquare className="inline-block mr-2" size={18} />
          Chat
        </Link>
        <Link to="/instructor/earnings" className="block px-4 py-2 hover:bg-fuchsia-800 transition-colors">
          <DollarSign className="inline-block mr-2" size={18} />
          Earnings
        </Link>
      </nav>
    </div>
  );
};
export default Sidebar;
