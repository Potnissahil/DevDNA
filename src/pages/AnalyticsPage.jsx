import Card from "../components/common/Card";
import MetricCard from "../components/common/MetricCard";
import SectionHeader from "../components/common/SectionHeader";
import useCollection from "../hooks/useCollection";
import useGitHubData from "../hooks/useGitHubData";
import { useAuth } from "../contexts/AuthContext";
import { calculateAverageProgress } from "../utils/formatters";

function AnalyticsPage() {
  const { profile } = useAuth();
  const skills = useCollection("skills");
  const goals = useCollection("learning_goals");
  const projects = useCollection("projects");
  const github = useGitHubData(profile?.github_username);

  const averageProgress = calculateAverageProgress(skills.items);
  const completedGoals = goals.items.filter((goal) => goal.status === "Completed").length;
  const deliveryHealth = projects.items.filter((project) => project.health === "Green").length;

  const trendRows = [
    {
      label: "Skill maturity",
      value: averageProgress,
      detail: "Average progress across all tracked skills"
    },
    {
      label: "Goal completion",
      value: goals.items.length ? Math.round((completedGoals / goals.items.length) * 100) : 0,
      detail: "Share of learning goals marked completed"
    },
    {
      label: "Project health",
      value: projects.items.length ? Math.round((deliveryHealth / projects.items.length) * 100) : 0,
      detail: "Share of tracked projects currently healthy"
    },
    {
      label: "GitHub activity days",
      value: github.stats?.activeDays || 0,
      detail: "Recent days with public push events"
    }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Analytics"
        title="Cross-workspace performance dashboard"
        description="A product-level view of execution, learning, and repository momentum for the connected user."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Average skill progress"
          value={`${averageProgress}%`}
          trend="Capability"
          tone="positive"
        />
        <MetricCard label="Completed goals" value={completedGoals} trend="Execution" />
        <MetricCard label="Healthy projects" value={deliveryHealth} trend="Delivery" />
        <MetricCard
          label="Public activity events"
          value={github.stats?.recentEvents ?? 0}
          trend="GitHub"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <SectionHeader
            eyebrow="Trend Radar"
            title="Progress index"
            description="Each bar visualizes an important operating metric on a 0-100 scale."
          />
          <div className="mt-6 space-y-5">
            {trendRows.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{row.label}</p>
                    <p className="text-[var(--text-secondary)]">{row.detail}</p>
                  </div>
                  <span className="font-semibold text-[var(--accent)]">{row.value}%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-[var(--panel-muted)]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                    style={{ width: `${Math.min(row.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader
            eyebrow="Recommendations"
            title="Next best actions"
            description="Operational suggestions generated from the current state of the workspace."
          />
          <div className="mt-6 space-y-4">
            <Recommendation
              title="Improve skill completion consistency"
              description="Raise average progress above 80% by narrowing the number of simultaneous focus areas."
            />
            <Recommendation
              title="Stabilize your project portfolio"
              description="Move yellow or red projects into a clearly owned remediation plan before adding new initiatives."
            />
            <Recommendation
              title="Keep GitHub analytics connected"
              description="Set a GitHub username in Profile and optionally add a token for higher API limits."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Recommendation({ title, description }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4">
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
    </article>
  );
}

export default AnalyticsPage;
