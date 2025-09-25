import React from 'react';
import type { Course } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import CourseCard from '../CourseCard';

interface RelatedCoursesSectionProps {
    courses: Course[];
}

const RelatedCoursesSection: React.FC<RelatedCoursesSectionProps> = ({ courses }) => {
    const { t } = useLocalization();

    if (courses.length === 0) return null;

    return (
        <section className="py-12 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('courseDetail.relatedCourses')}
            </h2>
            <div className="relative">
                <div className="flex space-x-8 rtl:space-x-reverse overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
                    {courses.map(course => (
                        <div key={course.id} className="snap-start">
                            <CourseCard course={course} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedCoursesSection;