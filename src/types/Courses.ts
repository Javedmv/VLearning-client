// types/Courses.ts

import { DisplayCategory } from "../pages/admin/Category";
import { User } from "./Users";

export interface BasicDetails {
  _id?:string
  title: string;
  description: string;
  thumbnail: File | string;
  thumbnailPreview? : string | null;
  language: string;
  category: string | DisplayCategory;
  whatWillLearn: string[];
}
export interface Lesson {
  _id?:string
  title: string;
  description: string;
  duration: string;
  videoUrl: File | null ;
  isIntroduction: boolean;
  videoPreview?: { url: string; duration: string }; // New field to hold video preview details
}
export interface CourseContents {
  _id?:string
  lessons: Lesson[];
}
export interface PricingDetail {
  _id?:string
  type: 'free' | 'paid';
  amount?: number;
  hasLifetimeAccess: boolean;
  subscriptionType?: 'one-time';
}
export interface CourseData {
  _id?:string
  instructorId: string;
  instructor: User
  basicDetails: BasicDetails;
  courseContent: CourseContents;
  pricing: PricingDetail;
  students?:[];
  // TODO: add the students array in the backend and compolete the student enrollements
}