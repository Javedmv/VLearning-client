import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../../components/home/Navbar';
import { TOBE } from '../../common/constants';

interface DashboardProps {
    user:TOBE
  }

  const DashboardLayout: React.FC<DashboardProps> = ({ user }) => {
    return (
      <div className="h-screen flex flex-col bg-pink-200">
        {/* Navbar takes auto height */}
        <Navbar User={user} />
  
        {/* Remaining height goes to content (Sidebar + Main Content) */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <Outlet context={user} />
          </div>
        </div>
      </div>
    );
  };
  
export default DashboardLayout;