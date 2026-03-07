import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  AudioWaveform,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  Command,
  Eye,
  Globe,
  Orbit,
  Radar,
  ScanEye,
  ShieldCheck,
  Sparkles,
  Target,
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
} from "recharts";

const signalData = [
  { t: "00", load: 28 },
  { t: "04", load: 34 },
  { t: "08", load: 52 },
  { t: "10", load: 49 },
  { t: "12", load: 67 },
  { t: "14", load: 74 },
  { t: "16", load: 71 },
  { t: "18", load: 79 },
  { t: "20", load: 84 },
  { t: "24", load: 76 },
];

const commandPills = [
  { label: "Executive Mode", icon: ShieldCheck },
  { label: "12 Agents Active", icon: Bot },
  { label: "Global Threads", icon: Globe },
  { label: "Realtime Signals", icon: Radar },
];

const streams = [
  {
    title: "Capital flow detected",
    meta: "Proposal intelligence",
    time: "2 min ago",
    icon: BriefcaseBusiness,
  },
  {
    title: "Execution path recalibrated",
    meta: "Ops autonomy layer",
    time: "7 min ago",
    icon: Workflow,
  },
  {
    title: "Two new threat anomalies",
    meta: "Defense command",
    time: "12 min ago",
    icon: ShieldCheck,
  },
  {
    title: "Agent memory expansion complete",
    meta: "Agent mesh",
    time: "19 min ago",
    icon: BrainCircuit,
  },
];

const agents = [
  {
    name: "Astra Prime",
    role: "Strategic operator",
    status: "Engaged",
    icon: Sparkles,
  },
  {
    name: "Cipher Grid",
    role: "Threat inference",
    status: "Scanning",
    icon: ScanEye,
  },
  {
    name: "Nexus Flow",
    role: "Execution routing",
    status: "Routing",
    icon: Orbit,
  },
  {
    name: "Vector One",
    role: "Signal analytics",
    status: "Modeling",
    icon: TrendingUp,
  },
];

const tasks = [
  {
    title: "Reframe Q2 expansion narrative for top-tier buyers",
    tag: "Proposal",
    impact: "High leverage",
  },
  {
    title: "Resolve latency drift in autonomy orchestration",
    tag: "Execution",
    impact: "Priority now",
  },
  {
    title: "Trigger threat simulation against external access paths",
    tag: "Security",
    impact: "Silent run",
  },
];

const nodes = [
  { x: "10%", y: "20%", size: 14 },
  { x: "25%", y: "38%", size: 18 },
  { x: "37%", y: "28%", size: 12 },
  { x: "52%", y: "48%", size: 18 },
  { x: "66%", y: "24%", size: 14 },
  { x: "80%", y: "52%", size: 16 },
  { x: "90%", y: "34%", size: 12 },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function fadeUp(delay = 0, y = 24) {
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.8,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  };
}

function AmbientBlur({ className = "" }) {
  return (
    <div
      className={cn("pointer-events-none absolute rounded-full blur-3xl", className)}
    />
  );
}

function Chip({ icon: Icon, label, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay, 14)}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.26em] text-white/68 backdrop-blur-xl"
    >
      <Icon className="h-3.5 w-3.5 text-cyan-200/80" />
      <span>{label}</span>
    </motion.div>
  );
}

function SignalDot({ x, y, size, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="absolute"
      style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
    >
      <div
        className="relative rounded-full border border-cyan-200/18 bg-cyan-200/10 shadow-[0_0_35px_rgba(76,226,255,0.24)]"
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-[-10px] rounded-full border border-cyan-200/10" />
        <div className="absolute inset-[-20px] rounded-full border border-cyan-200/[0.05]" />
      </div>
    </motion.div>
  );
}

function StreamRow({ item, delay = 0 }) {
  const Icon = item.icon;

  return (
    <motion.div
      {...fadeUp(delay, 16)}
      className="flex items-center gap-3"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-lg">
        <Icon className="h-4.5 w-4.5 text-cyan-200/85" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white/92">{item.title}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/38">
          {item.meta}
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-[0.22em] text-white/34">
        {item.time}
      </div>
    </motion.div>
  );
}

function AgentPill({ item, delay = 0 }) {
  const Icon = item.icon;

  return (
    <motion.div
      {...fadeUp(delay, 14)}
      className="flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 backdrop-blur-xl"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Icon className="h-4.5 w-4.5 text-cyan-200/85" />
      </div>

      <div>
        <div className="text-sm font-medium text-white/90">{item.name}</div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/38">
          {item.role}
        </div>
      </div>

      <div className="ml-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.08] px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-emerald-100/85">
        {item.status}
      </div>
    </motion.div>
  );
}

function TaskItem({ item, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay, 14)}
      className="flex items-center gap-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Zap className="h-4 w-4 text-cyan-200/85" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm text-white/88">{item.title}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/36">
          {item.tag} • {item.impact}
        </div>
      </div>
    </motion.div>
  );
}

export default function CommandPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent px-4 pb-20 pt-6 md:px-6 xl:px-8">
      <AmbientBlur className="left-[-8%] top-[2%] h-[340px] w-[340px] bg-cyan-400/10" />
      <AmbientBlur className="right-[-10%] top-[8%] h-[420px] w-[420px] bg-violet-500/10" />
      <AmbientBlur className="left-[30%] top-[32%] h-[460px] w-[460px] bg-sky-400/[0.08]" />
      <AmbientBlur className="right-[8%] bottom-[12%] h-[340px] w-[340px] bg-fuchsia-500/[0.08]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(58,190,255,0.12),transparent_18%),radial-gradient(circle_at_85%_12%,rgba(120,92,255,0.14),transparent_18%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.04),transparent_22%)]" />

      <div className="relative mx-auto max-w-[1680px]">
        <div className="relative min-h-[1500px] md:min-h-[1380px] xl:min-h-[1280px]">
          <motion.div
            {...fadeUp(0.04, 12)}
            className="absolute left-0 top-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-100/76 backdrop-blur-xl">
              <Command className="h-3.5 w-3.5" />
              AI Headquarters Command Surface
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.08)}
            className="absolute left-0 top-20 max-w-[860px]"
          >
            <h1 className="text-[46px] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[58px] md:text-[78px] xl:text-[104px]">
              Elite control
              <br />
              <span className="text-white">without boxed</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-50 via-sky-200 to-cyan-400 bg-clip-text text-transparent">
                dashboards.
              </span>
            </h1>

            <p className="mt-8 max-w-[680px] text-base leading-8 text-white/56 md:text-[17px]">
              Bu dəfə hər şey səhnənin içində sərbəst qurulub. Ayrı-ayrı dashboard
              kartları, section blokları və böyük container panellər yoxdur. Bütün
              command layer background-un üstündə premium kompozisiya kimi yaşayır.
            </p>
          </motion.div>

          <div className="absolute left-0 top-[420px] flex max-w-[760px] flex-wrap gap-3 md:top-[500px] xl:top-[540px]">
            {commandPills.map((item, index) => (
              <Chip
                key={item.label}
                icon={item.icon}
                label={item.label}
                delay={0.16 + index * 0.05}
              />
            ))}
          </div>

          <motion.div
            {...fadeUp(0.24)}
            className="absolute left-0 top-[560px] max-w-[760px] md:top-[650px] xl:top-[700px]"
          >
            <div className="flex flex-wrap items-center gap-4">
              <button className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.10] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.26em] text-cyan-50 transition duration-300 hover:scale-[1.02] hover:bg-cyan-300/[0.14]">
                Launch command
                <ArrowRight className="h-4 w-4" />
              </button>

              <button className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.24em] text-white/66 backdrop-blur-xl transition duration-300 hover:bg-white/[0.05] hover:text-white">
                <Eye className="h-4 w-4" />
                Preview layer
              </button>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.16)}
            className="absolute right-0 top-[110px] h-[420px] w-full max-w-[700px] md:h-[470px] xl:h-[520px]"
          >
            <div className="absolute inset-0 rounded-[48px] bg-[radial-gradient(circle_at_50%_50%,rgba(30,55,84,0.30),rgba(4,9,20,0.02)_60%,transparent_75%)]" />
            <div className="absolute inset-0 opacity-90">
              <svg
                className="h-full w-full"
                viewBox="0 0 1000 700"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="flowA" x1="50" y1="100" x2="950" y2="420">
                    <stop stopColor="rgba(74,221,255,0.10)" />
                    <stop offset="0.5" stopColor="rgba(74,221,255,0.95)" />
                    <stop offset="1" stopColor="rgba(124,92,255,0.18)" />
                  </linearGradient>

                  <linearGradient id="flowB" x1="180" y1="420" x2="900" y2="500">
                    <stop stopColor="rgba(74,221,255,0.12)" />
                    <stop offset="1" stopColor="rgba(168,85,247,0.18)" />
                  </linearGradient>
                </defs>

                <path
                  d="M80 180C170 220 210 290 320 274C426 258 472 132 586 164C672 188 732 298 834 304C886 306 926 282 962 236"
                  stroke="url(#flowA)"
                  strokeWidth="2.5"
                />
                <path
                  d="M150 430C260 346 350 334 448 382C540 426 642 520 764 500C844 486 902 444 952 372"
                  stroke="url(#flowB)"
                  strokeWidth="1.8"
                  opacity="0.8"
                />
                <path
                  d="M120 140C164 162 208 188 250 210"
                  stroke="rgba(255,255,255,0.10)"
                  strokeWidth="1"
                />
              </svg>
            </div>

            {nodes.map((node, index) => (
              <SignalDot
                key={`${node.x}-${node.y}`}
                x={node.x}
                y={node.y}
                size={node.size}
                delay={0.22 + index * 0.05}
              />
            ))}

            <div className="absolute left-[12%] top-[17%] rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/60 backdrop-blur-xl">
              Market Sense
            </div>

            <div className="absolute left-[46%] top-[48%] rounded-full border border-cyan-300/15 bg-cyan-300/[0.09] px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] text-cyan-50/84 backdrop-blur-xl">
              Command Nexus
            </div>

            <div className="absolute right-[8%] top-[24%] rounded-full border border-violet-200/14 bg-violet-300/[0.08] px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] text-violet-100/80 backdrop-blur-xl">
              Defense Lattice
            </div>

            <div className="absolute left-[28%] bottom-[16%] rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/54 backdrop-blur-xl">
              Execution Pulse
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="absolute left-[2%] top-[860px] w-[260px] md:left-[0%] md:top-[900px] xl:top-[840px]"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
              Decision clarity
            </div>
            <div className="mt-3 text-[44px] font-semibold tracking-[-0.06em] text-white">
              94.8%
            </div>
            <div className="mt-2 text-sm leading-7 text-white/46">
              Cross-stream confidence remains extremely high across live command routes.
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.28)}
            className="absolute left-[34%] top-[930px] w-[240px] md:left-[36%] md:top-[960px] xl:top-[905px]"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
              Autonomous runs
            </div>
            <div className="mt-3 text-[44px] font-semibold tracking-[-0.06em] text-white">
              18
            </div>
            <div className="mt-2 text-sm leading-7 text-white/46">
              Active execution chains are routing without manual friction.
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.34)}
            className="absolute right-[2%] top-[860px] w-[260px] text-left md:top-[900px] xl:top-[840px]"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
              Pipeline motion
            </div>
            <div className="mt-3 text-[44px] font-semibold tracking-[-0.06em] text-white">
              $2.4M
            </div>
            <div className="mt-2 text-sm leading-7 text-white/46">
              Weighted influence is accelerating through premium proposal flow.
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.18)}
            className="absolute left-0 top-[1110px] h-[260px] w-full max-w-[760px] md:top-[1120px] xl:top-[1040px]"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
                  Signal curve
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-white">
                  Adaptive command velocity
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-300/14 bg-emerald-300/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-emerald-100/82 md:inline-flex">
                <Activity className="h-3.5 w-3.5" />
                Stable rise
              </div>
            </div>

            <div className="h-[190px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signalData}>
                  <defs>
                    <linearGradient id="fillLoadFree" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.32} />
                      <stop offset="55%" stopColor="#60a5fa" stopOpacity={0.09} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.32)", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.14)" }}
                    contentStyle={{
                      background: "rgba(7,10,20,0.84)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      color: "white",
                      backdropFilter: "blur(12px)",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="load"
                    stroke="#7dd3fc"
                    strokeWidth={2.4}
                    fill="url(#fillLoadFree)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.2)}
            className="absolute right-0 top-[1085px] w-full max-w-[470px] md:top-[1110px] xl:top-[1035px]"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
              Live stream
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div className="text-[28px] font-semibold tracking-[-0.05em] text-white">
                Command movement
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/46">
                <Clock3 className="h-3.5 w-3.5" />
                Realtime
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {streams.map((item, index) => (
                <StreamRow
                  key={item.title}
                  item={item}
                  delay={0.24 + index * 0.06}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.22)}
            className="absolute left-0 top-[1450px] w-full max-w-[900px] md:top-[1420px] xl:top-[1290px]"
          >
            <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
              Autonomous mesh
            </div>
            <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-white">
              Agent presence across the scene
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {agents.map((item, index) => (
                <AgentPill
                  key={item.name}
                  item={item}
                  delay={0.26 + index * 0.05}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.24)}
            className="absolute right-0 top-[1430px] w-full max-w-[500px] md:top-[1410px] xl:top-[1280px]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
                  Directives
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-white">
                  Priority queue
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/14 bg-cyan-300/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-cyan-100/82">
                <Target className="h-3.5 w-3.5" />
                High focus
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {tasks.map((item, index) => (
                <TaskItem
                  key={item.title}
                  item={item}
                  delay={0.28 + index * 0.05}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            {...fadeUp(0.3)}
            className="absolute left-0 top-[1710px] w-full max-w-[1200px] md:top-[1660px] xl:top-[1510px]"
          >
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-[720px]">
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/34">
                  Final command line
                </div>
                <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-white">
                  One composer layered directly into the environment
                </div>
                <p className="mt-4 text-sm leading-8 text-white/48 md:text-[15px]">
                  Burada ayrıca composer paneli yaratmıram. Sadəcə səhnənin içinə
                  inteqrasiya olunmuş son komanda xətti verilir ki, bütün səhifə
                  vahid premium səth kimi qalsın.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-white/48 backdrop-blur-xl">
                <AudioWaveform className="h-4 w-4 text-cyan-200/80" />
                Voice enabled
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                <BrainCircuit className="h-5 w-5 text-cyan-200/88" />
              </div>

              <div className="min-w-0 flex-1 border-b border-white/[0.08] pb-4 text-[15px] text-white/74">
                Generate an executive-grade expansion brief from live signals,
                route it across agents, and preserve a minimal luxury command surface.
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-white/64 transition duration-300 hover:bg-white/[0.05] hover:text-white">
                  <Eye className="h-4 w-4" />
                  Preview
                </button>

                <button className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.10] px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-cyan-50 transition duration-300 hover:scale-[1.02] hover:bg-cyan-300/[0.14]">
                  Execute
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}