# DevDNA Architecture

## Overview

DevDNA is a Vite-powered React SPA that uses React Router for navigation, context providers for shared application state, and a small service layer for external integrations.

## Frontend

- `src/app/App.jsx` defines the lazy-loaded route tree.
- `src/components/layout/AppShell.jsx` provides the responsive SaaS shell.
- `src/contexts/*` manage authentication, theming, and toast notifications.
- `src/pages/*` contain feature pages for analytics, GitHub, learning, skills, projects, architecture review, and profile settings.

## Backend

- Supabase Auth handles signup, login, logout, and session persistence.
- Supabase Postgres stores user-owned entities such as profiles, skills, learning goals, and projects.
- Row-level security policies ensure users can only access their own data.

## Data Layer

- `src/services/authService.js` wraps authentication.
- `src/services/profileService.js` manages profile bootstrap and updates.
- `src/services/dataService.js` provides generic CRUD operations for tracked collections.
- `src/services/githubService.js` aggregates public GitHub data and optional token-based requests.

## Fallback Strategy

When Supabase credentials are missing, the app switches to local preview mode. This keeps the product functional for design review, local QA, and frontend development while clearly surfacing that cloud persistence is not yet enabled.

## Performance

- Route-based code splitting with `React.lazy`
- Reusable presentational components
- Skeleton loading states
- Minimal dependency footprint

## Security

- Keep only public anon keys in the client
- Enable Supabase RLS on all tables
- Add email verification in Supabase Auth
- Move sensitive GitHub enrichment to serverless functions if private data is introduced
