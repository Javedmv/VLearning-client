import React, { useState } from 'react';

// Define interface for component props
interface PasswordResetModalProps {
  email: string;
  onClose: () => void;
  onSubmit: (password: string, email:string) => void;
}

// Define interface for form errors
interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ email, onClose, onSubmit }) => {
  // State with explicit typing
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validatePassword = (): boolean => {
    const newErrors: FormErrors = {};

    // Password validation rules
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    // TODO: UNCOMMENT IT THE TEST FOR PASSWORD
    //  else if (!/[A-Z]/.test(newPassword)) {
    //   newErrors.newPassword = 'Password must contain at least one uppercase letter';
    // } else if (!/[a-z]/.test(newPassword)) {
    //   newErrors.newPassword = 'Password must contain at least one lowercase letter';
    // } else if (!/\d/.test(newPassword)) {
    //   newErrors.newPassword = 'Password must contain at least one number';
    // } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
    //   newErrors.newPassword = 'Password must contain at least one special character';
    // }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validatePassword()) {
      onSubmit(newPassword,email);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">
          Set New Password for {email}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="newPassword" 
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetModal;