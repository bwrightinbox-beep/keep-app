# Deployment Guide - Little Things App

## Prerequisites

Before deploying, you'll need:

1. **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [https://vercel.com](https://vercel.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up Supabase Project

1. Create a new project in Supabase
2. Go to Project Settings → API
3. Copy your **Project URL** and **anon public key**
4. Go to Project Settings → Database
5. Copy your **Connection string** (select "URI" format)

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Required - From your Supabase project
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# Optional - For AI features
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Step 3: Set Up Database Schema

Run the database migrations to create the required tables:

```bash
npm run db:push
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and click "New Project"
2. Import your GitHub repository
3. Vercel will automatically detect this is a Next.js project
4. Add your environment variables in the "Environment Variables" section
5. Click "Deploy"

### Option B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## Step 5: Configure Google OAuth (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add your Vercel domain to authorized redirect URIs:
   - `https://your-app.vercel.app/auth/callback`
6. In Supabase, go to Authentication → Providers
7. Enable Google provider and add your Google OAuth credentials

## Step 6: Update Supabase Auth Settings

1. In Supabase, go to Authentication → URL Configuration
2. Add your Vercel domain to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

## Environment Variables for Vercel

Add these in your Vercel project settings:

| Variable | Value | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ |
| `DATABASE_URL` | Your Supabase Postgres connection string | ✅ |
| `NEXT_PUBLIC_OPENAI_API_KEY` | Your OpenAI API key | ⚠️ Optional |
| `OPENAI_API_KEY` | Your OpenAI API key (server-side) | ⚠️ Optional |

## Post-Deployment

1. Visit your deployed app
2. Test the login flow with Google
3. Create a test memory to verify database connectivity
4. Share the URL with friends for testing!

## Troubleshooting

### Build Errors
- Ensure all required environment variables are set
- Check that your Supabase project is active
- Verify your database connection string

### Authentication Issues
- Verify Google OAuth redirect URIs match your domain
- Check Supabase auth settings include your Vercel domain
- Ensure environment variables are correctly set in Vercel

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check that your Supabase project allows connections
- Try running `npm run db:push` locally to test the connection

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test the app locally first with `npm run dev`