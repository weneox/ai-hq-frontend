import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import Sidebar3DIcon from "./Sidebar3DIcon.jsx";

const NAV_ITEMS = [
  { label: "Command", type: "command", to: "/" },
  { label: "Analytics", type: "analytics", to: "/analytics" },
  { label: "Proposals", type: "proposals", to: "/proposals" },
  { label: "Executions", type: "executions", to: "/executions" },
  { label: "Agents", type: "agents", to: "/agents" },
  { label: "Threads", type: "threads", to: "/threads" },
  { label: "Settings", type: "settings", to: "/settings" },
];

const COLLAPSED_W = 86;
const EXPANDED_W = 286;
const LABEL_W = 162;
const NODE_SIZE = 50;

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
        transform: expanded ? "translateX(0px)" : "translateX(-10px)",
        transition:
          "width 460ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease, transform 280ms cubic-bezier(0.22,1,0.36,1)",
      }}
      aria-hidden={!expanded}
    >
      {children}
    </div>
  );
}

function RailNode({
  active = false,
  hovered = false,
  children,
  className = "",
  canvasClassName = "",
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[18px] transition-all duration-300",
        active
          ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.028))] ring-1 ring-cyan-300/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_16px_34px_rgba(0,0,0,0.26),0_0_0_1px_rgba(125,211,252,0.08)]"
          : "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))]",
        hovered && !active
          ? "ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_26px_rgba(0,0,0,0.18)]"
          : "",
        className
      )}
      style={{ width: NODE_SIZE, height: NODE_SIZE }}
    >
      <div className="pointer-events-none absolute inset-[1px] rounded-[17px] bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.10),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]" />

      {active && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_0%_50%,rgba(103,232,249,0.12),transparent_36%),radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.10),transparent_34%)]" />
          <div className="pointer-events-none absolute inset-y-[10px] left-0 w-px bg-gradient-to-b from-transparent via-cyan-200/80 to-transparent" />
        </>
      )}

      <div
        className={cn(
          "relative z-[2] h-[38px] w-[38px]",
          canvasClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

function BrandBlock({ expanded }) {
  return (
    <div className="px-4 pt-5">
      <div className="flex h-[60px] items-center">
        <RailNode active className="rounded-[20px]" canvasClassName="h-[40px] w-[40px]">
          <Sidebar3DIcon type="brand" active />
        </RailNode>

        <div className="ml-3 flex min-w-0 flex-1 items-center">
          <Reveal expanded={expanded} className="w-full">
            <div className="min-w-0">
              <div className="truncate text-[10px] uppercase tracking-[0.34em] text-white/28">
                AI Headquarters
              </div>
              <div className="truncate pt-0.5 text-[15px] font-semibold text-white/92">
                Executive Command
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, expanded, onNavigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={({ isActive }) =>
        cn(
          "group relative flex h-[58px] items-center rounded-[18px] px-4 transition-all duration-300",
          isActive ? "text-white" : "text-white/50 hover:text-white/88"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={cn(
              "absolute inset-0 rounded-[18px] transition-all duration-300",
              isActive
                ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.022))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_34px_rgba(0,0,0,0.18)]"
                : "bg-transparent group-hover:bg-white/[0.03]"
            )}
          />

          <RailNode active={isActive} hovered={hovered}>
            <Sidebar3DIcon
              type={item.type}
              active={isActive}
              hovered={hovered}
            />
          </RailNode>

          <div className="ml-3 flex min-w-0 flex-1 items-center justify-between">
            <Reveal expanded={expanded} className="w-full">
              <div className="flex min-w-0 items-center justify-between">
                <span className="truncate text-[14px] font-medium text-white/90">
                  {item.label}
                </span>
                <ChevronRight className="ml-3 h-[14px] w-[14px] shrink-0 text-white/18 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            </Reveal>
          </div>
        </>
      )}
    </NavLink>
  );
}

function RailNav({ expanded, onNavigate }) {
  return (
    <nav className="mt-5 px-2.5">
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
    <div className="px-4 pb-5 pt-4">
      <div className="flex h-[52px] items-center">
        <RailNode
          active
          className="rounded-[18px]"
          canvasClassName="h-[38px] w-[38px]"
        >
          <Sidebar3DIcon type="security" active />
        </RailNode>

        <div className="ml-3 flex min-w-0 flex-1 items-center">
          <Reveal expanded={expanded} className="w-full">
            <div className="min-w-0">
              <div className="truncate text-[11px] uppercase tracking-[0.28em] text-white/22">
                Secure rail
              </div>
              <div className="truncate pt-0.5 text-[12px] text-white/48">
                Private operational layer
              </div>
            </div>
          </Reveal>
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
    openTimer.current = setTimeout(() => setExpanded(true), 90);
  };

  const handleLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setExpanded(false), 150);
  };

  return (
    <aside
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="fixed inset-y-0 left-0 z-50 hidden md:block"
    >
      <motion.div
        animate={{ width: expanded ? EXPANDED_W : COLLAPSED_W }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.46, ease: [0.22, 1, 0.36, 1] }
        }
        className="relative h-full overflow-hidden border-r border-white/[0.05] bg-[#040713]/88 backdrop-blur-[32px] will-change-[width]"
        style={{
          boxShadow:
            "26px 0 90px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(99,102,241,0.16),transparent_24%),radial-gradient(620px_circle_at_0%_100%,rgba(34,211,238,0.09),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008))]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/[0.06]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-200/10 to-transparent" />

        <div className="relative flex h-full flex-col">
          <BrandBlock expanded={expanded} />
          <RailNav expanded={expanded} />
          <div className="mt-auto">
            <RailFooter expanded={expanded} />
          </div>
        </div>
      </motion.div>
    </aside>
  );
}

function MobileSidebar({ setMobileOpen }) {
  return (
    <motion.aside
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      className="fixed inset-y-0 left-0 z-50 w-[296px] md:hidden"
    >
      <div className="relative h-full overflow-hidden border-r border-white/[0.06] bg-[#040713]/94 backdrop-blur-[32px] shadow-[24px_0_80px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(850px_circle_at_0%_0%,rgba(99,102,241,0.16),transparent_24%),radial-gradient(620px_circle_at_0%_100%,rgba(34,211,238,0.08),transparent_22%)]" />

        <div className="relative flex items-center justify-between px-4 pt-4">
          <div className="min-w-0 flex-1">
            <BrandBlock expanded />
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.05] text-white/82 ring-1 ring-white/10 transition hover:bg-white/[0.08]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-1 flex h-[calc(100%-84px)] flex-col">
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
              className="fixed inset-0 z-40 bg-black/62 backdrop-blur-sm md:hidden"
            />
            <MobileSidebar setMobileOpen={setMobileOpen} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}