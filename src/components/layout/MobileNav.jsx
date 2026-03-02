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
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/proposals", label: "Proposals", icon: FileText },
  { to: "/executions", label: "Exec", icon: PlayCircle },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/threads", label: "Threads", icon: MessagesSquare },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  return (
    <nav
      className={cx(
        "lg:hidden fixed bottom-0 left-0 right-0 z-50",
        "border-t border-slate-200/70 dark:border-slate-800",
        "bg-white/85 dark:bg-slate-950/70 backdrop-blur"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-screen-sm px-2">
        <div className="grid grid-cols-7 gap-1 py-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === "/"}
                className={({ isActive }) =>
                  cx(
                    "flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] transition",
                    isActive
                      ? "text-indigo-700 dark:text-indigo-200 bg-indigo-50/70 dark:bg-indigo-500/10"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-[52px] truncate">{it.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}