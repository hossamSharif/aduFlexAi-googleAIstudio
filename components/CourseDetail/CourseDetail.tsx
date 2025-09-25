import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { getCourseDetails, getRelatedCourses } from '../../services/courseService';
import type { CourseDetails, Course } from '../../types';

import CourseDetailHeader from './CourseDetailHeader';
import EnrollmentCard from './EnrollmentCard';
import CurriculumSection from './CurriculumSection';
import InstructorSection from './InstructorSection';
import ReviewsSection from './ReviewsSection';
import FAQSection from './FAQSection';
import RelatedCoursesSection from './RelatedCoursesSection';

interface CourseDetailProps {
    courseId: string;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ courseId }) => {
    const { t, language } = useLocalization();
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const courseData = await getCourseDetails(courseId, language);
                if (courseData) {
                    setCourse(courseData);
                    // Fetch related courses after getting the main course's category
                    // Note: category_id is not yet in CourseDetails type, we assume it's there
                    const catId = (courseData as any).category_id; 
                    if(catId) {
                       const related = await getRelatedCourses(courseId, catId, language);
                       setRelatedCourses(related);
                    }
                } else {
                    throw new Error("Course not found");
                }
            } catch (err) {
                setError(t('courseDetail.error'));
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, language, t]);

    if (isLoading) {
        return <div className="container mx-auto px-4 py-8 text-center">{t('courseDetail.loading')}</div>;
    }

    if (error || !course) {
        return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;
    }

    return (
        <>
            <CourseDetailHeader course={course} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:flex lg:flex-row-reverse lg:gap-8">
                    <div className="lg:w-1/3">
                        <EnrollmentCard course={course} />
                    </div>
                    <div className="lg:w-2/3 mt-8 lg:mt-0">
                        <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg mb-8">
                            <h2 className="text-2xl font-bold mb-4">{t('courseDetail.whatYouWillLearn')}</h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                {course.whatYouWillLearn.map((item, index) => (
                                    <li key={index} className="flex items-start">
                                        <i className="fas fa-check text-green-500 me-3 mt-1"></i>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <CurriculumSection modules={course.modules} totalDurationHours={course.estimated_duration_hours} />
                        
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">{t('courseDetail.requirements')}</h2>
                            <ul className="list-disc list-inside space-y-2 ps-4">
                                {course.requirements.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                        
                        <InstructorSection instructor={course.instructor} />
                        {/* FIX: Use `reviewsCount` for `totalRatings` instead of `reviews.length` for accuracy. */}
                        <ReviewsSection reviews={course.reviews} averageRating={course.rating} totalRatings={course.reviewsCount} />
                        <FAQSection />
                        <RelatedCoursesSection courses={relatedCourses} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default CourseDetail;