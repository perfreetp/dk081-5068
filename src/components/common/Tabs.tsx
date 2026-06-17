import { createContext, useContext, useState, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={twMerge('flex flex-wrap gap-1 border-b border-gray-200 mb-6', className)}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  badge?: number;
  className?: string;
}

export function TabsTrigger({ value, children, badge, className }: TabsTriggerProps) {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => onValueChange(value)}
      className={twMerge(
        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
        isActive
          ? 'border-primary-600 text-primary-600 bg-primary-50/50'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className={twMerge(
          'px-2 py-0.5 text-xs',
          isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;
  return (
    <div className={twMerge('animate-fade-in', className)}>
      {children}
    </div>
  );
}
