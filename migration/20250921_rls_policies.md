-- Row Level Security (RLS) Policies
-- Migration: 20250921_rls_policies

-- Helper function to check for admin role
DROP FUNCTION IF EXISTS is_admin() CASCADE;
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- This function MUST be SECURITY DEFINER to break the RLS recursion chain.
  -- It allows the function to check user_profiles without re-triggering RLS policies
  -- on that same table when called from a policy on another table (e.g., courses).
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
-- Setting the search path is a required security practice for SECURITY DEFINER functions.
ALTER FUNCTION public.is_admin() SET search_path = public;


-- Helper function to get user's organization_id
DROP FUNCTION IF EXISTS get_user_organization_id() CASCADE;
CREATE OR REPLACE FUNCTION get_user_organization_id() RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- This function MUST be SECURITY DEFINER for the same reasons as is_admin().
  SELECT organization_id INTO org_id
  FROM public.user_profiles
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
ALTER FUNCTION public.get_user_organization_id() SET search_path = public;


-- The is_reviewer function is removed to break a complex dependency chain.
-- It is now dropped with CASCADE to remove dependent policies automatically.
DROP FUNCTION IF EXISTS is_reviewer(UUID) CASCADE;


-- =================================================================
-- RLS Policies for `organizations`
-- =================================================================
-- Admins can manage their own organization
DROP POLICY IF EXISTS "Admins can manage own organization" ON organizations;
CREATE POLICY "Admins can manage own organization" ON organizations
  FOR ALL USING (id = get_user_organization_id() AND is_admin());

-- Users can view their own organization
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (id = get_user_organization_id());


-- =================================================================
-- RLS Policies for `user_profiles`
-- =================================================================
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can manage profiles in their organization
DROP POLICY IF EXISTS "Admins can manage organization profiles" ON user_profiles;
CREATE POLICY "Admins can manage organization profiles" ON user_profiles
  FOR ALL USING (organization_id = get_user_organization_id() AND is_admin());

-- Allow public read access to instructor profiles for course display
DROP POLICY IF EXISTS "Public can view instructor profiles" ON user_profiles;
CREATE POLICY "Public can view instructor profiles" ON user_profiles
  FOR SELECT USING (user_type = 'instructor');

-- Allow public read access to profiles of students who wrote approved reviews
DROP POLICY IF EXISTS "Public can view reviewer profiles" ON user_profiles;
CREATE POLICY "Public can view reviewer profiles" ON user_profiles
  FOR SELECT USING (
    id IN (SELECT student_id FROM public.reviews WHERE moderation_status = 'approved')
  );


-- =================================================================
-- RLS Policies for `instructor_profiles`
-- =================================================================
-- Instructors can manage their own profile
DROP POLICY IF EXISTS "Instructors can manage own profile" ON instructor_profiles;
CREATE POLICY "Instructors can manage own profile" ON instructor_profiles
  FOR ALL USING (user_id = auth.uid());

-- Admins can manage instructor profiles in their organization
DROP POLICY IF EXISTS "Admins can manage organization instructors" ON instructor_profiles;
CREATE POLICY "Admins can manage organization instructors" ON instructor_profiles
  FOR ALL USING (organization_id = get_user_organization_id() AND is_admin());

-- Allow public read access to instructor profiles
DROP POLICY IF EXISTS "Public can view instructor profiles" ON instructor_profiles;
CREATE POLICY "Public can view instructor profiles" ON instructor_profiles
  FOR SELECT USING (true);


-- =================================================================
-- RLS Policies for `courses`
-- =================================================================
-- Public can view published courses
DROP POLICY IF EXISTS "Public can view published courses" ON courses;
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT USING (status = 'published');

-- Instructors can manage their own courses
DROP POLICY IF EXISTS "Instructors can manage own courses" ON courses;
CREATE POLICY "Instructors can manage own courses" ON courses
  FOR ALL USING (instructor_id = (
    SELECT id FROM instructor_profiles WHERE user_id = auth.uid()
  ));

-- Admins can manage all courses in their organization
DROP POLICY IF EXISTS "Admins can manage organization courses" ON courses;
CREATE POLICY "Admins can manage organization courses" ON courses
  FOR ALL USING (organization_id = get_user_organization_id() AND is_admin());


-- =================================================================
-- RLS Policies for `course_modules` and `lessons`
-- =================================================================
-- Public can view modules/lessons of published, previewable courses
DROP POLICY IF EXISTS "Public can view preview lessons" ON lessons;
CREATE POLICY "Public can view preview lessons" ON lessons
  FOR SELECT USING (
    is_preview = true AND
    module_id IN (
      SELECT m.id FROM course_modules m
      JOIN courses c ON m.course_id = c.id
      WHERE c.status = 'published'
    )
  );

-- Enrolled students can view all lessons of their courses
DROP POLICY IF EXISTS "Enrolled students can view lessons" ON lessons;
CREATE POLICY "Enrolled students can view lessons" ON lessons
  FOR SELECT USING (
    module_id IN (
      SELECT m.id FROM course_modules m
      WHERE m.course_id IN (
        SELECT course_id FROM student_enrollments
        WHERE student_id = auth.uid() AND is_active = true
      )
    )
  );

-- Same policies for modules
DROP POLICY IF EXISTS "Public can view modules of published courses" ON course_modules;
CREATE POLICY "Public can view modules of published courses" ON course_modules
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses WHERE status = 'published')
  );

DROP POLICY IF EXISTS "Enrolled students can view modules" ON course_modules;
CREATE POLICY "Enrolled students can view modules" ON course_modules
  FOR SELECT USING (
    course_id IN (
      SELECT course_id FROM student_enrollments
      WHERE student_id = auth.uid() AND is_active = true
    )
  );


-- =================================================================
-- RLS Policies for `student_enrollments`
-- =================================================================
-- Students can view their own enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON student_enrollments;
CREATE POLICY "Students can view own enrollments" ON student_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Admins can manage enrollments for courses in their organization
DROP POLICY IF EXISTS "Admins can manage organization enrollments" ON student_enrollments;
CREATE POLICY "Admins can manage organization enrollments" ON student_enrollments
  FOR ALL USING (
    is_admin() AND
    course_id IN (SELECT id FROM courses WHERE organization_id = get_user_organization_id())
  );


-- =================================================================
-- RLS Policies for `reviews`
-- =================================================================
-- Public can view approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (moderation_status = 'approved');

-- Users can create a review for a course they are enrolled in
DROP POLICY IF EXISTS "Enrolled students can create reviews" ON reviews;
CREATE POLICY "Enrolled students can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM student_enrollments
      WHERE student_id = auth.uid() AND course_id = reviews.course_id
    )
  );

-- Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (student_id = auth.uid());

-- Users can delete their own reviews
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews
  FOR DELETE USING (student_id = auth.uid());

-- =================================================================
-- RLS Policies for `categories`
-- =================================================================
-- Public can read all categories
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);
  
-- Admins can manage categories
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin());