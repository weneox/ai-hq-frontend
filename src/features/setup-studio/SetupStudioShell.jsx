export default function SetupStudioShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f7faff_0%,#f3f7fc_44%,#edf2f8_100%)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.78),transparent_34%),radial-gradient(circle_at_18%_46%,rgba(197,220,255,.18),transparent_26%),radial-gradient(circle_at_82%_40%,rgba(226,210,255,.14),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(191,215,245,.18),transparent_30%)]" />
        <div className="absolute inset-x-0 bottom-[-8%] h-[42%] bg-[radial-gradient(ellipse_at_center,rgba(184,208,242,.26),transparent_62%)] blur-2xl" />
        <div className="absolute left-[-8%] top-[24%] h-[340px] w-[340px] rounded-full bg-sky-200/12 blur-3xl" />
        <div className="absolute right-[-6%] top-[22%] h-[320px] w-[320px] rounded-full bg-violet-200/12 blur-3xl" />
        <div className="absolute left-1/2 top-[-120px] h-[240px] w-[520px] -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}