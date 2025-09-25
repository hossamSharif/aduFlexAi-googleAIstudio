import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useRouter } from '../../App';
import { useAuth } from '../../hooks/useAuth';

const ConfirmationStep: React.FC = () => {
    const { t } = useLocalization();
    const { navigateTo } = useRouter();
    const { user } = useAuth();
    
    const needsVerification = user?.aud === 'authenticated' && !user.email_confirmed_at;

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-check text-3xl text-green-600 dark:text-green-400"></i>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('enroll.confirmation.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('enroll.confirmation.subtitle')}</p>
            
            {needsVerification && (
                 <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 p-4 rounded-md mb-6">
                    <p>{t('enroll.confirmation.verification')}</p>
                </div>
            )}
            
            {/* This part could be enhanced by checking the payment status from a service */}
            {/* <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 p-4 rounded-md mb-6">
                <p>{t('enroll.confirmation.offline.pending')}</p>
            </div> */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={() => navigateTo('/my-learning')} 
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    {t('enroll.confirmation.button.myCourses')}
                </button>
                 <button 
                    onClick={() => navigateTo('/courses')} 
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    {t('enroll.confirmation.button.browse')}
                </button>
            </div>
        </div>
    );
};

export default ConfirmationStep;