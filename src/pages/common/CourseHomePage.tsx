import React, { useEffect, useState } from "react";
import { CourseFilter } from "../../components/common/CourseFilter";
import { CourseData } from "../../types/Courses";
import { DollarSign, Clock, Users } from "lucide-react";
import { commonRequest, URL } from "../../common/api";
import { config } from "../../common/configurations";
import Navbar from "../../components/home/Navbar";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination";

const CourseHomePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [filters, setFilters] = useState<any>({});
  // TODO:complete the implementation of the filter.

  const Navigate = useNavigate();

  const handleFilterChange = (newFilters: any) => {
    setFilters((prevFilters:any) => ({ ...prevFilters, ...newFilters }));
  };
  console.log(filters,'in front filter')
  console.log(meta, "in the front-end")

  const fetchCourses = async () => {
    try {
      const res = await commonRequest("GET", `${URL}/course/all-courses`, {}, config);
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch categories: in ADMIN/INSTRUCTOR", error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // description,title,img
  function handleCourseClick (id:string) {
    try {
        Navigate(`/details/${id}`)
    } catch (error:any) {
        console.log("ERROR IN HANDLE COURSE CLICK:",error?.message);
    }
  }

  function handlePageChange () {
    try {
      console.log("handle page change")
    } catch (error) {
      console.log("error in handle page change")
    }
  }

  return (
    <>
      <Navbar User={user} />
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <CourseFilter onFilterChange={handleFilterChange} />
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                {courses.length === 0 ? (
                  <p>No Courses found</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course?._id}
                      className="bg-white shadow-lg rounded-lg overflow-hidden flex hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="w-64 h-64 flex-shrink-0">
                        <img
                          src={
                            typeof course?.basicDetails?.thumbnail === "string"
                              ? course.basicDetails.thumbnail
                              : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                          }
                          alt={course?.basicDetails?.title}
                          className="w-full h-full object-cover"
                          onClick={() => handleCourseClick(course?._id!)}
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h2 className="text-xl font-semibold mb-2" onClick={() => handleCourseClick(course?._id!)}>{course?.basicDetails?.title}</h2>
                              <p className="text-gray-600 mb-4 line-clamp-4" onClick={() => handleCourseClick(course?._id!)}>
                                {course?.basicDetails?.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4"/>
                              <span>
                                {course?.courseContent?.lessons?.reduce(
                                  (acc, lesson) => acc + (parseInt(lesson.duration) || 0),
                                  0
                                )}{" "}
                                mins
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <span>
                                {course?.instructor?.firstName + " " + course?.instructor?.lastName}
                              </span>
                            </div>
                            <span>{course?.basicDetails?.language}</span>
                            <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-s font-bold">
                              {typeof course?.basicDetails?.category === "string"
                                ? course?.basicDetails?.category
                                : course?.basicDetails?.category?.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span
                            className={`font-bold ${
                              course.pricing.type === "paid"
                                ? "text-gray-900 text-xl"
                                : "text-green-700 text-s"
                            }`}
                          >
                            {course.pricing.type === "paid"
                              ? `₹${course.pricing.amount?.toFixed(2)}`
                              : "Free"}
                          </span>
                          {/* <button className="bg-fuchsia-700 text-white px-6 py-2 rounded-md hover:bg-fuchsia-900 transition-colors font-medium">
                            Enroll Now
                          </button> */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Pagination
                    currentPage={meta.page}
                    totalPages={meta.totalPages}
                    onPageChange={handlePageChange}
                  />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CourseHomePage;
