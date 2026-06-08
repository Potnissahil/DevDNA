import { useTheme } from "../../contexts/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--panel)] text-lg text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]/50"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}

export default ThemeToggle;
