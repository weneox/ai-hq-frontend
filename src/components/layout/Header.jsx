import {
  Bell,
  Command,
  Menu,
  Search,
  Sparkles,
  WifiHigh,
} from "lucide-react";
import { motion } from "framer-motion";

function TopPill({ icon: Icon, children, tone = "default" }) {
  const tones = {
    default:
      "border-white/[0.08] bg-white/[0.04] text-white/72",
    success:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200/90",
    subtle:
      "border-white/[0.06] bg-white/[0.03] text-white/52",
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
        "group relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-[16px]",
        "border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))]",
        "text-white/74 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        "transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white",
        className,
      ].join(" ")}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(180px_circle_at_0%_0%,rgba(34,211,238,0.10),transparent_42%)]" />
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}

export default function Header({ onMenuClick }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,12,22,0.84),rgba(5,9,18,0.72))] shadow-[0_20px_70px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_28%),radial-gradient(620px_circle_at_100%_0%,rgba(99,102,241,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_32%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.20),transparent)]" />

      <div className="relative px-4 py-4 md:px-5 md:py-4 lg:px-6 lg:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="md:hidden">
              <IconButton onClick={onMenuClick} aria-label="Open navigation">
                <Menu className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </IconButton>
            </div>

            <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-cyan-100/88 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <Command className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="truncate text-[11px] font-semibold uppercase tracking-[0.28em] text-white/48">
                  AI Headquarters
                </div>
                <TopPill icon={WifiHigh} tone="success">
                  Connected
                </TopPill>
              </div>

              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="truncate text-[20px] font-semibold tracking-[-0.05em] text-white md:text-[24px]">
                  Executive Workspace
                </h1>

                <div className="hidden sm:block h-4 w-px bg-white/[0.08]" />

                <div className="hidden sm:flex items-center gap-2 text-[12px] text-white/42">
                  <span>Draft</span>
                  <span className="text-white/22">→</span>
                  <span>Approve</span>
                  <span className="text-white/22">→</span>
                  <span>Publish</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <div className="hidden lg:flex items-center gap-2">
              <TopPill icon={Sparkles} tone="subtle">
                Calm premium flow
              </TopPill>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                className="group relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-[16px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-3.5 text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(220px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_42%)]" />
                <Search className="relative z-[1] h-[16px] w-[16px]" strokeWidth={1.9} />
                <span className="relative z-[1] text-[12px] font-medium">
                  Search
                </span>
              </button>
            </div>

            <IconButton aria-label="Notifications">
              <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
            </IconButton>
          </div>
        </div>
      </div>
    </motion.header>
  );
}