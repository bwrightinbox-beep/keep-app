'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LogOut, User, Menu, X } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/memories', label: 'Memories' },
    { href: '/plans', label: 'Plans' },
    { href: '/settings', label: 'Settings' }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  if (isMobile) {
    return (
      <div>
        <nav className="nav-mobile-header">
          <div className="nav-mobile-brand">
            <img src="/keeps-logo v2.png" alt="Keeps" className="nav-mobile-logo-image" />
          </div>
          
          <button
            className="nav-mobile-toggle"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div 
            className="nav-mobile-overlay"
            role="dialog"
            aria-modal="true"
            onClick={closeMobileMenu}
          >
            <div 
              className="nav-mobile-menu"
              id="mobile-menu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="nav-mobile-items">
                {navItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`nav-mobile-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {user && (
                <div className="nav-mobile-user">
                  <div className="nav-user-info">
                    <User size={16} />
                    <span>{user.email}</span>
                  </div>
                  
                  <button
                    className="nav-signout-button"
                    onClick={() => {
                      closeMobileMenu()
                      signOut()
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop Navigation - Framer template style
  return (
    <nav className="nav-framer">
      <div className="nav-framer-container">
        {/* Left: Logo */}
        <div className="nav-framer-brand">
          <img src="/keeps-logo v2.png" alt="Keeps" className="nav-framer-logo-image" />
        </div>

        {/* Center: Navigation Links */}
        <div className="nav-framer-links">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-framer-link ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Action Buttons */}
        <div className="nav-framer-actions">
          {user ? (
            <>
              <div className="nav-framer-user">
                <User size={16} />
                <span>{user.email}</span>
              </div>
              <button
                className="nav-framer-button nav-framer-button-solid"
                onClick={signOut}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-framer-button nav-framer-button-outline">
                Sign In
              </Link>
              <Link href="/onboarding" className="nav-framer-button nav-framer-button-solid">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}