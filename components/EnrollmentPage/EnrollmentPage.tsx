import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import { getCourseDetails } from '../../services/courseService';
import type { CourseDetails } from '../../types';

import AuthStep from './AuthStep';
import PaymentStep from './PaymentStep';
import ConfirmationStep from './ConfirmationStep';
import OrderSummary from './OrderSummary';

interface EnrollmentPageProps {
    courseId: string;
}

type EnrollmentStep = 'auth' | 'payment' | 'confirmation';

const EnrollmentPage: React.FC<EnrollmentPageProps> = ({ courseId }) => {
    const { t, language } = useLocalization();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<EnrollmentStep>('auth');
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            try {
                const data = await getCourseDetails(courseId, language);
                if (data) {
                    setCourse(data);
                } else {
                    setError(t('enroll.error.course.load'));
                }
            } catch (err) {
                setError(t('enroll.error.course.load'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, language, t]);

    useEffect(() => {
        if (user) {
            setCurrentStep('payment');
        } else {
            setCurrentStep('auth');
        }
    }, [user]);

    const renderStep = () => {
        switch (currentStep) {
            case 'auth':
                return <AuthStep onSuccess={() => setCurrentStep('payment')} />;
            case 'payment':
                return <PaymentStep course={course!} onSuccess={() => setCurrentStep('confirmation')} />;
            case 'confirmation':
                return <ConfirmationStep />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="text-center p-12">{t('courseDetail.loading')}</div>;
    }
    
    if (error) {
        return <div className="text-center p-12 text-red-500">{error}</div>;
    }

    if (!course) return null;

    const steps = ['account', 'payment', 'confirmation'];
    const currentStepIndex = steps.indexOf(currentStep);

    return (
        <div className="bg-gray-100 dark:bg-gray-900/50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-4">{t('enroll.title')}</h1>
                
                {/* Step Indicator */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="flex items-center justify-center">
                        {steps.map((step, index) => (
                            <React.Fragment key={step}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStepIndex ? 'bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                        {index < currentStepIndex ? <i className="fas fa-check"></i> : index + 1}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${index <= currentStepIndex ? 'text-indigo-600' : 'text-gray-500'}`}>{t(`enroll.steps.${step}`)}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`flex-auto border-t-2 mx-4 ${index < currentStepIndex ? 'border-indigo-600' : 'border-gray-300 dark:border-gray-700'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="lg:w-2/3">
                        {renderStep()}
                    </div>
                    <div className="lg:w-1/3">
                        <OrderSummary course={course} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnrollmentPage;