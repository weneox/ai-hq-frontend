import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Ellipsis, Sparkles } from "lucide-react";

import websiteIcon from "../../../assets/setup-studio/channels/weblink.webp";
import instagramIcon from "../../../assets/setup-studio/channels/instagram.svg";
import linkedinIcon from "../../../assets/setup-studio/channels/linkedin.svg";

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

function SourceChip({ icon, label, className = "", tone = "blue" }) {
  const tones = {
    blue:
      "border-white/80 bg-white/72 shadow-[0_18px_42px_rgba(115,149,212,.10)]",
    ivory:
      "border-white/90 bg-[rgba(255,252,248,.88)] shadow-[0_18px_42px_rgba(146,129,96,.10)]",
    soft:
      "border-white/70 bg-[rgba(248,250,255,.76)] shadow-[0_18px_42px_rgba(114,129,170,.08)]",
  };

  return (
    <div
      className={[
        "inline-flex items-center gap-3 rounded-[20px] border px-4 py-3 backdrop-blur-xl",
        tones[tone] || tones.blue,
        className,
      ].join(" ")}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/88 shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
        <img src={icon} alt={label} className="h-5 w-5 object-contain" />
      </span>
      <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#253046]">
        {label}
      </span>
    </div>
  );
}

function SoftGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 bottom-[-12%] h-[48%] bg-[radial-gradient(ellipse_at_center,rgba(151,185,255,.18),transparent_66%)] blur-[30px]" />
      <div className="pointer-events-none absolute left-[12%] top-[14%] h-[180px] w-[180px] rounded-full bg-[rgba(183,212,255,.18)] blur-[56px]" />
      <div className="pointer-events-none absolute right-[8%] top-[10%] h-[150px] w-[150px] rounded-full bg-[rgba(255,238,214,.18)] blur-[52px]" />
    </>
  );
}

function SourceOrbitalScene({ active }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[34px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,.92),transparent_26%),radial-gradient(circle_at_82%_16%,rgba(196,220,255,.28),transparent_24%),linear-gradient(180deg,transparent,rgba(224,237,255,.18))]" />

      <div className="absolute left-1/2 top-[67%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(160,193,255,.14),rgba(255,255,255,0)_68%)]" />
      <div className="absolute left-1/2 top-[68%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/42 blur-[34px]" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: active ? 14 : 18, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[69%] h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-[8px] rounded-full border border-white/74" />
        <div className="absolute inset-[38px] rounded-full border border-[rgba(178,204,247,.7)]" />
        <div className="absolute inset-[68px] rounded-full border border-white/42" />
        <div className="absolute inset-[98px] rounded-full border border-[rgba(187,208,240,.48)]" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360, scale: active ? [1, 1.02, 1] : 1 }}
        transition={{ duration: active ? 18 : 22, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[69%] h-[332px] w-[332px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-[14px] rounded-full border border-[rgba(221,232,248,.55)]" />
        <div className="absolute inset-[52px] rounded-full border border-[rgba(255,255,255,.28)]" />
        <div className="absolute inset-[92px] rounded-full border border-[rgba(196,216,247,.26)]" />
      </motion.div>

      <motion.div
        animate={{
          y: active ? [0, -6, 0] : [0, -3, 0],
          opacity: active ? 1 : 0.85,
        }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[12%] top-[50%]"
      >
        <SourceChip icon={websiteIcon} label="Website" tone="ivory" />
      </motion.div>

      <motion.div
        animate={{
          y: active ? [0, -8, 0] : [0, -4, 0],
          x: active ? [0, 3, 0] : [0, 2, 0],
          opacity: active ? 1 : 0.9,
        }}
        transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10%] top-[42%]"
      >
        <SourceChip icon={instagramIcon} label="Instagram" tone="blue" />
      </motion.div>

      <motion.div
        animate={{
          y: active ? [0, -7, 0] : [0, -3, 0],
          x: active ? [0, -3, 0] : [0, -2, 0],
        }}
        transition={{ duration: 5.1, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[24%] bottom-[12%]"
      >
        <SourceChip icon={linkedinIcon} label="LinkedIn" tone="soft" />
      </motion.div>

      <motion.div
        animate={{
          y: active ? [0, -6, 0] : [0, -3, 0],
          opacity: active ? [0.82, 1, 0.82] : [0.68, 0.88, 0.68],
        }}
        transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[15%] bottom-[16%]"
      >
        <div className="inline-flex h-[56px] w-[74px] items-center justify-center rounded-[20px] border border-white/80 bg-white/70 shadow-[0_18px_42px_rgba(115,149,212,.08)] backdrop-blur-xl">
          <Ellipsis className="h-5 w-5 text-[#6b768b]" />
        </div>
      </motion.div>
    </div>
  );
}

function EntryCard({
  active,
  onClick,
  children,
  accent = "blue",
  className = "",
}) {
  const accentMap = {
    blue: {
      base:
        "bg-[linear-gradient(145deg,rgba(243,247,255,.94),rgba(232,240,251,.84))] border-[rgba(255,255,255,.82)]",
      shadow: active
        ? "shadow-[0_34px_120px_rgba(102,136,198,.18)]"
        : "shadow-[0_24px_90px_rgba(102,136,198,.10)]",
      ring: active ? "ring-1 ring-[rgba(151,182,236,.5)]" : "",
    },
    rose: {
      base:
        "bg-[linear-gradient(145deg,rgba(250,246,252,.94),rgba(243,239,248,.86))] border-[rgba(255,255,255,.84)]",
      shadow: active
        ? "shadow-[0_34px_120px_rgba(158,132,192,.16)]"
        : "shadow-[0_24px_90px_rgba(158,132,192,.10)]",
      ring: active ? "ring-1 ring-[rgba(201,184,226,.55)]" : "",
    },
  };

  const tone = accentMap[accent] || accentMap.blue;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: active ? 1.012 : 1,
      }}
      whileHover={{
        y: -3,
        scale: active ? 1.014 : 1.008,
      }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "group relative min-h-[500px] w-full overflow-hidden rounded-[34px] border text-left backdrop-blur-2xl",
        tone.base,
        tone.shadow,
        tone.ring,
        className,
      ].join(" ")}
    >
      <div className="absolute inset-[1px] rounded-[33px] bg-[linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,.14))]" />
      <div className="relative z-[2] h-full">{children}</div>
    </motion.button>
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
  const [activeCard, setActiveCard] = useState(() => {
    if (savedManual.name || savedManual.brief || savedPlainNote) return "manual";
    return null;
  });

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

  const canContinueManual = !!manualName || !!manualBrief;

  function handleManualSubmit(e) {
    e?.stopPropagation?.();
    if (!canContinueManual) return;
    onContinueFlow?.();
  }

  function handleSourceContinue(e) {
    e?.stopPropagation?.();
    onContinueFlow?.();
  }

  return (
    <section className="mx-auto flex w-full max-w-[1320px] flex-col items-center px-2 pb-4 pt-2">
      <div className="relative w-full overflow-hidden rounded-[40px] bg-[linear-gradient(180deg,#f6f4ef_0%,#f3f5f9_48%,#eef3fa_100%)] px-6 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,.9),transparent_24%),radial-gradient(circle_at_18%_18%,rgba(194,219,255,.18),transparent_22%),radial-gradient(circle_at_86%_16%,rgba(241,226,255,.18),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(180,205,255,.14),transparent_28%)]" />

        <div className="relative z-[2]">
          <div className="w-full text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/68 px-5 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#7a90c8] shadow-[0_16px_40px_rgba(110,139,195,.08)] backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              AI SETUP STUDIO
            </div>

            <h1 className="mx-auto mt-7 max-w-[860px] text-[42px] font-semibold leading-[1.02] tracking-[-0.065em] text-[#20283a] sm:text-[52px] lg:text-[60px]">
              Build your first business draft
            </h1>

            <p className="mx-auto mt-5 max-w-[650px] text-[17px] leading-8 text-[#7c8496] sm:text-[18px]">
              Start with a few trusted sources or tell us what your business does.
            </p>
          </div>

          <div className="mt-12 grid w-full gap-7 lg:grid-cols-2">
            <EntryCard
              active={activeCard === "sources"}
              onClick={() => setActiveCard("sources")}
              accent="blue"
              className="transition-transform duration-300"
            >
              <SoftGlow />
              <SourceOrbitalScene active={activeCard === "sources"} />

              <div className="relative flex h-full flex-col p-8 sm:p-10">
                <div className="max-w-[430px]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/56 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#84a0da] backdrop-blur-md">
                    Sources
                  </div>

                  <h2 className="mt-5 text-[34px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#233045] sm:text-[42px]">
                    Add your business sources
                  </h2>

                  <p className="mt-4 max-w-[420px] text-[16px] leading-8 text-[#6e7788]">
                    Website, social profiles, and other signals we can shape into your first draft.
                  </p>
                </div>

                <div className="mt-auto pt-10">
                  <AnimatePresence mode="wait">
                    {activeCard === "sources" ? (
                      <motion.div
                        key="sources-open"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-[440px]"
                      >
                        <div className="rounded-[24px] border border-white/70 bg-white/54 p-4 shadow-[0_22px_48px_rgba(112,139,191,.10)] backdrop-blur-xl">
                          <div className="flex flex-wrap gap-3">
                            <SourceChip icon={websiteIcon} label="Website" tone="ivory" />
                            <SourceChip icon={instagramIcon} label="Instagram" tone="blue" />
                            <SourceChip icon={linkedinIcon} label="LinkedIn" tone="soft" />
                          </div>

                          <button
                            type="button"
                            onClick={handleSourceContinue}
                            className="mt-4 inline-flex h-[62px] w-full items-center justify-center gap-3 rounded-[18px] border border-[rgba(215,227,248,.92)] bg-[linear-gradient(180deg,rgba(255,255,255,.88),rgba(237,243,253,.88))] px-5 text-[15px] font-semibold text-[#5b76b2] shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_12px_30px_rgba(109,138,189,.08)] transition hover:-translate-y-0.5"
                          >
                            <ArrowRight className="h-4.5 w-4.5" />
                            Continue with sources
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="sources-closed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.24 }}
                        className="max-w-[360px] text-[14px] text-[#7a8395]"
                      >
                        Choose the strongest source you already have.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </EntryCard>

            <EntryCard
              active={activeCard === "manual"}
              onClick={() => setActiveCard("manual")}
              accent="rose"
              className="transition-transform duration-300"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,.9),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(236,223,255,.22),transparent_22%),radial-gradient(circle_at_18%_100%,rgba(214,229,255,.16),transparent_24%)]" />

              <div className="relative flex h-full flex-col p-8 sm:p-10">
                <div className="max-w-[430px]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/58 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9b84c7] backdrop-blur-md">
                    Manual
                  </div>

                  <h2 className="mt-5 text-[34px] font-semibold leading-[1.02] tracking-[-0.055em] text-[#233045] sm:text-[42px]">
                    Describe your business
                  </h2>

                  <p className="mt-4 max-w-[420px] text-[16px] leading-8 text-[#6f788a]">
                    Start with a short name and a simple description. We’ll shape the rest from there.
                  </p>
                </div>

                <div className="mt-auto pt-10">
                  <AnimatePresence mode="wait">
                    {activeCard === "manual" ? (
                      <motion.div
                        key="manual-open"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-[520px]"
                      >
                        <div className="rounded-[26px] border border-white/72 bg-white/56 p-4 shadow-[0_22px_52px_rgba(153,129,188,.10)] backdrop-blur-xl">
                          <div className="space-y-3">
                            <input
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              placeholder="Business name"
                              className="h-[64px] w-full rounded-[18px] border border-[rgba(224,228,239,.92)] bg-white/80 px-5 text-[16px] font-medium tracking-[-0.02em] text-[#2b3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d2d8ea]"
                            />

                            <textarea
                              value={manualBrief}
                              onChange={(e) => setManualBrief(e.target.value)}
                              placeholder="Describe your business in a few words..."
                              rows={4}
                              className="w-full resize-none rounded-[18px] border border-[rgba(224,228,239,.92)] bg-white/80 px-5 py-4 text-[16px] font-medium leading-7 tracking-[-0.02em] text-[#2b3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d2d8ea]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleManualSubmit}
                            disabled={!canContinueManual}
                            className="mt-4 inline-flex h-[62px] w-full items-center justify-center gap-3 rounded-[18px] border border-[rgba(221,227,243,.96)] bg-[linear-gradient(180deg,rgba(252,252,255,.96),rgba(241,243,252,.94))] px-5 text-[15px] font-semibold text-[#5e6f9f] shadow-[inset_0_1px_0_rgba(255,255,255,.98),0_14px_30px_rgba(145,132,182,.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                          >
                            <ArrowRight className="h-4.5 w-4.5" />
                            Build draft manually
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="manual-closed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.24 }}
                        className="max-w-[340px]"
                      >
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/56 px-4 py-2 text-[14px] font-medium text-[#7f88a1] shadow-[0_10px_24px_rgba(158,132,192,.06)] backdrop-blur-md">
                          Click to start with a short written brief
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </EntryCard>
          </div>
        </div>
      </div>
    </section>
  );
}