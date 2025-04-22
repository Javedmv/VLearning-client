import React, {useEffect, useRef, useState} from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from "react-router-dom";
import LoginIcon from "../../assets/loginImg.jpeg";
import { useDispatch, useSelector  } from "react-redux";
import toast from "react-hot-toast";
import { googleLoginUser, loginUser } from "../../redux/actions/user/userAction";
import { AppDispatch, RootState  } from "../../redux/store";
import { updateError } from "../../redux/reducers/userSlice";
import { commonRequest, URL } from "../../common/api";
import { config } from "../../common/configurations";
import OtpModal from "../../components/user/otpModal";
import PasswordResetModal from "../../components/user/PasswordResetModal";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

interface LoginFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().trim().email('Invalid email').required('Email is required'),
  password: Yup.string().trim().required('Password is required'),
});

const Login: React.FC = () => {
  const {user, error } = useSelector((state:RootState) => state.user)
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [currentEmail, setCurrentEmail] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  useEffect(() => {
    if(user){
      navigate("/")
    }
    
    return () => {
      dispatch(updateError(""))
    }
  },[user])

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    return () => {
      dispatch(updateError(""))
    }
  }, [error]);
  
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

  const handleSubmit = async (values: LoginFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const res: any = await dispatch(loginUser(values));
      if (res.payload?.success) {
        toast.success("Login successful");
      }
     
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetOTP = () => {
    setOtp(['', '', '', '', '', '']);
    setTimer(30);
    setIsExpired(false);
    setOtpError(null);
  }

  const handleForgotPassword = async (formikProps: any) => {
    try {
      const email = formikProps.values.email;
      setCurrentEmail(email);

      if (email) {
        const response =await commonRequest("POST",`${URL}/auth/forgot-password`,{email}, config);
        if(response.success){
          toast.success(response?.message || "OTP has sent successfully")
          // TODO: Implement RESENT OTP in of forgotPassword show OTP modal
          setShowOtpModal(true);
          resetOTP();
        }
      } else {
        toast.error("Please enter the Email in the field!!!")
      }
    } catch (error: any) {
        toast.error(error?.response?.data?.message || "An error occurred while processing forgot password")
    }
  }

  const handleOtpSubmit = async (otpString: string, email:string) => {
    try {
      if (otpString.length !== 6) {
        setOtpError('Please enter a 6-digit OTP');
        toast.error("Invalid OTP. Please enter a 6-digit OTP.");
        return;
      }
      const response = await commonRequest("POST",`${URL}/auth/forgot-password/otp-submit`, {otp:otpString, email}, config);
      if(response.success){
        setShowOtpModal(false);
        toast.success(response?.message || "Account verified successfully!");
        // TODO:Enter new Passowrd
        setIsPasswordModalOpen(true);

      }else{
        toast.error(response?.message || "An error occured in OTP verification")
      }
    } catch (error:any) { 
      toast.error(error?.response?.data?.message || "OTP verification failed");
    }
  }

  const handlePasswordReset = async(password:string ,email:string) => {
    try {
      console.log(password,"email in the reset" ,email)
      const response = await commonRequest("POST",`${URL}/auth/forgot-password/update-passoword`, {password, email}, config);
      if(response.success){
        toast.success(response?.message || "Password updated successfully!");
      }else{
        toast.error(error?.response?.data?.message || "password update failed");
      }
      setIsPasswordModalOpen(false);
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Reset Password failed, Please try again");
    }
  }

  // const handleResendOtp = async(){
  //   try {
  //     handleForgotPassword()
  //   } catch (error) {
      
  //   }
  // }

  const handleGoogleLogin = async (credential: string) => {
    try {
      // Decode JWT (Google ID Token)
      const decodeJWT = (token: string) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(jsonPayload);
      };
  
      const decoded = decodeJWT(credential);
      console.log("Decoded Google ID token payload before dispatch:", decoded);
  
      // Now dispatch
      await dispatch(googleLoginUser({ decoded }));
      toast.success("Google login successful");
      // navigate("/");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Google login failed");
    }
  };
  


  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left Section */}
      <div className="hidden sm:flex-1 sm:flex sm:bg-fuchsia-900 sm:text-white sm:flex-col sm:items-center sm:justify-center sm:p-4 sm:md:p-8">
        <div className="text-center">
          <img
            src={LoginIcon}
            alt="Student"
            className="w-74 h-74 md:w-64 md:h-64 rounded-e-full mx-auto mb-10 md:mb-10"
          />
          <p className="text-lg md:text-2xl font-semibold px-4 text-center">
            "Empower Minds, Transform Futures."
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-pink-100 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-sm md:max-w-md px-4 md:px-10 flex justify-center items-center">
          <div className="w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 md:mb-12 text-center hover:text-fuchsia-950">
              VLearning<span className="text-fuchsia-900">.</span>
            </h1>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {(formikProps) => (
                <Form>
                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Remember Me and Forgot Password */}
                  <div className="flex justify-end items-center mb-4">
                    <button 
                      type="button" 
                      className="text-sm text-gray-600 hover:underline" 
                      onClick={() => handleForgotPassword(formikProps)}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={formikProps.isSubmitting}
                    className="w-full bg-fuchsia-700 font-semibold text-white py-2 rounded hover:bg-fuchsia-900 transition"
                  >
                    {formikProps.isSubmitting ? 'Logging in...' : 'Login'}
                  </button>

                  {/* Sign In with Google */}
                  <div className="flex justify-center mt-5">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        const credential = credentialResponse.credential;
                        if (credential) {
                          console.log("Raw Google Credential JWT:", credential);
                          const decoded: any = jwtDecode(credential);
                          console.log("Decoded Google Credential:", decoded);
                          handleGoogleLogin(credential);
                        }
                      }}
                      onError={() => {
                        toast.error("Google login failed");
                      }}
                    />
                  </div>

                  <p className="mt-3 text-center text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    <>
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        onSubmit={(otpString) => handleOtpSubmit(otpString,currentEmail)} 
        onResend={resetOTP}
        otp={otp}
        setOtp={setOtp}
        otpError={otpError}
        timer={timer}
        isExpired={isExpired}
      />
      {isPasswordModalOpen && (
        <PasswordResetModal
          email={currentEmail}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordReset}
        />
      )}
    </>
    </div>
  );
};

export default Login;