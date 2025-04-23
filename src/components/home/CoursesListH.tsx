import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  name: string;
  basicDetails: {
    title: string;
    thumbnail: string;
    description: string;
  };
  instructor: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profile: {
      avatar: string;
    };
  };
  instructorName: string;
  rating?: number;
  price?: number;
  thumbnail?: string;
}

const CourseList: React.FC<{courses: Course[]}> = ({courses}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);
  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 3;
      return nextIndex < courses.length ? nextIndex : 0;
    });
  };

  // Ensure we don't try to display more courses than available
  const visibleCourses = courses.slice(
    currentIndex, 
    Math.min(currentIndex + 3, courses.length)
  );

  // If we don't have enough courses to fill the grid, add from the beginning
  const displayCourses = visibleCourses.length < 3 && courses.length > 3
    ? [...visibleCourses, ...courses.slice(0, 3 - visibleCourses.length)]
    : visibleCourses;

  const handleCourseDetail = (course: Course) => {
    navigate(`/details/${course._id}`);
  }

  return (
    <div className="px-4 md:px-8 py-12" ref={containerRef}>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Featured Courses
        </h2>
        <div className="flex items-center gap-4">
          <button
            className="group flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
            onClick={handleNextClick}
            aria-label="Next courses"
          >
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCourses.map((course, index) => (
          <div
            key={course._id}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Course Image */}
            <div className="relative h-48 overflow-hidden" onClick={() => handleCourseDetail(course)}>
              <img
                src={course.thumbnail || (course.basicDetails && course.basicDetails.thumbnail)}
                alt={course.name || (course.basicDetails && course.basicDetails.title)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {course.rating && (
                <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg shadow-md">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">{course.rating}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {course.basicDetails.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {course.instructor?.username?.charAt(0) || 'I'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {course.instructor?.username || 'Instructor'}
                </span>
              </div>

              {course.price !== undefined ? (
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-lg">
                    ${course.price.toFixed(2)}
                  </span>
                </div>
              ) : null}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;