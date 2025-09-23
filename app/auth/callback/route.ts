import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('=== Auth Callback Debug ===')
  console.log('Full URL:', request.url)
  console.log('Code:', code)
  console.log('Error param:', error)
  console.log('Error description:', errorDescription)
  console.log('Origin:', origin)
  console.log('Next:', next)

  // Check for OAuth error parameters first
  if (error) {
    console.error('OAuth error received:', error, errorDescription)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      console.log('Attempting to exchange code for session...')
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Exchange result data:', data)
      console.log('Exchange error:', exchangeError)
      
      if (!exchangeError && data?.session) {
        console.log('Successfully exchanged code for session')
        
        // Get the user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        console.log('User data:', user)
        console.log('User error:', userError)
        
        if (user) {
          // Create user record in our database if it doesn't exist
          const { data: existingUser, error: selectError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()
          
          console.log('Existing user check:', existingUser, selectError)
          
          if (!existingUser) {
            const { error: insertError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email!,
              }])
            console.log('User insert error:', insertError)
          }
        }
        
        console.log('Redirecting to:', `${origin}${next}`)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('Code exchange failed:', exchangeError)
      }
    } catch (err) {
      console.error('Exception during code exchange:', err)
    }
  } else {
    console.log('No code parameter received')
  }

  // Return the user to an error page with instructions
  console.log('Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}