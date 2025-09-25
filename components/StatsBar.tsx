import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCountUp } from '../hooks/useCountUp';

interface StatItemProps {
    icon: string;
    endValue: number;
    label: string;
    plus?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon, endValue, label, plus = true }) => {
    const { formatNumber } = useLocalization();
    const count = useCountUp(endValue, 2000);

    return (
        <div className="flex flex-col items-center p-4">
            <div className="text-4xl text-indigo-500 dark:text-indigo-400 mb-4">
                <i className={`fas ${icon}`}></i>
            </div>
            <p className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                {formatNumber(count)}{plus && '+'}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{label}</p>
        </div>
    );
};


const StatsBar: React.FC = () => {
    const { t } = useLocalization();

    const stats = [
        { icon: 'fa-users', endValue: 15000, label: t('stats.students') },
        { icon: 'fa-book-open', endValue: 500, label: t('stats.courses') },
        { icon: 'fa-user-tie', endValue: 200, label: t('stats.instructors') },
        { icon: 'fa-globe', endValue: 180, label: t('stats.countries'), plus: false },
    ];

    return (
        <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    {t('stats.title')}
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map(stat => (
                        <StatItem key={stat.label} {...stat} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsBar;