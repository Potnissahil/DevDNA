import Card from "./Card";

function MetricCard({ label, value, hint, trend, tone = "default" }) {
  const trendClasses = {
    positive: "bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
    warning: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-text)]",
    default: "bg-[var(--panel-muted)] text-[var(--text-secondary)]"
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">
            {value}
          </p>
        </div>
        {trend ? (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${trendClasses[tone]}`}
          >
            {trend}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{hint}</p>
      ) : null}
    </Card>
  );
}

export default MetricCard;
