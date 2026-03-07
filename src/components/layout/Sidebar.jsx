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

const COLLAPSED_W = 84;
const EXPANDED_W = 264;
const ICON_COL_W = 76;
const ITEM_H = 58;
const BRAND_H = 106;
const SIDEBAR_RADIUS = 34;

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function railRadiusStyle() {
  return {
    borderTopRightRadius: `${SIDEBAR_RADIUS}px`,
    borderBottomRightRadius: `${SIDEBAR_RADIUS}px`,
  };
}

function SidebarSurface({ expanded }) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          ...railRadiusStyle(),
          background:
            "linear-gradient(180deg, rgba(2,8,22,0.96) 0%, rgba(2,7,19,0.985) 28%, rgba(2,6,18,0.99) 68%, rgba(1,5,15,0.995) 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          ...railRadiusStyle(),
          backdropFilter: expanded ? "blur(16px)" : "blur(10px)",
          WebkitBackdropFilter: expanded ? "blur(16px)" : "blur(10px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          ...railRadiusStyle(),
          background: expanded
            ? "radial-gradient(300px circle at 0% 0%, rgba(90,220,255,0.08), transparent 34%), radial-gradient(340px circle at 42% 34%, rgba(72,106,255,0.07), transparent 42%), radial-gradient(220px circle at 0% 100%, rgba(255,255,255,0.015), transparent 38%)"
            : "radial-gradient(220px circle at 0% 0%, rgba(90,220,255,0.05), transparent 34%), radial-gradient(240px circle at 36% 36%, rgba(72,106,255,0.045), transparent 40%), radial-gradient(180px circle at 0% 100%, rgba(255,255,255,0.01), transparent 36%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          ...railRadiusStyle(),
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.028) 0%, rgba(255,255,255,0.01) 18%, rgba(255,255,255,0.005) 40%, transparent 66%)",
        }}
      />

      <div
        className="absolute inset-0 ring-1 ring-white/[0.035]"
        style={railRadiusStyle()}
      />

      <div
        className="absolute inset-0 shadow-[0_24px_80px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,0.03)]"
        style={railRadiusStyle()}
      />

      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.03),transparent)]" />

      <div className="pointer-events-none absolute right-0 top-[16px] h-[140px] w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 transition-all duration-300",
          expanded ? "w-[72px]" : "w-[52px]"
        )}
        style={{
          ...railRadiusStyle(),
          background: expanded
            ? "linear-gradient(270deg, rgba(255,255,255,0.05) 0%, rgba(110,225,255,0.028) 16%, rgba(255,255,255,0.01) 40%, transparent 78%)"
            : "linear-gradient(270deg, rgba(255,255,255,0.06) 0%, rgba(110,225,255,0.03) 20%, rgba(255,255,255,0.012) 44%, transparent 82%)",
          filter: "blur(0px)",
        }}
      />

      <div
        className={cn(
          "pointer-events-none absolute right-[-18px] top-[78px] transition-all duration-300",
          expanded ? "h-[220px] w-[88px]" : "h-[180px] w-[64px]"
        )}
        style={{
          background:
            "radial-gradient(circle at 0% 50%, rgba(103,232,249,0.12), rgba(103,232,249,0.04) 34%, transparent 72%)",
          filter: "blur(18px)",
        }}
      />

      {!expanded && (
        <>
          <div className="pointer-events-none absolute right-[10px] top-[14px] bottom-[14px] w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015),rgba(255,255,255,0.05))]" />
          <div className="pointer-events-none absolute right-[-8px] top-[8px] bottom-[8px] w-[26px] rounded-r-[34px] bg-[radial-gradient(circle_at_0%_50%,rgba(125,211,252,0.09),rgba(125,211,252,0.03)_36%,transparent_74%)] blur-[10px]" />
        </>
      )}
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
            : "opacity-0 group-hover:opacity-100 group-hover:bg-[radial-gradient(circle,rgba(255,255,255,0.04),rgba(255,255,255,0.014)_44%,transparent_74%)] group-hover:blur-[5px]"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-y-[9px] left-[10px] right-[10px] transition-all duration-300",
          isActive
            ? "opacity-100 bg-[linear-gradient(90deg,rgba(255,255,255,0.024),rgba(255,255,255,0.01)_34%,rgba(255,255,255,0.003)_55%,transparent_72%)]"
            : "opacity-0 group-hover:opacity-100 group-hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.01),rgba(255,255,255,0.003)_34%,transparent_68%)]"
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
            <div className="absolute h-[72px] w-[72px] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.07),rgba(125,211,252,0.018)_42%,transparent_72%)] blur-[10px]" />
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
              <div className="pointer-events-none absolute -left-3 top-1/2 h-[58px] w-[58px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.06),rgba(103,232,249,0.012)_48%,transparent_72%)] blur-[12px]" />

              <div className="relative min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-cyan-200/80 shadow-[0_0_10px_rgba(165,243,252,0.75)]" />
                  <div className="min-w-0 truncate text-[9.6px] font-semibold uppercase tracking-[0.34em] text-white/62">
                    AI HEADQUARTERS
                  </div>
                </div>

                <div className="mt-[3px] min-w-0">
                  <div className="truncate text-[16.8px] font-semibold leading-[1.02] tracking-[-0.048em] text-white [text-shadow:0_1px_0_rgba(255,255,255,0.07),0_10px_26px_rgba(120,220,255,0.08)]">
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
    openTimer.current = setTimeout(() => setExpanded(true), 40);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setExpanded(false), 100);
  };

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="fixed left-0 top-0 z-[130] hidden md:block"
      style={{
        height: "100vh",
        ...railRadiusStyle(),
      }}
    >
      <motion.div
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative h-full overflow-hidden transform-gpu"
        style={{
          width: COLLAPSED_W,
          willChange: "width",
          ...railRadiusStyle(),
        }}
      >
        <SidebarSurface expanded={expanded} />

        <div className="pointer-events-none absolute right-[-12px] top-[60px] h-[180px] w-[84px] bg-[radial-gradient(circle_at_0%_0%,rgba(78,230,255,0.055),transparent_72%)] blur-3xl" />

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
      style={railRadiusStyle()}
    >
      <div className="relative h-full overflow-hidden" style={railRadiusStyle()}>
        <SidebarSurface expanded />

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