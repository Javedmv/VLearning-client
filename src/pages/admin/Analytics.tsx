import React from 'react';
import { BarChart2, TrendingUp, Users, DollarSign } from 'lucide-react';

const Analytics:React.FC = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,563.00',
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Students',
      value: '2,345',
      change: '+8.2%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Course Completion Rate',
      value: '84.5%',
      change: '+4.3%',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Average Rating',
      value: '4.8/5.0',
      change: '+0.4',
      icon: BarChart2,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Monitor your platform's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="h-80 flex items-end space-x-2">
            {[65, 45, 75, 55, 85, 70, 60].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Courses</h2>
          <div className="space-y-4">
            {[
              { name: 'Web Development', students: 789, revenue: 15234, progress: 85 },
              { name: 'Data Science', students: 645, revenue: 12456, progress: 75 },
              { name: 'UI/UX Design', students: 542, revenue: 9876, progress: 65 },
              { name: 'Machine Learning', students: 456, revenue: 8765, progress: 60 }
            ].map((course, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{course.name}</h3>
                    <span className="text-sm text-gray-500">
                      ${course.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {course.students} students
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;