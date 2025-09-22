# System Architecture Document

## 1. High-Level Overview

This document outlines the proposed system architecture for the Social Media + Dating Super App. The goal is to create a scalable, secure, and performant platform that can support a wide range of advanced features.

The architecture is designed as a hybrid model, leveraging the strengths of serverless technologies for rapid development and scalability, while also planning for dedicated services for specialized, high-throughput tasks.

### Core Components:

*   **Frontend:** A modern, responsive web application built with **React**. This provides a rich user interface and a robust ecosystem of libraries for building complex features.

*   **Backend (Hybrid Model):**
    *   **Supabase (Primary Backend):** Supabase will serve as the core of our backend infrastructure. We will use it for:
        *   **Database:** A powerful PostgreSQL database for storing all application data (profiles, posts, messages, etc.).
        *   **Authentication:** Manages user identities and integrates with Firebase Authentication.
        *   **Storage:** For storing user-generated content like images, videos, and audio files.
        *   **Edge Functions:** Serverless functions (written in Deno/TypeScript) for secure backend logic, such as integrating with payment gateways or other third-party services.
    *   **Dedicated Signaling/Real-time Server (for advanced communication):** While Supabase Realtime is excellent for 1-to-1 chat and basic notifications, features like group voice/video calls, voice rooms (like Twitter Spaces), and screen sharing require more complex state management. A dedicated **Node.js server** using WebSockets or a specialized WebRTC signaling library will be necessary to handle this at scale. This will be a separate component to be built.

*   **Third-Party Services (APIs):**
    *   **Firebase:** Used exclusively for its robust **Cloud Messaging (FCM)** service to deliver push/popup notifications to clients across different platforms.
    *   **Paystack & Flutterwave:** Integrated via secure Edge Functions to handle all payment-related operations, including wallet funding, subscriptions, and withdrawals.
    *   **Google Translate Widget:** Used on the client-side for in-app text translation, as per the requirement.

### Architectural Principles:

*   **Scalability:** The serverless nature of Supabase allows for automatic scaling of the database and core backend logic. The dedicated real-time server can be scaled independently as communication features grow in popularity.
*   **Security:** Sensitive operations (like payments or AI moderation) are handled in secure backend functions, never on the client. Row Level Security (RLS) in Supabase will be used extensively to protect data at the database level.
*   **Modularity:** Features are designed to be as decoupled as possible. For example, the chat system is distinct from the timeline system, allowing them to be developed and scaled independently.

---

## 2. Analysis of "Local First" Constraint

A core requirement is to build as much as possible "locally without third-party APIs". It's crucial to define what is feasible.

*   **Feasible "Local" Features:**
    *   **Core Application Logic:** All standard CRUD operations, user management, and business logic can be built within our own ecosystem (React frontend + Supabase backend).
    *   **Basic AI/ML:** It is possible to run smaller, pre-trained machine learning models on the client-side using libraries like **TensorFlow.js**. This could work for simple tasks like smart reply suggestions (if the model is small enough) or basic image filtering.

*   **Features Requiring External APIs (Analysis):**
    *   **Advanced AI/AR:** Features like high-accuracy AI content moderation (detecting harmful content in real-time), complex AI matchmaking (requiring heavy computation), speech-to-text, and AR video filters are beyond the scope of "local" implementation for a project of this scale. These services rely on massive, pre-trained models running on powerful, dedicated hardware. Building this from scratch would be a multi-year, multi-million dollar R&D effort.
    *   **Architectural Decision:** This plan assumes that for these specific advanced features, we will integrate best-in-class third-party APIs via secure Supabase Edge Functions. This is the industry-standard and only practical approach to deliver these features effectively.

---

## 3. Data Models

This section outlines the proposed database schema. It extends the existing schema with new tables to support the requested features.

### Existing Tables (Summary)
*   `profiles`: Core user profile data.
*   `likes`: Records "likes" between users.
*   `matches`: Records mutual likes.
*   `posts`: Stores user timeline posts.
*   `messages`: Stores chat messages.
*   `wallets`: Stores user balances.
*   `transactions`: Logs all wallet activity.
*   `gift_types`: Defines available virtual gifts.
*   `user_gifts`: Records sent and received gifts.
*   `followers`: Stores follow relationships.
*   `blocked_users`: Stores block relationships.
*   `reports`: Stores user-submitted reports.
*   `fcm_tokens`: Stores Firebase Cloud Messaging tokens for push notifications.

### New & Extended Data Models

#### User Accounts & Profiles
*   **`profiles` (Extensions):**
    *   `username_slug`: `TEXT, UNIQUE` - A unique, URL-friendly username.
    *   `phone_number`: `TEXT, UNIQUE` - For phone number login.
    *   `profile_rank`: `INT` - A score for ranking, calculated based on activity/tier.
    *   `last_seen`: `TIMESTAMPTZ` - Timestamp of the user's last activity.
*   **`user_privacy_settings`:**
    *   `user_id`: `UUID, PRIMARY KEY, FOREIGN KEY to profiles.id`
    *   `show_last_seen`: `BOOLEAN`
    *   `who_can_message_me`: `TEXT` ('everyone', 'matches', 'following')
*   **`user_devices`:**
    *   `id`: `BIGINT, PRIMARY KEY`
    *   `user_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `device_info`: `TEXT` (e.g., 'Chrome on Windows')
    *   `last_login`: `TIMESTAMPTZ`
*   **`newsletter_subscribers`:**
    *   `id`: `BIGINT, PRIMARY KEY`
    *   `email`: `TEXT, UNIQUE`
    *   `is_subscribed`: `BOOLEAN`

#### Social & Communication
*   **`reels` (for Short Videos):**
    *   `id`: `BIGINT, PRIMARY KEY`
    *   `user_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `video_url`: `TEXT`
    *   `caption`: `TEXT`
    *   `allow_duet`: `BOOLEAN`
    *   `view_count`: `INT`
*   **`reels_likes`, `reels_comments`, `post_likes`, `post_comments`:** (Separate tables for likes/comments on different content types to keep queries clean).
*   **`groups` (or Clubs):**
    *   `id`: `BIGINT, PRIMARY KEY`
    *   `creator_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `name`: `TEXT`
    *   `description`: `TEXT`
    *   `is_public`: `BOOLEAN`
*   **`group_members`:**
    *   `group_id`: `BIGINT, FOREIGN KEY to groups.id`
    *   `user_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `role`: `TEXT` ('admin', 'moderator', 'member')
    *   `PRIMARY KEY (group_id, user_id)`

#### Content Monetization
*   **`paid_posts`:**
    *   `post_id`: `BIGINT, PRIMARY KEY, FOREIGN KEY to posts.id`
    *   `unlock_price`: `NUMERIC(10, 2)`
*   **`unlocked_posts` (records who has paid for what):**
    *   `user_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `post_id`: `BIGINT, FOREIGN KEY to posts.id`
    *   `PRIMARY KEY (user_id, post_id)`
*   **`creator_subscriptions`:**
    *   `subscriber_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `creator_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `tier`: `TEXT`
    *   `expires_at`: `TIMESTAMPTZ`
    *   `PRIMARY KEY (subscriber_id, creator_id)`

#### Growth & Engagement
*   **`app_events`:**
    *   `id`: `BIGINT, PRIMARY KEY`
    *   `creator_id`: `UUID, FOREIGN KEY to profiles.id`
    *   `title`: `TEXT`
    *   `start_time`: `TIMESTAMPTZ`
    *   `is_paid`: `BOOLEAN`
    *   `ticket_price`: `NUMERIC(10, 2)`
*   **`event_tickets`:**
    *   `id`: `BIGINT, PRIMARY KEY`
    *   `event_id`: `BIGINT, FOREIGN KEY to app_events.id`
    *   `user_id`: `UUID, FOREIGN KEY to profiles.id`

---

## 4. Key User Flows

This section describes the sequence of events for several key features.

### Flow 1: AI Matchmaking

This flow describes how the system can generate intelligent match suggestions.

1.  **Data Collection:** The system continuously collects data on user behavior: profiles liked, profiles skipped, time spent on profiles, interests listed, message content sentiment (requires AI).
2.  **Compatibility Scoring (Backend Process):**
    *   A periodic backend process (e.g., a scheduled Supabase Edge Function) runs for active users.
    *   For each user, it finds potential matches based on basic criteria (location, age, etc.).
    *   It then calculates a **compatibility score** for each potential pair using a weighted algorithm based on shared interests, profile similarity, and past interaction patterns.
    *   **[API]** For advanced mood-based suggestions, this step would involve calling a Natural Language Processing (NLP) API to analyze the user's recent posts or chats to infer their current mood.
3.  **Suggestion Generation:** The backend function stores the top-ranked suggestions for each user in a separate table (e.g., `match_suggestions`).
4.  **Frontend Display:** When a user opens the app, the frontend fetches these pre-calculated suggestions, providing a fast and "intelligent" discovery experience instead of a random list.

### Flow 2: Reels Video Upload and Processing

This flow outlines the creation of a short video (Reel).

1.  **Client-Side Capture:**
    *   User opens the Reels creation screen in the React app.
    *   The app accesses the camera and microphone.
    *   **[Local AI/AR]** The user can select AR filters. These are applied in real-time on the client-side using a library like **TensorFlow.js** with pre-trained models or a more specialized library.
    *   User records a video.
2.  **Client-Side Editing:**
    *   User can trim the video, add text overlays, and select background music.
    *   **[Local AI]** For transcription, the client can use a JavaScript-based speech-to-text library to generate captions locally.
3.  **Upload to Storage:**
    *   The final, edited video file is uploaded directly from the client to a dedicated **Supabase Storage** bucket (`reels-videos`). The upload should be done in chunks to be resilient to network issues.
4.  **Backend Processing:**
    *   Once the upload is complete, the client calls a Supabase Edge Function (`create-reel`) with the video URL and other metadata (caption, etc.).
    *   The function inserts a new record into the `reels` table in the database.
    *   **[API]** For content moderation, the Edge Function could asynchronously call a moderation API (like AWS Rekognition) to flag potentially harmful content.

### Flow 3: Wallet Top-Up and Gifting

This flow details how a user adds funds and sends a gift.

1.  **Initiate Top-Up:**
    *   User navigates to the `WalletPage` and enters an amount to add.
    *   The client calls the `initialize-payment` Edge Function.
2.  **Payment Gateway:**
    *   The Edge Function securely tells Paystack/Flutterwave to create a payment session.
    *   The client redirects the user to the payment provider's checkout page.
3.  **Payment Confirmation (Webhook):**
    *   After successful payment, Paystack sends a webhook to our `verify-payment-webhook` Edge Function.
    *   The function verifies the webhook's authenticity.
    *   It then calls the `deposit_into_wallet` database function, which atomically updates the user's `balance` and creates a `transaction` record.
4.  **Send Gift:**
    *   User A is on User B's profile and clicks "Send Gift".
    *   A modal opens, showing available `gift_types` fetched from the database.
    *   User A selects a gift and clicks "Confirm".
5.  **Gifting Transaction:**
    *   The client calls the `send_gift` database function (RPC).
    *   This single function:
        *   Checks if User A's wallet balance is sufficient.
        *   Deducts the cost from User A's wallet.
        *   Creates a `transaction` record for the deduction.
        *   Inserts a new record into the `user_gifts` table to log that User A sent a gift to User B.
    *   The client UI updates to show the successful gift and the new wallet balance.
