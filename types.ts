import type { AuthUser, Session } from '@supabase/supabase-js';

export type Language = 'en' | 'ar';

export interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

// Combine Supabase AuthUser with our public Profile
export type User = AuthUser & { profile: Profile | null };
export type AuthSession = Session;


export interface Course {
  id: string;
  title: string;
  instructor: string | Instructor;
  imageUrl: string;
  price: number;
  currency: string;
  rating: number;
  // FIX: Renamed 'reviews' to 'reviewsCount' to avoid conflict with CourseDetails interface.
  reviewsCount: number;
  estimated_duration_hours: number;
  language: string; 
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
    estimated_duration_hours: number;
}

export interface Lesson {
  id: string;
  title: string;
  estimated_duration_minutes: number;
  is_preview: boolean;
}

export interface Instructor {
    id: string;
    name: string;
    title: string;
    avatarUrl: string;
    bio: string;
    rating: number;
    reviews: number;
    students: number;
    courses: number;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    studentName: string;
    createdAt: string;
}

export interface CourseDetails extends Course {
    whatYouWillLearn: string[];
    requirements: string[];
    targetAudience: string[];
    modules: Module[];
    instructor: Instructor;
    reviews: Review[];
    enrollment_count: number;
    description: string;
}

export interface CourseOutline {
    courseTitle: string;
    courseDescription: string;
    modules: { moduleTitle: string, lessons: string[] }[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface AllCoursesFilters {
  searchQuery?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  difficulty?: string[];
  language?: ('ar' | 'en' | 'both')[];
}

export interface SortOption {
  value: string;
  label: string;
}