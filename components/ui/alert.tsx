/**
 * Alert Component
 * Used for displaying errors, warnings, and informational messages
 */

import React from 'react';

export interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
  className?: string;
}

export const Alert = ({ variant = 'default', children, className }: AlertProps) => {
  return (
    <div 
      className={`p-4 rounded-lg ${
        variant === 'destructive' ? 'bg-red-900 text-red-100' : 'bg-gray-800 text-gray-100'
      } ${className || ''}`}
    >
      {children}
    </div>
  );
};

export const AlertTitle = ({ children }: { children: React.ReactNode }) => {
  return <h5 className="font-medium text-lg mb-2">{children}</h5>;
};
