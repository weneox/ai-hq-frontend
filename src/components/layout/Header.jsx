import {
  Bell,
  Menu,
  Search,
  Activity,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

function Divider({ className = "" }) {
  return (
    <div
      className={[
        "hidden lg:block h-8 w-px shrink-0 bg-gradient-to-b from-transparent via-white/[0.07] to-transparent",
        className,
      ].join(" ")}
    />
  );
}

function SearchZone() {
  return (
    <motion.div
      {...fade}
      transition={{ ...fade.transition, delay: 0.03 }}
      className="relative min-w-0 flex-1 max-w-[760px]"
    >
      <div className="absolute inset-0 rounded-[18px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))]" />
      <div className="absolute inset-[1px] rounded-[17px] bg-[linear-gradient(180deg,rgba(5,10,19,0.96),rgba(4,8,16,0.90))]" />
      <div className="pointer-events-none absolute left-[54px] top-1/2 h-7 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent" />

      <div className="relative flex h-[46px] items-center px-2.5">
        <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.03] text-white/68 ring-1 ring-white/[0.05]">
          <Search className="h-[14px] w-[14px]" />
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

function LiveBlock() {
  return (
    <motion.div
      {...fade}
      transition={{ ...fade.transition, delay: 0.08 }}
      className="hidden xl:flex items-center gap-2.5"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.82)]" />
      </span>

      <div className="leading-none">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
          Live System
        </div>
        <div className="mt-1 text-[10px] tracking-[0.06em] text-white/34">
          Operational layer stable
        </div>
      </div>
    </motion.div>
  );
}

function ShellBlock() {
  return (
    <motion.div
      {...fade}
      transition={{ ...fade.transition, delay: 0.12 }}
      className="hidden 2xl:flex items-center gap-2.5"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.03] ring-1 ring-white/[0.05]">
        <Activity className="h-[13px] w-[13px] text-cyan-200/75" />
      </div>

      <div className="leading-none">
        <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70">
          Executive Shell
        </div>
        <div className="mt-1 text-[10px] tracking-[0.06em] text-white/32">
          Strategic access enabled
        </div>
      </div>
    </motion.div>
  );
}

function AlertButton() {
  return (
    <motion.button
      {...fade}
      transition={{ ...fade.transition, delay: 0.16 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] bg-white/[0.03] text-white/72 ring-1 ring-white/[0.06] transition duration-300 hover:bg-white/[0.055] hover:text-white"
    >
      <Bell className="h-[15px] w-[15px]" />
      <span className="absolute right-[7px] top-[7px] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.95)]" />
    </motion.button>
  );
}

function EnterLayerButton() {
  return (
    <motion.button
      {...fade}
      transition={{ ...fade.transition, delay: 0.2 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.985 }}
      className="group relative hidden h-[44px] shrink-0 items-center gap-2.5 rounded-[16px] px-4 lg:inline-flex"
    >
      <div className="absolute inset-0 rounded-[16px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.032),rgba(255,255,255,0.01))]" />
      <div className="absolute inset-[1px] rounded-[15px] bg-[linear-gradient(180deg,rgba(8,14,27,0.96),rgba(6,11,21,0.88))]" />

      <div className="relative flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-cyan-200/80 ring-1 ring-white/[0.05]">
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

        <ChevronRight className="h-4 w-4 text-white/46 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white/72" />
      </div>
    </motion.button>
  );
}

export default function Header({ onMenuClick }) {
  return (
    <header className="fixed inset-x-0 top-0 z-[120] border-b border-white/[0.06] bg-[rgba(3,7,15,0.82)] backdrop-blur-[22px]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.010)_40%,rgba(255,255,255,0.006)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_8%_-140%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(700px_circle_at_92%_-140%,rgba(99,102,241,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative flex h-[var(--header-h)] items-center gap-3 px-3 md:gap-4 md:pl-[calc(var(--sidebar-w)+14px)] md:pr-5 xl:pr-6">
        <motion.button
          {...fade}
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white/[0.03] text-white/70 ring-1 ring-white/[0.06] transition duration-300 hover:bg-white/[0.05] hover:text-white md:hidden"
        >
          <Menu className="h-[18px] w-[18px]" />
        </motion.button>

        <SearchZone />

        <Divider className="xl:block" />
        <LiveBlock />

        <Divider className="2xl:block" />
        <ShellBlock />

        <Divider className="lg:block" />
        <AlertButton />

        <EnterLayerButton />
      </div>
    </header>
  );
}