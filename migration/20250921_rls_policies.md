-- Row Level Security (RLS) Policies
-- Migration: 20250921_rls_policies

-- Helper function to check for admin role
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id() RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM user_profiles
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =================================================================
-- RLS Policies for `organizations`
-- =================================================================
-- Admins can manage their own organization
CREATE POLICY "Admins can manage own organization" ON organizations
  FOR ALL USING (id = get_user_organization_id() AND is_admin());

-- Users can view their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (id = get_user_organization_id());


-- =================================================================
-- RLS Policies for `user_profiles`
-- =================================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can manage profiles in their organization
CREATE POLICY "Admins can manage organization profiles" ON user_profiles
  FOR ALL USING (organization_id = get_user_organization_id() AND is_admin());

-- Allow public read access to instructor profiles for course display
CREATE POLICY "Public can view instructor profiles" ON user_profiles
  FOR SELECT USING (user_type = 'instructor');

-- =================================================================
-- RLS Policies for `instructor_profiles`
-- =================================================================
-- Instructors can manage their own profile
CREATE POLICY "Instructors can manage own profile" ON instructor_profiles
  FOR ALL USING (user_id = auth.uid());

-- Admins can manage instructor profiles in their organization
CREATE POLICY "Admins can manage organization instructors" ON instructor_profiles
  FOR ALL USING (organization_id = get_user_organization_id() AND is_admin());

-- Allow public read access to instructor profiles
CREATE POLICY "Public can view instructor profiles" ON instructor_profiles
  FOR SELECT USING (true);


-- =================================================================
-- RLS Policies for `courses`
-- =================================================================
-- Public can view published courses
CREATE POLICY "Public can view published courses" ON courses
  FOR SELECT USING (status = 'published');

-- Instructors can manage their own courses
CREATE POLICY "Instructors can manage own courses" ON courses
  FOR ALL USING (instructor_id = (
    SELECT id FROM instructor_profiles WHERE user_id = auth.uid()
  ));

-- Admins can manage all courses in their organization
CREATE POLICY "Admins can manage organization courses" ON courses
  FOR ALL USING (organization_id = get_user_organization_id() AND is_admin());


-- =================================================================
-- RLS Policies for `course_modules` and `lessons`
-- =================================================================
-- Public can view modules/lessons of published, previewable courses
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
CREATE POLICY "Public can view modules of published courses" ON course_modules
  FOR SELECT USING (
    course_id IN (SELECT id FROM courses WHERE status = 'published')
  );

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
CREATE POLICY "Students can view own enrollments" ON student_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- Admins can manage enrollments in their organization
CREATE POLICY "Admins can manage organization enrollments" ON student_enrollments
  FOR ALL USING (
    is_admin() AND
    course_id IN (
      SELECT id FROM courses
      WHERE organization_id = get_user_organization_id()
    )
  );


-- =================================================================
-- RLS Policies for `reviews`
-- =================================================================
-- Public can view approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (moderation_status = 'approved');

-- Users can create a review for a course they are enrolled in
CREATE POLICY "Enrolled students can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM student_enrollments
      WHERE student_id = auth.uid() AND course_id = reviews.course_id
    )
  );

-- Users can update/delete their own reviews
CREATE POLICY "Users can manage own reviews" ON reviews
  FOR UPDATE, DELETE USING (student_id = auth.uid());

-- =================================================================
-- RLS Policies for `categories`
-- =================================================================
-- Public can read all categories
CREATE POLICY "Public can read categories" ON categories
  FOR SELECT USING (true);
  
-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin());
