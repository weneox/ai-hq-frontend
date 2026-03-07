import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  CircleGauge,
  Command,
  Orbit,
  ScanEye,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ExecutiveMark3D from "./ExecutiveMark3D.jsx";

const NAV_ITEMS = [
  { label: "Command", icon: Command, to: "/" },
  { label: "Analytics", icon: CircleGauge, to: "/analytics" },
  { label: "Proposals", icon: BriefcaseBusiness, to: "/proposals" },
  { label: "Executions", icon: Orbit, to: "/executions" },
  { label: "Agents", icon: Bot, to: "/agents" },
  { label: "Threads", icon: ScanEye, to: "/threads" },
  { label: "Settings", icon: SlidersHorizontal, to: "/settings" },
];

const COLLAPSED_W = 76;
const EXPANDED_W = 232;
const LABEL_W = 128;
const ICON_COL_W = 52;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Reveal({ expanded, children, className = "" }) {
  return (
    <div
      className={cn("min-w-0 overflow-hidden", className)}
      style={{
        width: expanded ? LABEL_W : 0,
        opacity: expanded ? 1 : 0,
        transform: expanded ? "translateX(0px)" : "translateX(-6px)",
        transition:
          "width 360ms cubic-bezier(0.22,1,0.36,1), opacity 150ms ease, transform 220ms cubic-bezier(0.22,1,0.36,1)",
      }}
      aria-hidden={!expanded}
    >
      {children}
    </div>
  );
}

function RailTop({ expanded }) {
  return (
    <div className={cn("px-2", expanded ? "pt-4 pb-3" : "pt-4 pb-4")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[18px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.006))]",
          expanded ? "px-3 py-3" : "mx-auto flex h-[52px] w-[52px] items-center justify-center"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_circle_at_50%_0%,rgba(99,102,241,0.10),transparent_52%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

        {expanded ? (
          <div className="relative flex items-center gap-3">
            <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[14px] bg-white/[0.035] ring-1 ring-white/[0.06]">
              <ExecutiveMark3D className="h-[24px] w-[24px]" />
            </div>

            <div className="min-w-0">
              <div className="truncate text-[10px] uppercase tracking-[0.22em] text-white/38">
                AI Headquarters
              </div>
              <div className="truncate pt-1 text-[13px] font-semibold tracking-[-0.02em] text-white/92">
                Command Center
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            <ExecutiveMark3D className="h-[24px] w-[24px]" />
          </div>
        )}
      </div>
    </div>
  );
}

function NavIcon({ Icon, active }) {
  return (
    <div
      className={cn(
        "relative flex h-[38px] w-[38px] items-center justify-center rounded-[13px] transition-all duration-300",
        active
          ? "bg-white/[0.045] text-white ring-1 ring-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-transparent text-white/56"
      )}
    >
      {active && (
        <div className="pointer-events-none absolute inset-0 rounded-[13px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_55%)]" />
      )}
      <Icon
        className={cn("relative", active ? "h-[15px] w-[15px]" : "h-[14px] w-[14px]")}
        strokeWidth={1.9}
      />
    </div>
  );
}

function NavItem({ item, expanded, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center transition-all duration-300",
          expanded ? "h-[52px] rounded-[16px] px-2.5" : "h-[54px] justify-center rounded-[16px]",
          isActive ? "text-white" : "text-white/60 hover:text-white/86"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              "absolute transition-all duration-300",
              expanded
                ? "inset-0 rounded-[16px]"
                : "inset-x-2 inset-y-1 rounded-[16px]",
              isActive
                ? "bg-white/[0.03] ring-1 ring-white/[0.05]"
                : "bg-transparent group-hover:bg-white/[0.015]"
            )}
          />

          <div
            className={cn(
              "absolute left-[10px] top-1/2 -translate-y-1/2 rounded-full transition-all duration-300",
              expanded ? "h-[20px] w-px" : "h-[24px] w-px",
              isActive ? "bg-cyan-200/60 opacity-100" : "opacity-0"
            )}
          />

          <div
            className={cn(
              "relative flex shrink-0 items-center justify-center",
              expanded ? `w-[${ICON_COL_W}px]` : "w-full"
            )}
            style={expanded ? { width: ICON_COL_W } : undefined}
          >
            <NavIcon Icon={Icon} active={isActive} />
          </div>

          <Reveal expanded={expanded} className="flex-1">
            <div className="flex min-w-0 items-center justify-between">
              <span
                className={cn(
                  "truncate text-[13px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive ? "text-white/94" : "text-white/62 group-hover:text-white/88"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "ml-3 h-[13px] w-[13px] shrink-0 transition-all duration-300",
                  isActive
                    ? "text-white/30"
                    : "text-white/14 group-hover:translate-x-0.5 group-hover:text-white/22"
                )}
              />
            </div>
          </Reveal>
        </>
      )}
    </NavLink>
  );
}

function RailNav({ expanded, onNavigate }) {
  return (
    <nav className="px-2 pt-1">
      <div className="space-y-1.5">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.to}
            item={item}
            expanded={expanded}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

function RailFooter({ expanded }) {
  return (
    <div className={cn(expanded ? "px-3 pb-4 pt-4" : "px-2 pb-4 pt-4")}>
      {expanded ? (
        <div className="flex items-center gap-3 rounded-[16px] border border-white/[0.04] bg-white/[0.018] px-2.5 py-2.5">
          <div className="relative flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[12px] bg-white/[0.03] ring-1 ring-white/[0.05]">
            <ShieldCheck className="h-[14px] w-[14px] text-white/78" />
            <span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-emerald-300/90" />
          </div>

          <div className="min-w-0">
            <div className="truncate text-[10px] uppercase tracking-[0.20em] text-white/40">
              Secure Rail
            </div>
            <div className="truncate pt-0.5 text-[11px] text-white/64">
              Private operational layer
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="relative flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-white/[0.02] ring-1 ring-white/[0.05]">
            <ShieldCheck className="h-[14px] w-[14px] text-white/78" />
            <span className="absolute right-[8px] top-[8px] h-1.5 w-1.5 rounded-full bg-emerald-300/90" />
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopSidebar({ expanded, setExpanded }) {
  const shouldReduceMotion = useReducedMotion();
  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const handleEnter = () => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setExpanded(true), 70);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setExpanded(false), 110);
  };

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="fixed left-0 hidden md:block z-[90]"
      style={{
        top: "var(--header-h)",
        height: "calc(100vh - var(--header-h))",
      }}
    >
      <motion.div
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative h-full overflow-hidden border-r border-white/[0.05] bg-[rgba(4,8,18,0.76)] backdrop-blur-[22px] will-change-[width]"
        style={{
          boxShadow: expanded
            ? "20px 0 56px rgba(0,0,0,0.34)"
            : "10px 0 26px rgba(0,0,0,0.18)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,10,22,0.94),rgba(3,7,16,0.98))]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(220px_circle_at_50%_0%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(260px_circle_at_50%_100%,rgba(34,211,238,0.04),transparent_45%)]" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        <div className="relative flex h-full flex-col">
          <RailTop expanded={expanded} />
          <RailNav expanded={expanded} />
          <div className="mt-auto">
            <RailFooter expanded={expanded} />
          </div>
        </div>
      </motion.div>
    </aside>
  );
}

function MobileBrand() {
  return (
    <div className="flex items-center gap-3 px-4 pt-5">
      <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[18px] bg-white/[0.03] ring-1 ring-white/[0.06] shadow-[0_12px_30px_rgba(0,0,0,0.20)]">
        <ExecutiveMark3D className="h-[32px] w-[32px]" />
      </div>

      <div className="min-w-0">
        <div className="truncate text-[10px] uppercase tracking-[0.24em] text-white/40">
          AI Headquarters
        </div>
        <div className="truncate pt-1 text-[15px] font-semibold tracking-[-0.025em] text-white/94">
          Command Center
        </div>
      </div>
    </div>
  );
}

function MobileSidebar({ setMobileOpen }) {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      exit={{ x: -280 }}
      transition={{ type: "spring", stiffness: 240, damping: 30 }}
      className="fixed inset-y-0 left-0 z-[140] w-[250px] md:hidden"
    >
      <div className="relative h-full overflow-hidden border-r border-white/[0.05] bg-[rgba(5,8,22,0.96)] backdrop-blur-[24px] shadow-[20px_0_60px_rgba(0,0,0,0.38)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.98),rgba(4,8,20,0.98))]" />

        <div className="relative flex items-start justify-between px-1 pt-1">
          <div className="min-w-0 flex-1">
            <MobileBrand />
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="mt-4 mr-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.04] text-white/84 ring-1 ring-white/[0.06] transition hover:bg-white/[0.07]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-3 flex h-[calc(100%-100px)] flex-col">
          <RailNav expanded onNavigate={() => setMobileOpen(false)} />
          <div className="mt-auto">
            <RailFooter expanded />
          </div>
        </div>
      </div>
    </motion.aside>
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
      <DesktopSidebar expanded={expanded} setExpanded={setExpanded} />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[130] bg-black/56 backdrop-blur-sm md:hidden"
            />
            <MobileSidebar setMobileOpen={setMobileOpen} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}