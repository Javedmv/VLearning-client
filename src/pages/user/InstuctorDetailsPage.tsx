import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  BookOpen, 
  Star,
  Users, 
  Clock,
  Award,
  Github,
  Linkedin,
//   Globe
} from 'lucide-react';
import InstructorCourses from '../../components/user/InstructorDetails/CourseDetails';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/home/Navbar';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import {User} from "../../types/Users"
import { Instagram } from 'react-feather';
import toast from 'react-hot-toast';
import { capitalizeFirstLetter } from '../../common/functions';

const InstructorDetails: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);
    const { id } = useParams();
    const [instructorData, setInstructorData] = useState<User | undefined>(undefined);
    const [courseData, setCourseData] = useState<any[]>([]);

    const fetchUser = async (id:string) => {
        // TODO:complete the backend and frontend showing one day back!!!
        const userDetails = await commonRequest("GET",`${URL}/course/instructor-details/${id}`,{},config)
        const courseDetails = await commonRequest("GET",`${URL}/course/all-course-insructor/${id}`,{},config)
        if(!userDetails.success){
            toast.error(userDetails?.message)
            return;
        }
        if(!courseDetails.success){
            toast.error(courseDetails?.message)
            return;
        }
        setInstructorData(userDetails.data);
        setCourseData(courseDetails.data)
    }

    useEffect(() => {
        fetchUser(id!);
    },[])
    let instructorName;
    if(instructorData){
        instructorName = capitalizeFirstLetter(instructorData?.firstName) + " " +capitalizeFirstLetter(instructorData?.lastName);
    }

  return (
    <>
    <Navbar User={user} />
    <div className="min-h-screen bg-gray-300 py-12 px-4 sm:px-6 lg:px-8 bg-opacity-80">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-900">
        <div 
            className="absolute inset-0 bg-cover bg-center shadow-lg opacity-60"
            // style={{
            // backgroundImage: `url(${instructorData?.profile?.avatar})`
            // }}
        />
        <div className="absolute -bottom-20 left-8">
            <img
            src={instructorData?.profile?.avatar}
            alt={instructorData?.username}
            className="w-40 h-40 rounded-full border-4 shadow-lg object-cover"
            />
        </div>
        </div>

          
          <div className="pt-24 pb-6 px-8">
            <div className="flex justify-between items-start">
              <div>
              <h1 className="text-3xl font-bold ml-2 font-bebas-neue">
                Instructor <span className="underline">{instructorName}</span>
                <span className="blink text-fuchsia-900">!</span>
              </h1>
                {/* <p className="text-lg text-gray-600 mt-1">{instructorData?.title}</p> */}
              </div>
              <div className="flex space-x-4">
                {instructorData?.contact?.socialMedia?.github && <a href={instructorData?.contact?.socialMedia?.github} className="text-gray-600 hover:text-gray-900">
                 <Github className="w-6 h-6" />
                </a> }
                {instructorData?.contact?.socialMedia?.linkedIn && <a href={instructorData?.contact?.socialMedia?.linkedIn} className="text-gray-600 hover:text-gray-900">
                  <Linkedin className="w-6 h-6" />
                </a>}
                {instructorData?.contact?.socialMedia?.instagram && <a href={instructorData?.contact?.socialMedia?.instagram} className="text-gray-600 hover:text-gray-900">
                  <Instagram className="w-6 h-6" />
                </a>}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <span className="ml-2 text-lg font-semibold">
                {courseData
                    ?.reduce((total, course) => total + (course.students?.length || 0), 0)
                    .toLocaleString()}{" "}
                Students
                </span>
            </div>
          </div>

          {courseData && <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <BookOpen className="w-8 h-8 text-green-500" />
              <span className="ml-2 text-lg font-semibold">{courseData.length ?? 0} Courses</span>
            </div>
          </div>}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
            <Award className="w-8 h-8 text-blue-500 mb-2"/>

              <span className="ml-2 text-lg font-semibold">{instructorData?.qualification}</span>
            </div>
            </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 text-purple-500 mb-1" />
                <span className="text-sm font-medium text-gray-500">
                Tutor of VLearning
                </span>
                <span className="text-lg font-bold text-purple-700">
                {(() => {
                    if (!instructorData?.createdAt) return "N/A";
                    
                    const createdAt = new Date(instructorData.createdAt);
                    const now = new Date();

                    const years = now.getFullYear() - createdAt.getFullYear();
                    const months = now.getMonth() - createdAt.getMonth();
                    const days = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

                    if (years > 0) {
                    return `${years} year${years > 1 ? "s" : ""}`;
                    } else if (months > 0) {
                    return `${months} month${months > 1 ? "s" : ""}`;
                    } else {
                    return `${days} day${days > 1 ? "s" : ""}`;
                    }
                })()}
                </span>
            </div>
            </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Bio */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">{instructorData?.profileDescription}</p>
          </div>

          {/* Contact & Expertise */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2" />
                <a href={`mailto:${instructorData?.email}`} className="hover:text-blue-600">
                  {instructorData?.email}
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                    {Array.from(
                    new Set(courseData?.map((course) => course.basicDetails?.category?.name))
                    )
                    .filter(Boolean) // Remove undefined or null values
                    .map((category, index) => (
                        <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-fuchsia-900 rounded-full font-sm font-bold"
                        >
                        {category}
                        </span>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <InstructorCourses courses={courseData} name={instructorName || ""} />
    </>
  );
};

export default InstructorDetails;