import React, { useState, useRef, useEffect } from "react";
import GoogleIcon from "../../assets/icons8-google.svg"
import Icon from "../../assets/signupIcon.avif"
import { Link } from "react-router-dom";

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const validateUsername = (value: string) => {
    if (!value.trim()) return 'Username is required';
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateRole = (value: string) => {
    if (!value) return 'Please select a role';
    return '';
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
    const roleError = validateRole(role);

    if (usernameError) errors.username = usernameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    if (roleError) errors.role = roleError;

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowOtpModal(true);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError(null);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
    } else {
      // Here you would typically send the OTP to your server for verification
      console.log('OTP submitted:', otpString);
      console.log('User signed up:', { username, email, password, role });
      setShowOtpModal(false);
      // Reset form fields after successful signup
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('');
    }
  };

  const resetOTP = () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setTimer(120);
    setIsExpired(false);
    inputRefs.current[0]?.focus();
  };

  useEffect(() => {
    if (showOtpModal) {
      inputRefs.current[0]?.focus();
      resetOTP();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [showOtpModal]);

  useEffect(() => {
    if (showOtpModal && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsExpired(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showOtpModal, timer]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setFormErrors(prev => ({ ...prev, username: validateUsername(value) }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setFormErrors(prev => ({ ...prev, email: validateEmail(value) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setFormErrors(prev => ({ 
      ...prev, 
      password: validatePassword(value),
      confirmPassword: validateConfirmPassword(value, confirmPassword)
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setFormErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(password, value) }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setRole(value);
    setFormErrors(prev => ({ ...prev, role: validateRole(value) }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left Section */}
      <div className="flex-1 bg-pink-100 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-sm md:max-w-md px-4 md:px-10 flex justify-center items-center">
          <div className="w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 md:mb-12 text-center hover:text-fuchsia-950">
              VLearning<span className="text-fuchsia-900">.</span>
            </h1>

            <form onSubmit={handleSignup}>
              {/* Username */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder=" "
                  value={username}
                  onChange={handleUsernameChange}
                  className={`w-full px-4 py-2 border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900`}
                />
                <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                  Username
                </label>
                {formErrors.username && <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>}
              </div>

              {/* Email Field */}
              <div className="relative mb-6">
                <input
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900`}
                />
                <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                  Email
                </label>
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              {/* Password Field */}
              <div className="relative mb-6">
                <input
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900`}
                />
                <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                  Password
                </label>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative mb-6">
                <input
                  type="password"
                  placeholder=" "
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-2 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900`}
                />
                <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                  Confirm Password
                </label>
                {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
              </div>

              {/* Role Selection Dropdown */}
              <div className="relative mb-10">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className={`w-full px-4 py-2 border ${formErrors.role ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900`}
                >
                  <option value="" disabled>Select Role</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                </select>
                <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                  Role
                </label>
                {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                className="w-full bg-fuchsia-700 font-semibold text-white py-2 rounded hover:bg-fuchsia-900 transition"
              >
                Signup
              </button>

              {/* Sign In with Google */}
              <div className="flex justify-center mt-5">
                <a
                  href="#"
                  className="bg-gray-400 rounded-full py-2 px-6 text-center text-white font-semibold hover:bg-gray-500 hover:underline flex items-center justify-center"
                >
                  <span className="mr-2">
                    <img
                      src={GoogleIcon}
                      alt="Google icon"
                      className="w-5 h-5 md:w-6 md:h-6 inline-block"
                    />
                  </span>
                  Sign in with Google
                </a>
              </div>

              <p className="mt-3 text-center text-gray-600">
                Already Registered?{" "}
                <Link
                  to="/login"
                  className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="hidden sm:flex-1 sm:bg-fuchsia-900 sm:text-white sm:flex sm:flex-col sm:items-center sm:justify-end sm:p-4 sm:md:p-8 sm:bg-cover sm:bg-center sm:border sm:border-fuchsia-900"
        style={{
          backgroundImage: `url(${Icon})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center bottom',
          borderWidth: '3rem',
        }}
      >
        <p className="text-lg md:text-2xl text-fuchsia-900 font-semibold px-4 text-center">
          "Learn From The Wise."
        </p>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-center text-fuchsia-900">Enter OTP</h2>
            <p className="text-center mb-4 text-gray-600">
              Please enter the 6-digit code sent to your email.
            </p>
            <div className="text-center text-sm font-medium mb-4">
              {isExpired ? (
                <span className="text-red-500">OTP Expired</span>
              ) : (
                <span>Time remaining: {formatTime(timer)}</span>
              )}
            </div>
            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-12 text-center text-2xl border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                  disabled={isExpired}
                />
              ))}
            </div>
            {otpError && <p className="text-red-500 text-center mb-4">{otpError}</p>}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              {isExpired ? (
                <button
                  onClick={resetOTP}
                  className="px-4 py-2 bg-fuchsia-700 text-white rounded hover:bg-fuchsia-800 transition"
                >
                  Resend OTP
                </button>
              ) : (
                <button
                  onClick={handleOtpSubmit}
                  disabled={isExpired}
                  className="px-4 py-2 bg-fuchsia-700 text-white rounded hover:bg-fuchsia-800 transition disabled:opacity-50"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;