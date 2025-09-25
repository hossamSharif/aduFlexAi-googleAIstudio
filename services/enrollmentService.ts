import { supabase } from './supabaseClient';

export const enrollInCourse = async (
    courseId: string,
    userId: string,
    paymentMethod: 'online' | 'offline',
    amount: number,
    currency: string
) => {
    const { data, error } = await supabase.rpc('create_enrollment', {
        course_id_param: courseId,
        user_id_param: userId,
        payment_method_param: paymentMethod,
        payment_amount_param: amount,
        payment_currency_param: currency
    });

    if (error) {
        console.error("Error calling create_enrollment function:", error);
        throw new Error("Failed to enroll in the course.");
    }
    
    const result = data as { success: boolean, error?: string };

    if (!result.success) {
        throw new Error(result.error || "An unknown error occurred during enrollment.");
    }

    return result;
};
