import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartShell from "./ChartShell";

const BAR_COLORS = ["var(--accent)", "var(--accent-2)", "#22c55e", "#f59e0b"];

function OverallProgressChart({ data, loading = false, githubConnected = false }) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <ChartShell
      title="Overall progress summary"
      description="A high-level 0-100 view of skills, goals, project health, and recent GitHub activity."
      loading={loading}
      empty={!hasData && !githubConnected}
      emptyTitle="No summary metrics available yet"
      emptyDescription="Add skills, goals, projects, or connect GitHub to populate the progress summary."
      minHeight="min-h-[380px]"
    >
      <div
        className="h-[280px]"
        role="img"
        aria-label="Bar chart comparing overall progress across skills, goals, projects, and GitHub."
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 20,
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text-primary)"
              }}
              formatter={(value, _name, payload) => [`${value}%`, payload?.payload?.detail || "Progress"]}
            />
            <Bar dataKey="value" radius={[12, 12, 4, 4]} maxBarSize={56}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}

export default OverallProgressChart;
