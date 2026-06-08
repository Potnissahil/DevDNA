import { useToasts } from "../../contexts/ToastContext";

function ToastViewport() {
  const { toasts, dismissToast } = useToasts();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-3xl border border-[var(--border-strong)] bg-[var(--panel)] p-4 shadow-[0_18px_42px_rgba(15,23,42,0.16)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {toast.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                {toast.description}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
