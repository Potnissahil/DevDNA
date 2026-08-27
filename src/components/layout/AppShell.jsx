import { useState } from "react";
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

const DESKTOP_NAV_QUERY = "(min-width: 1024px)";

function AppShell() {
  const { profile, signOut, authMode } = useAuth();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const toggleNav = () => setIsNavOpen((prev) => !prev);
  const closeNavOnMobile = () => {
    if (!window.matchMedia(DESKTOP_NAV_QUERY).matches) {
      setIsNavOpen(false);
    }
  };

  const userInitials = (profile?.full_name || "Dev DNA")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] flex-col lg:flex-row">
        <aside
          className={`app-sidebar relative shrink-0 border-b border-[var(--border)] bg-[var(--sidebar)] px-5 py-6 backdrop-blur-xl transition-all duration-300 ease-in-out lg:min-h-screen lg:border-b-0 lg:border-r ${
            isNavOpen ? "lg:w-[252px] xl:w-[260px]" : "lg:w-[88px] lg:px-4"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 ${
              isNavOpen ? "" : "lg:justify-center"
            }`}
          >
            <div
              className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out lg:flex-none ${
                isNavOpen
                  ? "opacity-100 lg:max-h-[260px] lg:w-[156px] xl:w-[164px]"
                  : "opacity-100 lg:pointer-events-none lg:max-h-0 lg:w-0 lg:opacity-0"
              }`}
            >
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
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleNav}
                aria-expanded={isNavOpen}
                aria-controls="devdna-navigation"
                aria-label={isNavOpen ? "Collapse navigation" : "Expand navigation"}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] lg:absolute lg:left-full lg:top-9 lg:z-30 lg:h-9 lg:w-9 lg:-translate-x-1/2 lg:rounded-full lg:border-[var(--border-strong)] lg:bg-[var(--panel)] lg:shadow-[0_10px_24px_-10px_rgba(2,8,23,0.5)] lg:hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-5 w-5 lg:h-4 lg:w-4">
                  <line
                    x1="4"
                    y1="7"
                    x2="20"
                    y2="7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      transform: isNavOpen ? "translateY(5px) rotate(45deg)" : "none",
                      transition: "transform 300ms ease-in-out"
                    }}
                  />
                  <line
                    x1="4"
                    y1="12"
                    x2="20"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      transform: isNavOpen ? "scaleX(0)" : "none",
                      opacity: isNavOpen ? 0 : 1,
                      transition: "transform 300ms ease-in-out, opacity 300ms ease-in-out"
                    }}
                  />
                  <line
                    x1="4"
                    y1="17"
                    x2="20"
                    y2="17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    style={{
                      transformBox: "fill-box",
                      transformOrigin: "center",
                      transform: isNavOpen ? "translateY(-5px) rotate(-45deg)" : "none",
                      transition: "transform 300ms ease-in-out"
                    }}
                  />
                </svg>
              </button>
              <div className={isNavOpen ? "" : "lg:hidden"}>
                <ThemeToggle />
              </div>
            </div>
          </div>

          <nav
            id="devdna-navigation"
            className={`grid gap-2 overflow-hidden transition-all duration-300 ease-in-out sm:grid-cols-2 lg:grid-cols-1 ${
              isNavOpen
                ? "mt-6 max-h-[420px] opacity-100 lg:mt-8"
                : "invisible mt-0 max-h-0 opacity-0"
            }`}
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={closeNavOnMobile}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "nav-link-active text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div
            className={`overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur transition-all duration-300 ease-in-out ${
              isNavOpen
                ? "mt-5 max-h-[280px] opacity-100"
                : "invisible mt-0 max-h-0 border-0 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[linear-gradient(135deg,var(--accent-soft),transparent)] text-xs font-bold uppercase tracking-wide text-[var(--accent)]"
              >
                {userInitials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {profile?.full_name || "Workspace profile"}
                </p>
                <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
                  {profile?.role || "Engineer"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill tone={authMode === "supabase" ? "success" : "warning"}>
                {authMode === "supabase" ? "Supabase connected" : "Demo mode"}
              </StatusPill>
            </div>
          </div>
        </aside>

        <div className="relative min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/85 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-7 xl:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  Welcome back.
                </p>
                <h2 className="mt-1.5 text-[1.55rem] font-semibold leading-tight xl:text-[1.7rem]">
                  Here&apos;s your current progress.
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={() => navigate("/architecture")}>
                  View architecture
                </Button>
                <Button variant="ghost" onClick={signOut}>
                  Log out
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-7 lg:py-7 xl:px-8 xl:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
