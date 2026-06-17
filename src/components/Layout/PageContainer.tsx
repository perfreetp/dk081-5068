import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PageContainer({ title, subtitle, children, actions }: PageContainerProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
