import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';

interface AuthStepProps {
    onSuccess: () => void;
}

const AuthStep: React.FC<AuthStepProps> = ({ onSuccess }) => {
    const { t } = useLocalization();
    const { signIn, signUp, signInWithGoogle } = useAuth();
    const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (activeTab === 'signup') {
                await signUp({ email, password, firstName, lastName });
                // onSuccess will be triggered by onAuthStateChange in useAuth
            } else {
                await signIn({ email, password });
                // onSuccess will be triggered by onAuthStateChange in useAuth
            }
        } catch (err: any) {
            setError(t('enroll.auth.error', { message: err.message }));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch(err: any) {
            setError(t('enroll.auth.error', { message: err.message }));
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button 
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-3 font-semibold text-center ${activeTab === 'signup' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >{t('enroll.auth.signup.title')}</button>
                <button 
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-3 font-semibold text-center ${activeTab === 'login' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >{t('enroll.auth.login.title')}</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
                {activeTab === 'signup' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="firstName">{t('enroll.auth.fields.firstName')}</label>
                            <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="lastName">{t('enroll.auth.fields.lastName')}</label>
                            <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">{t('enroll.auth.fields.email')}</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">{t('enroll.auth.fields.password')}</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" required />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400">
                    {isLoading ? (activeTab === 'signup' ? t('enroll.auth.signingUp') : t('enroll.auth.loggingIn')) : (activeTab === 'signup' ? t('enroll.auth.signup.button') : t('enroll.auth.login.button'))}
                </button>
            </form>

             <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
                <span className="mx-4 text-gray-500">{t('enroll.auth.or')}</span>
                <hr className="flex-grow border-gray-300 dark:border-gray-600"/>
            </div>
            
            <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <i className="fab fa-google"></i>
                {t('enroll.auth.google')}
            </button>
        </div>
    );
};

export default AuthStep;