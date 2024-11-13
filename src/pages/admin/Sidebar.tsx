import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Settings,
  BarChart2,
  Calendar,
  LogOut
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/' },
  { icon: Users, label: 'Students', href: '/admin/students' },
  { icon: GraduationCap, label: 'Instructors', href: '/admin/instructors' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
  { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
  { icon: Calendar, label: 'Schedule', href: '/admin/schedule' },
  { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const Sidebar:React.FC = () => {
  return (
    <aside className="bg-gray-900 text-gray-100 w-64 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold">VLearning</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors w-full">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;