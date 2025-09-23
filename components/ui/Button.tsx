import React from 'react';
import { designTokens } from '@/lib/design-tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: designTokens.colors.primary,
        color: 'white',
        border: 'none',
      },
      secondary: {
        backgroundColor: 'transparent',
        color: designTokens.colors.primary,
        border: `2px solid ${designTokens.colors.primary}`,
      },
      danger: {
        backgroundColor: designTokens.colors.danger,
        color: 'white',
        border: 'none',
      },
      success: {
        backgroundColor: designTokens.colors.success,
        color: 'white',
        border: 'none',
      },
    };
    return variants[variant];
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        padding: `${designTokens.spacing.xs} ${designTokens.spacing.md}`,
        fontSize: designTokens.typography.fontSize.sm,
      },
      md: {
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
        fontSize: designTokens.typography.fontSize.base,
      },
      lg: {
        padding: `${designTokens.spacing.md} ${designTokens.spacing.xl}`,
        fontSize: designTokens.typography.fontSize.lg,
      },
    };
    return sizes[size];
  };

  const baseStyles = {
    borderRadius: designTokens.borderRadius.xl,
    fontWeight: designTokens.typography.fontWeight.semibold,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: designTokens.animation.transition,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: icon ? designTokens.spacing.xs : 0,
    opacity: disabled || loading ? 0.6 : 1,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    letterSpacing: '-0.01em',
    boxShadow: designTokens.shadows.sm,
  };

  const hoverStyles = {
    transform: disabled || loading ? 'none' : 'translateY(-1px)',
    boxShadow: disabled || loading ? designTokens.shadows.sm : designTokens.shadows.md,
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...baseStyles,
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, hoverStyles);
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = designTokens.colors.primaryHover;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary;
            e.currentTarget.style.color = 'white';
          }
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = designTokens.shadows.sm;
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = designTokens.colors.primary;
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = designTokens.colors.primary;
          }
        }
        props.onMouseLeave?.(e);
      }}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {!loading && icon && icon}
      {children}
    </button>
  );
};

// Add keyframes for loading spinner to global CSS if not present
const addSpinKeyframes = () => {
  if (typeof document !== 'undefined' && !document.querySelector('#spin-keyframes')) {
    const style = document.createElement('style');
    style.id = 'spin-keyframes';
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Call on component mount
if (typeof window !== 'undefined') {
  addSpinKeyframes();
}