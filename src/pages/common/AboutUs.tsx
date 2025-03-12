import React from "react";
import { Link } from "react-router-dom";

interface AboutUsProps {
  backUrl?: string;
}

const AboutUs: React.FC<AboutUsProps> = ({ backUrl = "/" }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {backUrl && (
        <div className="mb-4">
          <Link 
            to={backUrl} 
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </Link>
        </div>
      )}
      
      <h1 className="text-3xl font-bold text-center">About VLearning</h1>
      <p className="text-lg text-gray-700 text-center">
        VLearning is a cutting-edge e-learning platform designed to empower learners with high-quality, interactive, and engaging courses.
      </p>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p className="text-gray-600">
          At VLearning, our mission is to make education accessible to everyone, everywhere. We provide a seamless learning experience through advanced technology and user-friendly design.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Why Choose Us?</h2>
        <ul className="list-disc list-inside text-gray-600">
          <li>Interactive video lessons with progress tracking</li>
          <li>Personalized learning paths and recommendations</li>
          <li>Support for multiple devices, including kiosks</li>
          <li>Seamless payment integration with Stripe</li>
          <li>Real-time lesson tracking and history</li>
        </ul>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">Join us and start your learning journey today!</p>
      </div>
    </div>
  );
};

export default AboutUs;
