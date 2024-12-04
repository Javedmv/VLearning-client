import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Star } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';

interface Instructor {
  username:string;
  firstName: string;
  lastName: string;
  profession: string;
  isBlocked: boolean;
  isVerified: boolean;
  cv: string;
  email: string;
  profile: {
    avatar: string;
    dob: string;
    gender: string;
  };
  _id: string;
  phoneNumber:string;
  profileDescription:string;
}

const Instructors:React.FC = () => {
  const {user} = useOutletContext<{user: any}>();
  const [instructors , setInstructors ] = useState<Instructor[]>([])

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await commonRequest("GET", `${URL}/auth/instructors`, {}, config);
        setInstructors(res.data)
      } catch (error) {
        console.error("Failed to fetch students: in ADMIN/INSTRUCTOR", error);
      }
    };
  
    fetchInstructor();
  }, [commonRequest]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
        <p className="text-gray-600">Manage your course instructors</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search instructors..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {instructors.map((instructor) => (
            <div key={instructor._id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-lg font-extrabold">
                    {instructor?.firstName ? instructor?.firstName?.charAt(0).toUpperCase() : instructor?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                  {
                    instructor?.firstName ? 
                    (
                    <h3 className="text-lg font-semibold">{instructor?.firstName?.charAt(0).toUpperCase() + instructor?.firstName?.slice(1).toLowerCase()}{" "}
                    {instructor?.lastName?.charAt(0).toUpperCase() + instructor?.lastName?.slice(1).toLowerCase()}</h3>
                    )
                    :
                    (
                      <h3 className="text-lg font-semibold">{instructor?.username?.charAt(0).toUpperCase() + instructor?.username?.slice(1).toLowerCase()}</h3>
                    )
                  }
                  <p className="text-sm text-gray-500">{instructor?.profession}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-medium">{instructor.rating}</span>
                  <span className="text-gray-500 ml-1">rating</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{instructor.students.toLocaleString()}</span>
                  <span className="text-gray-500"> students</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{instructor.courses}</span>
                  <span className="text-gray-500"> courses</span>
                </div>
              </div> */}

              <div className="mt-4 pt-4 border-t">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Instructors;