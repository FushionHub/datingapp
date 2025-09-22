# Developer Guide

This guide provides instructions and best practices for developers who will be extending and adding new features to the Super App.

## 1. Codebase Structure

The project is organized into several key directories:

*   **`client/`**: Contains the entire React frontend application.
    *   **`client/src/components/`**: Reusable React components (e.g., `Post.js`, `GiftModal.js`).
    *   **`client/src/pages/`**: Components that represent full pages/routes (e.g., `ProfilePage.js`, `ChatPage.js`).
    *   **`client/src/context/`**: React Context providers for global state (e.g., `AuthContext.js`).
    *   **`client/src/services/`**: Modules for interacting with the backend (e.g., `supabaseService.js`).
    *   **`client/src/firebaseConfig.js`**: Firebase initialization and helper functions.
    *   **`client/src/supabaseClient.js`**: Supabase client initialization.
*   **`supabase/`**: Contains the configuration and code for all backend Edge Functions.
    *   **`supabase/functions/<function-name>/index.ts`**: The entry point for each Edge Function.
*   **`DOCUMENTATION/`**: Contains all project documentation, including this guide.
*   **`DATABASE_SCHEMA.md`**: The source of truth for the entire database schema.

## 2. Development Workflow

### Adding a New Frontend Feature (e.g., a "Bookmarks" page)

1.  **Create a New Page Component:** Create `client/src/pages/BookmarksPage.js`.
2.  **Add a Route:** Open `client/src/App.js` and add a new protected route for `/bookmarks`.
3.  **Add Service Functions:** Open `client/src/services/supabaseService.js` and add any new functions needed to fetch data for the bookmarks page (e.g., `getBookmarkedPosts()`).
4.  **Build UI:** Implement the UI within `BookmarksPage.js`, calling the service functions to get data.
5.  **Add Navigation:** Add a link to the new `/bookmarks` page in the main navigation (e.g., in `Dashboard.js`).

### Adding a New Database Table

1.  **Update Schema File:** Open `DATABASE_SCHEMA.md` and add the `CREATE TABLE` statement for your new table.
2.  **Include RLS Policies:** **This is not optional.** Every new table must have Row Level Security enabled and appropriate policies defined.
3.  **Create a Migration (Recommended):** For a live project, use the Supabase CLI to create a new migration file with your SQL changes.
    ```bash
    npx supabase migration new <your-new-table-name>
    ```
4.  **Apply Migration:** Run the migration to update your local or production database.

### Adding a New Edge Function

1.  **Create Function Directory:** Create a new folder inside `supabase/functions/`.
    ```bash
    mkdir supabase/functions/<my-new-function>
    ```
2.  **Create `index.ts`:** Create an `index.ts` file inside the new directory. This is the entry point.
3.  **Write Function Logic:** Implement your function, remembering to handle CORS headers.
4.  **Add Service Function:** Add a corresponding function in `supabaseService.js` to call your new Edge Function from the client.
    ```javascript
    // In supabaseService.js
    export async function callMyNewFunction(params) {
      const { data, error } = await supabase.functions.invoke('<my-new-function>', {
        body: { ...params },
      });
      // ... handle error and return data
    }
    ```
5.  **Deploy:** Deploy the new function using the Supabase CLI.
    ```bash
    npx supabase functions deploy <my-new-function>
    ```
6.  **Set Secrets:** If your function needs any API keys, add them as secrets in the Supabase dashboard.

## 3. Coding Conventions

*   **React:** Use functional components with hooks. Avoid class components.
*   **State Management:** For simple, local state, use `useState`. For global state (like the current user), use React Context. For complex client-side data caching, consider a library like React Query or SWR.
*   **Styling:** The application uses **`styled-components`** for styling. A global theme is provided via the `ThemeContext`, which allows for easy switching between light and dark modes. Reusable styled components should be defined alongside their component or in a shared `styles.js` file.
*   **Asynchronous Code:** Use `async/await` for all asynchronous operations (e.g., fetching data from Supabase).
*   **Dependency Management:** This project uses `npm`. To mitigate vulnerabilities in sub-dependencies of core packages like `react-scripts`, we use the `overrides` feature in `package.json`. If new vulnerabilities are found, this should be the first approach before considering ejecting.

## 4. Key Architectural Patterns

*   **Service Layer:** All interaction with the Supabase backend (database, functions, storage) is abstracted into the `supabaseService.js` file. Components should not call `supabase` directly; they should call a function from the service layer. This keeps the code organized and easy to refactor.
*   **Database Views for Complex Queries:** To improve performance and simplify client-side logic, complex data transformations should be handled by a database view. For example, the `v_matches_with_users` view was created to pre-join `matches` and `profiles` data, making the `getMatches` service function much cleaner.
*   **Secure by Default:** All database tables use Row Level Security. All sensitive logic is in Edge Functions. When adding new features, always think about the security implications first.
*   **Documentation First:** For any major new feature, update the relevant documentation (`architecture.md`, `DATABASE_SCHEMA.md`) before or during development.
