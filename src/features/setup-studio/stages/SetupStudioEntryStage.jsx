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

function StageBadge({ children, tone = "blue" }) {
  const tones = {
    blue: "text-[#7b94ce]",
    rose: "text-[#9a88bc]",
  };

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border border-[rgba(255,255,255,.92)] bg-white/78 px-3.5 py-1.5",
        "text-[11px] font-semibold uppercase tracking-[0.22em]",
        tones[tone] || tones.blue,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function Surface({ children, tone = "blue", button = false, onClick }) {
  const Comp = button ? motion.button : motion.div;

  const tones = {
    blue:
      "border-[rgba(221,228,241,.92)] bg-[linear-gradient(180deg,rgba(248,251,255,.94),rgba(240,245,251,.94))] shadow-[0_22px_54px_rgba(75,104,154,.06)]",
    rose:
      "border-[rgba(232,225,236,.94)] bg-[linear-gradient(180deg,rgba(252,250,252,.95),rgba(245,240,246,.94))] shadow-[0_22px_54px_rgba(120,101,145,.06)]",
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
        "group relative w-full overflow-hidden rounded-[34px] border text-left",
        tones[tone] || tones.blue,
        button ? "cursor-pointer" : "",
      ].join(" ")}
    >
      <div className="absolute inset-[1px] rounded-[33px] bg-[linear-gradient(180deg,rgba(255,255,255,.48),rgba(255,255,255,.12))]" />
      <div className="relative z-[2] h-full">{children}</div>
    </Comp>
  );
}

function LogoDot({ icon, label, className = "" }) {
  return (
    <div className={["absolute", className].join(" ")}>
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-[-14px] rounded-full bg-white/82 blur-[14px]" />
        <img
          src={icon}
          alt={label}
          className="relative h-12 w-12 object-contain drop-shadow-[0_10px_22px_rgba(44,61,94,.10)]"
        />
        <div className="mt-2 text-[13px] font-medium tracking-[-0.02em] text-[#607088]">
          {label}
        </div>
      </div>
    </div>
  );
}

function SourceScene({ large = false }) {
  return (
    <div
      className={[
        "pointer-events-none relative",
        large ? "h-[320px] w-[440px]" : "h-[250px] w-[360px]",
      ].join(" ")}
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 440 320"
          className="h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sourceLine" x1="40" y1="30" x2="400" y2="270">
              <stop offset="0%" stopColor="rgba(149,177,228,.10)" />
              <stop offset="50%" stopColor="rgba(149,177,228,.42)" />
              <stop offset="100%" stopColor="rgba(149,177,228,.10)" />
            </linearGradient>
            <radialGradient id="draftGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(177,204,248,.24)" />
              <stop offset="100%" stopColor="rgba(177,204,248,0)" />
            </radialGradient>
          </defs>

          <ellipse cx="250" cy="190" rx="120" ry="88" fill="url(#draftGlow)" />

          <path
            d="M108 72 C160 108, 186 126, 226 158"
            stroke="url(#sourceLine)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M334 86 C302 120, 280 132, 236 162"
            stroke="url(#sourceLine)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M138 250 C182 222, 198 210, 230 176"
            stroke="url(#sourceLine)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          <circle cx="230" cy="168" r="3.6" fill="rgba(150,179,229,.7)" />
          <circle cx="108" cy="72" r="2.2" fill="rgba(150,179,229,.34)" />
          <circle cx="334" cy="86" r="2.2" fill="rgba(150,179,229,.34)" />
          <circle cx="138" cy="250" r="2.2" fill="rgba(150,179,229,.34)" />
        </svg>
      </div>

      <div className="absolute left-[208px] top-[142px] flex h-[82px] w-[82px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(212,223,245,.92)] bg-[linear-gradient(180deg,rgba(255,255,255,.92),rgba(241,246,255,.82))] shadow-[0_14px_34px_rgba(76,107,160,.08)]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#8aa0d1]">
          Draft
        </span>
      </div>

      <LogoDot icon={websiteIcon} label="Website" className="left-[68px] top-[34px]" />
      <LogoDot icon={instagramIcon} label="Instagram" className="right-[26px] top-[48px]" />
      <LogoDot icon={linkedinIcon} label="LinkedIn" className="left-[108px] bottom-[8px]" />
    </div>
  );
}

function ManualScene({ large = false }) {
  return (
    <div
      className={[
        "pointer-events-none relative",
        large ? "h-[320px] w-[440px]" : "h-[250px] w-[360px]",
      ].join(" ")}
    >
      <div className="absolute inset-0">
        <div className="absolute right-[10px] top-[34px] text-[96px] font-semibold tracking-[-0.08em] text-[#e5def0]">
          brief
        </div>

        <div className="absolute left-[26px] top-[88px] max-w-[260px]">
          <div className="text-[28px] font-semibold leading-[1.02] tracking-[-0.06em] text-[#8b7ea6]">
            Describe it
            <br />
            in one sentence
          </div>

          <div className="mt-5 flex items-end gap-3">
            <div className="h-[1px] w-[150px] bg-[rgba(174,155,209,.32)]" />
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
              className="h-7 w-[2px] rounded-full bg-[rgba(164,140,203,.72)]"
            />
          </div>
        </div>

        <div className="absolute left-[26px] bottom-[34px] text-[12px] font-medium uppercase tracking-[0.24em] text-[#aa9ac7]">
          words become structure
        </div>
      </div>
    </div>
  );
}

function ClosedFooter({ tone = "blue", text = "" }) {
  const toneClass =
    tone === "rose"
      ? "text-[#9c89bf] border-[rgba(228,221,236,.95)]"
      : "text-[#7e95cd] border-[rgba(221,228,241,.95)]";

  return (
    <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between">
      <div className="text-[13px] font-medium tracking-[0.01em] text-[#7a8599]">
        {text}
      </div>

      <div
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full border bg-white/86",
          "shadow-[0_10px_24px_rgba(52,67,94,.05)] transition duration-200 group-hover:translate-x-0.5",
          toneClass,
        ].join(" ")}
      >
        <ArrowRight className="h-4 w-4" />
      </div>
    </div>
  );
}

function SourceClosedCard({ onClick }) {
  return (
    <Surface tone="blue" button onClick={onClick}>
      <div className="relative min-h-[520px] px-8 pb-24 pt-8 sm:px-10 sm:pt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,.76),transparent_22%),radial-gradient(circle_at_82%_84%,rgba(180,204,244,.12),transparent_28%)]" />

        <div className="relative z-[2] max-w-[330px]">
          <StageBadge tone="blue">Sources</StageBadge>

          <h2 className="mt-6 text-[40px] font-semibold leading-[0.95] tracking-[-0.065em] text-[#213149] sm:text-[50px]">
            Add your business sources
          </h2>

          <p className="mt-5 max-w-[280px] text-[18px] leading-8 text-[#6e7b91]">
            Pull in the strongest signals you already have.
          </p>
        </div>

        <div className="relative z-[2] mt-10 flex justify-end">
          <SourceScene />
        </div>

        <ClosedFooter tone="blue" text="Build from trusted sources first" />
      </div>
    </Surface>
  );
}

function ManualClosedCard({ onClick }) {
  return (
    <Surface tone="rose" button onClick={onClick}>
      <div className="relative min-h-[520px] px-8 pb-24 pt-8 sm:px-10 sm:pt-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_16%,rgba(255,255,255,.72),transparent_24%),radial-gradient(circle_at_16%_86%,rgba(240,226,255,.16),transparent_30%)]" />

        <div className="relative z-[2] max-w-[330px]">
          <StageBadge tone="rose">Manual</StageBadge>

          <h2 className="mt-6 text-[40px] font-semibold leading-[0.95] tracking-[-0.065em] text-[#213149] sm:text-[50px]">
            Describe your business
          </h2>

          <p className="mt-5 max-w-[290px] text-[18px] leading-8 text-[#747c8f]">
            Start from a thought, a sentence, or a short business brief.
          </p>
        </div>

        <div className="relative z-[2] mt-10 flex justify-end">
          <ManualScene />
        </div>

        <ClosedFooter tone="rose" text="Start by writing the first version" />
      </div>
    </Surface>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[rgba(223,228,238,.96)] bg-white/88 px-4 py-2 text-[14px] font-medium text-[#647189] shadow-[0_10px_24px_rgba(48,67,101,.05)] transition hover:-translate-y-0.5"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}

function SourceRow({ icon, name, text }) {
  return (
    <div className="flex items-center gap-4">
      <img
        src={icon}
        alt={name}
        className="h-11 w-11 shrink-0 object-contain drop-shadow-[0_10px_22px_rgba(44,61,94,.10)]"
      />
      <div>
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#263248]">
          {name}
        </div>
        <div className="mt-0.5 text-[14px] leading-6 text-[#728098]">{text}</div>
      </div>
    </div>
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
      className="mx-auto w-full max-w-[1040px]"
    >
      <Surface tone="blue">
        <div className="relative px-7 pb-8 pt-7 sm:px-9 sm:pt-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton onClick={onBack} />
            <StageBadge tone="blue">Sources</StageBadge>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
            <div className="max-w-[540px]">
              <h3 className="text-[38px] font-semibold leading-[0.95] tracking-[-0.065em] text-[#213149] sm:text-[46px]">
                Bring in your real business signals
              </h3>

              <p className="mt-5 text-[17px] leading-8 text-[#6e7b91]">
                Start with the clearest source you already have. Website is the
                best first pass for services, contact details, positioning, and
                business summary.
              </p>

              <div className="mt-8 space-y-5">
                <SourceRow
                  icon={websiteIcon}
                  name="Website"
                  text="Usually the strongest starting source."
                />
                <SourceRow
                  icon={instagramIcon}
                  name="Instagram"
                  text="Useful for tone, brand feel, and social context."
                />
                <SourceRow
                  icon={linkedinIcon}
                  name="LinkedIn"
                  text="Helpful for identity and trust signals."
                />
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="mt-8 inline-flex h-[58px] items-center justify-center gap-3 rounded-full border border-[rgba(216,225,239,.98)] bg-white/90 px-6 text-[15px] font-semibold text-[#5871ac] shadow-[0_14px_30px_rgba(77,107,159,.08)] transition hover:-translate-y-0.5"
              >
                <ArrowRight className="h-4 w-4" />
                Continue with sources
              </button>
            </div>

            <div className="flex justify-center lg:justify-end">
              <SourceScene large />
            </div>
          </div>
        </div>
      </Surface>
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
      className="mx-auto w-full max-w-[1040px]"
    >
      <Surface tone="rose">
        <div className="relative px-7 pb-8 pt-7 sm:px-9 sm:pt-9">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BackButton onClick={onBack} />
            <StageBadge tone="rose">Manual</StageBadge>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.04fr_.96fr] lg:items-center">
            <div className="max-w-[540px]">
              <h3 className="text-[38px] font-semibold leading-[0.95] tracking-[-0.065em] text-[#213149] sm:text-[46px]">
                Describe your business
              </h3>

              <p className="mt-5 text-[17px] leading-8 text-[#747c8f]">
                A short name and a simple description is enough to generate the
                first version.
              </p>

              <div className="mt-8 space-y-4">
                <input
                  value={manualName}
                  onChange={(e) => onChangeName(e.target.value)}
                  placeholder="Business name"
                  className="h-[62px] w-full rounded-[22px] border border-[rgba(225,228,236,.98)] bg-white/92 px-5 text-[16px] font-medium tracking-[-0.02em] text-[#2b3447] outline-none shadow-[0_8px_24px_rgba(83,71,112,.04),inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d4d9e9]"
                />

                <textarea
                  value={manualBrief}
                  onChange={(e) => onChangeBrief(e.target.value)}
                  placeholder="Describe your business in a few words..."
                  rows={6}
                  className="w-full resize-none rounded-[22px] border border-[rgba(225,228,236,.98)] bg-white/92 px-5 py-4 text-[16px] font-medium leading-7 tracking-[-0.02em] text-[#2b3447] outline-none shadow-[0_8px_24px_rgba(83,71,112,.04),inset_0_1px_0_rgba(255,255,255,.95)] placeholder:text-[#9aa3b5] focus:border-[#d4d9e9]"
                />
              </div>

              <button
                type="button"
                onClick={onSubmit}
                disabled={!canContinue}
                className="mt-8 inline-flex h-[58px] items-center justify-center gap-3 rounded-full border border-[rgba(224,226,236,.98)] bg-white/90 px-6 text-[15px] font-semibold text-[#6c7398] shadow-[0_14px_30px_rgba(108,94,140,.07)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <ArrowRight className="h-4 w-4" />
                Build draft manually
              </button>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ManualScene large />
            </div>
          </div>
        </div>
      </Surface>
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
    <section className="mx-auto w-full max-w-[1260px] px-2 pb-8 pt-4 sm:px-3 lg:pt-6">
      <div className="w-full text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white bg-white/82 px-4 py-2 text-[11px] font-semibold tracking-[0.2em] text-[#8096cb] shadow-[0_10px_26px_rgba(77,98,133,.06)]">
          <Sparkles className="h-3.5 w-3.5 fill-current" />
          AI SETUP STUDIO
        </div>

        <h1 className="mx-auto mt-7 max-w-[760px] text-[38px] font-semibold leading-[0.96] tracking-[-0.07em] text-[#1f2b42] sm:text-[50px] lg:text-[58px]">
          Build your business draft
        </h1>

        <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-8 text-[#778094] sm:text-[18px]">
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