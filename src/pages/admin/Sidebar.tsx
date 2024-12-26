import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart2,
  LogOut,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import toast from 'react-hot-toast';
import { logout } from '../../redux/actions/user/userAction';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  function handleLogout(){
    try {
      dispatch(logout())
      .then(() => toast.success("Logout Successfully"))
    } catch (error) {
      console.error(error,"ERROR in HANDLE LOGOUT ADMIN")
    }
  }

  return (
    <aside className="bg-gray-900 text-gray-100 w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold">VLearning</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin/"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/students"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Students</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/instructors"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Instructors</span>
            </Link>
          </li>
          {/* <li>
            <Link
              to="/admin/courses"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Courses</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/messages"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/analytics"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <BarChart2 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </li> */}
          <li>
            <Link
              to="/admin/settings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors w-full" onClick={() => handleLogout()}>
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
