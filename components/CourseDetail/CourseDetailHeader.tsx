import React from 'react';
import type { CourseDetails } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface CourseDetailHeaderProps {
    course: CourseDetails;
}

const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({ course }) => {
    const { t, formatNumber } = useLocalization();

    return (
        <header className="bg-gray-800 text-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{course.title}</h1>
                    <p className="text-lg text-gray-300 mb-4">{course.description}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center">
                            <span className="text-yellow-400 font-bold me-2">{formatNumber(course.rating)}</span>
                            <div className="flex items-center text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fa-solid fa-star ${i < Math.round(course.rating) ? 'text-yellow-400' : 'text-gray-600'}`}></i>
                                ))}
                            </div>
                             {/* FIX: Use 'reviewsCount' instead of 'reviews.length' for the total review count. */}
                             <span className="text-gray-400 ms-2">({formatNumber(course.reviewsCount)} {t('courseDetail.instructor.rating', {count: course.reviewsCount})})</span>
                        </div>
                        <span className="text-gray-400">{formatNumber(course.enrollment_count)} {t('courseDetail.instructor.students', {count: course.enrollment_count})}</span>
                    </div>
                    <p className="mt-3 text-sm">{t('courseDetail.instructor')}: <span className="font-semibold text-indigo-400">{course.instructor.name}</span></p>
                </div>
            </div>
        </header>
    );
};

export default CourseDetailHeader;