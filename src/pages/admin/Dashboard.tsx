import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderAdmin from "./HeaderAdmin"
import Sidebar from './Sidebar';

interface DashboardProps {
  user:any
}

const Dashboard:React.FC<DashboardProps> = ({user}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin user={user} />        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ user }}/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;