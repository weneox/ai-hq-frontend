import { AnimatePresence, motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  Bell,
  Binary,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  CircleGauge,
  Command,
  Gem,
  Orbit,
  ScanEye,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Command", icon: Command, to: "/" },
  { label: "Analytics", icon: CircleGauge, to: "/analytics" },
  { label: "Proposals", icon: BriefcaseBusiness, to: "/proposals" },
  { label: "Executions", icon: Orbit, to: "/executions" },
  { label: "Agents", icon: Bot, to: "/agents" },
  { label: "Threads", icon: ScanEye, to: "/threads" },
  { label: "Settings", icon: SlidersHorizontal, to: "/settings" },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function BrandBlock({ expanded }) {
  return (
    <div className="flex h-[84px] items-center px-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <Gem className="h-[17px] w-[17px] text-white" />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="ml-3 min-w-0"
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.34em] text-white/30">
              AI Headquarters
            </div>
            <div className="truncate pt-0.5 text-[14px] font-medium text-white/92">
              Executive Command
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RailNav({ expanded, onNavigate }) {
  return (
    <nav className="px-3 pb-3 pt-2">
      <div className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-[54px] items-center overflow-hidden rounded-[18px] px-4 transition-all duration-300",
                  isActive
                    ? "bg-white/[0.085] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_rgba(0,0,0,0.18)]"
                    : "text-white/34 hover:bg-white/[0.04] hover:text-white/82"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <div className="absolute inset-y-3 left-0 w-px bg-gradient-to-b from-transparent via-cyan-300/80 to-transparent" />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05),transparent_55%)]" />
                    </>
                  )}

                  <div className="relative z-10 flex min-w-[18px] items-center justify-center">
                    <Icon className="h-[17px] w-[17px]" />
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.18 }}
                        className="ml-4 flex min-w-0 flex-1 items-center justify-between"
                      >
                        <span className="truncate text-[14px] font-medium tracking-[0.01em]">
                          {item.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-white/18 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

function RailFooter({ expanded }) {
  return (
    <div className="p-3 pt-2">
      <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-white/26">
                <Binary className="h-3.5 w-3.5" />
                <span>System layer</span>
              </div>
              <div className="mt-2 text-[14px] font-medium text-white/88">
                Adaptive command mode
              </div>
              <div className="mt-1 text-[12px] leading-5 text-white/42">
                Silent by default. Expands only when intention appears.
              </div>
            </motion.div>
          ) : (
            <div className="flex h-[88px] items-center justify-center">
              <Sparkles className="h-4 w-4 text-white/54" />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Sidebar({
  expanded,
  setExpanded,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="fixed inset-y-0 left-0 z-50 hidden md:block w-[72px]"
      >
        <motion.div
          animate={{ width: expanded ? 248 : 72 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-full overflow-hidden border-r border-white/[0.06] bg-[#050816]/96 shadow-[20px_0_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl will-change-[width]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(99,102,241,0.18),transparent_24%),radial-gradient(640px_circle_at_0%_100%,rgba(34,211,238,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/[0.08]" />

          <div className="relative flex h-full flex-col">
            <BrandBlock expanded={expanded} />
            <RailNav expanded={expanded} />
            <div className="mt-auto">
              <RailFooter expanded={expanded} />
            </div>
          </div>
        </motion.div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/62 backdrop-blur-sm md:hidden"
            />

            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="fixed inset-y-0 left-0 z-50 w-[272px] md:hidden"
            >
              <div className="relative h-full overflow-hidden border-r border-white/[0.08] bg-[#050816]/98 shadow-[20px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(99,102,241,0.18),transparent_24%),radial-gradient(640px_circle_at_0%_100%,rgba(34,211,238,0.14),transparent_22%)]" />

                <div className="relative flex items-center justify-between px-4 pt-4">
                  <BrandBlock expanded />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="mr-4 flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/84"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative -mt-2 flex h-[calc(100%-84px)] flex-col">
                  <RailNav expanded onNavigate={() => setMobileOpen(false)} />
                  <div className="mt-auto">
                    <RailFooter expanded />
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}