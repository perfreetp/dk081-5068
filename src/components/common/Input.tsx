import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  icon: Icon,
  wrapperClassName,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || Math.random().toString(36).slice(2);

  return (
    <div className={twMerge('space-y-1', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          id={inputId}
          className={twMerge(
            'w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
            Icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Textarea({
  label,
  error,
  wrapperClassName,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || Math.random().toString(36).slice(2);

  return (
    <div className={twMerge('space-y-1', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={twMerge(
          'w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none',
          error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
