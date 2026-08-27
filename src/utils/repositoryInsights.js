const DAY_MS = 24 * 60 * 60 * 1000;

export const MAINTENANCE_DAYS = 90;
export const RECENT_ACTIVITY_DAYS = 30;
export const STALE_DAYS = 365;

function toNonNegativeInt(value) {
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function daysSince(value, now) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return null;
  }

  return Math.max(0, Math.ceil((now - time) / DAY_MS));
}

function emptyInsights() {
  return {
    repoCount: 0,
    activeCount: 0,
    staleCount: 0,
    assessedMaintenanceCount: 0,
    recentlyActive: [],
    needsAttention: [],
    archivedCount: 0,
    forkedCount: 0,
    reposWithIssuesCount: 0,
    totalOpenIssues: 0,
    presentedCount: 0,
    withDescriptionCount: 0,
    withHomepageCount: 0,
    withTopicsCount: 0,
    presentationRate: null,
    totalStars: 0,
    totalForks: 0,
    totalSizeKb: 0,
    reposWithSizeCount: 0,
    mostStarred: null,
    mostForked: null,
    oldest: null,
    newest: null
  };
}

export function computeRepositoryInsights(repositories) {
  if (!Array.isArray(repositories) || repositories.length === 0) {
    return emptyInsights();
  }

  const now = Date.now();
  let totalStars = 0;
  let totalForks = 0;
  let totalOpenIssues = 0;
  let totalSizeKb = 0;
  let reposWithSizeCount = 0;
  let activeCount = 0;
  let staleCount = 0;
  let assessedMaintenanceCount = 0;
  let archivedCount = 0;
  let forkedCount = 0;
  let reposWithIssuesCount = 0;
  let withDescriptionCount = 0;
  let withHomepageCount = 0;
  let withTopicsCount = 0;
  let presentedCount = 0;
  let mostStarred = null;
  let mostForked = null;
  let oldest = null;
  let newest = null;
  const recentlyActive = [];
  const needsAttention = [];

  for (const repository of repositories) {
    if (!repository) {
      continue;
    }

    const stars = toNonNegativeInt(repository.stargazers_count);
    if (stars !== null) {
      totalStars += stars;
      if (!mostStarred || stars > mostStarred.stargazers_count) {
        mostStarred = repository;
      }
    }

    const forks = toNonNegativeInt(repository.forks_count);
    if (forks !== null) {
      totalForks += forks;
      if (!mostForked || forks > mostForked.forks_count) {
        mostForked = repository;
      }
    }

    const openIssues = toNonNegativeInt(repository.open_issues_count);
    if (openIssues !== null) {
      totalOpenIssues += openIssues;
      if (openIssues > 0) {
        reposWithIssuesCount += 1;
      }
    }

    const sizeKb = toNonNegativeInt(repository.size);
    if (sizeKb !== null) {
      totalSizeKb += sizeKb;
      reposWithSizeCount += 1;
    }

    if (repository.archived === true) {
      archivedCount += 1;
    }

    if (repository.fork === true) {
      forkedCount += 1;
    }

    const description = hasText(repository.description);
    const homepage = hasText(repository.homepage);
    const topics = Array.isArray(repository.topics) && repository.topics.length > 0;
    if (description) {
      withDescriptionCount += 1;
    }
    if (homepage) {
      withHomepageCount += 1;
    }
    if (topics) {
      withTopicsCount += 1;
    }
    if (description && homepage) {
      presentedCount += 1;
    }

    const pushedDays = daysSince(repository.pushed_at, now);
    if (pushedDays !== null) {
      assessedMaintenanceCount += 1;
      if (pushedDays <= MAINTENANCE_DAYS) {
        activeCount += 1;
        if (pushedDays <= RECENT_ACTIVITY_DAYS && repository.archived !== true) {
          recentlyActive.push(repository);
        }
      } else if (pushedDays > STALE_DAYS && repository.archived !== true) {
        staleCount += 1;
        needsAttention.push({ ...repository, _reason: "stale" });
      }
    }

    if (repository.archived === true) {
      needsAttention.push({ ...repository, _reason: "archived" });
    }

    const created = repository.created_at ? new Date(repository.created_at).getTime() : NaN;
    if (!Number.isNaN(created)) {
      if (!oldest || created < new Date(oldest.created_at).getTime()) {
        oldest = repository;
      }
      if (!newest || created > new Date(newest.created_at).getTime()) {
        newest = repository;
      }
    }
  }

  recentlyActive.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  needsAttention.sort((a, b) => {
    const aRank = a._reason === "archived" ? 0 : 1;
    const bRank = b._reason === "archived" ? 0 : 1;
    if (aRank !== bRank) {
      return aRank - bRank;
    }
    return new Date(a.pushed_at) - new Date(b.pushed_at);
  });

  return {
    repoCount: repositories.length,
    activeCount,
    staleCount,
    assessedMaintenanceCount,
    recentlyActive: recentlyActive.slice(0, 3),
    needsAttention: needsAttention.slice(0, 3),
    archivedCount,
    forkedCount,
    reposWithIssuesCount,
    totalOpenIssues,
    presentedCount,
    withDescriptionCount,
    withHomepageCount,
    withTopicsCount,
    presentationRate:
      repositories.length > 0
        ? Math.round((presentedCount / repositories.length) * 100)
        : null,
    totalStars,
    totalForks,
    totalSizeKb,
    reposWithSizeCount,
    mostStarred,
    mostForked,
    oldest,
    newest
  };
}