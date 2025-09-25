import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useWindowSize } from '../hooks/useWindowSize';
import { getCatalogCourses, getCategories } from '../services/courseService';
import type { Course, Category, AllCoursesFilters, SortOption } from '../types';
import FilterSidebar from './FilterSidebar';
import CourseCard from './CourseCard';
import Pagination from './Pagination';

const CourseCatalog: React.FC = () => {
    const { t, language } = useLocalization();
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;

    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filters, setFilters] = useState<AllCoursesFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCourses, setTotalCourses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sortOptions: SortOption[] = useMemo(() => [
        { value: 'relevance', label: t('sort.relevance') },
        { value: 'popularity', label: t('sort.popularity') },
        { value: 'rating', label: t('sort.rating') },
        { value: 'newest', label: t('sort.newest') },
        { value: 'price_asc', label: t('sort.price_asc') },
        { value: 'price_desc', label: t('sort.price_desc') },
    ], [t]);

    const [sort, setSort] = useState<SortOption>(sortOptions[0]);

    const fetchInitialData = useCallback(async () => {
        try {
            const fetchedCategories = await getCategories(language);
            setCategories(fetchedCategories);
        } catch (err) {
            console.error(err);
        }
    }, [language]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        const fetchCourses = async () => {
            if (currentPage === 1) setIsLoading(true);
            else setIsLoadingMore(true);
            
            setError(null);
            
            try {
                const { courses: newCourses, totalCount } = await getCatalogCourses(language, filters, sort, currentPage);
                if (isMobile && currentPage > 1) {
                    setCourses(prev => [...prev, ...newCourses]);
                } else {
                    setCourses(newCourses);
                }
                setTotalCourses(totalCount);
            } catch (err) {
                setError(t('catalog.error'));
                console.error(err);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        };

        fetchCourses();
    }, [language, filters, sort, currentPage, t, isMobile]);
    
    useEffect(() => {
        setSort(sortOptions[0]);
    }, [sortOptions]);

    const handleFilterChange = (newFilters: AllCoursesFilters) => {
        setCurrentPage(1);
        setFilters(newFilters);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSort = sortOptions.find(opt => opt.value === e.target.value);
        if (selectedSort) {
            setCurrentPage(1);
            setSort(selectedSort);
        }
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const handleLoadMore = () => {
        setCurrentPage(prev => prev + 1);
    };

    const totalPages = Math.ceil(totalCourses / 9);

    const renderCourseGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 9 }).map((_, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
                            <div className="w-full h-48 bg-gray-300 dark:bg-gray-700 rounded-md mb-4"></div>
                            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) return <div className="text-center text-red-500">{error}</div>;

        if (courses.length === 0) return <div className="text-center text-gray-500 dark:text-gray-400 py-16">{t('catalog.noCourses')}</div>;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">{t('catalog.title')}</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <FilterSidebar 
                    categories={categories}
                    onFilterChange={handleFilterChange}
                />
                <div className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                         <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-0">
                            {totalCourses > 0 && t('catalog.results', { count: totalCourses })}
                        </div>
                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('sort.label')}</label>
                            <select 
                                id="sort" 
                                value={sort.value} 
                                onChange={handleSortChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                            >
                                {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {renderCourseGrid()}

                    <div className="mt-8 flex justify-center">
                        {isMobile ? (
                            currentPage < totalPages && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed"
                                >
                                    {isLoadingMore ? t('catalog.loading') : t('catalog.loadMore')}
                                </button>
                            )
                        ) : (
                            totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCatalog;
