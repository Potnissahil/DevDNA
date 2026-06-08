# Deployment Guide

## Vercel

1. Import the project into Vercel.
2. Set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GITHUB_TOKEN` (optional)
3. Use the default build command:

```bash
npm run build
```

4. Output directory:

```bash
dist
```

5. The included `vercel.json` rewrites all routes to `index.html`.

## Netlify

1. Connect the repo or upload the project.
2. Set the same environment variables.
3. Use:

```bash
npm run build
```

4. Publish directory:

```bash
dist
```

5. The included `public/_redirects` file ensures SPA route handling.

## Production Checklist

- Apply `database/schema.sql`
- Enable Supabase email settings
- Confirm GitHub rate limits are acceptable
- Verify auth redirects and protected routes
- Run `npm run build` before release
