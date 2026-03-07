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

const COLLAPSED_W = 74;
const EXPANDED_W = 286;
const ICON_COL_W = 74;
const ITEM_H = 56;
const BRAND_H = 92;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ItemGlow({ isActive }) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute left-[13px] top-1/2 h-[28px] w-[2px] -translate-y-1/2 rounded-full transition-all duration-300",
          isActive
            ? "bg-cyan-300/80 opacity-100 shadow-[0_0_16px_rgba(103,232,249,0.32)]"
            : "opacity-0"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-[6px] left-[8px] right-[8px] rounded-[18px] transition-all duration-300",
          isActive
            ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.016)_34%,rgba(255,255,255,0.006)_58%,transparent)]"
            : "bg-transparent group-hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.024),rgba(255,255,255,0.01)_32%,transparent)]"
        )}
      />
    </>
  );
}

function BrandDock({ expanded }) {
  return (
    <div className="relative" style={{ height: BRAND_H }}>
      <div className="relative flex h-full items-center overflow-hidden">
        <div
          className="relative z-[2] flex h-full shrink-0 items-center justify-center"
          style={{ width: ICON_COL_W }}
        >
          <div className="relative flex h-[38px] w-[38px] items-center justify-center">
            <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_68%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.004))]" />
            <div className="absolute inset-0 rounded-[14px] ring-1 ring-white/[0.04]" />
            <ExecutiveMark3D className="relative h-[20px] w-[20px]" />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-[2] min-w-0 flex-1 pr-4"
            >
              <div className="w-[164px] text-[10px] font-semibold uppercase tracking-[0.34em] text-white/52">
                AI HEADQUARTERS
              </div>
              <div className="w-[164px] pt-1 text-[14px] font-semibold tracking-[-0.02em] text-white/96">
                Executive Command
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
      className="group relative block"
    >
      {({ isActive }) => (
        <div className="relative flex items-center overflow-hidden" style={{ height: ITEM_H }}>
          <ItemGlow isActive={isActive} />

          <div
            className="relative z-[2] flex h-full shrink-0 items-center justify-center"
            style={{ width: ICON_COL_W }}
          >
            <div className="relative flex h-[34px] w-[34px] items-center justify-center">
              <Icon
                className={cn(
                  "transition-colors duration-300",
                  isActive
                    ? "h-[15px] w-[15px] text-white"
                    : "h-[14.5px] w-[14.5px] text-white/58 group-hover:text-white/84"
                )}
                strokeWidth={1.9}
              />
            </div>
          </div>

          <div
            className={cn(
              "relative z-[2] min-w-0 flex-1 pr-3 transition-all duration-300",
              expanded
                ? "pointer-events-auto translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "truncate text-[12.8px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive
                    ? "text-white/95"
                    : "text-white/70 group-hover:text-white/88"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-all duration-300",
                  isActive
                    ? "text-white/28"
                    : "text-white/14 group-hover:translate-x-0.5 group-hover:text-white/22"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </NavLink>
  );
}

function RailNav({ expanded, onNavigate }) {
  return (
    <nav className="px-0 pt-3">
      <div className="space-y-2">
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
    <div className="px-0 pb-4 pt-4">
      <div className="group relative flex h-[56px] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-y-[6px] left-[8px] right-[8px] rounded-[18px] bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008)_28%,transparent)]" />

        <div
          className="relative z-[2] flex h-full shrink-0 items-center justify-center"
          style={{ width: ICON_COL_W }}
        >
          <div className="relative flex h-[34px] w-[34px] items-center justify-center">
            <ShieldCheck
              className="h-[14px] w-[14px] text-white/82"
              strokeWidth={1.9}
            />
            <span className="absolute right-[6px] top-[6px] h-[6px] w-[6px] rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.72)]" />
          </div>
        </div>

        <div
          className={cn(
            "relative z-[2] min-w-0 flex-1 pr-3 transition-all duration-300",
            expanded
              ? "pointer-events-auto translate-x-0 opacity-100"
              : "pointer-events-none -translate-x-2 opacity-0"
          )}
        >
          <div className="truncate text-[9.5px] uppercase tracking-[0.24em] text-white/38">
            Secure Rail
          </div>
          <div className="truncate pt-0.5 text-[10.5px] text-white/60">
            Private operational layer
          </div>
        </div>
      </div>
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
    openTimer.current = setTimeout(() => setExpanded(true), 55);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setExpanded(false), 120);
  };

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="fixed left-0 top-0 z-[130] hidden md:block"
      style={{ height: "100vh" }}
    >
      <motion.div
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative h-full overflow-hidden"
        style={{ willChange: "width" }}
      >
        <div className="absolute inset-0 rounded-r-[30px] bg-[linear-gradient(180deg,rgba(3,7,15,0.975),rgba(3,7,16,0.992))]" />
        <div className="absolute inset-0 rounded-r-[30px] backdrop-blur-[28px]" />
        <div className="absolute inset-0 rounded-r-[30px] bg-[radial-gradient(240px_circle_at_0%_0%,rgba(34,211,238,0.045),transparent_34%),radial-gradient(320px_circle_at_50%_46%,rgba(99,102,241,0.045),transparent_42%),radial-gradient(220px_circle_at_0%_100%,rgba(255,255,255,0.014),transparent_38%)]" />
        <div className="absolute inset-0 rounded-r-[30px] shadow-[18px_0_48px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.024)]" />

        <div className="relative flex h-full flex-col">
          <BrandDock expanded={expanded} />
          <RailNav expanded={expanded} onNavigate={() => {}} />
          <div className="mt-auto">
            <RailFooter expanded={expanded} />
          </div>
        </div>
      </motion.div>
    </aside>
  );
}

function MobileNavItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className="group relative block"
    >
      {({ isActive }) => (
        <div className="relative flex h-[56px] items-center overflow-hidden">
          <ItemGlow isActive={isActive} />

          <div
            className="relative z-[2] flex h-full shrink-0 items-center justify-center"
            style={{ width: ICON_COL_W }}
          >
            <div className="relative flex h-[34px] w-[34px] items-center justify-center">
              <Icon
                className={cn(
                  "transition-colors duration-300",
                  isActive
                    ? "h-[15px] w-[15px] text-white"
                    : "h-[14.5px] w-[14.5px] text-white/58 group-hover:text-white/84"
                )}
                strokeWidth={1.9}
              />
            </div>
          </div>

          <div className="relative z-[2] min-w-0 flex-1 pr-3">
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "truncate text-[12.8px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive
                    ? "text-white/95"
                    : "text-white/70 group-hover:text-white/88"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-all duration-300",
                  isActive
                    ? "text-white/28"
                    : "text-white/14 group-hover:translate-x-0.5 group-hover:text-white/22"
                )}
              />
            </div>
          </div>
        </div>
      )}
    </NavLink>
  );
}

function MobileSidebar({ setMobileOpen }) {
  return (
    <motion.aside
      initial={{ x: -286 }}
      animate={{ x: 0 }}
      exit={{ x: -286 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="fixed inset-y-0 left-0 z-[160] w-[286px] md:hidden"
    >
      <div className="relative h-full overflow-hidden border-r border-white/[0.04] bg-[rgba(3,7,15,0.98)] backdrop-blur-[28px] shadow-[20px_0_60px_rgba(0,0,0,0.40)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,24,0.98),rgba(4,8,20,0.98))]" />
        <div className="absolute inset-0 bg-[radial-gradient(260px_circle_at_0%_0%,rgba(99,102,241,0.08),transparent_34%),radial-gradient(320px_circle_at_50%_50%,rgba(34,211,238,0.03),transparent_42%)]" />

        <div className="relative flex items-center justify-end px-4 pt-4 pb-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/[0.045] text-white/84 ring-1 ring-white/[0.06] transition hover:bg-white/[0.07]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex h-[calc(100%-64px)] flex-col">
          <div className="px-0">
            <BrandDock expanded />
          </div>

          <nav className="px-0 pt-2">
            <div className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <MobileNavItem
                  key={item.to}
                  item={item}
                  onNavigate={() => setMobileOpen(false)}
                />
              ))}
            </div>
          </nav>

          <div className="mt-auto px-0 pb-4 pt-4">
            <div className="relative flex h-[56px] items-center overflow-hidden">
              <div className="pointer-events-none absolute inset-y-[6px] left-[8px] right-[8px] rounded-[18px] bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008)_28%,transparent)]" />

              <div
                className="relative z-[2] flex h-full shrink-0 items-center justify-center"
                style={{ width: ICON_COL_W }}
              >
                <div className="relative flex h-[34px] w-[34px] items-center justify-center">
                  <ShieldCheck
                    className="h-[14px] w-[14px] text-white/82"
                    strokeWidth={1.9}
                  />
                  <span className="absolute right-[6px] top-[6px] h-[6px] w-[6px] rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.72)]" />
                </div>
              </div>

              <div className="relative z-[2] min-w-0 flex-1 pr-3">
                <div className="truncate text-[9.5px] uppercase tracking-[0.24em] text-white/38">
                  Secure Rail
                </div>
                <div className="truncate pt-0.5 text-[10.5px] text-white/60">
                  Private operational layer
                </div>
              </div>
            </div>
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
              className="fixed inset-0 z-[150] bg-black/58 backdrop-blur-sm md:hidden"
            />
            <MobileSidebar setMobileOpen={setMobileOpen} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}