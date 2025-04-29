import React, { useEffect, useState } from 'react';
import { BookOpen, PlayCircle } from 'lucide-react';
import Navbar from '../../components/home/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { commonRequest, URL as URLS } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';
import { IEnrollment } from '../../types/Enrollments';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../../components/common/Pagination';
import { Meta } from '../../types/Iothers';
import { stringifyMeta } from '../../common/constants';

const MyLearnings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [courses, setCourses] = useState<IEnrollment[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [meta, setMeta] = useState<Meta>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  });
  

  const fetchAllUserCourses = async (currentMeta: Meta) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(stringifyMeta(currentMeta)).toString();
      const res = await commonRequest('GET', `${URLS}/course/my-learning?${queryParams}`, {}, config);
      if (!res.success) {
        toast.error(res.message || "Sorry, something went wrong.");
        return;
      }
      if (res?.success && res.data) {
        setCourses(res.data.updatedEnrollments);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUserCourses(meta);
  }, []);

  // Convert File objects to URLs
  useEffect(() => {
    const urls: { [key: string]: string } = {};
    courses.forEach((enrollment) => {
      if (typeof enrollment.courseId === "object") {
        const thumbnail = enrollment.courseId.basicDetails?.thumbnail;
        if (thumbnail instanceof File) {
          urls[enrollment._id.toString()] = URL.createObjectURL(thumbnail);
        } else if (typeof thumbnail === "string") {
          urls[enrollment._id.toString()] = thumbnail;
        }
      }
    });
    setImageUrls(urls);

    return () => {
      // Revoke object URLs to free up memory
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [courses]);

  const handleCourseDetails = async (enrollmentId: string) => {
    try {
      const enrolledCourse = courses.find(course => course._id === enrollmentId);
      if (!enrolledCourse) {
        console.error("Course not found for enrollmentId:", enrollmentId);
        return;
      }
      navigate(`/my-learnings/course/${enrolledCourse._id}`);
    } catch (error: any) {
      console.error("Error in handleCourseDetails:", error);
    }
  };

  const handlePageChange = (page: number) => {
    const newMeta = {
      ...meta,
      page
    };
    setMeta(newMeta);
    fetchAllUserCourses(newMeta); // Pass the new meta directly
  }

  // Shimmer Skeleton Loader Component
  const ShimmerCard = () => (
    <div className="bg-gray-200 animate-pulse rounded-xl shadow-md overflow-hidden">
      <div className="h-48 bg-gray-300"></div>
      <div className="p-5">
        <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-400 rounded w-1/2 mb-4"></div>
        <div className="h-2 bg-gray-400 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-400 rounded w-5/6 mb-2"></div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar User={user} />
      <br />
      <div className="max-w-6xl mx-auto p-6 bg-pink-200">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 underline">My Learnings</h1>
          <Link
            to="/payment/history" // Adjust the route if needed
            className="text-fuchsia-800 hover:underline text-lg"
          >
            💳 Payment History
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <ShimmerCard key={index} />
            ))}
          </div>
          
        ) : courses.length > 0 ? (
          <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((enrollment: IEnrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                onClick={() => handleCourseDetails(enrollment._id)}
              >
                <div className="relative h-48">
                  {imageUrls[enrollment._id.toString()] ? (
                    <img
                      src={imageUrls[enrollment._id.toString()]}
                      alt={typeof enrollment.courseId === "object" ? enrollment.courseId.basicDetails?.title : "Course Image"}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}

                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <button className="focus:outline-none">
                      <PlayCircle className="w-16 h-16 text-white hover:text-indigo-400 transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {typeof enrollment.courseId === "object" ? enrollment.courseId.basicDetails?.title : "Course Title"}
                    </h3>

                    {enrollment.courseId &&
                      typeof enrollment.courseId !== "string" &&
                      enrollment.courseId.basicDetails?.category &&
                      typeof enrollment.courseId.basicDetails.category === "object" && (
                        <span className="text-sm font-medium text-white bg-fuchsia-600 px-2 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] inline-block">
                          {enrollment.courseId.basicDetails.category.name}
                        </span>
                      )}
                  </div>

                  {enrollment.courseId &&
                    typeof enrollment.courseId !== "string" &&
                    enrollment.progress?.completedLessons &&
                    enrollment.courseId.courseContent?.lessons && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {Math.round(
                              (enrollment.progress.completedLessons.length /
                                enrollment.courseId.courseContent.lessons.length) * 100
                            ) || 0}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{
                              width: `${
                                Math.round(
                                  (enrollment.progress.completedLessons.length /
                                    enrollment.courseId.courseContent.lessons.length) * 100
                                ) || 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                  {enrollment.courseId &&
                    typeof enrollment.courseId !== "string" &&
                    enrollment.courseId.courseContent?.lessons && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <BookOpen className="w-4 h-4" />
                        <span>
                          {enrollment.progress?.completedLessons?.length || 0}/
                          {enrollment.courseId.courseContent.lessons.length} Lessons
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
          
        </>
        ) : (
          <div className="text-center text-gray-700 font-semibold text-lg">No Purchased Courses</div>
        )}
      </div>
      <Pagination
          currentPage={meta?.page}
          totalPages={meta?.totalPages}
          onPageChange={handlePageChange}
        />
    </>
  );
};

export default MyLearnings;
