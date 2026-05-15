import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center text-center py-16 border-dashed border-earth-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-coop-gradient shadow-coop mb-5">
        <Icon className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-bold text-coop-900">{title}</h3>
      {description && (
        <p className="text-sm text-earth-500 mt-2 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
