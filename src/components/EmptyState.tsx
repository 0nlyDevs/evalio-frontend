import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: string;
}

export function EmptyState({ icon: Icon, title, description, action, tone = "var(--yellow)" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border-2 border-dashed border-ink bg-card/70">
      <div
        className="size-16 flex items-center justify-center mb-5 rounded-xl border-2 border-ink shadow-[var(--shadow-hard)] -rotate-3"
        style={{ background: tone }}
      >
        <Icon size={28} strokeWidth={2.2} aria-hidden />
      </div>
      <p className="text-lg font-bold mb-1">{title}</p>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border-2 border-ink bg-coral/40 px-4 py-3 text-sm font-medium">
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm shrink-0" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
