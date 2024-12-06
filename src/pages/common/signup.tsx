import React, { useState, useEffect, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import GoogleIcon from "../../assets/icons8-google.svg";
import Icon from "../../assets/signupIcon.avif";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { signUpUser } from "../../redux/actions/user/userAction";
import { commonRequest } from "../../common/api";
import { config } from "../../common/configurations";
import { URL } from "../../common/api";
import OtpModal from '../../components/user/otpModal';
import toast from "react-hot-toast";

// interface - form values
interface SignupFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  otp: string;
}

// validation schema Yup
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .required('Please select a role')
});

const Signup: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [lastSubmittedValues, setLastSubmittedValues] = useState<SignupFormValues | null>(null);

  const {user ,error} = useSelector((state:RootState) => state.user)

  const initialValues: SignupFormValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    otp: '',
  };

  const navigate = useNavigate();

  useEffect(() => {
    if(user){
      navigate('/user-form')
      toast.success("Signup successful! Redirecting...");
    }


    // need to clearout the error
    // return () => {
    //   dispatch()
    // }
  },[user])

  
  const handleSubmit = async (values: SignupFormValues) => {
    if(error){
      toast.error(error)
      return;
    }
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setTimer(30);
    setIsExpired(false);
    
    const formData = new FormData();
    setLastSubmittedValues(values);

    Object.entries(values).forEach(([key, value]) => {
      if (typeof value === 'string') {
        value = value.trim();
      }
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      // sending to backend for email
      await dispatch(signUpUser(formData));
      toast.success("OTP sent successfully. Please check your email.");
      setShowOtpModal(true);
    } catch (error:any) {
      toast.error(error?.message || "An error occurred during signup.")
      console.log("Signup error-----------------------:", error);
    }
  };

  const handleOtpSubmit = async (otpString: string) => {
    if (otpString.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      toast.error("Invalid OTP. Please enter a 6-digit OTP.");
    } else {
      if (lastSubmittedValues) {
        await handleSubmit({...lastSubmittedValues, otp: otpString});
        toast.success("Account verified successfully!");
      }
      setShowOtpModal(false);
      resetForm();
    }
  };

  const resetForm = () => {
    initialValues.username = '';
    initialValues.email = '';
    initialValues.password = '';
    initialValues.confirmPassword = '';
    initialValues.role = '';
  };

  const resetOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setTimer(30);
    setIsExpired(false);

    try {
      if (lastSubmittedValues) {
        await commonRequest("POST", `${URL}/auth/resend-otp`, lastSubmittedValues, config);
        toast.success("OTP resent successfully!");
      }
    } catch (error:any) {
      toast.error(error?.message || "Failed to resend OTP. Please try again.");  
    }
  };

  // commented it becus sending mail 2 times

  // useEffect(() => {
  //   if (showOtpModal) {
  //     resetOTP();
  //   } else {
  //     if (timerRef.current) {
  //       clearInterval(timerRef.current);
  //     }
  //   }
  // }, [showOtpModal]);

  useEffect(() => {
    if (showOtpModal && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsExpired(true);
      toast.error("OTP expired. Please resend a new OTP.");
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

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left Section */}
      <div className="flex-1 bg-pink-100 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-sm md:max-w-md px-4 md:px-10 flex justify-center items-center">
          <div className="w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 md:mb-12 text-center hover:text-fuchsia-950">
              VLearning<span className="text-fuchsia-900">.</span>
            </h1>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}>
              {({ isSubmitting }) => (
                <Form>
                  {/* Username Field */}
                  <div className="relative mb-6">
                    <Field
                      type="text"
                      name="username"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white">
                      Username
                    </label>
                    <ErrorMessage name="username" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Email Field */}
                  <div className="relative mb-6">
                    <Field
                      type="email"
                      name="email"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white">
                      Email
                    </label>
                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Password Field */}
                  <div className="relative mb-6">
                    <Field
                      type="password"
                      name="password"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white">
                      Password
                    </label>
                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="relative mb-6">
                    <Field
                      type="password"
                      name="confirmPassword"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white">
                      Confirm Password
                    </label>
                    <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Role Selection */}
                  <div className="relative mb-10">
                    <Field
                      as="select"
                      name="role"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    >
                      <option value="">Select Role</option>
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </Field>
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white">
                      Role
                    </label>
                    <ErrorMessage name="role" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-fuchsia-700 font-semibold text-white py-2 rounded hover:bg-fuchsia-900 transition"
                  >
                    {isSubmitting ? 'Signing up...' : 'Signup'}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Sign In with Google */}
            <div className="flex justify-center mt-5">
              <Link to="/login"
                className="bg-gray-400 rounded-full py-2 px-6 text-center text-white font-semibold hover:bg-gray-500 hover:underline flex items-center justify-center">
                <span className="mr-2">
                  <img
                    src={GoogleIcon}
                    alt="Google icon"
                    className="w-5 h-5 md:w-6 md:h-6 inline-block"
                  />
                </span>
                Sign in with Google
              </Link>
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

      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={handleOtpSubmit}
        onResend={resetOTP}
        otp={otp}
        setOtp={setOtp}
        otpError={otpError}
        timer={timer}
        isExpired={isExpired}
      />
    </div>
  );
};

export default Signup;