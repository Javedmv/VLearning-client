import React, { useEffect, useState } from 'react';
import { Users, Clock, DollarSign } from 'react-feather';
import { CourseData, BasicDetails } from '../../types/Courses';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const CoursesPage: React.FC = () => {
  const { user } = useSelector((state:RootState) => state.user);
  const [courses, setCourses] = useState<CourseData[]>([]);


  const fetchCourses = async () => {
    try {
      const res = await commonRequest('GET', `${URL}/course/all-instructor-courses/${user?._id}`, {}, config);
      console.log(res.data , "here is hte data")
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch categories: in ADMIN/INSTRUCTOR', error);
    }
  };

  useEffect(() => {
    fetchCourses()
  },[])


  return (
    <div className="p-6 text-fuchsia-900 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      <div className="grid gap-6">
      {courses.length === 0 ?
      <p>No Courses found</p>
      :
      courses?.map((course) => (
          <div key={course?._id} className="bg-white shadow-lg rounded-lg overflow-hidden flex hover:shadow-xl transition-shadow duration-300">
            {/* Course Thumbnail */}
            <div className="w-64 h-64 flex-shrink-0">
            <img
              src={typeof course?.basicDetails?.thumbnail === 'string' 
                ? course.basicDetails.thumbnail 
                : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
              alt={course?.basicDetails?.title}
              className="w-full h-full object-cover"
            />
          </div>

            {/* Course Details */}
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {course?.basicDetails?.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-4">
                    {course?.basicDetails?.description}
                  </p>
                </div>
                {course?.pricing?.type === 'paid' ? (
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-5 w-5" />
                    <span>{course.pricing.amount}</span>
                  </div>
                ) : (
                  <span className="text-green-600 font-semibold">Free</span>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>
                    {course?.courseContent?.lessons?.reduce(
                      (acc, lesson) => acc + (parseInt(lesson.duration) || 0), 
                      0
                    )} mins
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>
                    {course?.instructor?.firstName + " " + course?.instructor?.lastName}
                  </span>
                </div>
                <span>{course?.basicDetails?.language}</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-s font-bold">
                {
                  typeof course?.basicDetails?.category === "string"
                    ? course?.basicDetails?.category
                    : course?.basicDetails?.category?.name
                }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;

