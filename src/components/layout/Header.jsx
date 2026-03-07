import {
  Bell,
  Menu,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

const COLLAPSED_W = 74;
const EXPANDED_W = 286;

function SearchZone() {
  return (
    <motion.div
      {...fade}
      transition={{ ...fade.transition, delay: 0.05 }}
      className="relative min-w-0 flex-1"
    >
      <div className="absolute inset-0 rounded-[20px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.016),rgba(255,255,255,0.005))]" />
      <div className="absolute inset-[1px] rounded-[19px] bg-[linear-gradient(180deg,rgba(3,7,15,0.90),rgba(3,7,16,0.94))]" />
      <div className="pointer-events-none absolute inset-0 rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.028)]" />
      <div className="pointer-events-none absolute left-[52px] top-1/2 h-7 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

      <div className="relative flex h-[50px] items-center px-2.5">
        <div className="mr-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] text-white/48">
          <Search className="h-[15px] w-[15px]" />
        </div>

        <input
          type="text"
          placeholder="Search flows, agents, signals, incidents..."
          className="w-full bg-transparent pr-3 text-[13px] font-medium tracking-[0.01em] text-white/88 outline-none placeholder:text-white/28"
        />
      </div>
    </motion.div>
  );
}

function StatusStrip() {
  return (
    <motion.div
      {...fade}
      transition={{ ...fade.transition, delay: 0.09 }}
      className="hidden 2xl:flex items-center gap-2.5 px-3"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.82)]" />
      </span>

      <div className="leading-none">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/78">
          Live System
        </div>
        <div className="mt-1 text-[10px] tracking-[0.05em] text-white/34">
          Operational layer stable
        </div>
      </div>
    </motion.div>
  );
}

function AlertButton() {
  return (
    <motion.button
      {...fade}
      transition={{ ...fade.transition, delay: 0.13 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-white/68 transition duration-300 hover:text-white"
    >
      <div className="absolute inset-0 rounded-[14px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.016),rgba(255,255,255,0.006))]" />
      <div className="absolute inset-[1px] rounded-[13px] bg-[linear-gradient(180deg,rgba(3,7,15,0.90),rgba(3,7,16,0.94))]" />
      <Bell className="relative h-[15px] w-[15px]" />
      <span className="absolute right-[8px] top-[8px] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.95)]" />
    </motion.button>
  );
}

function EnterLayerButton() {
  return (
    <motion.button
      {...fade}
      transition={{ ...fade.transition, delay: 0.16 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className="group relative hidden h-[46px] shrink-0 items-center gap-2.5 rounded-[18px] px-4 lg:inline-flex"
    >
      <div className="absolute inset-0 rounded-[18px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))]" />
      <div className="absolute inset-[1px] rounded-[17px] bg-[linear-gradient(180deg,rgba(3,7,15,0.90),rgba(3,7,16,0.94))]" />
      <div className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]" />

      <div className="relative flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[12px] text-cyan-200/80">
          <ShieldCheck className="h-[14px] w-[14px]" />
        </div>

        <div className="text-left leading-none">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
            Enter Layer
          </div>
          <div className="mt-1 text-[10px] tracking-[0.05em] text-white/34">
            Secure executive access
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-white/42 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white/70" />
      </div>
    </motion.button>
  );
}

export default function Header({ onMenuClick, expanded }) {
  return (
    <header className="fixed inset-x-0 top-0 z-[120] h-[var(--header-h)]">
      <div className="absolute inset-0 bg-[rgba(3,7,15,0.975)] backdrop-blur-[28px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008)_42%,rgba(255,255,255,0.002)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_circle_at_0%_-120%,rgba(34,211,238,0.05),transparent_28%),radial-gradient(760px_circle_at_100%_-120%,rgba(99,102,241,0.05),transparent_30%)]" />

      <motion.div
        animate={{
          paddingLeft: expanded ? `${EXPANDED_W + 18}px` : `${COLLAPSED_W + 18}px`,
        }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-full items-center gap-3 pr-3 md:pr-4 xl:pr-5"
      >
        <motion.button
          {...fade}
          onClick={onMenuClick}
          className="relative ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] text-white/72 transition duration-300 hover:text-white md:hidden"
        >
          <div className="absolute inset-0 rounded-[14px] border border-white/[0.05] bg-white/[0.02]" />
          <Menu className="relative h-[18px] w-[18px]" />
        </motion.button>

        <SearchZone />

        <div className="hidden xl:block h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
        <StatusStrip />

        <div className="hidden lg:block h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
        <AlertButton />
        <EnterLayerButton />
      </motion.div>
    </header>
  );
}