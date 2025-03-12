import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CourseHome {
  image: string;
  name: string;
  instructorName: string;
  rating: number;
}

const CourseList: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const courses: CourseHome[] = [
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Introduction to Web Development',
      instructorName: 'John Doe',
      rating: 4.8
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Data Structures and Algorithms',
      instructorName: 'Jane Smith',
      rating: 4.6
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Machine Learning for Beginners',
      instructorName: 'Bob Johnson',
      rating: 4.7
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Development',
      instructorName: 'John Doe',
      rating: 4.8
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Algorithms',
      instructorName: 'Jane Smith',
      rating: 4.6
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Beginners',
      instructorName: 'Bob Johnson',
      rating: 4.7
    }
  ];

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 3;
      return nextIndex < courses.length ? nextIndex : 0;
    });
  };

  const visibleCourses = courses.slice(currentIndex, currentIndex + 3);

  return (
    <div className="px-4 md:px-8 py-12">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Featured Courses
        </h2>
        <button
          className="group flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg"
          onClick={handleNextClick}
        >
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.map((course, index) => (
          <div
            key={index}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Course Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.image}
                alt={course.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg shadow-md">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-semibold text-sm">{course.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {course.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {course.instructorName.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {course.instructorName}
                </span>
              </div>

              <button className="w-full py-2 px-4 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors duration-300 font-medium text-sm">
                View Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;