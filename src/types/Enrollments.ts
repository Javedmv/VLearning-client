import { CourseData } from "./Courses";
import { User } from "./Users";

export interface ILessonProgress {
    totalTimeWatched: number;
    lastWatchedPosition: number;
    isCompleted: boolean;
}

export interface IProgress {
    completedLessons: string[]; // Array of completed lesson IDs
    currentLesson: string; // Current lesson ID
    lessonProgress: Record<string, ILessonProgress>; // Key-value pair where key is lesson ID
}

export interface IEnrollment {
    _id: string; // String instead of ObjectId
    userId: User | string; // User ID or populated user object
    courseId: CourseData | string; // Course ID or populated course object
    enrolledAt: string; // Date as string for JSON handling
    completionPercentage: number;
    progress: IProgress;
    createdAt: string;
    updatedAt: string;
}
