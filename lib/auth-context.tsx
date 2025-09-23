'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDemoMode = !supabaseUrl || !supabaseKey || supabaseUrl.includes('demo') || supabaseKey.includes('demo')

  const supabase = isDemoMode ? null : getSupabaseClient()

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, no authentication
      setUser(null)
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Session error:', error)
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.warn('Auth session error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [isDemoMode])

  const signOut = async () => {
    if (!isDemoMode && supabase) {
      try {
        console.log('Starting sign out process...')
        
        // Step 1: Clear user state immediately
        setUser(null)
        
        // Step 2: Sign out from Supabase 
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        if (error) {
          console.error('Supabase sign out error:', error)
        } else {
          console.log('Supabase sign out successful')
        }
        
        // Step 3: Aggressively clear the specific Supabase localStorage key
        const supabaseKey = 'sb-pnboaiwewptvdnjmnthu-auth-token'
        console.log('Clearing localStorage key:', supabaseKey)
        localStorage.removeItem(supabaseKey)
        
        // Step 4: Clear all other storage as backup
        localStorage.clear()
        sessionStorage.clear()
        
        // Step 5: Verify the key is gone
        const remainingToken = localStorage.getItem(supabaseKey)
        console.log('Token after clearing:', remainingToken)
        
        // Step 6: Clear all cookies
        const allCookies = document.cookie.split(";")
        allCookies.forEach(function(cookie) {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        })
        
        // Step 7: Force Google logout in hidden iframe
        const googleSignOutFrame = document.createElement('iframe')
        googleSignOutFrame.style.display = 'none'
        googleSignOutFrame.src = 'https://accounts.google.com/logout'
        document.body.appendChild(googleSignOutFrame)
        
        setTimeout(() => {
          if (document.body.contains(googleSignOutFrame)) {
            document.body.removeChild(googleSignOutFrame)
          }
        }, 1500)
        
        console.log('Sign out complete, redirecting...')
        
        // Step 8: Hard redirect to break any cached state
        setTimeout(() => {
          window.location.replace('/login?signedOut=true')
        }, 500)
        
      } catch (error) {
        console.error('Sign out exception:', error)
        // Emergency cleanup
        setUser(null)
        localStorage.removeItem('sb-pnboaiwewptvdnjmnthu-auth-token')
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/login?signedOut=true')
      }
    } else {
      // Demo mode
      setUser(null)
      window.location.replace('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}