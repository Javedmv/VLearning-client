import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Pagination from '../../components/common/Pagination';

interface Student {
  username: string;
  firstName: string;
  lastName: string;
  profession: string;
  isBlocked: boolean;
  email: string;
  profile: {
    avatar: string;
  };
  _id: string;
  qualification?:string;
}

const Students: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({page: 1, limit: 6, total: 0, totalPages: 0});

  
  const fetchStudents = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: meta.page.toString(),
        limit: meta.limit.toString()
      });

      const res = await commonRequest("GET", `${URL}/auth/students?${queryParams}`, null, config);
      console.log(res.data)
      setStudents(() => [
        ...res.data
      ]);
      setMeta(prev => ({
        ...prev,
        total: res.total,
        totalPages: res.totalPages
      }));

    } catch (error) {
      console.error("Failed to fetch students: in ADMIN/STUDENTS", error);
    }
  };
  
  useEffect(() => {
    fetchStudents();
  }, [meta.page]);

  const handlePageChange = (page: number) => {
    try {
      setMeta((prev) => ({ ...prev, page}));
    } catch (error) {
      console.error('Handle page change in instructor ERROR:', error);
    }
  }

  const handleBlockUnblock = async (studentId: string, shouldBlock: boolean) => {
    try {
      const response = await commonRequest(
        "PUT", 
        `${URL}/auth/student/block/${studentId}`, 
        { isBlocked: shouldBlock }, 
        config
      );

      if (response.success) {
        toast.success(response.message);

        setStudents(prev => 
          prev.map(student => 
            student._id === studentId 
            ? { ...student, isBlocked: shouldBlock } 
            : student
          )
        );
      } else {
        toast.error(response?.message);
      }
      
    } catch (error: any) {
      console.error("Failed to block/unblock student", error);
      toast.error(error?.message);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-400">
              {students.length !== 0 && students.map((student) => (
                <tr key={student?._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-400 font-bold flex items-center justify-center">
                        {student?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student?.firstName ? (
                            <>
                              {student.firstName.charAt(0).toUpperCase() + student.firstName.slice(1).toLowerCase()}{" "}
                              {student.lastName.charAt(0).toUpperCase() + student.lastName.slice(1).toLowerCase()}
                            </>
                          ) : (
                            student?.username.charAt(0).toUpperCase() + student.username.slice(1).toLowerCase()
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student?.email}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${student?.qualification ? "text-gray-500": "text-red-500"}`}> {student?.qualification || "value not provided"}</td>                  
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

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 flex space-x-2">
                    <ConfirmationModal
                      triggerText={student.isBlocked ? 'Unblock' : 'Block'}
                      title={`${student.isBlocked ? 'Unblock' : 'Block'} Student`}
                      description={`Are you sure you want to ${student.isBlocked ? 'unblock' : 'block'} student ${student?.email}. This action can be reversed.`}
                      onConfirm={() => handleBlockUnblock(student._id, !student.isBlocked)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {students.length === 0 && (
        <div className="text-center text-gray-500 mt-6">
          No Students found!!
        </div>
        )}
      </div>
        {students.length > 0 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        )}
    </div>
  );
};

export default Students;