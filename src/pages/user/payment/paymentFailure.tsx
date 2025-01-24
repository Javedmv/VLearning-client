// PaymentFailure.tsx
import React from "react";
import { useOutletContext, useParams } from "react-router-dom";


const PaymentFailure: React.FC = () => {
    const { user } = useOutletContext<{ user: any }>();
    const {courseId} = useParams<{courseId: any}>();
    console.log(courseId)

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold text-red-600">Payment Failed</h2>
      <p className="mt-4 text-gray-700">
        Sorry, <span className="font-bold">{user?.username ?? 'name'}</span>. There was an issue processing your payment. Please try
        again.
      </p>
      {/* <img
        src={
        typeof course?.basicDetails?.thumbnail === "string"
        ? course.basicDetails.thumbnail
        : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
        }
        alt={course?.basicDetails?.title}
        className="w-full h-full object-cover"
      />
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-semibold mb-2">{course?.basicDetails?.title}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-4">
                        {course?.basicDetails?.description}
                    </p>
            </div>
        </div> */}
    </div>
  );
};

export default PaymentFailure;
