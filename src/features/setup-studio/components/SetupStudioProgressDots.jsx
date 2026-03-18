import { motion } from "framer-motion";

const STEP_HINTS = {
  entry: "origin",
  scanning: "signal",
  identity: "shape",
  knowledge: "memory",
  service: "offer",
  ready: "launch",
};

function stateOf(item) {
  if (item.active) return "active";
  if (item.done) return "done";
  return "idle";
}

function connectorState(current, next) {
  if (!next) return "none";
  if (current.done && next.done) return "done";
  if (current.active || next.active) return "active";
  if (current.done && !next.done) return "active";
  return "idle";
}

function stepStyles(state) {
  if (state === "active") {
    return {
      code: "text-slate-950",
      label: "text-slate-950",
      hint: "text-slate-400",
      nodeOuter: "border-slate-950 bg-white shadow-[0_0_0_6px_rgba(15,23,42,0.06)]",
      nodeInner: "bg-slate-950",
      line: "from-cyan-400 via-sky-400 to-indigo-400",
      underline: "bg-slate-950",
    };
  }

  if (state === "done") {
    return {
      code: "text-emerald-600",
      label: "text-slate-700",
      hint: "text-slate-400",
      nodeOuter: "border-emerald-500/30 bg-white",
      nodeInner: "bg-emerald-500",
      line: "from-emerald-400 via-cyan-400 to-sky-400",
      underline: "bg-emerald-500",
    };
  }

  return {
    code: "text-slate-300",
    label: "text-slate-400",
    hint: "text-slate-300",
    nodeOuter: "border-slate-300 bg-white/80",
    nodeInner: "bg-slate-300",
    line: "from-slate-300/60 via-slate-300/60 to-slate-300/60",
    underline: "bg-transparent",
  };
}

function ProgressConnector({ state }) {
  if (state === "none") return null;

  return (
    <div className="relative hidden h-[14px] w-[86px] shrink-0 lg:block">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-300/70" />

      <div
        className={`absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full ${
          state === "done"
            ? "bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
            : state === "active"
              ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400"
              : "bg-slate-300/60"
        }`}
      />

      {state === "active" ? (
        <>
          <motion.div
            className="absolute left-0 top-1/2 h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_0_5px_rgba(34,211,238,0.12)]"
            animate={{ x: [0, 76, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-x-0 top-1/2 h-[10px] -translate-y-1/2 rounded-full bg-cyan-300/15 blur-md"
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}
    </div>
  );
}

function ProgressStep({ item, index }) {
  const state = stateOf(item);
  const styles = stepStyles(state);
  const code = String(index + 1).padStart(2, "0");
  const hint = STEP_HINTS[item.key] || "step";

  return (
    <motion.div
      layout
      animate={
        state === "active"
          ? { y: -2, opacity: 1 }
          : state === "done"
            ? { y: 0, opacity: 1 }
            : { y: 0, opacity: 0.72 }
      }
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[156px] shrink-0"
    >
      <div className="flex items-center gap-3">
        <div className={`w-[24px] text-[10px] font-medium uppercase tracking-[0.28em] ${styles.code}`}>
          {code}
        </div>

        <div className="relative">
          <div
            className={`grid h-[18px] w-[18px] place-items-center rounded-full border ${styles.nodeOuter}`}
          >
            <div className={`h-[7px] w-[7px] rounded-full ${styles.nodeInner}`} />
          </div>

          {state === "active" ? (
            <motion.div
              className="absolute inset-0 rounded-full border border-cyan-400/40"
              animate={{ scale: [1, 1.8], opacity: [0.55, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-4 pl-[37px]">
        <div className={`text-[11px] font-medium uppercase tracking-[0.28em] ${styles.hint}`}>
          {hint}
        </div>

        <div className={`mt-2 text-[22px] font-medium tracking-[-0.05em] ${styles.label}`}>
          {item.label}
        </div>

        <motion.div
          className={`mt-3 h-[2px] rounded-full ${styles.underline}`}
          animate={{
            width: state === "active" ? 52 : state === "done" ? 36 : 0,
            opacity: state === "idle" ? 0 : 1,
          }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  );
}

export default function SetupStudioProgressDots({ items = [] }) {
  return (
    <div className="relative overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative flex min-w-max items-start gap-3 lg:gap-0">
        {items.map((item, index) => {
          const next = items[index + 1];
          const linkState = connectorState(item, next);

          return (
            <div key={item.key} className="flex items-start gap-3 lg:gap-0">
              <ProgressStep item={item} index={index} />
              <div className="pt-[9px]">
                <ProgressConnector state={linkState} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}