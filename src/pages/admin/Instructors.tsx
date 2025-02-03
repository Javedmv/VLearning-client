import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Star, Check, X } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import toast from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

interface Instructor {
  username: string;
  firstName: string;
  lastName: string;
  profession: string;
  isBlocked: boolean;
  isVerified: 'approved' | 'rejected' | 'requested';
  cv: string;
  email: string;
  profile: {
    avatar: string;
    dob: string;
    gender: string;
  };
  _id: string;
  phoneNumber: string;
  profileDescription: string;
}

const Instructors: React.FC = () => {
  const { user } = useOutletContext<{ user: any }>();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [meta, setMeta] = useState({page: 1, limit: 8, total: 0, totalPages: 0});


  const fetchInstructor = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: meta.page.toString(),
        limit: meta.limit.toString()
      });
      const res = await commonRequest('GET', `${URL}/auth/instructors?${queryParams}`, {}, config);
      console.log(res.data,"data from instructor")
      setInstructors(res.data);
      setMeta(prev => ({
        ...prev,
        total: res.total,
        totalPages: res.totalPages
      }));

    } catch (error) {
      console.error('Failed to fetch students: in ADMIN/INSTRUCTOR', error);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, [meta.page]);

  const handleBlockUnblock = async (instructorId: string, shouldBlock: boolean) => {
    try {
      const response = await commonRequest(
        'PUT',
        `${URL}/auth/student/block/${instructorId}`,
        { isBlocked: shouldBlock },
        config
      );

      if (response.success) {
        toast.success(response.message);

        setInstructors((prev) =>
          prev.map((instructor) =>
            instructor._id === instructorId ? { ...instructor, isBlocked: shouldBlock } : instructor
          )
        );
      } else {
        toast.error(response?.message);
      }
    } catch (error: any) {
      console.error('Failed to block/unblock instructor', error);
      toast.error(error?.message);
    }
  };

  const handleApproveDecline = async (
    instructorId: string,
    verify: 'approved' | 'rejected' | 'requested'
  ) => {
    try {
      const response = await commonRequest(
        'PUT',
        `${URL}/auth/approve-decline/${instructorId}`,
        { isVerified: verify },
        config
      );
      if (response.success) {
        toast.success(response.message);
        setInstructors((prevInstructors) =>
          prevInstructors.map((instructor) =>
            instructor._id === instructorId ? { ...instructor, isVerified: verify } : instructor
          )
        );
      } else {
        toast.error(response?.message);
      }
    } catch (error: any) {
      console.error('Failed to Approve/Decline instructor', error);
      toast.error(error?.message);
    }
  };
  
  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Instructors</h2>
      <p className="text-gray-600 mb-6">Manage your course instructors</p>

      <div className="flex mb-4">
        {/* Filter component can be added here */}
        <input
          type="text"
          placeholder="Filter instructors..."
          className="border px-3 py-2 rounded-md w-full"
          // value={meta.search}
          // onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profession
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cv
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-400">
            {instructors?.length > 0 &&
              instructors.map((instructor) => (
                <tr key={instructor?._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full ${
                          instructor.isBlocked
                            ? 'bg-red-600'
                            : instructor?.isVerified === 'requested'
                            ? 'bg-orange-500'
                            : instructor?.isVerified === 'approved'
                            ? 'bg-green-500'
                            : 'bg-red-600'
                        } font-bold flex items-center justify-center`}
                      >
                        {instructor?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {instructor?.firstName ? (
                            <>
                              {instructor?.firstName.charAt(0).toUpperCase() +
                                instructor?.firstName.slice(1).toLowerCase()}{' '}
                              {instructor?.lastName.charAt(0).toUpperCase() +
                                instructor?.lastName.slice(1).toLowerCase()}
                            </>
                          ) : (
                            instructor?.username.charAt(0).toUpperCase() +
                            instructor?.username.slice(1).toLowerCase()
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instructor?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {instructor?.profession}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline text-center">
                    <a
                      href={instructor?.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-800"
                    >
                      Show CV
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {instructor?.isBlocked ? (
                      <span className="w-20 inline-flex justify-center text-xs leading-5 font-semibold rounded-full bg-red-200 text-red-800 px-2">
                        Blocked
                      </span>
                    ) : (
                      <span className="w-20 inline-flex justify-center text-xs leading-5 font-semibold rounded-full bg-green-200 text-green-800 px-2">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 flex flex-wrap gap-2 justify-center">
                    
                    {instructor?.isVerified === 'approved' ? (
                      <span className="inline-flex items-center font-semibold">
                        {instructor?.isVerified?.charAt(0).toUpperCase() +
                          instructor?.isVerified?.slice(1).toLowerCase()}{' '}
                        <Check className="w-6 h-6 text-green-500" />
                      </span>
                    ) : instructor?.isVerified === 'requested' ? (
                      <>
                        <ConfirmationModal
                          triggerText="Approve"
                          title="Approve Instructor"
                          description={`Are you sure you want to Approve instructor with Email, ${instructor?.email}. This action can be reversed.`}
                          onConfirm={() => handleApproveDecline(instructor?._id, 'approved')}
                        />
                        <ConfirmationModal
                          triggerText="Decline"
                          title="Decline Instructor"
                          description={`Are you sure you want to Decline instructor with Email, ${instructor?.email}. This action can be reversed.`}
                          onConfirm={() => handleApproveDecline(instructor?._id, 'rejected')}
                        />
                      </>
                    ) : (
                      <>
                        <ConfirmationModal
                          triggerText="Approve"
                          title="Approve Instructor"
                          description={`Are you sure you want to Approve instructor with Email, ${instructor?.email}. This action can be reversed.`}
                          onConfirm={() => handleApproveDecline(instructor?._id, 'approved')}
                        />
                        <span className="font-semibold flex items-center text-red-800">
                          Rejected <X className="w-6 h-6 text-red-500" />
                        </span>
                      </>
                    )}
                    
                  </td>
                  <td>
                  <ConfirmationModal
                      triggerText={instructor?.isBlocked ? 'Unblock' : 'Block'}
                      title={`${instructor?.isBlocked ? 'Unblock' : 'Block'} Instructor`}
                      description={`Are you sure you want to ${
                        instructor?.isBlocked ? 'unblock' : 'block'
                      } instructor? <strong>${instructor?.email}</strong>. This action can be reversed.`}
                      onConfirm={() => handleBlockUnblock(instructor?._id, !instructor?.isBlocked)}
                    />

                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {instructors?.length > 0 && (
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        )}

      {instructors?.length == 0 && (
        <div className="text-center text-gray-500 mt-6">No instructors found!!</div>
      )}
    </div>
  );
};

export default Instructors;