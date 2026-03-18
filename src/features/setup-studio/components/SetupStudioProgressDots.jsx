import { motion } from "framer-motion";
import {
  BadgeCheck,
  Brain,
  CheckCircle2,
  ScanSearch,
  Sparkles,
  Wand2,
} from "lucide-react";

const STEP_META = {
  entry: {
    icon: Sparkles,
    code: "01",
    hint: "origin",
  },
  scanning: {
    icon: ScanSearch,
    code: "02",
    hint: "signal",
  },
  identity: {
    icon: Brain,
    code: "03",
    hint: "shape",
  },
  knowledge: {
    icon: BadgeCheck,
    code: "04",
    hint: "memory",
  },
  service: {
    icon: Wand2,
    code: "05",
    hint: "offer",
  },
  ready: {
    icon: CheckCircle2,
    code: "06",
    hint: "launch",
  },
};

const CUT_STYLE = {
  clipPath:
    "polygon(16px 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%,0 16px)",
};

function stepState(item) {
  if (item.active) return "active";
  if (item.done) return "done";
  return "idle";
}

function connectorState(current, next) {
  if (!next) return "none";
  if (next.done) return "done";
  if (next.active) return "active";
  if (current.active) return "active";
  return "idle";
}

function stateClasses(state) {
  if (state === "active") {
    return {
      wrap: "border-slate-950/10 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]",
      eyebrow: "text-white/42",
      label: "text-white",
      hint: "text-white/50",
      iconWrap: "border-white/12 bg-white/8 text-white",
      dot: "bg-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.16)]",
      edge: "from-cyan-400/70 via-sky-400/50 to-indigo-400/70",
      glow: "opacity-100",
    };
  }

  if (state === "done") {
    return {
      wrap: "border-emerald-500/15 bg-white/86 text-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.06)]",
      eyebrow: "text-slate-400",
      label: "text-slate-900",
      hint: "text-slate-400",
      iconWrap: "border-emerald-500/15 bg-emerald-500/10 text-emerald-700",
      dot: "bg-emerald-500",
      edge: "from-emerald-400/70 via-cyan-400/40 to-sky-400/50",
      glow: "opacity-70",
    };
  }

  return {
    wrap: "border-slate-900/8 bg-white/58 text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.03)]",
    eyebrow: "text-slate-300",
    label: "text-slate-400",
    hint: "text-slate-300",
    iconWrap: "border-slate-900/8 bg-white/80 text-slate-400",
    dot: "bg-slate-300",
    edge: "from-slate-300/0 via-slate-300/0 to-slate-300/0",
    glow: "opacity-0",
  };
}

function RailConnector({ state }) {
  if (state === "none") return null;

  return (
    <div className="relative hidden h-[72px] w-[84px] shrink-0 items-center justify-center lg:flex">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-300/80" />

      <div
        className={`absolute inset-x-[10px] top-1/2 h-[2px] -translate-y-1/2 rounded-full ${
          state === "done"
            ? "bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
            : state === "active"
              ? "bg-gradient-to-r from-cyan-400/70 via-sky-400/90 to-indigo-400/70"
              : "bg-slate-300/60"
        }`}
      />

      {state === "active" ? (
        <>
          <motion.div
            className="absolute left-[10px] top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.10)]"
            animate={{ x: [0, 56, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-x-[10px] top-1/2 h-[12px] -translate-y-1/2 rounded-full bg-cyan-300/15 blur-md"
            animate={{ opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}
    </div>
  );
}

function StepTile({ item }) {
  const meta = STEP_META[item.key] || STEP_META.entry;
  const Icon = meta.icon;
  const state = stepState(item);
  const styles = stateClasses(state);

  return (
    <motion.div
      layout
      animate={
        state === "active"
          ? { y: -4, scale: 1.015 }
          : state === "done"
            ? { y: 0, scale: 1 }
            : { y: 0, scale: 0.985 }
      }
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[176px] shrink-0"
    >
      <div
        style={CUT_STYLE}
        className={`relative overflow-hidden border px-4 py-3 ${styles.wrap}`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${styles.edge}`}
        />

        {state === "active" ? (
          <>
            <motion.div
              className="pointer-events-none absolute inset-y-0 left-[-40%] w-[42%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]"
              animate={{ x: ["0%", "240%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,211,238,0.10),transparent_28%),radial-gradient(circle_at_80%_50%,rgba(99,102,241,0.10),transparent_32%)]"
              animate={{ opacity: [0.55, 0.9, 0.55] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        ) : null}

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className={`text-[10px] font-medium uppercase tracking-[0.28em] ${styles.eyebrow}`}>
              {meta.code}
            </div>
            <div className={`mt-2 text-[10px] uppercase tracking-[0.26em] ${styles.hint}`}>
              {meta.hint}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
            <div className={`grid h-10 w-10 place-items-center border ${styles.iconWrap}`} style={CUT_STYLE}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className={`mt-5 text-sm font-medium uppercase tracking-[0.22em] ${styles.label}`}>
          {item.label}
        </div>

        <div className={`pointer-events-none absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${styles.edge} ${styles.glow}`} />
      </div>
    </motion.div>
  );
}

export default function SetupStudioProgressDots({ items = [] }) {
  return (
    <div className="relative overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-slate-300/60 to-transparent lg:block" />

      <div className="relative flex min-w-max items-center gap-3 lg:gap-0">
        {items.map((item, index) => {
          const next = items[index + 1];
          const linkState = connectorState(item, next);

          return (
            <div key={item.key} className="flex items-center gap-3 lg:gap-0">
              <StepTile item={item} />
              <RailConnector state={linkState} />
            </div>
          );
        })}
      </div>
    </div>
  );
}