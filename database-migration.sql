-- Database Migration: Add Missing Columns to partner_profiles table
-- Run this SQL in your Supabase SQL Editor to fix the missing columns

-- Add missing columns to partner_profiles table
ALTER TABLE partner_profiles
ADD COLUMN IF NOT EXISTS favorite_color VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS favorite_food VARCHAR(200) DEFAULT '',
ADD COLUMN IF NOT EXISTS favorite_hobbies JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS important_dates JSONB DEFAULT '[]'::jsonb;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'partner_profiles'
ORDER BY ordinal_position;