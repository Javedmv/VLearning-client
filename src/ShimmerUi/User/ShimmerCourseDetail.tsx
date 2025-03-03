const ShimmerCourseDetail = () => {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-6 bg-gray-50">
        {/* Video Placeholder */}
        <div className="w-full h-60 bg-gray-400 animate-pulse rounded-md"></div>
  
        {/* Title Placeholder */}
        <div className="w-3/4 h-6 bg-gray-400 animate-pulse rounded-md"></div>
  
        {/* Instructor Placeholder */}
        <div className="w-1/2 h-4 bg-gray-400 animate-pulse rounded-md"></div>
  
        {/* Course Description Placeholder */}
        <div className="w-full h-16 bg-gray-400 animate-pulse rounded-md"></div>
  
        {/* Lessons Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="w-1/4 h-5 bg-gray-400 animate-pulse rounded-md mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-12 bg-gray-400 animate-pulse rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default ShimmerCourseDetail;