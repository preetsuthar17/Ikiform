# **Prompt / Context for AI Agent:**

I want to create an open-source form-building web application called **Ikiform**, which is an alternative to Typeform and Google Forms. The goal is to allow users to easily create beautiful, customizable forms, view responses, and gain insights through analytics. The app should be clean, responsive, and user-friendly.

## 💡 General Goals

- Build a **full-stack web application** with a clear separation between front-end and back-end.
- Front-end built with **Next.js**, **Tailwind CSS**, and **ShadCN UI**.
- Back-end using **Supabase** for authentication, database, and real-time functionality.
- Users should be able to:

  - Sign up/log in securely.
  - Create, customize, and share forms.
  - View and manage responses.
  - Access analytics.
  - Manage account settings.

---

## 🔧 Frontend Requirements

- Built with **Next.js (App Router or Pages Router)**.
- **Tailwind CSS** for utility-first styling.
- **ShadCN UI** for accessible, customizable UI components.
- Use **React hooks** and context API (or Zustand) for state management.
- Key Pages:

  - **Home**: Overview and feature highlights.
  - **Dashboard**: List of user-created forms and stats.
  - **Create Form**: Launch form builder.
  - **Form Builder**: Drag-and-drop interface for adding/editing questions.
  - **Responses**: Table view of form submissions with filters/export.
  - **Analytics**: Visual reports and trends from responses.
  - **Settings**: Profile and notification preferences.
  - **User Management** (if admin): Manage user roles and access.

---

## 🛠️ Backend Requirements (Supabase)

- **Supabase Auth** for user login/signup via email/password or social providers.
- **PostgreSQL** for storing user data, forms, questions, and responses.
- **Row-level security (RLS)** to ensure users access only their own data.
- Optional: Use **Supabase Edge Functions** for business logic (e.g. custom analytics).
- Include:

  - DB schema and migration scripts.
  - Seed scripts for demo data.
  - Real-time subscriptions (optional) for new responses.

---

## ✅ Key Features

- Beautiful and responsive form UI.
- Question types: Short text, long text, multiple choice, checkboxes, dropdown, date, rating, etc.
- Drag-and-drop form builder with customizable layouts/themes.
- Shareable public links to fill forms (no login required to submit).
- Responses exportable to CSV.
- Built-in analytics dashboard: submission count, conversion rates, demographics.
- Clean UX for managing account and settings.
- Open-source community contributions encouraged.

---

## 🚀 Workflow & Deployment

- Version control using **Git** with clear commit messages and branches.
- Local development using `frontend/` and `backend/` folders.
- Deploy **frontend** to **Vercel** or **Netlify**.
- Connect **Supabase** project using environment variables securely stored in `.env`.
