// PaymentSuccess.tsx
import React from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { commonRequest, URL } from "../../../common/api";
import { config } from "../../../common/configurations";

const PaymentSuccess: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const {courseId} = useParams<{courseId: any}>();
  const navigate = useNavigate()
  const courseIds = courseId.split("=")[1];

  function handleContinue () {
    try {
        navigate(`/details/${courseIds}`)
    } catch (error) {
        
    }
  }
  
  (async (userId: string, courseId: string | undefined) => {
    try {
      console.log(userId,courseId, "in the handleEnroll")
      const res = await commonRequest('POST', `${URL}/course/enroll-user`, { userId, courseId }, config);
      return res;
    } catch (error) {
      console.log(error);
    }
  })(user?._id, courseIds);

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-green-600">Payment Successful</h2>
      <p className="mt-4 text-gray-700">
        Thank you, <span className="font-bold">{user?.username ?? "name"}</span>! Your payment has been processed successfully.
      </p>
      <button onClick={() => handleContinue()} className="mt-2 px-6 py-3 bg-fuchsia-700 text-white font-semibold rounded-lg shadow-md hover:bg-fuchsia-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-opacity-50">
        Continue
      </button>
    </div>
  );
};

export default PaymentSuccess;
