import React from 'react';
import { Link } from 'react-router-dom';
import { Book, PlusCircle, MessageSquare, GraduationCap, ArrowLeft, LayoutDashboard, IndianRupee } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-fuchsia-900 text-pink-200 w-64 min-h-screen flex flex-col">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
        {/* <li>
            <Link
              to="/"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-fuchsia-800 transition-colors"
            >
              <ArrowLeft />
              <span>Back</span>
            </Link>
          </li> */}
          {/* <hr className="border-t-4 border border-gray-700 my-1"></hr> */}
          <li>
            <Link
              to="/instructor/"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-fuchsia-800 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5"/>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/instructor/courses"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-fuchsia-800 transition-colors"
            >
              <Book className="w-5 h-5" />
              <span>My Courses</span>
            </Link>
          </li>
          <li>
            <Link
              to="/instructor/add-course"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-fuchsia-800 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add New Course</span>
            </Link>
          </li>
          <li>
            <Link
              to="/instructor/chat"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-fuchsia-800 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </Link>
          </li>
          <li>
            <Link
              to="/instructor/earnings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-fuchsia-800 transition-colors"
            >
              <IndianRupee className="w-5 h-5" />
              <span>Earnings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;