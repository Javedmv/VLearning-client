import React from 'react';
import { UserIcon, Award, BookOpen } from 'lucide-react';
import { User } from '../../../types/Users';

interface InstructorCardProps {
  instructor?: User;
}

const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  return (
    <>
    <div className="bg-gray-200 rounded-lg shadow-md p-8">
      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
        {instructor?.profile?.avatar ? (
          <img
          src={instructor.profile.avatar}
              alt={`${instructor.firstName} ${instructor.lastName}`}
              className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-gray-500" />
            )}
        </div>
        <div>
          <h3 className="text-2xl font-semibold">
            {instructor?.firstName && instructor.firstName.charAt(0).toUpperCase() + instructor.firstName.slice(1) + " "} 
            {instructor?.lastName && instructor.lastName.charAt(0).toUpperCase() + instructor.lastName.slice(1)}
          </h3>
          <p className="text-lg text-gray-600">{instructor?.profession}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-blue-500" />
          <span className="text-lg">{instructor?.qualification}</span>
        </div>
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span className="text-lg">Course Instructor</span>
        </div>
      </div>

      <p className="text-gray-600 leading-relaxed text-lg">{instructor?.profileDescription}</p>
    </div>
    </>
  );
};


export default InstructorCard;