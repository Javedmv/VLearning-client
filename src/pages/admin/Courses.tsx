import React from 'react';
import { Search, Filter, MoreVertical, Users, Clock, BookOpen } from 'lucide-react';

const Courses:React.FC = () => {
  const courses = [
    {
      id: 1,
      title: 'Complete Web Development Bootcamp',
      instructor: 'Dr. Robert Brown',
      category: 'Development',
      level: 'Beginner',
      duration: '12 weeks',
      students: 2345,
      price: 599,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      id: 2,
      title: 'Data Science Fundamentals',
      instructor: 'Prof. Emily White',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '8 weeks',
      students: 1876,
      price: 599,
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      id: 3,
      title: 'UI/UX Design Masterclass',
      instructor: 'Sarah Johnson',
      category: 'Design',
      level: 'Advanced',
      duration: '10 weeks',
      students: 1543,
      price: 599,
      image: 'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&q=80&w=300&h=200'
    },
    {
      id: 4,
      title: 'Machine Learning A-Z',
      instructor: 'Dr. Michael Chen',
      category: 'AI & ML',
      level: 'Advanced',
      duration: '16 weeks',
      students: 2156,
      price: 599,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=300&h=200'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600">Manage your course catalog</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add New Course
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{course.instructor}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    {course.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students}
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    12 modules
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-bold">₹{course.price}</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Edit Course
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;