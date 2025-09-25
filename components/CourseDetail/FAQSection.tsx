import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';

const FAQItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 dark:border-gray-700 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-start"
            >
                <h3 className="text-lg font-semibold">{title}</h3>
                <i className={`fas fa-chevron-down transition-transform ${isOpen ? 'transform rotate-180' : ''}`}></i>
            </button>
            {isOpen && <div className="mt-4 text-gray-600 dark:text-gray-300">{children}</div>}
        </div>
    );
};

const FAQSection: React.FC = () => {
    const { t } = useLocalization();

    // Hardcoded FAQs for now, can be fetched from a CMS later
    const faqs = [
        { q: "Is this course suitable for beginners?", a: "Absolutely! This course is designed to take you from the very basics to advanced concepts, with no prior knowledge required." },
        { q: "Do I get a certificate after completion?", a: "Yes, upon successful completion of all modules and assignments, you will receive a verifiable certificate that you can share on your resume and social media." },
        { q: "What if I'm not satisfied with the course?", a: "We offer a 30-day money-back guarantee. If you're not happy with the course for any reason, you can request a full refund within 30 days of purchase." },
        { q: "How long do I have access to the course?", a: "You get full lifetime access to the course materials, including all future updates, so you can learn at your own pace and revisit concepts anytime." }
    ];

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">{t('courseDetail.faq.title')}</h2>
            <div>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} title={faq.q}>
                        <p>{faq.a}</p>
                    </FAQItem>
                ))}
            </div>
        </div>
    );
};

export default FAQSection;