'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is logged in, redirect to dashboard
        router.push('/dashboard')
      } else {
        // If user is not logged in, redirect to login
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Show loading while checking auth status
  return (
    <div>
      Loading...
    </div>
  )
}