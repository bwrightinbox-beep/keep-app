import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting database migration...')
  console.log('📋 Adding missing columns to partner_profiles table...')

  try {
    // First, let's check current table structure
    console.log('🔍 Checking current table structure...')

    // Try to select from the table to see what columns exist
    const { data: testData, error: testError } = await supabase
      .from('partner_profiles')
      .select('*')
      .limit(1)

    if (testError) {
      console.log('Table query result:', testError.message)
    }

    // Since we can't run DDL directly, let's try a workaround
    // We'll test if the columns exist by trying to insert test data

    console.log('🧪 Testing column existence by attempting data operations...')

    // Test if favorite_color column exists
    try {
      const { error: colorError } = await supabase
        .from('partner_profiles')
        .select('favorite_color')
        .limit(1)

      if (colorError) {
        console.log('❌ favorite_color column missing:', colorError.message)
      } else {
        console.log('✅ favorite_color column exists')
      }
    } catch (err) {
      console.log('❌ favorite_color column test failed:', err.message)
    }

    // Test other columns similarly
    const columnsToTest = ['favorite_food', 'favorite_hobbies', 'notes', 'important_dates']

    for (const column of columnsToTest) {
      try {
        const { error } = await supabase
          .from('partner_profiles')
          .select(column)
          .limit(1)

        if (error) {
          console.log(`❌ ${column} column missing:`, error.message)
        } else {
          console.log(`✅ ${column} column exists`)
        }
      } catch (err) {
        console.log(`❌ ${column} column test failed:`, err.message)
      }
    }

    console.log('\n📝 MANUAL STEP REQUIRED:')
    console.log('The migration needs to be run manually in your Supabase SQL Editor.')
    console.log('Please copy and paste this SQL into your Supabase dashboard:')
    console.log('\n' + '='.repeat(50))
    console.log(`
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
`)
    console.log('='.repeat(50))
    console.log('\n🌐 Go to: https://app.supabase.com/project/pnboaiwewptvdnjmnthu/sql/new')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

runMigration()