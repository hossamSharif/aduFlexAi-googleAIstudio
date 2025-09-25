import { supabase } from './supabaseClient';
import type { Provider } from '@supabase/supabase-js';

// --- Sign Up ---
export const signUp = async (
    { email, password, firstName, lastName }:
    { email: string, password: string, firstName: string, lastName: string }
) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Sign up successful, but no user data returned.");

    // Create a corresponding profile in the public.user_profiles table
    const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
            id: authData.user.id,
            email: email,
            username: email.split('@')[0], // simple default username
            first_name: firstName,
            last_name: lastName,
            first_name_ar: firstName, // Assuming same for now
            last_name_ar: lastName,
        });

    if (profileError) {
        // This is a tricky state. The auth user was created but the profile failed.
        // For now, we'll throw the error. A more robust solution might try to clean up the auth user.
        throw profileError;
    }

    return authData;
};

// --- Sign In ---
export const signIn = async ({ email, password }: { email: string, password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

// --- Sign In with OAuth (e.g., Google) ---
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.href, // Redirect back to the same page after login
        },
    });
    if (error) throw error;
    return data;
};


// --- Sign Out ---
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};