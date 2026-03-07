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
const EXPANDED_W = 264;
const ICON_COL_W = 76;
const ITEM_H = 58;
const BRAND_H = 106;
const SIDEBAR_RADIUS = 34;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SidebarSurface() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,18,0.74)_0%,rgba(3,8,20,0.86)_22%,rgba(3,8,21,0.92)_66%,rgba(2,7,18,0.96)_100%)]" />
      <div className="absolute inset-0 backdrop-blur-[26px]" />

      <div className="absolute inset-0 bg-[radial-gradient(280px_circle_at_0%_0%,rgba(56,189,248,0.09),transparent_34%),radial-gradient(340px_circle_at_38%_36%,rgba(99,102,241,0.07),transparent_42%),radial-gradient(220px_circle_at_0%_100%,rgba(255,255,255,0.02),transparent_38%)]" />

      <div className="absolute inset-0 ring-1 ring-white/[0.03]" />
      <div className="absolute inset-0 shadow-[0_22px_80px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.03)]" />

      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.03),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-[18px] h-[120px] w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />

      <div className="pointer-events-none absolute inset-y-0 right-[-118px] w-[180px] bg-[linear-gradient(90deg,rgba(6,12,28,0.34)_0%,rgba(6,12,28,0.15)_42%,rgba(6,12,28,0.05)_70%,rgba(6,12,28,0)_100%)] blur-[28px]" />
      <div className="pointer-events-none absolute inset-y-[18px] right-[-22px] w-[56px] bg-[radial-gradient(circle_at_0%_50%,rgba(103,232,249,0.06),rgba(103,232,249,0.02)_34%,transparent_72%)] blur-[20px]" />
    </>
  );
}

function ItemGlow({ isActive }) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute left-[11px] top-1/2 h-[28px] w-[3px] -translate-y-1/2 rounded-full transition-all duration-300",
          isActive
            ? "opacity-100 bg-[linear-gradient(180deg,rgba(165,243,252,0.0),rgba(165,243,252,0.92),rgba(125,211,252,0.38),rgba(165,243,252,0.0))] shadow-[0_0_14px_rgba(103,232,249,0.22)]"
            : "opacity-0"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute left-[2px] top-1/2 h-[42px] w-[42px] -translate-y-1/2 rounded-full transition-all duration-300",
          isActive
            ? "opacity-100 bg-[radial-gradient(circle,rgba(103,232,249,0.12),rgba(103,232,249,0.03)_45%,transparent_74%)] blur-[6px]"
            : "opacity-0 group-hover:opacity-100 group-hover:bg-[radial-gradient(circle,rgba(255,255,255,0.05),rgba(255,255,255,0.016)_44%,transparent_74%)] group-hover:blur-[5px]"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-y-[9px] left-[10px] right-[10px] transition-all duration-300",
          isActive
            ? "opacity-100 bg-[linear-gradient(90deg,rgba(255,255,255,0.024),rgba(255,255,255,0.01)_34%,rgba(255,255,255,0.003)_55%,transparent_72%)]"
            : "opacity-0 group-hover:opacity-100 group-hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.010),rgba(255,255,255,0.004)_34%,transparent_68%)]"
        )}
      />
    </>
  );
}

function BrandDock({ expanded }) {
  return (
    <div className="relative" style={{ height: BRAND_H }}>
      <div className="pointer-events-none absolute bottom-0 left-[14px] right-[18px] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)]" />

      <div className="relative flex h-full items-center overflow-hidden">
        <div
          className="relative z-[2] flex h-full shrink-0 items-center justify-center"
          style={{ width: 68 }}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute h-[72px] w-[72px] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.08),rgba(125,211,252,0.02)_42%,transparent_72%)] blur-[10px]" />
            <ExecutiveMark3D className="relative h-[42px] w-[42px]" />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-[2] -ml-[6px] min-w-0 flex-1 pr-4"
            >
              <div className="pointer-events-none absolute -left-3 top-1/2 h-[58px] w-[58px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.08),rgba(103,232,249,0.015)_48%,transparent_72%)] blur-[12px]" />

              <div className="relative min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-cyan-200/80 shadow-[0_0_10px_rgba(165,243,252,0.75)]" />
                  <div className="min-w-0 truncate text-[9.6px] font-semibold uppercase tracking-[0.34em] text-white/62">
                    AI HEADQUARTERS
                  </div>
                </div>

                <div className="mt-[3px] min-w-0">
                  <div className="truncate text-[16.8px] font-semibold leading-[1.02] tracking-[-0.048em] text-white [text-shadow:0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(120,220,255,0.10)]">
                    Executive Command
                  </div>
                </div>

                <div className="mt-[8px] flex items-center gap-2">
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03),transparent)]" />
                  <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/30">
                    PRIME RAIL
                  </span>
                </div>
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
            <Icon
              className={cn(
                "relative z-[2] transition-all duration-300",
                isActive
                  ? "h-[17px] w-[17px] text-white"
                  : "h-[16px] w-[16px] text-white/56 group-hover:text-white/84"
              )}
              strokeWidth={1.9}
            />
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
                  "truncate text-[12.9px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive
                    ? "text-white/96"
                    : "text-white/70 group-hover:text-white/88"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-all duration-300",
                  isActive
                    ? "translate-x-[1px] text-white/22"
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
    <div className="px-0 pb-5 pt-5">
      <div className="mx-[14px] mb-3 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)]" />

      <div className="group relative flex h-[58px] items-center overflow-hidden">
        <div className="pointer-events-none absolute left-[2px] top-1/2 h-[42px] w-[42px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(110,231,183,0.12),rgba(110,231,183,0.03)_44%,transparent_74%)] blur-[6px]" />

        <div
          className="relative z-[2] flex h-full shrink-0 items-center justify-center"
          style={{ width: ICON_COL_W }}
        >
          <div className="relative flex items-center justify-center">
            <ShieldCheck
              className="relative z-[2] h-[15px] w-[15px] text-white/82"
              strokeWidth={1.9}
            />
            <span className="absolute right-[-4px] top-[-3px] z-[3] h-[6px] w-[6px] rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.72)]" />
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
          <div className="truncate text-[9.4px] uppercase tracking-[0.24em] text-white/38">
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
    openTimer.current = setTimeout(() => setExpanded(true), 45);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setExpanded(false), 110);
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
            : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative h-full overflow-hidden rounded-r-[34px]"
        style={{ willChange: "width" }}
      >
        <SidebarSurface />

        <div className="pointer-events-none absolute right-[-10px] top-[58px] h-[160px] w-[90px] bg-[radial-gradient(circle_at_0%_0%,rgba(78,230,255,0.08),transparent_72%)] blur-3xl" />

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
        <div className="relative flex h-[58px] items-center overflow-hidden">
          <ItemGlow isActive={isActive} />

          <div
            className="relative z-[2] flex h-full shrink-0 items-center justify-center"
            style={{ width: ICON_COL_W }}
          >
            <Icon
              className={cn(
                "relative z-[2] transition-all duration-300",
                isActive
                  ? "h-[17px] w-[17px] text-white"
                  : "h-[16px] w-[16px] text-white/56 group-hover:text-white/84"
              )}
              strokeWidth={1.9}
            />
          </div>

          <div className="relative z-[2] min-w-0 flex-1 pr-3">
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "truncate text-[12.9px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive
                    ? "text-white/96"
                    : "text-white/70 group-hover:text-white/88"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-all duration-300",
                  isActive
                    ? "translate-x-[1px] text-white/22"
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
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      exit={{ x: -264 }}
      transition={{ type: "spring", stiffness: 250, damping: 30 }}
      className="fixed inset-y-0 left-0 z-[160] w-[264px] md:hidden"
    >
      <div className="relative h-full overflow-hidden rounded-r-[34px]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,7,18,0.94),rgba(3,8,21,0.985))]" />
        <div className="absolute inset-0 backdrop-blur-[30px]" />
        <div className="absolute inset-0 bg-[radial-gradient(260px_circle_at_0%_0%,rgba(56,189,248,0.08),transparent_34%),radial-gradient(320px_circle_at_30%_38%,rgba(99,102,241,0.08),transparent_42%),radial-gradient(220px_circle_at_0%_100%,rgba(255,255,255,0.025),transparent_38%)]" />
        <div className="absolute inset-0 ring-1 ring-white/[0.03]" />
        <div className="absolute inset-0 shadow-[0_24px_76px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.03)]" />
        <div className="pointer-events-none absolute inset-y-0 right-[-84px] w-[126px] bg-[linear-gradient(90deg,rgba(7,13,28,0.42)_0%,rgba(7,13,28,0.18)_42%,rgba(7,13,28,0)_100%)] blur-[18px]" />

        <div className="relative flex items-center justify-end px-4 pb-2 pt-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/[0.04] text-white/84 ring-1 ring-white/[0.06] transition hover:bg-white/[0.07]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex h-[calc(100%-60px)] flex-col">
          <BrandDock expanded />
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
              className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm md:hidden"
            />
            <MobileSidebar setMobileOpen={setMobileOpen} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}