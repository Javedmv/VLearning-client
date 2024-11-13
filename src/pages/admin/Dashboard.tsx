import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HeaderAdmin from "./HeaderAdmin"
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import Students from './Students';
import Instructors from './Instructors';
import Courses from './Courses';
import Messages from './Messages';
import Schedule from './Schedule';
import Analytics from './Analytics';
import Settings from './Settings';

const Dashboard:React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin />        
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="students" element={<Students />} />
            <Route path="instructors" element={<Instructors />} />
            <Route path="courses" element={<Courses />} />
            <Route path="messages" element={<Messages />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logout" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;