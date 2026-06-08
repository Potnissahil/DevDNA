function Button({
  as: Component = "button",
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  const variantClasses = {
    primary:
      "bg-[var(--accent)] text-white shadow-[0_14px_30px_rgba(10,102,194,0.28)] hover:-translate-y-0.5 hover:bg-[var(--accent-strong)]",
    secondary:
      "border border-[var(--border-strong)] bg-[var(--panel)] text-[var(--text-primary)] hover:-translate-y-0.5 hover:border-[var(--accent)]/50",
    ghost:
      "text-[var(--text-secondary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]",
    danger:
      "bg-[#be123c] text-white hover:-translate-y-0.5 hover:bg-[#9f1239]"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-base"
  };

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}

export default Button;
