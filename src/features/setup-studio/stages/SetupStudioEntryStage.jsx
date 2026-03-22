import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

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

function OrbitalRing() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-sky-200/18 via-sky-100/8 to-transparent" />
      <div className="absolute left-1/2 top-[55%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/14 blur-[56px]" />
      <div className="absolute left-1/2 top-[61%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/38 blur-[38px]" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[64%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-[12px] rounded-full border border-white/42 opacity-95" />
        <div className="absolute inset-[34px] rounded-full border border-sky-100/55 opacity-90" />
        <div className="absolute inset-[56px] rounded-full border border-white/34 opacity-80" />
        <div className="absolute inset-[78px] rounded-full border border-sky-100/45 opacity-70" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360, scale: [1, 1.02, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[64%] h-[310px] w-[310px] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="absolute inset-[14px] rounded-full border border-sky-100/26 opacity-80" />
        <div className="absolute inset-[48px] rounded-full border border-white/22 opacity-70" />
        <div className="absolute inset-[88px] rounded-full border border-sky-50/16 opacity-60" />
      </motion.div>

      <div className="absolute left-1/2 top-[64%] h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/62 blur-[28px]" />
    </div>
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

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/40 px-5 py-2 text-[12px] font-semibold tracking-[0.18em] text-[#6a95e8] shadow-[0_12px_40px_rgba(110,139,195,.08)] backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-8 max-w-[940px] text-[48px] font-semibold leading-[1.03] tracking-[-0.06em] text-[#232c3f] sm:text-[58px] lg:text-[66px]">
          Let’s build your business draft
        </h1>

        <p className="mx-auto mt-6 max-w-[760px] text-[18px] leading-8 text-[#7f8799] sm:text-[20px]">
          Begin with some existing sources or a few business details.
        </p>
      </div>

      <div className="mt-14 grid w-full gap-7 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[440px] overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(223,239,255,.88),rgba(238,244,255,.74))] p-10 shadow-[0_30px_90px_rgba(106,156,233,.10)] backdrop-blur-xl"
        >
          <div className="relative z-[2]">
            <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#253046] sm:text-[40px]">
              Add your business sources
            </h2>

            <p className="mt-4 max-w-[460px] text-[16px] leading-8 text-[#6c7689] sm:text-[17px]">
              We’ll start your draft with real business info.
            </p>
          </div>

          <OrbitalRing />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[440px] overflow-hidden rounded-[32px] border border-white/60 bg-[linear-gradient(135deg,rgba(245,239,255,.88),rgba(243,246,255,.78))] p-10 shadow-[0_30px_90px_rgba(161,131,255,.10)] backdrop-blur-xl"
        >
          <div className="relative z-[2]">
            <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#253046] sm:text-[40px]">
              Describe your business
            </h2>

            <p className="mt-4 max-w-[470px] text-[16px] leading-8 text-[#6c7689] sm:text-[17px]">
              Tell us about your business in a few words...
            </p>

            <div className="mt-10 space-y-4">
              <input
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Business name"
                className="h-[66px] w-full rounded-[18px] border border-[#dfe5f2] bg-white/78 px-6 text-[17px] font-medium tracking-[-0.03em] text-[#2d3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.68)] placeholder:text-[#9aa3b5] focus:border-[#cbd6eb]"
              />

              <input
                value={manualBrief}
                onChange={(e) => setManualBrief(e.target.value)}
                placeholder="Describe your business in a few words..."
                className="h-[66px] w-full rounded-[18px] border border-[#dfe5f2] bg-white/78 px-6 text-[17px] font-medium tracking-[-0.03em] text-[#2d3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.68)] placeholder:text-[#9aa3b5] focus:border-[#cbd6eb]"
              />

              <button
                type="button"
                onClick={handleManualSubmit}
                disabled={!canContinue}
                className="inline-flex h-[68px] w-full items-center justify-center gap-3 rounded-[18px] border border-[#d9e5ff] bg-[linear-gradient(180deg,rgba(222,234,255,.92),rgba(213,228,255,.84))] px-6 text-[16px] font-semibold text-[#5679c6] shadow-[inset_0_1px_0_rgba(255,255,255,.78),0_14px_34px_rgba(119,151,220,.10)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowRight className="h-5 w-5" />
                Build draft manually
                <span className="ml-auto inline-flex items-center gap-1 text-[#6a86cc]">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                </span>
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_100%_0%,rgba(255,214,244,.18),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(202,223,255,.12),transparent_22%)]" />
        </motion.div>
      </div>
    </section>
  );
}