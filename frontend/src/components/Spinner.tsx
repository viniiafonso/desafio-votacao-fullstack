import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-coop-200 border-t-coop-600',
        className,
      )}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-coop-100 border-t-coop-600" />
      <p className="text-sm text-earth-500 font-medium">Carregando...</p>
    </div>
  );
}
