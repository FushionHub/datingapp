# Scaling Guide

This document provides strategies and best practices for scaling the Super App to handle a large and active user base.

## 1. Database Scaling (Supabase)

Supabase is built on PostgreSQL, which is highly scalable. However, performance can degrade without proper optimization.

*   **Compute Resources:**
    *   **Upgrade Your Plan:** The simplest way to scale is to upgrade your Supabase project's compute plan. This provides more CPU, RAM, and dedicated resources. Monitor your database health in the Supabase dashboard to know when it's time to upgrade.
*   **Database Indexing:**
    *   **Identify Slow Queries:** Use the `pg_stat_statements` extension in Supabase to identify queries that are slow or are executed very frequently.
    *   **Add Indexes:** Create indexes on columns that are frequently used in `WHERE` clauses, `JOIN` conditions, and for ordering (`ORDER BY`). For example, `user_id` in the `posts` table, `match_id` in the `messages` table, and `follower_id`/`following_id` in the `followers` table are all critical candidates for indexing.
*   **Connection Pooling:**
    *   Supabase comes with connection pooling out of the box, which is essential for handling many concurrent connections from serverless functions. Ensure you are using the connection pooler connection string for any external services that might connect to the database.
*   **Database Denormalization:**
    *   For read-heavy features like follower/following counts on a profile, these can be expensive to calculate on every profile load. A common strategy is to add denormalized count columns directly to the `profiles` table (e.g., `follower_count`, `following_count`).
    *   These columns can be updated using database triggers whenever a new entry is added or removed from the `followers` table. This trades a small amount of write overhead for a huge gain in read performance.

## 2. Backend Scaling

### Supabase Edge Functions

Edge Functions are serverless and scale automatically based on demand. The key to maintaining performance is to ensure the functions are efficient.

*   **Optimize Function Code:** Keep functions small and focused on a single task.
*   **Minimize Cold Starts:** Use the Supabase Pro or Enterprise plans to keep functions "warm" and reduce response times for infrequently used functions.
*   **Asynchronous Operations:** For long-running tasks (like video processing or complex AI analysis), do not wait for them to complete within the initial HTTP request. Instead, have the Edge Function add the task to a queue (e.g., a dedicated `jobs` table in the database) and have another process (like a scheduled function) handle it asynchronously.

### Dedicated Real-time Server (Node.js)

The proposed Node.js server for advanced real-time communication (group calls, voice rooms) is a stateful component and needs to be scaled more traditionally.

*   **Vertical Scaling:** Increase the CPU and RAM of the server instance (e.g., on AWS EC2, DigitalOcean, etc.).
*   **Horizontal Scaling:** Run multiple instances of the Node.js server behind a load balancer. This is more complex because of the stateful nature of WebSockets. You will need:
    *   **A Sticky Session Load Balancer:** To ensure a user is always routed to the same server instance they initially connected to.
    *   **A Backplane (e.g., Redis Pub/Sub):** To allow different server instances to communicate with each other. For example, if User A (on Server 1) wants to send a message to a group chat where other members are on Server 2, Server 1 would publish the message to a Redis channel, and Server 2 (which is subscribed to that channel) would receive it and forward it to its connected clients.

## 3. Frontend & Content Delivery

*   **Use a CDN:** Platforms like Vercel and Netlify use a Content Delivery Network (CDN) by default. This distributes your frontend assets (HTML, CSS, JS) across the globe, so they are delivered quickly to users no matter where they are.
*   **Image & Video Optimization:**
    *   **Compression:** Use tools to compress images and videos before they are uploaded to Supabase Storage.
    *   **Responsive Images:** Serve different image sizes for different screen resolutions.
    *   **Streaming:** For video content (especially Reels), implement a streaming solution instead of having users download the entire file at once. Supabase Storage can serve content for streaming.
*   **Code Splitting:**
    *   Use React's built-in code-splitting features (`React.lazy` and `Suspense`) to only load the JavaScript needed for the current page. This dramatically reduces the initial load time of the application.

## 4. Caching Strategies

*   **Client-Side Caching:** Use libraries like React Query or SWR to cache data fetched from the API on the client. This prevents redundant requests for the same data and makes the UI feel much faster.
*   **Edge Caching:** For public, non-user-specific data (like the list of available gifts), you can cache the results of Edge Function calls at the CDN level for a short period to reduce the load on your database.
