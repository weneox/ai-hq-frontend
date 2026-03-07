import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronRight,
  CircleGauge,
  Clock3,
  Command,
  FileText,
  Gauge,
  Globe,
  Layers3,
  MessageSquareText,
  Orbit,
  Radar,
  ScanEye,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users2,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const agentOptions = [
  {
    id: "orion",
    name: "Orion",
    role: "Strategist",
    icon: BrainCircuit,
    status: "Operational",
    load: 82,
    latency: "1.4s",
    tone: "Strategic planning, decision framing, roadmap thinking",
  },
  {
    id: "nova",
    name: "Nova",
    role: "Content & Instagram",
    icon: Sparkles,
    status: "Ready",
    load: 64,
    latency: "1.2s",
    tone: "Campaign ideas, hooks, content systems, posting plans",
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Sales & WhatsApp",
    icon: Target,
    status: "Active",
    load: 71,
    latency: "1.7s",
    tone: "Funnels, scripts, lead conversion, WhatsApp flow design",
  },
  {
    id: "echo",
    name: "Echo",
    role: "Analytics",
    icon: Radar,
    status: "Monitoring",
    load: 58,
    latency: "1.0s",
    tone: "KPIs, measurement, attribution, reporting structure",
  },
];

const performanceSeries = [
  { time: "08:00", execution: 44, quality: 68 },
  { time: "10:00", execution: 57, quality: 72 },
  { time: "12:00", execution: 62, quality: 76 },
  { time: "14:00", execution: 70, quality: 81 },
  { time: "16:00", execution: 66, quality: 79 },
  { time: "18:00", execution: 78, quality: 86 },
  { time: "20:00", execution: 83, quality: 89 },
];

const pipelineSeries = [
  { name: "Leads", value: 128 },
  { name: "Qualified", value: 82 },
  { name: "Offers", value: 46 },
  { name: "Won", value: 19 },
];

const workstreamSeries = [
  { name: "Strategy", value: 82 },
  { name: "Content", value: 71 },
  { name: "Sales", value: 77 },
  { name: "Analytics", value: 69 },
];

const activityFeed = [
  {
    title: "Orion generated Q2 expansion framework",
    meta: "3 min ago • Strategy lane",
    icon: BrainCircuit,
  },
  {
    title: "Nova prepared 14-post content sprint",
    meta: "11 min ago • Content lane",
    icon: Sparkles,
  },
  {
    title: "Atlas refined WhatsApp reactivation flow",
    meta: "26 min ago • Sales lane",
    icon: Target,
  },
  {
    title: "Echo flagged attribution gap in campaign source tracking",
    meta: "41 min ago • Analytics lane",
    icon: Radar,
  },
];

const missionCards = [
  {
    title: "Strategic Command",
    text: "High-level planning, scenario shaping, execution direction.",
    icon: Command,
  },
  {
    title: "Operational Momentum",
    text: "Track active initiatives, throughput, response speed and risk signals.",
    icon: Workflow,
  },
  {
    title: "AI Agent Coordination",
    text: "Run specialized agents together from one premium control surface.",
    icon: Bot,
  },
];

const quickActions = [
  { label: "Build Strategy", icon: BrainCircuit },
  { label: "Generate Content", icon: Sparkles },
  { label: "Launch Sales Flow", icon: Target },
  { label: "Check Analytics", icon: Radar },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SectionTitle({ eyebrow, title, desc, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="space-y-2">
        {eyebrow ? (
          <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200/55">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-white md:text-[24px]">
          {title}
        </h2>
        {desc ? (
          <p className="max-w-2xl text-sm leading-6 text-white/55 md:text-[15px]">
            {desc}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

function GlassCard({ className = "", children }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_20px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_34%,transparent_100%)]",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <GlassCard className="h-full p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <Icon size={20} strokeWidth={1.9} />
        </div>
        {trend ? (
          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <TrendingUp size={12} />
            {trend}
          </div>
        ) : null}
      </div>

      <div className="mt-7 space-y-2">
        <div className="text-sm text-white/50">{label}</div>
        <div className="text-[28px] font-semibold tracking-[-0.04em] text-white md:text-[34px]">
          {value}
        </div>
        <div className="text-sm leading-6 text-white/45">{sub}</div>
      </div>
    </GlassCard>
  );
}

function AgentCard({ agent, active, onClick }) {
  const Icon = agent.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-[24px] border p-4 text-left transition-all duration-300",
        active
          ? "border-cyan-300/30 bg-cyan-300/[0.08] shadow-[0_12px_40px_rgba(34,211,238,0.08)]"
          : "border-white/8 bg-white/[0.035] hover:border-white/14 hover:bg-white/[0.055]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_0%_0%,rgba(56,189,248,0.12),transparent_46%)] opacity-80" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-200">
            <Icon size={20} strokeWidth={1.9} />
          </div>

          <div
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              active
                ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                : "border border-white/10 bg-white/[0.05] text-white/55"
            )}
          >
            {agent.status}
          </div>
        </div>

        <div>
          <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
            {agent.name}
          </div>
          <div className="mt-1 text-sm text-white/48">{agent.role}</div>
        </div>

        <p className="text-sm leading-6 text-white/52">{agent.tone}</p>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Load
            </div>
            <div className="mt-1 text-sm font-medium text-white">{agent.load}%</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">
              Latency
            </div>
            <div className="mt-1 text-sm font-medium text-white">{agent.latency}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3 text-left transition-all duration-300 hover:border-cyan-300/20 hover:bg-white/[0.07]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-200">
          <Icon size={18} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium text-white/88">{label}</span>
      </div>
      <ChevronRight
        size={16}
        className="text-white/35 transition-transform duration-300 group-hover:translate-x-0.5"
      />
    </button>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f]/95 px-3 py-2 shadow-2xl backdrop-blur-xl">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center gap-2 text-sm text-white/80">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            <span className="capitalize">{item.dataKey}:</span>
            <span className="font-medium text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommandPage() {
  const [selectedAgent, setSelectedAgent] = useState("orion");
  const [prompt, setPrompt] = useState(
    "Yeni AI HQ üçün strateji command center quruluşu ver. Prioritetlər, workflow, əsas KPI-lar və 30 günlük execution plan hazırla."
  );
  const [usecase, setUsecase] = useState("strategy");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const currentAgent = useMemo(
    () => agentOptions.find((a) => a.id === selectedAgent) || agentOptions[0],
    [selectedAgent]
  );

  const fillPrompt = (text) => {
    setPrompt(text);
  };

  const handleRun = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/kernel/handle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          agentHint: selectedAgent,
          usecase,
        }),
      });

      const data = await res.json().catch(() => ({}));

      setReply(
        data?.replyText ||
          "Cavab alındı, amma response formatı fərqli olduğu üçün mətn görünmədi."
      );
    } catch (err) {
      setReply(
        `Backend bağlantısı alınmadı. Endpoint /api/kernel/handle yoxdursa route-u uyğunlaşdır. Xəta: ${
          err?.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-full px-4 pb-8 pt-4 md:px-6 md:pb-10 md:pt-6 xl:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-14%] top-[-8%] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-[110px]" />
        <div className="absolute right-[-8%] top-[8%] h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-8%] left-[28%] h-[320px] w-[320px] rounded-full bg-sky-400/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1700px] space-y-6 md:space-y-7">
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(700px_circle_at_100%_0%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]" />

            <div className="relative grid gap-6 p-5 md:p-7 xl:grid-cols-[1.2fr_0.8fr] xl:p-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
                  <ShieldCheck size={14} />
                  AI Headquarters Command Layer
                </div>

                <div className="max-w-4xl space-y-4">
                  <h1 className="text-[32px] font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-[44px] xl:text-[58px]">
                    Executive command page for premium AI operations
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/58 md:text-[15px]">
                    Strategy, execution, agent orchestration, analytics and live prompt control —
                    hamısı bir mərkəzdə. Bu hissə həm təqdimatlıq görünür, həm də real istifadə üçün
                    qurulub.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((item) => (
                    <QuickAction
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => {
                        if (item.label === "Build Strategy") {
                          setSelectedAgent("orion");
                          fillPrompt(
                            "Biznes üçün 30 günlük strategic execution plan hazırla. Prioritetlər, risklər, sürətli qələbələr və KPI-lar ver."
                          );
                          setUsecase("strategy");
                        }
                        if (item.label === "Generate Content") {
                          setSelectedAgent("nova");
                          fillPrompt(
                            "Instagram üçün 14 günlük content sprint hazırla. Hook, format, caption angle və posting cadence ver."
                          );
                          setUsecase("content");
                        }
                        if (item.label === "Launch Sales Flow") {
                          setSelectedAgent("atlas");
                          fillPrompt(
                            "WhatsApp satış funnel qur. Lead capture, qualification, follow-up və closing flow ver."
                          );
                          setUsecase("sales");
                        }
                        if (item.label === "Check Analytics") {
                          setSelectedAgent("echo");
                          fillPrompt(
                            "AI HQ üçün əsas KPI framework ver. Acquisition, activation, response time, conversion və retention ölçülərini təyin et."
                          );
                          setUsecase("analytics");
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {missionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.title}
                      className="rounded-[26px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-200">
                        <Icon size={20} strokeWidth={1.9} />
                      </div>
                      <div className="mt-4 text-lg font-semibold tracking-[-0.03em] text-white">
                        {card.title}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/52">{card.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            icon={Gauge}
            label="System Throughput"
            value="84%"
            sub="Execution speed və multi-agent responsiveness stabil zonadadır."
            trend="+12.4%"
          />
          <StatCard
            icon={Users2}
            label="Active Workstreams"
            value="17"
            sub="Hazırda paralel işləyən əsas təşəbbüslər və komanda axınları."
            trend="+4"
          />
          <StatCard
            icon={Globe}
            label="Market Signals"
            value="126"
            sub="Toplanan insight, trend və qərar üçün istifadə edilən siqnallar."
            trend="+18%"
          />
          <StatCard
            icon={Zap}
            label="Automation Health"
            value="96.2"
            sub="Orkestrasiya və agent response səviyyəsi premium stabillikdədir."
            trend="+3.1%"
          />
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard className="p-5 md:p-6 xl:p-7">
              <SectionTitle
                eyebrow="Live Performance"
                title="Operations pulse"
                desc="Komandanın execution ritmini, cavab keyfiyyətini və performans istiqamətini yuxarı səviyyədən izləmək üçün."
                action={
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.08]">
                    Detailed Report
                    <ArrowRight size={14} />
                  </button>
                }
              />

              <div className="mt-6 h-[330px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceSeries}>
                    <defs>
                      <linearGradient id="execGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34,211,238,0.38)" />
                        <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
                      </linearGradient>
                      <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
                        <stop offset="100%" stopColor="rgba(99,102,241,0.02)" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="execution"
                      stroke="rgba(165,243,252,0.95)"
                      strokeWidth={2.2}
                      fill="url(#execGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="quality"
                      stroke="rgba(165,180,252,0.95)"
                      strokeWidth={2.2}
                      fill="url(#qualityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard className="p-5 md:p-6 xl:p-7">
              <SectionTitle
                eyebrow="Pipeline"
                title="Conversion path"
                desc="Lead-dən nəticəyə gedən axının qısa görünüşü."
              />

              <div className="mt-6 h-[330px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineSeries}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      radius={[12, 12, 0, 0]}
                      fill="rgba(125,211,252,0.88)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr_0.8fr]">
          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.62, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard className="p-5 md:p-6">
              <SectionTitle
                eyebrow="Agent Network"
                title="Specialist roster"
                desc="Sənin backend agent strukturuna uyğun seçilmiş AI komandası."
              />

              <div className="mt-6 space-y-3">
                {agentOptions.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    active={selectedAgent === agent.id}
                    onClick={() => setSelectedAgent(agent.id)}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.62, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard className="p-5 md:p-6 xl:p-7">
              <SectionTitle
                eyebrow="Kernel Console"
                title="Prompt composer"
                desc="Agent seç, usecase ver və birbaşa backend kernel-ə sorğu göndər."
              />

              <div className="mt-6 space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
                      Active Agent
                    </label>
                    <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-black/20 px-4 py-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-200">
                        <currentAgent.icon size={20} strokeWidth={1.9} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{currentAgent.name}</div>
                        <div className="text-xs text-white/45">{currentAgent.role}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
                      Usecase
                    </label>
                    <select
                      value={usecase}
                      onChange={(e) => setUsecase(e.target.value)}
                      className="w-full rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/25"
                    >
                      <option value="strategy">strategy</option>
                      <option value="content">content</option>
                      <option value="sales">sales</option>
                      <option value="analytics">analytics</option>
                      <option value="growth">growth</option>
                      <option value="operations">operations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    placeholder="Agent üçün tapşırığı buraya yaz..."
                    className="min-h-[210px] w-full resize-none rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white placeholder:text-white/24 outline-none transition focus:border-cyan-300/25"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <QuickAction
                    icon={BriefcaseBusiness}
                    label="Business Plan"
                    onClick={() => {
                      setSelectedAgent("orion");
                      setUsecase("strategy");
                      setPrompt(
                        "Yeni AI agent studio üçün business strategy, positioning, offer structure və 30 günlük rollout plan hazırla."
                      );
                    }}
                  />
                  <QuickAction
                    icon={MessageSquareText}
                    label="Content Sprint"
                    onClick={() => {
                      setSelectedAgent("nova");
                      setUsecase("content");
                      setPrompt(
                        "Instagram üçün 2 həftəlik content sprint ver. Reel, carousel, story, CTA və post frequency təyin et."
                      );
                    }}
                  />
                  <QuickAction
                    icon={CircleGauge}
                    label="KPI Design"
                    onClick={() => {
                      setSelectedAgent("echo");
                      setUsecase("analytics");
                      setPrompt(
                        "AI command center üçün KPI tree hazırla. North star metric, supporting metrics və reporting cadence ver."
                      );
                    }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/55">
                    <Activity size={14} />
                    Endpoint: <span className="font-medium text-white/80">/api/kernel/handle</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRun}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/18 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Running..." : "Run Agent"}
                    <SendHorizonal size={16} />
                  </button>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-[#05101d]/80 p-4 md:p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
                    <ScanEye size={14} />
                    Response Stream
                  </div>

                  <div className="min-h-[220px] rounded-[20px] border border-white/8 bg-black/30 p-4">
                    {loading ? (
                      <div className="space-y-3">
                        <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-[92%] animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-[80%] animate-pulse rounded-full bg-white/10" />
                      </div>
                    ) : reply ? (
                      <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-white/78">
                        {reply}
                      </pre>
                    ) : (
                      <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-200">
                          <Orbit size={24} />
                        </div>
                        <div className="mt-4 text-base font-medium text-white/82">
                          Ready for agent execution
                        </div>
                        <p className="mt-2 max-w-md text-sm leading-6 text-white/46">
                          Prompt yaz, agent seç və birbaşa kernel cavabını burada göstər.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.62, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <GlassCard className="p-5 md:p-6">
              <SectionTitle
                eyebrow="Activity"
                title="Recent actions"
                desc="Son əməliyyatlar və sistemdə baş verənlər."
              />

              <div className="mt-6 space-y-3">
                {activityFeed.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-black/20 p-4"
                    >
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-200">
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-6 text-white/85">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs text-white/42">{item.meta}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard className="p-5 md:p-6">
              <SectionTitle
                eyebrow="Workstreams"
                title="Execution balance"
                desc="Hansı sahədə yük daha çoxdur, qısa görünüş."
              />

              <div className="mt-5 h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={workstreamSeries}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="rgba(125,211,252,0.95)"
                      strokeWidth={2.6}
                      dot={{ r: 4, fill: "rgba(255,255,255,0.95)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {workstreamSeries.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-[18px] border border-white/8 bg-black/20 px-3 py-3"
                  >
                    <div className="text-xs uppercase tracking-[0.22em] text-white/34">
                      {item.name}
                    </div>
                    <div className="mt-1 text-sm font-medium text-white">{item.value}% load</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5 md:p-6">
              <SectionTitle
                eyebrow="Focus"
                title="Command notes"
                desc="Bugün üçün əsas diqqət nöqtələri."
              />

              <div className="mt-5 space-y-3">
                {[
                  "Strategic priorities ilə operational workload arasında balans saxla.",
                  "Echo üçün attribution və source tagging hissəsini prioritetə qaldır.",
                  "Atlas flow-larında reactivation messaging test et.",
                  "Nova üçün content system-də template standardization əlavə et.",
                ].map((note, i) => (
                  <div
                    key={note}
                    className="flex gap-3 rounded-[20px] border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold text-cyan-200">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-6 text-white/58">{note}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.section>
        </div>

        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.64, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <GlassCard className="p-5 md:p-6 xl:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan-200/55">
                  Bottom Command Strip
                </div>
                <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  One place for strategy, sales, content and analytics
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/52">
                  Bu Command page sənin AI HQ frontend-in üçün təmiz əsasdır. Üstün tərəfi odur ki,
                  həm showcase görünür, həm də real operativ dashboard kimi işlədilə bilir.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/72 transition hover:bg-white/[0.08]">
                  <FileText size={16} />
                  Export Brief
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/12 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/18">
                  <Layers3 size={16} />
                  Open Mission Layer
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.section>
      </div>
    </div>
  );
}