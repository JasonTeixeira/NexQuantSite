/**
 * Skeleton Component
 * Used for displaying loading states with animated placeholders
 */

import React from 'react';

export interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton component for displaying loading states
 * 
 * @example
 * // Basic usage
 * <Skeleton className="h-8 w-64" />
 * 
 * @example
 * // Card loading state
 * <div className="space-y-3">
 *   <Skeleton className="h-8 w-3/4" />
 *   <Skeleton className="h-32 w-full" />
 *   <Skeleton className="h-4 w-1/2" />
 * </div>
 */
export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div 
      className={`animate-pulse bg-gray-700 rounded ${className || ''}`}
      aria-hidden="true"
    />
  );
};
