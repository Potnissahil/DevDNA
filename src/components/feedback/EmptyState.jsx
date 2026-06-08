import Button from "../common/Button";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--border-strong)] bg-[var(--panel-muted)]/55 px-6 py-10 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
        {actionLabel && onAction ? (
          <Button className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default EmptyState;
