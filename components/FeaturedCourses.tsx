import React, { useState, useEffect } from 'react';
import { getFeaturedCourses } from '../services/courseService';
import type { Course } from '../types';
import CourseCard from './CourseCard';
import { useLocalization } from '../hooks/useLocalization';

const FeaturedCourses: React.FC = () => {
  const { t, language } = useLocalization();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCourses = await getFeaturedCourses(language);
        setCourses(fetchedCourses);
      } catch (err) {
        setError(t('featuredCourses.error'));
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [language, t]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center">{t('featuredCourses.loading')}</div>;
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    if (courses.length === 0) {
      return <div className="text-center">{t('featuredCourses.none')}</div>;
    }

    return (
      <div className="relative">
        <div className="flex space-x-8 rtl:space-x-reverse overflow-x-auto pb-6 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
          {courses.map(course => (
            <div key={course.id} className="snap-start">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          {t('featuredCourses.title')}
        </h2>
        {renderContent()}
      </div>
    </section>
  );
};

export default FeaturedCourses;