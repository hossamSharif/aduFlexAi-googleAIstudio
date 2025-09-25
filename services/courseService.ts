import { supabase } from './supabaseClient';
import type { Course, Language, AllCoursesFilters, SortOption, Category } from '../types';

const mapCourseData = (course: any, language: Language): Course => {
    const instructorProfile = course.instructor_profiles?.user_profiles;
    let instructorName = 'Unknown Instructor';
    if (instructorProfile) {
        const firstName = language === 'ar' ? instructorProfile.first_name_ar : instructorProfile.first_name;
        const lastName = language === 'ar' ? instructorProfile.last_name_ar : instructorProfile.last_name;
        instructorName = `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown Instructor';
    }
    
    return {
        id: course.id,
        title: language === 'ar' ? course.title_ar : course.title,
        instructor: instructorName,
        imageUrl: course.thumbnail_url,
        price: course.price,
        currency: course.currency,
        rating: course.rating_average,
        reviews: course.rating_count,
        estimated_duration_hours: course.estimated_duration_hours,
        language: course.language
    };
};


export const getFeaturedCourses = async (language: Language): Promise<Course[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            *,
            instructor_profiles (
                user_profiles ( * )
            )
        `)
        .eq('is_featured', true)
        .eq('status', 'published')
        .order('rating_average', { ascending: false })
        .limit(8);

    if (error) {
        console.error("Error fetching featured courses:", error);
        throw new Error('Failed to fetch featured courses.');
    }
    
    if (!data) return [];
    
    return data.map((course: any) => mapCourseData(course, language));
};

export const searchCourses = async (query: string, language: Language): Promise<Course[]> => {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase.rpc('search_courses', { search_term: query });

    if (error) {
        console.error("Error searching courses:", error);
        throw new Error('Failed to search for courses.');
    }

    if (!data) return [];
    
    return data.map((course: any) => mapCourseData(course, language));
};

export const getCategories = async (language: Language): Promise<Category[]> => {
    const nameCol = language === 'ar' ? 'name_ar' : 'name';
    
    const { data, error } = await supabase
        .from('categories')
        .select(`id, ${nameCol}, icon`);

    if (error) {
        console.error("Error fetching categories:", error);
        throw new Error('Failed to fetch categories.');
    }

    return data.map((cat: any) => ({
        id: cat.id,
        name: cat[nameCol],
        icon: cat.icon
    }));
};

const COURSES_PER_PAGE = 9;

export const getCatalogCourses = async (
    language: Language,
    filters: AllCoursesFilters,
    sort: SortOption,
    page: number
): Promise<{ courses: Course[], totalCount: number }> => {
    let query = supabase
        .from('courses')
        .select(`
            *,
            instructor_profiles (
                user_profiles ( * )
            )
        `, { count: 'exact' })
        .eq('status', 'published');

    // Apply filters
    if (filters.searchQuery) {
        const titleCol = language === 'ar' ? 'title_ar' : 'title';
        const descCol = language === 'ar' ? 'description_ar' : 'description';
        query = query.or(`and(${titleCol}.ilike.%${filters.searchQuery}%,${descCol}.ilike.%${filters.searchQuery}%)`);
    }
    if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
    }
    if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
    }
    if (filters.difficulty && filters.difficulty.length > 0) {
        query = query.in('difficulty_level', filters.difficulty);
    }
    if (filters.language && filters.language.length > 0) {
        query = query.in('language', filters.language);
    }

    // Apply sorting
    switch (sort.value) {
        case 'popularity':
            query = query.order('enrollment_count', { ascending: false });
            break;
        case 'rating':
            query = query.order('rating_average', { ascending: false });
            break;
        case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        default: // relevance (default)
            // No specific order for relevance here, relies on search ranking if applicable
            break;
    }

    // Apply pagination
    const offset = (page - 1) * COURSES_PER_PAGE;
    query = query.range(offset, offset + COURSES_PER_PAGE - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching catalog courses:", error);
        throw new Error('Failed to fetch catalog courses.');
    }
    
    return {
        courses: data.map((course: any) => mapCourseData(course, language)),
        totalCount: count || 0
    };
};