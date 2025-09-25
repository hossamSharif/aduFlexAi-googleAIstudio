import React from 'react';
import type { Instructor } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface InstructorSectionProps {
    instructor: Instructor;
}

const InstructorSection: React.FC<InstructorSectionProps> = ({ instructor }) => {
    const { t, formatNumber } = useLocalization();

    const stats = [
        { icon: 'fa-star', value: instructor.rating, label: t('courseDetail.instructor.rating', {count: instructor.reviews}) },
        { icon: 'fa-user-friends', value: instructor.students, label: t('courseDetail.instructor.students', {count: instructor.students}) },
        { icon: 'fa-play-circle', value: instructor.courses, label: t('courseDetail.instructor.courses', {count: instructor.courses}) },
    ];

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">{t('courseDetail.instructor')}</h2>
            <div className="flex items-start gap-6">
                <img src={instructor.avatarUrl || 'https://picsum.photos/100/100?random=10'} alt={instructor.name} className="w-24 h-24 rounded-full object-cover" />
                <div>
                    <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{instructor.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{instructor.title}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                        {stats.map(stat => (
                            <div key={stat.label} className="flex items-center text-sm">
                                <i className={`fas ${stat.icon} me-2 text-gray-500`}></i>
                                <span>{formatNumber(stat.value)} {stat.label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                        {instructor.bio}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InstructorSection;