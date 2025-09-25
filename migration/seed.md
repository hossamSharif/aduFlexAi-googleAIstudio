-- EduFlex Platform Seed Data

-- Clear existing data (optional, for clean seeding)
-- DELETE FROM reviews;
-- DELETE FROM student_enrollments;
-- DELETE FROM courses;
-- DELETE FROM instructor_profiles;
-- DELETE FROM user_profiles;
-- DELETE FROM organizations;
-- DELETE FROM categories;
-- DELETE FROM auth.users WHERE email LIKE '%@eduflex.com';


-- 1. Create a dummy organization
INSERT INTO organizations (id, name, name_ar, contact_email, is_verified)
VALUES ('10000000-0000-0000-0000-000000000001', 'EduFlex Academy', 'أكاديمية إيديوفليكس', 'contact@eduflex.com', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create dummy users (student, instructor, admin) in auth.users
-- This part is illustrative. In a real scenario, you'd use Supabase's auth functions.
-- Let's assume these users are created and we get their UUIDs.
-- Replace with actual UUIDs after creating users in Supabase dashboard or via API.
-- User 1: Student (Saleh)
-- User 2: Instructor (Fatima)
-- User 3: Admin (Admin User)
-- User 4: Instructor (John)

-- For reproducible seeding, we'll hardcode UUIDs.
-- Make sure these users exist in auth.users with matching IDs.
-- If they don't, you can create them in the Supabase Dashboard > Authentication.
-- For this example, we'll use placeholder UUIDs.

-- 3. Create user profiles
INSERT INTO user_profiles (id, email, username, first_name, last_name, first_name_ar, last_name_ar, user_type, organization_id)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'saleh@eduflex.com', 'saleh_student', 'Saleh', 'Ahmed', 'صالح', 'أحمد', 'student', '10000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000002', 'fatima@eduflex.com', 'fatima_instructor', 'Fatima', 'El-Sayed', 'فاطمة', 'السيد', 'instructor', '10000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000003', 'admin@eduflex.com', 'eduflex_admin', 'Admin', 'User', 'مسؤول', 'النظام', 'admin', '10000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000004', 'john@eduflex.com', 'john_doe_instructor', 'John', 'Doe', 'جون', 'دو', 'instructor', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;


-- 4. Create instructor profiles
INSERT INTO instructor_profiles (user_id, organization_id, title, title_ar, years_of_experience, is_verified)
VALUES
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Lead Software Engineer', 'مهندسة برمجيات رئيسية', 10, true),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'Senior UX Designer', 'مصمم تجربة مستخدم أول', 8, true)
ON CONFLICT (user_id) DO NOTHING;

-- 5. Create categories
INSERT INTO categories (id, name, name_ar, icon) VALUES
('30000000-0000-0000-0000-000000000001', 'Development', 'التطوير', 'fas fa-code'),
('30000000-0000-0000-0000-000000000002', 'Design', 'التصميم', 'fas fa-palette'),
('30000000-0000-0000-0000-000000000003', 'Business', 'الأعمال', 'fas fa-briefcase'),
('30000000-0000-0000-0000-000000000004', 'Marketing', 'التسويق', 'fas fa-bullhorn'),
('30000000-0000-0000-0000-000000000005', 'IT & Software', 'تكنولوجيا المعلومات', 'fas fa-server'),
('30000000-0000-0000-0000-000000000006', 'Personal Development', 'التطوير الشخصي', 'fas fa-brain')
ON CONFLICT(id) DO NOTHING;


-- 6. Create courses
-- Note: Replace instructor_id with the actual UUID of the instructor profile.
-- We are using the hardcoded UUIDs from step 4.
-- The instructor_id should reference the `instructor_profiles.id` which is a UUID, but it's linked to a user.
-- Let's get the instructor profile IDs
-- Fatima: SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000002'
-- John: SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000004'

INSERT INTO courses (
    organization_id, instructor_id, category_id,
    title, title_ar,
    description, description_ar,
    thumbnail_url, price, currency, difficulty_level, estimated_duration_hours, language, status, is_featured,
    enrollment_count, rating_average, rating_count
) VALUES
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000002'), '30000000-0000-0000-0000-000000000001',
    'Advanced TypeScript for Modern Web Apps', 'TypeScript المتقدم لتطبيقات الويب الحديثة',
    'Deep dive into advanced TypeScript features, design patterns, and best practices for building scalable applications.', 'تعمق في ميزات TypeScript المتقدمة وأنماط التصميم وأفضل الممارسات لبناء تطبيقات قابلة للتطوير.',
    'https://picsum.photos/800/450?random=1', 99.99, 'USD', 'advanced', 30, 'en', 'published', true,
    1250, 4.9, 320
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000004'), '30000000-0000-0000-0000-000000000002',
    'User Experience (UX) Design Fundamentals', 'أساسيات تصميم تجربة المستخدم (UX)',
    'Learn the fundamentals of UX design, including user research, wireframing, prototyping, and usability testing.', 'تعلم أساسيات تصميم تجربة المستخدم، بما في ذلك بحث المستخدم، والنماذج الشبكية، والنماذج الأولية، واختبار قابلية الاستخدام.',
    'https://picsum.photos/800/450?random=2', 49.99, 'USD', 'beginner', 15, 'both', 'published', true,
    3400, 4.7, 850
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000002'), '30000000-0000-0000-0000-000000000003',
    'Financial Modeling for Startups', 'النمذجة المالية للشركات الناشئة',
    'Master financial modeling techniques to forecast performance and make strategic decisions for your startup.', 'أتقن تقنيات النمذجة المالية للتنبؤ بالأداء واتخاذ القرارات الاستراتيجية لشركتك الناشئة.',
    'https://picsum.photos/800/450?random=3', 79.99, 'USD', 'intermediate', 25, 'ar', 'published', true,
    980, 4.8, 150
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000004'), '30000000-0000-0000-0000-000000000004',
    'Digital Marketing Masterclass 2025', 'ماستركلاس التسويق الرقمي 2025',
    'A complete guide to digital marketing, covering SEO, social media marketing, content marketing, and analytics.', 'دليل كامل للتسويق الرقمي، يغطي تحسين محركات البحث، والتسويق عبر وسائل التواصل الاجتماعي، وتسويق المحتوى، والتحليلات.',
    'https://picsum.photos/800/450?random=4', 129.99, 'USD', 'beginner', 40, 'en', 'published', true,
    5200, 4.6, 1200
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000002'), '30000000-0000-0000-0000-000000000001',
    'Building Microservices with Node.js and Docker', 'بناء الخدمات المصغرة باستخدام Node.js و Docker',
    'Learn to design, build, and deploy scalable microservices using Node.js, Express, and Docker containers.', 'تعلم تصميم وبناء ونشر خدمات مصغرة قابلة للتطوير باستخدام Node.js و Express و Docker.',
    'https://picsum.photos/800/450?random=5', 149.99, 'USD', 'advanced', 35, 'en', 'published', false,
    850, 4.9, 210
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000004'), '30000000-0000-0000-0000-000000000002',
    'Advanced Figma: Prototyping and Team Collaboration', 'Figma المتقدم: النماذج الأولية والتعاون الجماعي',
    'Take your Figma skills to the next level. Master interactive components, advanced prototyping, and design system management.', 'ارتق بمهاراتك في Figma إلى المستوى التالي. أتقن المكونات التفاعلية والنماذج الأولية المتقدمة وإدارة أنظمة التصميم.',
    'https://picsum.photos/800/450?random=6', 69.99, 'USD', 'intermediate', 20, 'both', 'published', true,
    1800, 4.8, 450
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000002'), '30000000-0000-0000-0000-000000000005',
    'Introduction to Cloud Computing with AWS', 'مقدمة في الحوسبة السحابية مع AWS',
    'A beginner-friendly introduction to the core concepts of cloud computing and the AWS ecosystem.', 'مقدمة سهلة للمبتدئين للمفاهيم الأساسية للحوسبة السحابية ونظام AWS البيئي.',
    'https://picsum.photos/800/450?random=7', 29.99, 'USD', 'beginner', 10, 'ar', 'published', false,
    4500, 4.5, 980
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000004'), '30000000-0000-0000-0000-000000000006',
    'The Science of Well-Being and Productivity', 'علم الرفاهية والإنتاجية',
    'Learn evidence-based strategies to improve your happiness, reduce stress, and boost your productivity.', 'تعلم استراتيجيات قائمة على الأدلة لتحسين سعادتك وتقليل التوتر وزيادة إنتاجيتك.',
    'https://picsum.photos/800/450?random=8', 39.99, 'USD', 'beginner', 12, 'en', 'published', false,
    7800, 4.9, 2100
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000002'), '30000000-0000-0000-0000-000000000001',
    'Python for Data Science and Machine Learning Bootcamp', 'معسكر بايثون لعلوم البيانات وتعلم الآلة',
    'Learn Python for Data Science and Machine Learning from scratch. Covers NumPy, Pandas, Matplotlib, Scikit-Learn, and more!', 'تعلم بايثون لعلوم البيانات وتعلم الآلة من الصفر. يغطي NumPy و Pandas و Matplotlib و Scikit-Learn والمزيد!',
    'https://picsum.photos/800/450?random=9', 199.99, 'USD', 'intermediate', 50, 'en', 'published', true,
    15000, 4.7, 3500
),
(
    '10000000-0000-0000-0000-000000000001', (SELECT id FROM instructor_profiles WHERE user_id = '20000000-0000-0000-0000-000000000004'), '30000000-0000-0000-0000-000000000002',
    'Arabic Calligraphy: From Beginner to Artist', 'فن الخط العربي: من المبتدئ إلى الفنان',
    'Explore the beauty of Arabic calligraphy. Learn the Thuluth script, from basic letterforms to complex compositions.', 'اكتشف جمال الخط العربي. تعلم خط الثلث، من أشكال الحروف الأساسية إلى التراكيب المعقدة.',
    'https://picsum.photos/800/450?random=10', 59.99, 'USD', 'beginner', 20, 'ar', 'published', false,
    2100, 4.9, 600
)
ON CONFLICT (title) DO NOTHING;


-- 7. Create student enrollments
INSERT INTO student_enrollments (student_id, course_id, is_active, progress_percentage)
VALUES
    ('20000000-0000-0000-0000-000000000001', (SELECT id FROM courses WHERE title = 'Advanced TypeScript for Modern Web Apps'), true, 25.5),
    ('20000000-0000-0000-0000-000000000001', (SELECT id FROM courses WHERE title = 'User Experience (UX) Design Fundamentals'), true, 75.0)
ON CONFLICT (student_id, course_id) DO NOTHING;


-- 8. Create reviews
INSERT INTO reviews (course_id, student_id, rating, comment, comment_ar, moderation_status)
VALUES
    (
        (SELECT id FROM courses WHERE title = 'Advanced TypeScript for Modern Web Apps'),
        '20000000-0000-0000-0000-000000000001',
        5,
        'Excellent course! Very detailed and practical. The instructor is a true expert.',
        'دورة ممتازة! مفصلة وعملية للغاية. المدربة خبيرة حقيقية.',
        'approved'
    )
ON CONFLICT (course_id, student_id) DO NOTHING;