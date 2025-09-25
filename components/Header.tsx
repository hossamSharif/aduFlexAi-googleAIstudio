import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useRouter } from '../App';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useLocalization();
  const { navigateTo } = useRouter();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigateTo(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigateTo('/');
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
          
          {user ? (
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                <img className="h-full w-full rounded-full" src={user.profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.profile?.first_name}+${user.profile?.last_name}&background=random`} alt="" />
              </button>
              {isMenuOpen && (
                <div className="origin-top-right absolute end-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">{t('header.myLearning')}</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">{t('header.profile')}</a>
                  <button onClick={handleLogout} className="w-full text-start block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                    {t('header.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="hidden md:inline-block text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold">
                {t('header.login')}
              </button>
              <button className="hidden md:inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all">
                {t('header.signup')}
              </button>
            </>
          )}

          <button className="md:hidden text-gray-600 dark:text-gray-300">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;