import React, { useState } from "react";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-pink-200 p-4 fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <span className="text-4xl font-bold text-fuchsia-950">
              VLearning<span className="text-pink-600">.</span>
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <a
              href="#"
              className="nav-link rounded-full py-1 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Home
            </a>
            <a
              href="#"
              className="nav-link rounded-full py-1 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Courses
            </a>
            <a
              href="#"
              className="nav-link rounded-full py-1 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Teach
            </a>
            <a
              href="#"
              className="nav-link rounded-full py-1 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="nav-link rounded-full py-1 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              About Us
            </a>
          </div>

          {/* Auth Buttons - Hidden when screen size reaches 769px */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="px-6 py-2 bg-fuchsia-700 text-white rounded-full hover:bg-fuchsia-900 transition duration-300 ease-in-out">
              Login
            </button>
            <button className="px-6 py-2 bg-white text-fuchsia-900 border-2 border-purple-600 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out">
              Signup
            </button>
          </div>

          {/* Mobile Menu Button - Shown when screen size is 769px or below */}
          <div className="lg:hidden flex items-center">
            <button onClick={toggleMenu} className="text-fuchsia-950 hover:text-fuchsia-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Displayed when menu is open */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Auth Buttons in Mobile Menu (smaller size) */}
            <div className="flex flex-col items-center space-y-4 mb-4">
              <button className="w-full px-4 py-1 bg-fuchsia-700 text-white rounded-full hover:bg-fuchsia-900 transition duration-300 ease-in-out text-sm">
                Login
              </button>
              <button className="w-full px-4 py-1 bg-white text-fuchsia-900 border-2 border-purple-600 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out text-sm">
                Signup
              </button>
            </div>

            {/* Navigation Links - Mobile */}
            <a
              href="#"
              className="block rounded-full py-2 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Home
            </a>
            <a
              href="#"
              className="block rounded-full py-2 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Courses
            </a>
            <a
              href="#"
              className="block rounded-full py-2 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Teach
            </a>
            <a
              href="#"
              className="block rounded-full py-2 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="block rounded-full py-2 px-4 hover:bg-fuchsia-900 hover:text-white transition-all"
            >
              About Us
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
