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


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Course Details and Instructor Section */}
            <div className="lg:col-span-2 space-y-10">
              <CourseDetailsComponent details={courseData?.basicDetails} />
              <InstructorCard instructor={courseData?.instructor} />
            </div>

            {/* Lesson List Section */}
            <div className="lg:col-span-1">
               
              <div className="sticky top-10">
                <LessonList
                  lessons={courseData?.courseContent?.lessons}
                  onSelectLesson={(lesson) => setCurrentLesson(lesson)} // Update the currentLesson on selection
                  currentLessonId={currentLesson?._id}
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
