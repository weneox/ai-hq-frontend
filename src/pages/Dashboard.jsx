// src/pages/Dashboard.jsx (ULTRA PREMIUM v1 — AI HQ Command Center)
// ✅ Full redesign: premium hero, KPI grid, AI Team (robots), Ops feed, Quick actions
// ✅ No extra deps required (only your existing ui components + lucide-react)
// ✅ Easy to connect real API later

import { useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

import {
  Sparkles,
  Shield,
  Activity,
  Zap,
  ChevronRight,
  Rocket,
  RefreshCw,
  Crown,
  Bot,
  Cpu,
  Radar,
  Timer,
} from "lucide-react";

/** --------------------------------
 *  Mini helpers
 * -------------------------------- */
function clamp01(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
function pct(n) {
  const v = Math.round(clamp01(n) * 100);
  return `${v}%`;
}
function nowIso() {
  return new Date().toISOString();
}

/** --------------------------------
 *  Robot avatar (NO humans)
 *  - purely SVG, premium, subtle
 * -------------------------------- */
function RobotAvatar({ tone = "indigo", size = 44 }) {
  const s = Number(size) || 44;

  const ring =
    tone === "emerald"
      ? "from-emerald-400/55 via-cyan-400/40 to-indigo-500/40"
      : tone === "cyan"
      ? "from-cyan-400/55 via-indigo-400/35 to-emerald-400/35"
      : tone === "amber"
      ? "from-amber-400/55 via-rose-400/25 to-indigo-500/35"
      : "from-indigo-400/55 via-cyan-400/35 to-emerald-400/35";

  return (
    <div
      className={[
        "relative shrink-0 rounded-2xl",
        "border border-slate-200/70 bg-white/70 backdrop-blur",
        "dark:border-slate-800/70 dark:bg-slate-950/35",
        "shadow-[0_1px_0_rgba(15,23,42,0.05)]",
      ].join(" ")}
      style={{ width: s, height: s }}
    >
      <div
        className={[
          "absolute -inset-px rounded-2xl opacity-70 blur-[10px]",
          "bg-gradient-to-br",
          ring,
          "to-transparent",
        ].join(" ")}
        aria-hidden="true"
      />
      <div className="relative z-10 h-full w-full grid place-items-center">
        <svg width={Math.floor(s * 0.72)} height={Math.floor(s * 0.72)} viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {/* antenna */}
          <path d="M32 6v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <circle cx="32" cy="6" r="3" fill="currentColor" opacity="0.6" />

          {/* head */}
          <rect
            x="14"
            y="16"
            width="36"
            height="28"
            rx="10"
            fill="url(#g1)"
            opacity="0.9"
            stroke="currentColor"
            strokeOpacity="0.22"
          />

          {/* eyes */}
          <circle cx="26" cy="30" r="3.2" fill="currentColor" opacity="0.78" />
          <circle cx="38" cy="30" r="3.2" fill="currentColor" opacity="0.78" />
          <rect x="24" y="36" width="16" height="3.6" rx="2" fill="currentColor" opacity="0.45" />

          {/* body */}
          <rect
            x="18"
            y="44"
            width="28"
            height="12"
            rx="6"
            fill="currentColor"
            opacity="0.18"
            stroke="currentColor"
            strokeOpacity="0.16"
          />
          <circle cx="32" cy="50" r="2.6" fill="currentColor" opacity="0.35" />
        </svg>
      </div>
    </div>
  );
}

/** --------------------------------
 *  KPI Card (premium)
 * -------------------------------- */
function Kpi({ title, value, sub, tone = "neutral", icon }) {
  const topGlow =
    tone === "success"
      ? "from-emerald-400/35 via-cyan-400/18"
      : tone === "warn"
      ? "from-amber-400/35 via-rose-400/12"
      : tone === "info"
      ? "from-indigo-400/35 via-cyan-400/18"
      : tone === "danger"
      ? "from-rose-400/35 via-amber-400/10"
      : "from-slate-300/35 via-slate-200/10";

  return (
    <Card variant="elevated" padded={false} className="min-w-0 overflow-hidden">
      <div className="relative">
        <div className={`h-1 w-full bg-gradient-to-r ${topGlow} to-transparent`} />
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{title}</div>
              <div className="mt-1 text-[28px] leading-none font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {value}
              </div>
              {sub ? <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">{sub}</div> : null}
              <div className="mt-3">
                <Badge tone={tone}>{tone === "neutral" ? "Live" : tone}</Badge>
              </div>
            </div>

            <div
              className={[
                "shrink-0 rounded-2xl p-3",
                "border border-slate-200/70 bg-white/70 backdrop-blur",
                "dark:border-slate-800/70 dark:bg-slate-950/30",
              ].join(" ")}
            >
              {icon}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/** --------------------------------
 *  Agent Card
 * -------------------------------- */
function AgentCard({ name, role, status = "online", tone = "indigo", meta }) {
  const online = status === "online";
  return (
    <Card variant="panel" padded="lg" className="min-w-0">
      <div className="flex items-start gap-4 min-w-0">
        <div className="text-slate-900 dark:text-white">
          <RobotAvatar tone={tone} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{role}</div>
            </div>

            <Badge tone={online ? "success" : "neutral"}>{online ? "online" : "idle"}</Badge>
          </div>

          {meta ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="rounded-xl border border-slate-200 bg-white/60 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950/25">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Focus</div>
                <div className="mt-0.5">{meta.focus}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/60 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950/25">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Queue</div>
                <div className="mt-0.5">{meta.queue}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

/** --------------------------------
 *  Ops feed item
 * -------------------------------- */
function FeedItem({ title, desc, tag, tone = "info", time }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={[
          "mt-1 h-9 w-1 rounded-full shrink-0",
          tone === "success"
            ? "bg-gradient-to-b from-emerald-400/80 via-cyan-400/50 to-transparent"
            : tone === "warn"
            ? "bg-gradient-to-b from-amber-400/80 via-rose-400/35 to-transparent"
            : tone === "danger"
            ? "bg-gradient-to-b from-rose-400/85 via-amber-400/25 to-transparent"
            : "bg-gradient-to-b from-indigo-400/80 via-cyan-400/45 to-transparent",
        ].join(" ")}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
            {desc ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</div> : null}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {tag ? <Badge tone={tone}>{tag}</Badge> : null}
            {time ? <span className="text-[11px] text-slate-400 dark:text-slate-500">{time}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // Later you will replace these with real API data
  const kpis = useMemo(
    () => ({
      todayDrafts: 7,
      queue: 2,
      execSuccess: 0.94,
      health: "OK",
    }),
    []
  );

  const [search, setSearch] = useState("");

  // Dynamic agents (later: fetch /api/agents)
  const agents = useMemo(
    () => [
      { name: "Orion", role: "Strategy & Growth", tone: "indigo", meta: { focus: "Daily IG Draft", queue: "2 tasks" } },
      { name: "Nova", role: "Creative Director", tone: "cyan", meta: { focus: "Visual layout", queue: "1 task" } },
      { name: "Atlas", role: "Ops & Execution", tone: "emerald", meta: { focus: "Publish pipeline", queue: "0 tasks" } },
      { name: "Echo", role: "Analytics & QA", tone: "amber", meta: { focus: "Performance review", queue: "3 tasks" } },
    ],
    []
  );

  const feed = useMemo(
    () => [
      {
        title: "Daily draft created",
        desc: "Format: IG carousel · Draft Studio is ready for review.",
        tag: "proposal",
        tone: "info",
        time: "just now",
      },
      {
        title: "n8n: Content Pack Builder",
        desc: "Execution completed · assets plan prepared.",
        tag: "execution",
        tone: "success",
        time: "12m ago",
      },
      {
        title: "Publish workflow idle",
        desc: "Waiting for CEO approval to publish.",
        tag: "publish",
        tone: "warn",
        time: "1h ago",
      },
    ],
    []
  );

  const filteredAgents = agents.filter((a) => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      String(a.meta?.focus || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-w-0 space-y-5">
      {/* HERO — Command Center */}
      <Card variant="glass" padded={false} className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500/60 via-cyan-400/40 to-emerald-400/40" />

        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 text-sm font-semibold text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100">
                  <Crown className="h-4 w-4 opacity-80" />
                  AI HQ · Command Center
                </div>

                <Badge tone="info">Founder: Emil Bagirov</Badge>
                <Badge tone="success">Realtime: Ready</Badge>
                <Badge tone="neutral">Pipeline: Draft → Approve → Publish</Badge>
              </div>

              <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Control your AI workforce: daily drafts, approvals, executions, publish — all in one place.
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <div className="w-[320px] max-w-[70vw] hidden md:block">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search agents / focus…"
                />
              </div>
              <Button variant="outline" size="md" onClick={() => setSearch("")}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="primary" size="md" onClick={() => alert("Later: trigger daily draft")}>
                <Rocket className="h-4 w-4" />
                Run daily draft
                <ChevronRight className="h-4 w-4 opacity-80" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          title="Today drafts"
          value={kpis.todayDrafts}
          sub="Auto created at 10:00 (Asia/Baku)"
          tone="info"
          icon={<Sparkles className="h-5 w-5 text-slate-900 dark:text-white opacity-80" />}
        />
        <Kpi
          title="Queue"
          value={kpis.queue}
          sub="Waiting for your approval"
          tone="warn"
          icon={<Timer className="h-5 w-5 text-slate-900 dark:text-white opacity-80" />}
        />
        <Kpi
          title="Execution success"
          value={pct(kpis.execSuccess)}
          sub="Last 7 days avg"
          tone="success"
          icon={<Zap className="h-5 w-5 text-slate-900 dark:text-white opacity-80" />}
        />
        <Kpi
          title="System health"
          value={kpis.health}
          sub="WS + DB stable"
          tone="success"
          icon={<Shield className="h-5 w-5 text-slate-900 dark:text-white opacity-80" />}
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] items-start">
        {/* LEFT */}
        <div className="min-w-0 space-y-4">
          {/* AI TEAM */}
          <Card variant="panel" padded={false} className="overflow-hidden">
            <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 opacity-70" />
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Team (Robots)</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    New agents will appear here automatically.
                  </div>
                </div>
                <Badge tone="info">{filteredAgents.length} active</Badge>
              </div>
            </div>

            <div className="p-4 grid gap-3 md:grid-cols-2">
              {filteredAgents.map((a) => (
                <AgentCard key={a.name} name={a.name} role={a.role} tone={a.tone} meta={a.meta} status="online" />
              ))}
            </div>
          </Card>

          {/* QUICK CONTROL */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card variant="soft" padded="lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Workflow controls</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Manual approvals + publish gate (CEO-first governance).
                  </div>
                </div>
                <Cpu className="h-5 w-5 opacity-70" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="md" onClick={() => alert("Later: open Proposals tab")}>
                  Open Proposals
                </Button>
                <Button variant="outline" size="md" onClick={() => alert("Later: open Executions tab")}>
                  Open Executions
                </Button>
                <Button variant="primary" size="md" onClick={() => alert("Later: publish pipeline")}>
                  Publish Center
                  <ChevronRight className="h-4 w-4 opacity-80" />
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/25">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Status</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone="info">Mode: Manual</Badge>
                  <Badge tone="success">WS: Online</Badge>
                  <Badge tone="neutral">Last sync: {new Date().toLocaleTimeString()}</Badge>
                </div>
              </div>
            </Card>

            <Card variant="soft" padded="lg">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Insight</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    What matters today: keep cadence, approve drafts fast, publish on time.
                  </div>
                </div>
                <Radar className="h-5 w-5 opacity-70" />
              </div>

              <div className="mt-4 space-y-2">
                <div className="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/25">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Priority</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Approve today’s draft
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    So that assets can be generated & prepared for publish.
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="warn">2 approvals pending</Badge>
                <Badge tone="success">94% success</Badge>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT */}
        <div className="min-w-0 space-y-4">
          {/* OPS FEED */}
          <Card variant="panel" padded={false} className="overflow-hidden">
            <div className="p-5 border-b border-slate-200/70 dark:border-slate-800/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 opacity-70" />
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ops feed</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Realtime events (WS) will stream here.
                  </div>
                </div>
                <Badge tone="success">Live</Badge>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {feed.map((x, i) => (
                <FeedItem key={i} title={x.title} desc={x.desc} tag={x.tag} tone={x.tone} time={x.time} />
              ))}
            </div>
          </Card>

          {/* MINI AUDIT */}
          <Card variant="soft" padded="lg">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Audit snapshot</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Last security & system check.</div>
              </div>
              <Shield className="h-5 w-5 opacity-70" />
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/25">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Last event</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {nowIso()}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="success">Integrity OK</Badge>
                <Badge tone="neutral">No alerts</Badge>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="md" onClick={() => alert("Later: open Alerts")}>
                Alerts
              </Button>
              <Button variant="primary" size="md" onClick={() => alert("Later: open Activity log")}>
                Activity log
                <ChevronRight className="h-4 w-4 opacity-80" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-[11px] text-slate-400 dark:text-slate-500">
        AI HQ · CEO Command Center · Premium UI build (robots only)
      </div>
    </div>
  );
}