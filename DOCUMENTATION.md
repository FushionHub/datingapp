# Project Documentation Hub

Welcome to the central documentation hub for the EuroMeet Online Super App. This document provides a high-level overview of the available documentation and links to detailed guides for developers, administrators, and future maintainers.

All detailed documentation can be found within the [`/DOCUMENTATION`](/DOCUMENTATION) directory.

---

## 1. Getting Started

If you are new to the project, these guides will help you get the application up and running on your local machine.

*   **[Setup Guide (`/DOCUMENTATION/setup_guide.md`)](./DOCUMENTATION/setup_guide.md)**
    *   A comprehensive, step-by-step guide to setting up your development environment, including all required third-party services like Supabase, Firebase, and Paystack.

*   **[Database Schema (`/DATABASE_SCHEMA.md`)](./DATABASE_SCHEMA.md)**
    *   Contains the complete SQL script required to set up the PostgreSQL database on Supabase. It is designed to be run in the Supabase SQL Editor.

---

## 2. Core Concepts & Architecture

These documents explain the "how" and "why" behind the project's design and structure.

*   **[Architecture Overview (`/DOCUMENTATION/architecture.md`)](./DOCUMENTATION/architecture.md)**
    *   A detailed breakdown of the system architecture, explaining how the frontend client, admin panel, Supabase backend, and various third-party services interact with each other.

*   **[Developer Guide (`/DOCUMENTATION/developer_guide.md`)](./DOCUMENTATION/developer_guide.md)**
    *   Provides conventions and best practices for developers working on this project, including coding style, state management philosophy, and component design.

---

## 3. Deployment & Maintenance

Once you are ready to go live, these guides will walk you through the process of deploying and maintaining the application.

*   **[Deployment Guide (`/DOCUMENTATION/deployment_guide.md`)](./DOCUMENTATION/deployment_guide.md)**
    *   Instructions for deploying the frontend applications (client and admin) and the Supabase Edge Functions to a production environment.

*   **[Maintenance Guide (`/DOCUMENTATION/maintenance_guide.md`)](./DOCUMENTATION/maintenance_guide.md)**
    *   Provides guidance on routine maintenance tasks, such as monitoring, data backups, and dependency updates.

*   **[Scaling Guide (`/DOCUMENTATION/scaling_guide.md`)](./DOCUMENTATION/scaling_guide.md)**
    *   Discusses potential performance bottlenecks and strategies for scaling the application as the user base grows.

---

## 4. Security

Security is critical. This guide outlines the security measures in place and best practices for keeping the application secure.

*   **[Security Guide (`/DOCUMENTATION/security_guide.md`)](./DOCUMENTATION/security_guide.md)**
    *   Covers key security considerations, including Row Level Security (RLS) policies in Supabase, management of API keys and secrets, and secure coding practices.

---

## 5. Manual Testing

To manually verify the functionality of the application, especially after making changes, refer to the testing guide.

*   **[Manual Testing Guide (`/TESTING_GUIDE.md`)](./TESTING_GUIDE.md)**
    *   Provides a suite of manual test cases to confirm that critical features are working as expected.
