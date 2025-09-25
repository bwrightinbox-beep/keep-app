import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Use service role key to bypass RLS
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      console.error('[API] Service role key not configured')
      return NextResponse.json({ error: 'Service configuration error' }, { status: 500 })
    }

    // Create admin client with service role key
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    // Check if user exists
    const { data: existingUser, error: fetchError } = await adminClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json({ success: true, message: 'User already exists' })
    }

    // First, check if user exists in auth.users table
    console.log('[API] Checking if user exists in auth.users...')
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId)

    if (authError || !authUser) {
      console.error('[API] User not found in auth.users:', authError)
      return NextResponse.json({ error: 'User not found in authentication system' }, { status: 404 })
    }

    console.log('[API] User found in auth.users:', authUser.user.email)

    // User exists in auth, now create in custom users table
    console.log('[API] Creating user in custom users table...')
    const { error: insertError } = await adminClient
      .from('users')
      .upsert([{
        id: userId,
        email: authUser.user.email || email || 'unknown@example.com'
      }], {
        onConflict: 'id'
      })

    if (insertError) {
      console.error('[API] Admin user creation error:', insertError)
      return NextResponse.json({ error: `Failed to create user: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'User created successfully' })
  } catch (error) {
    console.error('[API] Exception in user creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}