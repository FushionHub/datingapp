# Manual Testing Guide

This document provides a set of manual tests to verify the fixes and improvements made to the application. To perform these tests, you will need to have the application running locally by following the `DOCUMENTATION/setup_guide.md`.

---

## Test Case 1: Application Startup & Core Functionality

**Objective:** Verify that the client application starts without crashing and that core data is loaded correctly. This test validates the fixes for the missing `SettingsProvider` and the missing `theme.js` file.

**Steps:**
1.  Navigate to the `client` directory.
2.  Run `npm install`.
3.  Run `npm start`.
4.  Open your browser to `http://localhost:3000`.

**Expected Result:**
*   The application should load without any errors in the browser console.
*   You should be redirected to the `/login` page.
*   The page title in the browser tab should be "EuroMeet Online" (or whatever is set in the `site_settings` table), confirming that the `SettingsProvider` is working.

---

## Test Case 2: User Profile Updates

**Objective:** Verify that changes made to a user's profile are correctly saved to the database and persist after a page refresh. This test validates the fix for the non-persistent `updateUserProfile` function.

**Steps:**
1.  Log in to the application. You will be redirected to the Dashboard.
2.  In the "Your Profile" section, you should see a form (if the profile is incomplete) or profile details. Use the `ProfileForm` component to enter or update your name (e.g., change your name to "Test User").
3.  Click the update/submit button on the form.
4.  Observe that the name displayed on the dashboard updates to "Test User".
5.  **Refresh the page** in your browser.
6.  Log back in if necessary.

**Expected Result:**
*   After the refresh, the name displayed on the dashboard should still be "Test User", confirming the data was persisted to the database.

---

## Test Case 3: Theme Switching

**Objective:** Verify that the refactored theming system works correctly.

**Steps:**
1.  Log in to the application.
2.  On the dashboard, locate the "Theme" dropdown menu in the header.
3.  The theme should default to "Light".
4.  Select "Dark" from the dropdown.

**Expected Result:**
*   The application's color scheme should immediately change to a dark theme. All components should adapt correctly.
*   Refresh the page. The application should remain in dark mode, confirming the setting was saved to `localStorage`.

---

## Test Case 4: KYC Document Upload (URL Generation)

**Objective:** Verify that uploading a KYC document generates a secure, signed URL instead of a broken public URL.

**Steps:**
1.  Log in to the application.
2.  Navigate to the `/verify-identity` (KYC) page.
3.  Use the form to upload a test image file (e.g., a `.png` or `.jpg`).
4.  Open your browser's developer tools and go to the "Network" tab.
5.  Submit the form.
6.  You will not be able to directly see the result in the UI, but you can verify it in the database.
7.  Go to your Supabase project dashboard.
8.  Navigate to the `kyc_documents` table.
9.  Find the new row that was just created.

**Expected Result:**
*   In the `document_url` column for the new row, the URL should be very long and contain query parameters like `token`, `expires_in`, etc. It should **not** be a simple public URL. This confirms that a signed URL was generated.

---

## Test Case 5: Admin Panel Decoupling

**Objective:** Verify that the admin panel is self-contained and does not rely on the client project.

**Steps:**
1.  Navigate to the `admin` directory.
2.  Run `npm install`.
3.  Run `npm start`.
4.  Open your browser to `http://localhost:3001` (or the port specified for the admin panel).

**Expected Result:**
*   The admin panel's login page should load correctly without any compilation errors related to missing files from the `client` directory.

---

## Test Case 6: Dependency Vulnerabilities

**Objective:** Verify that the dependency vulnerabilities have been reduced.

**Steps:**
1.  In your terminal, navigate to the `client` directory.
2.  Run `npm audit`.
3.  Navigate to the `admin` directory.
4.  Run `npm audit`.

**Expected Result:**
*   In both directories, the `npm audit` command should report only **2 moderate severity vulnerabilities** (related to `webpack-dev-server`). All high-severity vulnerabilities should be gone.
