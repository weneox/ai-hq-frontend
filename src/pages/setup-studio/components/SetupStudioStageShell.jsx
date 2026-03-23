import { motion } from "framer-motion";

function s(v) {
  return String(v ?? "").trim();
}

export default function SetupStudioStageShell({
  eyebrow = "",
  title,
  body = "",
  align = "left",
  children,
}) {
  const centered = s(align).toLowerCase() === "center";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div
        className={`mx-auto w-full max-w-[1120px] ${
          centered ? "text-center" : ""
        }`}
      >
        <div className={centered ? "mx-auto max-w-[760px]" : "max-w-[760px]"}>
          {eyebrow ? (
            <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {eyebrow}
            </div>
          ) : null}

          <h2 className="text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[40px] lg:text-[48px]">
            {title}
          </h2>

          {body ? (
            <p className="mt-4 text-[15px] leading-7 text-slate-600">{body}</p>
          ) : null}
        </div>

        <div className="mt-8 w-full">{children}</div>
      </div>
    </motion.section>
  );
}