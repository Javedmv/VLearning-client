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
    <div className="flex flex-col items-center my-8">
        {/* Navigation Buttons */}
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <p className='sub-heading'>Courses</p>
        <button
          className={`bg-fuchsia-950 bg-opacity-30 hover:bg-opacity-80 text-white p-2 rounded-full shadow-md transition-colors duration-300 ease-in-out`}
          onClick={handleNextClick}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl overflow-x-auto scrollbar-hide bg-pink-200">
        {visibleCourses.map((course, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden borde p-5 m-5"
          >
            {/* Image */}
            <div className="h-48 overflow-hidden">
              <img
                src={course.image}
                alt={course.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Details */}
            <div className="mt-4">
              {/* Course Name */}
              <h3 className="text-xl font-bold mb-2">{course.name}</h3>

              {/* Instructor Name */}
              <p className="text-gray-500 mb-2">Instructor: {course.instructorName}</p>

              {/* Rating */}
              <div className="flex items-center justify-end mb-2">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-2 text-gray-500">{course.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;