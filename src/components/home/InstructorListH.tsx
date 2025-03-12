import React, { useState, useEffect, useRef } from 'react';

interface Instructor {
  image: string;
  name: string;
  instructorName: string;
  rating: number;
}

const InstructorList: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const instructors: Instructor[] = [
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Introduction to Web Development',
      instructorName: 'John Doe',
      rating: 4.8,
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Data Structures and Algorithms',
      instructorName: 'Jane Smith',
      rating: 4.6,
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Machine Learning for Beginners',
      instructorName: 'Bob Johnson',
      rating: 4.7,
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Web Development Advanced',
      instructorName: 'Emily Davis',
      rating: 4.9,
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Algorithmic Patterns',
      instructorName: 'Alice Brown',
      rating: 4.5,
    },
    {
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200',
      name: 'Programming for Beginners',
      instructorName: 'Michael Green',
      rating: 4.7,
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 } // Trigger when 50% of the component is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const startInterval = () => {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex + 4 < instructors.length ? prevIndex + 4 : 0
        );
      }, 5000);
    };

    const stopInterval = () => {
      clearInterval(interval);
    };

    // Only run the timer when the component is visible
    if (isVisible && !document.hidden) {
      startInterval();
    }

    return () => {
      stopInterval();
      observer.disconnect();
    };
  }, [instructors.length, isVisible]);

  const visibleInstructors = instructors.slice(currentIndex, currentIndex + 4);

  return (
    <div className="flex flex-col items-center my-8 px-4" ref={containerRef}>
      {/* Header */}
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <p className="text-2xl font-bold text-gray-800">Instructors</p>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-7xl mt-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {visibleInstructors.map((instructor, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden p-6 flex flex-col items-center border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="mb-4">
                <img
                  src={instructor?.image}
                  alt={instructor?.name}
                  className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover rounded-full border-2 border-blue-500"
                />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-1">{instructor?.instructorName}</h3>
                <p className="text-gray-500 text-sm mb-2">{instructor?.name}</p>
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-2 text-gray-600">{instructor?.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorList;
