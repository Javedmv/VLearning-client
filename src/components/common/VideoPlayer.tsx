import React, { useState, useEffect, useRef } from "react";
import { commonRequest, URL } from "../../common/api";
import { config } from "../../common/configurations";
import toast from "react-hot-toast";

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  enrollmentId: string;
  course: any;
  setCourse: any;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, lessonId, enrollmentId, course, setCourse }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedTime, setWatchedTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setWatchedTime(video.currentTime);

      // Mark lesson as completed when 90% watched
      if (duration > 0 && video.currentTime >= duration * 0.9 && !isCompleted) {
        setIsCompleted(true);
        markLessonCompleted(); // Mark it as completed, but do NOT change currentLesson yet
      }
    };

    const handleVideoEnd = () => {
      updateCurrentLesson(); // Update currentLesson only when video is fully finished
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", handleVideoEnd);

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [duration, isCompleted]);

  const markLessonCompleted = async () => {
    try {
      const allLessons = course.courseId.courseContent.lessons;
      const currentLessonIndex = allLessons.findIndex((lesson: any) => lesson._id === lessonId);
      
      if (currentLessonIndex === -1) {
        console.error("Lesson not found in course content");
        return;
      }

      const lessonObject = allLessons[currentLessonIndex];

      const response = await commonRequest(
        "POST",
        `${URL}/course/progress/${enrollmentId}/complete-lesson`,
        { lessonObject, allLessons },
        config
      );

      if (!response.success) {
        toast.error(response.message);
      }

      // Update completed lessons in state
      setCourse((prevCourse: any) => ({
        ...prevCourse,
        progress: {
          ...prevCourse.progress,
          completedLessons: [
            ...new Set([...prevCourse.progress.completedLessons, lessonId])
          ]
        }
      }));
      
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const updateCurrentLesson = async () => {
    try {
      const allLessons = course.courseId.courseContent.lessons;
      const currentLessonIndex = allLessons.findIndex((lesson: any) => lesson._id === lessonId);
      if (currentLessonIndex === -1) return;

      const nextLesson = allLessons[currentLessonIndex + 1] || allLessons[0]; // Next or reset to first

      setCourse((prevCourse: any) => ({
        ...prevCourse,
        progress: {
          ...prevCourse.progress,
          currentLesson: nextLesson._id
        }
      }));
    } catch (error) {
      console.error("Error updating current lesson:", error);
    }
  };

  return (
    <div className="w-full max-h-[500px] flex justify-center">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full max-h-[500px] rounded-lg shadow-md"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </div>
  );
};

export default VideoPlayer;
