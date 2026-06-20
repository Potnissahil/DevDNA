import Card from "../components/common/Card";
import MetricCard from "../components/common/MetricCard";
import SectionHeader from "../components/common/SectionHeader";
import SkillsProgressChart from "../components/charts/SkillsProgressChart";
import StatusDonutChart from "../components/charts/StatusDonutChart";
import EmptyState from "../components/feedback/EmptyState";
import SkeletonCard from "../components/feedback/SkeletonCard";
import useCollection from "../hooks/useCollection";
import useGitHubData from "../hooks/useGitHubData";
import { useAuth } from "../contexts/AuthContext";
import { buildGoalStatusData, buildSkillsProgressData } from "../utils/analytics";
import { calculateAverageProgress, formatDate, initialsFromName } from "../utils/formatters";
import { normalizeGitHubUsername } from "../utils/githubUsername";

const GOAL_COLORS = {
  Completed: "#22c55e",
  "In Progress": "var(--accent)",
  Pending: "#f59e0b"
};

function OverviewPage() {
  const { profile } = useAuth();
  const skills = useCollection("skills");
  const goals = useCollection("learning_goals");
  const projects = useCollection("projects");
  const github = useGitHubData(profile?.github_username);

  const loading = skills.loading || goals.loading || projects.loading;
  const activeGoals = goals.items.filter((goal) => goal.status !== "Completed").length;
  const progressAverage = calculateAverageProgress(skills.items);
  const hasGitHubUsername = Boolean(normalizeGitHubUsername(profile?.github_username));
  const skillsProgressData = buildSkillsProgressData(skills.items).slice(0, 5);
  const goalsStatusData = buildGoalStatusData(goals.items);

  return (
    <div className="space-y-6 xl:space-y-7">
      <SectionHeader
        eyebrow="Dashboard"
        title="Project overview"
        description="See your skills, learning goals, projects, and GitHub activity in one place."
      />

      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <Card className="overflow-hidden p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Dashboard focus
              </span>
              <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-[2rem]">
                Track progress, priorities, and portfolio signals at a glance.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
                Review your current learning momentum, project coverage, and GitHub visibility from one compact workspace.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:self-stretch">
              <HeroKpiCard
                label="Profile"
                value={profile?.role || "Engineer"}
                meta={profile?.full_name || "Update your profile"}
              />
              <HeroKpiCard
                label="GitHub"
                value={profile?.github_username || "Not connected"}
                meta={hasGitHubUsername ? "Connected for analytics" : "Add username in Profile"}
              />
              <HeroKpiCard
                label="Average progress"
                value={`${progressAverage}%`}
                meta={`${skills.items.length} skills tracked`}
                tone="accent"
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-base font-semibold text-[var(--accent)]">
              {initialsFromName(profile?.full_name || "Dev DNA")}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{profile?.full_name || "Profile"}</h3>
              <p className="truncate text-sm text-[var(--text-secondary)]">{profile?.role}</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <CompactRow
              label="GitHub username"
              value={profile?.github_username || "Set one in profile"}
            />
            <CompactRow
              label="Profile status"
              value={profile?.bio ? "Professional summary added" : "Add a short summary"}
            />
            <WideRow
              label="Bio"
              value={profile?.bio || "Add a short professional summary to strengthen your dashboard overview."}
            />
          </dl>
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <SectionHeader
          eyebrow="Progress snapshot"
          title="Compact progress snapshot"
          description="Quickly compare top skill growth and the current mix of learning goals."
        />
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <SkillsProgressChart data={skillsProgressData} loading={loading} compact />
          <StatusDonutChart
            title="Learning goal status"
            description="A compact breakdown of completed, active, and pending learning goals."
            data={goalsStatusData}
            colors={GOAL_COLORS}
            loading={loading}
            emptyTitle="No goals to chart yet"
            emptyDescription="Add learning goals to see how your roadmap is progressing."
            compact
          />
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <MetricCard
            label="Skills tracked"
            value={skills.items.length}
            trend={`${progressAverage}% average`}
            tone="positive"
            hint="Progress across the skills you are currently tracking."
          />
          <MetricCard
            label="Goals in motion"
            value={activeGoals}
            trend={`${goals.items.length} total`}
            hint="Learning goals that are still in progress."
          />
          <MetricCard
            label="Projects tracked"
            value={projects.items.length}
            trend={`${projects.items.filter((project) => project.health === "Green").length} healthy`}
            tone="positive"
            hint="Projects currently added to your workspace."
          />
          <MetricCard
            label="GitHub repos"
            value={
              github.error
                ? "Unavailable"
                : !hasGitHubUsername
                  ? "Not connected"
                  : github.loading
                    ? "Loading..."
                    : (github.stats?.repoCount ?? 0)
            }
            trend={
              github.error
                ? "Error"
                : !hasGitHubUsername || github.loading
                  ? "GitHub"
                  : `${github.stats?.recentEvents ?? 0} events`
            }
            tone={github.error ? "warning" : "default"}
            hint={
              github.error ||
              "Repository visibility and recent public activity from GitHub."
            }
          />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <SectionHeader
            eyebrow="Learning goals"
            title="Current goals"
            description="Review your active learning goals and upcoming target dates."
          />
          <div className="mt-5 space-y-3">
            {goals.items.length ? (
              goals.items.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{goal.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {goal.notes}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-[var(--accent)]">
                      {formatDate(goal.target_date)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No learning goals yet"
                description="Add a learning goal to begin planning your progress."
              />
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <SectionHeader
            eyebrow="GitHub activity"
            title="Language summary"
            description="See the languages used in the connected GitHub account."
          />
          <div className="mt-5 space-y-3">
            {github.loading ? (
              <SkeletonCard />
            ) : github.error ? (
              <EmptyState
                title="GitHub data unavailable"
                description={github.error}
              />
            ) : !hasGitHubUsername ? (
              <EmptyState
                title="No GitHub username connected"
                description="Add your GitHub username in Profile to view repository activity."
              />
            ) : github.languageBreakdown.length ? (
              github.languageBreakdown.slice(0, 5).map((language) => {
                const max = github.languageBreakdown[0].count || 1;
                return (
                  <div key={language.language}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{language.language}</span>
                      <span className="text-[var(--text-secondary)]">
                        {language.count} repos
                      </span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-[var(--panel-muted)]">
                      <div
                        className="h-3 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
                        style={{ width: `${(language.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No language data available"
                description="This GitHub account does not have public repositories with language data to display."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function HeroKpiCard({ label, value, meta, tone = "default" }) {
  const toneClass =
    tone === "accent"
      ? "border-[color:var(--accent)]/20 bg-[var(--accent-soft)]/70"
      : "border-[var(--border)] bg-[var(--panel-muted)]/55";

  return (
    <div className={`flex h-full min-w-0 flex-col justify-between rounded-[26px] border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-2 truncate text-lg font-semibold leading-tight text-[var(--text-primary)]" title={value}>
        {value}
      </p>
      <p className="mt-2 truncate text-xs leading-5 text-[var(--text-secondary)]" title={meta}>
        {meta}
      </p>
    </div>
  );
}

function CompactRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)]/35 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium leading-6 text-[var(--text-primary)]" title={value}>
        {value}
      </dd>
    </div>
  );
}

function WideRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)]/35 px-4 py-3 sm:col-span-2">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-6 text-[var(--text-primary)]">
        {value}
      </dd>
    </div>
  );
}

export default OverviewPage;
