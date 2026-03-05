// src/components/layout/Header.jsx (ELITE — Clean Command Header v3.0)
// ✅ Daha CLEAN + simmetrik (grid)
// ✅ Pill-lər “dirty” deyil: minimal outline + soft fill
// ✅ Button içi ox / “daşma” YOX: ikonlar fixed-size, text clamp
// ✅ Light mode oxunaqlı + premium (glass yox, solid clean)
// ✅ Command palette (Ctrl/⌘K) — Radix Dialog
// ✅ Uses: @radix-ui/react-dialog, lucide-react, react-router-dom

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Command,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  CornerDownLeft,
  Sparkles,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { applyTheme, getInitialTheme } from "../../lib/theme.js";
import { cx } from "../../lib/cx.js";

const ROUTES = [
  { path: "/", label: "Dashboard", hint: "Mission control overview" },
  { path: "/proposals", label: "Proposals", hint: "Draft → approve → publish" },
  { path: "/executions", label: "Executions", hint: "Jobs & callbacks" },
  { path: "/agents", label: "Agents", hint: "Orion, Nova, Atlas, Echo" },
  { path: "/threads", label: "Threads", hint: "Conversations & context" },
  { path: "/analytics", label: "Analytics", hint: "Signals & performance" },
  { path: "/settings", label: "Settings", hint: "Mode, tokens, push" },
];

function titleForPath(pathname) {
  const found = ROUTES.find((r) => r.path === pathname);
  return found?.label || "AI HQ";
}

function Kbd({ children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-lg border px-2 py-1",
        "text-[11px] font-semibold leading-none",
        "border-slate-200 bg-white text-slate-700",
        "dark:border-white/10 dark:bg-white/5 dark:text-white/70"
      )}
    >
      {children}
    </span>
  );
}

function BadgePill({ tone = "neutral", icon, children, className }) {
  const base = cx(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
    "text-[12px] font-semibold leading-none whitespace-nowrap",
    "transition-colors"
  );

  const tones =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
      : tone === "info"
      ? "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200"
      : tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200"
      : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80";

  return (
    <div className={cx(base, tones, className)}>
      {icon ? (
        <span className="grid place-items-center">
          {/* fixed icon box so heç nə daşmır */}
          <span className="grid h-4 w-4 place-items-center">{icon}</span>
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </div>
  );
}

function IconButton({ title, children, className, ...props }) {
  return (
    <button
      title={title}
      aria-label={title}
      className={cx(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
        "border-slate-200 bg-white text-slate-900",
        "shadow-[0_1px_0_rgba(2,6,23,0.05)]",
        "transition-[transform,box-shadow,background-color,border-color] duration-200",
        "hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-[0_18px_60px_-55px_rgba(2,6,23,0.45)]",
        "active:translate-y-[1px]",
        "dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
        "dark:hover:bg-white/[0.07] dark:hover:border-white/15",
        className
      )}
      {...props}
    >
      {/* fixed icon size */}
      <span className="grid h-5 w-5 place-items-center">{children}</span>
    </button>
  );
}

function PrimaryButton({ children, className, ...props }) {
  return (
    <button
      className={cx(
        "inline-flex h-10 items-center justify-center rounded-2xl px-4",
        "text-sm font-semibold whitespace-nowrap",
        "bg-slate-950 text-white",
        "shadow-[0_1px_0_rgba(2,6,23,0.10),0_22px_70px_-60px_rgba(2,6,23,0.70)]",
        "transition-[transform,box-shadow,filter] duration-200",
        "hover:-translate-y-[1px] hover:shadow-[0_30px_95px_-75px_rgba(2,6,23,0.90)]",
        "active:translate-y-[1px]",
        "dark:bg-white dark:text-slate-950",
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
    </button>
  );
}

function SearchButton({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      type="button"
      aria-label="Open command palette"
      title="Search (Ctrl/⌘K)"
      className={cx(
        "h-10 w-full rounded-2xl border px-3",
        "border-slate-200 bg-slate-50 text-slate-900",
        "shadow-[0_1px_0_rgba(2,6,23,0.05)]",
        "transition-[transform,border-color,background-color,box-shadow] duration-200",
        "hover:-translate-y-[1px] hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_60px_-55px_rgba(2,6,23,0.45)]",
        "dark:border-white/10 dark:bg-white/[0.04] dark:text-white",
        "dark:hover:bg-white/[0.07] dark:hover:border-white/15"
      )}
    >
      <div className="flex h-full items-center gap-2 min-w-0">
        <span className="grid h-5 w-5 place-items-center text-slate-600 dark:text-white/70">
          <Search className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-sm font-medium text-slate-600 dark:text-white/70">
            Search, jump, run…
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <Kbd>Ctrl</Kbd>
          <span className="text-slate-400 dark:text-white/30">/</span>
          <Kbd>⌘</Kbd>
          <span className="text-slate-400 dark:text-white/30">+</span>
          <Kbd>K</Kbd>
        </div>
      </div>
    </button>
  );
}

export default function Header({ onOpenSidebar }) {
  const loc = useLocation();
  const nav = useNavigate();

  const title = useMemo(() => titleForPath(loc.pathname), [loc.pathname]);

  const [theme, setTheme] = useState("light");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // demo states
  const live = useMemo(
    () => ({
      ws: true,
      mode: "manual",
      daily: "10:00",
      db: "stable",
    }),
    []
  );

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(applyTheme(t));
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(applyTheme(next));
  };

  useEffect(() => {
    const onKey = (e) => {
      const key = String(e.key || "").toLowerCase();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && key === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!paletteOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [paletteOpen]);

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return ROUTES;
    return ROUTES.filter((r) => {
      return (
        r.label.toLowerCase().includes(q) ||
        r.hint.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const openRoute = (path) => {
    setPaletteOpen(false);
    setQuery("");
    nav(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="mx-auto max-w-[1400px] px-3 sm:px-4 pt-3">
          <div
            className={cx(
              "relative rounded-[24px] border bg-white",
              "border-slate-200",
              "shadow-[0_1px_0_rgba(2,6,23,0.05),0_24px_90px_-78px_rgba(2,6,23,0.45)]",
              "dark:border-white/10 dark:bg-[#070A12]",
              "dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_28px_110px_-86px_rgba(0,0,0,0.90)]"
            )}
          >
            {/* super clean top hairline */}
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />

            {/* GRID: left / center / right */}
            <div className="relative z-10 grid grid-cols-[auto,1fr,auto] items-center gap-3 px-4 sm:px-5 py-4">
              {/* LEFT */}
              <div className="flex items-center gap-3 min-w-0">
                <IconButton title="Menu" onClick={onOpenSidebar} className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </IconButton>

                {/* Brand (clean) */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Command className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="truncate text-[15px] sm:text-[16px] font-extrabold tracking-tight text-slate-950 dark:text-white">
                        {title}
                      </div>
                      <BadgePill
                        tone={live.mode === "manual" ? "info" : "success"}
                        icon={<Sparkles className="h-4 w-4" />}
                        className="hidden md:inline-flex"
                      >
                        {live.mode === "manual" ? "Manual" : "Auto"}
                      </BadgePill>
                    </div>
                    <div className="mt-1 truncate text-[11px] font-medium text-slate-600 dark:text-white/60">
                      CEO command · clean · readable
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER */}
              <div className="hidden md:flex justify-center">
                <div className="w-full max-w-[560px]">
                  <SearchButton onOpen={() => setPaletteOpen(true)} />
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                <IconButton title="Notifications" onClick={() => alert("Later: notifications")}>
                  <Bell className="h-5 w-5" />
                </IconButton>

                <IconButton title="Toggle theme" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </IconButton>

                <PrimaryButton onClick={() => alert("Later: run daily draft")} className="hidden sm:inline-flex">
                  Run daily draft
                </PrimaryButton>
              </div>
            </div>

            {/* SECOND ROW: pills + mobile controls */}
            <div className="relative z-10 px-4 sm:px-5 pb-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <BadgePill tone={live.ws ? "success" : "warn"} icon={<Activity className="h-4 w-4" />}>
                    {live.ws ? "WS Online" : "WS Offline"}
                  </BadgePill>

                  <BadgePill tone="info" icon={<Sparkles className="h-4 w-4" />}>
                    Daily {live.daily}
                  </BadgePill>

                  <BadgePill tone="neutral" icon={<ShieldCheck className="h-4 w-4" />}>
                    DB {live.db}
                  </BadgePill>
                </div>

                <div className="flex md:hidden gap-2">
                  <PrimaryButton onClick={() => alert("Later: run daily draft")} className="flex-1">
                    Run daily draft
                  </PrimaryButton>

                  <IconButton title="Search (Ctrl/⌘K)" onClick={() => setPaletteOpen(true)} className="shrink-0">
                    <Search className="h-5 w-5" />
                  </IconButton>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-white/10" />
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <Dialog.Root open={paletteOpen} onOpenChange={setPaletteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/55" />
          <Dialog.Content
            className={cx(
              "fixed left-1/2 top-[10%] z-[80] w-[92vw] max-w-[760px] -translate-x-1/2",
              "rounded-[22px] border",
              "border-slate-200 bg-white",
              "shadow-[0_50px_200px_rgba(0,0,0,0.35)]",
              "dark:border-white/10 dark:bg-[#070A12]",
              "dark:shadow-[0_70px_260px_rgba(0,0,0,0.80)]"
            )}
          >
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-950 dark:text-white">
                    Command
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-600 dark:text-white/60">
                    Jump to pages, run actions, search decisions.
                  </div>
                </div>

                <button
                  onClick={() => setPaletteOpen(false)}
                  className={cx(
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
                    "border-slate-200 bg-white hover:bg-slate-50 transition",
                    "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  )}
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-slate-950 dark:text-white" />
                </button>
              </div>

              <div
                className={cx(
                  "mt-4 flex items-center gap-2 rounded-2xl border px-3 py-2",
                  "border-slate-200 bg-slate-50",
                  "dark:border-white/10 dark:bg-white/5"
                )}
              >
                <Search className="h-4 w-4 text-slate-600 dark:text-white/60" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search…"
                  className={cx(
                    "w-full bg-transparent outline-none text-sm font-semibold",
                    "text-slate-950 placeholder:text-slate-400",
                    "dark:text-white dark:placeholder:text-white/40"
                  )}
                />
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-white/60">
                  <CornerDownLeft className="h-4 w-4" /> Enter
                </div>
              </div>

              <div className="mt-4 max-h-[380px] overflow-auto pr-1">
                <div className="space-y-2">
                  {filtered.map((r) => (
                    <button
                      key={r.path}
                      onClick={() => openRoute(r.path)}
                      className={cx(
                        "w-full text-left rounded-2xl border px-4 py-3",
                        "border-slate-200 bg-white hover:bg-slate-50",
                        "transition-[transform,box-shadow,border-color] duration-200",
                        "hover:-translate-y-[1px] hover:shadow-[0_26px_90px_-70px_rgba(2,6,23,0.55)]",
                        "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-slate-950 dark:text-white">
                            {r.label}
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-600 dark:text-white/60">
                            {r.hint}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-white/50">
                          {r.path}
                        </span>
                      </div>
                    </button>
                  ))}

                  {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                      No matches.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-600 dark:text-white/60">
                <div className="inline-flex items-center gap-2">
                  <Kbd>Esc</Kbd> close
                </div>
                <div className="inline-flex items-center gap-2">
                  <Kbd>Ctrl/⌘</Kbd> + <Kbd>K</Kbd> open
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}