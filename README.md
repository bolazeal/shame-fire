# Shame: A Platform for Public Accountability

![Shame App Screenshot](https://placehold.co/1200x600.png "Shame App UI")

**Shame** is a modern, full-stack social media application built to promote transparency and public accountability. Leveraging Next.js, Firebase, and Google's Genkit AI, it provides a feature-rich platform where users can report misconduct, endorse positive actions, and engage in community-governed dispute resolution.

This project showcases a complete, production-ready application with real-time features, AI-powered content analysis, and comprehensive administrative tools.

## Key Features

### User & Social
*   **Complete Authentication**: Secure user sign-up, login (email/password & Google OAuth), and session management.
*   **Dynamic Social Feed**: A central hub for posts, reports, and endorsements with live updates for votes, reposts, and comments.
*   **Real-Time Messaging**: A private, one-on-one direct messaging system with live updates.
*   **Comprehensive Profiles**: Customizable user profiles with banners, avatars, bios, and follower/following counts.
*   **User Mentions**: Users can tag others in posts with `@username` to send notifications and foster engagement.

### AI & Content
*   **Advanced Content Creation**: A single, intuitive dialog for creating general updates, detailed reports, or positive endorsements with media upload support.
*   **AI-Powered Analysis**:
    *   **Harmful Content Detection**: Automatically flags posts that violate platform policies and places them in a moderation queue.
    -   **Sentiment & Bias Analysis**: Analyzes reports and endorsements for sentiment and bias, displaying scores and warnings directly on posts.
    -   **AI Summaries**: Generates concise, single-sentence summaries for long-form content.
    -   **Trust Score Calculation**: Dynamically adjusts a user's "Trust Score" based on the sentiment and nature of community feedback.

### Community & Governance
*   **Community Governance**:
    *   **Village Square**: A dedicated space for escalating reports into public disputes, featuring real-time community polling and discussion.
    *   **Hall of Honour**: Recognizes highly-trusted users through a medal and nomination system.
*   **Full-Featured Admin Panel**: A protected dashboard for administrators to monitor platform metrics, manage users (suspend/ban), and review AI-flagged content.

### Media & Design
*   **Shame or Shine TV**: A section for long-form video content, including interviews and investigative reports.
*   **Responsive Design**: A modern, three-column layout that adapts seamlessly to mobile devices with a dedicated bottom navigation bar.
*   **Theme Customization**: User-selectable light, dark, and system themes.

## Tech Stack

-   **Framework**: **Next.js** (App Router)
-   **Language**: **TypeScript**
-   **UI**: **React**, **Tailwind CSS**, and **ShadCN UI**
-   **AI Integration**: **Google AI** & **Genkit**
-   **Backend**: **Firebase** (Firestore, Auth)
-   **State Management**: React Context
-   **Forms**: React Hook Form with Zod validation
-   **Deployment**: Configured for standalone production builds.
