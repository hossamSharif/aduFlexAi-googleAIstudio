import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useRouter } from '../App';

const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useLocalization();
  const { navigateTo } = useRouter();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#" onClick={(e) => handleNavClick(e, '/')} className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          EduFlex
        </a>
        <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
          <a href="#" onClick={(e) => handleNavClick(e, '/courses')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('header.courses')}</a>
          <a href="#" onClick={(e) => handleNavClick(e, '/')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('header.categories')}</a>
          <a href="#" onClick={(e) => handleNavClick(e, '/')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('header.about')}</a>
        </nav>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <button onClick={toggleLanguage} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold">
            {language === 'en' ? t('header.switchToAr') : t('header.switchToEn')}
          </button>
          <button className="hidden md:inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all">
            {t('header.signup')}
          </button>
          <button className="md:hidden text-gray-600 dark:text-gray-300">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;