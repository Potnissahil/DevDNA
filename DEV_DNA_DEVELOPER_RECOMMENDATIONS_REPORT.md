# DevDNA — Developer Recommendations Implementation Report

**Analysis only — no source code was modified to produce this report.**

---

## 1. CURRENT PROJECT ANALYSIS

### How the GitHub Analytics system works today

DevDNA is a React (Vite) + Tailwind + Supabase application. GitHub analytics is driven entirely by three GitHub REST API calls and a set of pure computation utilities. There is **no GitHub webhook, no local GitHub credential storage, and no background job** — every page that needs GitHub data fetches it on demand and caches it only in React state for that page mount.

### Data flow (top-to-bottom)

```
SettingsPage.jsx  →  saves github_username on the profile
        │
        ▼
AuthContext (profile.github_username)
        │
        ▼
useGitHubData(profile?.github_username)  ── src/hooks/useGitHubData.jsx
        │  (hooks returns: profile, repositories, events, languageBreakdown,
        │   stats, activity, repositoryInsights, loading, error, reload)
        ▼
fetchGitHubSnapshot(username)  ── src/services/githubService.js
        │
        ├── GET https://api.github.com/users/{username}
        ├── GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated
        └── GET https://api.github.com/users/{username}/events/public?per_page=100
        │
        ├── builds `stats`        (repoCount, stars, forks, recentEvents, pushEvents, activeDays)
        ├── builds `languageBreakdown`
        ├── computeGitHubActivity(events)          ── src/utils/githubActivity.js
        └── computeRepositoryInsights(repositories) ── src/utils/repositoryInsights.js
        │
        ▼
Snapshot object { profile, repositories, events, languageBreakdown, stats, activity, repositoryInsights }
        │
        ▼
Consumers:
  • GitHubPage.jsx      – full GitHub view (metrics, profile, languages, activity chart,
                          repo list, Repository Quality & Portfolio Insights)
  • AnalyticsPage.jsx   – dashboard charts + GitHub progress signal + Presentation Notes card
  • OverviewPage.jsx    – GitHub language summary + repo count KPI
```

### Key implementation notes

- `request()` in `githubService.js` throws friendly errors for 404 (user not found), 403 (rate limit/denied), and any other failure. On error, `useGitHubData` resets data to `emptyData` and exposes `error`.
- The repos fetch is **limited to per_page=100, sorted by `updated`**. Insights therefore describe "up to 100 most recently updated public repositories" — the UI already displays this disclaimer ("Fetched scope" panel in GitHubPage).
- The events fetch returns only **recent public events** (typically the last ~90 days). All activity metrics are explicitly described in the UI as "based on the available public events window, not your full GitHub history."
- An optional `VITE_GITHUB_TOKEN` raises the API rate limit (60 req/hr unauthenticated). Authentication is optional.
- The app supports two persistence modes: **Supabase cloud** (real users) and **demo/local mode** (`localStore.js` seeds a demo profile with `github_username: "octocat"`). GitHub fetching is identical in both modes.

---

## 2. EXISTING DATA AVAILABLE

`useGitHubData` returns the entire GitHub snapshot. The following data is currently available and reliable:

| # | Data / Metric | Source file | GitHub / API source | Currently used where | Can it be used for recommendations? | Reason |
|---|---------------|-------------|---------------------|----------------------|-------------------------------------|--------|
| 1 | `profile` (name, login, bio, followers, following, public_repos, created_at, location, blog, company, html_url) | `githubService.js`, `useGitHubData.jsx` | `GET /users/{username}` | GitHubPage Profile card, PDF report, Overview | Yes (light) | Real, always returned for valid public users |
| 2 | `repositories` (full array, up to 100) | `githubService.js` | `GET /users/{username}/repos?per_page=100&sort=updated` | GitHubPage repo list, Repository Insights | **Yes – primary** | Full repo objects with description, homepage, topics, language, stars, forks, issues, dates, archived, fork flags |
| 3 | `repository.description` | raw repo objects | repos endpoint | GitHubPage repo list ("No description available."), Repository Insights `withDescriptionCount` | **Yes** | Reliable; missing values are `null` and easily counted |
| 4 | `repository.homepage` | raw repo objects | repos endpoint | Repository Insights `withHomepageCount`, "Presentation" panel | **Yes** | Reliable; frequently `null` → actionable |
| 5 | `repository.topics` (array) | raw repo objects | repos endpoint | Repository Insights `withTopicsCount` | **Yes** | Reliable; empty array → actionable |
| 6 | `repository.stargazers_count` | raw repo objects | repos endpoint | `stats.stars`, `totalStars`, `mostStarred`, repo list | **Yes** | Reliable; 0 is a valid baseline |
| 7 | `repository.forks_count` | raw repo objects | repos endpoint | `stats.forks`, `totalForks`, `mostForked`, repo list | **Yes** | Reliable |
| 8 | `repository.open_issues_count` | raw repo objects | repos endpoint | Repository Insights `reposWithIssuesCount`, `totalOpenIssues` | **Yes** | Reliable; 0 when issues disabled/empty |
| 9 | `repository.language` | raw repo objects | repos endpoint | `languageBreakdown`, repo list badge | **Yes** | Reliable; `null` for repos with no detected language |
| 10 | `repository.pushed_at` | raw repo objects | repos endpoint | Repository Insights `activeCount`, `staleCount`, `recentlyActive`, `needsAttention` | **Yes – primary** | Core staleness/activity signal |
| 11 | `repository.created_at` | raw repo objects | repos endpoint | Repository Insights `oldest` / `newest` | Yes (light) | Reliable; used for age-based context only |
| 12 | `repository.updated_at` | raw repo objects | repos endpoint | GitHubPage repo list ("Updated …") | Yes (light) | Reliable but less meaningful than `pushed_at` |
| 13 | `repository.archived` (boolean) | raw repo objects | repos endpoint | Repository Insights `archivedCount`, `needsAttention` badge "Archived" | Yes (guarded) | Reliable; must NEVER be treated as a problem — archived is intentional |
| 14 | `repository.fork` (boolean) | raw repo objects | repos endpoint | Repository Insights `forkedCount` | Yes (guarded) | Reliable; must be excluded from "improve this repo" rules |
| 15 | `repository.size` (KB) | raw repo objects | repos endpoint | Repository Insights `totalSizeKb`, `reposWithSizeCount`, GitHubPage size panel | No (skip) | Not a meaningful improvement signal |
| 16 | `stats` (repoCount, stars, forks, recentEvents, pushEvents, activeDays) | `githubService.js` | derived from repos + events | MetricCards on GitHubPage/AnalyticsPage/OverviewPage, PDF, OverallProgressChart | Yes (light) | Derived, always numeric, safe |
| 17 | `languageBreakdown` [{language, count}] | `githubService.js` | derived from repos | GitHubPage + OverviewPage language bars | Yes (guarded) | Derived; only counts repos that report a language |
| 18 | `activity` (totalCommits, totalPushes, activeDays, currentStreak, longestStreak, eventWindowStart/End, windowDays, mostActiveDate, mostActiveCommits, dailyCounts, hasActivity) | `githubActivity.js` via `githubService.js` | derived from `GET /users/{username}/events/public?per_page=100` | GitHubPage Contribution & Coding Activity card, AnalyticsPage GitHub KPI | **Yes – primary** | Reliable but **public-events-only**; risk of false "inactive" for private-work users |
| 19 | `repositoryInsights` (repoCount, activeCount, staleCount, assessedMaintenanceCount, recentlyActive[], needsAttention[], archivedCount, forkedCount, reposWithIssuesCount, totalOpenIssues, presentedCount, withDescriptionCount, withHomepageCount, withTopicsCount, presentationRate, totalStars, totalForks, totalSizeKb, reposWithSizeCount, mostStarred, mostForked, oldest, newest) | `repositoryInsights.js` via `githubService.js` | derived from repos | GitHubPage "Repository Quality & Portfolio Insights" card | **Yes – primary** | This utility already computes most of the raw signals a recommendations engine needs |
| 20 | `events` (raw array) | `githubService.js` | `GET /users/{username}/events/public?per_page=100` | not surfaced 1:1; drives `activity` | Yes (light) | Raw source; only push events matter |
| 21 | `loading`, `error`, `reload` | `useGitHubData.jsx` | n/a (state) | All GitHub pages' loading/error/refresh states | Yes (guards) | Must gate recommendations to avoid showing advice during error/loading |

**What is NOT available today (would require new API calls):**
- README content / whether a README exists (would need a per-repo contents request)
- Language bytes (the `languages` endpoint per repo)
- Commit counts / contributor stats per repo (`/repos/{owner}/{repo}/contributors`, `stats/contributors`)
- Issues list (only the *count* `open_issues_count` is available)
- Total private-repo activity (public events feed only)
- Star/fork *timelines* or who starred/forked

---

## 3. CURRENT REPOSITORY INSIGHTS

`computeRepositoryInsights(repositories)` (`src/utils/repositoryInsights.js`) is a **pure function** — same input always produces the same output. Constants:

- `MAINTENANCE_DAYS = 90` — a repo pushed within 90 days counts as "active / maintained"
- `RECENT_ACTIVITY_DAYS = 30` — a non-archived repo pushed within 30 days goes into `recentlyActive`
- `STALE_DAYS = 365` — a non-archived repo not pushed in >365 days is "stale" and pushed into `needsAttention` (marked `_reason: "stale"`)

Legend for regions we compute per repo:
- **Popularity:** sums `stargazers_count` and `forks_count`; tracks `mostStarred`, `mostForked`.
- **Issues:** sums `open_issues_count` → `totalOpenIssues` and counts repos with ≥1 → `reposWithIssuesCount`.
- **Size:** sums `size` (KB) → `totalSizeKb`.
- **Archived/forked:** counts `archived === true` → `archivedCount`, `fork === true` → `forkedCount`.
- **Presentation:** counts repos with a non-empty description (`withDescriptionCount`), homepage (`withHomepageCount`), topics (`withTopicsCount`), and both description+homepage (`presentedCount`), plus `presentationRate = round(presented / total * 100)`.
- **Maintenance:** `pushed_at` based — active if ≤90 days, stale if >365 days (non-archived), and `needsAttention` also gets every archived repo (`_reason: "archived"`). Archived entries sort first in `needsAttention`.
- **Age:** tracks `oldest` and `newest` by `created_at`.

Output shape (see summary table row 19). Everything exposed by the function is already consumed by GitHubPage's "Repository Quality & Portfolio Insights" card (metric cards + the *Popularity & age*, *Recently active*, *Needs attention* panels).

**RepositoryInsights already contains most low-level signals that the recommendation engine needs** — especially `staleCount`, `archivedCount`, `forkedCount`, `presentedCount`, `withDescriptionCount`, `withHomepageCount`, `withTopicsCount`, `recentlyActive`, `mostStarred`, `mostForked`, `needsAttention`, `repoCount`.

---

## 4. CURRENT PRESENTATION NOTES

**Location:** `src/pages/AnalyticsPage.jsx`, lines 238–262 — a `Card` with `SectionHeader`:

```
eyebrow="Presentation notes"
title="What this dashboard communicates"
description="Use these signals to explain your current momentum during interviews, reviews, and demos."
```

It renders **four hard-coded cards** via a local `Recommendation` component (lines 281–288, which only renders `title` + `description`):

1. **Skills depth** — "Shows where your strongest technical confidence sits right now."
2. **Learning discipline** — "Highlights whether goals are being completed or accumulating in backlog."
3. **Delivery reliability** — "Makes project health easy to understand for reviewers at a glance."
4. **Public coding rhythm** — "Uses GitHub activity as a lightweight signal of recent engineering consistency."

### Real developer value: LOW — it is static presentation content

- The strings never change; the card is identical for every user, regardless of their actual skills, goals, projects, or GitHub activity.
- It computes **nothing** — no use of `github`, `skills`, `goals`, or `projects` data inside the section.
- It is effectively placeholder marketing copy ("…to explain your current momentum during interviews").
- It occupies page space on the Analytics page but gives the developer **zero actionable, personalized information**.

This makes it the correct section to **replace** with a genuinely data-driven "Developer Recommendations" feature.

---

## 5. RECOMMENDATION SYSTEM PROPOSAL

### Design principles

- **Pure, rule-based, transparent.** A new utility function (`computeDeveloperRecommendations`) takes the existing GitHub snapshot and returns an ordered list of recommendation objects. No AI, no external calls, no randomness — each recommendation states the rule and the data that triggered it.
- **Only use data already in the snapshot** (Section 2). No new GitHub API calls → no added rate-limit pressure.
- **Never tell the user to "fix" something intentional** (archived, forked, finished/private work). Use neutral/positive framing where the action is optional.
- **Render as cards** with title + message (+ optional repo name / count), matching the existing `Recommendation`-style card layout but data-driven.
- **Include a "rule" metadata** string on each recommendation object so a reviewer/mock examiner can see exactly which condition fired.

### Recommendation catalogue

#### R1 — Add repository descriptions

- **Recommendation:** Improve Repository Documentation (Descriptions)
- **Condition:** More than one **non-fork** repository has an empty `description`.
- **Data required:** `repositories[].description`, `repositories[].fork`
- **Reason:** A clear one-line description is the first thing recruiters and collaborators read; it turns an anonymous name into a legible project.
- **Example situation:** A student has 6 public repos, 4 with no description.
- **Example message:** "4 of your repositories have no description. Add a short one-liner so reviewers instantly understand each project."

#### R2 — Add a homepage link

- **Recommendation:** Add a Homepage Link
- **Condition:** At least 2 **non-fork, non-archived** repos have a description but no `homepage`.
- **Data required:** `repositories[].homepage`, `repositories[].description`, `repositories[].fork`, `repositories[].archived`
- **Reason:** A homepage (live demo / project site) is the single strongest "this project works" signal on a GitHub profile.
- **Example situation:** 3 portfolio repos described but none linked to a deployed version.
- **Example message:** "3 repositories have a description but no live link. Add a homepage URL (e.g. a deployed demo) to make them look production-ready."

#### R3 — Add topics for discoverability

- **Recommendation:** Add Repository Topics
- **Condition:** At least 3 **non-fork** repos have an empty `topics` array.
- **Data required:** `repositories[].topics`, `repositories[].fork`
- **Reason:** Topics drive GitHub search/discoverability and instantly communicate the tech stack to reviewers.
- **Example situation:** 5 repos, all with no topics.
- **Example message:** "5 repositories have no topics. Add tags like `react`, `api`, `machine-learning` so they appear in GitHub searches."

#### R4 — Revisit stale repositories

- **Recommendation:** Revive or Close Stale Repositories
- **Condition:** `repositoryInsights.staleCount >= 1` (non-archived repos not pushed in more than 365 days).
- **Data required:** `repositories[].pushed_at`, `repositories[].archived`, `repositories[].fork`
- **Reason:** Stale-but-not-archived public repos look abandoned; a quick commit or an archive decision clarifies intent.
- **Example situation:** 2 repos last pushed 14 months ago.
- **Example message:** "2 public repositories haven't been updated in over a year. Either push a small update or archive them so your profile reflects your current focus."

#### R5 — Recent activity gap

- **Recommendation:** Rebuild Your Public Coding Rhythm
- **Condition:** A GitHub username is connected, the account has repositories, but `activity.hasActivity === false` (no push events in the public events window).
- **Data required:** `stats.repoCount`, `activity.hasActivity`
- **Reason:** The dashboard's most visible GitHub signal is derived from public pushes; zero pushes makes the analytics section empty and unimpressive in reviews.
- **Example situation:** Student connected GitHub but did all work in private repos / hasn't pushed publicly in 90+ days.
- **Example message:** "No public push events were detected recently. A few visible commits would restore your GitHub activity signals on this dashboard."

#### R6 — Consistency streak praise (positive)

- **Recommendation:** Great Coding Consistency
- **Condition:** `activity.totalCommits >= 30` and `activity.activeDays >= 5` (or `currentStreak >= 7`).
- **Data required:** `activity.totalCommits`, `activity.activeDays`, `activity.currentStreak`
- **Reason:** Reinforces the behavior the dashboard exists to measure — steady public work.
- **Example situation:** A developer pushed on 12 days with an 8-day streak.
- **Example message:** "You committed across 12 active days with an 8-day streak — keep this rhythm up, it is your strongest portfolio signal."

#### R7 — Triage open issues

- **Recommendation:** Triage Open Issues
- **Condition:** `repositoryInsights.totalOpenIssues > 0` on **non-archived** repos.
- **Data required:** `repositories[].open_issues_count`, `repositories[].archived`
- **Reason:** Responding to open issues shows maintainership and keeps projects healthy — a competitive advantage for a junior profile.
- **Example situation:** 2 repos with 5 open issues total.
- **Example message:** "You have 5 open issues across 2 repositories. Closing or commenting on them demonstrates ongoing maintenance."

#### R8 — Showcase your strongest repo (positive)

- **Recommendation:** Feature Your Most Popular Repository
- **Condition:** `repositoryInsights.mostStarred` has `stargazers_count >= 1` (or `mostForked` with `forks_count >= 1`).
- **Data required:** `repositoryInsights.mostStarred`, `repositoryInsights.mostForked`
- **Reason:** Positive guidance — point the developer at the asset worth leading with in a resume/mock interview.
- **Example situation:** `resume-api` has 14 stars.
- **Example message:** "Your repository `resume-api` has the most stars (14). Lead with it in your portfolio and demo."

#### R9 — Recently active repos are talking points (positive)

- **Recommendation:** Talk About Your Current Work
- **Condition:** `repositoryInsights.recentlyActive.length >= 1`.
- **Data required:** `repositoryInsights.recentlyActive`
- **Reason:** Fresh repos are the most convincing, honest interview material.
- **Example situation:** 3 repos pushed in the last 30 days.
- **Example message:** "You recently worked on `todo-app`, `api-gateway`, and `gen-cover`. These are your freshest talking points for interviews."

#### R10 — Archived repository note (informational, NOT a "fix it")

- **Recommendation:** Keep Archived Repos Out of Your Pitch
- **Condition:** `repositoryInsights.archivedCount >= 1`.
- **Data required:** `repositoryInsights.archivedCount`
- **Reason:** Archived repos are intentional; the value is helping the developer curate what they present.
- **Example message:** "2 of your repositories are archived. That's fine — just remember to present your active repos first in a review."

#### R11 — Language positioning (low priority)

- **Recommendation:** Position Yourself Around Your Strongest Language — (OPTIONAL / LOW)
- **Condition:** `languageBreakdown.length >= 3` and the top language represents ≥50% of language-typed repos.
- **Data required:** `languageBreakdown`
- **Reason:** A clear "main language" is easier to market than a scattered profile.
- **Example message:** "JavaScript appears in 6 of 10 language-typed repositories. Consider making it the headline skill on your profile."

---

## 6. RECOMMENDATION PRIORITY

### High Priority
| Rec | Why |
|-----|-----|
| R1 — Add descriptions | Highest coverage/impact; data is 100% reliable; fixes the most common profile weakness; easiest to explain in a viva. |
| R2 — Add homepage links | Direct, visible quality boost; data reliable; maps to existing `withHomepageCount` signal. |
| R4 — Revisit stale repos | Directly uses the existing staleness engine; addresses a very common junior-profile problem; clearly data-driven. |
| R5 — Activity gap | Turns an "empty" GitHub analytics card into an actionable nudge; data already used by the activity chart. |

### Medium Priority
| Rec | Why |
|-----|-----|
| R3 — Add topics | Useful, but topics are optional metadata — lower perceived urgency. |
| R6 — Consistency praise | Positive reinforcement only; not an "action" but boosts engagement. |
| R7 — Triage open issues | Useful maintenance signal, but "0 issues" is normal for many projects; needs careful framing to avoid false positives. |
| R8 — Showcase most-starred | Great for portfolio messaging but requires stars > 0, which many student profiles lack. |

### Low Priority
| Rec | Why |
|-----|-----|
| R9 — Recent work talking points | Nice-to-have, informational only; overlaps with existing "Recently active" panel. |
| R10 — Archived note | Merely informational; must never appear critical; contributes little on its own. |
| R11 — Language positioning | Interpretation-heavy; risks feeling subjective; threshold tuning needed. |

---

## 7. FALSE POSITIVE / EDGE CASE ANALYSIS

| Scenario | Why a raw rule would be misleading | Mitigation in design |
|----------|-------------------------------------|----------------------|
| **Intentionally inactive repo** (finished demo, completed college project) | "Revisit stale repo" sounds like an accusation | Frame as a choice ("push a small update **or archive it**"); never says "abandoned". |
| **Archived repos** | Archived is a deliberate, terminal state — nothing to fix | R4 excludes archived repos; R10 treats archived as neutral information only. |
| **Forks** | A fork is someone else's project; you shouldn't edit its docs/topics/hompage | R1, R2, R3 exclude `fork === true`. |
| **Public-events-only activity window** | A developer active only in private repos looks "inactive" | R5 wording says "public push events were not detected", not "you are inactive"; the UI already disclaims the public-events window. |
| **>100 repos** | Only the 100 most recently updated repos are fetched; stats aren't the full profile | Keep the existing "fetched scope: N repositories" note; aggregate recs (R1) are still valid for the fetched set. |
| **Private repos** | Not in the fetched set at all; cannot comment on them | Language, descriptions, etc. are only computed across public repos. |
| **Issues intentionally disabled / no issues wanted** | "Triage 3 open issues" may be pushy | R7 only fires when open issues **exist**, and frames closing *or commenting* as an option. |
| **Description present but in another language / emoji-only** | Counting as "described" may over-credit | Acceptable limitation; `hasText` guards empty strings. |
| **Brand-new account (1–2 repos)** | Aggregate recs (topics, language positioning) look silly | Require minimum repo counts on aggregate rules (e.g. R1 needs ≥2, R3 needs ≥3); skip R11 unless ≥3 languages. |
| **Repo with 0 stars that is still great** | "Showcase" rule never fires | No harm — R8 simply doesn't appear. Positive-only. |
| **Empty / error API responses** | Recommendations must not render on an error/loading state | Gate on `!github.error && !github.loading && hasGitHubUsername && repoCount > 0`. |
| **Rate-limited (403)** | Full snapshot is empty → bad recs | Same gating: any `error` suppresses recommendations entirely. |
| **No GitHub username connected** | No data → no recommendations | Show an "add your GitHub username" empty state instead. |
| **Stale repo that is actually private-source demo** | Staleness implies neglect | Keep the "either update **or archive**" two-option framing. |

**General rule:** every recommendation object must carry a **severity/tone** (`positive`, `neutral`, `warning`) and wording must default to *suggestions*, never judgments. Skip a rule silently when its data does not exist.

---

## 8. MOCK / PRESENTATION EXPLANATION

Use this beginner-friendly, technically accurate explanation in a project viva / final mock:

**What problem does it solve?**
"I replaced a static 'Presentation Notes' box that said the same thing for every user with **Developer Recommendations** — personalized, actionable advice generated from the developer's own public GitHub data, e.g. '4 of your repositories have no description'."

**What data does it use?**
"Only data that my GitHub analytics flow already fetches: the profile's public repositories and public events. From the repos I read the description, homepage, topics, stars, forks, open-issue count, language, and last push date. No new API calls were added."

**How is the recommendation generated?**
"I wrote a pure JavaScript function — `computeDeveloperRecommendations` — that takes the GitHub snapshot and applies simple, fixed rules. For example, it counts non-fork repositories whose description is empty; if that count is more than one, it emits the 'Add descriptions' recommendation. Same rule for every user — only the numbers change."

**Why rule-based instead of AI?**
"Three reasons: (1) it is **transparent** — I can show the exact condition that produced each recommendation; (2) it is **deterministic** — the same GitHub profile always yields the same advice, which is easy to test; (3) it **needs no external API, cost, or latency** and never 'hallucinates' — an AI might say things about the developer that aren't in the data."

**Simple end-to-end example:**
"1. The developer connects `octocat`. 2. My `githubService` calls the GitHub API and builds the snapshot. 3. `computeRepositoryInsights` counts that 3 repos have no description (out of 6). 4. The rule `missingDescriptions >= 2` fires. 5. The Analytics page renders: '3 of your repositories have no description. Add short one-liners so reviewers instantly understand each project.'"

---

## 9. FILES THAT WILL NEED MODIFICATION

| File | Why | Type of change |
|------|-----|----------------|
| `src/utils/developerRecommendations.js` (NEW) | Centralizes all rule definitions and the pure computation function | **Logic / data** — new pure utility returning ordered recommendation objects |
| `src/pages/AnalyticsPage.jsx` | Replaces the static "Presentation notes" card (lines 238–262) with the data-driven "Developer Recommendations" card; computes recs from the already-loaded `github` snapshot; renders cards, empty/loading/error states | **UI** (replaces section) + **integration** (calls new utility) |
| `src/utils/repositoryInsights.js` (OPTIONAL) | Optionally expose a few additional derived counts (e.g. `missingDescriptionCount`, `missingHomepageCount`, `missingTopicsCount`, `nonForkCount`) so the recommendation utility stays thin — **not strictly required** since new utility can compute these itself | **Logic / data** (optional additive fields; must keep existing exports intact) |
| `src/pages/GitHubPage.jsx` (OPTIONAL) | Same recommendation card could also be surfaced here; **not required** — AnalyticsPage alone is enough for the first iteration | **UI** (optional) |
| `src/components/common/MetricCard.jsx`, `Card.jsx`, `SectionHeader.jsx`, `src/components/feedback/*` | Likely **no changes** — existing reusable components will be reused | none expected |

**Files that should NOT change:** `src/services/githubService.js`, `src/hooks/useGitHubData.jsx`, `src/utils/githubActivity.js`, `src/utils/formatters.js`, `src/utils/analytics.js`, `src/utils/pdfReport.js`, `src/pages/GitHubPage.jsx` (unless optional), `src/pages/OverviewPage.jsx`, `src/pages/SettingsPage.jsx`, all charts, all styles.

---

## 10. IMPLEMENTATION PLAN

**Step 0 — Verify baseline.** Run `npm run build`, confirm clean. Run `npm run dev` and open Analytics page (with default `octocat` demo profile) to record current layout.

**Step 1 — Create the recommendation utility.** `src/utils/developerRecommendations.js`: pure function `computeDeveloperRecommendations({ repositories, stats, activity, repositoryInsights })` returning `[]` or ordered recommendation objects `{ id, title, message, tone, rule }`. Include small internal helpers (non-fork filter, `hasText` guard). No imports from other modules required beyond optional reuse of `repositoryInsights` constants.

**Step 2 — Unit-verify the utility in isolation.** Temporarily exercise it with a handful of crafted snapshot objects (Node snippet run manually, or a scratch file under `C:\Users\Lenovo\AppData\Local\Temp\opencode`), confirming each rule fires/doesn't fire with expected input. **Do not commit scratch files.**

**Step 3 — Connect to existing data in AnalyticsPage.** Compute `const recommendations = useMemo(() => computeDeveloperRecommendations(github), [github])`. Use `hasGitHubUsername`, `github.loading`, `github.error` guards.

**Step 4 — Replace the Presentation Notes card.** Swap the hard-coded 4 cards (lines 245–260) for the recommendation list. Reuse the existing `Recommendation`-style card look (or a renamed local component) with `tone` styling. Keep `SectionHeader` with a new eyebrow `"Developer recommendations"` and title/description explaining the rules are derived from GitHub data.

**Step 5 — Handle states.** Loading → `SkeletonCard` (reuse existing). Error / no username → existing `EmptyState` copy ("Add your GitHub username…"). No rules matched → `EmptyState` "No recommendations right now — your GitHub profile is in good shape." (positive framing). Limit visible cards (e.g. top 5) with a small "based on up to 100 most recently updated public repositories" note.

**Step 6 — Test different GitHub profiles** (see Section 11). Confirm recommendations change appropriately and no crash on empty/error data.

**Step 7 — Regression check.** Verify existing metrics, charts, activity card, GitHubPage and OverviewPage are untouched; run `npm run build` and manual pass over all three GitHub-consuming pages.

---

## 11. TESTING PLAN

Test scenarios and expected outcomes (each exercised by temporarily setting the profile's `github_username`, or by feeding crafted snapshots to the utility):

| Scenario | Test with (suggested) | Expected result |
|----------|----------------------|-----------------|
| Active developer | a busy OSS account (e.g. `octocat`, or a real active user) | R6 praise + R8/R9 positive cards appear; R5 does NOT appear |
| Inactive developer | an account with repos but no recent public pushes | R5 appears; R6 absent; R4 (stale) appears if repos >365 days old |
| Many repositories | account with 100+ repos | insight/aggrec recs computed across "up to 100 most recently updated"; scope note visible |
| Repos without descriptions | account with several empty-description repos | R1 fires with correct count |
| Robust presentation | account where repos have homepage/topics | R2/R3 do not fire (or fire low); no false positives |
| Open issues | account with open issues | R7 fires listing count across repos |
| Archived repositories | account with archived repos | R4 ignores archived; R10 informational only; no "fix it" language |
| Limited GitHub data | brand-new account with 1–2 repos, no stars | only lightweight recs R5 may appear; aggregate rules (R1/R3/R11) suppressed by minimum-count guards |
| Empty / error API response | invalid username or simulated 403/rate limit | `EmptyState`/error state; **zero** recommendation cards |
| 404 user not found | nonexistent username | existing friendly error surfaced; no recs |
| Zero repos account | account with no public repos | "No repository data" empty state; no recs |
| Profile with no GitHub username | clear the field | "Add your GitHub username" empty state; no recs |

Also test after toggles: refresh (`reload`) re-computes recs; loading state shows skeletons; no layout shift on Analytics page.

---

## 12. RISK ASSESSMENT

1. **AnalyticsPage layout / UX break** — Replacing the Presentation Notes card must not break adjacent charts or the export button. Mitigation: minimal, surgical edit of that single card block only.
2. **Zero-match rendering** — If no rules fire and the card still renders, the page shows an awkward empty block. Mitigation: proper empty state (positive copy).
3. **Crash on null/partial snapshot** — `repositories`, `activity`, `stats`, `repositoryInsights` can all be `null`/`emptyData` on error. Mitigation: guard everything; utility must tolerate empty inputs and return `[]`.
4. **False-positive recommendations undermine trust** — The whole point is transparency; a bad rule (e.g. scolding archived/intentional repos) would look like AI slop. Mitigation: tone field + exclusion of fork/archived + minimum-count thresholds.
5. **Rate-limit sensitivity** — Adding **no** new API calls. If someone adds README/contributor checks during implementation, that triples requests and risks 403s. Mitigation: forbid new endpoints in v1.
6. **PDF export regression** — `generateDevDNAPdfReport` uses `github.stats`; as long as analytics data shape is untouched, the PDF is safe. Don't alter the `github` object shape.
7. **Name collision** — The local `Recommendation` component in AnalyticsPage is fine (file-scoped), but beware exporting a new `Recommendation` component globally — keep changes local or rename.
8. **Demo-mode behavior** — `localStore` seeds `octocat`. The feature must render correctly in demo mode (it will, since GitHub fetching is mode-independent).
9. **Maintenance thresholds drift** — 30/90/365-day constants live in `repositoryInsights.js`; reuse them (import constants) rather than duplicating magic numbers in the new utility.
10. **Untrusted data in messages** — Repository names / topics come from the GitHub API; they're rendered as React strings (XSS-safe) — never use `dangerouslySetInnerHTML`.

---

## 13. FINAL RECOMMENDATION

**What we SHOULD implement (v1):**
- R1 Add descriptions, R2 Add homepage links, R4 Revisit stale repos, R5 Activity gap, R6 Consistency praise, R8 Showcase most-starred repo.
- A pure `developerRecommendations.js` utility + a data-driven card replacing Presentation Notes in `AnalyticsPage.jsx`.
- Proper empty/loading/error states and the "up to 100 public repos" scope note.

**What we should NOT implement (yet):**
- README-presence checks, per-repo languages (bytes), contributor/commit stats — all require new API calls and increase rate-limit risk.
- R11 language positioning, R9/R10 borderline ones — implement only if time permits; they add interpretation risk.
- Any feature that edits GitHub, writes to profiles, or adds dependencies.

**Safest / easiest to explain in a final mock:**
- R1 (add descriptions), R4 (stale repos), R5 (public activity gap), R8 (showcase top repo). Each is one transparent condition backed by a number already shown elsewhere on the dashboard.

**What must remain untouched:**
- `githubService.js`, `useGitHubData.jsx`, `githubActivity.js`, PDF export, GitHubPage, OverviewPage, all charts and styles, and the Repository Insights card on GitHubPage.

---

## 14. (Handoff summary is provided in the terminal output, see response below.)