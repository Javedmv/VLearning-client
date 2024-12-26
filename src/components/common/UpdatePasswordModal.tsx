import React, { FormEvent, useState } from "react";
import { X } from 'lucide-react';
import { commonRequest, URL } from "../../common/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { config } from "../../common/configurations";
import toast from "react-hot-toast";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose }) => {
    const {user} = useSelector((state:RootState) => state.user);
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        // Password strength check (example)
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            // TODO: Implement actual password change logic
            // For example:
            // const response = await dispatch(changePasswordAction({
            //     currentPassword,
            //     newPassword
            // }));
            const response = await commonRequest("POST",`${URL}/auth/update/password`,{currentPassword, newPassword,confirmPassword},config);
            if(response?.success){
                toast.success(response?.message)
            }
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            onClose();
        } catch (error: any) {
            setError(error?.response?.data?.message || error?.message || "Failed to change password");
            console.error(error);
        }    
    }

    const handleCancel = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        
        onClose();
    }

    // If modal is not open, return null
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
            <div className="relative w-full max-w-md mx-auto my-6">
                <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                    {/* Modal Header */}
                    <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                        <h3 className="text-3xl font-semibold">
                            Change Password
                        </h3>
                        <button
                            className="float-right p-1 ml-auto bg-transparent border-0 text-black opacity-5 text-3xl leading-none font-semibold outline-none focus:outline-none"
                            onClick={onClose}
                        >
                            <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                        </button>
                    </div>
                    
                    {/* Modal Body */}
                    <div className="relative p-6 flex-auto">
                        <form
                            onSubmit={handleChangePassword}
                            className="space-y-4"
                        >
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdatePasswordModal;