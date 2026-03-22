import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  PencilLine,
  Sparkles,
} from "lucide-react";

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

function SourceItem({ icon, label, subtle = false }) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-[18px] border px-4 py-3",
        subtle
          ? "border-[rgba(225,232,244,.9)] bg-[rgba(255,255,255,.72)]"
          : "border-[rgba(221,230,244,.96)] bg-white",
        "shadow-[0_10px_24px_rgba(52,78,126,.06)]",
      ].join(" ")}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[rgba(233,238,246,.92)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,.95)]">
        <img src={icon} alt={label} className="h-5 w-5 object-contain" />
      </span>

      <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#263248]">
        {label}
      </span>
    </div>
  );
}

function StageBadge({ children, tone = "blue" }) {
  const tones = {
    blue: "text-[#7b95d2]",
    rose: "text-[#9e86c6]",
  };

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border border-white/90 bg-white/78 px-3.5 py-1.5",
        "text-[11px] font-semibold uppercase tracking-[0.2em]",
        tones[tone] || tones.blue,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[rgba(226,231,239,.96)] bg-white px-4 py-2 text-[14px] font-medium text-[#65748c] shadow-[0_8px_22px_rgba(61,79,114,.06)] transition hover:-translate-y-0.5"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function Shell({ tone = "blue", children, button = false, onClick }) {
  const Comp = button ? motion.button : motion.div;

  const tones = {
    blue:
      "border-[rgba(219,227,241,.95)] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] shadow-[0_26px_70px_rgba(84,118,173,.10)]",
    rose:
      "border-[rgba(231,224,237,.96)] bg-[linear-gradient(180deg,#fcfafc_0%,#f5f0f6_100%)] shadow-[0_26px_70px_rgba(136,115,160,.10)]",
  };

  return (
    <Comp
      type={button ? "button" : undefined}
      onClick={onClick}
      whileHover={
        button
          ? {
              y: -4,
              transition: { duration: 0.18, ease: "easeOut" },
            }
          : undefined
      }
      whileTap={button ? { scale: 0.998 } : undefined}
      className={[
        "relative w-full overflow-hidden rounded-[34px] border text-left",
        tones[tone] || tones.blue,
        button ? "group cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="absolute inset-[1px] rounded-[33px] bg-[linear-gradient(180deg,rgba(255,255,255,.52),rgba(255,255,255,.18))]" />
      <div className="relative z-[2] h-full">{children}</div>
    </Comp>
  );
}

function SourceClosedCard({ onClick }) {
  return (
    <Shell tone="blue" button onClick={onClick}>
      <div className="relative min-h-[490px] p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-40px] top-[-32px] h-[180px] w-[180px] rounded-full bg-[rgba(190,214,255,.18)] blur-[40px]" />
          <div className="absolute left-[58%] bottom-[-80px] h-[280px] w-[280px] rounded-full border border-[rgba(191,211,243,.42)]" />
          <div className="absolute left-[61%] bottom-[-40px] h-[210px] w-[210px] rounded-full border border-[rgba(199,217,245,.28)]" />
        </div>

        <div className="relative z-[2] max-w-[370px]">
          <StageBadge tone="blue">Sources</StageBadge>

          <h2 className="mt-6 text-[38px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#233149] sm:text-[48px]">
            Add your business sources
          </h2>

          <p className="mt-5 max-w-[340px] text-[17px] leading-8 text-[#6f7b91]">
            Start with the strongest signal you already have.
          </p>
        </div>

        <div className="relative z-[2] mt-10">
          <div className="max-w-[430px] rounded-[28px] border border-white/85 bg-[rgba(255,255,255,.64)] p-4 shadow-[0_18px_38px_rgba(72,101,154,.08)] backdrop-blur-[6px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <SourceItem icon={websiteIcon} label="Website" />
              <SourceItem icon={instagramIcon} label="Instagram" subtle />
              <div className="sm:col-span-2 sm:max-w-[182px]">
                <SourceItem icon={linkedinIcon} label="LinkedIn" subtle />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[20px] border border-[rgba(225,232,244,.96)] bg-[rgba(255,255,255,.78)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.95)]">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(239,245,255,.9)] text-[#7f96cb]">
                  <Globe2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="text-[14px] font-semibold tracking-[-0.02em] text-[#273248]">
                    Choose a starting source
                  </div>
                  <div className="text-[13px] text-[#7b869b]">
                    Website is the best first pass.
                  </div>
                </div>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(223,230,242,.95)] bg-white text-[#7489bb] shadow-[0_8px_20px_rgba(67,93,142,.06)] transition duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-4.5 w-4.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function ManualClosedCard({ onClick }) {
  return (
    <Shell tone="rose" button onClick={onClick}>
      <div className="relative min-h-[490px] p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-24px] top-[22px] h-[160px] w-[160px] rounded-full bg-[rgba(246,229,255,.22)] blur-[34px]" />
          <div className="absolute right-[52px] bottom-[118px] h-[1px] w-[230px] bg-[linear-gradient(90deg,transparent,rgba(173,152,204,.22),transparent)]" />
          <div className="absolute right-[52px] bottom-[148px] h-[1px] w-[200px] bg-[linear-gradient(90deg,transparent,rgba(173,152,204,.18),transparent)]" />
        </div>

        <div className="relative z-[2] max-w-[360px]">
          <StageBadge tone="rose">Manual</StageBadge>

          <h2 className="mt-6 text-[38px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#233149] sm:text-[48px]">
            Describe your business
          </h2>

          <p className="mt-5 max-w-[340px] text-[17px] leading-8 text-[#757d8f]">
            Write a short brief and build your first draft from scratch.
          </p>
        </div>

        <div className="relative z-[2] mt-10">
          <div className="max-w-[430px] rounded-[28px] border border-white/85 bg-[rgba(255,255,255,.64)] p-4 shadow-[0_18px_38px_rgba(107,87,131,.07)] backdrop-blur-[6px]">
            <div className="rounded-[22px] border border-[rgba(230,225,235,.95)] bg-[rgba(255,255,255,.8)] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(245,239,250,.92)] text-[#9a86c7]">
                  <PencilLine className="h-4.5 w-4.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold tracking-[-0.02em] text-[#273248]">
                    Start with a short brief
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="h-[10px] w-[48%] rounded-full bg-[rgba(229,226,236,.9)]" />
                    <div className="h-[10px] w-[72%] rounded-full bg-[rgba(233,229,239,.85)]" />
                    <div className="h-[10px] w-[58%] rounded-full bg-[rgba(236,232,241,.8)]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-[20px] border border-[rgba(230,225,235,.95)] bg-[rgba(255,255,255,.78)] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,.95)]">
              <div>
                <div className="text-[14px] font-semibold tracking-[-0.02em] text-[#273248]">
                  Open manual composer
                </div>
                <div className="text-[13px] text-[#7d8397]">
                  Add a name and a simple summary.
                </div>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(230,225,235,.95)] bg-white text-[#9687bb] shadow-[0_8px_20px_rgba(114,98,143,.05)] transition duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-4.5 w-4.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function SourcesExpanded({ onBack, onContinue }) {
  return (
    <motion.div
      key="sources-expanded"
      initial={{ opacity: 0, y: 14, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.994 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[940px]"
    >
      <Shell tone="blue">
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton onClick={onBack} />
            <StageBadge tone="blue">Sources</StageBadge>
          </div>

          <div className="mt-8 max-w-[560px]">
            <h3 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#223149] sm:text-[44px]">
              Bring in your real business signals
            </h3>

            <p className="mt-4 text-[17px] leading-8 text-[#6f7b91]">
              Website, social profiles, and other trusted sources can shape the
              first draft faster.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/85 bg-[rgba(255,255,255,.7)] p-5 shadow-[0_18px_38px_rgba(72,101,154,.08)]">
            <div className="grid gap-3 sm:grid-cols-3">
              <SourceItem icon={websiteIcon} label="Website" />
              <SourceItem icon={instagramIcon} label="Instagram" subtle />
              <SourceItem icon={linkedinIcon} label="LinkedIn" subtle />
            </div>

            <div className="mt-5 rounded-[22px] border border-[rgba(223,230,242,.96)] bg-white/80 p-4">
              <div className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#88a0d1]">
                Recommended start
              </div>

              <div className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#223149]">
                Start with your website first
              </div>

              <p className="mt-2 max-w-[580px] text-[16px] leading-7 text-[#6f7b91]">
                It usually gives the cleanest first pass for services, contact
                info, positioning, and business summary.
              </p>

              <button
                type="button"
                onClick={onContinue}
                className="mt-5 inline-flex h-[58px] items-center justify-center gap-3 rounded-[18px] border border-[rgba(216,225,240,.98)] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6fc_100%)] px-6 text-[15px] font-semibold text-[#5871ac] shadow-[0_12px_28px_rgba(87,118,173,.08)] transition hover:-translate-y-0.5"
              >
                <ArrowRight className="h-4.5 w-4.5" />
                Continue with sources
              </button>
            </div>
          </div>
        </div>
      </Shell>
    </motion.div>
  );
}

function ManualExpanded({
  onBack,
  manualName,
  manualBrief,
  onChangeName,
  onChangeBrief,
  onSubmit,
  canContinue,
}) {
  return (
    <motion.div
      key="manual-expanded"
      initial={{ opacity: 0, y: 14, scale: 0.992 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.994 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[940px]"
    >
      <Shell tone="rose">
        <div className="p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton onClick={onBack} />
            <StageBadge tone="rose">Manual</StageBadge>
          </div>

          <div className="mt-8 max-w-[560px]">
            <h3 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#223149] sm:text-[44px]">
              Describe your business
            </h3>

            <p className="mt-4 text-[17px] leading-8 text-[#757d8f]">
              Just a short name and a simple description is enough to begin.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/85 bg-[rgba(255,255,255,.72)] p-5 shadow-[0_18px_38px_rgba(107,87,131,.07)]">
            <div className="grid gap-4">
              <input
                value={manualName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="Business name"
                className="h-[62px] w-full rounded-[18px] border border-[rgba(225,228,236,.98)] bg-white px-5 text-[16px] font-medium tracking-[-0.02em] text-[#2b3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d5daea]"
              />

              <textarea
                value={manualBrief}
                onChange={(e) => onChangeBrief(e.target.value)}
                placeholder="Describe your business in a few words..."
                rows={5}
                className="w-full resize-none rounded-[18px] border border-[rgba(225,228,236,.98)] bg-white px-5 py-4 text-[16px] font-medium leading-7 tracking-[-0.02em] text-[#2b3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d5daea]"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={!canContinue}
              className="mt-5 inline-flex h-[58px] items-center justify-center gap-3 rounded-[18px] border border-[rgba(224,226,236,.98)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f5fa_100%)] px-6 text-[15px] font-semibold text-[#69739a] shadow-[0_12px_28px_rgba(110,98,144,.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <ArrowRight className="h-4.5 w-4.5" />
              Build draft manually
            </button>
          </div>
        </div>
      </Shell>
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
  const [manualBrief, setManualBrief] = useState(
    savedManual.brief || savedPlainNote || ""
  );
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

  function handleManualSubmit() {
    if (!canContinueManual) return;
    onContinueFlow?.();
  }

  function handleSourceContinue() {
    onContinueFlow?.();
  }

  return (
    <section className="mx-auto w-full max-w-[1240px] px-2 pb-8 pt-3 sm:px-3 lg:pt-5">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/82 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_26px_rgba(77,98,133,.06)]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-7 max-w-[760px] text-[38px] font-semibold leading-[0.98] tracking-[-0.07em] text-[#1f2b42] sm:text-[50px] lg:text-[58px]">
          Build your business draft
        </h1>

        <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-8 text-[#778094] sm:text-[18px]">
          Choose how you want to begin.
        </p>
      </div>

      <div className="mt-12">
        <AnimatePresence mode="wait">
          {!activeCard ? (
            <motion.div
              key="chooser"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-7 lg:grid-cols-2"
            >
              <SourceClosedCard onClick={() => setActiveCard("sources")} />
              <ManualClosedCard onClick={() => setActiveCard("manual")} />
            </motion.div>
          ) : activeCard === "sources" ? (
            <SourcesExpanded
              onBack={() => setActiveCard(null)}
              onContinue={handleSourceContinue}
            />
          ) : (
            <ManualExpanded
              onBack={() => setActiveCard(null)}
              manualName={manualName}
              manualBrief={manualBrief}
              onChangeName={setManualName}
              onChangeBrief={setManualBrief}
              onSubmit={handleManualSubmit}
              canContinue={canContinueManual}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}