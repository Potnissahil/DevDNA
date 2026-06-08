function FullScreenLoader({ label }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface)] px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-3xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))]" />
        <p className="mt-5 text-sm font-medium tracking-[0.16em] text-[var(--text-secondary)]">
          {label}
        </p>
      </div>
    </div>
  );
}

export default FullScreenLoader;
