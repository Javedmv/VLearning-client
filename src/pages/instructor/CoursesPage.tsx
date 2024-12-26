import React from 'react';
import { Users, Clock } from 'react-feather';

const CoursesPage: React.FC = () => {
  const courses = [
    { id: 1, title: "Introduction to React", students: 50, duration: "10 hours" },
    { id: 2, title: "Advanced TypeScript", students: 30, duration: "15 hours" },
    { id: 3, title: "Next.js Fundamentals", students: 40, duration: "12 hours" },
  ];

  return (
    <div className="p-6 text-fuchsia-900 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>
      <div className="grid gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Users className="mr-2" size={18} />
                <span>{course.students} students</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={18} />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;

