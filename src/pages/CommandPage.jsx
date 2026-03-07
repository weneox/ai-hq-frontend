import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  AudioWaveform,
  Bot,
  BrainCircuit,
  ChevronRight,
  Command,
  Eye,
  ShieldCheck,
  Sparkles,
  Target,
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
import AgentConstellation3D from "../components/command/AgentConstellation3D.jsx";
import {
  backendDomains,
  commandChips,
  commandMetrics,
  liveFeed,
  microSignals,
  operatorDirectives,
} from "../components/command/commandData.js";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function fadeUp(delay = 0, y = 28) {
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

function AmbientBlob({ className = "" }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute rounded-full blur-3xl",
        className
      )}
    />
  );
}

function SurfaceTag({ icon: Icon, label, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay, 16)}
      className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/68 backdrop-blur-xl"
    >
      <Icon className="h-3.5 w-3.5 text-cyan-200/80" />
      <span>{label}</span>
    </motion.div>
  );
}

function MetricColumn({ item, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay, 18)} className="min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/34">
        {item.eyebrow}
      </div>
      <div className="mt-2 text-[42px] font-semibold tracking-[-0.06em] text-white md:text-[52px]">
        {item.value}
      </div>
      <div className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-white/62">
        {item.label}
      </div>
      <p className="mt-3 max-w-[280px] text-sm leading-7 text-white/42">
        {item.detail}
      </p>
    </motion.div>
  );
}

function DomainCard({ item, isActive, onEnter, onLeave, delay = 0 }) {
  const Icon = item.icon;

  return (
    <motion.button
      {...fadeUp(delay, 16)}
      onMouseEnter={() => onEnter(item.key)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(item.key)}
      onBlur={onLeave}
      className={cn(
        "group relative overflow-hidden rounded-[28px] border px-4 py-4 text-left backdrop-blur-xl transition-all duration-300",
        isActive
          ? "border-white/14 bg-white/[0.07] shadow-[0_18px_70px_rgba(0,0,0,0.22)]"
          : "border-white/[0.07] bg-white/[0.035] hover:border-white/12 hover:bg-white/[0.05]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]">
          <Icon className="h-5 w-5 text-cyan-200/88" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/38">
            {item.subtitle}
          </div>
          <div className="mt-1 text-[16px] font-semibold tracking-[-0.02em] text-white/92">
            {item.title}
          </div>
          <p className="mt-2 text-sm leading-6 text-white/46">
            {item.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/54">
          {item.status}
        </div>

        <ChevronRight
          className={cn(
            "h-4 w-4 transition duration-300",
            isActive
              ? "translate-x-0 text-white/78"
              : "text-white/30 group-hover:translate-x-0.5 group-hover:text-white/58"
          )}
        />
      </div>
    </motion.button>
  );
}

function FeedRow({ item, delay = 0 }) {
  return (
    <motion.div
      {...fadeUp(delay, 14)}
      className="flex items-center gap-3 rounded-[22px] border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-lg"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Activity className="h-4.5 w-4.5 text-cyan-200/85" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white/92">
          {item.title}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/38">
          {item.meta}
        </div>
      </div>

      <div className="text-[10px] uppercase tracking-[0.22em] text-white/34">
        {item.time}
      </div>
    </motion.div>
  );
}

function DirectiveRow({ text, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay, 12)} className="flex items-start gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <Zap className="h-4 w-4 text-cyan-200/84" />
      </div>
      <p className="text-sm leading-7 text-white/62">{text}</p>
    </motion.div>
  );
}

export default function CommandPage() {
  const [activeKey, setActiveKey] = useState("executions");

  const activeDomain = useMemo(
    () => backendDomains.find((item) => item.key === activeKey) || backendDomains[0],
    [activeKey]
  );

  return (
    <div className="relative min-h-[calc(100vh-var(--header-h))] overflow-hidden bg-transparent px-0 pb-24 pt-0">
      <AmbientBlob className="left-[-8%] top-[-6%] h-[360px] w-[360px] bg-cyan-400/10" />
      <AmbientBlob className="right-[-12%] top-[-2%] h-[520px] w-[520px] bg-violet-500/10" />
      <AmbientBlob className="left-[28%] top-[32%] h-[560px] w-[560px] bg-sky-400/[0.07]" />
      <AmbientBlob className="right-[6%] bottom-[10%] h-[360px] w-[360px] bg-fuchsia-500/[0.08]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_6%,rgba(58,190,255,0.12),transparent_18%),radial-gradient(circle_at_85%_8%,rgba(120,92,255,0.14),transparent_18%),radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.03),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-16px] h-[180px] bg-[linear-gradient(180deg,rgba(3,7,15,0.66),rgba(3,7,15,0.14)_48%,transparent)] blur-2xl" />
      <div className="pointer-events-none absolute left-[-20px] top-0 h-full w-[220px] bg-[linear-gradient(90deg,rgba(3,7,15,0.34),rgba(3,7,15,0.12)_34%,transparent_76%)] blur-2xl" />

      <div className="relative mx-auto max-w-[1740px] px-3 md:px-5 xl:px-7">
        <section className="relative pt-4 md:pt-6">
          <div className="relative min-h-[920px] xl:min-h-[980px]">
            <div className="grid gap-10 xl:grid-cols-[0.94fr_1.06fr] xl:gap-4">
              <div className="relative z-20 pt-2">
                <motion.div {...fadeUp(0.03, 10)}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.28em] text-cyan-100/76 backdrop-blur-xl">
                    <Command className="h-3.5 w-3.5" />
                    AI Headquarters Command Surface
                  </div>
                </motion.div>

                <motion.div {...fadeUp(0.08)} className="mt-6 max-w-[900px]">
                  <h1 className="text-[46px] font-semibold leading-[0.9] tracking-[-0.065em] text-white sm:text-[60px] md:text-[82px] xl:text-[108px]">
                    Command the
                    <br />
                    full backend stack
                    <br />
                    <span className="bg-gradient-to-r from-cyan-50 via-sky-200 to-cyan-400 bg-clip-text text-transparent">
                      like an executive system.
                    </span>
                  </h1>

                  <p className="mt-8 max-w-[720px] text-base leading-8 text-white/56 md:text-[17px]">
                    Bu səth generic panel deyil. Sənin AI HQ backend qatların —
                    agents, executions, proposals, content, debate, threads,
                    media, render, push və notifications — eyni command
                    atmosferində birləşir.
                  </p>
                </motion.div>

                <div className="mt-8 flex max-w-[860px] flex-wrap gap-3">
                  {commandChips.map((item, index) => (
                    <SurfaceTag
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      delay={0.14 + index * 0.04}
                    />
                  ))}
                </div>

                <motion.div
                  {...fadeUp(0.24)}
                  className="mt-9 flex flex-wrap items-center gap-4"
                >
                  <button className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/[0.10] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.26em] text-cyan-50 transition duration-300 hover:scale-[1.02] hover:bg-cyan-300/[0.14]">
                    Launch command
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.032] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.24em] text-white/66 backdrop-blur-xl transition duration-300 hover:bg-white/[0.05] hover:text-white">
                    <Eye className="h-4 w-4" />
                    Preview orchestration
                  </button>
                </motion.div>

                <div className="mt-14 grid gap-8 md:grid-cols-2 2xl:grid-cols-4">
                  {commandMetrics.map((item, index) => (
                    <MetricColumn
                      key={item.label}
                      item={item}
                      delay={0.12 + index * 0.06}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10 min-h-[760px] xl:min-h-[900px]">
                <motion.div
                  {...fadeUp(0.12)}
                  className="pointer-events-none absolute left-[8%] top-[1%] z-20"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/36">
                    backend constellation
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
                    Agent and route topology
                  </div>
                </motion.div>

                <motion.div
                  {...fadeUp(0.16)}
                  className="pointer-events-none absolute right-[2%] top-[0%] z-20"
                >
                  <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <Command className="h-4.5 w-4.5 text-cyan-200/82" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/74">
                        Access Layer
                      </div>
                      <div className="mt-1 text-[12px] text-white/46">
                        social • routes • launch
                      </div>
                    </div>
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
                  </div>
                </motion.div>

                <div className="absolute inset-0">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_22%,rgba(145,92,255,0.22),transparent_24%),radial-gradient(circle_at_54%_54%,rgba(45,212,255,0.12),transparent_28%),radial-gradient(circle_at_88%_82%,rgba(52,211,153,0.10),transparent_20%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(3,7,15,0.14)_58%,rgba(3,7,15,0.02))]" />

                  <div className="absolute inset-0">
                    <AgentConstellation3D
                      nodes={backendDomains}
                      activeKey={activeKey}
                      onHover={setActiveKey}
                      onLeave={() => setActiveKey("executions")}
                    />
                  </div>
                </div>

                <motion.div
                  {...fadeUp(0.26)}
                  className="absolute bottom-[5%] right-[2%] z-20 w-full max-w-[520px]"
                >
                  <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.05] p-5 backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]">
                        <activeDomain.icon className="h-5 w-5 text-cyan-200/88" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] uppercase tracking-[0.26em] text-white/38">
                          {activeDomain.subtitle}
                        </div>
                        <div className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-white">
                          {activeDomain.title}
                        </div>
                        <p className="mt-2 max-w-[520px] text-sm leading-7 text-white/48">
                          {activeDomain.description}
                        </p>
                      </div>

                      <div className="rounded-full border border-cyan-300/14 bg-cyan-300/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-cyan-100/82">
                        {activeDomain.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-2 grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
          <motion.div
            {...fadeUp(0.1)}
            className="overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] p-6 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
                  system pulse
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
                  Confidence and execution velocity
                </div>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-emerald-300/14 bg-emerald-300/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-emerald-100/82 md:inline-flex">
                <Activity className="h-3.5 w-3.5" />
                stable rise
              </div>
            </div>

            <div className="mt-8 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={microSignals}>
                  <defs>
                    <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.26} />
                      <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.32)", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,0.14)" }}
                    contentStyle={{
                      background: "rgba(7,10,20,0.86)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      color: "white",
                      backdropFilter: "blur(12px)",
                    }}
                    labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence"
                    stroke="#7dd3fc"
                    strokeWidth={2.6}
                    fill="url(#confidenceFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid gap-8">
            <motion.div
              {...fadeUp(0.16)}
              className="rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] p-6 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
                    live feed
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
                    Runtime movement
                  </div>
                </div>

                <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/48">
                  realtime
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {liveFeed.map((item, index) => (
                  <FeedRow key={item.title} item={item} delay={0.18 + index * 0.05} />
                ))}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.22)}
              className="rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.01))] p-6 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
                    directive stack
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-white">
                    Operator priorities
                  </div>
                </div>

                <div className="rounded-full border border-cyan-300/14 bg-cyan-300/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-cyan-100/82">
                  high focus
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {operatorDirectives.map((text, index) => (
                  <DirectiveRow key={text} text={text} delay={0.24 + index * 0.05} />
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mt-10">
          <motion.div
            {...fadeUp(0.14)}
            className="mb-6 flex items-end justify-between gap-4"
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
                backend domains
              </div>
              <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-white">
                Premium surface for every route and kernel
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-white/48 md:inline-flex">
              <Bot className="h-4 w-4 text-cyan-200/80" />
              full stack visibility
            </div>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
            {backendDomains.map((item, index) => (
              <DomainCard
                key={item.key}
                item={item}
                isActive={activeKey === item.key}
                onEnter={setActiveKey}
                onLeave={() => setActiveKey("executions")}
                delay={0.16 + index * 0.03}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 pb-8">
          <motion.div
            {...fadeUp(0.18)}
            className="overflow-hidden rounded-[36px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.012))] p-6 backdrop-blur-2xl md:p-7"
          >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-[760px]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
                  final command line
                </div>
                <div className="mt-2 text-[30px] font-semibold tracking-[-0.05em] text-white md:text-[36px]">
                  One executive composer over the whole system
                </div>
                <p className="mt-4 text-sm leading-8 text-white/48 md:text-[15px]">
                  Burada ayrıca panel yığımı yoxdur. Tək bir premium command line
                  ilə content, debate, proposal, render, push və execution
                  qatlarını vahid operator jesti ilə hərəkətə gətirirsən.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[10px] uppercase tracking-[0.24em] text-white/48 backdrop-blur-xl">
                <AudioWaveform className="h-4 w-4 text-cyan-200/80" />
                voice enabled
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
                <BrainCircuit className="h-5 w-5 text-cyan-200/88" />
              </div>

              <div className="min-w-0 flex-1 border-b border-white/[0.08] pb-4 text-[15px] text-white/74">
                Orchestrate proposal generation from the content and debate
                kernels, escalate high-confidence executions, render board-grade
                slides, and broadcast the final state across notifications and
                push.
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

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.028] px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-white/56">
                <Sparkles className="h-3.5 w-3.5 text-cyan-200/80" />
                render studio linked
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.028] px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-white/56">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-200/80" />
                debate kernel active
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.028] px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] text-white/56">
                <Target className="h-3.5 w-3.5 text-cyan-200/80" />
                mission scoped
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}