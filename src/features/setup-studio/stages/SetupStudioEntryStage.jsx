import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  AudioLines,
  Mic,
  PenSquare,
  Sparkles,
  Waves,
} from "lucide-react";

function s(v) {
  return String(v ?? "").trim();
}

function parseManualBlock(raw) {
  const text = s(raw);
  const marker = "[manual_business]";
  const idx = text.indexOf(marker);

  if (idx === -1) {
    return { name: "", brief: "" };
  }

  const block = text.slice(idx + marker.length).trim();
  const out = { name: "", brief: "" };

  for (const line of block.split(/\r?\n/)) {
    const [label, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = s(label).toLowerCase();

    if (key === "name") out.name = value;
    if (key === "brief") out.brief = value;
  }

  return out;
}

function extractPlainNote(raw) {
  const text = s(raw);
  const manualIdx = text.indexOf("[manual_business]");
  if (manualIdx === -1) return text.trim();
  return text.slice(0, manualIdx).trim();
}

function GlassFace({ className = "" }) {
  return (
    <>
      <div
        className={`pointer-events-none absolute inset-0 rounded-[34px] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.08))] ${className}`}
      />
      <div className="pointer-events-none absolute inset-x-[8%] top-0 h-[1px] bg-white/75 blur-[0.4px]" />
      <div className="pointer-events-none absolute inset-x-[12%] top-[1px] h-[38%] rounded-t-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,.18),transparent)]" />
    </>
  );
}

function FloatingDust({ tint = "blue", active = false }) {
  const particles =
    tint === "violet"
      ? [
          "left-[10%] top-[28%]",
          "left-[24%] top-[54%]",
          "left-[74%] top-[34%]",
          "left-[82%] top-[62%]",
          "left-[58%] top-[78%]",
        ]
      : [
          "left-[12%] top-[36%]",
          "left-[26%] top-[64%]",
          "left-[72%] top-[44%]",
          "left-[80%] top-[76%]",
          "left-[52%] top-[82%]",
        ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[34px]">
      {particles.map((cls, index) => (
        <motion.span
          key={`${cls}-${index}`}
          animate={
            active
              ? {
                  y: [0, -10, 0],
                  x: [0, index % 2 === 0 ? 5 : -5, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [0.8, 1.15, 0.8],
                }
              : { opacity: 0.22, scale: 1 }
          }
          transition={{
            duration: 2.8 + index * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute h-1.5 w-1.5 rounded-full bg-white/80 blur-[0.4px] ${cls}`}
        />
      ))}
    </div>
  );
}

function SourceVisual({ active = false }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[34%] overflow-hidden rounded-b-[34px]">
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(ellipse_at_center,rgba(146,193,255,.22),transparent_62%)] blur-2xl" />
      <div className="absolute left-1/2 top-[64%] h-[220px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/18 blur-[48px]" />

      <motion.div
        animate={active ? { y: [-2, 4, -2] } : { y: 0 }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[66%] h-[220px] w-[360px] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={active ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-[14px] rounded-full border border-white/42" />
          <div className="absolute inset-[34px] rounded-full border border-sky-100/55" />
          <div className="absolute inset-[58px] rounded-full border border-white/28" />
          <div className="absolute inset-[84px] rounded-full border border-sky-100/36" />
        </motion.div>

        <motion.div
          animate={active ? { rotate: -360, scale: [1, 1.018, 1] } : { rotate: 0 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute inset-[8px] rounded-full border border-sky-50/16" />
          <div className="absolute inset-[46px] rounded-full border border-white/16" />
          <div className="absolute inset-[94px] rounded-full border border-sky-50/14" />
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-[86px] w-[86px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/62 blur-[24px]" />
      </motion.div>

      <motion.div
        animate={active ? { y: [-6, 0, -6], scale: [1, 1.04, 1] } : { y: 0 }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[46px] left-[16%] h-[90px] w-[90px] rounded-full border border-white/30 bg-white/8 shadow-[inset_0_1px_0_rgba(255,255,255,.28)] backdrop-blur-md"
      />
      <motion.div
        animate={active ? { y: [0, -10, 0], x: [0, 4, 0] } : { y: 0 }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[86px] right-[15%] h-[56px] w-[56px] rounded-[18px] border border-white/34 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.3)] backdrop-blur-md"
      />
    </div>
  );
}

function ManualClosedVisual({ active = false }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[34%] overflow-hidden rounded-b-[34px]">
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[radial-gradient(ellipse_at_center,rgba(198,173,255,.20),transparent_62%)] blur-2xl" />
      <div className="absolute left-1/2 top-[67%] h-[190px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/16 blur-[44px]" />

      <motion.div
        animate={active ? { rotateX: [0, 7, 0], rotateZ: [0, -4, 0], y: [0, -6, 0] } : { y: 0 }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[67%] h-[118px] w-[248px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/34 bg-[linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,.08))] shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_22px_60px_rgba(145,114,232,.12)] backdrop-blur-md"
      >
        <div className="absolute left-[10%] right-[10%] top-[18px] h-[12px] rounded-full bg-white/18" />
        <div className="absolute left-[10%] right-[20%] top-[42px] h-[12px] rounded-full bg-white/16" />
        <div className="absolute left-[10%] right-[28%] top-[66px] h-[12px] rounded-full bg-white/14" />
      </motion.div>

      <motion.div
        animate={active ? { y: [-2, 5, -2], x: [0, -5, 0] } : { y: 0 }}
        transition={{ duration: 4.7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[17%] top-[58%] h-[62px] w-[62px] rounded-[20px] border border-white/34 bg-white/10 backdrop-blur-md"
      />
      <motion.div
        animate={active ? { y: [0, -8, 0], x: [0, 5, 0] } : { y: 0 }}
        transition={{ duration: 5.3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[16%] top-[54%] h-[56px] w-[72px] rounded-[18px] border border-white/34 bg-white/10 backdrop-blur-md"
      />
    </div>
  );
}

function VoiceWaveVisual({ active = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      <div className="absolute inset-x-[10%] bottom-[16%] h-[42%] bg-[radial-gradient(ellipse_at_center,rgba(162,198,255,.18),transparent_70%)] blur-2xl" />
      <div className="absolute left-1/2 top-[54%] h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/16 blur-[18px]" />
      <motion.div
        animate={active ? { scale: [1, 1.08, 1], opacity: [0.34, 0.7, 0.34] } : { scale: 1, opacity: 0.28 }}
        transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[54%] h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/34"
      />
      <motion.div
        animate={active ? { scale: [1, 1.13, 1], opacity: [0.22, 0.52, 0.22] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 2.3, delay: 0.25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[54%] h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-100/28"
      />
      <motion.div
        animate={active ? { scale: [1, 1.18, 1], opacity: [0.18, 0.4, 0.18] } : { scale: 1, opacity: 0.16 }}
        transition={{ duration: 2.3, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[54%] h-[148px] w-[148px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18"
      />
    </div>
  );
}

function ManualTypeVisual({ active = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      <motion.div
        animate={active ? { rotateX: [0, 5, 0], rotateZ: [0, -2, 0], y: [0, -5, 0] } : { y: 0 }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[56%] h-[110px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-white/28 bg-[linear-gradient(180deg,rgba(255,255,255,.20),rgba(255,255,255,.08))] shadow-[inset_0_1px_0_rgba(255,255,255,.26),0_18px_46px_rgba(120,120,180,.10)] backdrop-blur-md"
      >
        <div className="absolute left-[12%] right-[12%] top-[22px] h-[12px] rounded-full bg-white/18" />
        <div className="absolute left-[12%] right-[22%] top-[46px] h-[12px] rounded-full bg-white/14" />
        <div className="absolute left-[12%] right-[30%] top-[70px] h-[12px] rounded-full bg-white/12" />
      </motion.div>
    </div>
  );
}

function EntryCard({
  title,
  description,
  tint = "blue",
  active = false,
  hidden = false,
  center = false,
  onClick,
  children,
}) {
  const baseBg =
    tint === "violet"
      ? "bg-[linear-gradient(135deg,rgba(245,239,255,.92),rgba(240,239,252,.82))]"
      : "bg-[linear-gradient(135deg,rgba(224,238,255,.92),rgba(235,243,255,.82))]";

  const shadow =
    tint === "violet"
      ? "shadow-[0_34px_110px_rgba(161,131,255,.12),0_14px_36px_rgba(111,126,181,.08)]"
      : "shadow-[0_34px_110px_rgba(106,156,233,.12),0_14px_36px_rgba(111,126,181,.08)]";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 26, scale: 0.97 }}
      animate={
        hidden
          ? { opacity: 0, scale: 0.94, x: -80, filter: "blur(10px)" }
          : {
              opacity: 1,
              y: 0,
              scale: active ? 1.02 : 1,
              x: 0,
              filter: "blur(0px)",
            }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`relative min-h-[470px] overflow-hidden rounded-[34px] border border-white/60 ${baseBg} ${shadow} backdrop-blur-xl ${
        center ? "mx-auto w-full max-w-[760px]" : "w-full"
      }`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <GlassFace />
      <div className="pointer-events-none absolute inset-[1px] rounded-[33px] shadow-[inset_0_1px_0_rgba(255,255,255,.48),inset_0_-24px_40px_rgba(255,255,255,.06)]" />
      <div className="pointer-events-none absolute inset-x-[6%] bottom-[-30px] h-[70px] rounded-full bg-black/4 blur-[28px]" />

      <motion.button
        type="button"
        onClick={onClick}
        whileHover={!active ? { y: -3, rotateX: 1.6, rotateY: tint === "violet" ? -1.6 : 1.6 } : {}}
        transition={{ duration: 0.28 }}
        className="relative block h-full w-full cursor-pointer p-10 text-left"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative z-[3]">
          <h2 className="max-w-[520px] text-[34px] font-semibold leading-[1.06] tracking-[-0.05em] text-[#253046] sm:text-[40px]">
            {title}
          </h2>

          <p className="mt-4 max-w-[500px] text-[16px] leading-8 text-[#6c7689] sm:text-[17px]">
            {description}
          </p>
        </div>

        {children}
      </motion.button>
    </motion.div>
  );
}

export default function SetupStudioEntryStage({
  discoveryForm,
  onSetDiscoveryField,
  onContinueFlow,
}) {
  const savedManual = useMemo(
    () => parseManualBlock(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const savedPlainNote = useMemo(
    () => extractPlainNote(discoveryForm?.note),
    [discoveryForm?.note]
  );

  const [manualName, setManualName] = useState(savedManual.name || "");
  const [manualBrief, setManualBrief] = useState(savedManual.brief || savedPlainNote || "");
  const [hoveredCard, setHoveredCard] = useState("");
  const [expandedCard, setExpandedCard] = useState("");
  const [manualMode, setManualMode] = useState(""); // "" | voice | manual

  useEffect(() => {
    setManualName(savedManual.name || "");
    setManualBrief(savedManual.brief || savedPlainNote || "");
  }, [savedManual.name, savedManual.brief, savedPlainNote]);

  const composedNote = useMemo(() => {
    const parts = [];

    if (manualName || manualBrief) {
      parts.push(
        [
          "[manual_business]",
          `name: ${manualName}`,
          `brief: ${manualBrief}`,
        ].join("\n")
      );
    }

    return parts.join("\n\n").trim();
  }, [manualName, manualBrief]);

  useEffect(() => {
    if (s(discoveryForm?.note) !== composedNote) {
      onSetDiscoveryField?.("note", composedNote);
    }
  }, [composedNote, discoveryForm?.note, onSetDiscoveryField]);

  const canContinue = !!manualName || !!manualBrief;

  function handleManualSubmit() {
    if (!canContinue) return;
    onContinueFlow?.();
  }

  function handleExpandManual() {
    setExpandedCard("manual");
    if (!manualMode) setManualMode("voice");
  }

  function handleResetManualCard() {
    setExpandedCard("");
    setManualMode("");
  }

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col items-center">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/42 px-5 py-2 text-[12px] font-semibold tracking-[0.18em] text-[#6a95e8] shadow-[0_12px_40px_rgba(110,139,195,.08)] backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-8 max-w-[980px] text-[48px] font-semibold leading-[1.02] tracking-[-0.065em] text-[#232c3f] sm:text-[60px] lg:text-[72px]">
          Let’s build your business draft
        </h1>

        <p className="mx-auto mt-6 max-w-[760px] text-[18px] leading-8 text-[#7f8799] sm:text-[20px]">
          Begin with some existing sources or a few business details.
        </p>
      </div>

      <div className="mt-14 w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          {!expandedCard ? (
            <motion.div
              key="entry-grid"
              layout
              className="grid w-full gap-8 lg:grid-cols-2"
            >
              <div
                onMouseEnter={() => setHoveredCard("source")}
                onMouseLeave={() => setHoveredCard("")}
              >
                <EntryCard
                  title="Add your business sources"
                  description="We’ll start your draft with real business info."
                  tint="blue"
                >
                  <FloatingDust tint="blue" active={hoveredCard === "source"} />
                  <SourceVisual active={hoveredCard === "source"} />
                </EntryCard>
              </div>

              <div
                onMouseEnter={() => setHoveredCard("manual")}
                onMouseLeave={() => setHoveredCard("")}
              >
                <EntryCard
                  title="Describe your business"
                  description="Tell us about your business in a few words..."
                  tint="violet"
                  onClick={handleExpandManual}
                >
                  <FloatingDust tint="violet" active={hoveredCard === "manual"} />
                  <ManualClosedVisual active={hoveredCard === "manual"} />

                  <div className="pointer-events-none absolute bottom-8 right-8 z-[4] inline-flex items-center gap-2 rounded-full border border-white/36 bg-white/10 px-4 py-2 text-sm font-medium text-[#6272a7] backdrop-blur-md">
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </EntryCard>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="manual-expanded"
              layout
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-[820px]"
            >
              <div
                onMouseEnter={() => setHoveredCard("manual-expanded")}
                onMouseLeave={() => setHoveredCard("")}
              >
                <EntryCard
                  title="Describe your business"
                  description="Choose how you want to explain your business."
                  tint="violet"
                  active
                  center
                  onClick={() => {}}
                >
                  <FloatingDust tint="violet" active={hoveredCard === "manual-expanded"} />

                  <div className="relative z-[5] mt-10 grid gap-4 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualMode("voice");
                      }}
                      className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition ${
                        manualMode === "voice"
                          ? "border-white/55 bg-white/20 shadow-[0_22px_60px_rgba(131,119,220,.14)]"
                          : "border-white/34 bg-white/10 hover:bg-white/14"
                      }`}
                    >
                      <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.03))]" />
                      <VoiceWaveVisual active={manualMode === "voice"} />

                      <div className="relative z-[3]">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/36 bg-white/12 text-[#5d73b4] backdrop-blur-md">
                          <Mic className="h-5 w-5" />
                        </div>

                        <div className="mt-5 text-[22px] font-semibold tracking-[-0.04em] text-[#29324a]">
                          Voice
                        </div>

                        <div className="mt-2 max-w-[260px] text-sm leading-7 text-[#6c7689]">
                          Speak naturally and let the system shape the first business draft from your voice.
                        </div>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#6580c9]">
                          <AudioLines className="h-4 w-4" />
                          Use voice input
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setManualMode("manual");
                      }}
                      className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition ${
                        manualMode === "manual"
                          ? "border-white/55 bg-white/20 shadow-[0_22px_60px_rgba(131,119,220,.14)]"
                          : "border-white/34 bg-white/10 hover:bg-white/14"
                      }`}
                    >
                      <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.03))]" />
                      <ManualTypeVisual active={manualMode === "manual"} />

                      <div className="relative z-[3]">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/36 bg-white/12 text-[#5d73b4] backdrop-blur-md">
                          <PenSquare className="h-5 w-5" />
                        </div>

                        <div className="mt-5 text-[22px] font-semibold tracking-[-0.04em] text-[#29324a]">
                          Manual
                        </div>

                        <div className="mt-2 max-w-[260px] text-sm leading-7 text-[#6c7689]">
                          Write the business name and a short summary to create the first draft manually.
                        </div>

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#6580c9]">
                          <Waves className="h-4 w-4" />
                          Type it yourself
                        </div>
                      </div>
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {manualMode === "voice" ? (
                      <motion.div
                        key="voice-panel"
                        initial={{ opacity: 0, y: 14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.28 }}
                        className="relative z-[5] mt-5 rounded-[28px] border border-white/34 bg-white/10 p-5 shadow-[0_18px_48px_rgba(131,119,220,.10)] backdrop-blur-md"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-[18px] font-semibold tracking-[-0.03em] text-[#29324a]">
                              Voice draft path
                            </div>
                            <div className="mt-1 text-sm leading-7 text-[#6c7689]">
                              UI hazırdır. Voice capture flow-u növbəti addımda bağlaya bilərik.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManualMode("manual");
                            }}
                            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[16px] border border-white/34 bg-white/14 px-4 text-sm font-medium text-[#6277b8] transition hover:bg-white/18"
                          >
                            Switch to manual
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AnimatePresence initial={false}>
                    {manualMode === "manual" ? (
                      <motion.div
                        key="manual-form"
                        initial={{ opacity: 0, y: 14, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.985 }}
                        transition={{ duration: 0.28 }}
                        className="relative z-[5] mt-5 space-y-4 rounded-[28px] border border-white/36 bg-white/12 p-5 shadow-[0_18px_48px_rgba(131,119,220,.10)] backdrop-blur-md"
                      >
                        <input
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="Business name"
                          className="h-[64px] w-full rounded-[18px] border border-white/45 bg-white/72 px-5 text-[16px] font-medium tracking-[-0.03em] text-[#2d3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.72)] placeholder:text-[#98a3b8] focus:border-[#cfd8eb]"
                        />

                        <textarea
                          value={manualBrief}
                          onChange={(e) => setManualBrief(e.target.value)}
                          placeholder="Describe your business in a few words..."
                          rows={4}
                          className="w-full resize-none rounded-[20px] border border-white/45 bg-white/72 px-5 py-4 text-[15px] leading-7 text-[#2d3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.72)] placeholder:text-[#98a3b8] focus:border-[#cfd8eb]"
                        />

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManualSubmit();
                            }}
                            disabled={!canContinue}
                            className="inline-flex h-[62px] flex-1 items-center justify-center gap-3 rounded-[18px] border border-[#d9e5ff] bg-[linear-gradient(180deg,rgba(222,234,255,.94),rgba(213,228,255,.86))] px-6 text-[16px] font-semibold text-[#5679c6] shadow-[inset_0_1px_0_rgba(255,255,255,.78),0_14px_34px_rgba(119,151,220,.10)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ArrowRight className="h-5 w-5" />
                            Build draft manually
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManualMode("voice");
                            }}
                            className="inline-flex h-[62px] items-center justify-center gap-2 rounded-[18px] border border-white/34 bg-white/16 px-5 text-sm font-medium text-[#6277b8] transition hover:bg-white/20"
                          >
                            <Mic className="h-4 w-4" />
                            Try voice instead
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <div className="relative z-[5] mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetManualCard();
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/34 bg-white/12 px-4 py-2 text-sm font-medium text-[#6b79a7] transition hover:bg-white/16"
                    >
                      Back
                    </button>
                  </div>
                </EntryCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}