import React from 'react';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import Navbar from '../../components/home/Navbar';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Mock data - In a real app, this would come from an API/database
const courses = [
  {
    id: 1,
    title: "Advanced React Patterns",
    progress: 65,
    lastAccessed: "Lesson 4: Custom Hooks",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400",
    totalModules: 8,
    completedModules: 5
  },
  {
    id: 2,
    title: "TypeScript Masterclass",
    progress: 30,
    lastAccessed: "Lesson 2: Advanced Types",
    thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=400",
    totalModules: 10,
    completedModules: 3
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    progress: 85,
    lastAccessed: "Lesson 7: Authentication",
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=400",
    totalModules: 8,
    completedModules: 7
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    progress: 85,
    lastAccessed: "Lesson 7: Authentication",
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=400",
    totalModules: 8,
    completedModules: 7
  }
];

const MyLearnings: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.user);


  return (
    <>
        <Navbar User={user} />
        <br></br>
        <div className="max-w-6xl mx-auto p-6 bg-pink-200">
        <div className="flex items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold text-gray-800 underline">My Learnings</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                    />
                <div className="absolute inset-0 bg-black bg-opacity-20">
                    <button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <PlayCircle className="w-16 h-16 text-white hover:text-indigo-400 transition-colors" />
                    </button>
                </div>
                </div>

                <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
                
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.completedModules}/{course.totalModules} Lessons</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last accessed: {course.lastAccessed}</span>
                </div>
                </div>
            </div>
            ))}
        </div>
        </div>
    </>
  );
};

export default MyLearnings;