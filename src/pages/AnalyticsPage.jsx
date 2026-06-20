import { useState } from "react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import MetricCard from "../components/common/MetricCard";
import SectionHeader from "../components/common/SectionHeader";
import OverallProgressChart from "../components/charts/OverallProgressChart";
import SkillsProgressChart from "../components/charts/SkillsProgressChart";
import StatusDonutChart from "../components/charts/StatusDonutChart";
import { useToasts } from "../contexts/ToastContext";
import useCollection from "../hooks/useCollection";
import useGitHubData from "../hooks/useGitHubData";
import { useAuth } from "../contexts/AuthContext";
import {
  buildGoalStatusData,
  buildOverallProgressData,
  buildProjectHealthData,
  buildSkillsProgressData
} from "../utils/analytics";
import { generateDevDNAPdfReport } from "../utils/pdfReport";
import { calculateAverageProgress } from "../utils/formatters";
import { normalizeGitHubUsername } from "../utils/githubUsername";

const GOAL_COLORS = {
  Completed: "#22c55e",
  "In Progress": "var(--accent)",
  Pending: "#f59e0b"
};

const PROJECT_HEALTH_COLORS = {
  Healthy: "#22c55e",
  Warning: "#f59e0b",
  Critical: "#ef4444"
};

function AnalyticsPage() {
  const { profile } = useAuth();
  const { pushToast } = useToasts();
  const skills = useCollection("skills");
  const goals = useCollection("learning_goals");
  const projects = useCollection("projects");
  const github = useGitHubData(profile?.github_username);
  const [exporting, setExporting] = useState(false);

  const averageProgress = calculateAverageProgress(skills.items);
  const completedGoals = goals.items.filter((goal) => goal.status === "Completed").length;
  const inProgressGoals = goals.items.filter((goal) => goal.status === "In Progress").length;
  const pendingGoals = goals.items.filter((goal) => goal.status === "Planned").length;
  const deliveryHealth = projects.items.filter((project) => project.health === "Green").length;
  const warningProjects = projects.items.filter((project) => project.health === "Yellow").length;
  const criticalProjects = projects.items.filter((project) => project.health === "Red").length;

  const activeDays = github.stats?.activeDays ?? 0;
  const hasGitHubUsername = Boolean(normalizeGitHubUsername(profile?.github_username));
  const chartLoading =
    skills.loading || goals.loading || projects.loading || (hasGitHubUsername && github.loading);
  const skillsProgressData = buildSkillsProgressData(skills.items);
  const goalsStatusData = buildGoalStatusData(goals.items);
  const projectHealthData = buildProjectHealthData(projects.items);
  const overallProgressData = buildOverallProgressData(
    skills.items,
    goals.items,
    projects.items,
    github.stats
  );

  async function handleExportPdf() {
    setExporting(true);

    try {
      generateDevDNAPdfReport({
        profile,
        skills: skills.items,
        goals: goals.items,
        projects: projects.items,
        github,
        analytics: {
          totalSkills: skills.items.length,
          averageProgress,
          totalGoals: goals.items.length,
          completedGoals,
          inProgressGoals,
          pendingGoals,
          totalProjects: projects.items.length,
          healthyProjects: deliveryHealth,
          warningProjects,
          criticalProjects,
          overallProgressData
        }
      });

      pushToast({
        title: "PDF report downloaded successfully.",
        description: "Your DevDNA report is ready to share."
      });
    } catch (error) {
      pushToast({
        title: "Unable to generate PDF report.",
        description: error.message || "Please try again."
      });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6 xl:space-y-7">
      <SectionHeader
        eyebrow="Analytics"
        title="Analytics overview"
        description="Track progress across skills, learning goals, projects, and GitHub activity."
        action={
          <Button
            variant="secondary"
            disabled={exporting}
            onClick={handleExportPdf}
          >
            {exporting ? "Generating PDF..." : "Export PDF Report"}
          </Button>
        }
      />

      <Card className="overflow-hidden p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Analytics overview
            </span>
            <h3 className="mt-4 text-2xl font-semibold leading-tight sm:text-[2rem]">
              Monitor progress across learning, delivery health, and recent coding activity.
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              Track skills, learning goals, project health, and GitHub activity using visual charts and progress metrics.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SignalPill
              label="Skills tracked"
              value={skills.items.length}
              detail={`${averageProgress}% average progress`}
            />
            <SignalPill
              label="Goal completion"
              value={`${goals.items.length ? Math.round((completedGoals / goals.items.length) * 100) : 0}%`}
              detail={`${completedGoals} completed`}
            />
            <SignalPill
              label="Healthy projects"
              value={`${projects.items.length ? Math.round((deliveryHealth / projects.items.length) * 100) : 0}%`}
              detail={`${deliveryHealth} healthy`}
            />
            <SignalPill
              label="GitHub activity"
              value={
                github.error
                  ? "Unavailable"
                  : !hasGitHubUsername
                    ? "Not connected"
                    : `${activeDays} day${activeDays === 1 ? "" : "s"}`
              }
              detail={
                github.error
                  ? github.error
                  : "Recent public push activity"
              }
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Average skill progress"
          value={`${averageProgress}%`}
          trend="Skills"
          tone="positive"
          hint="Average completion level across tracked skills."
        />
        <MetricCard
          label="Completed goals"
          value={completedGoals}
          trend="Learning goals"
          hint="Goals currently marked as completed."
        />
        <MetricCard
          label="Healthy projects"
          value={deliveryHealth}
          trend="Projects"
          hint="Projects currently in a healthy state."
        />
        <MetricCard
          label="Recent GitHub activity"
          value={
            github.error
              ? "Unavailable"
              : !hasGitHubUsername
                ? "Not connected"
                : github.loading
                  ? "Loading..."
                  : (github.stats?.recentEvents ?? 0)
          }
          trend={github.error ? "Error" : "GitHub"}
          tone={github.error ? "warning" : "default"}
          hint={github.error || undefined}
        />
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <OverallProgressChart
          data={overallProgressData}
          loading={chartLoading}
          githubConnected={hasGitHubUsername}
        />
        <StatusDonutChart
          title="Project health"
          description="Review delivery confidence across tracked projects with a clean status split."
          data={projectHealthData}
          colors={PROJECT_HEALTH_COLORS}
          loading={chartLoading}
          emptyTitle="No projects to assess yet"
          emptyDescription="Add projects and update their health to visualize portfolio delivery confidence."
        />
      </div>

      <div className="grid items-stretch gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SkillsProgressChart data={skillsProgressData} loading={chartLoading} />
        <StatusDonutChart
          title="Learning goal status"
          description="See how your roadmap is split across completed, active, and pending goals."
          data={goalsStatusData}
          colors={GOAL_COLORS}
          loading={chartLoading}
          emptyTitle="No learning goals to chart yet"
          emptyDescription="Add learning goals to visualize your current learning pipeline."
        />
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeader
          eyebrow="Presentation notes"
          title="What this dashboard communicates"
          description="Use these signals to explain your current momentum during interviews, reviews, and demos."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Recommendation
            title="Skills depth"
            description="Shows where your strongest technical confidence sits right now."
          />
          <Recommendation
            title="Learning discipline"
            description="Highlights whether goals are being completed or accumulating in backlog."
          />
          <Recommendation
            title="Delivery reliability"
            description="Makes project health easy to understand for reviewers at a glance."
          />
          <Recommendation
            title="Public coding rhythm"
            description="Uses GitHub activity as a lightweight signal of recent engineering consistency."
          />
        </div>
      </Card>
    </div>
  );
}

function SignalPill({ label, value, detail }) {
  return (
    <div className="flex h-full min-w-0 flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 truncate text-xl font-semibold text-[var(--text-primary)]" title={String(value)}>
        {value}
      </p>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)]" title={detail}>
        {detail}
      </p>
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
