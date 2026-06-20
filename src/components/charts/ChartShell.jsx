import EmptyState from "../feedback/EmptyState";
import SkeletonCard from "../feedback/SkeletonCard";

function ChartShell({
  title,
  description,
  children,
  loading = false,
  empty = false,
  emptyTitle = "No data available",
  emptyDescription = "Add more information to populate this chart.",
  footer = null,
  minHeight = "min-h-[320px]"
}) {
  return (
    <div className={`h-full rounded-[28px] border border-[var(--border)] bg-[var(--panel-muted)]/30 p-5 sm:p-6 ${minHeight}`}>
      <div className="flex h-full flex-col">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        </div>

        <div className="mt-5 flex-1">
          {loading ? (
            <SkeletonCard lines={4} />
          ) : empty ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            children
          )}
        </div>

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export default ChartShell;
