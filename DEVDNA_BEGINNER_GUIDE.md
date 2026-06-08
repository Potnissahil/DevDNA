# DevDNA — Beginner Project Guide

A complete learning guide for React developers exploring the DevDNA codebase.

**Stack:** React 18 · Vite 5 · Tailwind CSS 3 · React Router DOM 7 · Supabase JS 2

---

# Project Overview

DevDNA is a **developer growth intelligence SaaS-style SPA** (Single Page Application) that combines authentication, profile management, CRUD dashboards (skills, learning goals, projects), GitHub public API analytics, and a static architecture review experience.

## What the app does

| Area | Purpose |
|------|---------|
| **Identity** | Sign up / log in, manage profile and GitHub username |
| **Growth tracking** | Track skills, learning goals, and delivery projects |
| **GitHub insight** | Pull public repo, language, and activity metrics |
| **Architecture review** | Present system topology and production-readiness guidance |
| **SaaS UX** | Protected routes, theming, toasts, skeleton loaders, responsive layout |

The product narrative is consistent across `README.md`, `AuthPage`, `OverviewPage`, and `architectureContent.js`: turn engineering activity into actionable growth strategy.

## Big Picture (Read This First)

When you open the app:

1. `main.jsx` starts React and wraps the app in providers (theme, toasts, auth).
2. `App.jsx` decides which **page** to show based on the URL.
3. If you are not logged in, you go to `/auth`.
4. If you are logged in, you see the **dashboard shell** (`AppShell`) and a page inside it.
5. Pages get data from **hooks** and **context**, which call **services**, which talk to **Supabase** or **localStorage**.

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Vite SPA)                      │
├─────────────────────────────────────────────────────────────┤
│  main.jsx                                                   │
│    └─ BrowserRouter                                          │
│         └─ ThemeProvider → ToastProvider → AuthProvider    │
│              └─ App (lazy routes + ErrorBoundary)            │
├─────────────────────────────────────────────────────────────┤
│  Presentation: pages/ + components/                         │
│  State:        contexts/ (Auth, Theme, Toast)                │
│  Data hooks:   hooks/ (useCollection, useGitHubData)         │
│  Services:     services/ (auth, profile, data, github)       │
│  Adapters:     lib/ (supabase, localStore, env)              │
└──────────────┬──────────────────────────┬─────────────────────┘
               │                          │
        ┌──────▼──────┐           ┌───────▼────────┐
        │  Supabase   │           │  GitHub REST   │
        │  Auth + DB  │           │  Public API    │
        └─────────────┘           └────────────────┘
               │
        (fallback when unconfigured)
        ┌──────▼──────┐
        │ localStorage │
        └─────────────┘
```

**Design patterns in use:**

- **Provider composition** at the root (`main.jsx`)
- **Service layer abstraction** with Supabase/local branching
- **Route-level code splitting** via `React.lazy`
- **Layout route pattern** (`AppShell` + `<Outlet />`)
- **Custom hooks** for remote data orchestration

There is **no global state library** (Redux, Zustand, React Query). State lives in Context + per-hook `useState`.

## Data Flow

```
User action (click, form submit)
        ↓
   Page component
        ↓
   Hook (useCollection / useGitHubData)  OR  Context (useAuth / useToasts)
        ↓
   Service (authService, dataService, etc.)
        ↓
   Supabase client  OR  localStore (localStorage)
        ↓
   State updates → UI re-renders
```

**Example — saving a skill:**

1. User fills form on `SkillsPage` and clicks Save.
2. `SkillsPage` calls `save()` from `useCollection("skills")`.
3. `useCollection` calls `upsertRecord()` in `dataService.js`.
4. `dataService` either writes to Supabase or `localStore`.
5. Hook updates `items` state → list on screen refreshes.
6. `pushToast()` shows a success message.

**Example — loading GitHub data:**

1. `OverviewPage` reads `profile.github_username` from `useAuth()`.
2. Passes it to `useGitHubData(username)`.
3. Hook calls `fetchGitHubSnapshot()` in `githubService.js`.
4. Service calls GitHub's public API.
5. Hook stores result in state → metrics and charts appear.

## Dual-Mode Runtime

The app intentionally supports two modes:

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Supabase** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set | Real auth, Postgres-backed CRUD, RLS |
| **Local preview** | Supabase client is `null` | Any credentials work; data in `localStorage` with demo seed |

This lets you learn and build the UI without backend credentials.

## Environment Configuration

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_SUPABASE_URL` | For production | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For production | Supabase anon key |
| `VITE_GITHUB_TOKEN` | Optional | Higher GitHub API rate limits |

- Env read at build time via Vite (`import.meta.env`)
- Documented in `.env.example`
- No runtime validation or startup warnings in the UI (aside from `authMode` badge in sidebar)

## One Sentence Summary

**DevDNA is a React dashboard where pages use hooks and context to load data from services, which talk to Supabase (or localStorage), and React Router decides which page you see based on whether you are logged in.**

---

# Folder Structure

```
src/
├── main.jsx              ← App entry point (starts React)
├── index.css             ← Global styles + theme colors
├── app/
│   └── App.jsx           ← Routes (which page for which URL)
├── pages/                ← Full screens (one per route)
├── components/           ← Reusable UI pieces
│   ├── common/           ← Buttons, cards, headers
│   ├── feedback/         ← Loaders, toasts, errors
│   ├── layout/           ← Dashboard shell (sidebar + header)
│   └── auth/             ← Route protection
├── contexts/             ← Global state (auth, theme, toasts)
├── hooks/                ← Reusable data-fetching logic
├── services/             ← API / database calls
├── lib/                  ← Config + low-level helpers
├── utils/                ← Small pure functions
└── data/                 ← Static text/content
```

## Supporting files (outside `src/` but relevant)

| Path | Role |
|------|------|
| `package.json` | Dependencies and scripts (`dev`, `build`, `preview`) |
| `.env.example` | Env var template |
| `database/schema.sql` | Supabase tables + RLS policies |
| `docs/` | Setup, architecture, deployment guides |
| `tailwind.config.js` | Tailwind extensions |
| `vite.config.js` | Vite + React plugin config |
| `index.html` | HTML shell; loads `/src/main.jsx` |

**Beginner tip:** Start at `main.jsx` → `App.jsx` → one simple page (e.g. `SettingsPage.jsx`). Then follow imports downward.

## Dashboard Pages and Data Sources

| Page | Primary data | CRUD |
|------|--------------|------|
| **Overview** | Aggregated metrics from skills, goals, projects, GitHub | Read-only |
| **Analytics** | Computed trends + static recommendations | Read-only |
| **GitHub** | Full GitHub snapshot | Read-only |
| **Learning** | `learning_goals` | Create / update / delete |
| **Skills** | `skills` | Create / update / delete |
| **Projects** | `projects` | Create / update / delete |
| **Settings** | `profiles` | Update |
| **Architecture** | Static content | Read-only |

---

# Routing Flow

**Library:** React Router (`react-router-dom`)

```
Browser URL
    ↓
main.jsx → <BrowserRouter>
    ↓
App.jsx → <Routes>
    ↓
Match path → show page
```

## Route Table

| URL | What happens |
|-----|----------------|
| `/auth` | Login/signup page. If already logged in → redirect to `/` |
| `/` | Protected dashboard → `OverviewPage` |
| `/analytics` | Protected → `AnalyticsPage` |
| `/github` | Protected → `GitHubPage` |
| `/learning` | Protected → `LearningPage` |
| `/skills` | Protected → `SkillsPage` |
| `/projects` | Protected → `ProjectsPage` |
| `/architecture` | Protected → `ArchitecturePage` |
| `/settings` | Protected → `SettingsPage` (sidebar label: "Profile") |
| Unknown URL (`*`) | 404 if logged in; redirect to `/auth` if not |

## Bootstrap Sequence

1. `AuthProvider` bootstraps session on mount.
2. While `loading === true`, `App` renders `FullScreenLoader`.
3. Unauthenticated users hitting protected routes are redirected by `ProtectedRoute` to `/auth` with `state.from` preserved.
4. After login, `AuthPage` navigates to `location.state?.from || "/"`.
5. Authenticated layout routes render inside `AppShell` via nested `<Outlet />`.

## Lazy Loading

Pages are imported with `lazy()` in `App.jsx`, so each page loads only when you visit it. `Suspense` shows `FullScreenLoader` while a lazy chunk loads.

## Layout Route Pattern

```
ProtectedRoute
  └── AppShell (sidebar + header)
        └── <Outlet />  ← OverviewPage, GitHubPage, etc.
```

`AppShell` is the parent route element. Child routes render where `<Outlet />` is placed.

## Notable Routing Details

- All dashboard pages are **lazy-loaded**.
- `ArchitecturePage` is routed at `/architecture` but **not listed in sidebar nav** — only reachable via the header "Review Architecture" button.
- Sidebar label "Profile" maps to `/settings`.
- `NotFoundPage` only appears for authenticated users on unknown paths; unauthenticated users are sent to `/auth`.

---

# Authentication Flow

## High-Level Flow

```
App starts
    ↓
AuthProvider runs bootstrap()
    ↓
authService.getInitialAuthState()
    ├── Supabase configured? → read session from Supabase
    └── Not configured?      → read session from localStorage
    ↓
If user exists → profileService.fetchProfile()
    ↓
loading = false → App shows routes
```

## Dual-Mode Auth (`authService.js`)

| Mode | Trigger | Behavior |
|------|---------|----------|
| **Supabase** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set | `signInWithPassword`, `signUp`, `signOut`, session persistence, `onAuthStateChange` |
| **Local preview** | Supabase client is `null` | Any email/password accepted; session stored in `devdna-demo-session` |

## Login Flow

1. User submits form on `AuthPage`.
2. `signIn()` in `AuthContext` → `authService.signIn()`.
3. Supabase: real email/password check. Local mode: any credentials work (demo only).
4. Session saved; profile loaded; user redirected to dashboard.

## Sign Up Flow

1. User submits signup form on `AuthPage` (includes full name).
2. `signUp()` in `AuthContext` → `authService.signUp()`.
3. Supabase: creates account with `user_metadata.full_name`. Local mode: creates demo session and saves name to local profile.
4. Profile fetched/created; user redirected.

## Logout Flow

1. User clicks "Logout" in `AppShell`.
2. `signOut()` in `AuthContext` → `authService.signOut()`.
3. Session cleared (Supabase or `devdna-demo-session` in localStorage).
4. User state and profile set to `null`; protected routes redirect to `/auth`.

## Protected Routes

`ProtectedRoute` checks `isAuthenticated` from `useAuth()`. If false → `<Navigate to="/auth" replace state={{ from: location.pathname }} />`.

`App.jsx` also checks auth before rendering routes and shows `FullScreenLoader` while `loading` is true.

**Note:** `ProtectedRoute` has its own `loading` check that returns `null`. This is largely redundant because `App` already blocks on auth loading before rendering `ProtectedRoute`.

## Profile Provisioning

On first Supabase login, `profileService.fetchProfile` auto-upserts a default profile row if none exists:

- `full_name` from `user.user_metadata.full_name`
- Default `role`: "Engineer"
- Empty `github_username` and `bio`

---

# Context API

Context = **global state** any component can read without passing props through every level.

| Context | What it stores | How you use it |
|---------|----------------|----------------|
| **AuthContext** | User, session, profile, authMode, loading, signIn, signUp, signOut, updateProfile | `const { user, signIn } = useAuth()` |
| **ThemeContext** | Light/dark theme, setTheme, toggleTheme | `const { theme, toggleTheme } = useTheme()` |
| **ToastContext** | Toast list, pushToast, dismissToast | `const { pushToast } = useToasts()` |

## Provider Tree (`main.jsx`)

```
ThemeProvider
  └── ToastProvider
        └── AuthProvider
              └── App
              └── ToastViewport (sibling, still inside providers)
```

**Why three contexts?**

- **Auth** — needed almost everywhere in the dashboard.
- **Theme** — needed by toggle button; affects whole app via CSS `data-theme` attribute.
- **Toast** — needed by forms; `ToastViewport` renders the notification list globally.

## Beginner Pattern to Notice

Each context follows the same structure:

1. `createContext(null)`
2. Provider component with `useState` / `useEffect` and `useMemo` for the value object
3. Custom hook (`useAuth`, `useTheme`, `useToasts`) that throws if used outside the provider

## AuthContext Details

**State exposed:**

- `authMode` — `"supabase"` or `"local"`
- `loading` — true during initial bootstrap
- `session` — Supabase session object (or local session)
- `user` — authenticated user
- `profile` — user profile from `profiles` table or localStore
- `isAuthenticated` — `Boolean(user)`

**Actions exposed:**

- `signIn(credentials)` — email + password
- `signUp(credentials)` — email + password + fullName
- `signOut()`
- `updateProfile(updates)` — persists and updates local profile state

**Lifecycle:**

1. On mount: `getInitialAuthState()` → set mode, session, user → fetch profile if user exists → `loading = false`
2. Subscribe to `onAuthStateChange` (Supabase only) → update session/user/profile on changes
3. On unmount: unsubscribe

## ThemeContext Details

- Storage key: `devdna-theme`
- Initial value: `localStorage` → else `prefers-color-scheme` media query
- Applied via `document.documentElement.dataset.theme = "light" | "dark"`
- CSS variables in `index.css` respond to `[data-theme="dark"]`

**Inconsistency to be aware of:** `MetricCard` and `StatusPill` use Tailwind `dark:` variants, but the app toggles `data-theme`, not the `dark` class. Those `dark:` styles will not activate with the current theme system.

## ToastContext Details

- `pushToast({ title, description })` — adds toast with `crypto.randomUUID()` id
- Auto-dismiss after 4000ms
- `ToastViewport` in `main.jsx` renders the stack fixed top-right

## State Management

| Layer | Mechanism |
|-------|-----------|
| **Global** | React Context (auth, theme, toasts) |
| **Server data** | Custom hooks with local `useState` |
| **Forms** | Page-level `useState` |
| **Persistence** | Supabase (cloud) or `localStorage` (preview) |

**No** Redux, Zustand, Jotai, React Query, SWR, or similar.

### Custom Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useCollection(resource)` | `useCollection.jsx` | List/save/destroy for `skills`, `learning_goals`, or `projects` |
| `useGitHubData(username)` | `useGitHubData.jsx` | Fetch and expose GitHub snapshot + `reload` |

Both hooks expose `{ loading, error }` and a manual reload/`load` function.

### useCollection Flow

```
Page calls useCollection("skills")
        ↓
Reads user.id from useAuth()
        ↓
useEffect → listRecords(resource, userId) via dataService
        ↓
Returns { items, loading, error, load, save, destroy }
```

- `save(record)` — upserts via `dataService`, updates local `items` state
- `destroy(id)` — deletes via `dataService`, filters from `items`

**Used by:** `LearningPage`, `SkillsPage`, `ProjectsPage`, `OverviewPage`, `AnalyticsPage`

### useGitHubData Flow

```
Page passes profile.github_username
        ↓
useEffect → fetchGitHubSnapshot(username) via githubService
        ↓
Returns { profile, repositories, events, languageBreakdown, stats, loading, error, reload }
```

**Used by:** `OverviewPage`, `AnalyticsPage`, `GitHubPage`

### Implications of Current State Approach

**Strengths:**

- Simple mental model for a small app
- Easy to trace data flow file by file

**Trade-offs:**

- Duplicate network requests across pages and hook instances (e.g. Overview and Analytics each call `useCollection` three times and `useGitHubData` once)
- No shared cache for GitHub or collection data
- No optimistic updates or background revalidation

---

# GitHub API

```
SettingsPage → user sets github_username → saved to profile
        ↓
OverviewPage / AnalyticsPage / GitHubPage
        ↓
useGitHubData(profile.github_username)
        ↓
githubService.fetchGitHubSnapshot(username)
        ↓
3 parallel fetch() calls to api.github.com:
  - GET /users/{username}
  - GET /users/{username}/repos?per_page=100&sort=updated
  - GET /users/{username}/events/public?per_page=100
        ↓
Service combines into: profile, repos, languages, stats
        ↓
Hook sets state → pages display metrics
```

## githubService.js Details

- Reads optional `VITE_GITHUB_TOKEN` from `lib/env.js`
- If token present: adds `Authorization: Bearer` header for higher rate limits
- Aggregates derived metrics:
  - `repoCount`, `stars`, `forks`, `recentEvents`, `pushEvents`, `activeDays`
  - `languageBreakdown` — counts repos by primary `repository.language` field

## GitHub Integration Limitations

- Public API only (no OAuth connection to the logged-in user's private repos)
- No caching — each page mount refetches independently
- No rate-limit (403/429) handling
- Language stats count repos by primary language only (not full GitHub language stats API)
- Max 100 repos/events per request, no pagination
- Username is free-text from profile; no account ownership verification

---

# Supabase

```
.env file → VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
        ↓
lib/env.js reads variables
        ↓
lib/supabase.js creates client (or null if missing)
        ↓
Services check: if (supabase) { ... } else { use localStore }
```

## Supabase Client (`lib/supabase.js`)

Created only when both env vars exist. Configuration:

- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: true`

If env vars are missing, `supabase` is `null` and all services fall back to `localStore.js`.

## Database Tables (`database/schema.sql`)

| Table | Purpose |
|-------|---------|
| `profiles` | User identity, role, GitHub username, bio |
| `skills` | Skill name, level, progress (0–100), focus |
| `learning_goals` | Title, status, target date, notes |
| `projects` | Name, stage, health, summary |

All tables reference `auth.users(id)` via `user_id` or `id` (profiles).

## Row Level Security (RLS)

RLS is enabled on all tables. Policies restrict operations to `auth.uid()`:

- `profiles` — select/insert/update own row
- `skills`, `learning_goals`, `projects` — full CRUD on own rows only

## Service Mapping

| Service | Supabase feature | Table / API |
|---------|------------------|-------------|
| `authService` | Auth | `signInWithPassword`, `signUp`, `signOut`, `getSession`, `onAuthStateChange` |
| `profileService` | Database | `profiles` select/upsert |
| `dataService` | Database | `skills`, `learning_goals`, `projects` list/upsert/delete |

## Local Fallback (`localStore.js`)

When Supabase is unavailable:

- Single `devdna-app-store` key in `localStorage`
- Seeded with demo profile (Ava Johnson, octocat), sample skills, goals, projects
- `authService` uses separate `devdna-demo-session` key for local auth
- Fixed local user id: `local-preview-user`
- No per-email data isolation in local mode

## dataService.js Pattern

Generic CRUD keyed by resource name:

- `skills` → table `skills`, ordered by `created_at`
- `learning_goals` → table `learning_goals`, ordered by `target_date`
- `projects` → table `projects`, ordered by `created_at`

Each operation branches: Supabase query or `localStore` helper.

---

# Learning Roadmap

## Level 1 — React Basics

**Goal:** Understand components, JSX, and props.

1. `components/common/Button.jsx` — small component, props, className
2. `components/common/Card.jsx` — children prop
3. `pages/NotFoundPage.jsx` — simple full page
4. `components/common/SectionHeader.jsx` — optional props (`eyebrow`, `action`)
5. `index.css` — CSS variables and `.field` class

**Practice idea:** Change button text or card styling and see it update everywhere.

---

## Level 2 — State and Forms

**Goal:** `useState`, controlled inputs, submit handlers.

1. `pages/SettingsPage.jsx` — form + `useState` + submit
2. `contexts/ToastContext.jsx` — calling `pushToast` after save
3. `components/feedback/ToastViewport.jsx` — how toasts appear
4. `pages/AuthPage.jsx` — login vs signup mode toggle

**Practice idea:** Trace what happens when you click "Save profile".

---

## Level 3 — Context (Global State)

**Goal:** Avoid prop drilling with Context.

1. `contexts/ThemeContext.jsx` — provider + `useTheme`
2. `components/common/ThemeToggle.jsx` — consumer
3. `contexts/AuthContext.jsx` — bigger example with async bootstrap
4. `components/auth/ProtectedRoute.jsx` — using `isAuthenticated`

**Practice idea:** Follow `useAuth()` from `AppShell` back to `AuthProvider`.

---

## Level 4 — Routing

**Goal:** URLs, navigation, nested routes.

1. `main.jsx` — `BrowserRouter`
2. `app/App.jsx` — `Routes`, `Route`, `Navigate`, `lazy`
3. `components/layout/AppShell.jsx` — `NavLink`, `Outlet`
4. `pages/AuthPage.jsx` — `useNavigate`, redirect after login

**Practice idea:** Add a mental map: URL → which component renders.

---

## Level 5 — Custom Hooks and Services

**Goal:** Separate UI from data fetching.

1. `utils/formatters.js` — pure functions (easiest)
2. `services/githubService.js` — `fetch` and async/await
3. `hooks/useGitHubData.jsx` — `useEffect` + loading/error state
4. `services/dataService.js` — Supabase vs local branching
5. `hooks/useCollection.jsx` — reusable CRUD hook
6. `pages/SkillsPage.jsx` — hook + form together

**Practice idea:** Read `useCollection` then open `SkillsPage` and see the same `save`/`destroy` API.

---

## Level 6 — Authentication End-to-End

**Goal:** Full auth pipeline.

1. `lib/env.js` + `lib/supabase.js` — when backend exists
2. `services/authService.js` — sign in/up/out
3. `services/profileService.js` — profile after login
4. `contexts/AuthContext.jsx` — ties it together
5. `app/App.jsx` — loading gate + public vs protected routes

**Practice idea:** Run without `.env` (local mode) vs with Supabase and compare `authMode` in the sidebar.

---

## Level 7 — Dashboard Composition

**Goal:** How multiple data sources combine on one screen.

1. `pages/OverviewPage.jsx` — 3× `useCollection` + `useGitHubData` + `useAuth`
2. `pages/GitHubPage.jsx` — loading, error, empty states
3. `components/feedback/EmptyState.jsx` + `SkeletonCard.jsx`

**Practice idea:** List every hook call on Overview and what UI it drives.

---

## Level 8 — Advanced Patterns

**Goal:** Production-style patterns.

1. `app/App.jsx` — `React.lazy` + `Suspense` code splitting
2. `components/feedback/ErrorBoundary.jsx` — class component + error recovery
3. `lib/localStore.js` — adapter/fallback pattern
4. `data/architectureContent.js` — content separated from components
5. `database/schema.sql` (outside src) — how Supabase tables match `dataService`

---

## Quick Reference: "If I Want to Learn X, Read Y"

| I want to learn… | Read these files |
|------------------|------------------|
| Reusable UI | `Button.jsx`, `Card.jsx`, `SectionHeader.jsx` |
| Forms | `SettingsPage.jsx`, `AuthPage.jsx` |
| Global state | `ThemeContext.jsx`, `AuthContext.jsx` |
| Routing | `main.jsx`, `App.jsx`, `AppShell.jsx`, `ProtectedRoute.jsx` |
| Fetching data | `useGitHubData.jsx`, `githubService.js` |
| Database CRUD | `useCollection.jsx`, `dataService.js`, `SkillsPage.jsx` |
| Login flow | `AuthPage.jsx` → `AuthContext.jsx` → `authService.js` |
| Theming | `ThemeContext.jsx`, `index.css`, `ThemeToggle.jsx` |
| Notifications | `ToastContext.jsx`, `ToastViewport.jsx` |

---

# File-by-File Guide

For every file: **why it exists**, **what it does**, **which files use it**, and **beginner importance**.

Importance levels: **Essential** (learn early), **Important** (learn soon), **Useful** (second wave), **Reference** (know it exists).

## Root and App Entry

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `main.jsx` | Entry point | Mounts React to `#root`, wraps app in Router + providers, imports CSS | Loaded by `index.html` | **Essential** — start here |
| `index.css` | Global styling | Tailwind imports, CSS variables for light/dark theme, `.card` and `.field` classes | Imported by `main.jsx` | **Important** — how theming works |
| `app/App.jsx` | Route definitions | Maps URLs to pages, lazy loading, auth loading screen, protected layout | Imported by `main.jsx` | **Essential** — how navigation works |

## Pages (`src/pages/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `AuthPage.jsx` | Login screen | Login/signup form, calls `signIn`/`signUp`, shows toasts | Lazy-loaded in `App.jsx` at `/auth` | **Essential** — forms + auth |
| `OverviewPage.jsx` | Home dashboard | Summary metrics from skills, goals, projects, GitHub | `App.jsx` index route `/` | **Important** — combines hooks |
| `AnalyticsPage.jsx` | Analytics view | Trend bars and static recommendations | `App.jsx` `/analytics` | **Useful** — read-only dashboard |
| `GitHubPage.jsx` | GitHub dashboard | Full GitHub stats, repos list, refresh button | `App.jsx` `/github` | **Important** — external API UI |
| `LearningPage.jsx` | Learning goals CRUD | Add/edit/delete learning goals | `App.jsx` `/learning` | **Important** — CRUD pattern |
| `SkillsPage.jsx` | Skills CRUD | Add/edit/delete skills with progress | `App.jsx` `/skills` | **Important** — same CRUD pattern |
| `ProjectsPage.jsx` | Projects CRUD | Add/edit/delete projects | `App.jsx` `/projects` | **Important** — same CRUD pattern |
| `SettingsPage.jsx` | Profile settings | Edit name, role, GitHub username, bio | `App.jsx` `/settings` | **Essential** — simple form + context |
| `ArchitecturePage.jsx` | Docs-style page | Static architecture explanation cards | `App.jsx` `/architecture` | **Useful** — mostly static content |
| `NotFoundPage.jsx` | 404 page | "Route doesn't exist" message + link home | `App.jsx` catch-all `*` | **Useful** — simple page example |

## Common Components (`src/components/common/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `Button.jsx` | Reusable button | Variants (primary, secondary, ghost, danger), sizes, can render as `<Link>` | Almost all pages, `EmptyState`, `ErrorBoundary`, `AppShell` | **Essential** — basic reusable component |
| `Card.jsx` | Panel wrapper | Rounded bordered container | Most pages, `MetricCard`, `NotFoundPage` | **Essential** |
| `MetricCard.jsx` | KPI display | Label + big number + optional trend badge | `OverviewPage`, `AnalyticsPage`, `GitHubPage` | **Useful** |
| `SectionHeader.jsx` | Page section title | Eyebrow, title, description, optional action | Most dashboard pages | **Useful** |
| `StatusPill.jsx` | Small badge | Colored status label | `AuthPage`, `AppShell`, `ArchitecturePage` | **Useful** |
| `ThemeToggle.jsx` | Dark/light switch | Calls `toggleTheme()` from context | `AppShell` | **Important** — connects UI to ThemeContext |

## Feedback Components (`src/components/feedback/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `ToastViewport.jsx` | Toast display | Renders notification stack top-right | `main.jsx` (global) | **Important** — pairs with ToastContext |
| `EmptyState.jsx` | Empty list UI | Dashed box when no data | `LearningPage`, `SkillsPage`, `ProjectsPage`, `OverviewPage`, `GitHubPage` | **Useful** |
| `SkeletonCard.jsx` | Loading placeholder | Animated gray bars while data loads | `OverviewPage`, `GitHubPage` | **Useful** — loading UX |
| `FullScreenLoader.jsx` | Full-page spinner | Shown while app or route loads | `App.jsx` | **Useful** |
| `ErrorBoundary.jsx` | Crash handler | Class component that catches render errors | `App.jsx` | **Reference** — learn after hooks |

## Layout and Auth Components

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `layout/AppShell.jsx` | Dashboard chrome | Sidebar nav, header, profile card, `<Outlet />` for child pages | `App.jsx` | **Essential** — layout + nested routes |
| `auth/ProtectedRoute.jsx` | Auth guard | Redirects to `/auth` if not logged in | `App.jsx` | **Essential** — route protection pattern |

## Contexts (`src/contexts/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `contexts/AuthContext.jsx` | Global auth state | User, profile, sign in/out/up, loading | `main.jsx`, `App.jsx`, `ProtectedRoute`, `AppShell`, many pages, `useCollection` | **Essential** |
| `contexts/ThemeContext.jsx` | Global theme | Light/dark, persists to localStorage | `main.jsx`, `ThemeToggle` | **Important** |
| `contexts/ToastContext.jsx` | Global notifications | `pushToast`, `dismissToast` | `main.jsx`, `ToastViewport`, form pages, `AuthPage` | **Important** |

## Hooks (`src/hooks/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `hooks/useCollection.jsx` | CRUD data hook | Loads/saves/deletes skills, goals, or projects | `LearningPage`, `SkillsPage`, `ProjectsPage`, `OverviewPage`, `AnalyticsPage` | **Essential** — custom hook pattern |
| `hooks/useGitHubData.jsx` | GitHub data hook | Fetches GitHub snapshot when username changes | `OverviewPage`, `AnalyticsPage`, `GitHubPage` | **Important** — fetch on mount pattern |

## Services (`src/services/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `services/authService.js` | Auth logic | Sign in/up/out, session bootstrap, auth listener | `AuthContext.jsx` | **Essential** |
| `services/profileService.js` | Profile DB logic | Fetch/create/update user profile | `AuthContext.jsx` | **Important** |
| `services/dataService.js` | Generic CRUD | List/upsert/delete for skills, goals, projects | `useCollection.jsx` | **Important** |
| `services/githubService.js` | GitHub API | Fetches and aggregates GitHub public data | `useGitHubData.jsx` | **Important** |

## Lib (`src/lib/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `lib/env.js` | Config reader | Reads `VITE_*` env variables; exports `hasSupabaseConfig` | `supabase.js`, `githubService.js` | **Important** — how Vite env works |
| `lib/supabase.js` | DB client | Creates Supabase client or `null` | All services | **Important** |
| `lib/localStore.js` | Offline fallback | Demo data + localStorage CRUD | `authService`, `profileService`, `dataService` | **Useful** — adapter pattern |

## Utils and Data

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `utils/formatters.js` | Pure helpers | `formatDate`, `initialsFromName`, `calculateAverageProgress` | `OverviewPage`, `LearningPage`, `GitHubPage`, `AnalyticsPage` | **Useful** — small functions, easy to read |
| `data/architectureContent.js` | Static copy | Array of architecture section text | `ArchitecturePage.jsx` | **Reference** — separating content from UI |

## External Schema (outside `src/`)

| File | Why it exists | What it does | Used by | Beginner importance |
|------|---------------|--------------|---------|---------------------|
| `database/schema.sql` | DB schema | Tables + RLS policies for Supabase | Run manually in Supabase SQL editor | **Reference** |

All `src/` files appear **referenced and in use**. No fully orphaned source modules were found.

---

# Recommendations

## Project Strengths

1. **Clean separation of concerns** — pages, services, lib adapters, and contexts are well bounded.
2. **Dual-mode architecture** enables full UI development without backend credentials.
3. **Production-oriented UX patterns** — lazy routes, error boundary, skeletons, empty states, toasts.
4. **Database schema with RLS** is thoughtfully designed in `database/schema.sql`.
5. **Consistent visual language** via CSS custom properties and reusable components.
6. **Documentation exists** — README, setup, architecture, deployment, and SQL schema.

---

## Broken Features

| # | Problem | Impact | Recommended Solution | Priority |
|---|---------|--------|----------------------|----------|
| B1 | **Supabase sign-up with email confirmation enabled returns `session: null`**, but `AuthContext.signUp` calls `fetchProfile(nextSession.user)` without null checks | App crashes on sign-up in standard Supabase configs that require email verification | Handle null session: show "check your email" toast, use `data.user` if present, defer profile fetch until confirmed session exists | **High** |
| B2 | **Analytics "GitHub activity days" displayed with `%` suffix** but value is a day count (not 0–100) | Misleading metric; progress bar width capped incorrectly for large values | Use raw count for display, or normalize to a 0–100 scale with a documented formula; remove erroneous `%` | **High** |
| B3 | **Tailwind `dark:` variants used while theme system sets `data-theme`**, not `class="dark"` | Success/warning pill colors in `MetricCard` and `StatusPill` do not respond correctly in dark mode | Align on one approach: add `dark` class in `ThemeProvider`, or replace `dark:` with `[data-theme=dark]:` selectors | **Medium** |
| B4 | **`JSON.parse` in `getInitialAuthState` local mode has no try/catch** | Corrupt `devdna-demo-session` localStorage crashes auth bootstrap | Wrap parse in try/catch; clear invalid key and fall back to logged-out state | **Medium** |
| B5 | **`SettingsPage` form state initialized once from `profile`** with no sync on profile change | Stale form if profile updates from another tab or auth subscription | Add `useEffect` to reset form when `profile` changes | **Low** |

---

## Unused Files / Dead Code

| # | Problem | Impact | Recommended Solution | Priority |
|---|---------|--------|----------------------|----------|
| U1 | **Tailwind `brand` color palette and `hero-grid` utilities** defined in `tailwind.config.js` but unused in `src/` | Config noise; misleading signal of design system usage | Remove unused extensions or adopt them in the UI | **Low** |
| U2 | **`hasSupabaseConfig` exported from `env.js`** but only consumed in `supabase.js` | Missed opportunity for startup UX (banner, docs link) | Surface in Settings or a dev banner when misconfigured for production | **Low** |
| U3 | **`ProtectedRoute` loading branch returns `null`** while `App` already gates on auth loading | Dead code path; possible confusion during future refactors | Remove redundant loading check or consolidate auth gating in one place | **Low** |

All `src/` files appear **referenced and in use**. No fully orphaned source modules were found.

---

## Duplicate Code

| # | Problem | Impact | Recommended Solution | Priority |
|---|---------|--------|----------------------|----------|
| D1 | **Learning, Skills, and Projects pages** share nearly identical form/list/delete patterns | ~150 lines × 3; bug fixes must be repeated three times | Extract a generic `CollectionPage` or `useCrudForm` hook + shared list item layout | **Medium** |
| D2 | **Language breakdown bar chart** duplicated in `OverviewPage` and `GitHubPage` | Visual/logic drift risk | Extract `LanguageBreakdown` component | **Low** |
| D3 | **`updateField` / `handleSubmit` / `handleDelete` boilerplate** repeated across CRUD pages and `AuthPage` | Maintenance overhead | Shared form helpers or a lightweight form hook | **Low** |
| D4 | **Multiple `useCollection` + `useGitHubData` instances** on Overview and Analytics | 6+ Supabase/GitHub round-trips per page visit | Introduce React Query/SWR with shared query keys, or a dashboard data context | **Medium** |

---

## Technical Debt

| # | Problem | Impact | Recommended Solution | Priority |
|---|---------|--------|----------------------|----------|
| T1 | **No TypeScript** | Runtime type errors possible (e.g., null session); weaker IDE support | Gradual TS migration starting with services and contexts | **Medium** |
| T2 | **No tests** (unit, integration, or E2E) | Regressions undetected; refactors risky | Add Vitest + React Testing Library; smoke tests for auth and CRUD flows | **High** |
| T3 | **No ESLint / Prettier** in project root | Inconsistent style; missing hooks deps warnings | Add ESLint with `eslint-plugin-react-hooks` | **Medium** |
| T4 | **Analytics recommendations are static copy**, not derived from workspace data despite UI copy implying otherwise | Product credibility gap | Generate recommendations from actual metrics thresholds | **Medium** |
| T5 | **Hooks use `.jsx` extension without JSX** | Minor convention inconsistency | Rename to `.js` or add JSX if splitting components | **Low** |
| T6 | **`AuthContext` `useMemo` omits action functions** from dependency array | Potential stale closure edge cases if refactored | Wrap actions in `useCallback` and include in memo deps | **Low** |
| T7 | **ErrorBoundary lacks `componentDidCatch` logging** | Production errors invisible | Log to console/service (Sentry, etc.) | **Medium** |
| T8 | **Local preview mode uses fixed user id** (`local-preview-user`) and shared seed data | No multi-user simulation; data not scoped per email | Scope local store by email hash or document as demo-only | **Low** |
| T9 | **ID format mismatch** — local seed uses string ids (`skill-1`); Supabase uses UUIDs | Data migration between modes is impossible | Document clearly; normalize id strategy | **Low** |
| T10 | **No pagination** on GitHub repos/events or Supabase lists | Breaks or degrades for power users | Add cursor pagination and "load more" | **Medium** |

---

## Security Concerns

| # | Problem | Impact | Recommended Solution | Priority |
|---|---------|--------|----------------------|----------|
| S1 | **`VITE_GITHUB_TOKEN` is bundled into client JavaScript** | Token exposed to anyone who inspects the build; token abuse risk | Proxy GitHub calls through Supabase Edge Function or backend; never ship PATs to the browser | **High** |
| S2 | **Local preview auth accepts any credentials with no validation** | If deployed without Supabase env vars, the app is effectively open | Fail closed in production builds when Supabase is missing; restrict preview mode to `import.meta.env.DEV` | **High** |
| S3 | **No password reset, email verification UX, or account recovery flows** | Standard auth surface incomplete for production | Implement Supabase `resetPasswordForEmail` and confirmation UI | **High** |
| S4 | **Delete operations rely solely on RLS** — `removeRecord` does not pass `user_id` in the query | Safe if RLS is correctly applied; dangerous if misconfigured | Add `.eq("user_id", userId)` defensively in service layer | **Medium** |
| S5 | **No Content Security Policy or security headers** configuration in Vite/hosting docs | XSS impact amplified if introduced | Document CSP for deployment (Netlify/Vercel headers) | **Medium** |
| S6 | **GitHub username is free-text** with no validation | Invalid usernames cause API errors (handled) but no sanitization for display | Validate format client-side; escape output (React default helps) | **Low** |

---

## Missing Production Features

| # | Problem | Impact | Recommended Solution | Priority |
|---|---------|--------|----------------------|----------|
| P1 | **No CI/CD pipeline** in repo | Manual, error-prone releases | GitHub Actions: lint, test, build on PR | **High** |
| P2 | **No environment validation at build/startup** | Silent misconfiguration in production | Add `zod`/`envalid` check; fail build if required prod vars missing | **High** |
| P3 | **No GitHub OAuth** — only public API by username | Cannot access private repos or verify account ownership | Supabase GitHub OAuth + store `provider` identity | **Medium** |
| P4 | **No password strength requirements** beyond `minLength={6}` on client | Weak accounts | Enforce Supabase password policy + client validation | **Medium** |
| P5 | **No monitoring / error reporting** (Sentry, LogRocket, etc.) | Blind to production failures | Integrate error tracking in `ErrorBoundary` and services | **Medium** |
| P6 | **No offline / retry UX** for failed API calls beyond toasts | Poor resilience on flaky networks | Retry with exponential backoff; offline banner | **Low** |
| P7 | **No i18n** — dates use `en-IN` locale hardcoded | Limits global adoption | Centralize locale config | **Low** |
| P8 | **No audit logging** for data changes | Enterprise compliance gap | Supabase triggers or audit table | **Low** |
| P9 | **No SEO beyond basic meta** in `index.html` | Limited discoverability for marketing pages | Add OG tags if a public landing page is added | **Low** |
| P10 | **`index.html` body uses `bg-slate-950`** while app theme is CSS-variable driven | Possible flash of wrong background before CSS loads | Match body background to `--surface` or remove conflicting class | **Low** |
| P11 | **Architecture page not in sidebar navigation** | Discoverability issue for a featured capability | Add nav item or document intentional placement | **Low** |
| P12 | **No rate-limit handling for GitHub API** (60 req/hr unauthenticated) | Dashboard breaks under limit | Detect 403/429; show cached data + retry-after messaging | **Medium** |

---

## Recommended Roadmap (Prioritized)

### Phase 1 — Production Blockers

1. Fix Supabase email-confirmation sign-up flow (B1)
2. Block or gate local preview mode in production builds (S2)
3. Move GitHub token server-side (S1)
4. Add env validation + CI pipeline (P1, P2)
5. Add test suite for auth and CRUD (T2)

### Phase 2 — Quality and Correctness

1. Fix Analytics metric display bug (B2)
2. Unify dark mode implementation (B3)
3. Deduplicate data fetching (D4)
4. Add password reset flow (S3)
5. GitHub rate-limit handling (P12)

### Phase 3 — Maintainability

1. Extract shared CRUD patterns (D1)
2. Add ESLint + TypeScript (T1, T3)
3. Dynamic analytics recommendations (T4)
4. GitHub OAuth (P3)

---

## Conclusion

DevDNA is a **well-structured, demo-ready React SaaS scaffold** with a clear product vision and sensible layering. The dual Supabase/local adapter pattern is a standout design choice for developer experience.

For production, the highest-risk gaps are **auth edge cases (email confirmation)**, **client-exposed secrets**, **local preview mode accidentally deployed live**, and **absence of automated testing and CI**. Addressing those items, along with the Analytics display bug and duplicate fetching, would move the project from "polished prototype" to "deployable MVP."

For beginners, the codebase is an excellent study in **layered React architecture**: start with components and pages, progress through context and routing, then tackle hooks, services, and the Supabase/local adapter pattern.
