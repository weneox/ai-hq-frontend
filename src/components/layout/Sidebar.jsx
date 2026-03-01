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
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/proposals", label: "Proposals", icon: FileText },
  { to: "/executions", label: "Executions", icon: PlayCircle },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/threads", label: "Threads", icon: MessagesSquare },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-full max-w-[280px] rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_12px_40px_-20px_rgba(2,6,23,0.35)] overflow-hidden dark:border-slate-800 dark:bg-slate-900/50">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">AI HQ</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              CEO Command Center
            </div>
          </div>

          <span className="rounded-full border border-slate-200/60 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200">
            MVP
          </span>
        </div>

        <nav className="mt-4 space-y-1">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) =>
                  cx(
                    "relative group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    "hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/50 dark:hover:text-slate-50",
                    isActive
                      ? "bg-white/70 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-200"
                      : "text-slate-700 dark:text-slate-200",
                    // left accent via ::before
                    isActive
                      ? "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-xl before:bg-gradient-to-b before:from-indigo-500/70 before:via-cyan-400/60 before:to-emerald-400/60"
                      : ""
                  )
                }
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-4 w-4 opacity-90" />
                </span>
                <span className="min-w-0 truncate">{it.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-5 rounded-2xl border border-slate-200/60 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
          <div className="font-semibold text-slate-700 dark:text-slate-100">
            Sprint 1
          </div>
          <div className="mt-1">Shell + Pages + Theme toggle hazırdır.</div>
        </div>
      </div>
    </aside>
  );
}