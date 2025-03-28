import React, { useEffect, useState } from 'react';
import { Play, Clock, User } from 'lucide-react';
import Navbar from '../../components/home/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { commonRequest, URL } from '../../common/api';
import { config, pdfConfig } from '../../common/configurations';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { capitalizeFirstLetter } from '../../common/functions';
import ShimmerCourseDetail from '../../ShimmerUi/User/ShimmerCourseDetail';
import ChatBar from "../../components/common/Chat/ChatBar"; // Adjust the path if needed
import VideoPlayer from '../../components/common/VideoPlayer';
import Cookies from 'js-cookie';

interface CertificateDownloadParams {
  enrollmentId: string;
  user: { username: string };
  courseTitle: string;
}

const LearningCourseDetail: React.FC = () => {
  const [currentLessonId, setCurrentLessonId] = useState<string>("");
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.user);
  const { id } = useParams<{ id: string }>();

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        toast.error("Course ID is missing");
        return;
      }

      const res = await commonRequest('GET', `${URL}/course/my-learning/course-detail/${id}`, {}, config);
      
      if (!res.success) {
        toast.error(res.message || "Failed to fetch course details");
        return;
      }

      if (res.data?.[0]) {
        const courseData = res.data[0];
        setCourse(courseData);
        setCurrentLessonId(courseData.progress.currentLesson);
      }
    } catch (error) {
      toast.error("Failed to load course details");
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course && currentLessonId) {
      const lesson = course.courseId.courseContent.lessons.find(
        (lesson:any) => lesson._id === currentLessonId
      );
      setCurrentLesson(lesson || null);
    }
  }, [currentLessonId, course]);

  const handleLessonChange = (lessonId: string) => {
    try {
      if (!course || !course.courseId || !course.progress) return;
  
      const lessons = course.courseId.courseContent.lessons; // Get all lessons
      const completedLessons = course.progress.completedLessons; // Completed lesson IDs
  
      // Find the index of the clicked lesson
      const lessonIndex = lessons.findIndex((lesson: any) => lesson._id === lessonId);
  
      if (lessonIndex === -1) {
        toast.error("Invalid lesson selection.");
        return;
      }
  
      if (lessonIndex === 0) {
        setCurrentLessonId(lessonId);
        return;
      }
  
      const previousLessonId = lessons[lessonIndex - 1]._id;
  
      if (completedLessons.includes(previousLessonId)) {
        setCurrentLessonId(lessonId);
      } else if (lessonId === currentLessonId) {
        setCurrentLessonId(lessonId);
      } else {
        toast.error("Please complete the previous lesson before accessing this one!");
      }
    } catch (error) {
      console.error("Error in handleLessonChange", error);
      toast.error("Something went wrong while changing the lesson.");
    }
  };
  

  if (isLoading) {
    return (<ShimmerCourseDetail />);
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Course not found</div>
      </div>
    );
  }
  

  const downloadCertificate = async ({ enrollmentId, user, courseTitle }: CertificateDownloadParams) => {
    const toastId = toast.loading("Preparing your certificate...");
  
    try {
      if (!enrollmentId || !user?.username) {
        throw new Error("Missing required information");
      }
  
      const url = `http://localhost:3000/course/generate-certificate/${enrollmentId}?username=${encodeURIComponent(user.username)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error({
          401: "Please log in to download your certificate",
          404: "Course enrollment not found",
          500: "Server error generating certificate",
        }[response.status] || errorData.message || "Failed to generate certificate");
      }
  
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/pdf')) {
        throw new Error("Invalid certificate format received");
      }
  
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = downloadUrl;
      link.download = `${courseTitle}_Certificate_${Date.now()}.pdf`;
      
      document.body.appendChild(link);
      link.click();
  
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
  
      toast.success("Certificate downloaded successfully!");
  
    } catch (error: any) {
      console.error("Certificate Download Error:", error);
      toast.error(error.message || "Failed to download certificate");
    } finally {
      toast.dismiss(toastId);
    }
  };
  
  // Usage
  const handleDownload = () => {
    downloadCertificate({
      enrollmentId: id!,
      user: { username: user.username },
      courseTitle: course.courseId.basicDetails.title,
    });
  };

  return (
    <>
      <Navbar User={user} />
      <div className="min-h-screen bg-gray-50 mt-1">
        <div className="w-full">
          {currentLesson ? (
            <VideoPlayer 
              videoUrl={currentLesson.videoUrl} 
              lessonId={currentLesson._id} 
              enrollmentId={course._id} 
              course={course}
              setCourse={setCourse}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600">Select a lesson to start learning</p>
            </div>
          )}
        </div>
  
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Course Details Section */}
          <div className="mb-12">
          <div className="mb-12 flex justify-between items-center">
              {/* Course Title */}
              <h1 className="text-3xl font-bold text-gray-900">
                {course.courseId.basicDetails.title}
              </h1>

              {/* Download Certificate Button (Appears Only When Completed) */}
              {course.progress.completedLessons.length === course.courseId.courseContent.lessons.length && (
                <button
                  onClick={() => handleDownload()} // Function to handle certificate download
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-700 transition"
                >
                  🎓 Download Certificate
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-gray-600 mb-6">
              {/* Instructor Info */}
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>
                  {capitalizeFirstLetter(course?.courseId?.instructor?.firstName) +
                    " " +
                    capitalizeFirstLetter(course?.courseId?.instructor?.lastName)}
                </span>
              </div>
  
              {/* Duration Info */}
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  {(() => {
                    const totalSeconds = course?.courseId.courseContent?.lessons?.reduce((acc: number, lesson: any) => {
                      const [minutes, seconds] = lesson.duration.split(":").map(Number);
                      return acc + minutes * 60 + seconds;
                    }, 0);
  
                    const totalMinutes = Math.floor(totalSeconds / 60);
                    const remainingSeconds = totalSeconds % 60;
  
                    return `${totalMinutes}:${remainingSeconds.toString().padStart(2, "0")} minutes`;
                  })()}
                </span>
              </div>
  
              {course.courseId.lastUpdated && (
                <div>Last updated: {course.updatedAt}</div>
              )}
            </div>
  
            {/* Course Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">About This Course</h2>
              <p className="text-gray-700 leading-relaxed">
                {course.courseId.basicDetails.description}
              </p>
            </div>
          </div>
  
          {/* Lessons List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold">Course Content</h2>
              <p className="text-gray-600 mt-2">
                {course.courseId.courseContent.lessons.length} lessons
              </p>
            </div>
  
            <div className="divide-y">
              {course.courseId.courseContent.lessons.map((lesson: any) => (
                <button
                  key={lesson._id}
                  onClick={() => handleLessonChange(lesson._id)}
                  className={`w-full p-6 text-left hover:bg-gray-50 transition-colors ${
                    currentLessonId === lesson._id ? "bg-purple-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Play
                      className={`w-6 h-6 ${
                        currentLessonId === lesson._id
                          ? "text-purple-600"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{lesson.title}</h3>
                      <p className="text-gray-600 mt-1">{lesson.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-5 h-5" />
                      <span>{lesson.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  
      {/* ChatBar Component (Always at the bottom) */}
      <ChatBar enrollment={course}/>
    </>
  );
  
};

export default LearningCourseDetail;