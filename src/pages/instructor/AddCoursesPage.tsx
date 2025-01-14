import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddCourse from '../../components/instructor/AddCourse/AddCourse';
import CourseContent from '../../components/instructor/AddCourse/CourseContent';
import PricingDetails from '../../components/instructor/AddCourse/PricingDetails';
import Preview from '../../components/instructor/AddCourse/Preview';
import ProgressBar from '../../components/instructor/AddCourse/ProgressBar';
import { BasicDetails, CourseData, CourseContents, PricingDetail, Lesson } from '../../types/Courses';
import { RootState } from '../../redux/store';
import { uploadLessonsToS3 } from '../../common/s3';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STEPS = ['Basic Details', 'Course Content', 'Pricing', 'Preview'];

const AddCoursePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<CourseData>({
    instructorId: user?.id || '', // Assuming user has an id
    instructor: user?._id || { id: '', name: '' }, // Default instructor data if user is not available
    basicDetails: {
      title: '',
      description: '',
      thumbnail: '',
      thumbnailPreview: null,
      language: '',
      category: '',
      whatWillLearn: [],
    },
    courseContent: {
      lessons: [],
    },
    pricing: {
      type: 'free',
      amount: 0,
      hasLifetimeAccess: true,
    },
  });
  

  const handleBasicDetailsSubmit = (values: BasicDetails) => {
    setCourseData(prev => ({
      ...prev,
      basicDetails: values,
    }));
    setCurrentStep(1);
  };

  const handleCourseContentSubmit = (values: CourseContents) => {
    setCourseData(prev => ({
      ...prev,
      courseContent: values,
    }));
    setCurrentStep(2);
  };

  const handlePricingSubmit = (values: PricingDetail) => {
    setCourseData(prev => ({
      ...prev,
      pricing: {
        ...values,
      },
    }));
    setCurrentStep(3);
  };

  const handlePublish = async () => {
    try {
      const currentDate = new Date().toISOString();
  
      // Prepare metadata for publishing
      const publishData = {
        ...courseData,
        metadata: {
          createdBy: user?.email,
          createdAt: currentDate,
          updatedBy: user?.email,
          updatedAt: currentDate,
        },
      };
  
      console.log('Publishing course:', publishData);
  
      // Upload lessons to S3 and sanitize lessons
      const updatedLessons = await uploadLessonsToS3(courseData);
  
      // Map and sanitize lessons
      const sanitizedLessons = updatedLessons.courseContent.lessons.map((lesson: any) => {
        const { videoPreview, ...lessonWithoutPreview } = lesson; // Remove videoPreview
        return {
          ...lessonWithoutPreview,
          videoUrl: lessonWithoutPreview.videoUrl || null, // Ensure videoUrl is compatible with Lesson interface
        };
      });
  
      // Prepare sanitized course data
      const sanitizedCourseData: CourseData = {
        ...publishData,
        courseContent: {
          ...publishData.courseContent,
          lessons: sanitizedLessons as Lesson[], // Explicitly cast to Lesson[]
        },
        basicDetails: {
          title: publishData.basicDetails.title,
          description: publishData.basicDetails.description,
          thumbnail: publishData.basicDetails.thumbnail,
          language: publishData.basicDetails.language,
          category: publishData.basicDetails.category,
          whatWillLearn: publishData.basicDetails.whatWillLearn,
        },
        pricing: publishData.pricing,
      };
  
      console.log('Sanitized course data:', sanitizedCourseData);
  
      // Send updated data to the backend
      const response = await commonRequest(
        "POST",
        `${URL}/course/add-course`,
        sanitizedCourseData,
        config
      );

      if(!response.success){
        toast.error("failed to add Course, Please try again!!")
        return;
      }
      toast.success(response.message)
      navigate("/instructor/courses")
    } catch (error: any) {
      console.log(error.message);
    }
  };
  
  
  

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AddCourse
            onSubmit={handleBasicDetailsSubmit}
            courseData={courseData.basicDetails}
            onNext={() => setCurrentStep(1)}
          />
        );
      case 1:
        return (
          <CourseContent
            onSubmit={handleCourseContentSubmit}
            onBack={() => setCurrentStep(0)}
            onNext={() => setCurrentStep(2)}
            initialValues={courseData.courseContent}
          />
        );
      case 2:
        return (
          <PricingDetails
            onSubmit={handlePricingSubmit}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
            pricing={courseData.pricing}
          />
        );
      case 3:
        return (
          <Preview
            courseData={courseData}
            onBack={() => setCurrentStep(2)}
            onSubmit={handlePublish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-pink-300 bg-opacity-70">
        <ProgressBar currentStep={currentStep} steps={STEPS} />
        {renderStep()}
      </div>
    </div>
  );
};

export default AddCoursePage;
