import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  Eye,
  Flame,
  Globe,
  Instagram,
  Layers3,
  LayoutDashboard,
  MessageCircleMore,
  Mic,
  MonitorPlay,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Waves,
  Youtube,
  Zap,
} from "lucide-react";

const trendData = [
  { name: "Mon", reach: 180, engagement: 42, sentiment: 64, conversions: 18 },
  { name: "Tue", reach: 220, engagement: 48, sentiment: 68, conversions: 21 },
  { name: "Wed", reach: 260, engagement: 58, sentiment: 70, conversions: 28 },
  { name: "Thu", reach: 310, engagement: 61, sentiment: 72, conversions: 33 },
  { name: "Fri", reach: 355, engagement: 66, sentiment: 74, conversions: 39 },
  { name: "Sat", reach: 398, engagement: 71, sentiment: 79, conversions: 46 },
  { name: "Sun", reach: 442, engagement: 76, sentiment: 82, conversions: 51 },
];

const funnelData = [
  { name: "Impressions", value: 8400 },
  { name: "Engaged", value: 3670 },
  { name: "Qualified", value: 2184 },
  { name: "Meetings", value: 624 },
  { name: "Sales", value: 183 },
];

const hourlyRealtime = [
  { hour: "00", messages: 22, leads: 8 },
  { hour: "04", messages: 31, leads: 12 },
  { hour: "08", messages: 49, leads: 16 },
  { hour: "12", messages: 76, leads: 23 },
  { hour: "16", messages: 88, leads: 28 },
  { hour: "20", messages: 95, leads: 34 },
  { hour: "24", messages: 72, leads: 26 },
];

const competitorData = [
  { subject: "Reach", brand: 92, rivalA: 78, rivalB: 83, fullMark: 100 },
  { subject: "Engagement", brand: 88, rivalA: 74, rivalB: 85, fullMark: 100 },
  { subject: "Video", brand: 81, rivalA: 69, rivalB: 77, fullMark: 100 },
  { subject: "Ads", brand: 76, rivalA: 82, rivalB: 71, fullMark: 100 },
  { subject: "Sentiment", brand: 84, rivalA: 67, rivalB: 74, fullMark: 100 },
  { subject: "Growth", brand: 90, rivalA: 79, rivalB: 80, fullMark: 100 },
];

const channelMix = [
  { name: "Instagram", value: 34, growth: "+12%" },
  { name: "TikTok", value: 24, growth: "+18%" },
  { name: "YouTube", value: 18, growth: "+9%" },
  { name: "X", value: 11, growth: "-2%" },
  { name: "LinkedIn", value: 13, growth: "+6%" },
];

const contentData = [
  { type: "Reels", score: 91, posts: 42 },
  { type: "Carousels", score: 82, posts: 27 },
  { type: "Stories", score: 73, posts: 65 },
  { type: "Short Video", score: 95, posts: 34 },
  { type: "Static", score: 61, posts: 19 },
];

const topPosts = [
  {
    title: "Founder story reel — trust driven launch",
    platform: "Instagram",
    reach: "1.2M",
    er: "8.9%",
    sentiment: "Very positive",
    status: "Hot",
    detail: "High trust-led watch time, strongest saves-to-share ratio this week.",
  },
  {
    title: "Competitor price breakdown short video",
    platform: "TikTok",
    reach: "934K",
    er: "7.8%",
    sentiment: "Positive",
    status: "Rising",
    detail: "Cost comparison framing triggered strong comment velocity and replay depth.",
  },
  {
    title: "Case study carousel — before / after",
    platform: "Instagram",
    reach: "688K",
    er: "6.4%",
    sentiment: "Positive",
    status: "Stable",
    detail: "Best conversion assist among educational creatives in the current cycle.",
  },
  {
    title: "AI chatbot response speed demo",
    platform: "YouTube",
    reach: "580K",
    er: "5.7%",
    sentiment: "Mixed-positive",
    status: "Stable",
    detail: "Longer retention curve but lower top-of-funnel click-through than shorts.",
  },
  {
    title: "Brand vs rivals feature matrix",
    platform: "LinkedIn",
    reach: "221K",
    er: "4.9%",
    sentiment: "Professional-positive",
    status: "Rising",
    detail: "Exec audience engagement surged after data-backed differentiation framing.",
  },
];

const alerts = [
  {
    level: "critical",
    title: "Competitor A accelerated paid traffic by 22%",
    desc: "Detected creative duplication pattern in short-form vertical ads over the last 48 hours.",
    time: "6 min ago",
  },
  {
    level: "info",
    title: "Brand sentiment increased after AI support rollout",
    desc: "Realtime chatbot handling time dropped from 3m 12s to 58s.",
    time: "19 min ago",
  },
  {
    level: "warning",
    title: "Instagram story completion slightly down",
    desc: "Completion rate fell 6.1% on weekend story sequences longer than 6 frames.",
    time: "38 min ago",
  },
  {
    level: "success",
    title: "Lead capture conversion improved",
    desc: "WhatsApp funnel assisted by agent routing produced 14.8% better lead qualification.",
    time: "1 hr ago",
  },
];

const workspaceNav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "realtime", label: "Realtime Ops", icon: Radio },
  { id: "competitors", label: "Competitors", icon: Target },
  { id: "content", label: "Content Lab", icon: MonitorPlay },
  { id: "agents", label: "Agent Kernel", icon: Bot },
];

const agentCards = [
  {
    id: "orion",
    name: "Orion",
    role: "Strategist",
    status: "Online",
    load: 72,
    tasks: 14,
    icon: BrainCircuit,
    desc: "Planning growth actions, summarizing signals and recommending brand moves.",
  },
  {
    id: "nova",
    name: "Nova",
    role: "Content & Instagram",
    status: "Analyzing",
    load: 88,
    tasks: 23,
    icon: Sparkles,
    desc: "Detecting hooks, format shifts, content gaps and narrative opportunities.",
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Sales & WhatsApp",
    status: "Online",
    load: 64,
    tasks: 11,
    icon: Target,
    desc: "Lead qualification, funnel routing and WhatsApp conversion assistance.",
  },
  {
    id: "echo",
    name: "Echo",
    role: "Analytics",
    status: "Streaming",
    load: 91,
    tasks: 29,
    icon: Activity,
    desc: "Monitoring performance, risks, anomalies, attribution and benchmark shifts.",
  },
];

const kpis = [
  {
    label: "Total Reach",
    value: "8.4M",
    delta: "+18.2%",
    positive: true,
    icon: Eye,
    note: "7 days vs previous period",
  },
  {
    label: "Engagement Rate",
    value: "7.8%",
    delta: "+1.4%",
    positive: true,
    icon: Waves,
    note: "weighted across platforms",
  },
  {
    label: "Share of Voice",
    value: "31.6%",
    delta: "+4.7%",
    positive: true,
    icon: Globe,
    note: "brand vs 12 tracked rivals",
  },
  {
    label: "Qualified Leads",
    value: "2,184",
    delta: "+12.9%",
    positive: true,
    icon: Users,
    note: "chat + landing funnel",
  },
  {
    label: "Realtime Response",
    value: "58 sec",
    delta: "-41.3%",
    positive: true,
    icon: MessageCircleMore,
    note: "faster is better",
  },
  {
    label: "Risk Alerts",
    value: "12",
    delta: "+3",
    positive: false,
    icon: CircleAlert,
    note: "need review today",
  },
];

const detailPanels = {
  overview: {
    title: "Overview Deep Dive",
    subtitle: "Executive visibility into the highest leverage movements across brand, audience and conversion.",
    bullets: [
      "Short-form video is your primary growth engine with the strongest save-to-share efficiency.",
      "Community sentiment has sustained improvement after support automation optimization.",
      "Conversion lift is strongest on assets combining proof, urgency and fast-response chat routing.",
    ],
  },
  realtime: {
    title: "Realtime Ops Center",
    subtitle: "Live conversation, lead and support traffic from 24/7 automated systems.",
    bullets: [
      "Peak inbound message pressure occurs between 16:00 and 22:00.",
      "Lead quality increases when Atlas routing is triggered within the first 60 seconds.",
      "Escalation alerts currently concentrate around competitor offer comparisons and pricing objections.",
    ],
  },
  competitors: {
    title: "Competitor Intelligence",
    subtitle: "Share-of-voice, content posture, paid pressure and narrative positioning compared side by side.",
    bullets: [
      "Rival A is spending harder but converting sentiment less efficiently.",
      "Rival B is stable in awareness but weaker in feature-led storytelling.",
      "Your strongest moat remains trust-heavy proof assets plus faster realtime response.",
    ],
  },
  content: {
    title: "Content Lab",
    subtitle: "Format, topic and execution analysis revealing what deserves more budget and volume.",
    bullets: [
      "Reels and short video dominate upper-funnel expansion.",
      "Case-study carousels assist the most downstream conversions.",
      "Long story sequences should be compressed to protect completion and forward taps.",
    ],
  },
  agents: {
    title: "Agent Kernel Detail",
    subtitle: "AI roles, queues, load health and operational alignment with business workflows.",
    bullets: [
      "Echo currently carries the heaviest load due to streaming signal aggregation.",
      "Nova is producing the highest number of net-new tactical recommendations.",
      "Atlas performance is best when paired with high-intent visitor scoring.",
    ],
  },
};

const pieColors = ["#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#f43f5e"];

function cn(...arr) {
  return arr.filter(Boolean).join(" ");
}

function GlassCard({ className = "", children, hover = false }) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-[0_12px_60px_rgba(0,0,0,0.28)]",
        hover && "transition duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_18px_80px_rgba(56,189,248,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function AccentPill({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#091021]/95 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur-xl">
      <div className="mb-2 font-medium text-white/80">{label}</div>
      {payload.map((entry) => (
        <div key={`${entry.dataKey}-${entry.value}`} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-white/55">{entry.name}</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ eyebrow, title, desc, right }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <AccentPill>{eyebrow}</AccentPill>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58 md:text-base">{desc}</p>
      </div>
      {right}
    </div>
  );
}

function KpiCard({ item, i, onClick }) {
  const Icon = item.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: i * 0.04 }}
      className="text-left"
    >
      <GlassCard hover className="group h-full overflow-hidden p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_36%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/55">{item.label}</p>
            <div className="mt-3 flex items-end gap-3">
              <h3 className="text-3xl font-semibold text-white">{item.value}</h3>
              <span
                className={cn(
                  "mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  item.positive ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300",
                )}
              >
                {item.positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {item.delta}
              </span>
            </div>
            <p className="mt-2 text-xs text-white/40">{item.note}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300 transition group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="relative mt-5 flex items-center gap-2 text-xs font-medium text-white/38 transition group-hover:text-cyan-300">
          Open detail
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </GlassCard>
    </motion.button>
  );
}

function SidebarNav({ active, setActive }) {
  return (
    <GlassCard className="sticky top-5 hidden h-[calc(100vh-40px)] w-full flex-col justify-between overflow-hidden p-4 xl:flex">
      <div>
        <div className="mb-6 flex items-center gap-3 px-2 pt-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_12px_40px_rgba(139,92,246,0.35)]">
            <Layers3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI-HQ</div>
            <div className="text-xs text-white/40">Intelligence Workspace</div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-white/30" />
            <input placeholder="Search panel..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
          </div>
        </div>

        <div className="space-y-2">
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm transition",
                  isActive ? "bg-white text-slate-900" : "bg-white/[0.02] text-white/65 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[26px] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 p-4">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Realtime kernel</span>
        </div>
        <p className="text-sm leading-6 text-white/60">24/7 agents are monitoring content shifts, competitor movement, live chat pressure and campaign anomalies.</p>
      </div>
    </GlassCard>
  );
}

function Header({ range, setRange, platform, setPlatform }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_left,rgba(168,85,247,0.16),transparent_22%)]" />
      <div className="relative flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="max-w-4xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            ai-hq intelligence suite
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Elite analytics command center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60 md:text-base">
            Main analytics page with drill-down modules, premium workspace navigation, live signal streams, competitor intelligence, content analysis and always-on agent operations.
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
            <Search className="h-4 w-4 text-white/35" />
            <input
              placeholder="Search metric, competitor, signal..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28 md:w-72"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {["all", "instagram", "tiktok", "youtube"].map((item) => (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm capitalize transition",
                  platform === item ? "bg-white text-slate-900" : "text-white/70 hover:text-white",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[
              { key: "24h", label: "24H" },
              { key: "7d", label: "7D" },
              { key: "30d", label: "30D" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setRange(item.key)}
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm transition",
                  range === item.key ? "bg-white text-slate-900" : "border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DetailDrawer({ activePanel, onClose }) {
  const panel = detailPanels[activePanel];
  return (
    <AnimatePresence>
      {panel && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-2xl border-l border-white/10 bg-[#07101f]/90 p-5 backdrop-blur-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <AccentPill>Detail</AccentPill>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{panel.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{panel.subtitle}</p>
                </div>
                <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.08]">
                  Close
                </button>
              </div>

              <div className="grid gap-4 overflow-auto pr-1">
                <GlassCard className="p-5">
                  <h4 className="text-lg font-semibold text-white">Strategic summary</h4>
                  <div className="mt-4 space-y-3">
                    {panel.bullets.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-white/72">
                        <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <h4 className="text-lg font-semibold text-white">Expanded signal chart</h4>
                  <div className="mt-4 h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                        <Tooltip content={<TooltipBox />} />
                        <Line type="monotone" dataKey="reach" name="Reach" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#06b6d4" strokeWidth={3} dot={false} />
                        <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#22c55e" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <h4 className="text-lg font-semibold text-white">Recommended actions</h4>
                  <div className="mt-4 grid gap-3">
                    {[
                      "Launch a focused high-trust content sprint aligned to strongest performing topics.",
                      "Increase monitoring cadence for competitor bursts and mention velocity spikes.",
                      "Send high-intent chat traffic into fast-response human or agent-assisted flows.",
                      "Use proof-heavy creatives in any platform currently showing stronger commercial intent.",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-white/8 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-4 text-sm leading-6 text-white/72">
                        {item}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TopPostsTable({ onOpen }) {
  return (
    <GlassCard className="overflow-hidden">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Top performing content</h3>
            <p className="mt-1 text-sm text-white/50">Each row opens a richer detail state for deeper campaign inspection.</p>
          </div>
          <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.18em] text-white/35">
            <tr>
              <th className="px-6 py-4">Content</th>
              <th className="px-6 py-4">Platform</th>
              <th className="px-6 py-4">Reach</th>
              <th className="px-6 py-4">ER</th>
              <th className="px-6 py-4">Sentiment</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {topPosts.map((row, idx) => (
              <tr
                key={row.title}
                onClick={onOpen}
                className={cn(
                  "cursor-pointer transition hover:bg-white/[0.04]",
                  idx !== topPosts.length - 1 && "border-b border-white/8",
                )}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{row.title}</div>
                  <div className="mt-1 text-xs text-white/40">{row.detail}</div>
                </td>
                <td className="px-6 py-4 text-white/70">{row.platform}</td>
                <td className="px-6 py-4 text-white/85">{row.reach}</td>
                <td className="px-6 py-4 text-white/85">{row.er}</td>
                <td className="px-6 py-4 text-white/70">{row.sentiment}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                      row.status === "Hot"
                        ? "bg-rose-500/10 text-rose-300"
                        : row.status === "Rising"
                          ? "bg-amber-400/10 text-amber-300"
                          : "bg-emerald-400/10 text-emerald-300",
                    )}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function AlertsFeed({ onOpen }) {
  return (
    <GlassCard className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Live intelligence alerts</h3>
          <p className="mt-1 text-sm text-white/50">Streaming signals from social, competitors, chatbot and funnel activity.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          realtime
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <button key={alert.title} onClick={onOpen} className="block w-full text-left">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-2.5 w-2.5 rounded-full",
                        alert.level === "critical"
                          ? "bg-rose-400"
                          : alert.level === "warning"
                            ? "bg-amber-400"
                            : alert.level === "success"
                              ? "bg-emerald-400"
                              : "bg-cyan-400",
                      )}
                    />
                    <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/55">{alert.desc}</p>
                </div>
                <span className="shrink-0 text-xs text-white/35">{alert.time}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}

function AgentPanel({ onOpen }) {
  return (
    <GlassCard className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">AI agent kernel status</h3>
          <p className="mt-1 text-sm text-white/50">Connected to strategist, content, sales and analytics agents.</p>
        </div>
        <button onClick={onOpen} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
          <Bot className="h-3.5 w-3.5" />
          4 online
        </button>
      </div>

      <div className="grid gap-3">
        {agentCards.map((agent) => {
          const Icon = agent.icon;
          return (
            <button key={agent.id} onClick={onOpen} className="text-left">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{agent.name}</h4>
                        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300">{agent.status}</span>
                      </div>
                      <p className="text-sm text-white/45">{agent.role}</p>
                      <p className="mt-1 text-xs text-white/35">{agent.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{agent.tasks} tasks</div>
                    <div className="text-xs text-white/40">active queue</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-white/45">
                    <span>Load</span>
                    <span>{agent.load}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400" style={{ width: `${agent.load}%` }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}

function MiniInsightRail({ setActivePanel }) {
  const cards = [
    { id: "realtime", title: "Realtime lead stream", value: "342 active", icon: Radio },
    { id: "competitors", title: "Competitor pressure", value: "+22% paid spike", icon: Target },
    { id: "content", title: "Best growth format", value: "Short video", icon: MonitorPlay },
    { id: "agents", title: "Echo load health", value: "91% load", icon: Activity },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.id} onClick={() => setActivePanel(item.id)} className="text-left">
            <GlassCard hover className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/48">{item.title}</div>
                  <div className="mt-2 text-xl font-semibold text-white">{item.value}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </GlassCard>
          </button>
        );
      })}
    </div>
  );
}

function ExecutiveInsight() {
  return (
    <GlassCard className="p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">AI executive insight</h3>
          <p className="mt-1 text-sm text-white/50">Auto-generated strategic interpretation based on realtime signals.</p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-300">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 p-5">
        <div className="mb-4 flex items-center gap-2 text-sm text-cyan-300">
          <RefreshCw className="h-4 w-4" />
          updated 12 sec ago
        </div>
        <p className="text-sm leading-7 text-white/80">
          Your brand is currently outperforming the competitor cluster in short-form video, conversion-assisted chat flows and community sentiment. The highest leverage move for the next 72 hours is to double down on founder-led vertical video while protecting story completion rate with tighter sequence pacing. Competitor A is increasing paid distribution, but their sentiment efficiency remains weaker than yours.
        </p>
        <div className="mt-5 grid gap-3">
          {[
            "Push 3 proof-based reels within the next 24 hours.",
            "Trigger Echo to monitor competitor paid bursts every 2 hours.",
            "Route chatbot leads with high purchase intent to Atlas immediately.",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-sm text-white/75">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function OperationsStatus() {
  return (
    <GlassCard className="p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">24/7 operations status</h3>
          <p className="mt-1 text-sm text-white/50">Realtime backend and conversational infrastructure health snapshot.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3">
        {[
          { label: "Realtime chatbot streams", value: "Operational", icon: Mic, tone: "emerald" },
          { label: "Social crawler jobs", value: "Running", icon: TrendingUp, tone: "cyan" },
          { label: "Proposal engine", value: "Stable", icon: Flame, tone: "amber" },
          { label: "Notification layer", value: "Healthy", icon: Youtube, tone: "violet" },
          { label: "Content intelligence pipeline", value: "Connected", icon: Instagram, tone: "rose" },
          { label: "Execution API", value: "99.97%", icon: CalendarClock, tone: "emerald" },
        ].map((item) => {
          const Icon = item.icon;
          const toneMap = {
            emerald: "text-emerald-300 bg-emerald-400/10",
            cyan: "text-cyan-300 bg-cyan-400/10",
            amber: "text-amber-300 bg-amber-400/10",
            violet: "text-violet-300 bg-violet-400/10",
            rose: "text-rose-300 bg-rose-400/10",
          };
          return (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-center gap-3">
                <div className={`rounded-2xl p-2 ${toneMap[item.tone]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-white/40">service monitoring</div>
                </div>
              </div>
              <div className="text-sm text-white/70">{item.value}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function ExpandedModuleArea({ active }) {
  const commonChart = (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData}>
          <defs>
            <linearGradient id="moduleA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="moduleB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.26} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
          <Tooltip content={<TooltipBox />} />
          <Area type="monotone" dataKey="reach" name="Reach" stroke="#8b5cf6" strokeWidth={3} fill="url(#moduleA)" />
          <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#06b6d4" strokeWidth={3} fill="url(#moduleB)" />
          <Line type="monotone" dataKey="sentiment" name="Sentiment" stroke="#22c55e" strokeWidth={3} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (active === "realtime") {
    return (
      <GlassCard className="p-5 md:p-6">
        <SectionTitle eyebrow="Realtime Ops" title="Always-on conversation and lead flow" desc="Deep visibility into automated support, lead capture and response performance across the day." />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div>{commonChart}</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyRealtime}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipBox />} />
                <Bar dataKey="messages" name="Messages" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="leads" name="Leads" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (active === "competitors") {
    return (
      <GlassCard className="p-5 md:p-6">
        <SectionTitle eyebrow="Competitor Intel" title="Positioning, paid aggression and narrative control" desc="Drill into market pressure and your brand strength against key rivals." />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="78%" data={competitorData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar dataKey="brand" name="Brand" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Radar dataKey="rivalA" name="Rival A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.12} />
                <Radar dataKey="rivalB" name="Rival B" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.12} />
                <Tooltip content={<TooltipBox />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3">
            {[
              ["Share of Voice", "31.6%", "+4.7%"],
              ["Paid Traffic Pressure", "High", "+22%"],
              ["Narrative Strength", "Leader", "proof-led"],
              ["Sentiment Efficiency", "Best", "+11% vs avg"],
            ].map(([a, b, c]) => (
              <div key={a} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-sm text-white/45">{a}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{b}</div>
                <div className="mt-1 text-sm text-cyan-300">{c}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (active === "content") {
    return (
      <GlassCard className="p-5 md:p-6">
        <SectionTitle eyebrow="Content Lab" title="Format performance and creative depth" desc="Open the strongest-performing content structures and optimize what deserves scale." />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentData} barGap={14}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="type" stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.28)" tickLine={false} axisLine={false} />
                <Tooltip content={<TooltipBox />} />
                <Bar dataKey="score" name="Performance score" radius={[10, 10, 0, 0]} fill="#8b5cf6" />
                <Bar dataKey="posts" name="Post count" radius={[10, 10, 0, 0]} fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3">
            {topPosts.slice(0, 3).map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-sm font-medium text-white">{item.title}</div>
                <div className="mt-2 text-sm leading-6 text-white/55">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  if (active === "agents") {
    return (
      <GlassCard className="p-5 md:p-6">
        <SectionTitle eyebrow="Agent Kernel" title="Business role orchestration and queue health" desc="Strategist, content, sales and analytics agents working across the backend kernel." />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {agentCards.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-white">{agent.name}</div>
                    <div className="text-sm text-white/45">{agent.role}</div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/55">{agent.desc}</p>
                <div className="mt-4 h-2 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400" style={{ width: `${agent.load}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <SectionTitle eyebrow="Overview" title="Cross-platform intelligence overview" desc="Unified view of reach, engagement and sentiment gathered from social channels, campaigns, community conversations and competitor activity." />
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <div>{commonChart}</div>
        <div className="grid gap-4">
          <div className="h-[240px] rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-2 text-sm font-medium text-white">Attention mix</div>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>
                  {channelMix.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Conversion assist", "14.8%"],
              ["Avg response", "58 sec"],
              ["Sentiment", "82 / 100"],
              ["SOV", "31.6%"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/35">{a}</div>
                <div className="mt-2 text-2xl font-semibold text-white">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function EliteAnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [platform, setPlatform] = useState("all");
  const [activeWorkspace, setActiveWorkspace] = useState("overview");
  const [activeDrawer, setActiveDrawer] = useState(null);

  const headline = useMemo(() => {
    if (platform === "all") return "Cross-platform intelligence overview";
    return `${platform} intelligence overview`;
  }, [platform]);

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <style>{`
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          background:
            radial-gradient(circle at top left, rgba(34,211,238,0.14), transparent 20%),
            radial-gradient(circle at top right, rgba(168,85,247,0.12), transparent 24%),
            radial-gradient(circle at bottom center, rgba(34,197,94,0.09), transparent 24%),
            #050816;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 34px 34px;
          mask-image: radial-gradient(circle at center, black, transparent 88%);
        }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute left-[18%] top-0 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1800px] px-4 py-5 sm:px-6 xl:px-8">
        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <SidebarNav active={activeWorkspace} setActive={setActiveWorkspace} />

          <div className="space-y-5">
            <Header range={range} setRange={setRange} platform={platform} setPlatform={setPlatform} />

            <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55 backdrop-blur-xl">
              <span className="text-white/35">Current mode:</span>{" "}
              <span className="font-medium text-white">{headline}</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
              {kpis.map((item, i) => (
                <KpiCard key={item.label} item={item} i={i} onClick={() => setActiveDrawer(activeWorkspace)} />
              ))}
            </div>

            <MiniInsightRail setActivePanel={(id) => setActiveWorkspace(id)} />

            <ExpandedModuleArea active={activeWorkspace} />

            <div className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <GlassCard className="p-5 md:p-6">
                  <SectionTitle
                    eyebrow="Funnel"
                    title="Performance funnel"
                    desc="Awareness to sale visibility for chat-assisted acquisition and conversion journeys."
                  />
                  <div className="mt-6 h-[290px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData}>
                        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tickLine={false} axisLine={false} />
                        <Tooltip content={<TooltipBox />} />
                        <Bar dataKey="value" name="Volume" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <TopPostsTable onOpen={() => setActiveDrawer("content")} />
              </div>

              <div className="space-y-5">
                <ExecutiveInsight />
                <AgentPanel onOpen={() => setActiveDrawer("agents")} />
                <AlertsFeed onOpen={() => setActiveDrawer("realtime")} />
                <OperationsStatus />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DetailDrawer activePanel={activeDrawer} onClose={() => setActiveDrawer(null)} />
    </div>
  );
}
