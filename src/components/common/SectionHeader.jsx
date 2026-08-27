function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
            ></span>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;
