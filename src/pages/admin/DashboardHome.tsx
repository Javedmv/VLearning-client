import React, { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import { Users, BookOpen, DollarSign, GraduationCap } from 'lucide-react';
import { commonRequest, URL } from '../../common/api';
import toast from 'react-hot-toast';
import { config } from '../../common/configurations';
import { Link } from 'react-router-dom';

interface DashboardData {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  totalEnrollments: number;
}

const DashboardHome: React.FC = () => {
  const [earnings, setEarnings] = useState<any>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalStudents: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalEnrollments: 0
  });
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [enrollments, setEnrollments] = useState<any>([]);
  const fetchEarnings = async () => {
    try {
      const response = await commonRequest("GET", `${URL}/payment/earnings?role="admin"`);
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      setEarnings(response.data);
      const total = response.data.reduce((acc: number, transaction: any) => acc + transaction.adminEarnings, 0);
      setTotalEarnings(total);
    } catch (error) {
      toast.error("Failed to fetch earnings");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await commonRequest("GET", `${URL}/chat/admin-dashboard`, {}, config);
      if (!response.success) {
        toast.error(response.message);
        return;
      }
      
      const data = response.data;
      setDashboardData({
        totalStudents: data.studentCount || 0,
        totalCourses: data.courseCount || 0,
        totalInstructors: data.instructorCount || 0,
        totalEnrollments: data.enrollmentData.length || 0
      });
      setEnrollments(data.enrollmentData);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    }
  };

  useEffect(() => {
    fetchEarnings();
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Students',
      value: dashboardData.totalStudents.toString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Courses',
      value: dashboardData.totalCourses.toString(),
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Instructors',
      value: dashboardData.totalInstructors.toString(),
      icon: GraduationCap,
      color: 'bg-orange-500',
    },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-lg text-gray-600">Welcome back, Admin User</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <StatsCard 
            key={stat.title} 
            {...stat} 
            change="" 
            isPositive={true}
          />
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Link to={"/admin/transactions"} state={{ transactions: earnings }} className="text-sm text-gray-500 hover:underline">Show More</Link>
          </div>
          <div className="space-y-4">
            {earnings.slice(0, 5).map((earning: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Received</p>
                    <p className="text-xs text-gray-500">
                      {new Date(earning.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  ₹{earning.adminEarnings.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Enrollments</h2>
            <Link to={"/enrollments"} className="text-sm text-gray-500 hover:underline">Show More</Link>
          </div>
          <div className="space-y-4">
            {dashboardData.totalEnrollments > 0 ? (
              <div className="space-y-2">
                {enrollments.map((enrollment: any) => (
                  <div key={enrollment._id} className="text-center p-4">
                    <p className="text-sm font-medium text-gray-700">
                      <strong>{enrollment.userId.username}</strong> joined in <strong>{enrollment.courseId.basicDetails.title}</strong>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No recent enrollments</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;