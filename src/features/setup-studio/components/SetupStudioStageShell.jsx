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
  const isCenter = s(align).toLowerCase() === "center";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div
        className={`mx-auto flex w-full max-w-[1240px] flex-col gap-8 ${
          isCenter ? "items-center text-center" : ""
        }`}
      >
        <div
          className={`max-w-[900px] ${
            isCenter ? "flex flex-col items-center text-center" : ""
          }`}
        >
          {eyebrow ? (
            <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white/88 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm">
              {eyebrow}
            </div>
          ) : null}

          <div
            className={`text-[32px] font-semibold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-[42px] lg:text-[54px] ${
              isCenter ? "mx-auto" : ""
            }`}
          >
            {title}
          </div>

          {body ? (
            <div
              className={`mt-4 max-w-[760px] text-[15px] leading-8 text-slate-600 ${
                isCenter ? "mx-auto" : ""
              }`}
            >
              {body}
            </div>
          ) : null}
        </div>

        <div className="w-full">{children}</div>
      </div>
    </motion.section>
  );
}