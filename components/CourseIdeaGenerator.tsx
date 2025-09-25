import React, { useState, useCallback } from 'react';
import { generateCourseOutline } from '../services/geminiService';
import type { CourseOutline } from '../types';
import { useLocalization } from '../hooks/useLocalization';

const CourseIdeaGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [outline, setOutline] = useState<CourseOutline | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLocalization();

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError(t('generator.error.topic'));
            return;
        }
        setIsLoading(true);
        setError(null);
        setOutline(null);
        try {
            const result = await generateCourseOutline(topic);
            setOutline(result);
        } catch (err: any) {
             const message = err.message.includes('API key not valid') 
                ? t('generator.error.gemini')
                : err.message;
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [topic, t]);

    return (
        <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('generator.title')}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{t('generator.description')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={t('generator.placeholder')}
                            className="flex-grow w-full py-3 px-4 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin ltr:-ml-1 ltr:mr-3 rtl:-mr-1 rtl:ml-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('generator.generating')}
                                </>
                            ) : t('generator.button')}
                        </button>
                    </div>
                </div>

                {error && <div className="max-w-3xl mx-auto mt-4 p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-center">{error}</div>}

                {outline && (
                    <div className="max-w-4xl mx-auto mt-12 bg-gray-50 dark:bg-gray-900 p-8 rounded-lg shadow-lg text-start">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{outline.courseTitle}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{outline.courseDescription}</p>
                        <div className="space-y-6">
                            {outline.modules.map((module, index) => (
                                <div key={index}>
                                    <h4 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-3">{t('generator.module', {index: index + 1})} {module.moduleTitle}</h4>
                                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ps-4">
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <li key={lessonIndex}>{lesson}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CourseIdeaGenerator;