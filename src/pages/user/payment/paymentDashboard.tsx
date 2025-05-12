import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { RootState } from "../../../redux/store";

interface PaymentDashboardProps {
  user: any;
}

const PaymentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);

  if (!user) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-600 mt-4">
          You must be logged in to access the payment dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 p-6 rounded-lg shadow-lg bg-white">
      <h1 className="text-2xl font-bold text-center mb-4">Payment Details</h1>
      <p className="text-center text-gray-600 mb-6">
        Welcome, <span className="font-semibold">{user?.username ?? "Guest"}</span>! Here is the status of your payment.
      </p>
      <hr className="mb-6" />
      <div className="mt-6">
        <Outlet context={{ user }} />
      </div>
    </div>
  );
};

export default PaymentDashboard;
