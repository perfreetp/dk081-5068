import type { SelectHTMLAttributes, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  wrapperClassName?: string;
}

export function Select({
  label,
  options,
  error,
  wrapperClassName,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || Math.random().toString(36).slice(2);

  return (
    <div className={twMerge('space-y-1', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={twMerge(
            'w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white pr-10',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
