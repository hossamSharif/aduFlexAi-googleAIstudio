import React from 'react';
import { categories } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

const Categories: React.FC = () => {
    const { t } = useLocalization();

    return (
        <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
                    {t('categories.title')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {categories.map(category => (
                        <div key={category.id} className="group flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-700 rounded-lg text-center hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-4xl text-indigo-600 dark:text-indigo-400 group-hover:text-white mb-4 transition-colors">
                                <i className={category.icon}></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-white mb-1 transition-colors">{t(category.nameKey)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-100 transition-colors">
                                {t('categories.courseCount', { count: category.courseCount })}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Categories;
