// src/pages/Dashboard.jsx (MISSION CONTROL — ELITE v3.0)
// ✅ Same layout: Map (ReactFlow) + Right Queue + Bottom Signals + Drawer
// ✅ Premium admin feel: hover lift, sheen, stronger depth, active states
// ✅ Mobile optimized: stacked layout, drawer full width on mobile
// ✅ Keeps: reactflow, framer-motion, recharts, dayjs, lucide-react

import { useMemo, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Command,
  Search,
  Bell,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Timer,
  Flame,
  TrendingUp,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function cx(...a) {
  return a.filter(Boolean).join(" ");
}

function fmtPct(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `${Math.round(v * 100)}%`;
}

function shortId(id) {
  const s = String(id || "");
  if (s.length <= 10) return s || "—";
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

function toneCls(tone) {
  if (tone === "success") return "from-emerald-400/18 via-emerald-400/6";
  if (tone === "warn") return "from-amber-400/18 via-amber-400/6";
  if (tone === "danger") return "from-rose-400/18 via-rose-400/6";
  if (tone === "info") return "from-cyan-400/18 via-cyan-400/6";
  return "from-white/10 via-white/5";
}

function Pill({ tone = "neutral", children, className }) {
  const cls =
    tone === "success"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : tone === "warn"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : tone === "danger"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
      : tone === "info"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      : "border-white/10 bg-white/5 text-slate-200";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        "shadow-[0_1px_0_rgba(255,255,255,0.06)]",
        cls,
        className
      )}
    >
      {children}
    </span>
  );
}

/** Premium button (no external deps) */
function ActionButton({ variant = "ghost", children, className, ...props }) {
  const v =
    variant === "primary"
      ? "bg-white text-[#050712] hover:opacity-95"
      : variant === "soft"
      ? "border border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.10]"
      : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]";

  return (
    <button
      className={cx(
        "relative inline-flex items-center justify-center gap-2",
        "rounded-2xl px-4 py-3 text-sm font-semibold",
        "transition-[transform,box-shadow,background-color,border-color] duration-200",
        "active:translate-y-[1px]",
        "hover:-translate-y-[1px]",
        "shadow-[0_18px_60px_rgba(0,0,0,0.45)] hover:shadow-[0_30px_90px_rgba(0,0,0,0.62)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        v,
        className
      )}
      {...props}
    >
      {/* sheen */}
      <span
        className={cx(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0",
          "transition-opacity duration-200",
          "group-hover:opacity-100"
        )}
      />
      <span className="relative z-10">{children}</span>
      <span
        className={cx(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "[mask-image:radial-gradient(900px_circle_at_30%_-20%,black,transparent_55%)]"
        )}
      >
        <span className="absolute inset-0 bg-gradient-to-b from-white/14 to-transparent opacity-70" />
      </span>
    </button>
  );
}

function MetricChip({ icon, label, value, tone = "neutral" }) {
  return (
    <div
      className={cx(
        "group relative rounded-2xl border px-4 py-3",
        "border-white/10 bg-white/[0.035] backdrop-blur",
        "shadow-[0_22px_90px_rgba(0,0,0,0.40)]",
        "transition-[transform,box-shadow,background-color,border-color] duration-200",
        "hover:-translate-y-[2px] hover:bg-white/[0.05] hover:border-white/14",
        "hover:shadow-[0_36px_130px_rgba(0,0,0,0.62)]"
      )}
    >
      <div
        className={cx(
          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[18px]",
          "bg-gradient-to-br",
          toneCls(tone),
          "to-transparent",
          "group-hover:opacity-90"
        )}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300/80">
            <span className="opacity-80">{icon}</span>
            <span className="uppercase tracking-wider">{label}</span>
          </div>
          <div className="mt-1 text-[26px] font-semibold tracking-tight text-white">{value}</div>
        </div>
        <Pill tone={tone}>{tone === "neutral" ? "LIVE" : tone}</Pill>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cx(
              "fixed right-0 top-0 z-50 h-full w-[460px] max-w-[96vw]",
              "border-l border-white/10 bg-[#070A12]/92 backdrop-blur-xl",
              "shadow-[-50px_0_140px_rgba(0,0,0,0.72)]"
            )}
            initial={{ x: 36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 36, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="mt-1 text-xs text-slate-300/70">CEO decisions / details</div>
              </div>
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="h-[1px] bg-white/10" />
            <div className="p-5 overflow-auto h-[calc(100%-72px)]">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function NodeBox({ title, subtitle, tone = "neutral", status }) {
  const ring =
    tone === "success"
      ? "ring-emerald-400/25"
      : tone === "warn"
      ? "ring-amber-400/25"
      : tone === "info"
      ? "ring-cyan-400/25"
      : tone === "danger"
      ? "ring-rose-400/25"
      : "ring-white/15";

  const dot =
    tone === "success"
      ? "bg-emerald-400"
      : tone === "warn"
      ? "bg-amber-400"
      : tone === "info"
      ? "bg-cyan-400"
      : tone === "danger"
      ? "bg-rose-400"
      : "bg-slate-400";

  return (
    <div
      className={cx(
        "group min-w-[240px] rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4",
        "shadow-[0_34px_160px_rgba(0,0,0,0.58)]",
        "ring-1",
        ring,
        "transition-[transform,box-shadow,background-color,border-color] duration-200",
        "hover:-translate-y-[2px] hover:bg-white/[0.055] hover:border-white/14",
        "hover:shadow-[0_44px_190px_rgba(0,0,0,0.72)]"
      )}
    >
      <div
        className={cx(
          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[18px]",
          "bg-gradient-to-br",
          toneCls(tone),
          "to-transparent",
          "group-hover:opacity-85"
        )}
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs text-slate-300/70">{subtitle}</div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className={cx("h-2 w-2 rounded-full", dot)} />
          <span className="text-[11px] font-semibold text-slate-200/80 uppercase tracking-wider">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  box: ({ data }) => (
    <NodeBox title={data.title} subtitle={data.subtitle} tone={data.tone} status={data.status} />
  ),
};

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);

  const now = useMemo(() => dayjs(), []);

  const metrics = useMemo(
    () => ({
      draftsToday: 1,
      approvals: 2,
      publishReady: 0,
      success7d: 0.94,
    }),
    []
  );

  const decisions = useMemo(
    () => [
      {
        id: "8aa468ab-9c64-44bc-ab94-7919e4974dc6",
        type: "Draft",
        tone: "warn",
        title: "Approve today’s draft",
        subtitle: "Caption + hashtags + layout instructions ready.",
        age: "now",
      },
      {
        id: "5fcb64c7-f241-4bb9-a1ae-f8fbc9aae7fe",
        type: "Execution",
        tone: "info",
        title: "Review content pack",
        subtitle: "Validate structure, tone, and compliance.",
        age: "12m",
      },
      {
        id: "job-0003",
        type: "Publish",
        tone: "neutral",
        title: "Publish gate locked",
        subtitle: "Waiting for CEO approval — no auto-publish.",
        age: "1h",
      },
    ],
    []
  );

  const filteredDecisions = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    if (!q) return decisions;
    return decisions.filter((d) => {
      return (
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        String(d.type).toLowerCase().includes(q) ||
        String(d.id).toLowerCase().includes(q)
      );
    });
  }, [decisions, search]);

  const chart = useMemo(
    () => [
      { d: "Mon", v: 68 },
      { d: "Tue", v: 74 },
      { d: "Wed", v: 71 },
      { d: "Thu", v: 78 },
      { d: "Fri", v: 82 },
      { d: "Sat", v: 76 },
      { d: "Sun", v: 84 },
    ],
    []
  );

  const initialNodes = useMemo(
    () => [
      {
        id: "n1",
        type: "box",
        position: { x: 0, y: 70 },
        data: { title: "DRAFT", subtitle: "Create daily draft (10:00 Asia/Baku)", tone: "success", status: "READY" },
      },
      {
        id: "n2",
        type: "box",
        position: { x: 320, y: 0 },
        data: { title: "ASSETS PLAN", subtitle: "Image/Video/Voice prompts + layout blueprint", tone: "info", status: "RUNNING" },
      },
      {
        id: "n3",
        type: "box",
        position: { x: 320, y: 160 },
        data: { title: "CEO REVIEW", subtitle: "Approve draft or request changes", tone: "warn", status: "WAITING" },
      },
      {
        id: "n4",
        type: "box",
        position: { x: 680, y: 70 },
        data: { title: "PUBLISH", subtitle: "Meta publish workflow (locked until approval)", tone: "neutral", status: "LOCKED" },
      },
    ],
    []
  );

  const initialEdges = useMemo(
    () => [
      { id: "e1-2", source: "n1", target: "n2", animated: true, style: { stroke: "rgba(255,255,255,0.22)" } },
      { id: "e1-3", source: "n1", target: "n3", animated: true, style: { stroke: "rgba(255,255,255,0.22)" } },
      { id: "e2-4", source: "n2", target: "n4", style: { stroke: "rgba(255,255,255,0.18)" } },
      { id: "e3-4", source: "n3", target: "n4", style: { stroke: "rgba(255,255,255,0.18)" } },
    ],
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setNodes((ns) =>
        ns.map((n) => {
          if (n.id !== "n2") return n;
          return {
            ...n,
            data: {
              ...n.data,
              subtitle:
                Math.random() > 0.5
                  ? "Image/Video/Voice prompts + layout blueprint"
                  : "Packaging assets plan for CEO preview",
            },
          };
        })
      );
    }, 3200);
    return () => clearInterval(t);
  }, [paused, setNodes]);

  const openDecision = useCallback((d) => {
    setSelectedDecision(d);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050712]">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute left-1/3 -bottom-72 h-[620px] w-[620px] rounded-full bg-emerald-500/8 blur-[110px]" />
        {/* soft vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/35" />

        {/* TOP BAR */}
        <div className="relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5">
              <Command className="h-5 w-5 text-white/90" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">AI HQ — Mission Control</div>
              <div className="mt-0.5 text-xs text-slate-300/70">
                {now.format("dddd, D MMM")} · Asia/Baku · CEO-first governance
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Search className="h-4 w-4 text-slate-200/70" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search decisions…"
                className="w-[320px] bg-transparent text-sm text-white placeholder:text-slate-300/50 outline-none"
              />
              {search ? (
                <button
                  onClick={() => setSearch("")}
                  className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/10"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <ActionButton variant="soft" onClick={() => alert("Later: notifications")} title="Notifications">
              <Bell className="h-4 w-4" />
            </ActionButton>

            <ActionButton variant="soft" onClick={() => setPaused((v) => !v)} title="Pause live">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </ActionButton>
          </div>
        </div>

        {/* HERO */}
        <div className="relative z-10 px-4 sm:px-6 pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-[34px] sm:text-[40px] leading-[1.05] font-semibold tracking-tight text-white">
                Control the day. Approve fast. Publish clean.
              </div>
              <div className="mt-2 text-sm text-slate-300/75 max-w-[72ch]">
                A calm executive surface. The map is the product: Draft → Assets → Review → Publish.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill tone="success">
                  <Shield className="h-4 w-4 opacity-80" />
                  WS Online
                </Pill>
                <Pill tone="info">
                  <Sparkles className="h-4 w-4 opacity-80" />
                  Daily draft 10:00
                </Pill>
                <Pill tone="neutral">
                  <Timer className="h-4 w-4 opacity-80" />
                  Manual mode
                </Pill>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton variant="primary" onClick={() => alert("Later: trigger daily draft")}>
                Run daily draft <ArrowRight className="h-4 w-4" />
              </ActionButton>

              <ActionButton variant="soft" onClick={() => alert("Later: open drafts")}>
                Review drafts <Eye className="h-4 w-4" />
              </ActionButton>

              <ActionButton variant="soft" onClick={() => setSearch("")}>
                Reset <RefreshCw className="h-4 w-4" />
              </ActionButton>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="relative z-10 px-4 sm:px-6 pb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricChip icon={<Sparkles className="h-4 w-4" />} label="Drafts today" value={metrics.draftsToday} tone="info" />
          <MetricChip icon={<Flame className="h-4 w-4" />} label="Approvals" value={metrics.approvals} tone="warn" />
          <MetricChip icon={<Shield className="h-4 w-4" />} label="Publish ready" value={metrics.publishReady} tone="neutral" />
          <MetricChip icon={<TrendingUp className="h-4 w-4" />} label="Success (7d)" value={fmtPct(metrics.success7d)} tone="success" />
        </div>

        {/* MAIN */}
        <div className="relative z-10 grid gap-4 px-4 sm:px-6 pb-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* Map */}
          <div className="min-w-0 rounded-[26px] border border-white/10 bg-white/[0.03] backdrop-blur">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Pipeline Map</div>
                <div className="mt-1 text-xs text-slate-300/70">
                  The center is the system. Live map, no “card dashboard” feel.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Pill tone={paused ? "neutral" : "success"}>{paused ? "PAUSED" : "LIVE"}</Pill>
                <Pill tone="info">
                  <Activity className="h-4 w-4 opacity-80" />
                  WS stream
                </Pill>
              </div>
            </div>

            <div className="h-[420px] sm:h-[520px] w-full overflow-hidden rounded-[26px]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.22 }}
                proOptions={{ hideAttribution: true }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag
              >
                <Background gap={18} size={1} color="rgba(255,255,255,0.06)" />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable />
              </ReactFlow>
            </div>
          </div>

          {/* Queue */}
          <div className="min-w-0 rounded-[26px] border border-white/10 bg-white/[0.03] backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">CEO Queue</div>
                <div className="mt-1 text-xs text-slate-300/70">Only what needs your action.</div>
              </div>
              <Pill tone="warn">{filteredDecisions.length}</Pill>
            </div>

            <div className="px-4 pb-4">
              <div className="lg:hidden mb-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-200/70" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search decisions…"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-300/50 outline-none"
                />
              </div>

              <div className="space-y-2">
                {filteredDecisions.map((d) => {
                  const active = selectedDecision?.id === d.id && drawerOpen;

                  return (
                    <button
                      key={d.id}
                      onClick={() => openDecision(d)}
                      className={cx(
                        "group relative w-full rounded-2xl border px-4 py-3 text-left",
                        "transition-[transform,box-shadow,background-color,border-color] duration-200",
                        "hover:-translate-y-[2px] active:translate-y-[1px]",
                        "shadow-[0_20px_80px_rgba(0,0,0,0.42)] hover:shadow-[0_34px_120px_rgba(0,0,0,0.62)]",
                        active ? "border-white/18 bg-white/[0.10]" : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {/* glow */}
                      <div
                        className={cx(
                          "pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-[18px]",
                          "bg-gradient-to-br",
                          toneCls(d.tone),
                          "to-transparent",
                          active ? "opacity-100" : "group-hover:opacity-85"
                        )}
                        aria-hidden="true"
                      />

                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{d.title}</div>
                          <div className="mt-1 text-xs text-slate-300/70 line-clamp-2">{d.subtitle}</div>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-300/70">
                            <span className="inline-flex items-center gap-1.5">
                              <Timer className="h-3.5 w-3.5 opacity-80" />
                              {d.age}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                              {shortId(d.id)}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <Pill tone={d.tone}>{d.type}</Pill>
                          <span className="text-[11px] text-slate-200/60 inline-flex items-center gap-1">
                            Open <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {filteredDecisions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/3 px-4 py-6 text-sm text-slate-300/70">
                    No results.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Signals */}
        <div className="relative z-10 px-4 sm:px-6 pb-6">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Signals</div>
                <div className="mt-1 text-xs text-slate-300/70">Weekly performance signal (demo).</div>
              </div>
              <Pill tone="success">OK</Pill>
            </div>

            <div className="px-5 pb-5 h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: "rgba(226,232,240,0.70)", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} width={30} tick={{ fill: "rgba(226,232,240,0.55)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(7,10,18,0.92)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 14,
                      color: "white",
                      boxShadow: "0 30px 100px rgba(0,0,0,0.65)",
                    }}
                    labelStyle={{ color: "rgba(226,232,240,0.8)" }}
                    cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <Line type="monotone" dataKey="v" stroke="rgba(56,189,248,0.9)" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedDecision ? selectedDecision.title : "Decision"}>
        {!selectedDecision ? (
          <div className="text-sm text-slate-200/80">Select an item from the queue.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{selectedDecision.title}</div>
                  <div className="mt-1 text-xs text-slate-300/70">{selectedDecision.subtitle}</div>
                </div>
                <Pill tone={selectedDecision.tone}>{selectedDecision.type}</Pill>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] font-semibold text-slate-300/70 uppercase tracking-wider">ID</div>
                  <div className="mt-1 text-sm font-semibold text-white">{shortId(selectedDecision.id)}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[11px] font-semibold text-slate-300/70 uppercase tracking-wider">Age</div>
                  <div className="mt-1 text-sm font-semibold text-white">{selectedDecision.age}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton variant="soft" onClick={() => alert("Later: open full detail")}>
                Open detail <Eye className="h-4 w-4" />
              </ActionButton>
              <ActionButton variant="primary" onClick={() => alert("Later: approve/action")}>
                Approve / Action <CheckCircle2 className="h-4 w-4" />
              </ActionButton>
            </div>

            <div className="text-[11px] text-slate-300/55">
              Demo drawer. Later we’ll wire it to proposals/executions endpoints.
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}