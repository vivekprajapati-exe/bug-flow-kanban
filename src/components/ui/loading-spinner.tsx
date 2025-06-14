
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <div className={cn(
          sizeClasses[size],
          'animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-primary to-primary/30 bg-clip-border'
        )}>
          <div className={cn(
            sizeClasses[size],
            'rounded-full bg-background'
          )} style={{ margin: '2px' }} />
        </div>
        <div className={cn(
          sizeClasses[size],
          'absolute top-0 left-0 animate-pulse rounded-full bg-gradient-to-r from-primary/20 to-transparent'
        )} />
      </div>
    </div>
  );
};

export const LoadingDots: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingPulse: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="w-8 h-8 bg-primary rounded-full animate-pulse opacity-75" />
    </div>
  );
};
