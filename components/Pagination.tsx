import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const { t, dir } = useLocalization();

    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= half + 1) {
            for (let i = 1; i <= maxPagesToShow - 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - half) {
            pages.push(1);
            pages.push('...');
            for (let i = totalPages - maxPagesToShow + 2; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav aria-label="Course pagination">
            <ul className="flex items-center -space-x-px h-10 text-base">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center px-4 h-10 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">{t('pagination.previous')}</span>
                        <i className={`fas ${dir === 'rtl' ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
                    </button>
                </li>
                {pageNumbers.map((page, index) => (
                    <li key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => onPageChange(page)}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`flex items-center justify-center px-4 h-10 leading-tight ${currentPage === page ? 'text-indigo-600 border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span>
                        )}
                    </li>
                ))}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">{t('pagination.next')}</span>
                        <i className={`fas ${dir === 'rtl' ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
