Hello, please begin development on the following story:
Story to Implement:
Story 4.1: Course Creation Wizard
Core Instructions:
Review the Requirements (Primary Source of Truth):
Thoroughly analyze Story 4.1 within the prd.md file. Your implementation must satisfy every Acceptance Criterion (AC) listed for this story.
Pay close attention to the UI/UX design goals and core screen descriptions in the PRD that are relevant to this story to ensure the visual implementation aligns with the project's vision.
Integrate with Supabase Backend (Database Blueprint):
This story requires frontend integration with our Supabase database.
Before writing any code, you must consult the files in the /migration directory (schema.md, rls_policies.md, seed.md, etc.). These files are your definitive guide to the backend data structure.
All data services, hooks, and components you create must be designed to fetch from and mutate data according to the tables, columns, relationships, and policies defined in these migration files.
Implement the Frontend Logic:
Develop all required features using our established tech stack: React, TypeScript, and Tailwind CSS.
Adhere to the highest standards of code quality, ensuring the implementation is clean, performant, responsive, and fully accessible (WCAG 2.1 AA).
If new client-side state management is needed, ensure it is robust and scalable.
- **Routing and Navigation:** Consider the application's routing structure. If the story requires a new page, create a new route and ensure navigation links (e.g., in the Header or Footer) are updated. If adding a feature to an existing page, ensure it is placed within the correct page component (e.g., `LandingPage.tsx` or `CourseCatalog.tsx`).
Update the Progress Report (Final Step):
Upon completion of the code, you must update the PROGRESS.md file to reflect the work done.
In PROGRESS.md, you will:
Change the status of Story 4.1 to completed: [x].
Mark each of its Acceptance Criteria as completed: [x].
Update the "Current Status" header, moving the completed story's name to the "Last Completed Story" field.
List all modified files under the story's "Files Modified" section, providing a brief note on the changes.
Provide a Manual Database Migration Guide:
After generating the code and updating `PROGRESS.md`, you must also include a clear, step-by-step guide in your natural language response to me if any database changes were made.

**If any files within the `/migration` directory were created or modified:**

1.  Start with a clear heading like `Manual Database Migration Required`.
2.  Explicitly list each new or modified file from the `/migration` directory that I need to run.
3.  For each file, provide a clear instruction, for example: "Navigate to your Supabase SQL Editor, copy the entire content of `migration/[filename].md`, and execute the query."
4.  Present the files in the logical order they should be run (e.g., schema changes before seeding data).

**If no files in the `/migration` directory were changed:**

*   State clearly that `No manual database changes are required for this update.`

This guide is critical for me to keep my database schema in sync with your changes. Do not skip this step.