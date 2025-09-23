import React from 'react';
import { designTokens } from '@/lib/design-tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact' | 'elevated';
  interactive?: boolean;
  children: React.ReactNode;
  as?: React.ElementType;
  ariaLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  children,
  style,
  as: Component = 'div',
  ariaLabel,
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        padding: designTokens.spacing.lg,
        borderRadius: designTokens.borderRadius.xl,
        boxShadow: designTokens.shadows.md,
      },
      compact: {
        padding: designTokens.spacing.md,
        borderRadius: designTokens.borderRadius.lg,
        boxShadow: designTokens.shadows.sm,
      },
      elevated: {
        padding: designTokens.spacing.xl,
        borderRadius: designTokens.borderRadius.xl,
        boxShadow: designTokens.shadows.lg,
      },
    };
    return variants[variant];
  };

  const baseStyles = {
    backgroundColor: designTokens.colors.background,
    border: `1px solid ${designTokens.colors.border}`,
    transition: designTokens.animation.transition,
    ...(interactive && {
      cursor: 'pointer',
    }),
  };

  const hoverStyles = interactive ? {
    transform: 'translateY(-2px)',
    boxShadow: designTokens.shadows.xl,
  } : {};

  return (
    <Component
      {...props}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      style={{
        ...baseStyles,
        ...getVariantStyles(),
        ...style,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        if (interactive) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        if (interactive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = getVariantStyles().boxShadow;
        }
        props.onMouseLeave?.(e);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          e.currentTarget.click();
        }
        props.onKeyDown?.(e);
      }}
    >
      {children}
    </Component>
  );
};