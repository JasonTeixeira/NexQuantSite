/**
 * Button Component
 * Versatile button component with multiple variants and sizes
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

/**
 * Button component with multiple variants and sizes
 * 
 * @example
 * // Default button
 * <Button>Click me</Button>
 * 
 * @example
 * // Outline button with small size
 * <Button variant="outline" size="sm">Small Outline</Button>
 * 
 * @example
 * // Loading state
 * <Button isLoading>Processing...</Button>
 */
export const Button = ({ 
  variant = 'default', 
  size = 'default', 
  children, 
  className = '',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) => {
  // Combined disabled state (explicitly disabled or loading)
  const isDisabled = disabled || isLoading;
  
  return (
    <button 
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
        
        ${variant === 'default' ? 'bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600' : 
          variant === 'outline' ? 'border border-gray-600 bg-transparent hover:bg-gray-700 text-gray-200' :
          variant === 'destructive' ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' :
          variant === 'ghost' ? 'bg-transparent hover:bg-gray-800 text-gray-300' :
          variant === 'link' ? 'bg-transparent underline-offset-4 hover:underline text-cyan-500 hover:text-cyan-400' : ''}
        
        ${size === 'default' ? 'h-10 px-4 py-2' : 
          size === 'sm' ? 'h-8 px-3 py-1 text-sm' : 
          size === 'lg' ? 'h-12 px-6 py-3 text-lg' :
          size === 'icon' ? 'h-10 w-10' : ''}
        
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};
