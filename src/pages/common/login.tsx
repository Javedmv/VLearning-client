import React from "react";
import GoogleIcon from "../../assets/icons8-google.svg";
import LoginIcon from "../../assets/loginImg.jpeg";

const Login: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen">
      {/* Left Section */}
      <div className="flex-1 bg-fuchsia-900 text-white flex flex-col items-center justify-center p-4 md:p-8">
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

            <form>
              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                />
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex justify-between items-center mb-4">
                <label className="inline-flex items-center text-gray-600 text-sm">
                  <input type="checkbox" className="mr-2" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-gray-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-fuchsia-700 font-semibold text-white py-2 rounded hover:bg-fuchsia-900 transition"
              >
                Login
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
                Don’t have an account?{" "}
                <a
                  href="#"
                  className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline"
                >
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
