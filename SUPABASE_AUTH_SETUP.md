# Supabase Authentication Setup Guide

## 🎯 Overview

This guide will help you configure Supabase authentication with GitHub OAuth for your Ikiform application.

## 📋 Prerequisites

- Supabase project created
- GitHub account
- Environment variables configured

## 🔧 Setup Instructions

### 1. Supabase Project Setup

1. **Create a Supabase Project** (if not already done):

   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new project

2. **Get your Supabase credentials**:

   - Go to Project Settings → API
   - Copy your Project URL and anon public key

3. **Configure OAuth Providers in Supabase**:
   - Go to Authentication → Settings
   - Scroll down to "Auth Providers"
   - Enable GitHub and Google providers
   - You'll need OAuth App credentials (see steps 2 & 3)

### 2. GitHub OAuth App Setup

1. **Create a GitHub OAuth App**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: Ikiform (or your app name)
     - **Homepage URL**: `http://localhost:3000` (for development)
     - **Authorization callback URL**: `https://your-project-ref.supabase.co/auth/v1/callback`
2. **Get your credentials**:

   - After creating the app, copy the Client ID
   - Generate a new Client Secret and copy it

3. **Add credentials to Supabase**:
   - Back in Supabase Auth Settings → GitHub
   - Paste your GitHub Client ID and Client Secret
   - Save the configuration

### 3. Google OAuth Setup

1. **Create a Google OAuth App**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google+ API (or Google Identity API)
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

2. **Get your credentials**:

   - Copy the Client ID and Client Secret

3. **Add credentials to Supabase**:
   - Back in Supabase Auth Settings → Google
   - Paste your Google Client ID and Client Secret
   - Save the configuration

### 4. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 5. Supabase URL Configuration

In your Supabase project:

1. Go to Authentication → Settings
2. Add your site URLs to "Site URL" and "Redirect URLs":
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## 🚀 Testing the Setup

1. **Start your development server**:

   ```bash
   pnpm dev
   ```

2. **Test the authentication flow**:
   - Visit `http://localhost:3000`
   - Click "Sign In" in the navbar
   - Click "Continue with GitHub"
   - Authorize the application
   - You should be redirected to the dashboard

## 📁 Files Created/Modified

- `middleware.ts` - Handles auth state and route protection
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/app/auth/signout/route.ts` - Sign out handler
- `src/app/auth/login/page.tsx` - Login page
- `src/app/dashboard/page.tsx` - Protected dashboard page
- `src/components/auth/LoginForm.tsx` - GitHub login component
- `src/components/auth/DashboardContent.tsx` - Dashboard UI
- `src/components/Navbar.tsx` - Updated with auth state
- `src/lib/supabase/client.ts` - Updated browser client
- `.env.example` - Environment variables template

## 🔒 Security Features

- ✅ Protected routes with middleware
- ✅ Server-side authentication checks
- ✅ Automatic session refresh
- ✅ Secure cookie handling
- ✅ OAuth state verification

## 🎉 What's Working

After setup, you'll have:

- GitHub OAuth authentication
- Protected dashboard route
- User profile display
- Sign in/out functionality
- Session persistence
- Automatic redirects

## 📞 Troubleshooting

**Common Issues:**

1. **Redirect URI mismatch**: Make sure your GitHub OAuth app callback URL matches your Supabase auth callback URL
2. **Environment variables**: Ensure all required environment variables are set
3. **Supabase URL**: Make sure you're using the correct Supabase project URL
4. **CORS issues**: Add your domain to Supabase's allowed origins

**Need Help?**

- Check the Supabase dashboard for authentication logs
- Verify your GitHub OAuth app settings
- Ensure environment variables are loaded correctly
