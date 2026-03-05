import { NavLink } from "react-router-dom";
import { cx } from "../../lib/cx.js";
import {
  LayoutDashboard,
  FileText,
  PlayCircle,
  Bot,
  MessagesSquare,
  BarChart3,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
  X,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, group: "AI OPERATIONS" },
  { to: "/proposals", label: "Proposals", icon: FileText, group: "AI OPERATIONS" },
  { to: "/executions", label: "Executions", icon: PlayCircle, group: "AI OPERATIONS" },
  { to: "/threads", label: "Threads", icon: MessagesSquare, group: "AI OPERATIONS" },

  { to: "/agents", label: "Agents", icon: Bot, group: "AI SYSTEM" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, group: "AI SYSTEM" },

  { to: "/settings", label: "Settings", icon: Settings, group: "SYSTEM" },
];

function Pill({ tone = "indigo", children }) {
  const tones = {
    indigo:
      "border-indigo-200/60 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-200",
    emerald:
      "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
    slate:
      "border-slate-200/60 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium",
        tones[tone] || tones.slate
      )}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="px-1 pt-4 pb-2 text-[11px] font-semibold tracking-[0.14em] text-slate-400 dark:text-slate-500">
      {children}
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, tone = "indigo" }) {
  const toneCls =
    tone === "emerald"
      ? "text-emerald-600 dark:text-emerald-300"
      : tone === "cyan"
      ? "text-cyan-600 dark:text-cyan-300"
      : "text-indigo-600 dark:text-indigo-300";

  return (
    <div className="group flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-white/40 dark:hover:bg-slate-900/40">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cx(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            "bg-white/70 ring-1 ring-slate-200/70 shadow-sm",
            "dark:bg-slate-950/40 dark:ring-slate-800"
          )}
        >
          <Icon className={cx("h-4 w-4", toneCls)} />
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 truncate">
            {label}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Live system metrics
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Pill tone={tone === "emerald" ? "emerald" : "indigo"}>{value}</Pill>
        <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition group-hover:opacity-100 dark:text-slate-600" />
      </div>
    </div>
  );
}

function AgentDot({ state = "active" }) {
  const cls =
    state === "active"
      ? "bg-emerald-500"
      : state === "thinking"
      ? "bg-cyan-500"
      : "bg-slate-400";
  return <span className={cx("h-2.5 w-2.5 rounded-full", cls)} />;
}

function AgentRow({ name, state, sub }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/40 dark:hover:bg-slate-900/40 transition">
      <div className="flex items-center gap-2 min-w-0">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/70 ring-1 ring-slate-200/70 shadow-sm dark:bg-slate-950/40 dark:ring-slate-800">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
        </span>
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 truncate">
            {name}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sub}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AgentDot state={state} />
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {state}
        </span>
      </div>
    </div>
  );
}

function NavItem({ it }) {
  const Icon = it.icon;

  return (
    <NavLink
      to={it.to}
      end={it.to === "/"}
      className={({ isActive }) =>
        cx(
          "relative group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
          "hover:bg-white/45 hover:text-slate-900 dark:hover:bg-slate-900/40 dark:hover:text-slate-50",
          isActive ? "text-slate-900 dark:text-slate-50" : "text-slate-700 dark:text-slate-200",
          // Active background + ring + glow
          isActive
            ? cx(
                "bg-white/70 ring-1 ring-indigo-200/60 shadow-[0_10px_30px_-24px_rgba(79,70,229,0.55)]",
                "dark:bg-indigo-500/10 dark:ring-indigo-500/20"
              )
            : "",
          // left gradient accent
          isActive
            ? "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl before:bg-gradient-to-b before:from-indigo-500/70 before:via-cyan-400/60 before:to-emerald-400/60"
            : ""
        )
      }
    >
      <span
        className={cx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition",
          "bg-white/60 ring-1 ring-slate-200/60 shadow-sm",
          "dark:bg-slate-950/30 dark:ring-slate-800",
          "group-hover:scale-[1.02]"
        )}
      >
        <Icon className="h-4 w-4 opacity-90" />
      </span>

      <span className="min-w-0 truncate font-medium">{it.label}</span>

      <ChevronRight className="ml-auto h-4 w-4 text-slate-300 opacity-0 transition group-hover:opacity-100 dark:text-slate-600" />
    </NavLink>
  );
}

/**
 * Sidebar
 * @param {object} props
 * @param {"desktop"|"mobile"} props.variant
 * @param {function} props.onClose
 */
export default function Sidebar({ variant = "desktop", onClose }) {
  const grouped = {
    "AI OPERATIONS": nav.filter((x) => x.group === "AI OPERATIONS"),
    "AI SYSTEM": nav.filter((x) => x.group === "AI SYSTEM"),
    SYSTEM: nav.filter((x) => x.group === "SYSTEM"),
  };

  return (
    <aside
      className={cx(
        "w-full max-w-[320px] overflow-hidden rounded-2xl border",
        "border-slate-200/70 bg-white/72 backdrop-blur-xl",
        "shadow-[0_12px_44px_-22px_rgba(2,6,23,0.40)]",
        "dark:border-slate-800 dark:bg-slate-950/35",
        // subtle top gradient strip inside
        "relative"
      )}
    >
      {/* inner glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(520px_circle_at_25%_0%,black,transparent_55%)]">
        <div className="absolute inset-0 bg-[radial-gradient(520px_circle_at_25%_0%,rgba(99,102,241,0.20),transparent_60%)] dark:bg-[radial-gradient(520px_circle_at_25%_0%,rgba(99,102,241,0.24),transparent_62%)]" />
      </div>

      <div className="relative p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              AI HQ
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              CEO Command Center
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Pill tone="slate">MVP</Pill>

            {variant === "mobile" ? (
              <button
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/70 bg-white/70 hover:bg-white transition dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/60"
                aria-label="Close"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white/55 p-2 dark:border-slate-800 dark:bg-slate-950/25">
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
              System Status
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Live</span>
          </div>

          <div className="space-y-1">
            <StatusRow icon={Activity} label="Agents Active" value="4" tone="emerald" />
            <StatusRow icon={PlayCircle} label="Jobs Running" value="2" tone="indigo" />
            <StatusRow icon={FileText} label="Queue" value="6" tone="cyan" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4">
          <SectionLabel>AI OPERATIONS</SectionLabel>
          <div className="space-y-1">
            {grouped["AI OPERATIONS"].map((it) => (
              <NavItem key={it.to} it={it} />
            ))}
          </div>

          <SectionLabel>AI SYSTEM</SectionLabel>
          <div className="space-y-1">
            {grouped["AI SYSTEM"].map((it) => (
              <NavItem key={it.to} it={it} />
            ))}
          </div>

          <SectionLabel>SYSTEM</SectionLabel>
          <div className="space-y-1">
            {grouped["SYSTEM"].map((it) => (
              <NavItem key={it.to} it={it} />
            ))}
          </div>
        </nav>

        {/* Agents Online */}
        <div className="mt-5 rounded-2xl border border-slate-200/60 bg-white/55 p-2 dark:border-slate-800 dark:bg-slate-950/25">
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">
              Agents Online
            </div>
            <Pill tone="emerald">3</Pill>
          </div>

          <div className="space-y-1">
            <AgentRow name="Nova" state="active" sub="Generating drafts" />
            <AgentRow name="Atlas" state="active" sub="Ops + execution" />
            <AgentRow name="Echo" state="thinking" sub="Analyzing trends" />
          </div>
        </div>

        {/* Sprint Note */}
        <div className="mt-5 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            Sprint 1
          </div>
          <div className="mt-1">
            Shell + Pages + Theme toggle hazırdır. Sidebar artıq “Control Center” oldu.
          </div>
        </div>
      </div>
    </aside>
  );
}