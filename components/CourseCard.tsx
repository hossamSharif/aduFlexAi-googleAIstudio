import React from 'react';
import type { Course } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useRouter } from '../App';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { t, formatCurrency, formatNumber } = useLocalization();
    const { navigateTo } = useRouter();

    const handleCourseClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        navigateTo(`/course/${course.id}`);
    };
    
    const instructorName = typeof course.instructor === 'string' ? course.instructor : course.instructor.name;

    return (
        <a href={`/course/${course.id}`} onClick={handleCourseClick} className="block w-80 flex-shrink-0 group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
                <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white h-14 overflow-hidden group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h3>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(course.price, course.currency)}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{instructorName}</p>
                    <div className="flex items-center mb-4">
                        <span className="text-yellow-500 font-bold me-2">{formatNumber(course.rating)}</span>
                        <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <i key={i} className={`fa-solid fa-star ${i < Math.round(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                            ))}
                        </div>
                        {/* FIX: Use 'reviewsCount' instead of 'reviews' to display the review count. */}
                        <span className="text-gray-500 dark:text-gray-400 ms-2">({formatNumber(course.reviewsCount)})</span>
                    </div>
                     <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-auto">
                        <i className="fa-regular fa-clock me-2"></i>
                        <span>{t('course.duration_hours', { count: course.estimated_duration_hours })}</span>
                    </div>
                </div>
            </div>
        </a>
    );
};

export default CourseCard;