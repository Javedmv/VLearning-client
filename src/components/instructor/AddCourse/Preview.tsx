import React from 'react';
import { Clock, Infinity, Play, Book, Globe, Tag } from 'lucide-react';
import { CourseData } from '../../../types/Courses';

interface PreviewProps {
  courseData: CourseData;
  onBack: () => void;
  onSubmit: () => void;
}

const Preview: React.FC<PreviewProps> = ({ courseData, onBack, onSubmit }) => {
  const totalLessons = courseData?.courseContent?.lessons?.length || 0;
  const pricing = courseData?.pricing;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Course Header */}
      <div className="relative h-64 bg-gradient-to-r from-fuchsia-600 to-pink-600">
        {courseData?.basicDetails?.thumbnailPreview && (
          <img
            src={courseData.basicDetails.thumbnailPreview}
            alt={courseData.basicDetails.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative h-full p-8 flex flex-col justify-end">
          <h1 className="text-4xl font-bold text-white mb-4">{courseData.basicDetails?.title}</h1>
          <div className="flex items-center space-x-4 text-white">
            <span className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              {typeof courseData?.basicDetails?.category == "string" && courseData?.basicDetails?.category}
            </span>
            <span className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              {courseData?.basicDetails?.language}
            </span>
            <span className="flex items-center">
              <Book className="w-4 h-4 mr-2" />
              {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Course Description */}
          <section>
            <h2 className="text-2xl font-bold mb-4">About This Course</h2>
            <p className="text-gray-600 whitespace-pre-wrap w-3/4">{courseData?.basicDetails?.description}</p>
          </section>

          {/* What You'll Learn */}
          <section>
            <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courseData?.basicDetails?.whatWillLearn?.map((point, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="mt-1 text-fuchsia-600">•</div>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Course Content */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <div className="space-y-4">
              {courseData?.courseContent?.lessons?.map((lesson, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Play className="w-5 h-5 text-fuchsia-600" />
                      <h3 className="font-medium">
                        {lesson?.isIntroduction ? 'Introduction' : `Lesson ${index + 1}`}: {lesson?.title}
                      </h3>
                    </div>
                    {lesson?.duration && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {lesson?.duration}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-600 text-sm pl-8">{lesson?.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Pricing Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 border rounded-lg p-6 shadow-sm">
            <div className="text-center mb-6">
              {pricing?.type === 'free' ? (
                <div className="text-2xl font-bold text-fuchsia-600">Free</div>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-fuchsia-600">
                  ₹ {pricing?.amount}
                  </div>
                  <div className="text-sm text-gray-500">
                    {pricing?.subscriptionType === 'one-time' ? 'One-time payment' : 'Subscription'}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              {pricing?.hasLifetimeAccess && (
                <div className="flex items-center">
                  <Infinity className="w-4 h-4 mr-2" />
                  <span>Lifetime Access</span>
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between p-8 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700"
        >
          Publish Course
        </button>
      </div>
    </div>
  );
};

export default Preview;
