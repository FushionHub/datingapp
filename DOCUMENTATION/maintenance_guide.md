# Maintenance & Update Guide

This guide provides instructions for the ongoing maintenance and updating of the Super App.

## 1. Routine Maintenance Tasks

### Weekly Tasks

*   **Review Logs:**
    *   Check the Supabase logs for any unusual activity or errors in the database and Edge Functions.
    *   Check the Vercel (or other frontend host) logs for any client-side errors or performance issues.
*   **Check Backups:** Verify that automated database backups are running successfully. Perform a test restore to a staging environment periodically (e.g., quarterly) to ensure backups are valid.

### Monthly Tasks

*   **Dependency Audit & Updates:**
    *   **Frontend:** In the `client` directory, run `npm audit` to check for known vulnerabilities in your dependencies. Use `npm update` to update packages to their latest minor versions. Major version updates should be tested carefully in a staging environment.
    *   **Backend (Edge Functions):** Review the Deno modules imported in your Edge Functions and update them to their latest stable versions.
*   **Review Security Policies:**
    *   Briefly review the Row Level Security (RLS) policies in `DATABASE_SCHEMA.md` and in the Supabase dashboard to ensure they are still appropriate for the current feature set.
    *   Review IAM policies in AWS and other third-party service permissions.

## 2. Monitoring

*   **Supabase Dashboard:** The Supabase dashboard provides real-time monitoring of your database health, CPU usage, memory, and API request volume. Set up alerts for high usage to be notified before performance degrades.
*   **Frontend Monitoring:** Use a service like Sentry or Vercel Analytics to capture and track client-side errors and performance metrics. This will help you identify bugs that only occur on specific user devices or browsers.
*   **Uptime Monitoring:** Use a service like UptimeRobot or Pingdom to monitor the uptime of your main frontend URL and your Supabase API endpoint.

## 3. Updating the Application

### Updating Frontend Code

1.  **Develop Locally:** Make your code changes in your local development environment.
2.  **Create Pull Request:** Push your changes to a new branch in your Git repository and create a pull request.
3.  **Automatic Staging:** Vercel (and similar platforms) will automatically create a "preview deployment" for your pull request. This is a temporary, live version of the app with your changes.
4.  **Test:** Thoroughly test the changes in the preview deployment.
5.  **Merge & Deploy:** Once the pull request is approved and merged into your main branch, Vercel will automatically trigger a new production deployment.

### Updating an Edge Function

1.  **Develop Locally:** Use the Supabase CLI to develop and test your Edge Function locally.
    ```bash
    npx supabase functions serve <function-name>
    ```
2.  **Deploy:** Once you are happy with the changes, deploy the function using the CLI.
    ```bash
    npx supabase functions deploy <function-name>
    ```
3.  **Verify:** After deployment, test the function's behavior in the live application.

### Updating the Database Schema

Updating a live database schema must be done with extreme care to avoid data loss.

1.  **Create a Migration Script:** Instead of running SQL directly in the Supabase dashboard, use the Supabase CLI to create a new migration file.
    ```bash
    npx supabase migration new <your-migration-name>
    ```
2.  **Write Your SQL:** Add your `ALTER TABLE`, `CREATE TABLE`, etc., statements to the new migration file.
3.  **Test in Staging:** Apply the migration to a staging or local environment first to ensure it works as expected.
    ```bash
    npx supabase db reset # (Resets local db and applies all migrations)
    ```
4.  **Deploy to Production:** Once you are confident, apply the migration to your production database.
    ```bash
    npx supabase migration up
    ```
    This is a safer, more controlled, and version-controlled way to manage database changes.
