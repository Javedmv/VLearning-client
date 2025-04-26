import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types/Users';
import { useNavigate } from 'react-router-dom';

interface InstructorListProps {
  instructors: User[];
}

const InstructorList: React.FC<InstructorListProps> = ({ instructors }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Intersection Observer to detect visibility
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const startInterval = () => {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex + 4 < instructors.length ? prevIndex + 4 : 0
        );
      }, 5000); // Rotate every 5 seconds
    };

    const stopInterval = () => clearInterval(interval);

    // Start/stop interval based on visibility and tab focus
    if (isVisible && !document.hidden) {
      startInterval();
    } else {
      stopInterval();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
      } else if (isVisible) {
        startInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      stopInterval();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [instructors.length, isVisible]);

  const handleInstructorClick = (id: string) => {
    navigate(`/instructor/${id}`);
  };

  // Calculate visible instructors
  const visibleInstructors = instructors.slice(
    currentIndex,
    Math.min(currentIndex + 4, instructors.length)
  );

  // Fill remaining slots if needed (carousel effect)
  const displayInstructors = visibleInstructors.length < 4 && instructors.length > 4
    ? [...visibleInstructors, ...instructors.slice(0, 4 - visibleInstructors.length)]
    : visibleInstructors;

  return (
    <div className="flex flex-col items-center my-8 px-4" ref={containerRef}>
      {/* Header */}
      <div className="flex justify-between w-full max-w-6xl mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Our Instructors</h2>
        
      </div>

      {/* Instructor Grid */}
      <div className="relative w-full max-w-7xl mt-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg shadow-lg">
        {displayInstructors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {displayInstructors.map((instructor) => (
              <div
                key={instructor._id}
                className="bg-white rounded-xl shadow-md overflow-hidden p-6 flex flex-col items-center border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                onClick={() => handleInstructorClick(instructor._id)}
              >
                <div className="mb-4">
                  <img
                    src={instructor.profile?.avatar || 'https://via.placeholder.com/150?text=Instructor'}
                    alt={`${instructor.firstName} ${instructor.lastName}`}
                    className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover rounded-full border-2 border-blue-500"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">
                    {instructor.firstName} {instructor.lastName || '' || instructor.username}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {instructor.profession || 'Instructor'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {instructor.qualification || 'Certified Professional'}
                  </p>  
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">No instructors available</div>
        )}
      </div>
    </div>
  );
};

export default InstructorList;