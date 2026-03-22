export default function SetupStudioShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_10%,rgba(191,219,254,0.22),transparent_22%),radial-gradient(circle_at_88%_8%,rgba(196,181,253,0.12),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.84),transparent_28%),linear-gradient(180deg,#fbfcff_0%,#f4f7fb_50%,#edf2f8_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(255,255,255,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.26)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="absolute -left-24 top-12 h-[320px] w-[320px] rounded-full bg-sky-200/25 blur-3xl" />
        <div className="absolute left-1/2 top-[-140px] h-[280px] w-[560px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute -right-24 top-16 h-[320px] w-[320px] rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/2 h-[260px] w-[560px] -translate-x-1/2 rounded-full bg-slate-200/30 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_58%,rgba(255,255,255,0.28)_66%,transparent_76%)] opacity-70" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(15,23,42,0.6)_0.6px,transparent_0.6px)] [background-size:18px_18px]" />
      </div>

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}