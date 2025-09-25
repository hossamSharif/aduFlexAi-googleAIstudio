import React, { useState, createContext, useContext } from 'react';
import { LocalizationProvider } from './hooks/useLocalization';
import Header from './components/Header';
import Footer from './components/Footer';
import CourseCatalog from './components/CourseCatalog';
import LandingPage from './components/LandingPage';

// Create a context for our simple router
interface RouterContextType {
  navigateTo: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

// Custom hook to use the router context
export const useRouter = () => {
    const context = useContext(RouterContext);
    if (!context) {
        throw new Error('useRouter must be used within the App component');
    }
    return context;
};


const App: React.FC = () => {
  // State to manage the current view, independent of URL hash
  const [route, setRoute] = useState('/');

  const navigateTo = (path: string) => {
    setRoute(path);
    window.scrollTo(0, 0);
  };

  const renderContent = () => {
    switch (route) {
      case '/courses':
        return <CourseCatalog />;
      default:
        return <LandingPage />;
    }
  };


  return (
    <LocalizationProvider>
      <RouterContext.Provider value={{ navigateTo }}>
        <div className="bg-gray-50 dark:bg-gray-900 font-sans flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {renderContent()}
          </main>
          <Footer />
        </div>
      </RouterContext.Provider>
    </LocalizationProvider>
  );
};

export default App;