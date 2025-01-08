import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AddCourse from '../../components/instructor/AddCourse/AddCourse';
import CourseContent from '../../components/instructor/AddCourse/CourseContent';
import PricingDetails from '../../components/instructor/AddCourse/PricingDetails';
import Preview from '../../components/instructor/AddCourse/Preview';
import ProgressBar from '../../components/instructor/AddCourse/ProgressBar';
import { BasicDetails, CourseData, CourseContents, PricingDetail } from '../../types/Courses';
import { RootState } from '../../redux/store';
import { uploadLessonsToS3 } from '../../common/s3';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';

const STEPS = ['Basic Details', 'Course Content', 'Pricing', 'Preview'];

const AddCoursePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<CourseData>({
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

      // Assuming lessons is part of courseData, upload videos for each lesson to S3
      const updatedLessons = await uploadLessonsToS3(courseData);

      // Once the videos are uploaded, update the courseData with the new lesson data
      const updatedCourseData = {
        ...publishData,
        courseContent: {
          ...publishData.courseContent,
          lessons: updatedLessons, // Lessons with updated video URLs
        },
      };

      // Handle course publication logic here (e.g., send `updatedCourseData` to the backend or API)
      console.log('Updated course data with uploaded videos:', updatedCourseData);
      const response = await commonRequest("POST",`${URL}/course/add-course`,updatedCourseData,config);
      console.log(response)

    } catch (error:any) {
      console.log(error.message)   
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
