-- Storage buckets and policies setup
-- Migration: 20250921_storage_setup

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('course-media', 'course-media', false, 104857600, '{"image/*","video/*","application/pdf","text/*"}'),
('user-avatars', 'user-avatars', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif"}'),
('certificates', 'certificates', false, 10485760, '{"application/pdf"}'),
('course-resources', 'course-resources', false, 52428800, '{"application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation","text/*","image/*"}');

-- Storage policies for course-media bucket
CREATE POLICY "Instructors can upload course media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-media' AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'instructor'
    )
  );

CREATE POLICY "Instructors can update own course media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'course-media' AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'instructor'
    )
  );

CREATE POLICY "Instructors can delete own course media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-media' AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'instructor'
    )
  );

CREATE POLICY "Students can view course media they're enrolled in" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-media' AND
    (
      -- Public course materials
      name LIKE '%/public/%' OR
      -- Enrolled students can access course media
      auth.uid() IN (
        SELECT se.student_id FROM student_enrollments se
        JOIN courses c ON se.course_id = c.id
        WHERE se.is_active = true
        AND name LIKE c.id::text || '/%'
      )
    )
  );

-- Storage policies for user-avatars bucket (public)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for certificates bucket
CREATE POLICY "Students can view own certificates" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'certificates' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Instructors can upload certificates for their students" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'certificates' AND
    auth.uid() IN (
      SELECT c.instructor_id FROM courses c
      JOIN student_enrollments se ON c.id = se.course_id
      WHERE se.student_id::text = (storage.foldername(name))[1]
    )
  );

-- Storage policies for course-resources bucket
CREATE POLICY "Instructors can manage course resources" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-resources' AND
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'instructor'
    )
  );

CREATE POLICY "Students can view course resources they're enrolled in" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-resources' AND
    auth.uid() IN (
      SELECT se.student_id FROM student_enrollments se
      JOIN courses c ON se.course_id = c.id
      WHERE se.is_active = true
      AND name LIKE c.id::text || '/%'
    )
  );

-- Admins can manage all storage in their organization
CREATE POLICY "Admins can manage organization storage" ON storage.objects
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE user_type = 'admin'
    )
  );

-- Function to generate file path for course media
CREATE OR REPLACE FUNCTION generate_course_media_path(
  course_id UUID,
  file_type TEXT,
  file_name TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN course_id::text || '/' || file_type || '/' || file_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate file path for user avatar
CREATE OR REPLACE FUNCTION generate_avatar_path(
  user_id UUID,
  file_name TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN user_id::text || '/' || file_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate certificate path
CREATE OR REPLACE FUNCTION generate_certificate_path(
  student_id UUID,
  course_id UUID,
  certificate_type TEXT DEFAULT 'completion'
) RETURNS TEXT AS $$
BEGIN
  RETURN student_id::text || '/' || course_id::text || '_' || certificate_type || '_' ||
         extract(epoch from now())::text || '.pdf';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up orphaned storage objects
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage()
RETURNS void AS $$
BEGIN
  -- This function should be called periodically to clean up storage objects
  -- that are no longer referenced by the application

  -- Delete course media for deleted courses
  DELETE FROM storage.objects
  WHERE bucket_id = 'course-media'
  AND name LIKE '%/%'
  AND (storage.foldername(name))[1]::uuid NOT IN (
    SELECT id::text FROM courses WHERE deleted_at IS NULL
  );

  -- Delete avatars for deleted users
  DELETE FROM storage.objects
  WHERE bucket_id = 'user-avatars'
  AND name LIKE '%/%'
  AND (storage.foldername(name))[1]::uuid NOT IN (
    SELECT id::text FROM user_profiles WHERE deleted_at IS NULL
  );

  -- Delete certificates for inactive enrollments
  DELETE FROM storage.objects
  WHERE bucket_id = 'certificates'
  AND name LIKE '%/%/%'
  AND NOT EXISTS (
    SELECT 1 FROM student_enrollments se
    WHERE se.student_id::text = (storage.foldername(name))[1]
    AND se.is_active = true
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a table to track storage usage quotas
CREATE TABLE storage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    bucket_name TEXT NOT NULL,
    max_size_bytes BIGINT DEFAULT 1073741824, -- 1GB default
    current_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, bucket_name)
);

-- Function to check storage quota
CREATE OR REPLACE FUNCTION check_storage_quota(
  org_id UUID,
  bucket TEXT,
  file_size BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
  quota_record storage_quotas%ROWTYPE;
BEGIN
  -- Get quota for organization and bucket
  SELECT * INTO quota_record
  FROM storage_quotas
  WHERE organization_id = org_id AND bucket_name = bucket;

  -- If no quota exists, create default
  IF NOT FOUND THEN
    INSERT INTO storage_quotas (organization_id, bucket_name)
    VALUES (org_id, bucket)
    RETURNING * INTO quota_record;
  END IF;

  -- Check if adding file would exceed quota
  RETURN (quota_record.current_size_bytes + file_size) <= quota_record.max_size_bytes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage usage
CREATE OR REPLACE FUNCTION update_storage_usage()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  bucket_name TEXT;
  size_change BIGINT;
BEGIN
  bucket_name := COALESCE(NEW.bucket_id, OLD.bucket_id);

  -- Get organization ID from the file path or user
  IF bucket_name = 'course-media' OR bucket_name = 'course-resources' THEN
    -- Extract course ID from path and get organization
    SELECT c.organization_id INTO org_id
    FROM courses c
    WHERE c.id::text = (storage.foldername(COALESCE(NEW.name, OLD.name)))[1];
  ELSE
    -- Get organization from user profile
    SELECT up.organization_id INTO org_id
    FROM user_profiles up
    WHERE up.id::text = (storage.foldername(COALESCE(NEW.name, OLD.name)))[1];
  END IF;

  IF org_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate size change
  IF TG_OP = 'INSERT' THEN
    size_change := NEW.metadata->>'size'::bigint;
  ELSIF TG_OP = 'DELETE' THEN
    size_change := -(OLD.metadata->>'size'::bigint);
  ELSE -- UPDATE
    size_change := (NEW.metadata->>'size'::bigint) - (OLD.metadata->>'size'::bigint);
  END IF;

  -- Update storage quota
  INSERT INTO storage_quotas (organization_id, bucket_name, current_size_bytes)
  VALUES (org_id, bucket_name, size_change)
  ON CONFLICT (organization_id, bucket_name)
  DO UPDATE SET
    current_size_bytes = storage_quotas.current_size_bytes + size_change,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to track storage usage
CREATE TRIGGER track_storage_usage
  AFTER INSERT OR UPDATE OR DELETE ON storage.objects
  FOR EACH ROW EXECUTE FUNCTION update_storage_usage();

-- RLS for storage quotas
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins see organization storage quotas" ON storage_quotas
  FOR ALL USING (
    organization_id = get_user_organization_id() AND is_admin()
  );