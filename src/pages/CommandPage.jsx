import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Command,
  Eye,
  Globe,
  Layers3,
  PanelTop,
  PauseCircle,
  Play,
  Radar,
  RefreshCw,
  Shield,
  Sparkles,
  TimerReset,
  TrendingUp,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const trendData = [
  { name: "Mon", throughput: 42, approvals: 31 },
  { name: "Tue", throughput: 51, approvals: 36 },
  { name: "Wed", throughput: 49, approvals: 34 },
  { name: "Thu", throughput: 68, approvals: 48 },
  { name: "Fri", throughput: 74, approvals: 56 },
  { name: "Sat", throughput: 63, approvals: 45 },
  { name: "Sun", throughput: 82, approvals: 61 },
];

const queueItems = [
  {
    id: "Q-241",
    title: "Approve today’s brand draft",
    desc: "Caption, creative notes, legal-safe tags, distribution window.",
    priority: "High",
    owner: "Content Ops",
    eta: "4 min",
  },
  {
    id: "Q-242",
    title: "Review outbound campaign pack",
    desc: "Meta, TikTok, YouTube short variants aligned and ready.",
    priority: "Medium",
    owner: "Growth Cell",
    eta: "8 min",
  },
  {
    id: "Q-243",
    title: "Publish regional launch batch",
    desc: "TR, AZ, EN assets completed. Final release gate pending.",
    priority: "Critical",
    owner: "Publishing Core",
    eta: "2 min",
  },
];

const liveFeeds = [
  {
    title: "Asset pipeline stabilized",
    time: "just now",
    type: "system",
    detail: "Render queue cleared. Delivery confidence returned to nominal.",
  },
  {
    title: "AI content pass completed",
    time: "3 min ago",
    type: "ai",
    detail: "Tone, compliance and hook-strength scoring finished successfully.",
  },
  {
    title: "CEO approval required",
    time: "7 min ago",
    type: "approval",
    detail: "One draft exceeded threshold and was escalated to executive review.",
  },
  {
    title: "Distribution windows updated",
    time: "11 min ago",
    type: "ops",
    detail: "Peak release intervals adjusted by market behavior model.",
  },
];

const automations = [
  {
    name: "Daily Draft Engine",
    state: "Running",
    cadence: "Every day · 10:00",
    score: "98%",
  },
  {
    name: "Compliance Precheck",
    state: "Running",
    cadence: "On every new asset",
    score: "99%",
  },
  {
    name: "Market Pulse Sync",
    state: "Paused",
    cadence: "Every 2 hours",
    score: "74%",
  },
  {
    name: "Auto Publish Gate",
    state: "Manual",
    cadence: "Triggered by approval",
    score: "91%",
  },
];

const territories = [
  { name: "Baku", load: 88, health: "Stable" },
  { name: "Istanbul", load: 71, health: "Strong" },
  { name: "Dubai", load: 64, health: "Stable" },
  { name: "London", load: 52, health: "Watch" },
];

const copilotSuggestions = [
  "Push the TR campaign batch at 18:40 local for higher engagement probability.",
  "Delay low-performing draft family and re-run opening hook generation.",
  "Approve regional pack now; risk profile is within safe publish threshold.",
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay },
  };
}

function Surface({ className = "", children }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc, action }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <div className="mb-2 text-[10px] uppercase tracking-[0.34em] text-white/28">
            {eyebrow}
          </div>
        ) : null}
        <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-white">
          {title}
        </h3>
        {desc ? <p className="mt-1 text-sm text-white/42">{desc}</p> : null}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, meta, tone = "default" }) {
  const toneClass =
    tone === "cyan"
      ? "from-cyan-400/16 to-cyan-300/0"
      : tone === "violet"
      ? "from-violet-400/16 to-violet-300/0"
      : tone === "emerald"
      ? "from-emerald-400/16 to-emerald-300/0"
      : "from-white/10 to-transparent";

  return (
    <Surface className="h-full">
      <div className={cn("absolute inset-0 bg-gradient-to-br", toneClass)} />
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.05]">
            <Icon className="h-4 w-4 text-white/78" />
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/40">
            {meta}
          </span>
        </div>
        <div className="mt-5 text-[12px] uppercase tracking-[0.26em] text-white/28">
          {label}
        </div>
        <div className="mt-2 text-[34px] font-semibold tracking-[-0.04em] text-white">
          {value}
        </div>
      </div>
    </Surface>
  );
}

function LivePill({ children, tone = "default" }) {
  const toneClass =
    tone === "green"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : tone === "cyan"
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      : tone === "amber"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
      : "border-white/10 bg-white/[0.04] text-white/60";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
        toneClass
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
      {children}
    </div>
  );
}

function QueueItem({ item, active, onSelect }) {
  const priorityTone =
    item.priority === "Critical"
      ? "text-amber-200 border-amber-400/20 bg-amber-400/10"
      : item.priority === "High"
      ? "text-cyan-200 border-cyan-400/20 bg-cyan-400/10"
      : "text-white/65 border-white/10 bg-white/[0.04]";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-[20px] border p-4 text-left transition-all duration-300",
        active
          ? "border-white/12 bg-white/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.22)]"
          : "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{item.title}</div>
          <div className="mt-1 text-sm leading-6 text-white/42">{item.desc}</div>
        </div>
        <div className={cn("rounded-full border px-2.5 py-1 text-[11px]", priorityTone)}>
          {item.priority}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-white/36">
        <span>{item.id}</span>
        <span>•</span>
        <span>{item.owner}</span>
        <span>•</span>
        <span>{item.eta}</span>
      </div>
    </button>
  );
}

function FeedIcon({ type }) {
  if (type === "system") return <Activity className="h-4 w-4" />;
  if (type === "ai") return <Brain className="h-4 w-4" />;
  if (type === "approval") return <Shield className="h-4 w-4" />;
  return <Workflow className="h-4 w-4" />;
}

export default function CommandPage() {
  const [selectedQueue, setSelectedQueue] = useState(queueItems[0]);
  const [commandMode, setCommandMode] = useState("Manual");

  const overview = useMemo(
    () => ({
      draftsToday: 12,
      readyToPublish: 7,
      activeAgents: 19,
      successRate: "94%",
    }),
    []
  );

  return (
    <div className="space-y-6">
      <motion.section {...fadeUp(0)}>
        <Surface className="overflow-hidden rounded-[30px]">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(34,211,238,0.10),transparent_24%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(90deg,rgba(0,0,0,0.02),rgba(0,0,0,0.12))]" />

          <div className="relative grid gap-8 p-6 md:p-8 xl:grid-cols-[1.35fr_0.85fr] xl:p-10">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.05]">
                  <Command className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.34em] text-white/28">
                    AIHQ — Mission Control
                  </div>
                  <div className="mt-1 text-sm text-white/42">
                    Saturday, 7 Mar · Asia/Baku · Executive governance surface
                  </div>
                </div>
              </div>

              <h1 className="mt-8 max-w-[900px] text-[42px] font-semibold leading-[0.95] tracking-[-0.05em] text-white md:text-[56px]">
                Control the day. Approve fast. Publish clean.
              </h1>

              <p className="mt-5 max-w-[760px] text-[17px] leading-8 text-white/46">
                This is not a card dashboard. It is a calm executive surface for
                monitoring pipeline flow, approving output, coordinating agents,
                and releasing with precision.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <LivePill tone="green">WS online</LivePill>
                <LivePill tone="cyan">Daily draft 10:00</LivePill>
                <LivePill tone="amber">{commandMode} mode</LivePill>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon={Sparkles}
                  label="Drafts Today"
                  value={overview.draftsToday}
                  meta="info"
                  tone="cyan"
                />
                <MetricCard
                  icon={Shield}
                  label="Approvals"
                  value="5"
                  meta="review"
                  tone="violet"
                />
                <MetricCard
                  icon={Zap}
                  label="Publish Ready"
                  value={overview.readyToPublish}
                  meta="live"
                  tone="emerald"
                />
                <MetricCard
                  icon={TrendingUp}
                  label="Success (7D)"
                  value={overview.successRate}
                  meta="stable"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Surface className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.34em] text-white/28">
                      Executive actions
                    </div>
                    <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
                      Today’s command deck
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/38">
                    03 priority items
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button className="group rounded-[20px] border border-white/10 bg-white px-4 py-4 text-left text-[#050816] transition hover:translate-y-[-1px]">
                    <div className="text-lg font-semibold">Run daily draft</div>
                    <div className="mt-1 text-sm text-slate-600">
                      Start the content generation and scoring pipeline.
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                      Execute
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </button>

                  <button className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.06]">
                    <div className="text-lg font-semibold text-white">Review drafts</div>
                    <div className="mt-1 text-sm text-white/42">
                      Open all items waiting for executive validation.
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/70">
                      Open queue <Eye className="h-4 w-4" />
                    </div>
                  </button>

                  <button className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.06]">
                    <div className="text-lg font-semibold text-white">Reset flows</div>
                    <div className="mt-1 text-sm text-white/42">
                      Reboot all dependent automations and sync state.
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/70">
                      Reset <RefreshCw className="h-4 w-4" />
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setCommandMode((prev) =>
                        prev === "Manual" ? "Assisted" : prev === "Assisted" ? "Auto" : "Manual"
                      )
                    }
                    className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.06]"
                  >
                    <div className="text-lg font-semibold text-white">Cycle command mode</div>
                    <div className="mt-1 text-sm text-white/42">
                      Current mode: {commandMode}. Switch governance intensity.
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-white/70">
                      Change mode <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              </Surface>

              <Surface className="p-4">
                <SectionTitle
                  eyebrow="AI Copilot"
                  title="Suggested action path"
                  desc="Highest-confidence guidance generated from live system state."
                />
                <div className="mt-4 space-y-3">
                  {copilotSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-[18px] border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-6 text-white/58"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </Surface>
            </div>
          </div>
        </Surface>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.section {...fadeUp(0.08)}>
          <Surface className="p-5 md:p-6">
            <SectionTitle
              eyebrow="Pipeline map"
              title="Live output pressure"
              desc="Throughput and approval movement across the last 7 days."
              action={
                <div className="flex items-center gap-2">
                  <LivePill tone="green">Live</LivePill>
                  <LivePill tone="cyan">WS stream</LivePill>
                </div>
              }
            />

            <div className="mt-6 h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="throughputFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
                      <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
                    </linearGradient>
                    <linearGradient id="approvalsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(129,140,248,0.55)" />
                      <stop offset="100%" stopColor="rgba(129,140,248,0.02)" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                    contentStyle={{
                      background: "rgba(10,15,29,0.96)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      color: "white",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="throughput"
                    stroke="rgba(34,211,238,0.95)"
                    fill="url(#throughputFill)"
                    strokeWidth={2.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="approvals"
                    stroke="rgba(129,140,248,0.95)"
                    fill="url(#approvalsFill)"
                    strokeWidth={2.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Surface>
        </motion.section>

        <motion.section {...fadeUp(0.12)}>
          <Surface className="p-5 md:p-6">
            <SectionTitle
              eyebrow="CEO Queue"
              title="Only what needs your action"
              desc="Filtered decision set for executive review."
              action={
                <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                  {queueItems.length} pending
                </div>
              }
            />

            <div className="mt-5 space-y-3">
              {queueItems.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  active={selectedQueue.id === item.id}
                  onSelect={() => setSelectedQueue(item)}
                />
              ))}
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-white">
                    Selected item
                  </div>
                  <div className="mt-1 text-sm text-white/38">
                    {selectedQueue.id} · {selectedQueue.owner}
                  </div>
                </div>
                <div className="text-xs text-white/36">{selectedQueue.eta}</div>
              </div>

              <div className="mt-4 text-lg font-semibold text-white">
                {selectedQueue.title}
              </div>
              <div className="mt-2 text-sm leading-6 text-white/46">
                {selectedQueue.desc}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-[16px] bg-white px-4 py-3 text-sm font-medium text-[#050816]">
                  Approve now
                </button>
                <button className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white">
                  Open detail
                </button>
                <button className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/70">
                  Delay
                </button>
              </div>
            </div>
          </Surface>
        </motion.section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[0.95fr_1.05fr]">
        <motion.section {...fadeUp(0.16)}>
          <Surface className="p-5 md:p-6">
            <SectionTitle
              eyebrow="Territory pulse"
              title="Region command"
              desc="Market pressure, execution load and surface health."
              action={
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
                  <Globe className="h-4 w-4 text-white/70" />
                </div>
              }
            />

            <div className="mt-5 space-y-4">
              {territories.map((item) => (
                <div
                  key={item.name}
                  className="rounded-[20px] border border-white/[0.08] bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="mt-1 text-xs text-white/36">{item.health}</div>
                    </div>
                    <div className="text-sm font-medium text-white/70">{item.load}%</div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.8),rgba(99,102,241,0.7))]"
                      style={{ width: `${item.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </motion.section>

        <motion.section {...fadeUp(0.2)}>
          <Surface className="p-5 md:p-6">
            <SectionTitle
              eyebrow="Automation matrix"
              title="Orchestrated systems"
              desc="Status of key execution logic across the command layer."
              action={
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/70">
                    <Play className="h-4 w-4" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/70">
                    <PauseCircle className="h-4 w-4" />
                  </button>
                </div>
              }
            />

            <div className="mt-5 grid gap-3">
              {automations.map((item) => {
                const stateTone =
                  item.state === "Running"
                    ? "text-emerald-200 border-emerald-400/20 bg-emerald-400/10"
                    : item.state === "Paused"
                    ? "text-amber-200 border-amber-400/20 bg-amber-400/10"
                    : "text-cyan-200 border-cyan-400/20 bg-cyan-400/10";

                return (
                  <div
                    key={item.name}
                    className="grid gap-3 rounded-[20px] border border-white/[0.08] bg-black/20 p-4 md:grid-cols-[1fr_auto_auto]"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{item.name}</div>
                      <div className="mt-1 text-sm text-white/40">{item.cadence}</div>
                    </div>
                    <div className={cn("rounded-full border px-3 py-1 text-xs", stateTone)}>
                      {item.state}
                    </div>
                    <div className="text-sm font-medium text-white/68">{item.score}</div>
                  </div>
                );
              })}
            </div>
          </Surface>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <motion.section {...fadeUp(0.24)}>
          <Surface className="p-5 md:p-6">
            <SectionTitle
              eyebrow="Live stream"
              title="Command events"
              desc="Recent system, AI and execution layer changes."
              action={
                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
                  <Radar className="h-4 w-4 text-white/70" />
                </div>
              }
            />

            <div className="mt-5 space-y-3">
              {liveFeeds.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 rounded-[18px] border border-white/[0.08] bg-black/20 p-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04] text-white/72">
                    <FeedIcon type={item.type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-medium text-white">{item.title}</div>
                      <div className="text-xs text-white/34">{item.time}</div>
                    </div>
                    <div className="mt-1 text-sm leading-6 text-white/42">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </motion.section>

        <motion.section {...fadeUp(0.28)}>
          <div className="grid gap-6 md:grid-cols-2">
            <Surface className="p-5">
              <SectionTitle
                eyebrow="Agent layer"
                title="AI Crew"
                desc="Specialized systems handling ideation, compliance and release."
              />
              <div className="mt-5 space-y-3">
                {[
                  { icon: Brain, label: "Creative Brain", value: "Online" },
                  { icon: Shield, label: "Compliance Guard", value: "Watching" },
                  { icon: Workflow, label: "Flow Orchestrator", value: "Stable" },
                  { icon: Bot, label: "Auto Publisher", value: "Ready" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-[18px] border border-white/[0.08] bg-black/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
                          <Icon className="h-4 w-4 text-white/74" />
                        </div>
                        <div className="text-sm font-medium text-white">{item.label}</div>
                      </div>
                      <div className="text-xs text-white/42">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </Surface>

            <Surface className="p-5">
              <SectionTitle
                eyebrow="Quick tools"
                title="Command utilities"
                desc="Immediate functions for recovery, audit and rerun."
              />
              <div className="mt-5 grid gap-3">
                {[
                  {
                    icon: TimerReset,
                    title: "Re-run failed tasks",
                    desc: "Retry blocked jobs and clear stale states.",
                  },
                  {
                    icon: Layers3,
                    title: "Open asset matrix",
                    desc: "Review content pack dependencies.",
                  },
                  {
                    icon: PanelTop,
                    title: "View governance log",
                    desc: "Inspect approval sequence and comments.",
                  },
                  {
                    icon: Clock3,
                    title: "Shift publish windows",
                    desc: "Reschedule by region and confidence.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      className="group rounded-[18px] border border-white/[0.08] bg-black/20 p-4 text-left transition hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
                          <Icon className="h-4 w-4 text-white/74" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{item.title}</div>
                          <div className="mt-1 text-sm leading-6 text-white/42">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Surface>
          </div>
        </motion.section>
      </div>

      <motion.section {...fadeUp(0.32)}>
        <Surface className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.34em] text-white/28">
                Executive footer
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                Calm surface. Fast decisions. Clean output.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-[16px] bg-white px-4 py-3 text-sm font-medium text-[#050816]">
                Open full command center
              </button>
              <button className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white">
                Export daily snapshot
              </button>
            </div>
          </div>
        </Surface>
      </motion.section>
    </div>
  );
}