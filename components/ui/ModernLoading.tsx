'use client'

import React from 'react'

interface ModernLoadingProps {
  text: string
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

export default function ModernLoading({ text, size = 'md', fullPage = false }: ModernLoadingProps) {
  const getSizeStyles = () => {
    const sizes = {
      sm: {
        container: { padding: '2rem' },
        dots: { width: '8px', height: '8px' },
        logo: { width: '32px', height: '32px' },
        text: { fontSize: '0.875rem' }
      },
      md: {
        container: { padding: '3rem' },
        dots: { width: '12px', height: '12px' },
        logo: { width: '48px', height: '48px' },
        text: { fontSize: '1rem' }
      },
      lg: {
        container: { padding: '4rem' },
        dots: { width: '16px', height: '16px' },
        logo: { width: '64px', height: '64px' },
        text: { fontSize: '1.125rem' }
      }
    }
    return sizes[size]
  }

  const sizeStyles = getSizeStyles()

  const containerStyle = fullPage 
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }

  return (
    <div style={containerStyle}>
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...sizeStyles.container
        }}
      >

        {/* Animated dots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                ...sizeStyles.dots,
                borderRadius: '50%',
                background: '#000000',
                animation: `bounce 1.4s infinite`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div style={{ textAlign: 'center' }}>
          <p 
            style={{
              ...sizeStyles.text,
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem',
              animation: 'fadeIn 2s ease-in-out infinite alternate'
            }}
          >
            {text}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-secondary)',
            animation: 'pulse 2s infinite'
          }}>
            Just a moment...
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: '1.5rem',
          width: '192px',
          height: '4px',
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden'
        }}>
          <div 
            style={{
              height: '100%',
              background: '#000000',
              borderRadius: 'var(--radius-xl)',
              animation: 'progress 3s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes progress {
          0% {
            transform: translateX(-100%);
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            transform: translateX(200%);
            width: 100%;
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}