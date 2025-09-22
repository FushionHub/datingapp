# Deployment Guide

This guide provides step-by-step instructions for deploying the Super App to a production environment.

## 1. Deploying the Frontend (React App)

The recommended platform for deploying modern React applications is **Vercel**, but other platforms like Netlify or AWS Amplify are also excellent choices.

### Using Vercel (Recommended)

1.  **Push to Git Repository:** Ensure your entire project is pushed to a GitHub, GitLab, or Bitbucket repository.
2.  **Sign Up for Vercel:** Create an account at [vercel.com](https://vercel.com) and connect it to your Git provider.
3.  **Import Project:**
    *   From your Vercel dashboard, click "Add New... > Project".
    *   Select the Git repository for this project.
4.  **Configure Project:**
    *   Vercel will automatically detect that it's a React app.
    *   **Root Directory:** Set the root directory to `client`. This is crucial because our React app is inside the `client` folder.
    *   **Build & Output Settings:** Vercel's defaults for Create React App are usually correct (`npm run build`, output directory `build`).
    *   **Environment Variables:** You do not need to set environment variables here, as all keys are intended to be public and are part of the committed code in `firebaseConfig.js` and `supabaseClient.js`.
5.  **Deploy:** Click the "Deploy" button. Vercel will build and deploy your application. After deployment, it will provide you with a public URL.
6.  **Update `SITE_URL`:** Go back to your Supabase dashboard (**Settings > Functions**) and update the `SITE_URL` secret to your new Vercel production URL. This is important for features like the Paystack callback.

## 2. Deploying Supabase Edge Functions

You must use the Supabase CLI to deploy your Edge Functions.

### 2.1. Initial Setup

1.  **Install Supabase CLI:** If you haven't already, install the CLI.
    ```bash
    npm install supabase --save-dev
    ```
2.  **Log In:**
    ```bash
    npx supabase login
    ```
3.  **Link Project:** In the root directory of your project, link your local project to your remote Supabase project. You will need your Project ID from your Supabase dashboard URL (`https://app.supabase.io/project/<project-id>`).
    ```bash
    npx supabase link --project-ref <your-project-id>
    ```

### 2.2. Deploying a Function

1.  **Deploy the function:** To deploy a specific function (e.g., `verify-face`), run the following command:
    ```bash
    npx supabase functions deploy verify-face
    ```
2.  **Deploy All Functions:** To deploy all functions in your `supabase/functions` directory at once, you can run:
    ```bash
    npx supabase functions deploy
    ```
    It's often better to deploy functions individually to avoid unintended changes.

3.  **Set Secrets:** **This is a critical step.** For each deployed function, you must set the required secrets in the Supabase dashboard.
    *   Go to **Settings > Functions**.
    *   Click on the function you deployed.
    *   Go to the **Secrets** section and add the required keys (e.g., `PAYSTACK_SECRET_KEY`, `AWS_ACCESS_KEY_ID`, etc.) as documented in `setup_guide.md`.

## 3. Production Checklist

*   **[ ] Database Backups:** In your Supabase dashboard (**Project Settings > Database**), configure daily backups.
*   **[ ] Paystack Webhooks:** In your Paystack dashboard, go to **Settings > API Keys & Webhooks**. Add a webhook URL pointing to your `verify-payment-webhook` Edge Function. The URL will look like: `https://<your-project-ref>.supabase.co/functions/v1/verify-payment-webhook`.
*   **[ ] Custom Domain:** Configure a custom domain for both your Vercel frontend and your Supabase project for a professional look.
*   **[ ] Enable SSL:** Vercel and Supabase provide SSL automatically. Ensure it's active.
*   **[ ] Review RLS Policies:** Double-check that all your Row Level Security policies in Supabase are correct and restrictive enough for a production environment.
*   **[ ] Monitor Logs:** Regularly check the logs for your Vercel deployment and your Supabase Edge Functions to catch any errors.

---

## 3. Deploying to Shared Hosting (cPanel)

Deploying a modern React application to traditional shared hosting (like those using cPanel) is possible but requires a different approach than deploying to a platform like Vercel. Instead of connecting a Git repository, you will upload a static production build of the application.

### 3.1. How It Works

*   **You build the app locally:** You run a command (`npm run build`) that bundles all your React code into a small set of static files (HTML, CSS, JavaScript) in a `build` directory.
*   **You upload the static files:** You upload the *contents* of this `build` directory to your hosting server's main web folder (usually `public_html`).
*   **You configure the server:** You add a special configuration file (`.htaccess`) that tells the Apache web server how to handle client-side routing, ensuring that users can navigate your app and refresh pages without getting a "404 Not Found" error.

The Supabase backend (database, Edge Functions) is **not** deployed on your shared hosting. It remains at Supabase. Your deployed frontend will simply make API calls to it.

### 3.2. Step-by-Step Instructions

1.  **Create a Production Build:**
    *   Open your terminal in the `client` directory of the project.
    *   Run the build command:
        ```bash
        npm run build
        ```
    *   This will create a new folder named `build` inside your `client` directory. This folder contains the complete, optimized static version of your application.

2.  **Upload to cPanel:**
    *   Log in to your cPanel account.
    *   Open the **File Manager**.
    *   Navigate to the root directory for your website, which is typically `public_html`.
    *   Click **Upload** and upload the *contents* of the `client/build` folder from your local machine into `public_html`. **Do not upload the `build` folder itself, but everything inside it.**

3.  **Create the `.htaccess` File:**
    *   While still in the `public_html` directory in the cPanel File Manager, create a new file named `.htaccess`. If the file already exists, edit it.
    *   Add the following code to the `.htaccess` file. This code redirects all navigation requests to your `index.html` file, allowing React Router to handle the routing.
        ```apache
        <IfModule mod_rewrite.c>
          RewriteEngine On
          RewriteBase /
          RewriteRule ^index\.html$ - [L]
          RewriteCond %{REQUEST_FILENAME} !-f
          RewriteCond %{REQUEST_FILENAME} !-d
          RewriteCond %{REQUEST_FILENAME} !-l
          RewriteRule . /index.html [L]
        </IfModule>
        ```
    *   Save the file.

Your application should now be live and accessible from your domain. Any time you make changes to the frontend code, you will need to run `npm run build` again and re-upload the contents of the `build` folder.

---

## 4. Deploying to a Virtual Private Server (VPS)

This method is for advanced users who want full control over their hosting environment. This guide uses Ubuntu as the example OS, with Nginx as the web server and PM2 as the process manager.

### 4.1. Prerequisites

*   A VPS running a recent version of Ubuntu.
*   A domain name pointed to your VPS's IP address.
*   SSH access to your server.

### 4.2. Step 1: Server Preparation

1.  **SSH into your server.**

2.  **Install Node.js:**
    ```bash
    curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```

3.  **Install Nginx:**
    ```bash
    sudo apt-get install -y nginx
    ```

4.  **Install PM2 and `serve`:** PM2 is a process manager that will keep your app running. `serve` is a simple tool for serving static files.
    ```bash
    sudo npm install -g pm2 serve
    ```

### 4.3. Step 2: Deploy Application Code

1.  **Clone your project:** Clone your application's repository onto the server.
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Install Dependencies & Build:**
    ```bash
    cd client
    npm install
    npm run build
    ```
    This creates the static `build` directory.

3.  **Start the Application with PM2:**
    *   We will use `pm2` and `serve` to serve the static `build` folder. `serve` will host the files on a local port, and PM2 will ensure the `serve` process keeps running.
    *   Run the following command from within the `client` directory:
        ```bash
        pm2 serve build 3000 --spa --name "react-app"
        ```
        *   `serve build 3000`: Serve the `build` directory on port 3000.
        *   `--spa`: This is critical. It tells `serve` to redirect all not-found requests to `index.html`, making it a Single Page Application (SPA) friendly server.
        *   `--name "react-app"`: This gives the process a name in PM2.

4.  **Save the PM2 process list:** This ensures your app will restart automatically if the server reboots.
    ```bash
    pm2 save
    ```

### 4.4. Step 3: Configure Nginx as a Reverse Proxy

1.  **Create a new Nginx configuration file:**
    ```bash
    sudo nano /etc/nginx/sites-available/your-domain.com
    ```

2.  **Add the following server block.** This configures Nginx to listen for public traffic on port 80 and forward it to the React app running on port 3000.
    ```nginx
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Enable the configuration:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
    ```

4.  **Test and restart Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

### 4.5. Step 4: (Recommended) Add SSL with Let's Encrypt

1.  **Install Certbot:**
    ```bash
    sudo apt-get install -y certbot python3-certbot-nginx
    ```

2.  **Obtain and install the certificate:** Certbot will automatically detect your domain from your Nginx config, get a certificate, and update the Nginx config to use it.
    ```bash
    sudo certbot --nginx -d your-domain.com -d www.your-domain.com
    ```
    Follow the on-screen prompts.

Your application is now deployed on a VPS, running persistently with PM2, and served securely over HTTPS with Nginx.
