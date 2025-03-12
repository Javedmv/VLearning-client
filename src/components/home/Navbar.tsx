import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Link, useLocation } from "react-router-dom"; // Use `useLocation` for active link
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../redux/store";
import { logout } from "../../redux/actions/user/userAction";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface NavbarProps {
  User: any;
}

const Navbar: React.FC<NavbarProps> = ({ User }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation(); // Use this to get current location

  const [selectedLink, setSelectedLink] = useState<string>(location.pathname); // Track selected link

  useEffect(() => {
    setSelectedLink(location.pathname); // Update selected link on location change
  }, [location]);

  const handleLogout = () => {
    try {
      dispatch(logout());
      toast.success("Logout Successfully");
      navigate("/");
    } catch (error) {
      console.error(error, "ERROR in HANDLE LOGOUT");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-pink-200 p-4 top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center spaces-x-2">
            <GraduationCap className="w-10 h-10 text-fuchsia-950" />
            <span className="text-4xl font-bold text-fuchsia-950">
              VLearning<span className="text-pink-600">.</span>
            </span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              onClick={() => setSelectedLink("/")}
              className={`nav-link rounded-full py-1 px-4 transition-all ${
                selectedLink === "/" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/course"
              onClick={() => setSelectedLink("/course")}
              className={`nav-link rounded-full py-1 px-4 transition-all ${
                selectedLink === "/course" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
              }`}
            >
              Courses
            </Link>

            <Link
              to="/contact-us"
              onClick={() => setSelectedLink("/contact-us")}
              className={`nav-link rounded-full py-1 px-4 transition-all ${
                selectedLink === "/contact-us" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
              }`}
            >
              Contact Us
            </Link>
            <Link
              to="/about-us"
              onClick={() => setSelectedLink("/about-us")}
              className={`nav-link rounded-full py-1 px-4 transition-all ${
                selectedLink === "/about-us" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
              }`}
            >
              About Us
            </Link>

            

            {User?.role === "instructor" && User.isVerified === "approved" ? (
              <Link
                to="/instructor"
                onClick={() => setSelectedLink("/instructor")}
                className={`rounded-md py-1 px-4 transition-all ${
                  selectedLink === "/instructor" ? "bg-fuchsia-800 text-white" : "bg-yellow-600 text-white"
                }`}
              >
                Instructor
              </Link>
            ) : User?.role === "instructor" && (User?.isVerified === "rejected" || User?.isVerified === "requested") ? (
              <Link
                to="/instructor-req-stat"
                onClick={() => setSelectedLink("/instructor-req-stat")}
                className={`rounded-md py-1 px-4 transition-all ${
                  selectedLink === "/instructor-req-stat" ? "bg-fuchsia-800 text-white" : "bg-fuchsia-800 text-white"
                }`}
              >
                Instructor
              </Link>
            ) : (
              User && User?.role === "student" ? (
                <Link
                  to="/teach"
                  onClick={() => setSelectedLink("/teach")}
                  className={`nav-link rounded-full py-1 px-4 transition-all ${
                    selectedLink === "/teach" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
                  }`}
                >
                  Teach
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setSelectedLink("/login")}
                  className={`nav-link rounded-full py-1 px-4 transition-all ${
                    selectedLink === "/login" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
                  }`}
                >
                  Teach
                </Link>
              )
            )}

            {User && <Link
              to="/my-learnings"
              onClick={() => setSelectedLink("/my-learnings")}
              className={`nav-link rounded-full py-1 px-4 transition-all ${
                selectedLink === "/my-learnings" ? "bg-fuchsia-800 text-white" : "hover:bg-fuchsia-900 hover:text-white"
              }`}
            >
              My Learnings
            </Link>}
          </div>

          {/* Auth Buttons */}
          {User?.isNewUser === false && (User?.role === "student" || User?.role === "instructor") ? (
            <div className="hidden lg:flex items-end space-x-3">
              <Link
                to={"/profile"}
                title="Profile"
                className="flex items-center space-x-3 bg-fuchsia-300 px-3 py-0.5 rounded-lg"
              >
                <span className="text-fuchsia-900 font-medium">
                  {User?.username ? User.username.charAt(0).toUpperCase() + User.username.slice(1) : ""}
                </span>
                <div className="w-10 h-10 rounded-full bg-gray-300 font-bold flex items-center justify-center">
                  {User?.username?.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-fuchsia-700 text-white rounded-full hover:bg-red-700 transition duration-300 ease-in-out"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-4">
              <Link to="/login">
                <button className="px-6 py-2 bg-fuchsia-700 text-white rounded-full hover:bg-fuchsia-900 transition duration-300 ease-in-out">
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-6 py-2 bg-white text-fuchsia-900 border-2 border-purple-600 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out">
                  Signup
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button onClick={toggleMenu} className="text-fuchsia-950 hover:text-fuchsia-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 space-y-4 max-h-96 overflow-y-auto">
            <div className="flex flex-col items-center space-y-4 mb-4">
              <button className="w-full px-4 py-1 bg-fuchsia-700 text-white rounded-full hover:bg-fuchsia-900 transition duration-300 ease-in-out text-sm">
                Login
              </button>
              <button className="w-full px-4 py-1 bg-white text-fuchsia-900 border-2 border-purple-600 rounded-full hover:bg-gray-300 transition duration-300 ease-in-out text-sm">
                Signup
              </button>
            </div>

            {/* Mobile Navigation Links */}
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
