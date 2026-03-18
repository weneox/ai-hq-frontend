import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Globe,
  Loader2,
  RefreshCcw,
  ScanSearch,
  Shield,
  Sparkles,
  Wand2,
  Brain,
  Package2,
  BadgeCheck,
} from "lucide-react";

function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  };
}

function statusTone(mode = "", importingWebsite = false) {
  const value = importingWebsite ? "running" : s(mode).toLowerCase();

  if (["success", "completed", "complete", "done"].includes(value)) {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/15",
      bar: "from-emerald-400 via-cyan-400 to-blue-500",
    };
  }

  if (["error", "failed"].includes(value)) {
    return {
      dot: "bg-rose-500",
      text: "text-rose-700",
      chip: "bg-rose-500/10 text-rose-700 border-rose-500/15",
      bar: "from-rose-400 via-orange-400 to-amber-400",
    };
  }

  if (["running", "queued", "processing", "syncing"].includes(value)) {
    return {
      dot: "bg-cyan-500",
      text: "text-cyan-700",
      chip: "bg-cyan-500/10 text-cyan-700 border-cyan-500/15",
      bar: "from-cyan-400 via-sky-400 to-indigo-500",
    };
  }

  return {
    dot: "bg-slate-400",
    text: "text-slate-600",
    chip: "bg-slate-900/5 text-slate-600 border-slate-900/8",
    bar: "from-slate-300 via-slate-400 to-slate-500",
  };
}

function truncateMiddle(value = "", start = 28, end = 16) {
  const text = s(value);
  if (!text || text.length <= start + end + 3) return text;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

function StepBadge({ done, label }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase ${
        done
          ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-700"
          : "border-slate-900/8 bg-white/60 text-slate-500"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${done ? "bg-emerald-500" : "bg-slate-300"}`} />
      {label}
    </div>
  );
}

function MetricLine({ label, value }) {
  return (
    <div className="flex items-end gap-2">
      <div className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">{value}</div>
      <div className="pb-1 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
    </div>
  );
}

function FloatingSignal({ label, value, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`pointer-events-none absolute hidden rounded-[22px] border border-white/70 bg-white/62 px-4 py-3 shadow-[0_22px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:block ${className}`}
    >
      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{value}</div>
    </motion.div>
  );
}

function GhostButton({ children, onClick, icon: Icon, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-slate-950/10 bg-slate-950 text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)]"
          : "border-slate-900/10 bg-white/72 text-slate-700 hover:bg-white"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

function SoftChip({ children }) {
  return (
    <div className="rounded-full border border-slate-900/8 bg-white/72 px-3 py-1.5 text-xs text-slate-600">
      {children}
    </div>
  );
}

function KnowledgeRow({
  item,
  busy,
  onApprove,
  onReject,
}) {
  return (
    <div className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <SoftChip>{item.status || "pending"}</SoftChip>
          <SoftChip>{item.category}</SoftChip>
          {item.confidence ? <SoftChip>{item.confidence}</SoftChip> : null}
          <SoftChip>{item.source}</SoftChip>
        </div>

        <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-slate-950">
          {item.title}
        </div>

        <div className="mt-2 max-w-[840px] text-sm leading-7 text-slate-600">
          {item.value || "Preview yoxdur."}
        </div>

        {item.evidenceUrl ? (
          <div className="mt-3 text-xs text-slate-400">{truncateMiddle(item.evidenceUrl, 52, 26)}</div>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2 lg:flex-col">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="inline-flex min-w-[128px] items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)] disabled:opacity-60"
        >
          {busy ? "Working..." : "Approve"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="inline-flex min-w-[128px] items-center justify-center rounded-full border border-slate-900/10 bg-white/72 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.55),transparent_28%),radial-gradient(circle_at_top_right,rgba(224,231,255,0.62),transparent_34%),radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.92),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef4fb_100%)]" />
      <div className="pointer-events-none absolute inset-x-[12%] top-0 h-[320px] rounded-full bg-white/70 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 top-24 h-[280px] w-[280px] rounded-full bg-cyan-200/35 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 top-12 h-[320px] w-[320px] rounded-full bg-indigo-200/35 blur-[110px]" />
      <div className="pointer-events-none absolute inset-x-0 top-[180px] h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-[55%] h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
    </>
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
  metrics,
  liveSignals,
  discoveryProfileRows,
  knowledgePreview,
  serviceSuggestionTitle,
  studioProgress,
  narrative,
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
  const tone = statusTone(discoveryState.mode, importingWebsite);

  const floatingSlots = [
    "left-[-12px] top-10",
    "right-[-8px] top-4",
    "left-[5%] bottom-10",
    "right-[9%] bottom-12",
    "left-[20%] -bottom-4",
    "right-[20%] -top-3",
  ];

  if (loading) {
    return (
      <div className="relative min-h-[88vh] overflow-hidden">
        <BackgroundGlow />
        <div className="relative mx-auto flex min-h-[88vh] max-w-[1200px] items-center justify-center px-4 py-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/72 px-5 py-3 text-sm text-slate-600 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Setup studio hazırlanır...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundGlow />

      <section className="relative mx-auto max-w-[1220px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          {...fadeUp(0)}
          className="mb-6 flex items-center justify-between gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/68 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.26em] text-slate-500 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
            AI Setup Studio
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/68 px-4 py-2.5 text-sm text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </motion.div>

        <motion.div
          {...fadeUp(0.05)}
          className="relative overflow-hidden rounded-[42px] border border-white/70 bg-white/56 shadow-[0_40px_140px_rgba(15,23,42,0.09)] backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.98),transparent_72%)]" />
          <div className="pointer-events-none absolute inset-x-[12%] top-[160px] h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.18)_100%)]" />

          <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <motion.div {...fadeUp(0.08)} className="mx-auto max-w-[900px] text-center">
              <div className="mx-auto flex max-w-max flex-wrap items-center justify-center gap-2">
                {heroSteps.map((item) => (
                  <StepBadge key={item.key} done={item.done} label={item.label} />
                ))}
              </div>

              <h1 className="mx-auto mt-7 max-w-[920px] text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-7xl">
                Turn your website into a business twin that feels alive.
              </h1>

              <p className="mx-auto mt-5 max-w-[780px] text-base leading-8 text-slate-600 sm:text-lg">
                Website-i ver. Studio identity, service layer, knowledge və operational siqnalları
                çıxarsın. Sən isə sadəcə doğru olanları yönləndir.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.12)} className="relative mx-auto mt-10 max-w-[920px]">
              {liveSignals.slice(0, 6).map((item, index) => (
                <FloatingSignal
                  key={`${item.label}-${index}`}
                  label={item.label}
                  value={item.value}
                  className={floatingSlots[index] || floatingSlots[0]}
                />
              ))}

              <form
                onSubmit={onScanBusiness}
                className="relative overflow-hidden rounded-[34px] border border-slate-900/8 bg-white/72 p-4 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-2xl sm:p-5"
              >
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-slate-950/[0.03] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                    <ScanSearch className="h-3.5 w-3.5" />
                    Studio scan
                  </div>

                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${tone.chip}`}>
                    <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                    {discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-slate-900/8 bg-white/76">
                  <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                    <Globe className="h-5 w-5 shrink-0 text-slate-400" />
                    <input
                      value={discoveryForm.websiteUrl}
                      onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
                      className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>

                  <div className="h-px bg-slate-900/8" />

                  <div className="px-4 py-4 sm:px-5">
                    <textarea
                      value={discoveryForm.note}
                      onChange={(e) => onSetDiscoveryField("note", e.target.value)}
                      className="min-h-[96px] w-full resize-none bg-transparent text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="Qısa fokus qeydini yaz: məsələn əsas fokusumuz Instagram DM automation və lead qualification-dır."
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <SoftChip>Detects services</SoftChip>
                    <SoftChip>Extracts knowledge</SoftChip>
                    <SoftChip>Prepares runtime</SoftChip>
                  </div>

                  <button
                    type="submit"
                    disabled={importingWebsite}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] disabled:opacity-60"
                  >
                    {importingWebsite ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning business
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Scan business
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>

            <motion.div
              {...fadeUp(0.16)}
              className="mx-auto mt-8 max-w-[980px]"
            >
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {metrics.map((item) => (
                  <MetricLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp(0.2)}
              className="mx-auto mt-8 max-w-[1020px] overflow-hidden rounded-[28px] border border-slate-900/8 bg-white/52 px-4 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
                <div className="min-w-0 lg:w-[320px]">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
                    <div className={`text-sm font-medium ${tone.text}`}>
                      {discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
                    </div>
                  </div>

                  <div className="mt-2 text-sm leading-7 text-slate-600">
                    {s(discoveryState.message) || narrative}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>Studio progress</span>
                    <span>{studioProgress}%</span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-900/7">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${tone.bar} shadow-[0_8px_30px_rgba(56,189,248,0.35)]`}
                      style={{ width: `${Math.max(6, Math.min(100, studioProgress))}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <SoftChip>discoveries {Number(discoveryState.candidateCount || 0)}</SoftChip>
                    {s(discoveryState.lastUrl) ? (
                      <SoftChip>{truncateMiddle(discoveryState.lastUrl, 30, 18)}</SoftChip>
                    ) : null}
                    {discoveryState.profileApplied ? <SoftChip>profile draft updated</SoftChip> : null}
                  </div>
                </div>
              </div>
            </motion.div>

            {error ? (
              <motion.div
                {...fadeUp(0.22)}
                className="mx-auto mt-5 max-w-[1020px] rounded-[22px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </motion.div>
            ) : null}

            <motion.div
              {...fadeUp(0.24)}
              className="mx-auto mt-8 max-w-[1020px] flex flex-wrap items-center justify-center gap-3"
            >
              <GhostButton
                onClick={onToggleRefine}
                icon={showRefine ? ChevronUp : ChevronDown}
              >
                {showRefine ? "Hide details" : "Refine details"}
              </GhostButton>

              {knowledgePreview.length ? (
                <GhostButton
                  onClick={onToggleKnowledge}
                  icon={showKnowledge ? ChevronUp : ChevronDown}
                >
                  {showKnowledge ? "Hide discoveries" : "Review discoveries"}
                </GhostButton>
              ) : null}

              <GhostButton onClick={onOpenWorkspace} icon={ArrowRight} active>
                Open workspace
              </GhostButton>
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {showRefine ? (
            <motion.section
              key="refine"
              initial={{ opacity: 0, y: 18, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 overflow-hidden rounded-[36px] border border-white/70 bg-white/58 shadow-[0_30px_100px_rgba(15,23,42,0.06)] backdrop-blur-2xl"
            >
              <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                <div className="p-6 sm:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    <Brain className="h-3.5 w-3.5" />
                    Refine business twin
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    Keep only the essentials editable
                  </h2>

                  <p className="mt-3 max-w-[600px] text-sm leading-7 text-slate-600">
                    Burada böyük onboarding formu yoxdur. Studio nə çıxarıbsa onun ən vacib hissələrini
                    düzəldə bilərsən.
                  </p>

                  <form onSubmit={onSaveBusiness} className="mt-7">
                    <div className="grid gap-4">
                      <input
                        value={businessForm.companyName}
                        onChange={(e) => onSetBusinessField("companyName", e.target.value)}
                        className="rounded-[22px] border border-slate-900/8 bg-white/74 px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="Company name"
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={businessForm.timezone}
                          onChange={(e) => onSetBusinessField("timezone", e.target.value)}
                          className="rounded-[22px] border border-slate-900/8 bg-white/74 px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Timezone"
                        />

                        <select
                          value={businessForm.language}
                          onChange={(e) => onSetBusinessField("language", e.target.value)}
                          className="rounded-[22px] border border-slate-900/8 bg-white/74 px-4 py-3.5 text-slate-900 outline-none"
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
                        className="min-h-[148px] rounded-[22px] border border-slate-900/8 bg-white/74 px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder="Business description"
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={savingBusiness}
                        className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)] disabled:opacity-60"
                      >
                        {savingBusiness ? "Saving..." : "Save business twin"}
                      </button>

                      <GhostButton onClick={onRefresh} icon={RefreshCcw}>
                        Sync from backend
                      </GhostButton>
                    </div>
                  </form>
                </div>

                <div className="border-t border-slate-900/8 p-6 sm:p-8 lg:border-l lg:border-t-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                    <Package2 className="h-3.5 w-3.5" />
                    Service seed
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    Create a tiny service layer seed
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Burada yalnız bir başlanğıc service yarat. Pricing, positioning və refine işini
                    sonradan workspace-də daha rahat edərsən.
                  </p>

                  <div className="mt-7 rounded-[26px] border border-slate-900/8 bg-white/74 p-5">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      Suggested title
                    </div>
                    <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {serviceSuggestionTitle || "Use the focus note above to generate a service seed"}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <SoftChip>current services {services.length}</SoftChip>
                      {serviceSuggestionTitle ? <SoftChip>seed ready</SoftChip> : <SoftChip>awaiting focus note</SoftChip>}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={!!savingServiceSuggestion}
                      onClick={onCreateSuggestedService}
                      className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_60px_rgba(15,23,42,0.16)] disabled:opacity-60"
                    >
                      {savingServiceSuggestion ? "Creating..." : "Create suggested service"}
                    </button>
                  </div>

                  {discoveryProfileRows.length ? (
                    <div className="mt-8">
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        Extracted profile snapshot
                      </div>

                      <div className="mt-4 divide-y divide-slate-900/8 overflow-hidden rounded-[24px] border border-slate-900/8 bg-white/74">
                        {discoveryProfileRows.map(([label, value]) => (
                          <div key={label} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                            <div className="text-sm text-slate-700 sm:max-w-[64%] sm:text-right">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showKnowledge && knowledgePreview.length ? (
            <motion.section
              key="knowledge"
              initial={{ opacity: 0, y: 18, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 overflow-hidden rounded-[36px] border border-white/70 bg-white/58 shadow-[0_30px_100px_rgba(15,23,42,0.06)] backdrop-blur-2xl"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Review discoveries
                    </div>

                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                      Approve only what deserves to enter the twin
                    </h2>

                    <p className="mt-3 max-w-[760px] text-sm leading-7 text-slate-600">
                      Card grid yox. Sadəcə tapılan siqnalların axını. Dəyərli olanları approve et,
                      qalanları çıxart.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/72 px-4 py-2 text-sm text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    Pending {knowledgePreview.length}
                  </div>
                </div>

                <div className="mt-7 divide-y divide-slate-900/8">
                  {knowledgePreview.map((item) => (
                    <KnowledgeRow
                      key={item.id || item.title}
                      item={item}
                      busy={actingKnowledgeId === item.id}
                      onApprove={() => onApproveKnowledge({ id: item.id })}
                      onReject={() => onRejectKnowledge({ id: item.id })}
                    />
                  ))}
                </div>

                {meta.pendingCandidateCount > knowledgePreview.length ? (
                  <div className="mt-4 text-sm text-slate-500">
                    Daha çox discovery var. Qalanlarını da sonra review edə bilərsən.
                  </div>
                ) : null}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>

        <motion.div
          {...fadeUp(0.18)}
          className="mt-8 flex flex-col items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
          >
            Continue to workspace
            <ArrowRight className="h-4 w-4" />
          </button>

          {meta.missingSteps.length ? (
            <div className="text-center text-sm text-slate-500">
              Remaining: {meta.missingSteps.join(" · ")}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" />
              Core onboarding is ready.
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}