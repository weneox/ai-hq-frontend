import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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

function SourcePill({ icon, label, className = "" }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-3 rounded-[18px] border border-white/85 bg-white/78 px-4 py-3 shadow-[0_10px_28px_rgba(34,52,94,.07)]",
        className,
      ].join(" ")}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,.95)]">
        <img src={icon} alt={label} className="h-5 w-5 object-contain" />
      </span>
      <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#27324a]">
        {label}
      </span>
    </div>
  );
}

function CardShell({ children, tone = "blue", onClick, asButton = false }) {
  const toneMap = {
    blue:
      "border-[rgba(216,225,241,.95)] bg-[linear-gradient(180deg,#f7faff_0%,#eef4fb_100%)] shadow-[0_26px_70px_rgba(87,118,173,.10)]",
    rose:
      "border-[rgba(228,221,235,.96)] bg-[linear-gradient(180deg,#fbf9fc_0%,#f4eff6_100%)] shadow-[0_26px_70px_rgba(140,118,162,.10)]",
    neutral:
      "border-[rgba(225,229,236,.96)] bg-[linear-gradient(180deg,#fcfcfd_0%,#f5f7fa_100%)] shadow-[0_28px_72px_rgba(56,72,106,.08)]",
  };

  const Comp = asButton ? motion.button : motion.div;

  return (
    <Comp
      type={asButton ? "button" : undefined}
      onClick={onClick}
      whileHover={
        asButton
          ? { y: -4, scale: 1.006, transition: { duration: 0.18 } }
          : undefined
      }
      whileTap={asButton ? { scale: 0.998 } : undefined}
      className={[
        "relative w-full overflow-hidden rounded-[34px] border text-left",
        toneMap[tone] || toneMap.blue,
        asButton ? "group cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="absolute inset-[1px] rounded-[33px] bg-[linear-gradient(180deg,rgba(255,255,255,.50),rgba(255,255,255,.18))]" />
      <div className="relative z-[2] h-full">{children}</div>
    </Comp>
  );
}

function SourcesClosedCard({ onClick }) {
  return (
    <CardShell tone="blue" onClick={onClick} asButton>
      <div className="relative min-h-[480px] p-8 sm:p-10">
        <div className="max-w-[420px]">
          <div className="inline-flex items-center rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7b94d0]">
            Sources
          </div>

          <h2 className="mt-6 max-w-[380px] text-[40px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#233149] sm:text-[48px]">
            Add your business sources
          </h2>

          <p className="mt-5 max-w-[370px] text-[17px] leading-8 text-[#6f7b90]">
            Start with the strongest signal you already have.
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-60px] top-[-40px] h-[220px] w-[220px] rounded-full bg-[rgba(187,214,255,.22)] blur-[50px]" />
          <div className="absolute left-[42%] bottom-[-80px] h-[320px] w-[320px] rounded-full border border-[rgba(183,205,242,.45)]" />
          <div className="absolute left-[46%] bottom-[-44px] h-[246px] w-[246px] rounded-full border border-[rgba(194,214,248,.34)]" />
          <div className="absolute left-[50%] bottom-[8px] h-[172px] w-[172px] rounded-full border border-[rgba(205,221,249,.28)]" />
        </div>

        <div className="pointer-events-none absolute bottom-[110px] left-[56px] transition duration-300 group-hover:translate-y-[-6px]">
          <SourcePill icon={websiteIcon} label="Website" />
        </div>

        <div className="pointer-events-none absolute right-[52px] top-[182px] transition duration-300 group-hover:translate-y-[-4px]">
          <SourcePill icon={instagramIcon} label="Instagram" />
        </div>

        <div className="pointer-events-none absolute bottom-[54px] left-[132px] transition duration-300 group-hover:translate-y-[-5px]">
          <SourcePill icon={linkedinIcon} label="LinkedIn" />
        </div>

        <div className="pointer-events-none absolute bottom-8 left-8 inline-flex items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-[14px] font-medium text-[#6f7f99] shadow-[0_8px_24px_rgba(76,101,149,.08)] transition duration-300 group-hover:translate-y-[-2px]">
          Click to choose a source
        </div>
      </div>
    </CardShell>
  );
}

function ManualClosedCard({ onClick }) {
  return (
    <CardShell tone="rose" onClick={onClick} asButton>
      <div className="relative min-h-[480px] p-8 sm:p-10">
        <div className="max-w-[420px]">
          <div className="inline-flex items-center rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a86c7]">
            Manual
          </div>

          <h2 className="mt-6 max-w-[390px] text-[40px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#233149] sm:text-[48px]">
            Describe your business
          </h2>

          <p className="mt-5 max-w-[380px] text-[17px] leading-8 text-[#737b8d]">
            Write a short brief and build your first draft from scratch.
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-30px] top-[42px] h-[190px] w-[190px] rounded-full bg-[rgba(245,228,255,.30)] blur-[44px]" />
          <div className="absolute right-[54px] bottom-[98px] h-[1px] w-[180px] bg-[linear-gradient(90deg,transparent,rgba(173,152,204,.28),transparent)]" />
          <div className="absolute right-[54px] bottom-[126px] h-[1px] w-[220px] bg-[linear-gradient(90deg,transparent,rgba(173,152,204,.20),transparent)]" />
          <div className="absolute right-[54px] bottom-[154px] h-[1px] w-[200px] bg-[linear-gradient(90deg,transparent,rgba(173,152,204,.24),transparent)]" />
        </div>

        <div className="pointer-events-none absolute bottom-8 left-8 inline-flex items-center gap-2 rounded-full bg-white/72 px-4 py-2 text-[14px] font-medium text-[#7b7a97] shadow-[0_8px_24px_rgba(117,98,152,.07)] transition duration-300 group-hover:translate-y-[-2px]">
          Click to write a short brief
        </div>
      </div>
    </CardShell>
  );
}

function TopSwitch({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[rgba(223,228,238,.95)] bg-white px-4 py-2 text-[14px] font-medium text-[#617089] shadow-[0_8px_22px_rgba(55,72,105,.06)] transition hover:-translate-y-0.5"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}

function SourcesExpanded({ onBack, onContinue }) {
  return (
    <motion.div
      key="sources-expanded"
      initial={{ opacity: 0, y: 18, scale: 0.988 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.992 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[920px]"
    >
      <CardShell tone="blue">
        <div className="relative p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TopSwitch label="Back" onClick={onBack} />

            <div className="inline-flex items-center rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7b94d0]">
              Sources
            </div>
          </div>

          <div className="mt-8 max-w-[560px]">
            <h3 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#223149] sm:text-[44px]">
              Bring in your real business signals
            </h3>

            <p className="mt-4 text-[17px] leading-8 text-[#6f7b90]">
              Website, social profiles, and other trusted sources can shape the
              first draft faster.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            <SourcePill icon={websiteIcon} label="Website" />
            <SourcePill icon={instagramIcon} label="Instagram" />
            <SourcePill icon={linkedinIcon} label="LinkedIn" />
          </div>

          <div className="mt-8 rounded-[26px] border border-white/80 bg-white/68 p-5 shadow-[0_18px_38px_rgba(73,101,154,.08)]">
            <div className="text-[14px] font-medium uppercase tracking-[0.16em] text-[#88a0d1]">
              Recommended
            </div>

            <div className="mt-3 text-[18px] font-semibold tracking-[-0.03em] text-[#243149]">
              Start with your website first
            </div>

            <p className="mt-2 max-w-[560px] text-[16px] leading-7 text-[#6f7b90]">
              It usually gives the cleanest first pass for services, contact
              info, positioning, and business summary.
            </p>

            <button
              type="button"
              onClick={onContinue}
              className="mt-5 inline-flex h-[58px] items-center justify-center gap-3 rounded-[18px] border border-[rgba(214,223,239,.98)] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5fb_100%)] px-6 text-[15px] font-semibold text-[#5871ac] shadow-[0_12px_28px_rgba(87,118,173,.08)] transition hover:-translate-y-0.5"
            >
              <ArrowRight className="h-4.5 w-4.5" />
              Continue with sources
            </button>
          </div>
        </div>
      </CardShell>
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
      initial={{ opacity: 0, y: 18, scale: 0.988 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.992 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-[920px]"
    >
      <CardShell tone="rose">
        <div className="relative p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TopSwitch label="Back" onClick={onBack} />

            <div className="inline-flex items-center rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a86c7]">
              Manual
            </div>
          </div>

          <div className="mt-8 max-w-[560px]">
            <h3 className="text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-[#223149] sm:text-[44px]">
              Describe your business
            </h3>

            <p className="mt-4 text-[17px] leading-8 text-[#727a8d]">
              Just a short name and a simple description is enough to begin.
            </p>
          </div>

          <div className="mt-8 rounded-[26px] border border-white/80 bg-white/70 p-5 shadow-[0_18px_38px_rgba(102,82,134,.07)]">
            <div className="grid gap-4">
              <input
                value={manualName}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="Business name"
                className="h-[62px] w-full rounded-[18px] border border-[rgba(224,228,238,.98)] bg-white px-5 text-[16px] font-medium tracking-[-0.02em] text-[#2b3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d5daea]"
              />

              <textarea
                value={manualBrief}
                onChange={(e) => onChangeBrief(e.target.value)}
                placeholder="Describe your business in a few words..."
                rows={5}
                className="w-full resize-none rounded-[18px] border border-[rgba(224,228,238,.98)] bg-white px-5 py-4 text-[16px] font-medium leading-7 tracking-[-0.02em] text-[#2b3447] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d5daea]"
              />
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={!canContinue}
              className="mt-5 inline-flex h-[58px] items-center justify-center gap-3 rounded-[18px] border border-[rgba(221,226,238,.98)] bg-[linear-gradient(180deg,#ffffff_0%,#f6f5fa_100%)] px-6 text-[15px] font-semibold text-[#68739a] shadow-[0_12px_28px_rgba(110,98,144,.08)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <ArrowRight className="h-4.5 w-4.5" />
              Build draft manually
            </button>
          </div>
        </div>
      </CardShell>
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
    <section className="mx-auto w-full max-w-[1280px] px-2 pb-8 pt-4 sm:px-3 lg:pt-6">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/82 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_26px_rgba(77,98,133,.06)]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-7 max-w-[900px] text-[42px] font-semibold leading-[0.98] tracking-[-0.07em] text-[#1f2b42] sm:text-[54px] lg:text-[64px]">
          Build your business draft
        </h1>

        <p className="mx-auto mt-5 max-w-[640px] text-[17px] leading-8 text-[#778094] sm:text-[18px]">
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
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-7 lg:grid-cols-2"
            >
              <SourcesClosedCard onClick={() => setActiveCard("sources")} />
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