import React, { useEffect, useState } from 'react';
import { User, Lock, Bell } from 'lucide-react';
import { URL, commonRequest } from '../../common/api';
import { config } from '../../common/configurations';
import { FormEvent } from 'react';
import toast from 'react-hot-toast';

interface Admin {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profile: {
    dob: string;
    avatar: string;
  };
}

const Settings:React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [admin, setAdmin] = useState<Partial<Admin>>({});



  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const result = await commonRequest("GET",`${URL}/auth/admin-profile`, null ,config);
        setAdmin(result.data)
      } catch (error) {
        console.error("Failed to fetch students: in ADMIN/Settings", error);
      }
    }
    fetchAdmin()
  },[])


  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
    },
    {
      id: 'security',
      title: 'Security',
      icon: Lock,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
    }
  ];

  if(!admin){
    return <div className="text-center">Loading...</div>;
  }

  const handleChangePassword = async (e: FormEvent) => {
    try {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
  
      const currentPassword = form.elements.namedItem('currentPassword') as HTMLInputElement;
      const newPassword = form.elements.namedItem('newPassword') as HTMLInputElement;
      const confirmPassword = form.elements.namedItem('confirmPassword') as HTMLInputElement;

      const data = {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value,
      };
  
      const response = await commonRequest("POST", `${URL}/auth/update-password`, data , config);
      if(!response.success){
        toast.error(response?.data?.message || response?.message)
      }
      currentPassword.value = "";
      newPassword.value = "";
      confirmPassword.value = "";
      toast.success(response?.message)
    } catch (error:any) {
      toast.error(error?.response?.data?.message || error?.message)
    }
  }


  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return  (
          <>
            <h2 className="text-lg font-semibold mb-5 underline">Admin Profile</h2>
          <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg border-2 border-gray-800 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-10 opacity:80">

          {/* Profile Details Section */}
          <div className="flex-grow space-y-8 w-full sm:w-1/2 p-5 border-2 border-black border-double">
            <div className="space-y-6">
              <div className="flex items-center">
                <label className="text-base font-bold text-gray-800 w-40">Username :</label>
                <p className="text-lg font-medium text-gray-800">{admin?.username}</p>
              </div>

              <div className="flex items-center">
                <label className="text-base font-bold text-gray-800 w-40">Email :</label>
                <p className="text-lg font-medium text-gray-800">{admin?.email}</p>
              </div>

              <div className="flex items-center">
                <label className="text-base font-bold text-gray-800 w-40">First Name :</label>
                <p className="text-lg font-medium text-gray-800">{admin?.firstName}</p>
              </div>

              <div className="flex items-center">
                <label className="text-base font-bold text-gray-800 w-40">Last Name :</label>
                <p className="text-lg font-medium text-gray-800">{admin?.lastName}</p>
              </div>
            </div>
          </div>


    
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            {admin?.profile?.avatar ? (
              <img
                src={admin?.profile?.avatar}
                alt={`${admin?.firstName} ${admin?.lastName}`}
                className="w-56 h-56 rounded-full shadow-lg object-cover border-4 border-gray-400 opacity-60"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center rounded-full bg-indigo-500 text-white text-3xl font-bold">
                {admin?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        </>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Security Settings</h2>
              <form
                onSubmit={(e) => handleChangePassword(e)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                {
                  label: 'Email Notifications',
                  description: 'Receive email updates about your account',
                  defaultChecked: true
                },
                {
                  label: 'Push Notifications',
                  description: 'Receive push notifications about new messages',
                  defaultChecked: true
                },
                {
                  label: 'Course Updates',
                  description: 'Get notified about course content updates',
                  defaultChecked: false
                },
                {
                  label: 'Marketing Updates',
                  description: 'Receive marketing and promotional emails',
                  defaultChecked: false
                }
              ].map((option) => (
                <div key={option.label} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={option.defaultChecked}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Changes
            </button>
          </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Settings tabs">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;