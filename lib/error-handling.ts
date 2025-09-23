export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const createAppError = (
  code: string,
  message: string,
  userMessage?: string,
  isRetryable: boolean = false
) => {
  return new AppError(message, code, userMessage, isRetryable);
};

export const handleError = (error: unknown, context?: string): AppError => {
  console.error(`[${context || 'Application'}] Error:`, error);
  
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Handle common error types
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return createAppError(
        'NETWORK_ERROR',
        error.message,
        'Unable to connect to the server. Please check your internet connection.',
        true
      );
    }
    
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return createAppError(
        'PERMISSION_ERROR',
        error.message,
        'You do not have permission to perform this action.',
        false
      );
    }
    
    return createAppError(
      'UNKNOWN_ERROR',
      error.message,
      'Something went wrong. Please try again.',
      true
    );
  }
  
  return createAppError(
    'UNKNOWN_ERROR',
    'An unknown error occurred',
    'Something went wrong. Please try again.',
    true
  );
};

export const errorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof errorCodes[keyof typeof errorCodes];

// Toast notification utility (simple implementation)
export const showError = (error: AppError | string) => {
  const message = typeof error === 'string' ? error : error.userMessage || error.message;
  
  // For now, use alert - in production you'd want a proper toast system
  if (typeof window !== 'undefined') {
    // Create a simple toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #ef4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    // Add keyframes if not present
    if (!document.querySelector('#toast-keyframes')) {
      const style = document.createElement('style');
      style.id = 'toast-keyframes';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 5000);
  }
};

export const showSuccess = (message: string) => {
  if (typeof window !== 'undefined') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #10b981;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
};