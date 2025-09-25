import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import { enrollInCourse } from '../../services/enrollmentService';
import type { CourseDetails } from '../../types';

interface PaymentStepProps {
    course: CourseDetails;
    onSuccess: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ course, onSuccess }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!user) {
            setError("You must be logged in to enroll.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await enrollInCourse(course.id, user.id, paymentMethod, course.price, course.currency);
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">{t('enroll.payment.title')}</h2>
            
            <div className="space-y-4 mb-8">
                {/* Online Payment Option */}
                <div 
                    onClick={() => setPaymentMethod('online')}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}
                >
                    <label className="flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => {}} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
                        <div className="ms-4">
                            <p className="font-semibold">{t('enroll.payment.online')}</p>
                            <p className="text-sm text-gray-500">{t('enroll.payment.online.description')}</p>
                        </div>
                    </label>
                    {paymentMethod === 'online' && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                             <input type="text" placeholder={t('enroll.payment.fields.cardNumber')} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                             <div className="flex gap-3">
                                <input type="text" placeholder={t('enroll.payment.fields.expiry')} className="w-1/2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                                <input type="text" placeholder={t('enroll.payment.fields.cvc')} className="w-1/2 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                             </div>
                        </div>
                    )}
                </div>

                {/* Offline Payment Option */}
                <div 
                    onClick={() => setPaymentMethod('offline')}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'offline' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-300 dark:border-gray-600'}`}
                >
                     <label className="flex items-center cursor-pointer">
                        <input type="radio" name="paymentMethod" value="offline" checked={paymentMethod === 'offline'} onChange={() => {}} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
                        <div className="ms-4">
                            <p className="font-semibold">{t('enroll.payment.offline')}</p>
                            <p className="text-sm text-gray-500">{t('enroll.payment.offline.description')}</p>
                        </div>
                    </label>
                    {paymentMethod === 'offline' && (
                         <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 pt-4 border-t border-gray-200 dark:border-gray-700">{t('enroll.payment.offline.instructions')}</p>
                    )}
                </div>
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                {isLoading ? t('enroll.payment.processing') : t('enroll.payment.confirmButton')}
            </button>
        </div>
    );
};

export default PaymentStep;