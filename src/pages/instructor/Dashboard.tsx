import React, { useEffect, useState } from 'react';
import { Bell, Book, Users } from 'lucide-react';
import { IndianRupee } from 'lucide-react'; // Make sure to import IndianRupee
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [enrollment, setEnrollment] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await commonRequest("GET", `${URL}/course/instructor-dashboard`, {}, config);
        if (!response.success) {
          toast.error(response.message);
          return;
        }
        
        setEnrollment(response.data.enrollments);
        setCourses(response.data.courses);
        
        // Calculate revenue with proper type checking
        const calculatedRevenue = response.data.enrollments.reduce((acc: number, enrollment: any) => {
          console.log(enrollment.instructorEarnings,"enrollment.instructorEarnings"); 
          const earnings = Number(enrollment.instructorEarnings) || 0;
          return acc + earnings;
        }, 0);
        
        setTotalRevenue(calculatedRevenue);
        setTotalCourses(response.data.courses.length);
        
        setTotalStudents((prev:any) => {
          // Create a flattened array of all student IDs from all courses
          const allStudentIds = response.data.courses.flatMap((course: any) => 
            course.students || []
          );
          
          // Create a set from the previous state for faster lookup
          const existingIds = new Set(prev);
          
          // Add only new student IDs to the set
          const updatedStudentIds = [...prev];
          
          allStudentIds.forEach((studentId: any) => {
            if (!existingIds.has(studentId)) {
              updatedStudentIds.push(studentId);
              existingIds.add(studentId); // Update the lookup set
            }
          });
          
          return updatedStudentIds;
        });
      } catch (error) {
        toast.error("Error fetching instructor dashboard");
        console.error(error);
      }
    };
    fetchEnrollments();
  }, []);


  return (
    <div className="p-6 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-fuchsia-900">Welcome, Instructor!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Courses', value: totalCourses.toString(), icon: Book },
          { title: 'Total Students', value: totalStudents.length.toString(), icon: Users },
          { title: 'Revenue', value: `₹${totalRevenue.toFixed(2)}`, icon: IndianRupee },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-fuchsia-900 flex items-center">
                {item.icon && <item.icon className="mr-2" size={18} />}
                {item.title}
              </h2>
            </div>
            <div className="p-4">
              <p className="text-4xl font-bold text-fuchsia-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Section */}
      {/* <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-fuchsia-900 flex items-center">
            <Book className="mr-2" size={18} />
            Your Courses
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-fuchsia-100 relative">
                  {course.basicDetails?.coverImage ? (
                    <img 
                      src={course.basicDetails.coverImage} 
                      alt={course.basicDetails?.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-fuchsia-200">
                      <Book size={48} className="text-fuchsia-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-fuchsia-800 text-white px-2 py-1 text-sm">
                    {course.students?.length || 0} students
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-fuchsia-900 truncate">{course.basicDetails?.title}</h3>
                  <p className="text-gray-600 text-sm h-12 overflow-hidden">
                    {course.basicDetails?.description?.substring(0, 80)}
                    {course.basicDetails?.description?.length > 80 ? '...' : ''}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-fuchsia-700 font-medium">
                      ${course.basicDetails?.price || 0}
                    </span>
                    <span className="bg-fuchsia-100 text-fuchsia-800 px-2 py-1 rounded text-xs">
                      {course.basicDetails?.category || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {courses.length === 0 && (
            <p className="text-center py-4 text-gray-500">No courses available.</p>
          )}
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-fuchsia-900 flex items-center">
            <Bell className="mr-2" size={18} />
            Recent Enrollments
          </h2>
        </div>
        <div className="p-4">
          {enrollment.length > 0 ? (
            <ul className="space-y-3">
              {enrollment.map((enrollment:any) => (
                <li key={enrollment?._id} className="text-fuchsia-900 p-2 border-b border-fuchsia-100 last:border-0">
                  New student enrolled in <strong>{enrollment?.courseId?.basicDetails?.title}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-4 text-gray-500">No recent enrollments.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;