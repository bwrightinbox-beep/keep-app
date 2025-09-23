-- Little Things App Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create partner_profiles table
CREATE TABLE IF NOT EXISTS partner_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  birthday TEXT,
  anniversary TEXT,
  love_languages JSONB DEFAULT '[]'::jsonb,
  favorite_things TEXT,
  dislikes TEXT,
  sizes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  importance VARCHAR(10) DEFAULT 'low' NOT NULL CHECK (importance IN ('low', 'medium', 'high')),
  sensitivity VARCHAR(10) DEFAULT 'normal' NOT NULL CHECK (sensitivity IN ('normal', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0,
  difficulty VARCHAR(10) DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  steps JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  is_custom BOOLEAN DEFAULT true,
  reasoning TEXT,
  confidence INTEGER,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  daily_prompts BOOLEAN DEFAULT true,
  weekly_checkins BOOLEAN DEFAULT false,
  date_reminders BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  quiet_hours_start VARCHAR(10) DEFAULT '22:00',
  quiet_hours_end VARCHAR(10) DEFAULT '08:00',
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  show_private_memories BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own record" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for partner_profiles
CREATE POLICY "Users can view own partner profile" ON partner_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own partner profile" ON partner_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own partner profile" ON partner_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own partner profile" ON partner_profiles FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for memories
CREATE POLICY "Users can view own memories" ON memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON memories FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for plans
CREATE POLICY "Users can view own plans" ON plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON plans FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for app_settings
CREATE POLICY "Users can view own settings" ON app_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON app_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON app_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON app_settings FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partner_profiles_user_id ON partner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_scheduled_for ON plans(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON app_settings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partner_profiles_updated_at BEFORE UPDATE ON partner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();