import React, { useState, useMemo } from 'react';
import type { CourseDetails } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface OrderSummaryProps {
    course: CourseDetails;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ course }) => {
    const { t, formatCurrency } = useLocalization();
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoStatus, setPromoStatus] = useState<'idle' | 'applied' | 'invalid'>('idle');

    const handleApplyPromo = () => {
        // Dummy promo code logic
        if (promoCode.toUpperCase() === 'SAVE10') {
            setDiscount(0.10);
            setPromoStatus('applied');
        } else {
            setDiscount(0);
            setPromoStatus('invalid');
        }
    };

    const subtotal = course.price;
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md lg:sticky lg:top-24">
            <h2 className="text-xl font-bold mb-4">{t('enroll.summary.title')}</h2>
            <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                <img src={course.imageUrl} alt={course.title} className="w-24 h-16 object-cover rounded-md" />
                <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.instructor.name}</p>
                </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                    <span>{t('enroll.summary.subtotal')}</span>
                    <span>{formatCurrency(subtotal, course.currency)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>{t('enroll.summary.discount')} ({promoCode.toUpperCase()})</span>
                        <span>-{formatCurrency(discountAmount, course.currency)}</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder={t('enroll.summary.promo.placeholder')} 
                    value={promoCode}
                    onChange={e => {
                        setPromoCode(e.target.value);
                        setPromoStatus('idle');
                    }}
                    className="flex-grow p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleApplyPromo} className="bg-gray-200 dark:bg-gray-600 px-4 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">{t('enroll.summary.promo.apply')}</button>
            </div>
            {promoStatus === 'applied' && <p className="text-xs text-green-600 mb-4">{t('enroll.summary.promo.applied')}</p>}
            {promoStatus === 'invalid' && <p className="text-xs text-red-500 mb-4">{t('enroll.summary.promo.invalid')}</p>}

            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200 dark:border-gray-700">
                <span>{t('enroll.summary.total')}</span>
                <span>{formatCurrency(total, course.currency)}</span>
            </div>
        </div>
    );
};

export default OrderSummary;