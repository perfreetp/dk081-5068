import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'primary';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', icon, className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    accent: 'bg-accent-50 text-accent-700 border-accent-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={twMerge(
      'inline-flex items-center font-medium border rounded-none',
      variants[variant],
      sizes[size],
      className
    )}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
}
