# Supabase Setup Guide

This guide will walk you through setting up Supabase for the Keeps app, including database creation, authentication, and deployment.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Project Details:
   - **Name**: `keeps-app`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for setup to complete (~2 minutes)

### 2. Get Database Connection Details

1. In your Supabase project dashboard, go to **Settings > Database**
2. Copy the connection string under "Connection string"
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. Should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-connection-string

# Keep your existing OpenAI key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-key
```

**To find these values:**
- Go to **Settings > API** in your Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role secret key
- `DATABASE_URL` = From Settings > Database > Connection string

### 4. Set Up Database Schema

Run these commands to create and deploy your database schema:

```bash
# Generate migration files from schema
npm run db:generate

# Apply migrations to Supabase
npm run db:migrate
```

Alternative: Push schema directly (for development):
```bash
npm run db:push
```

### 5. Configure Authentication

1. In Supabase Dashboard, go to **Authentication > Settings**
2. **Site URL**: Set to `http://localhost:3000` for development
3. **Redirect URLs**: Add:
   - `http://localhost:3000/auth/callback`
   - `https://your-deployed-app.vercel.app/auth/callback` (for production)

4. **Email Templates** (Optional but recommended):
   - Go to **Authentication > Email Templates**
   - Customize the "Magic Link" email template
   - Update subject and content to match your app branding

### 6. Enable Row Level Security (RLS)

This is crucial for data security. Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for partner_profiles
CREATE POLICY "Users can view own partner profile" 
ON partner_profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner profile" 
ON partner_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own partner profile" 
ON partner_profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own partner profile" 
ON partner_profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for memories
CREATE POLICY "Users can view own memories" 
ON memories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" 
ON memories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" 
ON memories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" 
ON memories FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for plans
CREATE POLICY "Users can view own plans" 
ON plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans" 
ON plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" 
ON plans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans" 
ON plans FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for app_settings
CREATE POLICY "Users can view own settings" 
ON app_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
ON app_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
ON app_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" 
ON app_settings FOR DELETE 
USING (auth.uid() = user_id);
```

## 🧪 Testing Your Setup

1. **Test Database Connection:**
   ```bash
   npm run db:studio
   ```
   This opens Drizzle Studio to browse your database.

2. **Check Schema:**
   - Go to your Supabase Dashboard > Table Editor
   - You should see: `users`, `partner_profiles`, `memories`, `plans`, `app_settings`

3. **Test Authentication:**
   - Start your app: `npm run dev`
   - Try to sign up with a real email address
   - Check **Authentication > Users** in Supabase to see if the user was created

## 🚀 Production Deployment

### For Vercel:

1. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

2. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Project Settings > Environment Variables
   - Add all the environment variables from your `.env.local`

3. **Update Supabase Settings:**
   - In Supabase: **Authentication > Settings**
   - Update **Site URL** to your Vercel URL
   - Add redirect URL: `https://your-app.vercel.app/auth/callback`

## 📊 Database Management

### Backup Data
```bash
# Export data before major changes
supabase db dump --local > backup.sql
```

### View Database
```bash
# Open database studio
npm run db:studio
```

### Reset Database (Development Only)
```bash
# Generate new migration
npm run db:generate

# Apply to reset
npm run db:push
```

## 🔧 Troubleshooting

### Common Issues:

1. **"relation does not exist" errors:**
   - Run `npm run db:push` to sync schema

2. **Authentication redirect errors:**
   - Check Site URL and Redirect URLs in Supabase settings
   - Ensure they match your deployed app URL

3. **RLS policy errors:**
   - Make sure Row Level Security policies are set up correctly
   - Check that `auth.uid()` matches the `user_id` in your policies

4. **Environment variable errors:**
   - Restart your dev server after adding new env vars
   - Double-check all environment variables are correctly copied

### Get Help:
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- Check the Supabase Dashboard logs for detailed error messages

## 📝 Next Steps

After setup is complete:

1. ✅ Test user registration and login
2. ✅ Verify data persistence across all features
3. ✅ Test the app with multiple users
4. ✅ Set up proper error handling for network issues
5. ✅ Configure email templates and branding
6. ✅ Set up monitoring and alerts for production