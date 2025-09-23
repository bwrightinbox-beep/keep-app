'use client'

import { getSupabaseClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = getSupabaseClient()
  const [showSignedOutMessage, setShowSignedOutMessage] = useState(false)

  useEffect(() => {
    // Check if user was just signed out
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('signedOut') === 'true') {
      setShowSignedOutMessage(true)
      // Clear the URL parameter
      window.history.replaceState({}, document.title, '/login')
    }
  }, [])

  const handleGoogleLogin = async () => {
    try {
      // Use the current origin for redirect - this will work if you add the IP to Google OAuth
      const redirectUrl = `${window.location.origin}/dashboard`
      
      console.log('OAuth redirect URL:', redirectUrl)
      console.log('Make sure this URL is added to Google OAuth redirect URIs:', redirectUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false
        }
      })
      
      if (error) {
        console.error('Google login error:', error.message)
        // Provide helpful error message
        const errorMsg = error.message.includes('redirect_uri_mismatch') 
          ? 'OAuth redirect error. Please add this URL to Google OAuth settings: ' + redirectUrl
          : `Login failed: ${error.message}`
        alert(errorMsg)
      }
    } catch (err) {
      console.error('Google login exception:', err)
      alert('Login failed. Please try again.')
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ marginTop: '100px' }}>
        <div className="card" style={{ maxWidth: '400px', textAlign: 'center', padding: '25px' }}>
          <main 
            role="main"
            aria-labelledby="login-title"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
              <img src="/keeps-logo v2.png" alt="Keeps" style={{ height: '60px', marginBottom: '1rem' }} />
            </div>
            <h1 id="login-title">
              Welcome to Keeps
            </h1>
            <p style={{ marginBottom: '2rem' }}>
              Track the little things that matter most
            </p>
            
            {/* Signed out confirmation message */}
            {showSignedOutMessage && (
              <div 
                role="status" 
                aria-live="polite"
                className="card-glass"
                style={{ 
                  marginBottom: '1.5rem', 
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderColor: '#10b981'
                }}
              >
                <p style={{ margin: 0, color: '#065f46' }}>
                  <span aria-hidden="true">✅</span> You have been successfully signed out
                </p>
              </div>
            )}
            
            {/* Google Sign-In Button */}
            <button
              className="btn"
              onClick={handleGoogleLogin}
              aria-label="Sign in with Google"
              style={{
                width: '100%',
                marginBottom: '1.5rem',
                backgroundColor: '#000',
                background: '#000',
                color: '#fff',
                border: '1px solid #000',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-primary)',
              opacity: 0.8,
              margin: 0
            }}>
              Use your google account to login securely
            </p>
          </main>
        </div>
      </div>
    </div>
  )
}