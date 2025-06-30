# Prompts for Building the Clarity App

This document outlines the series of conversational prompts that could be used to generate the Clarity application, from initial setup to the final, feature-rich state.

---

### Prompt 1: Initial Setup & Theming

"Hello! I'd like to build a new social media application called 'Clarity'. It should be a platform for public accountability where users can post reports and endorsements.

Let's start by setting up a Next.js project with the App Router, TypeScript, Tailwind CSS, and ShadCN UI.

For the visual style, please configure the app with the following theme in `src/app/globals.css`:
-   **Primary color:** Soft blue (`#7EC4CF`)
-   **Background color:** Light gray (`#F5F5F5`)
-   **Accent color:** Light orange (`#FDBA74`)
-   **Font:** Use 'Inter' for both body and headlines.

Also, please enable dark mode by default in the root layout."

---

### Prompt 2: Basic Layout (Desktop)

"Great, now let's create the main layout. I want a three-column layout similar to Twitter for desktop view.
1.  **Left Sidebar:** Should be `256px` wide and sticky. It will eventually hold the navigation.
2.  **Main Content:** This will be the flexible center column with a border on its left and right.
3.  **Right Sidebar:** Should be `320px` wide and sticky. It will be for trends and suggestions.

For now, just create the basic structure in `src/app/(main)/layout.tsx` and use placeholder components."

---

### Prompt 3: Authentication Flow

"Let's set up user authentication. I'll need:
1.  A mock Firebase Auth setup using `Context` for local development. Create an `AuthContext` that provides a default logged-in user (`Alex Doe`).
2.  Create Login (`/login`) and Signup (`/signup`) pages. Use ShadCN's `Card`, `Form`, and `Input` components. Use `zod` and `react-hook-form` for validation.
3.  Create an `AuthLayout` that wraps these pages.
4.  Protect the main app layout (`/(main)`) so that it redirects to `/login` if the user is not authenticated."

---

### Prompt 4: Mobile Responsive Layout & Navigation

"The desktop layout is a good start. Now, let's make it mobile-friendly.
1.  On small screens, the sidebars should be hidden.
2.  Add a `MobileBottomNav` component that is fixed to the bottom of the screen on mobile. It should contain icon-only links for: Home, Search, Post (a main action button), Notifications, and Profile.
3.  Create a placeholder page for `/search` that the mobile nav can link to."

---

### Prompt 5: Build out the Sidebars

"Let's populate the sidebars.
1.  **Left Sidebar (`LeftSidebar.tsx`):**
    *   Add the app logo and name ('Clarity').
    *   Add navigation links with icons (`lucide-react`) for: Home, Notifications, Messages, Bookmarks, Village Square, Hall of Honour, and Profile.
    *   Add a prominent 'Post' button.
    *   At the bottom, add a user profile section with the current user's avatar and name, which acts as a dropdown menu with a 'Log out' option.
2.  **Right Sidebar (`RightSidebar.tsx`):**
    *   Add a 'What’s happening' card with mock trending topics.
    *   Add a 'Who to follow' card with a list of mock users and a 'Follow' button for each. Make the follow button toggle its state between 'Follow' and 'Following'."

---

### Prompt 6: Create the Feed and Post Card

"Now for the core of the app: the feed.
1.  On the Home page (`/home/page.tsx`), create a tabbed interface with filters for 'For You', 'Posts', 'Reports', and 'Endorsements'.
2.  Create a `PostCard.tsx` component to display individual posts. It should show:
    *   The author's avatar, name, and username.
    *   The post content (text and optional media).
    *   For reports/endorsements, show the entity being discussed and its category.
    *   Action buttons: Comments, Reposts, Upvotes, Downvotes, Bookmarks, and Share.
3.  Make the Bookmark and Share buttons interactive. Bookmarking should toggle the icon and count, and Share should copy a link to the clipboard and show a toast notification.
4.  Create a post detail page at `/post/[id]` that displays a single `PostCard` and a placeholder for comments."

---

### Prompt 7: User Profile Page

"Let's build the user profile page at `/profile/[id]`.
1.  It should have a banner image and a large user avatar.
2.  Display user information: Name, username, bio, verification status.
3.  Include action buttons: 'Edit profile' (for the current user) or 'Follow' (for other users), plus 'Endorse' and 'Report' buttons.
4.  Show a prominent 'Trust Score' with a progress bar.
5.  Add a tabbed section to display the user's 'Posts', 'Reports', 'Endorsements', and 'Media'."

---

### Prompt 8: Post Creation Flow & AI Integration (Part 1)

"Time to let users create content.
1.  Create a `CreatePostDialog` component that can be triggered from the 'Post' button in the sidebar.
2.  Inside, create a `CreatePostForm` with tabs for 'Share Update', 'Report Misconduct', and 'Give Endorsement'.
3.  The form should adapt based on the selected tab (e.g., showing 'Entity' and 'Category' fields for reports/endorsements).
4.  Add functionality to upload and preview an image or video.
5.  For reports, include 'Posting As' radio buttons: Verified, Anonymous, Whistleblower.
6.  Now, let's add our first AI feature: integrate the `suggestCategories` flow. Add a button 'Suggest Categories with AI' that, when clicked, analyzes the post text and displays suggested category badges that the user can click to select."

---

### Prompt 9: Advanced AI Integration (Part 2)

"Let's deepen the AI integration.
1.  When a user submits a report or endorsement, call the `generateEndorsementSummary` flow and store the summary. Display this AI-generated summary on the `PostCard`.
2.  Also call the `analyzeSentiment` flow. On the `PostCard`, display the sentiment score and a badge indicating if bias was detected. The badge should have a tooltip explaining the bias.
3.  Finally, integrate the `detectHarmfulContent` flow. If the AI flags a post as harmful, don't publish it. Instead, show a toast to the user that their post is under review, and add it to a moderation queue."

---

### Prompt 10: Community & Moderation Features

"Let's build out the community governance features.
1.  Create the `/village-square` page to list active disputes using a `DisputeCard` component.
2.  Create the `/dispute/[id]` page for viewing a single dispute, including involved parties, a community poll, and a discussion section.
3.  Create the `/hall-of-honour` page to display available medals and recent winners.
4.  Create a protected `/admin` page. It should have a dashboard with key metrics (cards and charts) and a 'Content Moderation' tab.
5.  The 'Content Moderation' tab should display the queue of content flagged by the AI. Add buttons for moderators to 'Dismiss' or 'Remove' flagged items. Use a `ModerationContext` to manage this state globally."

---

### Prompt 11: Final Polish & Deployment Prep

"The app is almost ready! Let's do a final polish.
1.  Fix any outstanding hydration errors.
2.  Ensure all interactive elements like links and buttons are using the correct `asChild` composition to avoid console warnings.
3.  Lastly, update the project's `README.md` to professionally describe the application we've built. Also, configure the `next.config.ts` for a production build by enabling strict TypeScript/ESLint checks and setting the output to 'standalone'."
