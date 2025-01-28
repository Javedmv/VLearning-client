import React, { useEffect, useState } from 'react';
import { Users, Clock } from 'react-feather';
import { CourseData } from '../../types/Courses';
import { commonRequest, URL } from '../../common/api';
import { config } from '../../common/configurations';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Modal from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';

const CoursesPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await commonRequest('GET',`${URL}/course/all-instructor-courses/${user?._id}`,{},config);
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch courses: in ADMIN/INSTRUCTOR', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseEdit = (course:any) => {
    try {
      console.log("Edit course confirmed", course);
      navigate('/edit-course',{state:{course}});
    } catch (error) {
      console.error('Handle course edit in instructor ERROR:', error);
    }
  };

  const openModal = (course:any) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const confirmEdit = () => {
    if (selectedCourse) {
      handleCourseEdit(selectedCourse);
    }
    closeModal();
  };

  return (
    <div className="p-6 text-fuchsia-900 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      <div className="grid gap-6">
        {courses.length === 0 ? (
          <p>No Courses found</p>
        ) : (
          courses.map((course) => (
            <div
              key={course?._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden flex hover:shadow-xl transition-shadow duration-300 relative"
            >
              {/* Course Thumbnail */}
              <div className="w-64 h-64 flex-shrink-0">
                <img
                  src={
                    typeof course?.basicDetails?.thumbnail === 'string'
                      ? course.basicDetails.thumbnail
                      : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
                  }
                  alt={course?.basicDetails?.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course Details */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {course?.basicDetails?.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-4">
                      {course?.basicDetails?.description}
                    </p>
                  </div>
                  {course?.pricing?.type === 'paid' ? (
                    <div className="flex items-center text-green-600 font-semibold">
                      <span>₹{course.pricing.amount}</span>
                    </div>
                  ) : (
                    <span className="text-green-600 font-semibold">Free</span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {course?.courseContent?.lessons?.reduce(
                        (acc, lesson) => acc + (parseInt(lesson.duration) || 0),
                        0
                      )}{' '}
                      mins
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      {course?.instructor?.firstName + ' ' + course?.instructor?.lastName}
                    </span>
                  </div>
                  <span>{course?.basicDetails?.language}</span>
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-s font-bold">
                    {typeof course?.basicDetails?.category === 'string'
                      ? course?.basicDetails?.category
                      : course?.basicDetails?.category?.name}
                  </span>
                </div>
              </div>

              {/* Edit Course Button */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => openModal(course!)}
                  className="px-4 py-2 bg-fuchsia-700 text-white rounded-lg shadow-md hover:bg-fuchsia-900 transition duration-300"
                >
                  Edit Course
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Are you sure you want to edit this course?"
      >
        <div className="flex justify-end gap-4">
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={confirmEdit}
            className="px-4 py-2 bg-fuchsia-700 text-white rounded-lg hover:bg-fuchsia-900 transition"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CoursesPage;
