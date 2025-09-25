import React from 'react';
import type { CourseDetails } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useRouter } from '../../App';

interface EnrollmentCardProps {
    course: CourseDetails;
}

const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ course }) => {
    const { t, formatCurrency } = useLocalization();
    const { navigateTo } = useRouter();

    const handleEnrollClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navigateTo(`/enroll/${course.id}`);
    };

    const features = [
        { icon: 'fa-video', key: 'courseDetail.onDemandVideo' },
        { icon: 'fa-file-alt', key: 'courseDetail.articles' },
        { icon: 'fa-download', key: 'courseDetail.downloads' },
        { icon: 'fa-infinity', key: 'courseDetail.lifetimeAccess' },
        { icon: 'fa-mobile-alt', key: 'courseDetail.mobileAccess' },
        { icon: 'fa-certificate', key: 'courseDetail.certificate' },
    ];

    return (
        <div className="lg:sticky lg:top-24">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <img src={course.imageUrl} alt={course.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{formatCurrency(course.price, course.currency)}</div>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleEnrollClick} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">{t('courseDetail.enroll')}</button>
                        <button className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('courseDetail.addToCart')}</button>
                    </div>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">{t('courseDetail.guarantee')}</p>
                    <hr className="my-6 border-gray-200 dark:border-gray-600" />
                    <h4 className="font-bold mb-3">{t('courseDetail.includes')}</h4>
                    <ul className="space-y-2 text-sm">
                        {features.map(feature => (
                            <li key={feature.key} className="flex items-center">
                                <i className={`fas ${feature.icon} w-5 text-center me-3 text-gray-600 dark:text-gray-400`}></i>
                                <span>{t(feature.key)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentCard;