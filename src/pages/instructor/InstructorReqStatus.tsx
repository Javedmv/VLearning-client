import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, UserCog } from 'lucide-react';
import { AppDispatch, RootState } from '../../redux/store';
import { useDispatch, useSelector } from 'react-redux';
import ProfileFormInstructor from '../../components/instructor/ProfileFormInstructor';
import Modal from '../../components/common/Modal';
import trimValuesToFormData from '../../common/trimValues';
import toast from 'react-hot-toast';
import { reapplyInstructor } from '../../redux/actions/user/userAction';

interface StatusCardProps {
  status: 'requested' | 'approved' | 'rejected';
}

interface FormValues {
  profession?: string;
  profileDescription?: string;
  cv?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  const statusConfig = {
    requested: {
      icon: Clock,
      title: 'Request Pending',
      description: 'Your instructor request is currently under review',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    approved: {
      icon: CheckCircle2,
      title: 'Request Approved',
      description: 'Your instructor request has been approved',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    rejected: {
      icon: XCircle,
      title: 'Request Rejected',
      description: 'Your instructor request has been rejected',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`p-6 ${config.bgColor} border ${config.borderColor} rounded-lg shadow-sm`}>
      <div className="flex items-center space-x-4">
        <Icon className={`w-8 h-8 ${config.color}`} />
        <div>
          <h2 className={`text-xl font-semibold ${config.color}`}>{config.title}</h2>
          <p className="text-gray-600 mt-1">{config.description}</p>
        </div>
      </div>
    </div>
  );
};

const InstructorRequestStatus: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser((prevUser: any) => ({
      ...prevUser,
      ...user,
    }));
  }, [user]);

  const handleReapplySubmit = async (values: FormValues) => {
    try {
      const userCredentials = trimValuesToFormData(values);
      const result = await dispatch(reapplyInstructor(userCredentials));
      if (result.meta.requestStatus === 'fulfilled') {
        setCurrentUser((prevUser: any) => ({
          ...prevUser,
          ...result.payload,
        }));
        toast.success('Application completed successfully.');
      } else {
        toast.error('Application failed. Please try again.');
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <UserCog className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Instructor Application Status</h1>
            <p className="mt-2 text-gray-600">Track the status of your instructor application</p>
          </div>

          <div className="space-y-8">
            {currentUser?.isVerified && (
              <StatusCard status={currentUser.isVerified as 'requested' | 'approved' | 'rejected'} />
            )}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 relative">
              {currentUser?.isVerified === 'rejected' && (
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Reapply
                  </button>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Username</label>
                    <p className="mt-1 text-gray-900">
                      {currentUser?.username
                        ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)
                        : ''}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1 text-gray-900">{currentUser?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Profession</label>
                    <p className="mt-1 text-gray-900">{currentUser?.profession}</p>
                  </div>
                </div>
                {currentUser?.profileDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Additional Notes</label>
                    <p className="mt-1 text-gray-900 break-words">{currentUser.profileDescription}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-blue-600" />
                  Wait for admin review of your application
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle2 className="w-5 h-5 mr-3 text-blue-600" />
                  Complete profile setup once approved
                </li>
                <li className="flex items-center text-gray-600">
                  <UserCog className="w-5 h-5 mr-3 text-blue-600" />
                  Set up your teaching preferences
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Complete Your Profile">
        <ProfileFormInstructor onSubmit={handleReapplySubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default InstructorRequestStatus;