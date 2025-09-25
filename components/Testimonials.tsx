import React, { useState, useEffect } from 'react';
import { testimonials } from '../constants';
import { useLocalization } from '../hooks/useLocalization';

const Testimonials: React.FC = () => {
  const { t } = useLocalization();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          {t('testimonials.title')}
        </h2>
        <div className="relative max-w-3xl mx-auto min-h-[250px] flex items-center justify-center">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`absolute w-full transition-opacity duration-1000 ease-in-out ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={index !== activeIndex}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <img src={testimonial.imageUrl} alt={testimonial.name} className="w-16 h-16 rounded-full me-4" loading="lazy" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-indigo-600 dark:text-indigo-400">{t(testimonial.titleKey)}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{t(testimonial.quoteKey)}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;