import React, { useEffect, useState } from "react";
import Carousel from "../../components/home/Carousel";
import CourseList from "../../components/home/CoursesListH";
import InstructorList from "../../components/home/InstructorListH";
import Navbar from "../../components/home/Navbar";
import Footer from "../../components/home/Footer";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { commonRequest, URL } from "../../common/api";
import { config } from "../../common/configurations";
import { Banner } from "../../types/Banner";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [highPriorityBanner, setHighPriorityBanner] = useState<Banner[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [courses, setCourses] = useState<any>([]);
  const [instructors, setInstructors] = useState<any>([]);

  const fetchBanners = async () => {
    try {
      const response = await commonRequest("GET", `${URL}/auth/get-all-active-banner`, {}, config);
      setHighPriorityBanner(response.highPriority as Banner[]);
      setBanners([...(response.mediumPriority as Banner[]), ...(response.lowPriority as Banner[])]);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await commonRequest("GET", `${URL}/course/landing-page-courses`, {}, config);
      setCourses(response.data.courses);
      setInstructors(response.data.instructors);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCourses();
  }, []);

  return (
    <div className="bg-gray-100">
      <Navbar User={user} />


      {/* High Priority Banner */}
      {highPriorityBanner?.length > 0 && (
        <Carousel banner={highPriorityBanner} navigationType="dots" />
      )}

        {/* Features Section */}
        <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Why Choose <span className="text-blue-600">VLearning</span>?
            </h2>
            <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition">
                <div className="flex justify-center items-center w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full mb-6 text-2xl">
                📱
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Flexible Learning</h3>
                <p className="text-gray-600">
                Learn anytime, anywhere. Our platform adapts to your lifestyle so you can grow on your terms.
                </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition">
                <div className="flex justify-center items-center w-16 h-16 mx-auto bg-green-100 text-green-600 rounded-full mb-6 text-2xl">
                🎓
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Expert Instructors</h3>
                <p className="text-gray-600">
                Get insights from real-world professionals who bring practical knowledge to every lesson.
                </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition">
                <div className="flex justify-center items-center w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-full mb-6 text-2xl">
                🤝
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Community Support</h3>
                <p className="text-gray-600">
                Be part of a learning tribe. Share, collaborate, and grow together with peers and mentors.
                </p>
            </div>

            </div>
        </div>
        </section>


      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[600px] flex items-center justify-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <div className="text-center max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            Learn Anything, Anytime, Anywhere
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Join VLearning to explore thousands of courses taught by expert instructors.
          </p>
          <Link
            to="/course"
            className="inline-block bg-fuchsia-700 hover:bg-fuchsia-800 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            Explore Courses
          </Link>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Courses</h2>
          <CourseList courses={courses} />
        </div>
      </section>

      {/* Regular Banners */}
      {banners.length > 0 && <Carousel banner={banners} navigationType="arrows" />}

      {/* Instructors Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Instructors</h2>
          <InstructorList instructors={instructors} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;