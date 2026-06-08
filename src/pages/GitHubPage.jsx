import Card from "../components/common/Card";
import Button from "../components/common/Button";
import MetricCard from "../components/common/MetricCard";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/feedback/EmptyState";
import SkeletonCard from "../components/feedback/SkeletonCard";
import useGitHubData from "../hooks/useGitHubData";
import { useAuth } from "../contexts/AuthContext";
import { formatDate } from "../utils/formatters";

function GitHubPage() {
  const { profile } = useAuth();
  const github = useGitHubData(profile?.github_username);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="GitHub Integration"
        title="Engineering activity dashboard"
        description="Repository inventory, language usage, activity patterns, and public event signals from GitHub."
        action={
          <Button variant="secondary" onClick={github.reload}>
            Refresh data
          </Button>
        }
      />

      {!profile?.github_username ? (
        <EmptyState
          title="GitHub username required"
          description="Set your GitHub username in Profile to start pulling repositories, activity, and language analytics."
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
                description={github.profile?.bio || "Public GitHub account summary"}
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
                title="Tech stack distribution"
                description="A quick view of the dominant languages across public repositories."
              />
              <div className="mt-6 space-y-4">
                {github.languageBreakdown.slice(0, 6).map((language) => {
                  const max = github.languageBreakdown[0]?.count || 1;
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
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <SectionHeader
              eyebrow="Repositories"
              title="Most recently updated repositories"
              description="Useful for spotting active work, ecosystem spread, and code ownership patterns."
            />
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {github.repositories.slice(0, 8).map((repository) => (
                <a
                  key={repository.id}
                  href={repository.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4 transition hover:-translate-y-0.5 hover:border-[var(--accent)]/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {repository.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {repository.description || "No description provided."}
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
        </>
      )}
    </div>
  );
}

function ProfileStat({ label, value }) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-muted)]/45 p-4">
      <dt className="text-sm text-[var(--text-secondary)]">{label}</dt>
      <dd className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

export default GitHubPage;
