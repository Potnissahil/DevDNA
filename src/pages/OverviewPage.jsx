import Card from "../components/common/Card";
import MetricCard from "../components/common/MetricCard";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/feedback/EmptyState";
import SkeletonCard from "../components/feedback/SkeletonCard";
import useCollection from "../hooks/useCollection";
import useGitHubData from "../hooks/useGitHubData";
import { useAuth } from "../contexts/AuthContext";
import { calculateAverageProgress, formatDate, initialsFromName } from "../utils/formatters";
import { normalizeGitHubUsername } from "../utils/githubUsername";

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

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Command Center"
        title="Overview dashboard"
        description="Track product momentum, skill growth, learning execution, and repository health from one executive view."
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
                Production-ready engineering growth workspace
              </span>
              <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                Build a measurable developer growth system instead of another static dashboard.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
                DevDNA connects learning goals, skill maturity, delivery projects,
                and GitHub behavior so individuals and engineering leaders can make
                sharper roadmap decisions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MiniStat label="Profile" value={profile?.role || "Engineer"} />
              <MiniStat
                label="GitHub"
                value={profile?.github_username || "Not connected"}
              />
              <MiniStat label="Avg skill progress" value={`${progressAverage}%`} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent-soft)] text-xl font-semibold text-[var(--accent)]">
              {initialsFromName(profile?.full_name || "Dev DNA")}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{profile?.full_name || "Profile"}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{profile?.role}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-4">
            <Row label="Bio" value={profile?.bio || "Add a short professional summary."} />
            <Row
              label="GitHub username"
              value={profile?.github_username || "Set one in your profile page"}
            />
          </dl>
        </Card>
      </div>

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
            trend={`${progressAverage}% avg`}
            tone="positive"
            hint="Maturity progression across your active technical focus areas."
          />
          <MetricCard
            label="Goals in motion"
            value={activeGoals}
            trend={`${goals.items.length} total`}
            hint="Learning goals that still need active execution."
          />
          <MetricCard
            label="Projects tracked"
            value={projects.items.length}
            trend={`${projects.items.filter((project) => project.health === "Green").length} healthy`}
            tone="positive"
            hint="Projects currently mapped in your product and delivery workspace."
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
              "Repository footprint and recent public activity from GitHub."
            }
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <SectionHeader
            eyebrow="Learning Momentum"
            title="Active goal timeline"
            description="Each goal is connected to a clear target date and delivery intent."
          />
          <div className="mt-6 space-y-4">
            {goals.items.length ? (
              goals.items.slice(0, 4).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
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
                description="Add your first goal in the Learning dashboard to start tracking progress."
              />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader
            eyebrow="GitHub Snapshot"
            title="Language footprint"
            description="A quick view of the technologies showing up across the connected GitHub account."
          />
          <div className="mt-6 space-y-4">
            {github.loading ? (
              <SkeletonCard />
            ) : github.error ? (
              <EmptyState
                title="GitHub data unavailable"
                description={github.error}
              />
            ) : !hasGitHubUsername ? (
              <EmptyState
                title="Connect a GitHub username"
                description="Add your GitHub username in the Profile page to unlock repository analytics."
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
                title="No language data yet"
                description="This GitHub account has no public repositories with a primary language to display."
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)] p-4">
      <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="border-b border-[var(--border)] pb-4 last:border-none last:pb-0">
      <dt className="text-sm text-[var(--text-secondary)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium leading-6 text-[var(--text-primary)]">
        {value}
      </dd>
    </div>
  );
}

export default OverviewPage;
