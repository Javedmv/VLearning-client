import React from "react";
import Navbar from '../../components/home/Navbar';
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";


const AboutUs: React.FC = () => {
    const {user } = useSelector((state: RootState) => state.user);

   return (
    <>
        <Navbar  User={user}/>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
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
    </>
  );
};

export default AboutUs;
