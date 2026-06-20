import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import Button from "../common/Button";
import StatusPill from "../common/StatusPill";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/analytics", label: "Analytics" },
  { to: "/github", label: "GitHub Activity" },
  { to: "/learning", label: "Learning Goals" },
  { to: "/skills", label: "Skills" },
  { to: "/projects", label: "Projects" },
  { to: "/settings", label: "Profile" }
];

function AppShell() {
  const { profile, signOut, authMode } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <div className="mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[252px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-[var(--border)] bg-[var(--sidebar)] px-5 py-6 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-5 xl:px-6">
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--accent)]">
                DevDNA
              </p>
              <h1 className="mt-3 max-w-[13rem] text-2xl font-semibold leading-tight">
                Developer progress tracker
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                Track skills, learning goals, projects, GitHub activity, and profile details in one workspace.
              </p>
            </div>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>

          <nav className="mt-6 grid gap-2 sm:grid-cols-2 lg:mt-8 lg:grid-cols-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-[0_14px_34px_rgba(10,102,194,0.22)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--panel)] hover:text-[var(--text-primary)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-5 rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {profile?.full_name || "Workspace profile"}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {profile?.role || "Engineer"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill tone={authMode === "supabase" ? "success" : "warning"}>
                {authMode === "supabase" ? "Supabase connected" : "Demo mode"}
              </StatusPill>
            </div>
          </div>
        </aside>

        <div className="relative">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-7 xl:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Welcome back.
                </p>
                <h2 className="text-2xl font-semibold">Here&apos;s your current progress.</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>
                <Button variant="secondary" onClick={() => navigate("/architecture")}>
                  View architecture
                </Button>
                <Button variant="ghost" onClick={signOut}>
                  Log out
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-7 xl:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
