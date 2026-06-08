# Setup Guide

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Create a `.env` file from `.env.example` and fill in:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GITHUB_TOKEN` (optional)

## 3. Create Supabase tables

Run the SQL in [database/schema.sql](../database/schema.sql) inside the Supabase SQL editor.

## 4. Start the app

```bash
npm run dev
```

## 5. Verify key flows

- Sign up or log in
- Update the profile with a GitHub username
- Add skills, learning goals, and projects
- Open the architecture review page
- Toggle between light and dark mode
