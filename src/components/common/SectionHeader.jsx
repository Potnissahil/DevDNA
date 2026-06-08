function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
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
