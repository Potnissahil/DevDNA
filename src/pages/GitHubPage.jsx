import Card from "../components/common/Card";
import Button from "../components/common/Button";
import MetricCard from "../components/common/MetricCard";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/feedback/EmptyState";
import SkeletonCard from "../components/feedback/SkeletonCard";
import useGitHubData from "../hooks/useGitHubData";
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../utils/formatters";
import {
  MAINTENANCE_DAYS,
  RECENT_ACTIVITY_DAYS
} from "../utils/repositoryInsights";

function GitHubPage() {
  const { profile } = useAuth();
  const github = useGitHubData(profile?.github_username);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="GitHub"
        title="GitHub Activity"
        description="View repository details, languages, and recent public activity from GitHub."
        action={
          <Button variant="secondary" onClick={github.reload}>
            Refresh data
          </Button>
        }
      />

      {!profile?.github_username ? (
        <EmptyState
          title="No GitHub username connected"
          description="Add your GitHub username in Profile to view repository activity."
        />
      ) : github.error ? (
        <EmptyState
          title="GitHub request failed"
          description={github.error}
          actionLabel="Try again"
          onAction={github.reload}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {github.loading ? (
              Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={index} />)
            ) : (
              <>
                <MetricCard label="Repositories" value={github.stats?.repoCount ?? 0} />
                <MetricCard label="Stars" value={github.stats?.stars ?? 0} />
                <MetricCard label="Forks" value={github.stats?.forks ?? 0} />
                <MetricCard label="Recent events" value={github.stats?.recentEvents ?? 0} />
                <MetricCard label="Push events" value={github.stats?.pushEvents ?? 0} />
              </>
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="p-6">
              <SectionHeader
                eyebrow="Profile"
                title={github.profile?.name || github.profile?.login || "GitHub profile"}
                description={github.profile?.bio || "Public GitHub profile summary"}
              />
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <ProfileStat label="Followers" value={github.profile?.followers ?? 0} />
                <ProfileStat label="Following" value={github.profile?.following ?? 0} />
                <ProfileStat label="Public repos" value={github.profile?.public_repos ?? 0} />
                <ProfileStat label="Joined" value={formatDate(github.profile?.created_at)} />
              </dl>
            </Card>

            <Card className="p-6">
              <SectionHeader
                eyebrow="Languages"
                title="Language distribution"
                description="A quick view of the main languages used in public repositories."
              />
              <div className="mt-6 space-y-4">
                {github.languageBreakdown.slice(0, 6).map((language) => {
                  const max = github.languageBreakdown[0]?.count || 1;
                  return (
                    <div key={language.language}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{language.language}</span>
                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                          {language.count} repos
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--panel-muted)]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] shadow-[0_0_14px_-4px_var(--accent)]"
                          style={{ width: `${(language.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <SectionHeader
              eyebrow="Contribution"
              title="Contribution & Coding Activity"
              description="Commit and activity metrics calculated from recent public push events. Based on the available public events window, not your full GitHub history."
            />

            {github.loading ? (
              <div className="mt-6">
                <SkeletonCard />
              </div>
            ) : !github.activity?.hasActivity ? (
              <div className="mt-6">
                <EmptyState
                  title="No recent coding activity available from GitHub"
                  description="The public events feed did not return recent push events for this account, so contribution metrics cannot be calculated."
                />
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard
                    label="Commits"
                    value={github.activity.totalCommits}
                    trend="Pushed"
                  />
                  <MetricCard
                    label="Active coding days"
                    value={github.activity.activeDays}
                    trend="Days"
                  />
                  <MetricCard
                    label="Current streak"
                    value={github.activity.currentStreak}
                    trend="Days"
                  />
                  <MetricCard
                    label="Longest streak"
                    value={github.activity.longestStreak}
                    trend="Days"
                  />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
                    Daily commits
                  </p>
                  <ActivityChart activity={github.activity} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <InfoPanel
                    label="Activity window"
                    value={`${formatDate(github.activity.eventWindowStart)} – ${formatDate(github.activity.eventWindowEnd)}`}
                    detail={`${github.activity.windowDays} day${github.activity.windowDays === 1 ? "" : "s"} of public events`}
                  />
                  <InfoPanel
                    label="Most active day"
                    value={github.activity.mostActiveDate ? formatDate(github.activity.mostActiveDate) : "—"}
                    detail={
                      github.activity.mostActiveCommits
                        ? `${github.activity.mostActiveCommits} commits`
                        : null
                    }
                  />
                  <InfoPanel
                    label="Push events"
                    value={github.activity.totalPushes}
                    detail="Public push events in the available window"
                  />
                </div>
              </>
            )}
          </Card>

          <Card className="p-6">
            <SectionHeader
              eyebrow="Repositories"
              title="Most recently updated repositories"
              description="Review recently updated repositories from the connected account."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {github.repositories.slice(0, 8).map((repository) => (
                <a
                  key={repository.id}
                  href={repository.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="tile p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {repository.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {repository.description || "No description available."}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {repository.language || "N/A"}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                    <span>★ {repository.stargazers_count}</span>
                    <span>⑂ {repository.forks_count}</span>
                    <span>Updated {formatDate(repository.updated_at)}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <SectionHeader
              eyebrow="Portfolio"
              title="Repository Quality & Portfolio Insights"
              description="Maintenance, presentation, and popularity signals computed from the repositories currently fetched from GitHub."
            />

            {github.loading ? (
              <div className="mt-6">
                <SkeletonCard />
              </div>
            ) : !github.repositoryInsights?.repoCount ? (
              <div className="mt-6">
                <EmptyState
                  title="No repository data available"
                  description="GitHub did not return repositories for this account, so quality and portfolio insights cannot be calculated."
                />
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <MetricCard
                    label="Active / maintained"
                    value={github.repositoryInsights.activeCount}
                    trend={`${MAINTENANCE_DAYS} days`}
                    hint={`Repos pushed within the last ${MAINTENANCE_DAYS} days.`}
                  />
                  <MetricCard
                    label="Archived"
                    value={github.repositoryInsights.archivedCount}
                    trend="Archived"
                    hint="Repos marked as archived on GitHub."
                  />
                  <MetricCard
                    label="Forked"
                    value={github.repositoryInsights.forkedCount}
                    trend="Forks"
                    hint="Repos forked from another account."
                  />
                  <MetricCard
                    label="Repos with issues"
                    value={github.repositoryInsights.reposWithIssuesCount}
                    trend={`${github.repositoryInsights.totalOpenIssues} open`}
                    hint="Repos with at least one open issue."
                  />
                  <MetricCard
                    label="Well-presented"
                    value={github.repositoryInsights.presentedCount}
                    trend={`${github.repositoryInsights.presentationRate ?? 0}%`}
                    hint="Repos with both a description and a homepage."
                  />
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <InsightPanel title="Popularity & age">
                    <RepoHighlight
                      repository={github.repositoryInsights.mostStarred}
                      badge={
                        github.repositoryInsights.mostStarred
                          ? `★ ${github.repositoryInsights.mostStarred.stargazers_count}`
                          : null
                      }
                      emptyLabel="No starred repository data"
                    />
                    <RepoHighlight
                      repository={github.repositoryInsights.mostForked}
                      badge={
                        github.repositoryInsights.mostForked
                          ? `⑂ ${github.repositoryInsights.mostForked.forks_count}`
                          : null
                      }
                      emptyLabel="No fork data available"
                    />
                    <RepoHighlight
                      repository={github.repositoryInsights.oldest}
                      badge={
                        github.repositoryInsights.oldest
                          ? formatDate(github.repositoryInsights.oldest.created_at)
                          : null
                      }
                      emptyLabel="No creation date data"
                    />
                    <RepoHighlight
                      repository={github.repositoryInsights.newest}
                      badge={
                        github.repositoryInsights.newest
                          ? formatDate(github.repositoryInsights.newest.created_at)
                          : null
                      }
                      emptyLabel="No creation date data"
                    />
                  </InsightPanel>

                  <InsightPanel title="Recently active">
                    {github.repositoryInsights.recentlyActive.length ? (
                      github.repositoryInsights.recentlyActive.map((repository) => (
                        <RepoHighlight
                          key={repository.id}
                          repository={repository}
                          badge={formatDate(repository.pushed_at)}
                        />
                      ))
                    ) : (
                      <div className="tile p-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                          No repositories pushed in the last {RECENT_ACTIVITY_DAYS} days.
                        </p>
                      </div>
                    )}
                  </InsightPanel>

                  <InsightPanel title="Needs attention">
                    {github.repositoryInsights.needsAttention.length ? (
                      github.repositoryInsights.needsAttention.map((repository) => (
                        <RepoHighlight
                          key={repository.id}
                          repository={repository}
                          badge={
                            repository._reason === "archived" ? "Archived" : "Stale"
                          }
                        />
                      ))
                    ) : (
                      <div className="tile p-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                          No stale or archived repositories in the fetched set.
                        </p>
                      </div>
                    )}
                  </InsightPanel>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <InfoPanel
                    label="Fetched scope"
                    value={`${github.repositoryInsights.repoCount} repositories`}
                    detail="Based on up to 100 most recently updated public repositories."
                  />
                  <InfoPanel
                    label="Presentation"
                    value={`${github.repositoryInsights.withDescriptionCount} described`}
                    detail={`${github.repositoryInsights.withHomepageCount} with homepage · ${github.repositoryInsights.withTopicsCount} with topics`}
                  />
                  <InfoPanel
                    label="Repository size"
                    value={
                      github.repositoryInsights.reposWithSizeCount
                        ? formatSizeKb(github.repositoryInsights.totalSizeKb)
                        : "No data available"
                    }
                    detail="GitHub-reported size, not exact source-code bytes."
                  />
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function ProfileStat({ label, value }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {label}
      </dt>
      <dd className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
        {value}
      </dd>
    </div>
  );
}

function ActivityChart({ activity }) {
  const maxCommits = Math.max(1, ...activity.dailyCounts.map((day) => day.commits));
  const minBarHeight = 4;

  return (
    <div className="overflow-x-auto">
      <div
        className="flex h-32 min-w-max items-end gap-1"
        role="img"
        aria-label="Daily commit activity across the available public events window"
      >
        {activity.dailyCounts.map((day) => {
          const height = day.pushes > 0 ? Math.max((day.commits / maxCommits) * 100, minBarHeight) : minBarHeight;
          return (
            <div
              key={day.date}
              title={`${day.date} · ${day.commits} commit${day.commits === 1 ? "" : "s"}`}
              className="flex h-full min-w-[10px] max-w-[36px] flex-1 flex-col justify-end"
            >
              <div
                className={
                  day.pushes > 0
                    ? "rounded-t-md bg-[linear-gradient(180deg,var(--accent),var(--accent-2))]"
                    : "rounded-t-md bg-[var(--panel-muted)]"
                }
                style={{ height: `${height}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
        <span>{formatDate(activity.eventWindowStart)}</span>
        <span>
          {activity.windowDays} day{activity.windowDays === 1 ? "" : "s"} shown
        </span>
        <span>{formatDate(activity.eventWindowEnd)}</span>
      </div>
    </div>
  );
}

function InfoPanel({ label, value, detail }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-1.5 font-semibold text-[var(--text-primary)]">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
      ) : null}
    </div>
  );
}

function InsightPanel({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RepoHighlight({ repository, badge, emptyLabel = "No data available" }) {
  if (!repository) {
    return (
      <div className="tile p-4">
        <p className="text-sm text-[var(--text-secondary)]">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <a
      href={repository.html_url}
      target="_blank"
      rel="noreferrer"
      className="tile flex items-center justify-between gap-3 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/40"
    >
      <p className="min-w-0 truncate font-semibold text-[var(--text-primary)]">
        {repository.name}
      </p>
      {badge ? (
        <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
          {badge}
        </span>
      ) : null}
    </a>
  );
}

function formatSizeKb(sizeKb) {
  if (!Number.isFinite(sizeKb) || sizeKb <= 0) {
    return "0 KB";
  }
  if (sizeKb >= 1024) {
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  }
  return `${sizeKb} KB`;
}

export default GitHubPage;
