-- Migration to create a function for handling student enrollment
-- Migration: 20250923_enrollment_function

CREATE OR REPLACE FUNCTION create_enrollment(
    course_id_param UUID,
    user_id_param UUID,
    payment_method_param payment_method_enum,
    payment_amount_param DECIMAL,
    payment_currency_param TEXT
)
RETURNS JSONB AS $$
DECLARE
    new_enrollment_id UUID;
    new_payment_id UUID;
    payment_status_param payment_status_enum;
BEGIN
    -- Determine payment status based on method
    IF payment_method_param = 'online' THEN
        payment_status_param := 'completed';
    ELSE
        payment_status_param := 'pending';
    END IF;

    -- 1. Create a payment record
    INSERT INTO public.payments (user_id, payment_type, reference_id, amount, currency, payment_method, payment_status)
    VALUES (user_id_param, 'course_enrollment', course_id_param, payment_amount_param, payment_currency_param, payment_method_param, payment_status_param)
    RETURNING id INTO new_payment_id;

    -- 2. Create a student enrollment record
    INSERT INTO public.student_enrollments (student_id, course_id, is_active)
    VALUES (user_id_param, course_id_param, true)
    RETURNING id INTO new_enrollment_id;

    -- 3. Increment the course enrollment count
    UPDATE public.courses
    SET enrollment_count = enrollment_count + 1
    WHERE id = course_id_param;

    -- Return success with the new IDs
    RETURN jsonb_build_object(
        'success', true,
        'enrollmentId', new_enrollment_id,
        'paymentId', new_payment_id
    );
EXCEPTION
    WHEN unique_violation THEN
        -- Handle case where user is already enrolled
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User is already enrolled in this course.'
        );
    WHEN others THEN
        -- Handle other potential errors
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION public.create_enrollment(UUID, UUID, payment_method_enum, DECIMAL, TEXT) TO authenticated;