import React, {useEffect} from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from "react-router-dom";
import GoogleIcon from "../../assets/icons8-google.svg";
import LoginIcon from "../../assets/loginImg.jpeg";
import { useDispatch, useSelector  } from "react-redux";
import toast from "react-hot-toast";
import { loginUser } from "../../redux/actions/user/userAction";
import { AppDispatch, RootState  } from "../../redux/store";
import { updateError } from "../../redux/reducers/userSlice";

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
  
  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: LoginFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      const res: any = await dispatch(loginUser(values));
      if (res.payload?.success) {
        toast.success("Login successful");
        // navigate("/");
      }
      // else {
      //   // Handle API error message
      //   const errorMessage = res?.payload || "Login failed. Please try again.";
      // toast.error(errorMessage);
      // }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
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
              {({ isSubmitting }) => (
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
                    {/* <label className="inline-flex items-center text-gray-600 text-sm">
                      <Field type="checkbox" name="rememberMe" className="mr-2" />
                      Remember me
                    </label> */}
                    <a href="#" className="text-sm text-gray-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-fuchsia-700 font-semibold text-white py-2 rounded hover:bg-fuchsia-900 transition"
                  >
                    {isSubmitting ? 'Logging in...' : 'Login'}
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
    </div>
  );
};

export default Login;

