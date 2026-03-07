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
const EXPANDED_W = 262;
const ICON_COL_W = 84;
const ITEM_H = 56;
const BRAND_H = 104;
const SIDEBAR_RADIUS = 30;

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
            "linear-gradient(180deg, rgba(4,9,18,0.92) 0%, rgba(3,7,16,0.965) 34%, rgba(2,6,14,0.985) 72%, rgba(2,5,12,0.992) 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          ...railRadiusStyle(),
          backdropFilter: expanded ? "blur(14px)" : "blur(10px)",
          WebkitBackdropFilter: expanded ? "blur(14px)" : "blur(10px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          ...railRadiusStyle(),
          background: expanded
            ? "radial-gradient(280px circle at 0% 0%, rgba(90,220,255,0.06), transparent 34%), radial-gradient(260px circle at 40% 32%, rgba(90,110,255,0.05), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.016), transparent 24%)"
            : "radial-gradient(220px circle at 0% 0%, rgba(90,220,255,0.045), transparent 34%), radial-gradient(200px circle at 40% 32%, rgba(90,110,255,0.04), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.012), transparent 24%)",
        }}
      />

      <div
        className="absolute inset-0 ring-1 ring-white/[0.04]"
        style={railRadiusStyle()}
      />

      <div
        className="absolute inset-0 shadow-[0_18px_60px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.03)]"
        style={railRadiusStyle()}
      />

      <div className="pointer-events-none absolute left-0 top-0 h-full w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.035),transparent)]" />

      <div className="pointer-events-none absolute right-0 top-[18px] h-[120px] w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 transition-all duration-300",
          expanded ? "w-[54px]" : "w-[34px]"
        )}
        style={{
          ...railRadiusStyle(),
          background: expanded
            ? "linear-gradient(270deg, rgba(255,255,255,0.045) 0%, rgba(103,232,249,0.018) 18%, rgba(255,255,255,0.008) 40%, transparent 76%)"
            : "linear-gradient(270deg, rgba(255,255,255,0.05) 0%, rgba(103,232,249,0.018) 20%, rgba(255,255,255,0.008) 42%, transparent 80%)",
        }}
      />

      <div
        className={cn(
          "pointer-events-none absolute right-[-10px] top-[86px] transition-all duration-300",
          expanded ? "h-[170px] w-[64px]" : "h-[140px] w-[40px]"
        )}
        style={{
          background:
            "radial-gradient(circle at 0% 50%, rgba(103,232,249,0.07), rgba(103,232,249,0.025) 34%, transparent 72%)",
          filter: "blur(16px)",
        }}
      />
    </>
  );
}

function ItemGlow({ isActive }) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute left-[12px] top-1/2 h-[24px] w-[3px] -translate-y-1/2 rounded-full transition-all duration-300",
          isActive
            ? "opacity-100 bg-[linear-gradient(180deg,rgba(165,243,252,0),rgba(165,243,252,0.95),rgba(125,211,252,0.32),rgba(165,243,252,0))] shadow-[0_0_12px_rgba(103,232,249,0.16)]"
            : "opacity-0"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute left-[18px] top-1/2 h-[34px] w-[34px] -translate-y-1/2 rounded-full transition-all duration-300",
          isActive
            ? "opacity-100 bg-[radial-gradient(circle,rgba(103,232,249,0.10),rgba(103,232,249,0.022)_48%,transparent_74%)] blur-[5px]"
            : "opacity-0 group-hover:opacity-100 group-hover:bg-[radial-gradient(circle,rgba(255,255,255,0.045),rgba(255,255,255,0.012)_48%,transparent_74%)] group-hover:blur-[4px]"
        )}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-y-[10px] left-[12px] right-[12px] rounded-[16px] transition-all duration-300",
          isActive
            ? "opacity-100 bg-[linear-gradient(90deg,rgba(255,255,255,0.024),rgba(255,255,255,0.008)_34%,transparent_72%)]"
            : "opacity-0 group-hover:opacity-100 group-hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.012),rgba(255,255,255,0.004)_34%,transparent_72%)]"
        )}
      />
    </>
  );
}

function BrandDock({ expanded }) {
  return (
    <div className="relative" style={{ height: BRAND_H }}>
      <div className="pointer-events-none absolute bottom-0 left-[14px] right-[16px] h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.045),transparent)]" />

      <div className="relative flex h-full items-center overflow-hidden">
        <div
          className="relative z-[2] flex h-full shrink-0 items-center justify-center"
          style={{ width: ICON_COL_W }}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute h-[62px] w-[62px] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.055),rgba(125,211,252,0.014)_44%,transparent_72%)] blur-[10px]" />
            <ExecutiveMark3D className="relative h-[38px] w-[38px]" />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, x: -8, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -8, filter: "blur(6px)" }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-[2] -ml-[6px] min-w-0 flex-1 pr-4"
            >
              <div className="min-w-0">
                <div className="truncate text-[9px] font-semibold uppercase tracking-[0.32em] text-white/46">
                  AI HEADQUARTERS
                </div>

                <div className="mt-[5px] truncate text-[16px] font-semibold tracking-[-0.045em] text-white/96">
                  Executive Command
                </div>

                <div className="mt-[8px] flex items-center gap-2">
                  <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.11),rgba(255,255,255,0.02),transparent)]" />
                  <span className="shrink-0 text-[8px] font-semibold uppercase tracking-[0.24em] text-white/26">
                    Rail
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
                  : "h-[16px] w-[16px] text-white/54 group-hover:text-white/82"
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
                  "truncate text-[12.8px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive
                    ? "text-white/96"
                    : "text-white/68 group-hover:text-white/86"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-all duration-300",
                  isActive
                    ? "translate-x-[1px] text-white/20"
                    : "text-white/12 group-hover:translate-x-0.5 group-hover:text-white/20"
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
    <div className="px-0 pb-5 pt-4">
      <div className="mx-[14px] mb-2 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)]" />

      <div className="relative flex h-[56px] items-center overflow-hidden">
        <div
          className="relative z-[2] flex h-full shrink-0 items-center justify-center"
          style={{ width: ICON_COL_W }}
        >
          <div className="relative flex items-center justify-center">
            <ShieldCheck
              className="relative z-[2] h-[15px] w-[15px] text-white/76"
              strokeWidth={1.9}
            />
            <span className="absolute right-[-4px] top-[-3px] z-[3] h-[6px] w-[6px] rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.55)]" />
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
          <div className="truncate text-[9.2px] uppercase tracking-[0.22em] text-white/34">
            Secure Rail
          </div>
          <div className="truncate pt-0.5 text-[10.3px] text-white/56">
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
    openTimer.current = setTimeout(() => setExpanded(true), 50);
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
            : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative h-full overflow-hidden transform-gpu"
        style={{
          width: COLLAPSED_W,
          willChange: "width",
          ...railRadiusStyle(),
        }}
      >
        <SidebarSurface expanded={expanded} />

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
            <Icon
              className={cn(
                "relative z-[2] transition-all duration-300",
                isActive
                  ? "h-[17px] w-[17px] text-white"
                  : "h-[16px] w-[16px] text-white/54 group-hover:text-white/82"
              )}
              strokeWidth={1.9}
            />
          </div>

          <div className="relative z-[2] min-w-0 flex-1 pr-3">
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "truncate text-[12.8px] font-medium tracking-[-0.01em] transition-colors duration-300",
                  isActive
                    ? "text-white/96"
                    : "text-white/68 group-hover:text-white/86"
                )}
              >
                {item.label}
              </span>

              <ChevronRight
                className={cn(
                  "h-[12px] w-[12px] shrink-0 transition-all duration-300",
                  isActive
                    ? "translate-x-[1px] text-white/20"
                    : "text-white/12 group-hover:translate-x-0.5 group-hover:text-white/20"
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
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed inset-y-0 left-0 z-[160] w-[262px] md:hidden"
      style={railRadiusStyle()}
    >
      <div className="relative h-full overflow-hidden" style={railRadiusStyle()}>
        <SidebarSurface expanded />

        <div className="relative flex items-center justify-end px-4 pb-2 pt-4">
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.04] text-white/84 transition hover:bg-white/[0.07]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex h-[calc(100%-60px)] flex-col">
          <BrandDock expanded />
          <nav className="px-0 pt-2">
            <div className="space-y-1.5">
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
              className="fixed inset-0 z-[150] bg-black/45 backdrop-blur-sm md:hidden"
            />
            <MobileSidebar setMobileOpen={setMobileOpen} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}