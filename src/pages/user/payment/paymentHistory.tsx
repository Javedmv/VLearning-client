import React, { useEffect, useState } from 'react';
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { commonRequest, URL } from '../../../common/api';
import { config } from '../../../common/configurations';
import toast from 'react-hot-toast';
import { Payment } from '../../../types/Payment';
import Navbar from '../../../components/home/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Meta } from '../../../types/Iothers';
import { stringifyMeta } from '../../../common/constants';
import Pagination from '../../../components/common/Pagination';

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useSelector((state: RootState) => state.user);
  const [meta,setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });

  // Fetch payment history
  const fetchPayments = async (currentMeta:Meta) => {
    try {
      const queryParams = new URLSearchParams(stringifyMeta(currentMeta)).toString();
      const res = await commonRequest('GET',`${URL}/payment/history?${queryParams}`, {}, config);

      if (!res.success) {
        toast.error(res.message || 'Failed to fetch payment history');
        return;
      }
      if (res?.success && res.data) {
        setPayments(res.data.payments);
        setMeta(res.data.meta);
      }
      
    } catch (error) {
      toast.error('Error fetching payment history');
      console.error('Payment History Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(meta);
  }, []);

  // Format Date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format Currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents
  };

  const handlePageChange = (page: number) => {
    const newMeta = {
      ...meta,
      page
    };
    setMeta(newMeta);
    fetchPayments(newMeta);
  }

  return (
    <>
      <Navbar User={user} />
      <div className="w-full max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Payment History</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-600">
            Loading payment history...
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-lg">No payment history found.</div>
        ) : (
          <div className="grid gap-6">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="bg-white shadow-lg rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center border-l-4 
                border-l-gray-300 hover:border-l-blue-500 transition-all"
              >
                {/* Date & Amount */}
                <div className="flex flex-col">
                  <span className="text-gray-600 text-sm">Date</span>
                  <span className="font-semibold text-gray-800">{formatDate(payment.createdAt)}</span>
                </div>

                <div className="flex flex-col text-center">
                  <span className="text-gray-600 text-sm">Amount</span>
                  <span className="font-semibold text-gray-800">
                  ₹{payment.amount}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                    ${payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {payment.status === 'succeeded' ? (
                      <CheckCircle className="w-5 h-5 mr-1 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-1 text-red-600" />
                    )}
                    {payment.status}
                  </span>
                </div>

                {/* Receipt */}
                <div className="flex flex-col items-end">
                  {payment.receiptUrl ? (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View Receipt
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">No receipt</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
         <Pagination
          currentPage={meta?.page}
          totalPages={meta?.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default PaymentHistory;
