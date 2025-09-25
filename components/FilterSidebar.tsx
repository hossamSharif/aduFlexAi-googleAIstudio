import React, { useState, useEffect } from 'react';
import type { Category, AllCoursesFilters } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface FilterSidebarProps {
    categories: Category[];
    onFilterChange: (filters: AllCoursesFilters) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, onFilterChange }) => {
    const { t, dir } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [currentFilters, setCurrentFilters] = useState<AllCoursesFilters>({
        difficulty: [],
        language: [],
    });

    const difficultyLevels = ['beginner', 'intermediate', 'advanced'];
    const languages: ('en' | 'ar' | 'both')[] = ['en', 'ar', 'both'];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            const arrayKey = name as 'difficulty' | 'language';
            const currentArray = currentFilters[arrayKey] || [];
            const newArray = checked ? [...currentArray, value] : currentArray.filter(item => item !== value);
            setCurrentFilters(prev => ({ ...prev, [arrayKey]: newArray }));
        } else {
            setCurrentFilters(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCategoryClick = (categoryId: string) => {
        const newCategoryId = currentFilters.categoryId === categoryId ? undefined : categoryId;
        setCurrentFilters(prev => ({...prev, categoryId: newCategoryId }));
    };

    const handleClearFilters = () => {
        setCurrentFilters({ difficulty: [], language: [] });
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            onFilterChange(currentFilters);
        }, 500); // Debounce filter changes

        return () => clearTimeout(handler);
    }, [currentFilters, onFilterChange]);
    
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Category Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-lg">{t('filters.category')}</h3>
                <ul className="space-y-2">
                    <li key="all">
                        <button
                            onClick={() => handleCategoryClick('')}
                            className={`w-full text-start p-2 rounded-md transition-colors ${!currentFilters.categoryId ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            {t('filters.allCategories')}
                        </button>
                    </li>
                    {categories.map(cat => (
                         <li key={cat.id}>
                            <button
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`w-full text-start p-2 rounded-md transition-colors flex items-center ${currentFilters.categoryId === cat.id ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                <i className={`me-3 ${cat.icon}`}></i>
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            
             {/* Difficulty Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-lg">{t('filters.difficulty')}</h3>
                <div className="space-y-2">
                    {difficultyLevels.map(level => (
                        <label key={level} className="flex items-center">
                            <input type="checkbox" name="difficulty" value={level} checked={currentFilters.difficulty?.includes(level)} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="ms-3 text-gray-700 dark:text-gray-300">{t(`filters.difficulty.${level}`)}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Language Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-lg">{t('filters.language')}</h3>
                <div className="space-y-2">
                    {languages.map(lang => (
                        <label key={lang} className="flex items-center">
                            <input type="checkbox" name="language" value={lang} checked={currentFilters.language?.includes(lang)} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="ms-3 text-gray-700 dark:text-gray-300">{t(`filters.language.${lang}`)}</span>
                        </label>
                    ))}
                </div>
            </div>
            
            <button onClick={handleClearFilters} className="w-full mt-4 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                {t('filters.clear')}
            </button>
        </div>
    );

    return (
        <aside className="md:w-64 lg:w-72 flex-shrink-0">
            <div className="md:hidden mb-4">
                 <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <h2 className="text-xl font-semibold">{t('filters.title')}</h2>
                    <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'transform rotate-180' : ''}`}></i>
                </button>
                {isOpen && (
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-b-lg shadow">
                       <FilterContent />
                    </div>
                )}
            </div>
            <div className="hidden md:block p-6 bg-white dark:bg-gray-800 rounded-lg shadow h-full">
                <h2 className="text-xl font-semibold mb-6">{t('filters.title')}</h2>
                <FilterContent />
            </div>
        </aside>
    );
};

export default FilterSidebar;
