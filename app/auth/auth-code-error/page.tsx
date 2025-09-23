'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function AuthCodeErrorPage() {
  // Clear all storage on error to ensure clean state
  useEffect(() => {
    // Clear localStorage
    localStorage.clear()
    // Clear sessionStorage
    sessionStorage.clear()
  }, [])
  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '4rem auto', 
      padding: '2rem',
      textAlign: 'center',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      backgroundColor: '#fef2f2'
    }}>
      <h1 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '1rem',
        color: '#dc2626'
      }}>
        Authentication Error
      </h1>
      
      <p style={{ 
        color: '#991b1b', 
        marginBottom: '1.5rem',
        lineHeight: '1.6'
      }}>
        Sorry, we couldn't sign you in. This could happen if:
      </p>
      
      <ul style={{ 
        textAlign: 'left',
        color: '#991b1b',
        marginBottom: '1.5rem',
        lineHeight: '1.6'
      }}>
        <li>The magic link has expired (they expire after 1 hour)</li>
        <li>The magic link has already been used</li>
        <li>There was a network error</li>
      </ul>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/login">
          <button style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Try Again
          </button>
        </Link>
        
        <Link href="/">
          <button style={{
            backgroundColor: 'transparent',
            color: '#dc2626',
            padding: '0.75rem 1.5rem',
            border: '2px solid #dc2626',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Go Home
          </button>
        </Link>
      </div>
      
      <p style={{ 
        fontSize: '0.875rem',
        color: '#6b7280',
        marginTop: '1.5rem'
      }}>
        Need help? The demo version is always available from the login page.
      </p>
    </div>
  )
}