import React, { useEffect, useState } from 'react';

import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';

const EarningsPage: React.FC = () => {
    const [earnings, setEarnings] = useState<any[]>([]);
    const [totalEarnings, setTotalEarnings] = useState<number>(0);

    const fetchEarnings = async () => {
        try {
            console.log("start in earnings page")
            const response = await commonRequest("GET", `${URL}/payment/earnings?role="instructor"`, {}, config);
            if (!response.success) {
                toast.error(response.message);
                return;
            }
            setEarnings(response.data);

            // Calculate total earnings
            const total = response.data.reduce((acc: number, transaction: any) => acc + transaction.instructorEarnings, 0);
            setTotalEarnings(total);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        }
    };

    useEffect(() => {
        fetchEarnings();
    }, []);
    

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl sm:px-4 lg:px-4  sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Instructor Earnings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl sm:px-4 lg:px-4 sm:py-4">
        {/* Total Earnings Display */}
        <div className="bg-white rounded-xl shadow-sm sm:p-6 mb-1 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 sm:mb-6">Total Earnings</h2>
          <p className="text-2xl font-bold text-gray-900">₹ {totalEarnings.toFixed(2)}</p>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Course</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((transaction, index) => {
                    const formattedDate = new Date(transaction.createdAt).toLocaleDateString();
                    return (
                      <tr 
                        key={transaction._id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-600">{formattedDate}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{transaction.courseId.basicDetails.title}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{transaction.userId.username}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900 ">{transaction.status}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900 text-right">{transaction.amount}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-gray-900 text-right">{transaction.instructorEarnings}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EarningsPage;