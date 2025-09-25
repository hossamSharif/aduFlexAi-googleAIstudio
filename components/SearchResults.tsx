import React from 'react';
import type { Course } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useRouter } from '../App';

interface SearchResultsProps {
    results: Course[];
    isLoading: boolean;
    error: string | null;
    query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading, error, query }) => {
    const { t } = useLocalization();
    const { navigateTo } = useRouter();

    const handleResultClick = (e: React.MouseEvent<HTMLAnchorElement>, courseId: string) => {
        e.preventDefault();
        navigateTo(`/course/${courseId}`);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <svg className="animate-spin h-5 w-5 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="mt-2 block">{t('search.loading')}</span>
                </div>
            );
        }
        if (error) {
            return <div className="p-4 text-center text-red-500">{error}</div>;
        }
        if (results.length === 0 && query.length > 1) {
            return <div className="p-4 text-center text-gray-500 dark:text-gray-400">{t('search.noResults', {query})}</div>;
        }
        if (results.length > 0) {
            return (
                <ul role="listbox">
                    {results.map(course => (
                        <li key={course.id} role="option" aria-selected="false">
                            <a href={`/course/${course.id}`} onClick={(e) => handleResultClick(e, course.id)} className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                                <img src={course.imageUrl} alt={course.title} className="w-16 h-10 object-cover rounded-md me-4"/>
                                <div className="text-start">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{course.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{typeof course.instructor === 'string' ? course.instructor : course.instructor.name}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };
    
    return (
        <div 
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden max-h-96 overflow-y-auto z-10"
            role="region"
            aria-live="polite"
        >
           {renderContent()}
        </div>
    );
};

export default SearchResults;