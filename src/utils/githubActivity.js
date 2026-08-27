const DAY_MS = 24 * 60 * 60 * 1000;

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function emptyActivity() {
  return {
    totalCommits: 0,
    totalPushes: 0,
    activeDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    eventWindowStart: null,
    eventWindowEnd: null,
    windowDays: 0,
    mostActiveDate: null,
    mostActiveCommits: 0,
    dailyCounts: [],
    hasActivity: false
  };
}

export function computeGitHubActivity(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return emptyActivity();
  }

  let firstEvent = null;
  let lastEvent = null;
  const commitsByDate = new Map();
  const pushesByDate = new Map();

  for (const event of events) {
    if (!event?.created_at) {
      continue;
    }

    const time = new Date(event.created_at).getTime();
    if (Number.isNaN(time)) {
      continue;
    }

    if (firstEvent === null || time < firstEvent) {
      firstEvent = time;
    }
    if (lastEvent === null || time > lastEvent) {
      lastEvent = time;
    }

    if (event.type !== "PushEvent") {
      continue;
    }

    const date = toDateKey(new Date(time));
    pushesByDate.set(date, (pushesByDate.get(date) || 0) + 1);
    const commits = Array.isArray(event.payload?.commits) ? event.payload.commits.length : 0;
    commitsByDate.set(date, (commitsByDate.get(date) || 0) + commits);
  }

  if (firstEvent === null || lastEvent === null) {
    return emptyActivity();
  }

  const windowStart = new Date(firstEvent);
  const windowEnd = new Date(lastEvent);
  windowStart.setUTCHours(0, 0, 0, 0);
  windowEnd.setUTCHours(0, 0, 0, 0);
  const windowDays = Math.round((windowEnd - windowStart) / DAY_MS) + 1;

  const dailyCounts = [];
  let cursor = new Date(windowStart);
  while (cursor <= windowEnd) {
    const date = toDateKey(cursor);
    dailyCounts.push({
      date,
      commits: commitsByDate.get(date) || 0,
      pushes: pushesByDate.get(date) || 0
    });
    cursor = addDays(cursor, 1);
  }

  let longestStreak = 0;
  let running = 0;
  for (const day of dailyCounts) {
    if (day.pushes > 0) {
      running += 1;
      if (running > longestStreak) {
        longestStreak = running;
      }
    } else {
      running = 0;
    }
  }

  let currentStreak = 0;
  for (let i = dailyCounts.length - 1; i >= 0; i -= 1) {
    if (dailyCounts[i].pushes > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  let mostActiveDate = null;
  let mostActiveCommits = 0;
  for (const day of dailyCounts) {
    if (day.commits > mostActiveCommits) {
      mostActiveCommits = day.commits;
      mostActiveDate = day.date;
    }
  }

  const totalCommits = [...commitsByDate.values()].reduce((sum, commits) => sum + commits, 0);
  const totalPushes = [...pushesByDate.values()].reduce((sum, pushes) => sum + pushes, 0);

  return {
    totalCommits,
    totalPushes,
    activeDays: dailyCounts.filter((day) => day.pushes > 0).length,
    currentStreak,
    longestStreak,
    eventWindowStart: toDateKey(windowStart),
    eventWindowEnd: toDateKey(windowEnd),
    windowDays,
    mostActiveDate,
    mostActiveCommits,
    dailyCounts,
    hasActivity: totalPushes > 0
  };
}