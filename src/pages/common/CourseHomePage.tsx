import React, { useEffect, useState } from "react";
import { CourseFilter } from "../../components/common/CourseFilter";
import { CourseData } from "../../types/Courses";
import { Clock, Users } from "lucide-react";
import { commonRequest, URL } from "../../common/api";
import { config } from "../../common/configurations";
import Navbar from "../../components/home/Navbar";
import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/common/Pagination";
import { TOBE } from "../../common/constants";

const CourseHomePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 3,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<TOBE>({
    search: "",
    sortBy: "relevance",
    categories: [],
    page: 1,
  });
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for the search input
  const Navigate = useNavigate();

  const handleFilterChange = (newFilters: TOBE) => {
    setFilters((prevFilters: TOBE) => ({
      ...prevFilters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const fetchCourses = async () => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await commonRequest(
        "GET",
        `${URL}/course/all-courses?${queryParams}`,
        {},
        config
      );
      setCourses(res.data);
      setMeta(res.meta);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prevFilters: TOBE) => ({ ...prevFilters, search: searchTerm }));
    }, 500); 

    return () => clearTimeout(delayDebounceFn); 
  }, [searchTerm]);

  useEffect(() => {
    fetchCourses();
  }, [filters]); 

  const handleCourseClick = (id: string) => {
    try {
      Navigate(`/details/${id}`);
    } catch (error: any) {
      console.log("ERROR IN HANDLE COURSE CLICK:", error?.message);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prevFilters: TOBE) => ({ ...prevFilters, page }));
  };

  return (
    <>
      <Navbar User={user} />
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-8xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <CourseFilter
                onFilterChange={handleFilterChange}
                search={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)} // Update search term
              />
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                {courses?.length === 0 ? (
                  <p>No Courses found</p>
                ) : (
                  courses?.map((course) => (
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
                          onClick={() => course?._id && handleCourseClick(course._id)}

                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h2
                                className="text-xl font-semibold mb-2"
                                onClick={() => course?._id && handleCourseClick(course._id)}
                              >
                                {course?.basicDetails?.title}
                              </h2>
                              <p
                                className="text-gray-600 mb-4 line-clamp-4 overflow-hidden break-all"
                                onClick={() => course?._id && handleCourseClick(course._id)}
                              >
                                {course?.basicDetails?.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>
                                {course?.courseContent?.lessons?.reduce(
                                  (acc, lesson) =>
                                    acc + (parseInt(lesson.duration) || 0),
                                  0
                                )}{" "}
                                mins
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <span>
                                {course?.instructor?.firstName +
                                  " " +
                                  course?.instructor?.lastName}
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
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Pagination
                currentPage={meta?.page}
                totalPages={meta?.totalPages}
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
