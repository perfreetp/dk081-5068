import type { ReactNode } from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

interface TimelineItem {
  id: string;
  status: string;
  description: string;
  operator?: string;
  time: Date;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={`space-y-0 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.id} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute left-[15px] top-8 w-0.5 h-full bg-gray-200" />
            )}
            <div className="relative z-10 flex-shrink-0">
              {item.isCompleted ? (
                <CheckCircle className="w-8 h-8 text-green-500 bg-white" />
              ) : item.isCurrent ? (
                <div className="w-8 h-8 rounded-full bg-primary-100 border-2 border-primary-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                </div>
              ) : (
                <Circle className="w-8 h-8 text-gray-300 bg-white" />
              )}
            </div>
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${item.isCompleted || item.isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                  {item.status}
                </h4>
                {item.isCurrent && (
                  <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-600 font-medium">
                    当前
                  </span>
                )}
              </div>
              <p className={`text-sm ${item.isCompleted || item.isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                {item.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(item.time)}
                </span>
                {item.operator && <span>操作人：{item.operator}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
