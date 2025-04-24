import React from 'react';
import { 
  ArrowDownUp, 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface Transaction {
  adminEarnings: number;
  amount: number;
  courseId: {
    _id: string;
    students: any[]; 
    basicDetails: any;
  };
  createdAt: string;
  customerEmail: string;
  instructorEarnings: number;
  instructorId: string;
  paymentIntentId: string;
  receiptUrl: string;
  status: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  _id: string;
}

const Transactions: React.FC = () => {
    const { state } = useLocation();
    const { transactions } = state as { transactions: Transaction[] };
    console.log(transactions);
    
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Transaction Dashboard</h1>
        
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> */}
          {/* Recent Activity */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <p className="text-gray-600">Last transaction: 2 hours ago</p>
          </div> */}

          {/* Total Balance */}
          {/* <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Total Balance</h2>
            </div>
            <p className="text-2xl font-bold text-gray-900">$12,450.00</p>
          </div> */}
        {/* </div> */}

        {/* Latest Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <ArrowDownUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">Latest Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600">Course</th>
                  <th className="text-left py-3 px-4 text-gray-600">Earnings</th>
                  <th className="text-left py-3 px-4 text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-gray-600">Recipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: Transaction) => (
                  <tr key={transaction._id} className="border-b border-gray-100">
                    <td className="py-3 px-4">{transaction.courseId.basicDetails.title}</td>
                    <td className={`py-3 px-4 ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{transaction.adminEarnings}
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const date = new Date(transaction.createdAt);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
                        const year = date.getFullYear();
                        return `${day}/${month}/${year}`;
                      })()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4"><a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transactions;