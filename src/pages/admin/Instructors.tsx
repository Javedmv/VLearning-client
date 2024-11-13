import React from 'react';
import { Search, Filter, MoreVertical, Star } from 'lucide-react';

const Instructors:React.FC = () => {
  const instructors = [
    { 
      id: 1, 
      name: 'Dr. Robert Brown', 
      email: 'robert@vlearning.com', 
      specialization: 'Web Development',
      rating: 4.8,
      students: 1234,
      courses: 5
    },
    { 
      id: 2, 
      name: 'Prof. Emily White', 
      email: 'emily@vlearning.com', 
      specialization: 'Data Science',
      rating: 4.9,
      students: 2156,
      courses: 3
    },
    { 
      id: 3, 
      name: 'Dr. Michael Chen', 
      email: 'michael@vlearning.com', 
      specialization: 'Machine Learning',
      rating: 4.7,
      students: 1876,
      courses: 4
    },
    { 
      id: 4, 
      name: 'Prof. Sarah Johnson', 
      email: 'sarah@vlearning.com', 
      specialization: 'UI/UX Design',
      rating: 4.9,
      students: 1543,
      courses: 6
    }
  ];

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
            <div key={instructor.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
                    {instructor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{instructor.name}</h3>
                    <p className="text-sm text-gray-500">{instructor.specialization}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
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
              </div>

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