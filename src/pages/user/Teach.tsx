import React, { useState, useEffect } from "react";
import { GraduationCap, AlertCircle, Users, Globe2, Award, Zap } from 'lucide-react';
import Modal from "../../components/common/Modal";
import ProfileFormInstructor from "../../components/instructor/ProfileFormInstructor";
import { AppDispatch, RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { teach } from "../../redux/actions/user/userAction";
import trimValuesToFormData from "../../common/trimValues";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/home/Navbar";

interface FormValues {
    profession?: string;
    profileDescription?: string;
    cv?: string;
}

const Teach: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
      if (user) {
          setCurrentUser(user);
      }
  }, [user]);

  useEffect(() => {
      if (currentUser?.isVerified === 'requested') {
          navigate('/instructor-req-stat', { replace: true });
      }
  }, [currentUser, navigate]);

  const handleReapplySubmit = async (data: FormValues) => {
      try {
          const userCredentials = trimValuesToFormData(data);
          const response = await dispatch(teach(userCredentials));
  
          if (response.meta.requestStatus === 'fulfilled') {
              toast.success('Application completed successfully.');
              if (response.payload) {
                  setCurrentUser(response.payload);
              }
          } else {
              toast.error('Application failed. Please try again.');
          }
      } catch (error) {
          console.error(error, 'Error in catch of reapply submit');
          toast.error('An unexpected error occurred. Please try again later.');
      } finally {
          setIsModalOpen(false);
      }
  };
  
    return (
    <>
      <Navbar User={user}/>
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4">
              <GraduationCap className="w-16 h-16 text-fuchsia-950" />
              <span className="text-4xl font-bold text-fuchsia-950">
                VLearning<span className="text-pink-600">.</span>
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 mt-3">
              Join as an Instructor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              VLearning is a premier online education platform connecting expert instructors with eager learners worldwide. 
              Shape the future of education while building your teaching career.
            </p>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Global Reach</h3>
              </div>
              <p className="text-gray-600">Connect with over 1 million students from 150+ countries and make a real impact on their learning journey.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Globe2 className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Flexible Teaching</h3>
              </div>
              <p className="text-gray-600">Create and deliver courses on your schedule. Our platform supports various teaching styles and content formats.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Earn & Grow</h3>
              </div>
              <p className="text-gray-600">Benefit from our competitive revenue sharing model and earn while doing what you love. Top instructors earn up to $100,000 annually.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold">Advanced Tools</h3>
              </div>
              <p className="text-gray-600">Access cutting-edge teaching tools, analytics, and support to create engaging content and track student progress.</p>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">1</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Professional Profile</h3>
                  <p className="text-gray-600">Complete profile with your professional background and expertise</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">2</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Curriculum Vitae</h3>
                  <p className="text-gray-600">Upload your CV in PDF or DOC format</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">3</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">Profile Description</h3>
                  <p className="text-gray-600">Write a compelling description of your teaching approach and expertise</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Important Notes Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>All fields marked with * are mandatory</li>
                  <li>CV must be in PDF, DOC, or DOCX format</li>
                  <li>Profile description should be professional and detailed</li>
                  <li>Applications are reviewed within 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>
    
          <div className="text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-fuchsia-800 hover:bg-fuchsia-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply Now
            </button>
          </div>
        </div>
  
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Complete Your Profile"
        >
            <ProfileFormInstructor
              onSubmit={handleReapplySubmit}
              onCancel={() => setIsModalOpen(false)}
            />
        </Modal>
      </div>
    </>
    );
}

export default Teach;