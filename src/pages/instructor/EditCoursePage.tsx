import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { commonRequest,URL as BURL } from '../../common/api';
import { config } from '../../common/configurations';
import { uploadEditedLessonTos3 } from '../../common/s3';
import { BasicDetailsSection } from '../../components/instructor/editCourse/BasicDetailsSection';
import { LearningPointsSection } from '../../components/instructor/editCourse/LearningPointsSection';
import { CourseContentSection } from '../../components/instructor/editCourse/CourseContentSection';
import { PricingSection } from '../../components/instructor/editCourse/PricingSection';
import toast from 'react-hot-toast';
import { PenSquare } from 'lucide-react';
import { getVideoDuration } from '../../common/functions';


// types.ts
export interface Category {
  _id: string;
  name: string;
}

export interface Lesson {
  title: string;
  description: string;
  duration?: string;
  videoUrl?: string | File;
  isIntroduction?: boolean;
  videoPreview?: {
    url?: string;
    duration?: string;
  };
}

export interface Course {
  _id: string;
  basicDetails: {
    title: string;
    description: string;
    category: Category;
    language: string;
    whatWillLearn: string[];
    thumbnail?: string | File;
    thumbnailPreview?: string;
  };
  courseContent: {
    lessons: Lesson[];
  };
  pricing: {
    type: 'free' | 'paid';
    amount: number;
  };
  metadata?: {
    updatedAt?: string;
    updatedBy?: string;
  };
}

const EditCoursePage = () => {
  const { state: { course } } = useLocation();
  const [courseData, setCourseData] = useState<any>(course);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (course) {
      setCourseData(course);
    }
  }, [course]);

  const fetchCategory = async () => {
    try {
      const res = await commonRequest(
        'GET',
        `${BURL}/course/get-category-status-true`,
        {},
        config
      );
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);


  // Handlers
  const handleLearningPointChange = (index: number, value: string) => {
    const updatedPoints = [...courseData.basicDetails.whatWillLearn];
    updatedPoints[index] = value;
    setCourseData({
      ...courseData,
      basicDetails: { ...courseData.basicDetails, whatWillLearn: updatedPoints }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      if (!courseData) {
        toast.error('Course data not loaded');
        return;
      }
  
      // Basic validations
      if (!courseData.basicDetails.title.trim()) {
        toast.error('Course title is required');
        return;
      }
  
      if (!courseData.basicDetails.description.trim()) {
        toast.error('Course description is required');
        return;
      }
  
      if (courseData.basicDetails.description.trim().length < 200) {
        toast.error('Description must be at least 200 characters');
        return;
      }
  
      if (!courseData.basicDetails.category) {
        toast.error('Please select a category');
        return;
      }
  
      if (!courseData.basicDetails.language) {
        toast.error('Please select a language');
        return;
      }
  
      // Learning points validation
      const learningPoints = courseData.basicDetails.whatWillLearn || [];
      if (learningPoints.length < 2) {
        toast.error('At least two learning point is required');
        return;
      }
  
      if (learningPoints.some((point:string) => !point.trim())) {
        toast.error('Learning points cannot be empty');
        return;
      }
  
      // Lessons validation
      const lessons = courseData.courseContent.lessons || [];
      if (lessons.length < 2) {
        toast.error('At least two lesson is required');
        return;
      }
  
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        if (!lesson.title.trim()) {
          toast.error(`Lesson ${i + 1}: Title is required`);
          return;
        }
        if (!lesson.description.trim()) {
          toast.error(`Lesson ${i + 1}: Description is required`);
          return;
        }
        if (!lesson.videoUrl && !lesson.videoPreview?.url) {
          toast.error(`Lesson ${i + 1}: Video is required`);
          return;
        }
      }

      if (courseData.pricing.type === "paid") {
        if (courseData.pricing.amount === "" || courseData.pricing.amount <= 0) {
          toast.error("Price should be greater than 0.");
          return;
        }
      }

      const updatedCourse = await uploadEditedLessonTos3(courseData);
      setCourseData(updatedCourse);
      console.log(courseData,"BEFORE")
      const response = await commonRequest('PUT', `/course/edit-course/${courseData._id}`, {course: updatedCourse}, config);
      if(response.success){
        toast.success('Course updated successfully'); 
        navigate('/instructor/courses');
      }else{
        toast.error(response.message || 'Update failed');
      }
    } catch (error:any) {
      toast.error(error.message || 'Update failed');
    }
  };

  const handleRemoveThumbnail = () => {
    try {
        
        setCourseData({
          ...courseData,
          basicDetails: {
            ...courseData.basicDetails,
            thumbnail: undefined,
            thumbnailPreview: undefined
          }
        });
    } catch (error) {
      console.log(error)
    }
  }
  const handleAddLearningPoints = () => {
    try {
      setCourseData({
        ...courseData,
        basicDetails: {
          ...courseData.basicDetails,
          whatWillLearn: [...courseData.basicDetails.whatWillLearn, '']
        }
      });
    } catch (error) {
      console.log(error)
    }
  }

  const handleUploadVideo = async (index:number, file:File) => {
    try {
      if (!(file instanceof File)) {
        toast.error("Please upload a valid video file.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error("Please upload a valid video file.");
        return;
      }

      const videoPreview = URL.createObjectURL(file);

      const formattedDuration = await getVideoDuration(videoPreview);

      const updatedLessons = [...courseData.courseContent.lessons];

      updatedLessons[index] = await {
        ...updatedLessons[index],
        videoUrl: file,
        videoPreview: {
          url: videoPreview,
          duration: formattedDuration
        },
        duration: formattedDuration,
      };
      console.log(updatedLessons[index])
      setCourseData({
        ...courseData,
        courseContent: {
          ...courseData.courseContent,
          lessons: updatedLessons,
        },
      });

    } catch (error) {
      console.log(error)
    }
  }

  const handleRemoveVideo = async (index:number) => {
    try {
      const updatedLessons = [...courseData.courseContent.lessons];
      const { videoPreview, ...restLesson } = updatedLessons[index];
  
      updatedLessons[index] = await {
        ...restLesson,
        videoUrl: null,
        duration: null,
      };

      setCourseData({
        ...courseData,
        courseContent: {
          ...courseData.courseContent,
          lessons: updatedLessons,
        },
      });
    } catch (error) {
      console.log(error)
    }
  }

  const handleDeleteLesson = (index:number) => {
    try {
      const updatedLessons = courseData?.courseContent?.lessons.filter((_:any, i:number) => i !== index);
      setCourseData({
        ...courseData,
        courseContent: { ...courseData.courseContent, lessons: updatedLessons }
      });    
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <PenSquare className="w-8 h-8" />
          Edit Course
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <BasicDetailsSection
          courseData={courseData}
          categories={categories}
          setCourseData={setCourseData}
          onRemoveThumbnail={() => handleRemoveThumbnail()}
        />

        <LearningPointsSection
          points={courseData.basicDetails.whatWillLearn}
          onAdd={() => handleAddLearningPoints()}
          onChange={handleLearningPointChange}
          onDelete={(index) => {
            const updatedPoints = courseData.basicDetails.whatWillLearn.filter((_:any, i:number) => i !== index);
            setCourseData({
              ...courseData,
              basicDetails: { ...courseData.basicDetails, whatWillLearn: updatedPoints }
            });
          }}
        />

        <CourseContentSection
          lessons={courseData?.courseContent?.lessons}
          onAddLesson={() => {
            setCourseData({
              ...courseData,
              courseContent: {
                ...courseData.courseContent,
                lessons: [...courseData.courseContent.lessons, {
                  title: '',
                  description: '',
                  isIntroduction: false
                }]
              }
            });
          }}
          onUpdateLesson={(index, field, value) => {
            const updatedLessons = [...courseData.courseContent.lessons];
            updatedLessons[index] = { ...updatedLessons[index], [field]: value };
            setCourseData({
              ...courseData,
              courseContent: { ...courseData.courseContent, lessons: updatedLessons }
            });
          }}
          onDeleteLesson={(index) => handleDeleteLesson(index)}
          onVideoUpload={async (index:number, file:File) => handleUploadVideo(index,file)}
          onRemoveVideo={(index:number) => handleRemoveVideo(index) }
        />

        <PricingSection
          pricing={courseData.pricing}
          onTypeChange={(type) => setCourseData({
            ...courseData,
            pricing: { type, amount: type === 'free' ? 0 : courseData.pricing.amount }
          })}
          onAmountChange={(amount) => setCourseData({
            ...courseData,
            pricing: { ...courseData.pricing, amount }
          })}
        />

        <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Update Course
        </button>
      </form>
    </div>
  );
};

export default EditCoursePage;