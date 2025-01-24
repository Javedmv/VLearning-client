import React, { useEffect, useState } from 'react';
import VideoPlayer from '../../components/home/CourseDetailComponents/VideoPlayer';
import CourseDetailsComponent from '../../components/home/CourseDetailComponents/CourseDetailsComponent';
import InstructorCard from '../../components/home/CourseDetailComponents/InstructorCard';
import LessonList from '../../components/home/CourseDetailComponents/LessonList';
import { CourseData } from '../../types/Courses';
import { commonRequest, URL } from '../../common/api';
import { useParams } from 'react-router-dom';
import { config } from '../../common/configurations';
import Navbar from '../../components/home/Navbar';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { loadStripe } from "@stripe/stripe-js";

// In your frontend Lesson interface
export interface Lesson {
    _id?: string;
    title: string;
    description: string;
    duration: string;
    videoUrl: string | File | null; // Allow both string (URL) and File (when the backend sends the file)
    isIntroduction: boolean;
    videoPreview?: { url: string; duration: string };
  }
  
  

const CourseDetailPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);

  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<CourseData | undefined>(undefined);
  const [currentLesson, setCurrentLesson] = useState<Lesson | undefined>(undefined);

  const fetchCourse = async (courseId: string) => {
    try {
      const res = await commonRequest('GET', `${URL}/course/details/${courseId}`, {}, config);

      const lessons = res.data.courseContent.lessons.map((lesson: any) => ({
        ...lesson,
        _id: lesson._id ?? '',
      }));

      setCourseData({ ...res.data, courseContent: { ...res.data.courseContent, lessons } });
      setCurrentLesson(lessons[0]); // Set the first lesson as default
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    }
  };

  useEffect(() => {
    fetchCourse(id!);
  }, [id]);

  const coursePriceType = courseData?.pricing?.type === 'free' ? "Free" : "Paid";
  const coursePrice = courseData?.pricing?.amount;
  const isEnrolled = courseData?.students?.some((student) => student == user?._id) ?? false;

  async function handleEnroll (userId:string, courseId:string | undefined) {
    try {
      const res = await commonRequest('POST', `${URL}/course/enroll-user`, {userId,courseId}, config);
      console.log(res);
      return res;
    } catch (error) {
      console.log(error)
    }
  }

  async function handlePayment(userId: string, courseId: string) {
    try {
      if (coursePriceType === "Free") {
        const response = await handleEnroll(userId, courseId);
        if (!response?.success) {
          toast.error(response?.message || "Something went wrong.");
          return;
        }
  
        toast.success(response?.message);
        await fetchCourse(response?.data);
      } 
      else {
      //   const stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY!).catch(err => {
      //     console.error('Stripe loading error:', err);
      //     return null;
      //   });

      //   if (!stripe) {
      //     toast.error("Stripe failed to load.");
      //     return;
      //   }
  
        const response = await commonRequest("POST", `${URL}/payment/create-session`, { userId, courseId }, config);
  
        // if (!response?.success) {
        //   toast.error(response?.message || "Something went wrong.");
        //   return;
        // }
        window.location.href = response?.data
        console.log(response.data, "response from backend")
  
        // const sessionId = response.data.sessionId;
  
        // Redirect to Stripe Checkout
        // const result = await stripe.redirectToCheckout({ sessionId });
        // if (result.error) {

        //   toast.error(result.error.message || "Failed to redirect to Stripe.");
        // }
      }
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Something went wrong while processing the payment.");
    }
  }
  
  

  return (
    <>
      <Navbar User={user} />
      <div className="min-h-screen bg-red-300 p-6 md:p-8 lg:p-10 bg-opacity-60">
        <div className="max-w-7xl mx-auto">
          {/* Video Player Section */}
          <div>
          {currentLesson && currentLesson?.videoUrl ? (
              <>
                <p className="font-semibold text-xl text-fuchsia-800 p-2 rounded-md shadow-lg hover:underline">
                  Playing: {currentLesson?.title}
                </p>
                <VideoPlayer key={currentLesson?._id} videoUrl={currentLesson?.videoUrl}/>
              </>
            ) : (
              <p>No video available</p>
          )}

          </div>

          <div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Course Details and Instructor Section */}
            <div className="lg:col-span-2 space-y-10 ">
              <CourseDetailsComponent details={courseData?.basicDetails} />
              <InstructorCard instructor={courseData?.instructor} />
            </div>

            {/* Lesson List Section */}
            <div className="bg-white rounded-lg shadow-md">
              { !isEnrolled &&
                <div className="p-6 border-b ring-2 ring-gray-600 mb-2">
                <div className="flex items-center justify-around">
                  {/* Price Display */}
                  <div className="bg-gray-100 py-2 px-7 rounded-lg shadow-sm text-center ring-2 ring-fuchsia-800">
                    <div className="text-fuchsia-950 font-semibold text-lg">
                      {coursePriceType === "Free" ? coursePriceType : `₹${coursePrice}`}
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <button
                    onClick={() => handlePayment(user?._id, courseData?._id!)}
                    className="px-6 py-3 bg-fuchsia-700 text-white font-semibold rounded-md shadow-md hover:bg-fuchsia-800 transition duration-300"
                  >
                    Enroll Now
                  </button>

                </div>
              </div>
              }

               
              <div className="sticky top-10">
                <LessonList
                  lessons={courseData?.courseContent?.lessons}
                  onSelectLesson={(lesson) => setCurrentLesson(lesson)} // Update the currentLesson on selection
                  currentLessonId={currentLesson?._id}
                  isEnrolled={isEnrolled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;
