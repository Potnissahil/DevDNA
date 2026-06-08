# DevDNA

DevDNA is a production-ready SaaS-style React application for developer growth intelligence. It combines authentication, profile management, GitHub analytics, learning goals, skills tracking, project tracking, architecture review, light/dark theming, and cloud-ready Supabase persistence in one polished workspace.

## Features

- Supabase-ready authentication with sign up, login, logout, protected routes, and session persistence
- Supabase-ready CRUD for profiles, skills, learning goals, and projects
- Graceful local preview mode when Supabase environment variables are not configured
- GitHub analytics dashboard for repositories, language distribution, public activity, and profile metrics
- Functional architecture review experience with system topology and recommendation cards
- Responsive SaaS UI with reusable components, toast notifications, skeleton states, and dark mode persistence
- Lazy-loaded routes and reusable service abstractions for maintainability

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- React Router DOM
- Supabase JavaScript client

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add your credentials.

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Environment Variables

- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/public key
- `VITE_GITHUB_TOKEN`: optional GitHub token for higher API rate limits

## Project Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Database Schema](database/schema.sql)

## Production Notes

- Without Supabase credentials, the app runs in local preview mode using browser storage so all UI flows remain functional during development.
- For production, enable Supabase Auth email flows, apply the SQL schema, and configure your hosting environment variables.
