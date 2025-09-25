const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting database migration...')

  try {
    // Add missing columns to partner_profiles table
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add missing columns to partner_profiles table
        ALTER TABLE partner_profiles
        ADD COLUMN IF NOT EXISTS favorite_color VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS favorite_food VARCHAR(200) DEFAULT '',
        ADD COLUMN IF NOT EXISTS favorite_hobbies JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS important_dates JSONB DEFAULT '[]'::jsonb;
      `
    })

    if (error) {
      console.error('❌ Migration failed:', error)

      // Try alternative approach with individual queries
      console.log('🔄 Trying individual column additions...')

      const columns = [
        "ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS favorite_color VARCHAR(100) DEFAULT ''",
        "ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS favorite_food VARCHAR(200) DEFAULT ''",
        "ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS favorite_hobbies JSONB DEFAULT '[]'::jsonb",
        "ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''",
        "ALTER TABLE partner_profiles ADD COLUMN IF NOT EXISTS important_dates JSONB DEFAULT '[]'::jsonb"
      ]

      for (const sql of columns) {
        const { error: colError } = await supabase.rpc('exec_sql', { sql })
        if (colError) {
          console.log(`⚠️  Column addition may have failed (could be expected if column exists): ${colError.message}`)
        } else {
          console.log(`✅ Successfully added column`)
        }
      }
    } else {
      console.log('✅ Migration completed successfully!')
    }

    // Verify the table structure
    console.log('🔍 Verifying table structure...')
    const { data: columns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'partner_profiles')
      .order('ordinal_position')

    if (verifyError) {
      console.error('❌ Could not verify table structure:', verifyError)
    } else {
      console.log('📋 Current partner_profiles table structure:')
      console.table(columns)
    }

    console.log('🎉 Migration process completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

runMigration()