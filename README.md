# Shame: A Platform for Public Accountability

![Shame App Screenshot](https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=600&fit=crop)

**Shame** is a modern, full-stack social media application built to promote transparency and public accountability. Leveraging Next.js, Firebase, and Google's Genkit AI, it provides a feature-rich platform where users can report misconduct, endorse positive actions, and engage in community-governed dispute resolution.

This project showcases a complete, production-ready application with real-time features, AI-powered content analysis, and comprehensive administrative tools.

## Key Features

### User & Social
*   **Complete Authentication**: Secure user sign-up, login (email/password & Google OAuth), and session management with account status checks (active, suspended, banned).
*   **Dynamic Social Feed**: A central hub for posts, reports, and endorsements with live updates for votes, reposts, and comments.
*   **Real-Time Messaging**: A private, one-on-one direct messaging system with live updates and media attachments.
*   **Comprehensive Profiles**: Customizable user profiles with banners, avatars, bios, and follower/following counts.
*   **User Mentions**: Users can tag others in posts with `@username` to send notifications and foster engagement.
*   **Content Flagging by Users**: Empower the community by allowing users to flag inappropriate content for moderator review.

### AI & Content
*   **Advanced Content Creation**: A single, intuitive dialog for creating general updates, detailed reports, or positive endorsements with media upload support and optional contact info for off-platform entities.
*   **AI-Powered Analysis**:
    *   **Harmful Content Detection**: Automatically flags posts that violate platform policies and places them in a moderation queue before they are published.
    *   **Sentiment & Bias Analysis**: Analyzes reports and endorsements for sentiment and bias, displaying scores and warnings directly on posts.
    *   **AI Summaries**: Generates concise, single-sentence summaries for long-form content.
    *   **Trust Score Calculation**: Dynamically adjusts a user's "Trust Score" based on the sentiment and nature of community feedback.

### Community & Governance
*   **Community Governance**:
    *   **Village Square**: A dedicated space for escalating reports into public disputes, featuring real-time community polling and discussion.
    *   **Hall of Honour & Hall of Shame**: Recognizes highly-trusted users through a medal and nomination system, and highlights users with the lowest trust scores.
    *   **Moderator Selection**: Community members can nominate trusted users (with high Trust Scores) to be considered for moderator roles.
*   **Full-Featured Admin Panel**: A protected dashboard for administrators to monitor platform metrics, manage users (suspend/ban/reset trust score), review content, and configure platform-wide settings.

### Media & Design
*   **Shame TV**: A section for long-form video content, including interviews and investigative reports.
*   **Responsive Design**: A modern, three-column layout that adapts seamlessly to mobile devices with a dedicated bottom navigation bar.
*   **Theme Customization**: User-selectable light, dark, and system themes with a consistent color palette.

## Tech Stack

-   **Framework**: **Next.js** (App Router)
-   **Language**: **TypeScript**
-   **UI**: **React**, **Tailwind CSS**, and **ShadCN UI**
-   **AI Integration**: **Google AI** & **Genkit**
-   **Backend**: **Firebase** (Firestore, Auth)
-   **State Management**: React Context & React Hook Form with Zod validation
-   **Deployment**: Configured for **Netlify**.

## Running in Demo Mode vs. Live Mode

By default, the application runs in **Demo Mode**, using mock data for all features. This allows for a full preview of the application without connecting to a live database.

To connect the application to your own Firebase project (**Live Mode**), you need to set up your environment variables.

### Step 1: Find Your Firebase Credentials

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your Firebase project.
3.  Click the **gear icon** ⚙️ next to "Project Overview" and select **Project settings**.
4.  In the **General** tab, scroll down to the "Your apps" card and select your web app.
5.  Under **SDK setup and configuration**, select **Config**.
6.  You will see your `firebaseConfig` object. Keep this page open to copy the values.

### Step 2: Add Credentials to Netlify

1.  Log in to your [Netlify account](https://app.netlify.com/).
2.  Select your site from the **Sites** list.
3.  Go to **Site configuration** > **Build & deploy** > **Environment**.
4.  In the **Environment variables** section, click **Edit variables**.
5.  Add the following variables, copying the corresponding values from your `firebaseConfig` object:
    *   `NEXT_PUBLIC_ENABLE_FIREBASE` - **Set this to `true` to enable live mode.**
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`

### Step 3: Add Your Google AI API Key

For AI features like content summarization and moderation to work, you must also provide a Google AI API Key.

1.  If you don't have one, get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Go back to your **Netlify environment variables** section.
3.  Add the following variable:
    *   **Variable Name:** `GOOGLE_API_KEY`
    *   **Value:** *Paste your API key here*
4.  Save your changes.

After adding all these variables and setting `NEXT_PUBLIC_ENABLE_FIREBASE` to `true`, redeploy your application in Netlify. It will now connect to your live Firebase backend and enable all AI features.
