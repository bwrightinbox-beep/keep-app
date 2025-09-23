export const designTokens = {
  colors: {
    primary: '#0ea5e9',      // Consistent blue from navigation
    primaryHover: '#0284c7',
    secondary: '#6b7280',
    accent: '#7c3aed',       // Purple for memories
    success: '#10b981',      // Green for plans
    warning: '#f59e0b',      // Orange for warnings
    danger: '#ef4444',       // Red for errors
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f9fafb',
    backgroundTertiary: '#f3f4f6',
    
    // Text colors
    textPrimary: '#374151',     // Dark gray - excellent contrast (9.48:1)
    textSecondary: '#4b5563',   // Medium gray - good contrast (7.28:1) - was #6b7280
    textMuted: '#6b7280',       // Lighter gray - adequate contrast (5.05:1) - was #9ca3af
    
    // Border colors
    border: '#e5e7eb',
    borderSecondary: '#d1d5db',
    
    // Status colors
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    purple: {
      50: '#f3e8ff',
      100: '#e9d5ff',
      500: '#7c3aed',
      600: '#7c3aed',
      700: '#6d28d9',
    },
    green: {
      50: '#ecfdf5',
      100: '#d1fae5',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    yellow: {
      50: '#fef3c7',
      100: '#fde68a',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    red: {
      50: '#fef2f2',
      100: '#fecaca',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    pink: {
      50: '#fdf2f8',
      100: '#fce7f3',
      500: '#ec4899',
      600: '#db2777',
      700: '#be185d',
    },
  },
  
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  borderRadius: {
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
  },
  
  typography: {
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '2rem',   // 32px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  animation: {
    transition: 'all 0.2s ease',
    transitionSlow: 'all 0.3s ease',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

// Utility functions for consistent styling
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
  const base = {
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.base,
    fontWeight: designTokens.typography.fontWeight.medium,
    border: 'none',
    cursor: 'pointer',
    transition: designTokens.animation.transition,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: designTokens.spacing.xs,
  };

  const variants = {
    primary: {
      backgroundColor: designTokens.colors.primary,
      color: 'white',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: designTokens.colors.primary,
      border: `2px solid ${designTokens.colors.primary}`,
    },
    danger: {
      backgroundColor: designTokens.colors.danger,
      color: 'white',
    },
  };

  return { ...base, ...variants[variant] };
};

export const getCardStyles = () => ({
  backgroundColor: designTokens.colors.background,
  border: `1px solid ${designTokens.colors.border}`,
  borderRadius: designTokens.borderRadius.lg,
  padding: designTokens.spacing.lg,
  boxShadow: designTokens.shadows.md,
});

export const getInputStyles = () => ({
  width: '100%',
  padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
  border: `2px solid ${designTokens.colors.border}`,
  borderRadius: designTokens.borderRadius.md,
  fontSize: designTokens.typography.fontSize.base,
  backgroundColor: designTokens.colors.background,
  transition: designTokens.animation.transition,
});