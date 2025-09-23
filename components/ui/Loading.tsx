import React from 'react';
import { designTokens } from '@/lib/design-tokens';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const getSizeStyles = () => {
    const sizes = {
      sm: { width: '16px', height: '16px', borderWidth: '2px' },
      md: { width: '32px', height: '32px', borderWidth: '3px' },
      lg: { width: '48px', height: '48px', borderWidth: '4px' },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  const spinnerStyles = {
    ...sizeStyles,
    border: `${sizeStyles.borderWidth} solid ${designTokens.colors.borderSecondary}`,
    borderTop: `${sizeStyles.borderWidth} solid ${designTokens.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyles = fullScreen
    ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: designTokens.spacing.md,
        padding: designTokens.spacing.lg,
      };

  // Add keyframes for spinner animation
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('#loading-keyframes')) {
      const style = document.createElement('style');
      style.id = 'loading-keyframes';
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label={text || 'Loading'}
      style={containerStyles}
    >
      <div 
        style={spinnerStyles} 
        aria-hidden="true"
      />
      {text && (
        <p
          style={{
            margin: 0,
            marginTop: designTokens.spacing.md,
            color: designTokens.colors.textSecondary,
            fontSize: designTokens.typography.fontSize.sm,
            textAlign: 'center',
          }}
        >
          {text}
        </p>
      )}
      {/* Screen reader only content */}
      <span className="sr-only">
        {text || 'Loading content, please wait'}
      </span>
    </div>
  );
};

// Skeleton loader for card placeholders
export interface SkeletonProps {
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  count = 1,
  className,
}) => {
  // Add keyframes for skeleton animation
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.querySelector('#skeleton-keyframes')) {
      const style = document.createElement('style');
      style.id = 'skeleton-keyframes';
      style.textContent = `
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const skeletonStyle = {
    width,
    height,
    backgroundColor: designTokens.colors.backgroundTertiary,
    borderRadius: designTokens.borderRadius.md,
    animation: 'skeleton-pulse 2s ease-in-out infinite',
  };

  if (count === 1) {
    return <div style={skeletonStyle} className={className} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing.xs }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={skeletonStyle} className={className} />
      ))}
    </div>
  );
};

// Loading wrapper component for pages
export interface LoadingWrapperProps {
  loading: boolean;
  error?: string;
  children: React.ReactNode;
  loadingText?: string;
  retryAction?: () => void;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  error,
  children,
  loadingText = 'Loading...',
  retryAction,
}) => {
  if (loading) {
    return <Loading text={loadingText} fullScreen />;
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: designTokens.spacing.xl,
          textAlign: 'center',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: designTokens.spacing.md,
          }}
        >
          ⚠️
        </div>
        <h3
          style={{
            margin: 0,
            marginBottom: designTokens.spacing.sm,
            color: designTokens.colors.textPrimary,
            fontSize: designTokens.typography.fontSize.lg,
          }}
        >
          Something went wrong
        </h3>
        <p
          style={{
            margin: 0,
            marginBottom: designTokens.spacing.lg,
            color: designTokens.colors.textSecondary,
            fontSize: designTokens.typography.fontSize.base,
            maxWidth: '400px',
          }}
        >
          {error}
        </p>
        {retryAction && (
          <button
            onClick={retryAction}
            style={{
              padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
              backgroundColor: designTokens.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: designTokens.borderRadius.md,
              cursor: 'pointer',
              fontSize: designTokens.typography.fontSize.base,
              fontWeight: designTokens.typography.fontWeight.semibold,
              transition: designTokens.animation.transition,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = designTokens.colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = designTokens.colors.primary;
            }}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};