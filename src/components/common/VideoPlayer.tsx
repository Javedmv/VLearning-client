import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { commonRequest, URL } from '../../common/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from '../../common/configurations';
import { TOBE } from '../../common/constants';

interface VideoPlayerProps {
  videoUrl: string;
  lessonId: string;
  enrollmentId: string;
  course: TOBE;
  setCourse: React.Dispatch<React.SetStateAction<TOBE>>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  lessonId, 
  enrollmentId,
  course,
  setCourse
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
  const { user } = useSelector((state: RootState) => state.user);
  const token = Cookies.get('access_token');
  
  // Get the last watched position from course data
  useEffect(() => {
    if (course && course.progress && course.progress.lessonProgress) {
      const lessonProgress = course.progress.lessonProgress[lessonId];
      if (lessonProgress && videoRef.current) {
        videoRef.current.currentTime = lessonProgress.lastWatchedPosition || 0;
      }
    }
  }, [lessonId, course]);

  // Set up video event listeners
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      setProgress((videoElement.currentTime / videoElement.duration) * 100);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      markLessonAsCompleted();
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);

    // Save progress every 5 seconds
    const progressInterval = setInterval(() => {
      if (videoElement.currentTime > 0) {
        saveProgress(videoElement.currentTime);
      }
    }, 5000);

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('ended', handleEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearInterval(progressInterval);
      
      // Save progress on unmount
      if (videoElement.currentTime > 0) {
        saveProgress(videoElement.currentTime);
      }
    };
  }, [lessonId]);

  const saveProgress = async (currentTime: number) => {
    /* 
    try {
      const response = await axios.post(
        `${URL}/course/update-progress`,
        {
          enrollmentId,
          lessonId,
          progress: {
            lastWatchedPosition: currentTime,
            totalTimeWatched: currentTime,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
    */
    // Progress saving temporarily disabled
    console.log('Progress saving is currently disabled:', currentTime);
  };

  const markLessonAsCompleted = async () => {
    try {
      const response = await commonRequest(
        "POST",
        `${URL}/course/progress/${enrollmentId}/complete-lesson`,
        {
          lessonObject: course.courseId.courseContent.lessons.find((lesson: TOBE) => lesson._id === lessonId),
          allLessons: course.courseId.courseContent.lessons
        },
        config
      );
      console.log(response,"response");

      if (response.success) {
        toast.success('Lesson completed!');
        
        // Find the next lesson and update the course state
        if (course && course.courseId && course.courseId.courseContent) {
          const lessons = course.courseId.courseContent.lessons;
          const currentIndex = lessons.findIndex((lesson: TOBE) => lesson._id === lessonId);
          
          if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
            const nextLessonId = lessons[currentIndex + 1]._id;
            
            // Update the course state with the new completed lesson
            const updatedCourse = {
              ...course,
              progress: {
                ...course.progress,
                completedLessons: [...course.progress.completedLessons, lessonId],
                currentLesson: nextLessonId
              }
            };
            
            setCourse(updatedCourse);
            
            // Notify the user that the next lesson is now available
            toast.success('Next lesson is now available!');
          }
        }
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      toast.error('Failed to mark lesson as completed');
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (videoRef.current) {
      const newTime = (newProgress / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Create secure streaming URL
  const streamingUrl = `${URL}/course/stream/${lessonId}?enrollmentId=${enrollmentId}`;

  return (
    <div className="relative w-full bg-black">
      <video
        ref={videoRef}
        className="w-full max-h-[600px]"
        onClick={togglePlayPause}
        src={streamingUrl}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={togglePlayPause}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleProgressChange}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default VideoPlayer;