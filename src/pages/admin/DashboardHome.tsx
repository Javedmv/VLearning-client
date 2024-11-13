import React from 'react';
import StatsCard from './StatsCard';
import { Users, BookOpen, DollarSign, GraduationCap } from 'lucide-react';

const DashboardHome:React.FC = () => {
  const stats = [
    {
      title: 'Total Students',
      value: '12,345',
      change: '+12.5%',
      isPositive: true,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Courses',
      value: '245',
      change: '+8.2%',
      isPositive: true,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: '$52,389',
      change: '+23.1%',
      isPositive: true,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Instructors',
      value: '48',
      change: '-2.4%',
      isPositive: false,
      icon: GraduationCap,
      color: 'bg-orange-500',
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back, Admin User</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">New student enrolled</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Popular Courses</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium">Web Development Bootcamp</p>
                    <p className="text-xs text-gray-500">John Doe • 2,345 students</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">$99</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;