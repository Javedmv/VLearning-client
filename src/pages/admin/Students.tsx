import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';

interface Student {
  firstName: string;
  lastName: string;
  profession: string;
  isBlocked: boolean;
  email: string;
  profile: {
    avatar: string;
  };
  _id: string;
}

const Students:React.FC = () => {
  const {user} = useOutletContext<{user: any}>();
  const [students, setStudents] = useState<Student[]>([])
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await commonRequest("GET", `${URL}/auth/students`, null, config);
        setStudents(res.data)
      } catch (error) {
        console.error("Failed to fetch students: in ADMIN/STUDENTS", error);
      }
    };
  
    fetchStudents();
  }, [commonRequest]);



  const handleBlockUnblock = async (studentId: string, shouldBlock: boolean) => {
    try {
      await commonRequest("PUT", `${URL}/auth/student/block/${studentId}`, 
        { isBlocked: shouldBlock }, 
        config
      ).then((res) => {
        res?.success? toast.success(res?.message) : toast.error(res?.message)
      })

      setStudents(prev => 
        prev.map(student => 
          student._id === studentId 
            ? { ...student, isBlocked: shouldBlock } 
            : student
        )
      )
      
    } catch (error:any) {
      console.error("Failed to block/unblock student", error);
      toast.error(error?.message)
    }
   };
   
   const handleDelete = async (studentId: string) => {
    try {
      await commonRequest("DELETE", `${URL}/auth/student/delete/${studentId}`, {}, config)
      .then((res) => {
        res?.success? toast.success(res?.message) : toast.error(res?.message)
      })
      setStudents(prev => prev.filter(student => student._id !== studentId));
    } catch (error:any) {
      console.error("Failed to delete student", error);
      toast.error(error?.message)
    }
   };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600">Manage your students and their progress</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student?._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-400 font-bold flex items-center justify-center">
                        {student?.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student?.firstName.charAt(0).toUpperCase() + student?.firstName.slice(1).toLowerCase()}{" "}
                          {student?.lastName.charAt(0).toUpperCase() + student?.lastName.slice(1).toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.profession}</td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${student?.progress}%` }}
                      ></div>
                    </div>
                  </td> */}
                  {student.isBlocked ? (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="w-20 inline-flex justify-center text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-800 px-2">
                        Blocked
                      </span>
                    </td>
                    ) : (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="w-20 inline-flex justify-center text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800 px-2">
                        Active
                      </span>
                    </td>
                    )}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex space-x-2">
                      <button 
                        onClick={() => handleBlockUnblock(student._id, !student.isBlocked)}
                        className={`w-24 px-4 py-2 rounded-md text-s font-semibold transition-colors duration-300 ${
                          student.isBlocked 
                            ? 'bg-green-500 text-white hover:bg-green-800' 
                            : 'bg-red-500 text-white hover:bg-red-800'
                        }`}
                      >
                        {student.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-s hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;