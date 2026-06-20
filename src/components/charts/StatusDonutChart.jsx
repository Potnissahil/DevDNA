import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartShell from "./ChartShell";
import { sumChartValues } from "../../utils/analytics";

function StatusDonutChart({
  title,
  description,
  data,
  colors,
  loading = false,
  compact = false,
  emptyTitle,
  emptyDescription
}) {
  const total = sumChartValues(data);

  return (
    <ChartShell
      title={title}
      description={description}
      loading={loading}
      empty={!total}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      footer={
        total ? (
          <div className="flex items-center justify-between rounded-2xl bg-[var(--panel)] px-4 py-3">
            <span className="text-sm text-[var(--text-secondary)]">Total items</span>
            <span className="text-lg font-semibold text-[var(--text-primary)]">{total}</span>
          </div>
        ) : null
      }
      minHeight={compact ? "min-h-[320px]" : "min-h-[360px]"}
    >
      <div className="grid h-full gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div
          className={compact ? "h-[200px]" : "h-[220px]"}
          role="img"
          aria-label={`${title} donut chart with category counts.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={compact ? 54 : 62}
                outerRadius={compact ? 82 : 92}
                paddingAngle={4}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={colors[entry.name] || "var(--accent)"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  background: "var(--panel)",
                  color: "var(--text-primary)"
                }}
                formatter={(value, name) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: colors[item.name] || "var(--accent)" }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--text-secondary)]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}

export default StatusDonutChart;
