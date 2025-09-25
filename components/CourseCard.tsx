import React from 'react';
import type { Course } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const { t, formatCurrency, formatNumber } = useLocalization();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 w-80 flex-shrink-0">
            <img src={course.imageUrl} alt={course.title} className="w-full h-48 object-cover" loading="lazy" />
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 h-14 overflow-hidden">{course.title}</h3>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(course.price, course.currency)}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{course.instructor}</p>
                <div className="flex items-center mb-4">
                    <span className="text-yellow-500 font-bold me-2">{formatNumber(course.rating)}</span>
                    <div className="flex items-center text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < Math.round(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                        ))}
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 ms-2">({formatNumber(course.reviews)})</span>
                </div>
                 <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <i className="fa-regular fa-clock me-2"></i>
                    <span>{t('course.duration_hours', { count: course.estimated_duration_hours })}</span>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;