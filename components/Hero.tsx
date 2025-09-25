import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { searchCourses } from '../services/courseService';
import type { Course } from '../types';
import SearchResults from './SearchResults';

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

const Hero: React.FC = () => {
  const { t, language } = useLocalization();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const searchResults = await searchCourses(debouncedQuery, language);
        setResults(searchResults);
      } catch (e) {
        setError(t('search.error'));
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, language, t]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
      setIsFocused(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const showResults = isFocused && query.length > 0;

  return (
    <section className="bg-indigo-50 dark:bg-gray-800/50 py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
          {t('hero.headline')}
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          {t('hero.subheadline')}
        </p>
        <div className="max-w-2xl mx-auto relative" ref={searchContainerRef}>
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-full shadow-lg overflow-hidden">
            <input
              type="text"
              placeholder={t('hero.searchPlaceholder')}
              className="w-full py-4 px-6 text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              aria-label={t('hero.searchPlaceholder')}
              aria-autocomplete="list"
              aria-expanded={showResults}
            />
            <button className="bg-indigo-600 text-white px-8 py-4 hover:bg-indigo-700 transition-colors font-semibold whitespace-nowrap">
              {t('hero.searchButton')}
            </button>
          </div>
          {showResults && (
             <SearchResults 
                results={results} 
                isLoading={isLoading} 
                error={error}
                query={debouncedQuery}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;