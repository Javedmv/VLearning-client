import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../../components/home/Navbar';

interface DashboardProps {
    user:any
  }

const DashboardLayout: React.FC <DashboardProps>= ({user}) => {
  return (
    <>
    <div className="flex flex-col md:flex-row min-h-screen bg-pink-200">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet context={user} />
      </div>
    </div>
    </>
  );
};

export default DashboardLayout;