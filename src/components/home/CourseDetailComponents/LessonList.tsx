import React from 'react';
import { Play, Clock } from 'lucide-react';
import { Lesson } from '../../../pages/common/CourseDetailPage';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface LessonListProps {
  lessons?: Lesson[];
  onSelectLesson?: (lesson: Lesson) => void; // No change needed here
  currentLessonId?: string;
  isEnrolled: boolean;
  courseId: string;
}


const LessonList: React.FC<LessonListProps> = ({ lessons,  currentLessonId,isEnrolled}) => {

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold">Course Content</h2>
        <p className="text-gray-600 text-lg mt-2">{lessons?.length || 0} lessons</p>
      </div>
      <div className="divide-y">
        {lessons?.map((lesson) => (
          <button
            key={lesson._id}
            onClick={() => {
              if (isEnrolled) {
                // Navigate to the new page with courseId and lessonId
                navigate(`/my-learnings`)
              } else {
                toast.error('Enroll to continue!!'); // Show a warning if not enrolled
              }
            }} // Triggers onSelectLesson
            className={`w-full p-6 text-left hover:bg-gray-50 transition-colors ${
              currentLessonId === lesson._id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <Play
                className={`w-6 h-6 ${
                  currentLessonId === lesson._id ? 'text-fuchsia-900' : 'text-gray-400'
                }`}
              />
              <div className="flex-1 overflow-hidden">
                <h3 className="font-medium text-lg truncate">{lesson.title}</h3>
                <p className="text-gray-600 mt-1 truncate">{lesson.description}</p>
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
  );
};


export default LessonList;