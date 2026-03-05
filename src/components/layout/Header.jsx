import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Moon, Sun, Search, Menu } from "lucide-react";
import { applyTheme, getInitialTheme } from "../../lib/theme.js";
import { cx } from "../../lib/cx.js";

const titles = {
  "/": "Dashboard",
  "/proposals": "Proposals",
  "/executions": "Executions",
  "/agents": "Agents",
  "/threads": "Threads",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function Header({ onOpenSidebar }) {
  const loc = useLocation();
  const title = useMemo(() => titles[loc.pathname] || "AI HQ", [loc.pathname]);

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(applyTheme(t));
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(applyTheme(next));
  };

  return (
    <header
      className={cx(
        "rounded-xl border overflow-hidden",
        "border-slate-200 bg-white/85 backdrop-blur-xl",
        "shadow-[0_1px_0_rgba(15,23,42,0.06),0_16px_40px_-34px_rgba(2,6,23,0.22)]",
        "dark:border-slate-800 dark:bg-slate-950/40",
        "dark:shadow-[0_1px_0_rgba(255,255,255,0.04),0_18px_50px_-40px_rgba(0,0,0,0.65)]"
      )}
    >
      {/* thin accent strip */}
      <div className="h-[3px] bg-gradient-to-r from-indigo-500/70 via-cyan-400/55 to-emerald-400/55 dark:from-indigo-400/55 dark:via-cyan-300/45 dark:to-emerald-300/45" />

      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={onOpenSidebar}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white/80 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/50"
              title="Menu"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {title}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                CEO Command Center
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 h-10 dark:border-slate-800 dark:bg-slate-950/30">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                placeholder="Search…"
                className={cx(
                  "w-[280px] bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400",
                  "dark:text-slate-100"
                )}
              />
            </div>

            {/* Theme */}
            <button
              onClick={toggleTheme}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/70"
              title="Toggle theme"
            >
              <span className="inline-flex items-center gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 h-10 dark:border-slate-800 dark:bg-slate-950/30">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              placeholder="Search…"
              className={cx(
                "w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400",
                "dark:text-slate-100"
              )}
            />
          </div>
        </div>
      </div>
    </header>
  );
}