# Security Guide

This document outlines the security measures implemented in the Super App and provides best practices for maintaining a secure environment.

## 1. Authentication & Authorization

*   **Firebase Authentication:** User identity is managed by Firebase Auth, which is a secure, industry-standard service. It handles password hashing, OAuth token management, and other complexities.
*   **JSON Web Tokens (JWT):** The frontend receives a JWT from Firebase upon successful login. This token is sent in the `Authorization` header of every request to the Supabase backend.
*   **Row Level Security (RLS):** This is the most critical security feature of our backend.
    *   RLS is **enabled on every table** in the Supabase database.
    *   Policies are written to ensure that users can only access and modify data they own. For example, a user can only `UPDATE` their own `profiles` row, and can only `INSERT` a message where the `sender_id` matches their own authenticated `user_id`.
    *   **Never disable RLS in production.**

## 2. Backend & API Security

*   **Supabase Edge Functions:**
    *   All sensitive logic (payment processing, communication with third-party APIs) is handled in Edge Functions, not on the client.
    *   **Secret Management:** All API keys and sensitive credentials (e.g., Paystack secret key, AWS keys, Firebase service account key) are stored as encrypted secrets in the Supabase dashboard. They are injected into the function as environment variables at runtime and are never exposed to the client.
*   **Webhook Verification:**
    *   The `verify-payment-webhook` function includes a crucial step to verify the cryptographic signature sent by Paystack. This ensures that the webhook request is authentic and has not been forged.
*   **Input Validation:**
    *   All Edge Functions should validate and sanitize their inputs to prevent common vulnerabilities like SQL injection (though Supabase's client libraries help prevent this) or Cross-Site Scripting (XSS).

## 3. Database Security

*   **RLS:** As mentioned above, this is the primary layer of defense.
*   **Database Access:** Direct access to the production database should be strictly limited to a small number of authorized administrators. Use the Supabase dashboard's access controls to manage this.
*   **Service Role Key:** The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies. It should **only** be used in secure backend environments (like our Edge Functions) and must never be exposed on the client-side.
*   **Backups:** Regular, automated backups are configured to ensure data can be restored in case of a disaster or security breach.

## 4. Frontend Security

*   **Cross-Site Scripting (XSS):** React automatically escapes content rendered in JSX, which helps prevent XSS attacks. However, be cautious when using `dangerouslySetInnerHTML`.
*   **Environment Variables:** While our current setup places public keys in the code, for larger teams or open-source projects, it's better to use environment variables for them as well (e.g., `REACT_APP_SUPABASE_URL`).
*   **Dependency Management:** Regularly audit and update frontend dependencies (`npm audit`) to patch any known security vulnerabilities in third-party libraries.

## 5. Payment Security

*   **PCI Compliance:** By using Paystack and Flutterwave for all payment processing, we delegate the responsibility for PCI DSS compliance to them. Our application never handles or stores raw credit card information.
*   **Secure Transactions:** All payment initialization is done server-side (in an Edge Function) to prevent the client from manipulating prices or other transaction details.

## 6. User Data Privacy

*   **Privacy Settings:** The `user_privacy_settings` table allows users to control aspects of their data visibility (e.g., `show_last_seen`). This should be respected in all frontend queries.
*   **Data Encryption:**
    *   **In Transit:** All communication between the client, Supabase, and third-party APIs is encrypted using TLS (HTTPS).
    *   **At Rest:** Supabase automatically encrypts data at rest.
*   **Private Vault:** For highly sensitive user content like the "Private Vault", consider implementing an extra layer of end-to-end encryption (E2EE), where the data is encrypted on the client with a key that only the user knows. This means even database administrators cannot view the content. This is an advanced feature that requires careful implementation.
