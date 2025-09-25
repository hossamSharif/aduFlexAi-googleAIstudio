-- Auth hooks and triggers for profile management
-- Migration: 20250921_auth_hooks

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-create user profile when auth.users is created
  -- This will be triggered by auth webhook or manual intervention
  -- The actual profile creation should be handled by the application
  -- to ensure proper organization assignment and validation

  -- Log the new user creation for audit purposes
  INSERT INTO public.user_activity_log (
    user_id,
    activity_type,
    activity_data,
    created_at
  ) VALUES (
    NEW.id,
    'user_created',
    jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user activity log table for audit trail
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for activity log
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX idx_user_activity_log_activity_type ON user_activity_log(activity_type);

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to validate user profile data
CREATE OR REPLACE FUNCTION validate_user_profile()
RETURNS trigger AS $$
BEGIN
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate username format (alphanumeric and underscores only)
  IF NEW.username !~ '^[a-zA-Z0-9_]{3,50}$' THEN
    RAISE EXCEPTION 'Username must be 3-50 characters, alphanumeric and underscores only';
  END IF;

  -- Validate user_type
  IF NEW.user_type NOT IN ('student', 'instructor', 'admin') THEN
    RAISE EXCEPTION 'Invalid user type';
  END IF;

  -- Validate preferred_language
  IF NEW.preferred_language NOT IN ('ar', 'en') THEN
    RAISE EXCEPTION 'Preferred language must be ar or en';
  END IF;

  -- Ensure admin users belong to an organization
  IF NEW.user_type = 'admin' AND NEW.organization_id IS NULL THEN
    RAISE EXCEPTION 'Admin users must belong to an organization';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger to user_profiles
CREATE TRIGGER validate_user_profile_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION validate_user_profile();

-- Function to create instructor profile automatically
CREATE OR REPLACE FUNCTION auto_create_instructor_profile()
RETURNS trigger AS $$
BEGIN
  -- Only create instructor profile if user_type is instructor and profile doesn't exist
  IF NEW.user_type = 'instructor' THEN
    INSERT INTO instructor_profiles (id, bio, bio_ar, years_experience, is_verified)
    VALUES (NEW.id, '', '', 0, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create instructor profile
CREATE TRIGGER auto_create_instructor_profile_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION auto_create_instructor_profile();

-- Function to log profile updates
CREATE OR REPLACE FUNCTION log_profile_updates()
RETURNS trigger AS $$
BEGIN
  -- Log significant profile changes
  IF OLD.email != NEW.email OR
     OLD.user_type != NEW.user_type OR
     OLD.organization_id != NEW.organization_id OR
     OLD.is_active != NEW.is_active THEN

    INSERT INTO user_activity_log (
      user_id,
      activity_type,
      activity_data,
      created_at
    ) VALUES (
      NEW.id,
      'profile_updated',
      jsonb_build_object(
        'old_values', jsonb_build_object(
          'email', OLD.email,
          'user_type', OLD.user_type,
          'organization_id', OLD.organization_id,
          'is_active', OLD.is_active
        ),
        'new_values', jsonb_build_object(
          'email', NEW.email,
          'user_type', NEW.user_type,
          'organization_id', NEW.organization_id,
          'is_active', NEW.is_active
        )
      ),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log profile updates
CREATE TRIGGER log_profile_updates_trigger
  AFTER UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_updates();

-- Function to clean up expired auth tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_tokens
  WHERE expires_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Email verification and notification functions
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS trigger AS $$
BEGIN
  -- This function would integrate with email service
  -- For now, just log the action
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    activity_data,
    created_at
  ) VALUES (
    NEW.id,
    'welcome_email_queued',
    jsonb_build_object(
      'email', NEW.email,
      'preferred_language', NEW.preferred_language,
      'user_type', NEW.user_type
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to queue welcome email
CREATE TRIGGER send_welcome_email_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION send_welcome_email();

-- RLS policies for activity log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Users can see their own activity log
CREATE POLICY "Users see own activity log" ON user_activity_log
  FOR SELECT USING (user_id = auth.uid());

-- Admins can see activity logs for users in their organization
CREATE POLICY "Admins see organization activity logs" ON user_activity_log
  FOR SELECT USING (
    is_admin() AND
    user_id IN (
      SELECT id FROM user_profiles
      WHERE organization_id = get_user_organization_id()
    )
  );

-- Function to get user's last activity
CREATE OR REPLACE FUNCTION get_user_last_activity(target_user_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN (
    SELECT MAX(created_at)
    FROM user_activity_log
    WHERE user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has been active recently
CREATE OR REPLACE FUNCTION is_user_recently_active(target_user_id UUID, minutes_threshold INTEGER DEFAULT 30)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS(
      SELECT 1 FROM user_activity_log
      WHERE user_id = target_user_id
      AND created_at > NOW() - (minutes_threshold || ' minutes')::INTERVAL
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;