import Card from "./Card";

function MetricCard({ label, value, hint, trend, tone = "default" }) {
  const trendClasses = {
    positive: "bg-[var(--tone-success-bg)] text-[var(--tone-success-text)]",
    warning: "bg-[var(--tone-warning-bg)] text-[var(--tone-warning-text)]",
    default: "bg-[var(--panel-muted)] text-[var(--text-secondary)]"
  };

  return (
    <Card className="h-full p-5 transition duration-200 hover:-translate-y-0.5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            {label}
          </p>
          <p className="mt-2 break-words bg-[linear-gradient(120deg,var(--text-primary),color-mix(in_srgb,var(--accent)_78%,var(--text-primary)))] bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            {value}
          </p>
        </div>
        {trend ? (
          <span
            className={`max-w-full self-start whitespace-normal rounded-full px-3 py-1 text-xs font-semibold leading-5 ${trendClasses[tone]}`}
          >
            {trend}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{hint}</p>
      ) : null}
    </Card>
  );
}

export default MetricCard;
