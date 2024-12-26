import React from 'react';
import { Bell, DollarSign } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const notifications = [
    { id: 1, studentName: 'John Doe', courseName: 'Introduction to React' },
    { id: 2, studentName: 'Jane Smith', courseName: 'Advanced TypeScript' },
    { id: 3, studentName: 'Bob Johnson', courseName: 'Next.js Fundamentals' },
  ];

  return (
    <div className="p-6 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-fuchsia-900">Welcome, Instructor!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Courses', value: '5' },
          { title: 'Total Students', value: '120' },
          { title: 'Average Rating', value: '4.7' },
          { title: 'Revenue', value: '$15,750', icon: DollarSign },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-fuchsia-900 flex items-center">
                {item.icon && <item.icon className="mr-2" size={18} />}
                {item.title}
              </h2>
            </div>
            <div className="p-4">
              <p className="text-4xl font-bold text-fuchsia-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-fuchsia-900 flex items-center">
            <Bell className="mr-2" size={18} />
            Recent Enrollments
          </h2>
        </div>
        <div className="p-4">
          <ul className="space-y-2">
            {notifications.map((notification) => (
              <li key={notification.id} className="text-fuchsia-900">
                <strong>{notification.studentName}</strong> enrolled in <strong>{notification.courseName}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;