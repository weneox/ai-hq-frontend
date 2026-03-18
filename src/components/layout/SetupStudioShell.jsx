export default function SetupStudioShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#edf2f8] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7fafc_0%,#eef3f8_40%,#e9eff6_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(125,211,252,0.16),transparent_22%),radial-gradient(circle_at_100%_0%,rgba(165,180,252,0.16),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.9),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />

      <div className="pointer-events-none absolute -left-20 top-10 h-[320px] w-[320px] rounded-full bg-cyan-200/35 blur-[90px]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-[360px] w-[360px] rounded-full bg-indigo-200/30 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-white/80 blur-[110px]" />

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}