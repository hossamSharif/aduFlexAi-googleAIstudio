-- Migration to add a full-text search function for courses
-- Migration: 20250922_search_function

CREATE OR REPLACE FUNCTION search_courses(search_term TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    title_ar TEXT,
    description TEXT,
    description_ar TEXT,
    thumbnail_url TEXT,
    price DECIMAL,
    currency TEXT,
    estimated_duration_hours INTEGER,
    rating_average DECIMAL,
    rating_count INTEGER,
    language language_enum,
    instructor_profiles JSONB
)
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        c.title_ar,
        c.description,
        c.description_ar,
        c.thumbnail_url,
        c.price,
        c.currency,
        c.estimated_duration_hours,
        c.rating_average,
        c.rating_count,
        c.language,
        jsonb_build_object(
            'user_profiles', jsonb_build_object(
                'first_name', up.first_name,
                'last_name', up.last_name,
                'first_name_ar', up.first_name_ar,
                'last_name_ar', up.last_name_ar
            )
        ) as instructor_profiles
    FROM
        courses c
    LEFT JOIN
        instructor_profiles ip ON c.instructor_id = ip.id
    LEFT JOIN
        user_profiles up ON ip.user_id = up.id
    WHERE
        c.status = 'published' AND
        c.deleted_at IS NULL AND
        (
            to_tsvector('arabic', c.title_ar || ' ' || c.description_ar) @@ websearch_to_tsquery('simple', search_term)
            OR
            to_tsvector('english', c.title || ' ' || c.description) @@ websearch_to_tsquery('simple', search_term)
        )
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set a specific search path for the function to avoid schema resolution issues.
-- This ensures that it looks for tables in the `public` schema, which can resolve
-- potential permission errors when the function is executed by different roles.
ALTER FUNCTION public.search_courses(TEXT) SET search_path = public;

-- Grant execution permission to the anonymous role so public users can search
GRANT EXECUTE ON FUNCTION search_courses(TEXT) TO anon;

-- Explicitly grant SELECT on tables to the anon role. 
-- RLS policies will still apply, but this ensures base-level access for the RPC call.
GRANT SELECT ON TABLE public.courses TO anon;
GRANT SELECT ON TABLE public.instructor_profiles TO anon;
GRANT SELECT ON TABLE public.user_profiles TO anon;