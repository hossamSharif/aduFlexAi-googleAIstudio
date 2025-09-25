import React, { useState, useMemo } from 'react';
import type { Review } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface ReviewsSectionProps {
    reviews: Review[];
    averageRating: number;
    totalRatings: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, averageRating, totalRatings }) => {
    const { t, formatNumber } = useLocalization();
    const [visibleReviews, setVisibleReviews] = useState(4);

    const ratingDistribution = useMemo(() => {
        const distribution = [0, 0, 0, 0, 0];
        reviews.forEach(review => {
            if (review.rating >= 1 && review.rating <= 5) {
                distribution[5 - review.rating]++;
            }
        });
        return distribution.map(count => totalRatings > 0 ? (count / totalRatings) * 100 : 0);
    }, [reviews, totalRatings]);

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">{t('courseDetail.studentFeedback')}</h2>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="text-center">
                    <div className="text-6xl font-bold text-yellow-500">{formatNumber(averageRating)}</div>
                    <div className="flex items-center justify-center text-yellow-400 text-lg">
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                        ))}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">{t('courseDetail.courseRating')}</div>
                </div>
                <div className="w-full flex-grow">
                    {ratingDistribution.map((percentage, index) => (
                        <div key={index} className="flex items-center gap-4 text-sm">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="flex items-center text-yellow-400 min-w-[70px]">
                                {[...Array(5 - index)].map((_, i) => <i key={i} className="fa-solid fa-star"></i>)}
                            </div>
                            <span className="w-12 text-end">{formatNumber(Math.round(percentage))}%</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 space-y-6">
                {reviews.slice(0, visibleReviews).map(review => (
                    <div key={review.id} className="border-t border-gray-200 dark:border-gray-700 pt-6">
                         <div className="flex items-center mb-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold me-3">
                                {review.studentName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold">{review.studentName}</p>
                                <div className="flex items-center text-xs text-gray-500">
                                    <div className="flex items-center text-yellow-400 me-2">
                                        {[...Array(5)].map((_, i) => <i key={i} className={`fa-solid fa-star ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>)}
                                    </div>
                                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                         </div>
                         <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </div>
                ))}
            </div>

            {reviews.length > visibleReviews && (
                <div className="mt-6">
                    <button onClick={() => setVisibleReviews(prev => prev + 4)} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        {t('courseDetail.reviews.showMore')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;