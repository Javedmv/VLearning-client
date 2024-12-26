export interface SocialMedia {
    instagram?: string;
    linkedIn?: string;
    github?: string;
  }
  
  export interface Contact {
    additionalEmail: string;
    socialMedia: SocialMedia;
  }
  
  export interface Profile {
    dob: string;
    gender: string;
    avatar: string;
  }
  
  export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'instructor';
    isBlocked: boolean;
    isVerified: string;
    profit: number;
    isNewUser: boolean;
    createdAt: string;
    updatedAt: string;
    contact: Contact;
    profile: Profile;
    firstName: string;
    lastName: string;
    profession?: string;
    qualification: string;
    phoneNumber: string;
    cv?: string;
    profileDescription?:string;
  }