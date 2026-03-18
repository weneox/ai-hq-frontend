export default function SetupStudioShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fb] text-[#0f172a]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7f9fc_0%,#f3f6fb_38%,#eef3fa_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(61,210,255,0.12),transparent_28%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.10),transparent_25%),radial-gradient(1200px_circle_at_50%_100%,rgba(137,92,255,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.32] [background-image:linear-gradient(rgba(15,23,42,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.028)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_86%)]" />

      <div className="pointer-events-none absolute left-[-140px] top-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-220px] left-1/2 h-[440px] w-[680px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

      <div className="relative z-10 mx-auto min-h-screen max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}