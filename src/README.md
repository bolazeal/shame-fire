# Shame: A Platform for Public Accountability

This is a Next.js application built in Firebase Studio. It serves as a social platform where users can post public reports and endorsements about individuals and organizations to foster transparency and accountability.

## Core Features

- **User Authentication:** Sign up, log in, and manage user sessions.
- **Profile Management:** Users can customize their profiles with avatars, banners, and bios.
- **Content Creation:** Users can create three types of posts: general posts, specific reports of misconduct, and positive endorsements.
- **Interactive Feed:** A central feed to view all content, with filtering options.
- **AI-Powered Analysis:**
    - **Summarization:** AI automatically generates summaries for long reports and endorsements.
    - **Sentiment Analysis:** AI analyzes posts for sentiment and potential bias, displaying results visually.
    - **Harmful Content Detection:** AI automatically flags harmful content and sends it to a moderation queue.
- **Admin & Moderation Panel:** A dedicated dashboard for administrators to view platform analytics, manage users, and review flagged content.
- **Dispute Resolution System:** A "Village Square" where public disputes can be discussed and voted on by the community.
- **Awards System:** A "Hall of Honour" to recognize users and entities with high trust scores and positive community feedback.

## Tech Stack

- **Framework:** Next.js with App Router
- **UI:** React, Tailwind CSS, ShadCN UI
- **AI Integration:** Google AI & Genkit
- **Authentication:** Firebase Auth (with a mock implementation for local development)
