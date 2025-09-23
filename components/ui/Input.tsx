import React from 'react';
import { designTokens } from '@/lib/design-tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  icon,
  style,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = {
    width: '100%',
    padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
    border: `2px solid ${error ? designTokens.colors.danger : designTokens.colors.border}`,
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.base,
    backgroundColor: designTokens.colors.background,
    color: designTokens.colors.textPrimary,
    transition: designTokens.animation.transition,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    outline: 'none',
    ...(icon && {
      paddingLeft: designTokens.spacing.xl,
    }),
  };

  const focusStyles = {
    borderColor: error ? designTokens.colors.danger : designTokens.colors.primary,
    boxShadow: `0 0 0 4px ${error ? designTokens.colors.red[100] : designTokens.colors.blue[100]}`,
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: designTokens.spacing.xs,
            fontSize: designTokens.typography.fontSize.sm,
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.textPrimary,
          }}
        >
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: designTokens.spacing.sm,
              top: '50%',
              transform: 'translateY(-50%)',
              color: designTokens.colors.textSecondary,
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}
        
        <input
          {...props}
          id={inputId}
          style={{
            ...baseStyles,
            ...style,
          }}
          onFocus={(e) => {
            Object.assign(e.currentTarget.style, focusStyles);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? designTokens.colors.danger : designTokens.colors.border;
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
          }
        />
      </div>
      
      {error && (
        <div
          id={`${inputId}-error`}
          style={{
            marginTop: designTokens.spacing.xs,
            fontSize: designTokens.typography.fontSize.sm,
            color: designTokens.colors.danger,
          }}
          role="alert"
        >
          {error}
        </div>
      )}
      
      {!error && helpText && (
        <div
          id={`${inputId}-help`}
          style={{
            marginTop: designTokens.spacing.xs,
            fontSize: designTokens.typography.fontSize.sm,
            color: designTokens.colors.textSecondary,
          }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
};