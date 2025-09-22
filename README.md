# EuroMeet Online: A Social & Dating Super App

## 🌟 Overview

Welcome to EuroMeet Online! This is a feature-rich "Super App" that combines the best of social media and dating applications, designed to connect people in a seamless and engaging way. Whether you're looking for a meaningful connection, new friends, or a place to share your life's moments, this app has you covered.

This project was originally created by **Jamachi Mauricennadi**. This version includes significant refactoring, bug fixes, and documentation improvements.

---

## ✨ Key Features

This application is packed with a huge number of advanced features:

### 👤 Core & Account
- **Secure Authentication:** Login with Email/Password, Google, or a passwordless Email Link.
- **Detailed Profiles:** Create and update profiles with photos, bios, interests, and more.
- **Advanced Security:** Includes a robust user blocking and reporting system.
- **Privacy Controls:** Users can control their "last seen" status and who is allowed to message them.
- **KYC Verification:** A system for verifying user identity to build a trusted community (requires configuration).

### 💬 Social & Communication
- **Follow/Unfollow System:** Build your social circle by following interesting people.
- **Real-time Chat:** A full-featured, 1-to-1 and group chat system.
- **Rich Media Messaging:** Send text, images, videos, and audio messages.
- **Video Calling:** A peer-to-peer WebRTC video calling system.
- **User Timelines:** A "Facebook-style" timeline on each user's profile to create and share posts.

### 💸 Monetization & Economy
- **Built-in Wallet:** Every user has a personal wallet to store funds.
- **Payment Integration:** Securely add funds to the wallet using Paystack.
- **Subscription Tiers:** Support for different user subscription levels (e.g., Free, VIP).
- **Virtual Gifting:** Send virtual gifts to other users, paid for from your wallet balance.
- **Post Boosting:** Boost your posts to get more visibility.

### 🛍️ Marketplace
- **Buy & Sell:** A built-in marketplace where users can list items for sale.
- **Direct Communication:** Buyers can initiate private conversations with sellers about listings.

---

## 🛠️ Tech Stack

*   **Frontend:** [React](https://reactjs.org/)
*   **Backend:** [Supabase](https://supabase.io/) (PostgreSQL, Edge Functions, Storage, Realtime)
*   **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
*   **Push Notifications:** [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging)
*   **Payments:** [Paystack](https://paystack.com/)
*   **KYC:** [Paystack](https://paystack.com/) (for BVN) & other providers.

---

## 🚀 Getting Started

This project is divided into three main parts:
- `client/`: The main React-based user-facing application.
- `admin/`: A separate React-based dashboard for administrators.
- `supabase/`: The backend, including database schema and serverless Edge Functions.

### Prerequisites
- Node.js (v16+)
- npm
- Supabase CLI

### Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Set Up Third-Party Services:**
    You will need to create accounts and projects for:
    - **Supabase:** For the database, backend functions, and storage.
    - **Firebase:** For authentication and push notifications.
    - **Paystack:** For payment processing.

3.  **Configure the Database:**
    - In your Supabase project, navigate to the **SQL Editor**.
    - Copy the entire contents of the `DATABASE_SCHEMA.md` file.
    - Paste the SQL into a new query and click **Run**.

4.  **Configure Environment Variables:**
    - Both the `client` and `admin` applications rely on a `.env` file at their respective roots for configuration. You will need to create `.env` files in both `client/` and `admin/` and add the necessary Firebase and Supabase API keys. Refer to `client/src/firebaseConfig.js` and `client/src/supabaseClient.js` to see which environment variables are required.
    - In your Supabase project dashboard, navigate to **Settings > Functions** and add the required secrets (e.g., `PAYSTACK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) for the Edge Functions.

5.  **Install Dependencies & Run:**
    To run the main client application:
    ```bash
    cd client
    npm install
    npm start
    ```
    The application will be available at `http://localhost:3000`.

    To run the admin panel:
    ```bash
    cd admin
    npm install
    npm start
    ```
    The admin panel will be available at `http://localhost:3001` (or the next available port).

---

## 📚 Full Documentation

For more detailed information on the architecture, deployment, and maintenance of this project, please refer to the documents in the `DOCUMENTATION/` directory.
