import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import Navbar from '../../components/home/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { commonRequest, URL as URLS } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';
import { IEnrollment } from '../../types/Enrollments';

const MyLearnings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [courses, setCourses] = useState<IEnrollment[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  const fetchAllUserCourses = async () => {
    try {
      const res = await commonRequest('GET', `${URLS}/course/my-learning`, {}, config);
      if (!res.success) {
        toast.error(res.message || "Sorry, something went wrong.");
        return;
      }
      if (res?.success && res.data) {
        setCourses(res.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchAllUserCourses();
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

  return (
    <>
      <Navbar User={user} />
      <br />
      <div className="max-w-6xl mx-auto p-6 bg-pink-200">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 underline">My Learnings</h1>
        </div>

        {courses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((enrollment: IEnrollment) => (
              <div
                key={enrollment._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img
                    src={imageUrls[enrollment._id.toString()] || "https://placehold.co/300x200"}
                    alt={typeof enrollment.courseId === "object" ? enrollment.courseId.basicDetails?.title : "Course Image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <button className="focus:outline-none">
                      <PlayCircle className="w-16 h-16 text-white hover:text-indigo-400 transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {/* Title & Category in One Row */}
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {typeof enrollment.courseId === "object" ? enrollment.courseId.basicDetails?.title : "Course Title"}
                    </h3>

                    {enrollment.courseId &&
                      typeof enrollment.courseId !== "string" &&
                      enrollment.courseId.basicDetails?.category &&
                      typeof enrollment.courseId.basicDetails.category === "object" && (
                        <span className="text-sm font-medium text-white bg-fuchsia-600 px-3 py-1 rounded-full">
                          {enrollment.courseId.basicDetails.category.name}
                        </span>
                      )}
                  </div>

                  {/* Progress Bar */}
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

                  {/* Lessons Completed */}
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

                  {/* Last Watched */}
                  {enrollment.courseId &&
                    typeof enrollment.courseId !== "string" &&
                    enrollment.progress?.lessonProgress &&
                    enrollment.progress.currentLesson && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last watched:{" "}
                          {Math.floor(
                            enrollment.progress.lessonProgress[enrollment.progress.currentLesson]?.lastWatchedPosition ||
                              0
                          )}
                          s
                        </span>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-700 font-semibold text-lg">No Purchased Courses</div>
        )}
      </div>
    </>
  );
};

export default MyLearnings;
