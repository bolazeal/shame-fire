# Shame: A Platform for Public Accountability

This is a Next.js application built in Firebase Studio. It serves as a social platform where users can post public reports and endorsements about individuals and organizations to foster transparency and accountability.

## Core Features

- **User Authentication:** Sign up, log in, and manage user sessions with Firebase.
- **Profile Management:** Users can customize their profiles with avatars, banners, and bios.
- **Content Creation:** Users can create three types of posts: general updates, specific reports of misconduct, and positive endorsements.
- **Interactive Feed:** A central feed to view all content, with filtering options for different post types.
- **Follow System:** Users can follow and be followed by others.
- **AI-Powered Analysis:**
    - **Summarization:** AI automatically generates summaries for long reports and endorsements.
    - **Sentiment Analysis:** AI analyzes posts for sentiment and potential bias, displaying results visually.
    - **Harmful Content Detection:** AI automatically flags harmful content and sends it to a moderation queue.
    - **Category Suggestions:** AI suggests relevant categories for new reports and endorsements.
- **Admin & Moderation Panel:** A dedicated dashboard for administrators to view platform analytics, manage users, and review AI-flagged content.
- **Dispute Resolution System:** A "Village Square" where reports can be escalated into public disputes, allowing for community discussion and voting.
- **Awards System:** A "Hall of Honour" to recognize users and entities with high trust scores and positive community feedback.

## Tech Stack

- **Framework:** Next.js with App Router
- **UI:** React, Tailwind CSS, ShadCN UI
- **AI Integration:** Google AI & Genkit
- **Database & Authentication:** Firebase (Firestore & Auth)
- **State Management:** React Context
- **Form Handling:** React Hook Form with Zod for validation
- **Styling:** Tailwind CSS with CSS Variables for theming
- **Icons:** Lucide React