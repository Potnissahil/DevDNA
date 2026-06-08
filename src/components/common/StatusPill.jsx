function StatusPill({ children, tone = "default" }) {
  const toneClasses = {
    default: "bg-[var(--panel-muted)] text-[var(--text-secondary)]",
    success: "bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
    info: "bg-[var(--accent-soft)] text-[var(--accent)]",
    warning: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-text)]"
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export default StatusPill;
