import { Trash2, Plus } from 'lucide-react';
import { Lesson } from '../../../pages/instructor/EditCoursePage';

interface CourseContentProps {
  lessons: Lesson[];
  onAddLesson: () => void;
  onUpdateLesson: (index: number, field: string, value: any) => void;
  onDeleteLesson: (index: number) => void;
  onVideoUpload: (index: number, file: File) => void;
  onRemoveVideo: (index: number) => void;
}

export const CourseContentSection = ({
  lessons,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onVideoUpload,
  onRemoveVideo
}: CourseContentProps) => {

    return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">Course Content</h2>
        
        {lessons.map((lesson, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-md">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                    <input
                    value={lesson.title}
                    onChange={(e) => onUpdateLesson(index, 'title', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Lesson title"
                    />
                    <textarea
                    value={lesson.description}
                    onChange={(e) => onUpdateLesson(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded-md h-24"
                    placeholder="Lesson description"
                    />
                </div>
                
                <div className="space-y-2">
                    {/* Show Video Preview if available */}
                    {lesson?.videoPreview?.url ? (
                        <div className="relative border-2 border-orange-500 p-2 rounded-md">
                        <label className="block text-sm font-medium text-gray-700">
                            Current Video (Preview)
                        </label>
                        <video controls className="w-58 h-48 mt-2 rounded-md">
                            <source src={lesson.videoPreview.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <button
                            type="button"
                            onClick={() => onRemoveVideo(index)}
                            className="absolute top-0 right-0 bg-white rounded-full p-1 hover:bg-gray-200"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        </div>
                    ) : lesson?.videoUrl && typeof lesson?.videoUrl === "string" ? (
                        /* Show Video URL if Preview is NOT available */
                        <div className="relative border p-2 rounded-md">
                        <label className="block text-sm font-medium text-gray-700">
                            Current Video
                        </label>
                        <video controls className="w-58 h-48 mt-2 rounded-md">
                            <source src={lesson?.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                        <button
                            aria-label="Delete Video"
                            type="button"
                            onClick={() => onRemoveVideo(index)}
                            className="absolute bottom-0 right-0 bg-white rounded-full p-1 hover:bg-gray-200"
                        >
                            <Trash2 className="w-5 h-5 text-red-500 hover:text-red-500 hover:bg-black" />
                        </button>
                        </div>
                    ) : (
                        /* Show File Upload input if no video exists */
                        <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                            e.target.files?.[0] && onVideoUpload(index, e.target.files[0])
                        }
                        className="block w-full text-sm border border-gray-400 rounded-md p-2"
                        />
                    )}
                </div>
                <div className="h-full flex items-center">
                <button
                    aria-label="Delete Lesson"
                    onClick={() => onDeleteLesson(index)}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
                </div>

            </div>
        </div>
        ))}
        
        <button
        type="button"
        onClick={onAddLesson}
        className="flex items-center text-indigo-600 hover:text-indigo-700"
        >
        <Plus className="w-5 h-5 mr-1" />
        Add New Lesson
        </button>
    </div>
)}