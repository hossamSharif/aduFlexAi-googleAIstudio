export const testimonials = [
    {
        id: 1,
        name: 'Ahmed Hassan',
        titleKey: 'testimonials.student1.title',
        quoteKey: 'testimonials.student1.quote',
        imageUrl: 'https://picsum.photos/100/100?random=1',
    },
    {
        id: 2,
        name: 'Fatima Al-Sayed',
        titleKey: 'testimonials.student2.title',
        quoteKey: 'testimonials.student2.quote',
        imageUrl: 'https://picsum.photos/100/100?random=2',
    },
    {
        id: 3,
        name: 'John Doe',
        titleKey: 'testimonials.student3.title',
        quoteKey: 'testimonials.student3.quote',
        imageUrl: 'https://picsum.photos/100/100?random=3',
    },
];

// FIX: Export 'categories' constant.
// This constant was being imported in 'components/Categories.tsx' but was not defined.
export const categories = [
    {
        id: 'dev',
        nameKey: 'categories.development',
        icon: 'fas fa-code',
        courseCount: 123,
    },
    {
        id: 'design',
        nameKey: 'categories.design',
        icon: 'fas fa-palette',
        courseCount: 85,
    },
    {
        id: 'business',
        nameKey: 'categories.business',
        icon: 'fas fa-briefcase',
        courseCount: 98,
    },
    {
        id: 'marketing',
        nameKey: 'categories.marketing',
        icon: 'fas fa-bullhorn',
        courseCount: 72,
    },
    {
        id: 'it',
        nameKey: 'categories.it',
        icon: 'fas fa-laptop-code',
        courseCount: 154,
    },
    {
        id: 'personal_dev',
        nameKey: 'categories.personal_dev',
        icon: 'fas fa-user-graduate',
        courseCount: 61,
    },
];
