// types/Courses.ts

export interface BasicDetails {
  title: string;
  description: string;
  thumbnail: string | null;
  language: string;
  category: string;
  whatWillLearn: string[];
}

export interface Lesson {
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  isIntroduction: boolean;
}


export interface CourseContents {
  lessons: Lesson[];
}


export interface PricingDetail {
  type: 'free' | 'paid';
  amount?: number;
  hasLifetimeAccess: boolean;
  subscriptionType?: 'one-time' | 'subscription';
}


export interface CourseData {
  basicDetails: BasicDetails;
  courseContent: CourseContents;
  pricing: PricingDetail;
}
