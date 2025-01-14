import React from 'react';
import { CheckCircle2, Globe } from 'lucide-react';
import { BasicDetails } from '../../../types/Courses';

interface CourseDetailsProps {
  details?: BasicDetails;
}

const CourseDetailsComponent: React.FC<CourseDetailsProps> = ({ details }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{details?.title}</h1>
        <p className="text-gray-600 leading-relaxed">{details?.description}</p>
      </div>

      <div className="flex items-center justify-between gap-2 text-gray-600">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          <span className="text-lg">Language: {details?.language}</span>
        </div>

        {/* Category Details Section */}
        <div>
          {details?.category && (
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-md font-semibold text-pink-800">
                {
                  // Check if category is an object (DisplayCategory) before accessing properties
                  typeof details?.category !== 'string'
                    ? details?.category?.name
                    : ''
                }
              </h3>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">What you'll learn</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {details?.whatWillLearn?.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


export default CourseDetailsComponent;