import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {icon && <div className="mb-4 text-outline">{icon}</div>}
      <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
      {description && <p className="mt-1 text-sm text-outline">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
