import { Bell, Menu, Search, WifiHigh } from "lucide-react";

function Pill({ icon: Icon, children, tone = "default" }) {
  const tones = {
    default: "border-white/[0.08] bg-white/[0.04] text-white/68",
    success: "border-emerald-400/16 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium backdrop-blur-xl",
        tones[tone] || tones.default,
      ].join(" ")}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={1.9} /> : null}
      <span>{children}</span>
    </div>
  );
}

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-[15px]",
        "border border-white/[0.08] bg-white/[0.04] text-white/70 backdrop-blur-xl",
        "transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SearchButton() {
  return (
    <button
      type="button"
      className="hidden sm:inline-flex h-10 items-center gap-2 rounded-[15px] border border-white/[0.08] bg-white/[0.04] px-3.5 text-[12px] font-medium text-white/66 backdrop-blur-xl transition hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-white"
    >
      <Search className="h-4 w-4" strokeWidth={1.9} />
      <span>Search</span>
    </button>
  );
}

export default function Header({ onMenuClick }) {
  return (
    <header className="relative rounded-[24px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(7,12,22,0.66),rgba(5,9,18,0.52))] shadow-[0_12px_36px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(680px_circle_at_0%_0%,rgba(34,211,238,0.06),transparent_28%),radial-gradient(620px_circle_at_100%_0%,rgba(99,102,241,0.08),transparent_30%)]" />

      <div className="relative flex items-center justify-between gap-4 px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="md:hidden">
            <IconButton onClick={onMenuClick} aria-label="Open navigation">
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </IconButton>
          </div>

          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-[11px] font-semibold uppercase tracking-[0.26em] text-white/42">
                Executive Workspace
              </span>
              <Pill icon={WifiHigh} tone="success">
                Connected
              </Pill>
            </div>

            <div className="mt-1 text-[12px] text-white/36">
              Draft → Approve → Publish
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SearchButton />

          <IconButton aria-label="Notifications">
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
          </IconButton>
        </div>
      </div>
    </header>
  );
}