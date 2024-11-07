import React from "react";
import GoogleIcon from "../../assets/icons8-google.svg"
import Icon from "../../assets/signupIcon.avif"

const Signup:React.FC = () => {
    return (
        <div className="flex flex-col md:flex-row h-screen w-screen">
          {/* Left Section */}
          <div className="flex-1 bg-pink-100 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-sm md:max-w-md px-4 md:px-10 flex justify-center items-center">
              <div className="w-full">
                <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 md:mb-12 text-center hover:text-fuchsia-950">
                  VLearning<span className="text-fuchsia-900">.</span>
                </h1>
    
                <form>
                  {/* Username */}
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                      Username
                    </label>
                  </div>

                  {/* Email Field */}
                  <div className="relative mb-6">
                    <input
                      type="email"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                      Email
                    </label>
                  </div>

                  {/* Password Field */}
                  <div className="relative mb-6">
                    <input
                      type="password"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                      Password
                    </label>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative mb-6">
                    <input
                      type="password"
                      placeholder=" "
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    />
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                      Confirm Password
                    </label>
                  </div>

                  {/* Role Selection Dropdown */}
                  <div className="relative mb-10">
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-fuchsia-900"
                    >
                      <option value="" disabled selected>
                        Select Role
                      </option>
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                    <label className="absolute left-4 top-0 px-1 text-gray-700 text-md transform -translate-y-1/2 bg-white transition-all duration-200 focus-within:text-fuchsia-900">
                      Role
                    </label>
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
                    <a
                      href="#"
                      className="text-fuchsia-700 font-semibold hover:text-fuchsia-900 hover:underline"
                    >
                      Login
                    </a>
                  </p>
                </form>
              </div>
            </div>
          </div>
    
          {/* Right Section */}
          <div
            className="flex-1 bg-fuchsia-900 text-white flex flex-col items-center justify-end p-4 md:p-8 bg-cover bg-center border border-fuchsia-900"
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
        </div>
      );
}
export default Signup