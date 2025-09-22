# Setup & Installation Guide

This guide provides detailed instructions for setting up the development environment for the Super App.

## 1. Prerequisites

Ensure you have the following software installed on your local machine:

*   **Node.js:** (v16 or later recommended). You can download it from [nodejs.org](https://nodejs.org/).
*   **npm:** This is the Node Package Manager and comes with Node.js.
*   **Git:** For cloning the repository. You can get it from [git-scm.com](https://git-scm.com/).
*   **Supabase CLI:** For local development and deployment of Edge Functions. Installation instructions are available at [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli).

## 2. Cloning the Repository

First, clone the project repository to your local machine:

```bash
git clone <repository-url>
cd <project-directory>
```

## 3. Third-Party Service Setup

This project relies on several external services. You must create an account and a project for each of the following.

### 3.1. Supabase Project

1.  **Create Account:** Sign up at [supabase.com](https://supabase.com).
2.  **Create Project:** Create a new project. Choose a strong database password and save it securely.
3.  **Get API Credentials:**
    *   Navigate to your project's **Settings > API**.
    *   You will find your **Project URL** and your **`anon` public key**.
4.  **Run Database Schema:**
    *   Navigate to the **SQL Editor** in your project dashboard.
    *   Copy the entire content of the `DATABASE_SCHEMA.md` file from this repository.
    *   Paste the SQL into a new query and click **Run**. This will create all the necessary tables and functions.

### 3.2. Firebase Project

1.  **Create Account:** Sign up at [firebase.google.com](https://firebase.google.com).
2.  **Create Project:** Add a new project in the Firebase Console.
3.  **Register Web App:**
    *   Inside your project, click the Web icon (`</>`) to add a web app.
    *   After registering, Firebase will provide a `firebaseConfig` object. Copy this.
4.  **Enable Authentication:**
    *   In the Firebase Console, go to **Build > Authentication**.
    *   On the "Sign-in method" tab, enable **Email/Password** and **Google**.
5.  **Enable Cloud Messaging:**
    *   Go to **Project settings > Cloud Messaging**.
    *   Under "Web configuration", generate a **VAPID key**. Copy this key.

### 3.3. AWS Account (for Face Verification)

1.  **Create Account:** Sign up at [aws.amazon.com](https://aws.amazon.com).
2.  **Create IAM User:**
    *   In the AWS Management Console, go to the **IAM** service.
    *   Create a new user.
    *   Attach the `AmazonRekognitionFullAccess` policy to this user.
    *   Generate an **Access Key ID** and a **Secret Access Key**. Save these credentials securely.

### 3.4. Paystack Account (for Payments)

1.  **Create Account:** Sign up at [paystack.com](https://paystack.com).
2.  **Get API Keys:**
    *   In your Paystack dashboard, go to **Settings > API Keys & Webhooks**.
    *   You will find your **Secret Key**.

## 4. Environment Configuration

This project uses `.env` files to manage environment variables. You will need to create a `.env` file in both the `client/` and `admin/` directories.

### 4.1. Client Configuration (`client/.env`)

Create a file named `.env` inside the `client` directory and add the following content, replacing the placeholder values with your actual credentials from Firebase and Supabase.

```
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
REACT_APP_FIREBASE_VAPID_KEY=YOUR_FCM_VAPID_KEY
```

### 4.2. Admin Configuration (`admin/.env`)

The admin panel uses the same set of keys. Create a file named `.env` inside the `admin` directory and add the same content as above.

### 4.3. Supabase Edge Functions (Secrets)

You must set the API keys and other secrets for the Edge Functions securely in the Supabase dashboard. **Do not hardcode them.**

1.  Go to your Supabase project dashboard.
2.  Go to **Settings > Functions**.
3.  For each function (`verify-face`, `initialize-payment`, `verify-payment-webhook`, `send-fcm-notification`), click on it and go to the **Secrets** section.
4.  Add the following secrets:
    *   `PAYSTACK_SECRET_KEY`: Your Paystack secret key.
    *   `AWS_ACCESS_KEY_ID`: Your AWS IAM user's access key.
    *   `AWS_SECRET_ACCESS_KEY`: Your AWS IAM user's secret key.
    *   `FIREBASE_SERVICE_ACCOUNT_JSON`: The entire JSON content of your Firebase service account key file. (To get this, go to Firebase Settings > Service accounts > Generate new private key).
    *   `SUPABASE_SERVICE_ROLE_KEY`: Found in your Supabase API settings.
    *   `SITE_URL`: The URL of your deployed frontend (e.g., `http://localhost:3000` for development).

## 5. Installing Dependencies & Running the Apps

### 5.1. Running the Client App

1.  Navigate to the client directory: `cd client`
2.  Install dependencies: `npm install`
3.  Run the development server: `npm start`

The main application will be running at `http://localhost:3000`.

### 5.2. Running the Admin Panel

1.  Navigate to the admin directory: `cd admin`
2.  Install dependencies: `npm install`
3.  Run the development server: `npm start`

The admin panel will be running on the next available port, typically `http://localhost:3001`.

---

To deploy the Edge Functions, you will need to use the Supabase CLI. See the `deployment_guide.md` for instructions.
