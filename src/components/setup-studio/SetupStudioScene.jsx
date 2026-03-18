import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Globe,
  Layers3,
  Loader2,
  Package2,
  RefreshCcw,
  ScanSearch,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

const CUT_EDGE = {
  clipPath: "polygon(26px 0,100% 0,100% 100%,0 100%,0 26px)",
};

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  };
}

function truncateMiddle(value = "", start = 26, end = 16) {
  const text = s(value);
  if (!text || text.length <= start + end + 3) return text;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

function toneForMode(mode = "", importingWebsite = false) {
  const value = importingWebsite ? "running" : s(mode).toLowerCase();

  if (["success", "completed", "complete", "done"].includes(value)) {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      chip: "border-emerald-500/15 bg-emerald-500/10 text-emerald-700",
      accent: "from-emerald-400 via-cyan-400 to-blue-500",
    };
  }

  if (["error", "failed"].includes(value)) {
    return {
      dot: "bg-rose-500",
      text: "text-rose-700",
      chip: "border-rose-500/15 bg-rose-500/10 text-rose-700",
      accent: "from-rose-400 via-orange-400 to-amber-400",
    };
  }

  if (["running", "queued", "processing", "syncing"].includes(value)) {
    return {
      dot: "bg-cyan-500",
      text: "text-cyan-700",
      chip: "border-cyan-500/15 bg-cyan-500/10 text-cyan-700",
      accent: "from-cyan-400 via-sky-400 to-indigo-500",
    };
  }

  return {
    dot: "bg-slate-400",
    text: "text-slate-600",
    chip: "border-slate-900/8 bg-slate-900/5 text-slate-600",
    accent: "from-slate-300 via-slate-400 to-slate-500",
  };
}

function laneTone(status = "idle") {
  if (status === "ready") {
    return {
      chip: "border-emerald-500/15 bg-emerald-500/10 text-emerald-700",
      bar: "from-emerald-400 to-cyan-500",
    };
  }

  if (status === "active") {
    return {
      chip: "border-cyan-500/15 bg-cyan-500/10 text-cyan-700",
      bar: "from-cyan-400 to-indigo-500",
    };
  }

  if (status === "review") {
    return {
      chip: "border-amber-500/15 bg-amber-500/10 text-amber-700",
      bar: "from-amber-400 to-orange-500",
    };
  }

  return {
    chip: "border-slate-900/8 bg-white/70 text-slate-500",
    bar: "from-slate-300 to-slate-400",
  };
}

function SmallTrack({ items = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item, index) => (
        <div key={`${item.key}-${index}`} className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${item.done ? "bg-emerald-500" : "bg-slate-300"}`}
            />
            <span
              className={`text-[11px] font-medium uppercase tracking-[0.24em] ${
                item.done ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
          </div>

          {index < items.length - 1 ? (
            <div className="h-px w-7 bg-slate-300/80" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function QuietButton({ children, onClick, icon: Icon, active = false }) {
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

function TinyChip({ children }) {
  return (
    <div className="rounded-full border border-slate-900/8 bg-white/80 px-3 py-1.5 text-xs text-slate-600">
      {children}
    </div>
  );
}

function SurfaceLabel({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}

function StatusDot({ tone, children }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${tone.chip}`}>
      <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
      {children}
    </div>
  );
}

function RailLane({
  index,
  step,
  title,
  summary,
  metaText,
  count,
  status,
  icon: Icon,
  offsetClass = "",
}) {
  const tone = laneTone(status);

  return (
    <motion.div
      {...fadeIn(0.1 + index * 0.06)}
      className={`relative ${offsetClass}`}
    >
      <div
        style={CUT_EDGE}
        className="relative overflow-hidden border border-slate-900/8 bg-white/72 px-4 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:px-5"
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div className="grid gap-4 lg:grid-cols-[116px_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-400">
              {step}
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-900/8 bg-white text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-[-0.04em] text-slate-950">
              {title}
            </div>
            <div className="mt-1 text-sm leading-7 text-slate-600">
              {summary}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] ${tone.chip}`}>
              {metaText}
            </div>

            {count ? (
              <div className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                {count}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-slate-900/6">
          <div className={`h-full w-[42%] rounded-full bg-gradient-to-r ${tone.bar}`} />
        </div>
      </div>
    </motion.div>
  );
}

function KnowledgeEntry({ item, busy, onApprove, onReject }) {
  return (
    <div className="grid gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <TinyChip>{item.status || "pending"}</TinyChip>
          <TinyChip>{item.category}</TinyChip>
          {item.confidence ? <TinyChip>{item.confidence}</TinyChip> : null}
          <TinyChip>{item.source}</TinyChip>
        </div>

        <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-slate-950">
          {item.title}
        </div>

        <div className="mt-2 text-sm leading-7 text-slate-600">
          {item.value || "Preview yoxdur."}
        </div>

        {item.evidenceUrl ? (
          <div className="mt-3 text-xs text-slate-400">
            {truncateMiddle(item.evidenceUrl, 54, 28)}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2 lg:flex-col">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="inline-flex min-w-[128px] items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] disabled:opacity-60"
        >
          {busy ? "Working..." : "Approve"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="inline-flex min-w-[128px] items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function BackgroundMarks() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-[110px] h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-[8%] top-[280px] h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
      <div className="pointer-events-none absolute left-[6%] top-[21%] h-[180px] w-[180px] rounded-full border border-white/70" />
      <div className="pointer-events-none absolute right-[7%] top-[15%] h-[220px] w-[220px] rounded-full border border-white/70" />
      <div className="pointer-events-none absolute left-[17%] top-[48%] h-px w-[24%] bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
      <div className="pointer-events-none absolute right-[10%] top-[64%] h-px w-[20%] bg-gradient-to-r from-transparent via-slate-300/80 to-transparent" />
      <div className="pointer-events-none absolute left-[49%] top-[30%] h-[260px] w-px bg-gradient-to-b from-transparent via-slate-300/50 to-transparent" />
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
  const overlayOpen = showRefine || showKnowledge;
  const tone = toneForMode(discoveryState.mode, importingWebsite);

  const stepsMap = Object.fromEntries(heroSteps.map((item) => [item.key, item.done]));

  const lanes = [
    {
      key: "business",
      step: "01",
      icon: Brain,
      title: s(businessForm.companyName) || "Business identity",
      summary:
        s(businessForm.description) ||
        "Brand direction, positioning, timezone və language draft burada formalaşır.",
      metaText: stepsMap.businessprofile ? "ready" : "draft",
      count: stepsMap.businessprofile ? null : "—",
      status: importingWebsite ? "active" : stepsMap.businessprofile ? "ready" : "idle",
      offsetClass: "lg:mr-24",
    },
    {
      key: "knowledge",
      step: "02",
      icon: ScrollText,
      title: meta.pendingCandidateCount
        ? `${meta.pendingCandidateCount} pending discovery`
        : meta.approvedKnowledgeCount
          ? `${meta.approvedKnowledgeCount} approved knowledge`
          : "Knowledge intake",
      summary:
        meta.pendingCandidateCount > 0
          ? "Studio review üçün çıxardıqlarını burada toplayır. Dəyərliləri içəri salırsan."
          : "Hələ review növbəsi görünmür. Scan bitəndə axın bura düşəcək.",
      metaText: meta.pendingCandidateCount > 0 ? "review" : stepsMap.knowledge ? "ready" : "waiting",
      count: meta.pendingCandidateCount > 0 ? String(meta.pendingCandidateCount) : null,
      status: importingWebsite ? "active" : meta.pendingCandidateCount > 0 ? "review" : stepsMap.knowledge ? "ready" : "idle",
      offsetClass: "lg:ml-10 lg:mr-12",
    },
    {
      key: "services",
      step: "03",
      icon: BriefcaseBusiness,
      title:
        meta.serviceCount > 0
          ? `${meta.serviceCount} service live`
          : serviceSuggestionTitle || "Service layer seed",
      summary:
        meta.serviceCount > 0
          ? "Service skeleti hazırdır. Pricing və packaging sonra dərinləşdirilə bilər."
          : "Qısa fokus qeydindən service seed yaradılıb sonradan refine edilə bilər.",
      metaText: meta.serviceCount > 0 ? "live" : "seed",
      count: meta.serviceCount > 0 ? String(meta.serviceCount) : null,
      status: meta.serviceCount > 0 ? "ready" : importingWebsite ? "active" : "idle",
      offsetClass: "lg:ml-24 lg:mr-6",
    },
    {
      key: "playbooks",
      step: "04",
      icon: Layers3,
      title: meta.playbookCount > 0 ? `${meta.playbookCount} playbook detected` : "Playbook assembly",
      summary:
        meta.playbookCount > 0
          ? "Operational flows artıq görünür."
          : "Conversation flows və operational logic bu mərhələdə formalaşacaq.",
      metaText: meta.playbookCount > 0 ? "ready" : "pending",
      count: meta.playbookCount > 0 ? String(meta.playbookCount) : null,
      status: meta.playbookCount > 0 ? "ready" : "idle",
      offsetClass: "lg:ml-12 lg:mr-20",
    },
    {
      key: "policies",
      step: "05",
      icon: ShieldCheck,
      title: stepsMap.policies ? "Policy layer aligned" : "Policy layer pending",
      summary:
        stepsMap.policies
          ? "Tone, rules və guardrails artıq daxil olunub."
          : "Launch-dan əvvəl policy və rules hissəsi də buradan tamamlanacaq.",
      metaText: stepsMap.policies ? "ready" : "pending",
      count: null,
      status: stepsMap.policies ? "ready" : "idle",
      offsetClass: "lg:ml-28",
    },
  ];

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7fafc_0%,#edf3f8_100%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-[1320px] items-center justify-center px-4 py-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/80 px-5 py-3 text-sm text-slate-600 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Setup studio hazırlanır...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.div
          {...fadeIn(0)}
          className="mb-6 flex items-center justify-between gap-4"
        >
          <SurfaceLabel icon={Sparkles}>AI Setup Studio</SurfaceLabel>

          <div className="flex items-center gap-3">
            <StatusDot tone={tone}>
              {discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
            </StatusDot>

            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/80 px-4 py-2.5 text-sm text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </motion.div>

        <div className="relative overflow-hidden rounded-[44px] border border-white/80 bg-white/52 shadow-[0_42px_140px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <BackgroundMarks />

          <motion.div
            animate={
              overlayOpen
                ? { scale: 0.985, y: -10, opacity: 0.5 }
                : { scale: 1, y: 0, opacity: 1 }
            }
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className={overlayOpen ? "pointer-events-none" : ""}
          >
            <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
              <div className="grid gap-10 lg:grid-cols-[1.18fr_0.82fr]">
                <motion.div {...fadeIn(0.04)}>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
                    Studio orchestration
                  </div>

                  <h1 className="mt-5 max-w-[780px] text-5xl font-semibold leading-[0.92] tracking-[-0.08em] text-slate-950 sm:text-6xl lg:text-7xl xl:text-[88px]">
                    Give it a website.
                    <br />
                    <span className="text-slate-400">Watch the studio</span>
                    <br />
                    assemble itself.
                  </h1>

                  <p className="mt-6 max-w-[580px] text-base leading-8 text-slate-600 sm:text-lg">
                    {narrative ||
                      "Website daxil et. Sistem identity, service layer, knowledge və operational rules istiqamətini özü qursun."}
                  </p>

                  <div className="mt-8">
                    <SmallTrack items={heroSteps} />
                  </div>
                </motion.div>

                <motion.div {...fadeIn(0.08)} className="lg:pl-10">
                  <div className="border-l border-slate-300/80 pl-6">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
                      Studio state
                    </div>

                    <div className="mt-6 flex items-start justify-between gap-5">
                      <div>
                        <div className="text-[72px] font-semibold leading-none tracking-[-0.08em] text-slate-950 sm:text-[92px]">
                          {meta.readinessScore}%
                        </div>
                        <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                          readiness
                        </div>
                      </div>

                      <div className="mt-2 h-24 w-24 rounded-full border border-slate-200 bg-white/70 p-2">
                        <div className="grid h-full place-items-center rounded-full border border-slate-200 bg-white text-center text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                          <div>
                            <div className="text-xl font-semibold tracking-[-0.04em] text-slate-900">
                              {studioProgress}%
                            </div>
                            progress
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-slate-600">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          pending
                        </div>
                        <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                          {meta.pendingCandidateCount}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          approved
                        </div>
                        <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                          {meta.approvedKnowledgeCount}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          services
                        </div>
                        <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                          {meta.serviceCount}
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          playbooks
                        </div>
                        <div className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
                          {meta.playbookCount}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 rounded-[22px] border border-slate-900/8 bg-white/72 px-4 py-4 text-sm leading-7 text-slate-600">
                      {s(discoveryState.message) || "Studio hazırdır. Scan başlayanda axın burada canlı dəyişəcək."}
                    </div>

                    {s(discoveryState.lastUrl) ? (
                      <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {truncateMiddle(discoveryState.lastUrl, 28, 18)}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </div>

              <motion.form
                {...fadeIn(0.12)}
                onSubmit={onScanBusiness}
                className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
              >
                <div
                  style={CUT_EDGE}
                  className="relative overflow-hidden border border-slate-900/8 bg-white/76 p-5 shadow-[0_22px_80px_rgba(15,23,42,0.06)]"
                >
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                  <SurfaceLabel icon={Globe}>Website input</SurfaceLabel>

                  <div className="mt-5 flex items-center gap-3 border-b border-slate-200/90 pb-4">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-900/8 bg-white text-slate-500">
                      <Globe className="h-5 w-5" />
                    </div>

                    <input
                      value={discoveryForm.websiteUrl}
                      onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
                      className="w-full bg-transparent text-[20px] font-medium tracking-[-0.03em] text-slate-950 outline-none placeholder:text-slate-400 sm:text-[24px]"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>

                  <div className="mt-4">
                    <textarea
                      value={discoveryForm.note}
                      onChange={(e) => onSetDiscoveryField("note", e.target.value)}
                      className="min-h-[96px] w-full resize-none bg-transparent text-sm leading-7 text-slate-600 outline-none placeholder:text-slate-400"
                      placeholder="Fokusunu yaz: məsələn əsas istiqamətimiz Instagram DM automation və lead qualification-dır."
                    />
                  </div>
                </div>

                <div
                  style={CUT_EDGE}
                  className="relative overflow-hidden border border-slate-900/8 bg-slate-950 px-5 py-5 text-white shadow-[0_28px_90px_rgba(15,23,42,0.18)]"
                >
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                  <SurfaceLabel icon={ScanSearch}>Command</SurfaceLabel>

                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-[0.26em] text-white/45">
                      status
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 text-sm text-white/70">
                    <div>Detects service directions</div>
                    <div>Extracts knowledge candidates</div>
                    <div>Prepares runtime signals</div>
                  </div>

                  <button
                    type="submit"
                    disabled={importingWebsite}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-medium text-slate-950 shadow-[0_18px_50px_rgba(255,255,255,0.12)] disabled:opacity-60"
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
              </motion.form>

              {error ? (
                <motion.div
                  {...fadeIn(0.15)}
                  className="mt-5 rounded-[20px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700"
                >
                  {error}
                </motion.div>
              ) : null}

              <div className="relative mt-12">
                <div className="pointer-events-none absolute left-[4%] right-[4%] top-[26px] hidden h-px bg-gradient-to-r from-transparent via-slate-300/90 to-transparent lg:block" />

                <div className="space-y-4">
                  {lanes.map((lane, index) => (
                    <RailLane key={lane.key} index={index} {...lane} />
                  ))}
                </div>
              </div>

              <motion.div
                {...fadeIn(0.2)}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <QuietButton
                  onClick={onToggleRefine}
                  icon={showRefine ? ChevronUp : ChevronDown}
                >
                  {showRefine ? "Hide refine" : "Refine draft"}
                </QuietButton>

                {knowledgePreview.length ? (
                  <QuietButton
                    onClick={onToggleKnowledge}
                    icon={showKnowledge ? ChevronUp : ChevronDown}
                  >
                    {showKnowledge ? "Hide intake" : "Review intake"}
                  </QuietButton>
                ) : null}

                <QuietButton onClick={onOpenWorkspace} icon={ArrowRight} active>
                  Enter workspace
                </QuietButton>

                <div className="ml-auto text-sm text-slate-500">
                  {meta.missingSteps.length
                    ? `Remaining: ${meta.missingSteps.join(" · ")}`
                    : "Core onboarding is ready."}
                </div>
              </motion.div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showRefine ? (
              <motion.aside
                key="refine-panel"
                initial={{ x: 560, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 560, opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-y-0 right-0 z-30 w-full border-l border-slate-900/8 bg-white/90 shadow-[-30px_0_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:w-[520px]"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
                    <div>
                      <SurfaceLabel icon={Brain}>Refine draft</SurfaceLabel>
                      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                        Shape the twin, don’t fill a form
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={onToggleRefine}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    <form onSubmit={onSaveBusiness}>
                      <div className="grid gap-4">
                        <input
                          value={businessForm.companyName}
                          onChange={(e) => onSetBusinessField("companyName", e.target.value)}
                          className="rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Company name"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                          <input
                            value={businessForm.timezone}
                            onChange={(e) => onSetBusinessField("timezone", e.target.value)}
                            className="rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                            placeholder="Timezone"
                          />

                          <select
                            value={businessForm.language}
                            onChange={(e) => onSetBusinessField("language", e.target.value)}
                            className="rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none"
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
                          className="min-h-[150px] rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Business description"
                        />
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={savingBusiness}
                          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] disabled:opacity-60"
                        >
                          {savingBusiness ? "Saving..." : "Save business twin"}
                        </button>

                        <QuietButton onClick={onRefresh} icon={RefreshCcw}>
                          Sync backend
                        </QuietButton>
                      </div>
                    </form>

                    <div className="mt-10 border-t border-slate-900/8 pt-8">
                      <SurfaceLabel icon={Package2}>Service seed</SurfaceLabel>

                      <div className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                        {serviceSuggestionTitle || "Use the focus note to generate a service seed"}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <TinyChip>services {services.length}</TinyChip>
                        {serviceSuggestionTitle ? <TinyChip>seed ready</TinyChip> : <TinyChip>awaiting note</TinyChip>}
                      </div>

                      <button
                        type="button"
                        disabled={!!savingServiceSuggestion}
                        onClick={onCreateSuggestedService}
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] disabled:opacity-60"
                      >
                        {savingServiceSuggestion ? "Creating..." : "Create suggested service"}
                      </button>
                    </div>

                    {discoveryProfileRows.length ? (
                      <div className="mt-10 border-t border-slate-900/8 pt-8">
                        <SurfaceLabel icon={BadgeCheck}>Extracted snapshot</SurfaceLabel>

                        <div className="mt-5 divide-y divide-slate-900/8 overflow-hidden rounded-[24px] border border-slate-900/8 bg-white">
                          {discoveryProfileRows.map(([label, value]) => (
                            <div
                              key={label}
                              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                {label}
                              </div>
                              <div className="text-sm text-slate-700 sm:max-w-[64%] sm:text-right">
                                {value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {showKnowledge && knowledgePreview.length ? (
              <motion.div
                key="knowledge-sheet"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 z-40 h-[72vh] border-t border-slate-900/8 bg-white/94 shadow-[0_-24px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
                    <div>
                      <SurfaceLabel icon={BadgeCheck}>Knowledge intake</SurfaceLabel>
                      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                        Review what deserves to enter the twin
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={onToggleKnowledge}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white px-4 py-2 text-sm text-slate-600">
                      <Clock3 className="h-4 w-4" />
                      Pending {knowledgePreview.length}
                    </div>

                    <div className="text-sm text-slate-500">
                      Approve useful items, reject noise.
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
                    <div className="divide-y divide-slate-900/8">
                      {knowledgePreview.map((item) => (
                        <KnowledgeEntry
                          key={item.id || item.title}
                          item={item}
                          busy={actingKnowledgeId === item.id}
                          onApprove={() => onApproveKnowledge({ id: item.id })}
                          onReject={() => onRejectKnowledge({ id: item.id })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.div
          {...fadeIn(0.24)}
          className="mx-auto mt-8 flex max-w-[1380px] items-center justify-center"
        >
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
          >
            Continue to workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <motion.div
          {...fadeIn(0.26)}
          className="mt-5 flex items-center justify-center"
        >
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