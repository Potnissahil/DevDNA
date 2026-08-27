function AuthBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-hero-grid opacity-40" />
      <div className="absolute -top-44 left-1/2 h-[480px] w-[720px] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(94,168,255,0.16),transparent)] blur-2xl" />
      <div className="absolute -bottom-40 -right-32 h-[420px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(45,212,191,0.12),transparent)] blur-2xl" />
    </div>
  );
}

export default AuthBackdrop;
