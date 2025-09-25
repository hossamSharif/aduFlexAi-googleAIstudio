import React, { useState } from 'react';
import type { Module } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface CurriculumSectionProps {
    modules: Module[];
    totalDurationHours: number;
}

const CurriculumSection: React.FC<CurriculumSectionProps> = ({ modules, totalDurationHours }) => {
    const { t, formatNumber } = useLocalization();
    const [openModules, setOpenModules] = useState<Set<string>>(new Set());

    const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const totalMinutes = modules.reduce((acc, module) => acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + lesson.estimated_duration_minutes, 0), 0);
    const totalCalculatedHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;


    const toggleModule = (moduleId: string) => {
        setOpenModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };
    
    const expandAll = () => setOpenModules(new Set(modules.map(m => m.id)));
    const collapseAll = () => setOpenModules(new Set());

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">{t('courseDetail.courseContent')}</h2>
            <div className="flex justify-between items-center text-sm mb-2 text-gray-600 dark:text-gray-400">
                <span>
                    {t('courseDetail.modules', { count: modules.length })} &bull; {t('courseDetail.lessons', { count: totalLessons })} &bull; {t('courseDetail.duration', { hours: totalCalculatedHours, minutes: remainingMinutes })}
                </span>
                <button onClick={openModules.size === modules.length ? collapseAll : expandAll} className="font-semibold text-indigo-600 hover:underline">
                    {openModules.size === modules.length ? t('courseDetail.collapseAll') : t('courseDetail.expandAll')}
                </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-md">
                {modules.map(module => (
                    <div key={module.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <button onClick={() => toggleModule(module.id)} className="w-full flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <span className="font-semibold text-start">{module.title}</span>
                            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600 dark:text-gray-400">
                                <span>{t('courseDetail.lessons', {count: module.lessons.length})}</span>
                                <i className={`fas fa-chevron-down transition-transform ${openModules.has(module.id) ? 'rotate-180' : ''}`}></i>
                            </div>
                        </button>
                        {openModules.has(module.id) && (
                            <ul className="p-4 space-y-3">
                                {module.lessons.map(lesson => (
                                    <li key={lesson.id} className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <i className="far fa-play-circle me-3 text-gray-500"></i>
                                            <span className={lesson.is_preview ? 'text-indigo-600 dark:text-indigo-400' : ''}>{lesson.title}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            {lesson.is_preview && <a href="#" className="text-indigo-600 hover:underline me-4">{t('courseDetail.preview')}</a>}
                                            <span className="text-gray-500 dark:text-gray-400">{lesson.estimated_duration_minutes}m</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CurriculumSection;