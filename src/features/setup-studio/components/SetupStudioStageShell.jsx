import { motion } from "framer-motion";

function stageMotion() {
  return {
    initial: { opacity: 0, x: 46, filter: "blur(10px)" },
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      x: -46,
      filter: "blur(10px)",
      transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

export default function SetupStudioStageShell({
  eyebrow,
  title,
  body,
  children,
  align = "left",
}) {
  return (
    <motion.div
      {...stageMotion()}
      className={`mx-auto w-full max-w-[1120px] ${align === "center" ? "text-center" : ""}`}
    >
      <div className={`${align === "center" ? "mx-auto max-w-[860px]" : "max-w-[980px]"}`}>
        <div className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
          {eyebrow}
        </div>

        <h1
          className={`mt-6 font-semibold leading-[0.94] tracking-[-0.075em] text-slate-950 ${
            align === "center"
              ? "mx-auto text-5xl sm:text-6xl lg:text-7xl"
              : "max-w-[920px] text-5xl sm:text-6xl lg:text-7xl"
          }`}
        >
          {title}
        </h1>

        <p
          className={`mt-6 text-base leading-8 text-slate-600 sm:text-lg ${
            align === "center" ? "mx-auto max-w-[720px]" : "max-w-[620px]"
          }`}
        >
          {body}
        </p>
      </div>

      <div className="mt-10">{children}</div>
    </motion.div>
  );
}