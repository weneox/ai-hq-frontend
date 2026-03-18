import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  ChevronRight,
  Clock3,
  Globe,
  Loader2,
  RefreshCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function truncateMiddle(value = "", start = 28, end = 18) {
  const text = s(value);
  if (!text || text.length <= start + end + 3) return text;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

function isSuccessMode(mode = "") {
  return ["success", "completed", "complete", "done"].includes(s(mode).toLowerCase());
}

function pageTone(mode = "", importingWebsite = false) {
  const value = importingWebsite ? "running" : s(mode).toLowerCase();

  if (["error", "failed"].includes(value)) {
    return {
      dot: "bg-rose-500",
      text: "text-rose-700",
      chip: "border-rose-500/15 bg-rose-500/10 text-rose-700",
    };
  }

  if (["running", "queued", "processing", "syncing"].includes(value)) {
    return {
      dot: "bg-cyan-500",
      text: "text-cyan-700",
      chip: "border-cyan-500/15 bg-cyan-500/10 text-cyan-700",
    };
  }

  if (["success", "completed", "complete", "done"].includes(value)) {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      chip: "border-emerald-500/15 bg-emerald-500/10 text-emerald-700",
    };
  }

  return {
    dot: "bg-slate-400",
    text: "text-slate-600",
    chip: "border-slate-900/8 bg-slate-900/5 text-slate-600",
  };
}

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

function TinyLabel({ children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/82 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
      {children}
    </div>
  );
}

function TinyChip({ children }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-900/8 bg-white/80 px-3 py-1.5 text-xs text-slate-600">
      {children}
    </div>
  );
}

function GhostButton({ children, icon: Icon, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-slate-950/10 bg-slate-950 text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
          : "border-slate-900/10 bg-white/80 text-slate-700 hover:bg-white"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function StageShell({
  eyebrow,
  title,
  body,
  children,
  align = "left",
}) {
  return (
    <motion.div
      {...stageMotion()}
      className={`mx-auto w-full max-w-[1120px] ${
        align === "center" ? "text-center" : ""
      }`}
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

function KnowledgeLine({ item, busy, onApprove, onReject }) {
  return (
    <div className="grid gap-4 border-t border-slate-900/8 py-4 md:grid-cols-[28px_minmax(0,1fr)_auto] md:items-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
        {item.index}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <TinyChip>{item.category}</TinyChip>
          {item.confidence ? <TinyChip>{item.confidence}</TinyChip> : null}
          <TinyChip>{item.source}</TinyChip>
        </div>

        <div className="mt-3 text-lg font-semibold tracking-[-0.04em] text-slate-950">
          {item.title}
        </div>

        <div className="mt-1 text-sm leading-7 text-slate-600">
          {item.value || "Preview yoxdur."}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "..." : "Approve"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function RefineModal({
  savingBusiness,
  businessForm,
  discoveryProfileRows,
  onSetBusinessField,
  onSaveBusiness,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
        <div>
          <TinyLabel>
            <Brain className="h-3.5 w-3.5" />
            refine draft
          </TinyLabel>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Edit only the essentials
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-8 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_0.78fr]">
        <form onSubmit={onSaveBusiness} className="space-y-4">
          <input
            value={businessForm.companyName}
            onChange={(e) => onSetBusinessField("companyName", e.target.value)}
            className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Company name"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={businessForm.timezone}
              onChange={(e) => onSetBusinessField("timezone", e.target.value)}
              className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Timezone"
            />

            <select
              value={businessForm.language}
              onChange={(e) => onSetBusinessField("language", e.target.value)}
              className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none"
            >
              <option value="az">Azerbaijani</option>
              <option value="en">English</option>
              <option value="tr">Turkish</option>
              <option value="ru">Russian</option>
            </select>
          </div>

          <textarea
            value={businessForm.description}
            onChange={(e) => onSetBusinessField("description", e.target.value)}
            className="min-h-[156px] w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Business description"
          />

          <button
            type="submit"
            disabled={savingBusiness}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {savingBusiness ? "Saving..." : "Save business twin"}
          </button>
        </form>

        <div>
          <TinyLabel>
            <BadgeCheck className="h-3.5 w-3.5" />
            snapshot
          </TinyLabel>

          <div className="mt-5 divide-y divide-slate-900/8 overflow-hidden rounded-[24px] border border-slate-900/8 bg-white">
            {discoveryProfileRows.length ? (
              discoveryProfileRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </div>
                  <div className="text-sm text-slate-700 sm:max-w-[62%] sm:text-right">
                    {value}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-slate-500">
                Extracted snapshot hələ görünmür.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function IntakeModal({
  knowledgePreview,
  actingKnowledgeId,
  onApproveKnowledge,
  onRejectKnowledge,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/80 bg-white/94 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
        <div>
          <TinyLabel>
            <BadgeCheck className="h-3.5 w-3.5" />
            knowledge intake
          </TinyLabel>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Review what enters the twin
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[62vh] overflow-y-auto px-5 pb-5 sm:px-6">
        {knowledgePreview.map((item, index) => (
          <KnowledgeLine
            key={item.id || item.title}
            item={{ ...item, index: String(index + 1).padStart(2, "0") }}
            busy={actingKnowledgeId === item.id}
            onApprove={() => onApproveKnowledge({ id: item.id })}
            onReject={() => onRejectKnowledge({ id: item.id })}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function SetupStudioScene({
  loading,
  refreshing,
  importingWebsite,
  savingBusiness,
  actingKnowledgeId,
  savingServiceSuggestion,
  showRefine,
  showKnowledge,
  error,
  businessForm,
  discoveryForm,
  discoveryState,
  meta,
  heroSteps,
  discoveryProfileRows,
  knowledgePreview,
  serviceSuggestionTitle,
  studioProgress,
  services,
  onSetBusinessField,
  onSetDiscoveryField,
  onScanBusiness,
  onSaveBusiness,
  onApproveKnowledge,
  onRejectKnowledge,
  onCreateSuggestedService,
  onOpenWorkspace,
  onRefresh,
  onToggleRefine,
  onToggleKnowledge,
  discoveryModeLabel,
}) {
  const tone = pageTone(discoveryState.mode, importingWebsite);

  const scanDone = isSuccessMode(discoveryState.mode) || !!s(discoveryState.lastUrl);
  const hasKnowledge = knowledgePreview.length > 0;

  const stageSequence = useMemo(() => {
    const list = ["identity"];
    if (hasKnowledge) list.push("knowledge");
    list.push("service", "ready");
    return list;
  }, [hasKnowledge]);

  const [stage, setStage] = useState("entry");
  const [scanLineIndex, setScanLineIndex] = useState(0);

  const scanLines = [
    "Reading key pages",
    "Extracting business identity",
    "Collecting knowledge",
    "Detecting service signals",
  ];

  useEffect(() => {
    if (importingWebsite) {
      setStage("scanning");
      return;
    }

    if (scanDone && (stage === "entry" || stage === "scanning")) {
      setStage("identity");
    }
  }, [importingWebsite, scanDone, stage]);

  useEffect(() => {
    if (!importingWebsite) {
      setScanLineIndex(0);
      return;
    }

    const id = window.setInterval(() => {
      setScanLineIndex((prev) => (prev + 1) % scanLines.length);
    }, 1200);

    return () => window.clearInterval(id);
  }, [importingWebsite, scanLines.length]);

  function goNextStage() {
    const idx = stageSequence.indexOf(stage);
    if (idx >= 0 && idx < stageSequence.length - 1) {
      setStage(stageSequence[idx + 1]);
    }
  }

  async function handleCreateServiceAndNext() {
    await onCreateSuggestedService();
    setStage("ready");
  }

  const miniProgress = useMemo(() => {
    const list = [
      { key: "entry", label: "start" },
      { key: "scanning", label: "scan" },
      { key: "identity", label: "identity" },
      { key: "knowledge", label: "knowledge" },
      { key: "service", label: "service" },
      { key: "ready", label: "ready" },
    ];

    const currentIndex = list.findIndex((item) => item.key === stage);

    return list.map((item, index) => ({
      ...item,
      active: index === currentIndex,
      done: index < currentIndex,
    }));
  }, [stage]);

  const currentTitle =
    s(businessForm.companyName) ||
    discoveryProfileRows.find(([label]) => label === "Name")?.[1] ||
    "Business identity";

  const currentDescription =
    s(businessForm.description) ||
    discoveryProfileRows.find(([label]) => label === "Description")?.[1] ||
    "We extracted a first draft of the business direction from the website.";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/82 px-5 py-3 text-sm text-slate-600 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <Loader2 className="h-4 w-4 animate-spin" />
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1320px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <TinyLabel>
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            AI Setup Studio
          </TinyLabel>

          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${tone.chip}`}>
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
              {discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
            </div>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/82 px-4 py-2.5 text-sm text-slate-600"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[36px] border border-white/80 bg-white/44 shadow-[0_40px_140px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-[88px] h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-[16%] top-[50%] h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
          <div className="pointer-events-none absolute left-[10%] top-[18%] h-[180px] w-[180px] rounded-full border border-white/70" />
          <div className="pointer-events-none absolute right-[8%] top-[16%] h-[240px] w-[240px] rounded-full border border-white/70" />

          <div className="relative flex h-full flex-col">
            <div className="px-5 pt-5 sm:px-8 sm:pt-7">
              <div className="flex flex-wrap items-center gap-3">
                {miniProgress.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.done ? "bg-emerald-500" : item.active ? "bg-slate-950" : "bg-slate-300"
                        }`}
                      />
                      <span
                        className={`text-[11px] font-medium uppercase tracking-[0.24em] ${
                          item.active ? "text-slate-700" : item.done ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {item.key !== "ready" ? <div className="h-px w-6 bg-slate-300/80" /> : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center px-5 pb-6 pt-4 sm:px-8 sm:pb-8">
              <AnimatePresence mode="wait">
                {stage === "entry" ? (
                  <StageShell
                    key="entry"
                    eyebrow="first move"
                    title={
                      <>
                        Start with the website.
                        <br />
                        Let the page answer back.
                      </>
                    }
                    body="Tək bir URL yaz. Sonra bu səhifə step-step özü danışacaq: əvvəl scan, sonra identity, sonra knowledge, sonra service."
                  >
                    <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-end">
                      <form onSubmit={onScanBusiness} className="space-y-4">
                        <div className="flex items-center gap-3 border-b border-slate-300/90 pb-4">
                          <Globe className="h-5 w-5 text-slate-400" />
                          <input
                            value={discoveryForm.websiteUrl}
                            onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
                            className="w-full bg-transparent text-2xl font-medium tracking-[-0.04em] text-slate-950 outline-none placeholder:text-slate-400 sm:text-3xl"
                            placeholder="https://yourbusiness.com"
                          />
                        </div>

                        <textarea
                          value={discoveryForm.note}
                          onChange={(e) => onSetDiscoveryField("note", e.target.value)}
                          className="min-h-[76px] w-full resize-none bg-transparent text-sm leading-7 text-slate-600 outline-none placeholder:text-slate-400"
                          placeholder="İstəsən fokus yaz: məsələn əsas istiqamətimiz Instagram DM automation və lead qualification-dır."
                        />

                        {error ? (
                          <div className="rounded-[18px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
                            {error}
                          </div>
                        ) : null}
                      </form>

                      <div className="space-y-4">
                        <div className="space-y-2 text-sm text-slate-500">
                          <div>Detects identity</div>
                          <div>Extracts knowledge</div>
                          <div>Prepares service direction</div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => onScanBusiness(e)}
                          disabled={importingWebsite}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] disabled:opacity-60"
                        >
                          {importingWebsite ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Scanning business
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4" />
                              Begin scan
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </StageShell>
                ) : null}

                {stage === "scanning" ? (
                  <StageShell
                    key="scanning"
                    eyebrow="scanning"
                    title={
                      <>
                        Scanning your website.
                        <br />
                        Extracting the first shape.
                      </>
                    }
                    body="Bu hissə oxunmur, axır. Sistem səhifələri yoxlayır və ilk operational twin qatını hazırlayır."
                  >
                    <div className="mx-auto max-w-[760px]">
                      {s(discoveryState.lastUrl) ? (
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/80 px-4 py-2 text-sm text-slate-600">
                          <Globe className="h-4 w-4" />
                          {truncateMiddle(discoveryState.lastUrl, 34, 20)}
                        </div>
                      ) : null}

                      <div className="space-y-4">
                        {scanLines.map((line, index) => {
                          const active = index === scanLineIndex;
                          const passed = index < scanLineIndex;

                          return (
                            <motion.div
                              key={line}
                              animate={{
                                opacity: active || passed ? 1 : 0.42,
                                x: active ? 12 : 0,
                              }}
                              transition={{ duration: 0.28 }}
                              className="flex items-center gap-4 border-b border-slate-900/8 pb-4"
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  passed ? "bg-emerald-500" : active ? "bg-cyan-500" : "bg-slate-300"
                                }`}
                              />
                              <div
                                className={`text-2xl font-medium tracking-[-0.04em] ${
                                  active || passed ? "text-slate-950" : "text-slate-400"
                                }`}
                              >
                                {line}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </StageShell>
                ) : null}

                {stage === "identity" ? (
                  <StageShell
                    key="identity"
                    eyebrow="identity"
                    title={
                      <>
                        We think your business
                        <br />
                        is this.
                      </>
                    }
                    body="İlk çıxarılan form budur. Düzdürsə davam et. Lazımdırsa dərhal refine et."
                  >
                    <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end">
                      <div>
                        <div className="text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
                          {currentTitle}
                        </div>

                        <div className="mt-4 max-w-[680px] text-lg leading-8 text-slate-600">
                          {currentDescription}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <GhostButton onClick={goNextStage} icon={ChevronRight} active>
                            Looks right
                          </GhostButton>

                          <GhostButton onClick={onToggleRefine} icon={Brain}>
                            Refine it
                          </GhostButton>
                        </div>
                      </div>

                      <div className="border-l border-slate-300/80 pl-6">
                        {discoveryProfileRows.length ? (
                          <div className="space-y-4">
                            {discoveryProfileRows.map(([label, value]) => (
                              <div key={label}>
                                <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                                  {label}
                                </div>
                                <div className="mt-1 text-base text-slate-700">{value}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500">
                            Identity snapshot hələ hazır deyil.
                          </div>
                        )}
                      </div>
                    </div>
                  </StageShell>
                ) : null}

                {stage === "knowledge" ? (
                  <StageShell
                    key="knowledge"
                    eyebrow="knowledge"
                    title={
                      <>
                        Here’s what we found
                        <br />
                        worth remembering.
                      </>
                    }
                    body="Bu hissədə sadəcə faydalı olanları saxlayırsan. Noise içəri girmir."
                  >
                    <div className="mx-auto max-w-[980px]">
                      <div className="space-y-1">
                        {knowledgePreview.slice(0, 3).map((item, index) => (
                          <KnowledgeLine
                            key={item.id || item.title}
                            item={{ ...item, index: String(index + 1).padStart(2, "0") }}
                            busy={actingKnowledgeId === item.id}
                            onApprove={() => onApproveKnowledge({ id: item.id })}
                            onReject={() => onRejectKnowledge({ id: item.id })}
                          />
                        ))}
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <GhostButton onClick={goNextStage} icon={ChevronRight} active>
                          Continue
                        </GhostButton>

                        <GhostButton onClick={onToggleKnowledge} icon={BadgeCheck}>
                          Open full intake
                        </GhostButton>
                      </div>
                    </div>
                  </StageShell>
                ) : null}

                {stage === "service" ? (
                  <StageShell
                    key="service"
                    eyebrow="service"
                    title={
                      <>
                        This is the first service
                        <br />
                        layer we can prepare.
                      </>
                    }
                    body="Burda böyük katalog yoxdu. Sadəcə ilk real seed. Sonra workspace içində dərinləşdirərsən."
                  >
                    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
                      <div>
                        <div className="text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
                          {serviceSuggestionTitle || "Service layer seed"}
                        </div>

                        <div className="mt-4 max-w-[680px] text-lg leading-8 text-slate-600">
                          {meta.serviceCount > 0
                            ? `${meta.serviceCount} service artıq hazır görünür. İstəsən birbaşa ready mərhələsinə keç.`
                            : "Qısa fokus qeydindən service seed yaradıla bilər və sonra refine edilə bilər."}
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                          <GhostButton
                            onClick={handleCreateServiceAndNext}
                            icon={Wand2}
                            active
                          >
                            {savingServiceSuggestion ? "Creating..." : "Create seed"}
                          </GhostButton>

                          <GhostButton onClick={goNextStage} icon={ChevronRight}>
                            Skip for now
                          </GhostButton>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <TinyChip>services {services.length}</TinyChip>
                        <TinyChip>readiness {meta.readinessScore}%</TinyChip>
                        <TinyChip>playbooks {meta.playbookCount}</TinyChip>
                      </div>
                    </div>
                  </StageShell>
                ) : null}

                {stage === "ready" ? (
                  <StageShell
                    key="ready"
                    eyebrow="ready"
                    title={
                      <>
                        Your studio has a
                        <br />
                        working first shape.
                      </>
                    }
                    body="Bu artıq boş setup deyil. İçəri keçmək üçün kifayət qədər forma var."
                    align="center"
                  >
                    <div className="mx-auto max-w-[920px]">
                      <div className="flex flex-wrap items-center justify-center gap-8">
                        <div className="text-center">
                          <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                            {meta.readinessScore}%
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                            readiness
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                            {meta.approvedKnowledgeCount}
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                            approved
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                            {meta.serviceCount}
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                            services
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
                            {studioProgress}%
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
                            progress
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                        <GhostButton onClick={onToggleRefine} icon={Brain}>
                          Refine details
                        </GhostButton>

                        {hasKnowledge ? (
                          <GhostButton onClick={onToggleKnowledge} icon={BadgeCheck}>
                            Review intake
                          </GhostButton>
                        ) : null}

                        <GhostButton onClick={onOpenWorkspace} icon={ArrowRight} active>
                          Open workspace
                        </GhostButton>
                      </div>

                      <div className="mt-8 text-sm text-slate-500">
                        {meta.missingSteps.length
                          ? `Remaining: ${meta.missingSteps.join(" · ")}`
                          : "Core onboarding is ready."}
                      </div>
                    </div>
                  </StageShell>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRefine ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/16 px-4 backdrop-blur-[6px]">
            <RefineModal
              savingBusiness={savingBusiness}
              businessForm={businessForm}
              discoveryProfileRows={discoveryProfileRows}
              onSetBusinessField={onSetBusinessField}
              onSaveBusiness={onSaveBusiness}
              onClose={onToggleRefine}
            />
          </div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showKnowledge ? (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/16 px-4 backdrop-blur-[6px]">
            <IntakeModal
              knowledgePreview={knowledgePreview}
              actingKnowledgeId={actingKnowledgeId}
              onApproveKnowledge={onApproveKnowledge}
              onRejectKnowledge={onRejectKnowledge}
              onClose={onToggleKnowledge}
            />
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}