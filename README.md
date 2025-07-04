# Shame: A Next.js Platform for Public Accountability

**Shame** is a full-stack social media application designed to foster public accountability and transparency. Built with Next.js, Firebase, and Google's Genkit AI, this platform allows users to post reports of misconduct and endorsements of positive actions, creating a community-driven ecosystem of trust and public record.

The application features a robust, real-time architecture, an AI-powered moderation and analysis system, and a comprehensive admin panel for platform management.

![Shame App Screenshot](https://placehold.co/1200x600.png)

## Core Features

-   **Dynamic Social Feed**: A central, filterable feed for posts, reports, and endorsements with real-time updates for interactions like votes, reposts, and comments.
-   **Full User Authentication**: Secure sign-up and login via email/password and Google, with persistent sessions and data-driven access control.
-   **Comprehensive User Profiles**: Customizable profiles with banners, avatars, bios, and a dynamic, AI-calculated **Trust Score** that adjusts based on community feedback.
-   **Advanced Content Creation**: A unified dialog for creating posts, detailed reports, or positive endorsements, complete with media uploads and AI-powered category suggestions.
-   **AI-Powered Content Analysis**:
    -   **Harmful Content Detection**: An AI flow automatically flags potentially harmful content and sends it to a moderation queue for human review.
    -   **Sentiment Analysis & Bias Detection**: Reports and endorsements are analyzed for sentiment and bias, with results displayed on each post.
    -   **AI Summarization**: Long-form content is automatically summarized into a single, concise sentence.
-   **Community Governance**:
    -   **Village Square**: A dedicated space for escalating reports into public disputes, allowing for community discussion and polling.
    -   **Hall of Honour**: A system for recognizing trustworthy users and entities through community nominations and medals.
-   **Full-Featured Admin Panel**: A protected dashboard for administrators to monitor platform metrics, manage users (suspend/ban), review AI-flagged content, and oversee community disputes.
-   **Responsive Design**: A modern, three-column desktop layout that cleanly adapts to a mobile-first experience with a dedicated bottom navigation bar.

## Tech Stack

-   **Framework**: **Next.js** (App Router)
-   **UI**: **React** with **TypeScript**
-   **Styling**: **Tailwind CSS** with **ShadCN UI** for components and theming.
-   **AI Integration**: **Google AI** & **Genkit** for all generative AI features (summarization, analysis, content flagging).
-   **Database**: **Firebase Firestore** for real-time data storage (posts, users, disputes).
-   **Authentication**: **Firebase Auth** for email/password and Google OAuth.
-   **State Management**: **React Context** for global state (authentication, moderation).
-   **Form Handling**: **React Hook Form** with **Zod** for robust, type-safe validation.
-   **Deployment**: Production-ready configuration with a standalone server output.
