import env from "../lib/env";

function buildHeaders() {
  const headers = { Accept: "application/vnd.github+json" };
  if (env.githubToken) {
    headers.Authorization = `Bearer ${env.githubToken}`;
  }
  return headers;
}

async function request(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers: buildHeaders() });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "GitHub request failed");
  }
  return response.json();
}

export async function fetchGitHubSnapshot(username) {
  if (!username) {
    return { profile: null, repositories: [], events: [], languageBreakdown: [], stats: null };
  }

  const [profile, repositories, events] = await Promise.all([
    request(`/users/${username}`),
    request(`/users/${username}/repos?per_page=100&sort=updated`),
    request(`/users/${username}/events/public?per_page=100`)
  ]);

  const languages = repositories.reduce((accumulator, repository) => {
    if (repository.language) {
      accumulator[repository.language] = (accumulator[repository.language] || 0) + 1;
    }
    return accumulator;
  }, {});

  const pushEvents = events.filter((event) => event.type === "PushEvent");
  const activityDays = new Set(
    pushEvents.map((event) => new Date(event.created_at).toISOString().slice(0, 10))
  );

  const stats = {
    repoCount: repositories.length,
    stars: repositories.reduce((sum, repository) => sum + repository.stargazers_count, 0),
    forks: repositories.reduce((sum, repository) => sum + repository.forks_count, 0),
    recentEvents: events.length,
    pushEvents: pushEvents.length,
    activeDays: activityDays.size
  };

  const languageBreakdown = Object.entries(languages)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  return { profile, repositories, events, languageBreakdown, stats };
}
