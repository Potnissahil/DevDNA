function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card animate-pulse p-5">
      <div className="h-4 w-24 rounded-full bg-[var(--panel-muted)]" />
      <div className="mt-4 h-8 w-32 rounded-full bg-[var(--panel-muted)]" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 rounded-full bg-[var(--panel-muted)]"
            style={{ width: `${100 - index * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default SkeletonCard;
