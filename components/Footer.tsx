import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';

const Footer: React.FC = () => {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes('@')) {
        setMessage(t('footer.newsletter.success'));
        setEmail('');
    } else {
        setMessage(t('footer.newsletter.error'));
    }
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
             <div className="lg:flex lg:justify-between lg:items-center p-6 bg-indigo-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{t('footer.newsletter.title')}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{t('footer.newsletter.description')}</p>
                </div>
                <form onSubmit={handleSubscribe} className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-2 w-full max-w-md">
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('footer.newsletter.placeholder')}
                        className="flex-grow w-full py-2 px-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Email address"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors font-semibold whitespace-nowrap">
                        {t('footer.newsletter.button')}
                    </button>
                </form>
            </div>
            {message && <p className={`mt-2 text-sm ${message.includes('Thanks') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">EduFlex</h3>
            <p className="text-gray-500 dark:text-gray-400">
                {t('footer.tagline')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.about')}</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.contact')}</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.careers')}</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.blog')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">{t("footer.community")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.help')}</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.affiliate')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-white mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.terms')}</a></li>
              <li><a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">{t('footer.privacy')}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">{t('footer.copyright')}</p>
          <div className="flex space-x-4 rtl:space-x-reverse mt-4 md:mt-0">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600"><i className="fab fa-linkedin-in"></i></a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;