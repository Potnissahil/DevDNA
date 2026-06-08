export const architectureSections = [
  {
    title: "Project Overview",
    description:
      "DevDNA is structured as a single-page SaaS application with a protected workspace, cloud-ready data layer, and graceful local preview mode for development without credentials."
  },
  {
    title: "Frontend Architecture",
    description:
      "Vite powers the build, React Router handles navigation, context providers manage authentication, theming, and toasts, and page-level modules are lazy loaded for better performance."
  },
  {
    title: "Backend Architecture",
    description:
      "Supabase provides authentication, Postgres-backed data storage, row-level security, and a simple API surface. The browser app can operate against Supabase or a local storage adapter during setup."
  },
  {
    title: "Database Design",
    description:
      "Profiles, skills, learning goals, and projects are normalized into user-owned tables. Each record is tied to auth.users through user_id and guarded with row-level security policies."
  },
  {
    title: "API Layer",
    description:
      "The client uses a compact service layer for auth, profile persistence, CRUD operations, and GitHub analytics. This keeps page components focused on product behavior rather than transport details."
  },
  {
    title: "Authentication Flow",
    description:
      "Users sign up or log in through Supabase Auth, sessions persist automatically, protected routes redirect unauthenticated visitors to the auth screen, and profile records are provisioned on first access."
  },
  {
    title: "Security Recommendations",
    description:
      "Enable email verification, configure row-level security, store only anon keys in the client, add rate limiting at the edge, and move sensitive GitHub aggregation to a serverless function for higher trust environments."
  },
  {
    title: "Performance Recommendations",
    description:
      "Use lazy loading, keep presentational components reusable, cache remote fetches, and paginate large GitHub repository collections when scaling to enterprise-sized accounts."
  },
  {
    title: "Scalability Suggestions",
    description:
      "Introduce feature modules, background jobs for repository sync, server-side analytics snapshots, audit logging, and multitenant workspace support as the product matures."
  }
];
