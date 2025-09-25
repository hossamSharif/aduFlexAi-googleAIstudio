export type Language = 'en' | 'ar';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  imageUrl: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  estimated_duration_hours: number;
  language: string; 
}

export interface Module {
    moduleTitle: string;
    lessons: string[];
}

export interface CourseOutline {
    courseTitle: string;
    courseDescription: string;
    modules: Module[];
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