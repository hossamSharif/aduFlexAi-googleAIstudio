-- Suda Educational Platform Database Schema
-- PostgreSQL with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_type_enum AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE course_status_enum AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_type_enum AS ENUM ('video', 'text', 'quiz', 'assignment');
CREATE TYPE assessment_type_enum AS ENUM ('quiz', 'assignment', 'project', 'final_exam');
CREATE TYPE evaluation_method_enum AS ENUM ('auto', 'manual', 'hybrid');
CREATE TYPE submission_status_enum AS ENUM ('draft', 'submitted', 'under_review', 'graded', 'revision_requested');
CREATE TYPE evaluation_status_enum AS ENUM ('pending', 'in_progress', 'completed', 'quality_check');
CREATE TYPE quality_check_status_enum AS ENUM ('passed', 'failed', 'pending');
CREATE TYPE payment_type_enum AS ENUM ('course_enrollment', 'subscription');
CREATE TYPE payment_method_enum AS ENUM ('online', 'offline');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE billing_cycle_enum AS ENUM ('monthly', 'quarterly', 'yearly');
CREATE TYPE moderation_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE language_enum AS ENUM ('ar', 'en', 'both');

-- Organizations table
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    logo_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    user_type user_type_enum NOT NULL DEFAULT 'student',
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    preferred_language VARCHAR(2) DEFAULT 'ar' CHECK (preferred_language IN ('ar', 'en')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Instructor profiles
CREATE TABLE instructor_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255),
    title_ar VARCHAR(255),
    years_of_experience INTEGER DEFAULT 0,
    education_background TEXT,
    education_background_ar TEXT,
    specializations TEXT[],
    achievements JSONB DEFAULT '[]',
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructor_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    thumbnail_url TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    difficulty_level difficulty_level_enum DEFAULT 'beginner',
    estimated_duration_hours INTEGER DEFAULT 0,
    language language_enum DEFAULT 'ar',
    status course_status_enum DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    requirements TEXT[],
    requirements_ar TEXT[],
    what_you_will_learn TEXT[],
    what_you_will_learn_ar TEXT[],
    target_audience TEXT[],
    target_audience_ar TEXT[],
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Course modules
CREATE TABLE course_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    order_index INTEGER NOT NULL,
    estimated_duration_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(course_id, order_index)
);

-- Lessons
CREATE TABLE lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    content TEXT,
    content_ar TEXT,
    order_index INTEGER NOT NULL,
    lesson_type lesson_type_enum DEFAULT 'text',
    is_preview BOOLEAN DEFAULT false,
    estimated_duration_minutes INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(module_id, order_index)
);

-- Lesson videos
CREATE TABLE lesson_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    video_duration_seconds INTEGER,
    thumbnail_url TEXT,
    video_quality VARCHAR(10) DEFAULT '720p',
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lesson attachments
CREATE TABLE lesson_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_type VARCHAR(100),
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student enrollments
CREATE TABLE student_enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(student_id, course_id)
);

-- Lesson progress tracking
CREATE TABLE lesson_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    time_spent_minutes INTEGER DEFAULT 0,
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, lesson_id)
);

-- Assessments
CREATE TABLE assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    assessment_type assessment_type_enum DEFAULT 'quiz',
    total_points INTEGER NOT NULL DEFAULT 100,
    passing_score INTEGER NOT NULL DEFAULT 60,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,
    evaluation_method evaluation_method_enum DEFAULT 'manual',
    instructions TEXT,
    instructions_ar TEXT,
    rubric JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Student submissions
CREATE TABLE student_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    attempt_number INTEGER DEFAULT 1,
    submitted_content TEXT,
    submitted_files TEXT[],
    submission_status submission_status_enum DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(assessment_id, student_id, attempt_number)
);

-- Evaluation results
CREATE TABLE evaluation_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES student_submissions(id) ON DELETE CASCADE,
    evaluator_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    score INTEGER NOT NULL,
    feedback TEXT,
    feedback_ar TEXT,
    evaluation_status evaluation_status_enum DEFAULT 'pending',
    quality_check_status quality_check_status_enum,
    quality_checker_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    evaluation_criteria JSONB DEFAULT '{}',
    private_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    description TEXT,
    description_ar TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle billing_cycle_enum DEFAULT 'monthly',
    features JSONB DEFAULT '[]',
    max_courses INTEGER,
    max_storage_gb INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    payment_type payment_type_enum NOT NULL,
    reference_id UUID NOT NULL, -- course_id or subscription_id
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method payment_method_enum DEFAULT 'online',
    payment_status payment_status_enum DEFAULT 'pending',
    payment_reference TEXT,
    payment_proof_url TEXT,
    admin_notes TEXT,
    processed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    comment_ar TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    moderation_status moderation_status_enum DEFAULT 'pending',
    moderated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

-- Review helpfulness
CREATE TABLE review_helpfulness (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);

-- Certificates
CREATE TABLE certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_code VARCHAR(100) NOT NULL UNIQUE,
    pdf_url TEXT,
    template_data JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Certificate templates
CREATE TABLE certificate_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template_data JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX idx_courses_organization ON courses(organization_id);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_student_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_student_enrollments_course ON student_enrollments(course_id);
CREATE INDEX idx_lesson_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- Full text search indexes
CREATE INDEX idx_courses_search ON courses USING GIN (to_tsvector('arabic', title || ' ' || description));
CREATE INDEX idx_courses_search_en ON courses USING GIN (to_tsvector('english', title || ' ' || description));

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be added in a separate migration file