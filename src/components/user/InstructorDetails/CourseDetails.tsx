import React from 'react';
import { Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface InstructorCoursesProps {
  courses: any[];
  name: string;
}

const InstructorCourses: React.FC<InstructorCoursesProps> = ({courses, name}) => {
  const navigate = useNavigate();

  function handleCourseDetails(courseId:string) {
    navigate(`/details/${courseId}`)
  }

  if(!courses){
    toast.error("Failed to fetch courses")
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Courses</h2>
        <p className="mt-2 text-lg text-gray-600">Explore all courses taught by Dr. {name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course:any) => (
          <div onClick={() => handleCourseDetails(course._id)} key={course?._id} className="bg-gray-300 bg-opacity-90 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img
              src={course?.basicDetails?.thumbnail}
              alt={course?.basicDetails?.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-fuchsia-900 text-white`}>
                  {course?.basicDetails?.category?.name}
                </span>
                {/* <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-600">{course?.rating}</span>
                </div> */}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{course?.basicDetails?.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-1">{course?.basicDetails?.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  
                  {/* TO SHOW THE DURATION */}
                  <span>
                    {(() => {
                      // Calculate total duration in minutes
                      const totalDurationInMinutes = course?.courseContent?.lessons?.reduce((total: number, lesson: any) => {
                        const duration = lesson?.duration; // Get duration from lesson

                        if (typeof duration === 'string') {
                          const timeParts = duration.split(':'); // Split by colon

                          if (timeParts.length === 2) {
                            // MM:SS format
                            const [minutes, seconds] = timeParts.map(Number);
                            if (!isNaN(minutes) && !isNaN(seconds)) {
                              return total + minutes + seconds / 60; // Convert seconds to fraction of a minute
                            }
                          } else if (timeParts.length === 3) {
                            // HH:MM:SS format
                            const [hours, minutes, seconds] = timeParts.map(Number);
                            if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
                              return total + (hours * 60) + minutes + seconds / 60; // Convert hours to minutes
                            }
                          }
                        }

                        return total; // If duration is invalid, skip this lesson
                      }, 0);

                      // Display total duration in hours or minutes
                      if (totalDurationInMinutes < 60) {
                        return `${Math.round(totalDurationInMinutes)} min${totalDurationInMinutes !== 1 ? 's' : ''}`;
                      } else {
                        const hours = Math.round(totalDurationInMinutes / 60); // Round to nearest hour
                        return `${hours} hour${hours !== 1 ? 's' : ''}`;
                      }
                    })()}
                  </span>

                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2 text-green-500" />
                  <span>{course?.students?.length} students</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {course?.basicDetails?.whatWillLearn?.slice(0, 2).map((topic:string, index:number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorCourses;