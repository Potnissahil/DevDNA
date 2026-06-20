import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ChartShell from "./ChartShell";

function SkillsProgressChart({ data, loading = false, compact = false }) {
  const isEmpty = !data.length;
  const chartHeight = Math.max(data.length * 48, compact ? 220 : 260);

  return (
    <ChartShell
      title="Skills progress"
      description="Track current skill maturity with progress sorted from strongest to weakest."
      loading={loading}
      empty={isEmpty}
      emptyTitle="No skills to visualize yet"
      emptyDescription="Add skills with progress values to unlock your progress chart."
      minHeight={compact ? "min-h-[320px]" : "min-h-[380px]"}
    >
      <div
        className="h-full"
        role="img"
        aria-label="Horizontal bar chart showing skill names and progress percentages."
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 24, left: compact ? 0 : 12, bottom: 0 }}
            barCategoryGap={18}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={compact ? 84 : 120}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-primary)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "color-mix(in srgb, var(--accent-soft) 45%, transparent)" }}
              contentStyle={{
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text-primary)"
              }}
              formatter={(value) => [`${value}%`, "Progress"]}
            />
            <Bar dataKey="progress" radius={[0, 10, 10, 0]} maxBarSize={26}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.progress >= 75
                      ? "var(--accent)"
                      : entry.progress >= 50
                        ? "var(--accent-2)"
                        : "color-mix(in srgb, var(--accent) 65%, white)"
                  }
                />
              ))}
              <LabelList
                dataKey="progress"
                position="right"
                formatter={(value) => `${value}%`}
                style={{ fill: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export default SkillsProgressChart;
