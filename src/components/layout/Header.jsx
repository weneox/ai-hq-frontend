import {
  Bell,
  Menu,
  Search,
  Activity,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

function StatusPill({ icon: Icon, label, tone = "default" }) {
  const toneClasses =
    tone === "live"
      ? "border-emerald-300/15 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.02))] text-white/72"
      : "border-cyan-300/10 bg-[linear-gradient(180deg,rgba(103,232,249,0.06),rgba(255,255,255,0.02))] text-white/60";

  return (
    <motion.div
      whileHover={{ y: -1.5, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={[
        "group relative inline-flex h-[50px] items-center gap-2.5 rounded-[18px] border px-4",
        "shadow-[0_12px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]",
        "backdrop-blur-xl",
        toneClasses,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.008))]" />
      <div className="relative flex items-center gap-2.5">
        {tone === "live" ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/45" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
          </span>
        ) : (
          <Icon className="h-[13px] w-[13px] text-cyan-200/75" />
        )}

        <span className="text-[10px] font-semibold uppercase tracking-[0.30em]">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export default function Header({ onMenuClick }) {
  return (
    <div className="fixed left-0 right-0 top-0 z-40 px-4 pt-3 md:px-6 md:pt-4">
      <header className="relative mx-auto overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,14,28,0.88),rgba(5,9,20,0.80))] shadow-[0_24px_90px_rgba(0,0,0,0.45),0_1px_0_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-3xl md:ml-[86px]">
        <div className="pointer-events-none absolute inset-0 rounded-[34px] bg-[radial-gradient(700px_circle_at_0%_0%,rgba(67,97,238,0.16),transparent_24%),radial-gradient(600px_circle_at_100%_0%,rgba(34,211,238,0.10),transparent_22%),radial-gradient(460px_circle_at_50%_-10%,rgba(255,255,255,0.06),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
        <div className="pointer-events-none absolute inset-[1px] rounded-[33px] border border-white/[0.03]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-[16%] w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-cyan-300/[0.06] to-transparent" />
        <div className="pointer-events-none absolute -left-8 top-6 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex h-[88px] items-center gap-3 px-3 md:h-[96px] md:gap-4 md:px-4 xl:px-5">
          <motion.button
            {...fadeUp}
            onClick={onMenuClick}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] text-white/72 shadow-[0_10px_30px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] active:scale-[0.98] md:hidden"
          >
            <Menu className="h-[17px] w-[17px]" />
          </motion.button>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.04 }}
            className="group relative min-w-0 flex-1"
          >
            <div className="absolute inset-0 rounded-[26px] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.014))]" />
            <div className="absolute inset-[1px] rounded-[25px] bg-[linear-gradient(180deg,rgba(8,13,25,0.96),rgba(7,11,22,0.90))]" />
            <div className="pointer-events-none absolute inset-y-[10px] left-[74px] w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="relative flex h-[60px] items-center rounded-[26px] border border-white/[0.08] px-3 pr-3 shadow-[0_20px_50px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 focus-within:border-cyan-300/25 focus-within:shadow-[0_26px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.05)]">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="mr-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <Search className="h-[15px] w-[15px]" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  placeholder="Search flows, agents, signals, incidents..."
                  className="w-full bg-transparent text-[14px] font-medium tracking-[0.01em] text-white/90 outline-none placeholder:text-white/26"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.08 }}
            className="hidden items-center gap-2.5 xl:flex"
          >
            <StatusPill icon={Activity} label="Live System" tone="live" />
            <StatusPill icon={Activity} label="Executive Shell" />
          </motion.div>

          <motion.button
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            whileHover={{ y: -1.5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] text-white/72 shadow-[0_12px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.06]"
          >
            <Bell className="h-[16px] w-[16px] transition duration-300 group-hover:scale-105" />
            <span className="absolute right-[11px] top-[11px] h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.95)]" />
            <span className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_45%)] opacity-70" />
          </motion.button>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.16 }}
            className="hidden 2xl:flex"
          >
            <motion.button
              whileHover={{ y: -1.5, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              className="group inline-flex h-12 items-center gap-2.5 rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 text-[11px] font-medium uppercase tracking-[0.24em] text-white/46 shadow-[0_12px_30px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.05)] transition hover:border-white/[0.12] hover:bg-white/[0.055] hover:text-white/68"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-200/70" />
              Enter Layer
              <ChevronRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        </div>
      </header>
    </div>
  );
}