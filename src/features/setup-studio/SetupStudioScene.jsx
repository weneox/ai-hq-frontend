import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { isSuccessMode, s, arr, obj } from "./lib/setupStudioHelpers.js";
import SetupStudioRefineModal from "./components/SetupStudioRefineModal.jsx";
import SetupStudioIntakeModal from "./components/SetupStudioIntakeModal.jsx";
import SetupStudioEntryStage from "./stages/SetupStudioEntryStage.jsx";
import SetupStudioScanningStage from "./stages/SetupStudioScanningStage.jsx";
import SetupStudioIdentityStage from "./stages/SetupStudioIdentityStage.jsx";
import SetupStudioKnowledgeStage from "./stages/SetupStudioKnowledgeStage.jsx";
import SetupStudioServiceStage from "./stages/SetupStudioServiceStage.jsx";
import SetupStudioReadyStage from "./stages/SetupStudioReadyStage.jsx";
import { discoveryModeLabel as defaultDiscoveryModeLabel } from "./lib/setupStudioHelpers.js";

const STEP_LABELS = {
  entry: "Source",
  identity: "Identity",
  knowledge: "Knowledge",
  service: "Service",
  ready: "Launch",
};

const overlayTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

function n(value, fallback = 0) {
  const x = Number(value);
  return Number.isFinite(x) ? x : fallback;
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const x = s(value);
    if (x) return x;
  }
  return "";
}

function truncateText(value = "", max = 120) {
  const x = s(value);
  if (!x) return "";
  if (x.length <= max) return x;
  return `${x.slice(0, max - 1)}…`;
}

function findProfileRowValue(rows = [], wantedKeys = []) {
  const normalizedWanted = arr(wantedKeys).map((x) => s(x).toLowerCase());

  const match = arr(rows).find(([label]) =>
    normalizedWanted.includes(s(label).toLowerCase())
  );

  return s(match?.[1]);
}

function hasMeaningfulReviewDraft(reviewDraft = {}) {
  const rd = obj(reviewDraft);
  const draft = obj(
    rd.draft ||
      rd.reviewDraft ||
      rd.review_draft ||
      rd.currentDraft ||
      rd.current_draft
  );
  const session = obj(rd.session || rd.reviewSession || rd.review_session);
  const stats = obj(rd.stats);
  const sources = arr(rd.sources || draft.sources);
  const events = arr(rd.events || draft.events);
  const queue = arr(
    rd.reviewQueue ||
      rd.review_queue ||
      rd.queue ||
      rd.candidates ||
      draft.reviewQueue ||
      draft.review_queue ||
      draft.candidates
  );

  const textSignals = [
    session.id,
    session.reviewSessionId,
    session.review_session_id,
    rd.reviewSessionId,
    rd.review_session_id,
    draft.companyName,
    draft.businessName,
    draft.name,
    draft.title,
    draft.companyTitle,
    draft.description,
    draft.summary,
    draft.companySummaryShort,
    draft.companySummaryLong,
    draft.aboutSection,
  ]
    .map((x) => s(x))
    .filter(Boolean);

  return (
    textSignals.length > 0 ||
    sources.length > 0 ||
    events.length > 0 ||
    queue.length > 0 ||
    Number(stats.pendingReviewCount || stats.pending_review_count || 0) > 0
  );
}

function hasMeaningfulIdentityData({
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  meta,
  businessForm,
}) {
  const m = obj(meta);
  const bf = obj(businessForm);

  return !!(
    s(currentTitle) ||
    s(currentDescription) ||
    arr(discoveryProfileRows).length > 0 ||
    s(m.companyName) ||
    s(m.companySummaryShort) ||
    s(m.companySummaryLong) ||
    s(m.description) ||
    s(bf.companyName) ||
    s(bf.description) ||
    s(bf.websiteUrl) ||
    s(bf.primaryPhone) ||
    s(bf.primaryEmail) ||
    s(bf.primaryAddress)
  );
}

function buildRecoveredStage({
  importingWebsite,
  studioProgress,
  hasIdentityData,
  hasReviewPayload,
  hasVisibleResults,
  hasKnowledge,
  hasServices,
  hasScannedUrl,
  stayOnSourceStage,
}) {
  if (importingWebsite) return "scanning";

  if (studioProgress?.setupCompleted) {
    return "ready";
  }

  const hasAnyResultFlow = !!(
    hasVisibleResults ||
    hasIdentityData ||
    hasReviewPayload ||
    hasKnowledge ||
    hasServices ||
    hasScannedUrl
  );

  if (!hasAnyResultFlow) {
    return "entry";
  }

  if (stayOnSourceStage) {
    return "entry";
  }

  return "identity";
}

function buildStatusLabel({
  importingWebsite,
  discoveryState,
  discoveryModeLabel,
}) {
  if (importingWebsite) return "Analyzing";

  if (arr(discoveryState?.warnings).length > 0) {
    return "Review needed";
  }

  if (discoveryState?.shouldReview) {
    return "Needs review";
  }

  return discoveryModeLabel(discoveryState?.mode);
}

function SetupStudioModalLayer({
  open,
  zIndexClass = "z-[140]",
  backdropClass = "bg-slate-950/45 backdrop-blur-md",
  children,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className={`fixed inset-0 ${zIndexClass} isolate`}
        >
          <div className={`absolute inset-0 ${backdropClass}`} />
          <div className="relative z-[1] h-full w-full overflow-y-auto overscroll-contain">
            <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.985 }}
                transition={overlayTransition}
                className="w-full max-w-[1380px]"
              >
                {children}
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
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
  reviewDraft,
  manualSections,
  meta,
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  knowledgePreview,
  knowledgeItems,
  serviceSuggestionTitle,
  studioProgress,
  services,
  reviewSources = [],
  reviewEvents = [],
  hasVisibleResults = false,
  visibleKnowledgeCount = 0,
  visibleServiceCount = 0,
  onSetBusinessField,
  onSetManualSection,
  onSetDiscoveryField,
  onScanBusiness,
  onSaveBusiness,
  onApproveKnowledge,
  onRejectKnowledge,
  onCreateSuggestedService,
  onOpenWorkspace,
  onReloadReviewDraft,
  onRefresh,
  onToggleRefine,
  onToggleKnowledge,
  discoveryModeLabel = defaultDiscoveryModeLabel,
}) {
  const navigate = useNavigate();

  const safeKnowledgePreview = arr(knowledgePreview);
  const safeKnowledgeItems = arr(knowledgeItems);
  const safeServices = arr(services);
  const safeDiscoveryProfileRows = arr(discoveryProfileRows);
  const safeWarnings = arr(discoveryState?.warnings).filter(Boolean);
  const safeReviewSources = arr(reviewSources);
  const safeReviewEvents = arr(reviewEvents);

  const scanSucceeded = isSuccessMode(discoveryState?.mode);
  const hasScannedUrl = !!s(
    discoveryState?.lastUrl ||
      discoveryState?.last_url ||
      discoveryState?.url ||
      discoveryState?.sourceUrl ||
      discoveryState?.source_url
  );

  const draftQueue = arr(
    reviewDraft?.reviewQueue || reviewDraft?.review_queue
  );

  const intakeItems =
    safeKnowledgeItems.length > 0
      ? safeKnowledgeItems
      : draftQueue.length > 0
        ? draftQueue
        : safeKnowledgePreview;

  const stageKnowledgeItems =
    safeKnowledgeItems.length > 0 ? safeKnowledgeItems : intakeItems;

  const hasKnowledge =
    safeKnowledgeItems.length > 0 ||
    draftQueue.length > 0 ||
    safeKnowledgePreview.length > 0 ||
    n(visibleKnowledgeCount) > 0;

  const hasServices =
    safeServices.length > 0 || n(visibleServiceCount) > 0;

  const hasReviewPayload = hasMeaningfulReviewDraft(reviewDraft);

  const hasIdentityData = hasMeaningfulIdentityData({
    currentTitle,
    currentDescription,
    discoveryProfileRows: safeDiscoveryProfileRows,
    meta,
    businessForm,
  });

  const progressSteps = useMemo(() => {
    const list = ["entry", "identity"];
    if (hasKnowledge) list.push("knowledge");
    list.push("service", "ready");
    return list;
  }, [hasKnowledge]);

  const stageSequence = useMemo(() => {
    const list = ["identity"];
    if (hasKnowledge) list.push("knowledge");
    list.push("service", "ready");
    return list;
  }, [hasKnowledge]);

  const [stayOnSourceStage, setStayOnSourceStage] = useState(true);

  const recoveredStage = useMemo(
    () =>
      buildRecoveredStage({
        importingWebsite,
        studioProgress,
        hasIdentityData,
        hasReviewPayload,
        hasVisibleResults,
        hasKnowledge,
        hasServices,
        hasScannedUrl,
        stayOnSourceStage,
      }),
    [
      importingWebsite,
      studioProgress,
      hasIdentityData,
      hasReviewPayload,
      hasVisibleResults,
      hasKnowledge,
      hasServices,
      hasScannedUrl,
      stayOnSourceStage,
    ]
  );

  const [stage, setStage] = useState(recoveredStage);
  const [scanLineIndex, setScanLineIndex] = useState(0);
  const [overlayIntent, setOverlayIntent] = useState("");

  const scanLines = [
    "Reading the primary source",
    "Extracting business identity",
    "Collecting knowledge signals",
    "Detecting service structure",
  ];

  const refineContentAvailable =
    safeDiscoveryProfileRows.length > 0 ||
    !!s(currentTitle) ||
    !!s(currentDescription) ||
    !!s(businessForm?.companyName) ||
    !!s(businessForm?.description) ||
    !!s(businessForm?.websiteUrl) ||
    !!s(businessForm?.primaryPhone) ||
    !!s(businessForm?.primaryEmail) ||
    !!s(businessForm?.primaryAddress);

  const knowledgeContentAvailable = intakeItems.length > 0;

  const wantsRefineOverlay = overlayIntent === "refine";
  const wantsKnowledgeOverlay = overlayIntent === "knowledge";

  const hasRefineModalContent =
    wantsRefineOverlay && refineContentAvailable;

  const hasKnowledgeModalContent =
    wantsKnowledgeOverlay && knowledgeContentAvailable;

  const activeOverlay = hasKnowledgeModalContent
    ? "knowledge"
    : hasRefineModalContent
      ? "refine"
      : "";

  const hasOverlay = !!activeOverlay;

  useEffect(() => {
    if (!hasOverlay) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.paddingRight = "";
      return;
    }

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.paddingRight = "";
    };
  }, [hasOverlay]);

  useEffect(() => {
    if (importingWebsite) {
      if (stage !== "scanning") setStage("scanning");
      return;
    }

    if (stage === "entry" || stage === "scanning") {
      if (stage !== recoveredStage) setStage(recoveredStage);
      return;
    }

    if (recoveredStage === "ready" && stage !== "ready") {
      setStage("ready");
    }
  }, [importingWebsite, recoveredStage, stage]);

  useEffect(() => {
    if (!importingWebsite) {
      setScanLineIndex(0);
      return;
    }

    const id = window.setInterval(() => {
      setScanLineIndex((prev) => (prev + 1) % scanLines.length);
    }, 1200);

    return () => window.clearInterval(id);
  }, [importingWebsite]);

  useEffect(() => {
    if (importingWebsite || stage === "scanning") {
      setOverlayIntent("");
    }
  }, [importingWebsite, stage]);

  useEffect(() => {
    if (overlayIntent === "knowledge" && !knowledgeContentAvailable) {
      setOverlayIntent("");
    }
  }, [overlayIntent, knowledgeContentAvailable]);

  useEffect(() => {
    if (overlayIntent === "refine" && !refineContentAvailable) {
      setOverlayIntent("");
    }
  }, [overlayIntent, refineContentAvailable]);

  function goNextStage() {
    setStayOnSourceStage(false);
    const idx = stageSequence.indexOf(stage);
    if (idx >= 0 && idx < stageSequence.length - 1) {
      setStage(stageSequence[idx + 1]);
    }
  }

  async function handleCreateServiceAndNext() {
    setStayOnSourceStage(false);
    const result = await onCreateSuggestedService?.();
    const failed = result?.ok === false || result?.error || result?.reason;

    if (!failed) {
      setStage("ready");
    }
  }

  function handleOpenWorkspace() {
    if (typeof onOpenWorkspace === "function") {
      onOpenWorkspace();
      return;
    }

    const target =
      s(studioProgress?.nextRoute) ||
      s(studioProgress?.progress?.nextRoute) ||
      "/";
    navigate(target, { replace: true });
  }

  function handleOpenRefine() {
    if (!refineContentAvailable) return;
    setOverlayIntent("refine");
    if (!showRefine && typeof onToggleRefine === "function") {
      onToggleRefine();
    }
  }

  function handleCloseRefine() {
    setOverlayIntent("");
    if (showRefine && typeof onToggleRefine === "function") {
      onToggleRefine();
    }
  }

  function handleOpenKnowledge() {
    if (!knowledgeContentAvailable) return;
    setOverlayIntent("knowledge");
    if (!showKnowledge && typeof onToggleKnowledge === "function") {
      onToggleKnowledge();
    }
  }

  function handleCloseKnowledge() {
    setOverlayIntent("");
    if (showKnowledge && typeof onToggleKnowledge === "function") {
      onToggleKnowledge();
    }
  }

  function handleGoToSourceStage() {
    setOverlayIntent("");
    setStayOnSourceStage(true);
    setStage("entry");
  }

  function handleContinueFlow() {
    setOverlayIntent("");
    setStayOnSourceStage(false);
    setStage("identity");
  }

  const discoveredTitle =
    findProfileRowValue(safeDiscoveryProfileRows, [
      "name",
      "business name",
      "company name",
      "title",
    ]) || s(meta?.companyName);

  const discoveredDescription =
    findProfileRowValue(safeDiscoveryProfileRows, [
      "description",
      "summary",
      "about",
      "business description",
    ]) || s(meta?.companySummaryShort || meta?.description);

  const resolvedCurrentTitle =
    s(currentTitle) ||
    s(businessForm?.companyName) ||
    discoveredTitle ||
    "Business identity";

  const resolvedCurrentDescription =
    s(currentDescription) ||
    s(businessForm?.description) ||
    discoveredDescription ||
    "We extracted a first draft of the business direction from the source signals.";

  const progressCurrentStage = importingWebsite
    ? "identity"
    : stage === "scanning"
      ? "identity"
      : stage;

  const progressCurrentIndex = Math.max(
    0,
    progressSteps.indexOf(progressCurrentStage)
  );

  const isEntryStage = stage === "entry";

  const statusLabel = buildStatusLabel({
    importingWebsite,
    discoveryState,
    discoveryModeLabel,
  });

  const sourceLabel = s(
    discoveryState?.sourceLabel ||
      discoveryState?.source_label ||
      (s(discoveryState?.lastSourceType || discoveryState?.last_source_type) === "google_maps"
        ? "Google Maps"
        : s(discoveryState?.lastSourceType || discoveryState?.last_source_type) === "website"
          ? "Website"
          : "")
  );

  const primarySourceUrl = s(
    discoveryState?.lastUrl ||
      discoveryState?.last_url ||
      discoveryState?.url ||
      discoveryState?.sourceUrl ||
      discoveryState?.source_url
  );

  const stageMeta = obj(meta);
  const stageWarnings = safeWarnings;
  const nextStudioStage = s(
    stageMeta?.nextStudioStage || studioProgress?.nextStudioStage || ""
  );

  const reviewStatusLabel = firstNonEmpty(
    discoveryState?.reviewSessionStatus,
    reviewDraft?.session?.status,
    reviewDraft?.status
  );

  const resultKnowledgeCount = Math.max(
    n(visibleKnowledgeCount),
    safeKnowledgeItems.length,
    safeKnowledgePreview.length
  );

  const resultServiceCount = Math.max(
    n(visibleServiceCount),
    safeServices.length
  );

  const resultSourceCount = safeReviewSources.length + (primarySourceUrl ? 1 : 0);
  const resultEventCount = safeReviewEvents.length;

  const firstReviewSource = obj(safeReviewSources[0]);
  const firstEvent = obj(safeReviewEvents[0]);

  const summaryVisible = !!(
    primarySourceUrl ||
    sourceLabel ||
    hasVisibleResults ||
    resultKnowledgeCount > 0 ||
    resultServiceCount > 0 ||
    resultSourceCount > 0 ||
    resultEventCount > 0 ||
    safeWarnings.length > 0 ||
    s(discoveryState?.message)
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center px-6">
        <div className="rounded-full border border-slate-200 bg-white/90 px-5 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`setup-studio-scene h-screen overflow-hidden ${
        hasOverlay ? "is-overlay-open" : ""
      }`}
      data-stage={stage}
      data-recovered-stage={recoveredStage}
      data-scan-url={hasScannedUrl ? "yes" : "no"}
      data-scan-succeeded={scanSucceeded ? "yes" : "no"}
      data-has-identity={hasIdentityData ? "yes" : "no"}
      data-has-review={hasReviewPayload ? "yes" : "no"}
      data-has-knowledge={hasKnowledge ? "yes" : "no"}
      data-has-services={hasServices ? "yes" : "no"}
      data-overlay-intent={overlayIntent || "none"}
      data-overlay-open={hasOverlay ? "yes" : "no"}
      data-visible-results={hasVisibleResults ? "yes" : "no"}
      data-stay-on-source-stage={stayOnSourceStage ? "yes" : "no"}
    >
      <div
        aria-hidden={hasOverlay ? "true" : "false"}
        className={`flex h-full flex-col transition-[filter,opacity,transform] duration-200 ${
          hasOverlay ? "pointer-events-none select-none opacity-[0.96] blur-[1px]" : ""
        }`}
      >
        <header className="shrink-0 border-b border-slate-200/70 bg-white/72 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,.95),rgba(191,219,254,.95)_40%,rgba(148,163,184,.85)_70%,rgba(148,163,184,.18)_100%)] shadow-[0_0_0_1px_rgba(148,163,184,.18),0_10px_30px_rgba(15,23,42,.08)]" />
              <span className="truncate text-[14px] font-semibold tracking-[0.26em] text-slate-950">
                AI SETUP STUDIO
              </span>
            </div>

            <div className="hidden items-center gap-5 md:flex">
              {progressSteps.map((item, index) => {
                const isActive = index === progressCurrentIndex;
                const isDone = index < progressCurrentIndex;

                return (
                  <div
                    key={item}
                    className={`flex items-center gap-2 text-[13px] ${
                      isActive
                        ? "text-slate-950"
                        : isDone
                          ? "text-slate-700"
                          : "text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isActive
                          ? "bg-slate-950"
                          : isDone
                            ? "bg-slate-500"
                            : "bg-slate-300"
                      }`}
                    />
                    <span className="font-medium">{STEP_LABELS[item]}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {summaryVisible || !isEntryStage ? (
                <div
                  className="hidden rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm sm:flex"
                  data-mode={importingWebsite ? "running" : s(discoveryState?.mode || "idle")}
                >
                  <span className="mr-2 mt-[1px] inline-block h-2 w-2 rounded-full bg-slate-400" />
                  {statusLabel}
                </div>
              ) : null}

              {!importingWebsite && !isEntryStage ? (
                <button
                  type="button"
                  onClick={handleGoToSourceStage}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                >
                  Source entry
                </button>
              ) : null}

              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onRefresh}
                disabled={refreshing}
                aria-label="Refresh"
              >
                <RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        {(error || sourceLabel || stageWarnings.length > 0) ? (
          <div className="shrink-0 border-b border-slate-200/60 bg-white/55 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap gap-2 px-4 py-2.5 sm:px-6 lg:px-10">
              {sourceLabel ? (
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Source: {sourceLabel}
                </span>
              ) : null}

              {nextStudioStage ? (
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Next: {nextStudioStage}
                </span>
              ) : null}

              {reviewDraft?.stats?.pendingReviewCount ? (
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Pending review: {Number(reviewDraft.stats.pendingReviewCount || 0)}
                </span>
              ) : null}

              {discoveryState?.shouldReview ? (
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Review required
                </span>
              ) : null}

              {stageWarnings.length > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                  {stageWarnings[0]}
                </span>
              ) : null}

              {error ? (
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700">
                  {error}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {summaryVisible ? (
            <div className="border-b border-slate-200/60 bg-[linear-gradient(180deg,rgba(255,255,255,.86),rgba(248,250,252,.82))] backdrop-blur-sm">
              <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 lg:px-10">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.85fr)_minmax(0,1fr)]">
                  <div className="rounded-[22px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                        Analysis snapshot
                      </span>
                      {sourceLabel ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                          {sourceLabel}
                        </span>
                      ) : null}
                      {reviewStatusLabel ? (
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                          {reviewStatusLabel}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-slate-950">
                        {resolvedCurrentTitle}
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {truncateText(
                          s(discoveryState?.message) || resolvedCurrentDescription,
                          220
                        )}
                      </p>

                      {primarySourceUrl ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-600">
                          <span className="font-medium text-slate-700">URL:</span>{" "}
                          <span className="break-all">{primarySourceUrl}</span>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenRefine}
                          disabled={!refineContentAvailable}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Refine draft
                        </button>

                        {knowledgeContentAvailable ? (
                          <button
                            type="button"
                            onClick={handleOpenKnowledge}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                          >
                            Review knowledge
                          </button>
                        ) : null}

                        {isEntryStage ? (
                          <button
                            type="button"
                            onClick={handleContinueFlow}
                            className="inline-flex items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                          >
                            Continue flow
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGoToSourceStage}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                          >
                            Back to source
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Extracted signals
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Knowledge
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {resultKnowledgeCount}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Services
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {resultServiceCount}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Sources
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {resultSourceCount}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          Events
                        </div>
                        <div className="mt-1 text-xl font-semibold text-slate-950">
                          {resultEventCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/70 bg-white/86 p-4 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
                    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Evidence
                    </div>

                    <div className="space-y-2">
                      {firstReviewSource?.label || firstReviewSource?.url ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                          <div className="text-xs font-medium text-slate-700">
                            {s(firstReviewSource.label || firstReviewSource.sourceType || "Source")}
                          </div>
                          {firstReviewSource.url ? (
                            <div className="mt-1 break-all text-xs text-slate-500">
                              {truncateText(firstReviewSource.url, 140)}
                            </div>
                          ) : null}
                        </div>
                      ) : primarySourceUrl ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                          <div className="text-xs font-medium text-slate-700">
                            Primary source
                          </div>
                          <div className="mt-1 break-all text-xs text-slate-500">
                            {truncateText(primarySourceUrl, 140)}
                          </div>
                        </div>
                      ) : null}

                      {firstEvent?.message || firstEvent?.title ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                          <div className="text-xs font-medium text-slate-700">
                            {s(firstEvent.title || firstEvent.type || "Latest event")}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {truncateText(
                              s(firstEvent.message || firstEvent.status || ""),
                              140
                            )}
                          </div>
                        </div>
                      ) : null}

                      {safeWarnings[0] ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                          <div className="text-xs font-medium text-amber-800">
                            Warning
                          </div>
                          <div className="mt-1 text-xs text-amber-700">
                            {truncateText(safeWarnings[0], 140)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isEntryStage ? (
            <main className="px-4 pb-6 pt-4 sm:px-6 sm:pb-8 lg:px-10 lg:pt-5">
              <div className="mx-auto w-full max-w-[1600px]">
                <AnimatePresence mode="wait" initial={false}>
                  <SetupStudioEntryStage
                    key="entry"
                    discoveryForm={discoveryForm}
                    error={error}
                    importingWebsite={importingWebsite}
                    onSetDiscoveryField={onSetDiscoveryField}
                    onScanBusiness={onScanBusiness}
                  />
                </AnimatePresence>
              </div>
            </main>
          ) : (
            <main className="px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-10 lg:pt-5">
              <div className="mx-auto w-full max-w-[1600px]">
                <div className="rounded-[28px] border border-white/60 bg-white/60 p-4 shadow-[0_20px_60px_rgba(15,23,42,.07)] backdrop-blur-xl sm:p-5 lg:p-6">
                  <AnimatePresence mode="wait" initial={false}>
                    {stage === "scanning" ? (
                      <SetupStudioScanningStage
                        key="scanning"
                        lastUrl={
                          discoveryState?.lastUrl ||
                          discoveryState?.last_url ||
                          discoveryState?.url ||
                          ""
                        }
                        sourceLabel={sourceLabel}
                        scanLines={scanLines}
                        scanLineIndex={scanLineIndex}
                        requestId={s(discoveryState?.requestId || discoveryState?.request_id)}
                      />
                    ) : null}

                    {stage === "identity" ? (
                      <SetupStudioIdentityStage
                        key="identity"
                        currentTitle={resolvedCurrentTitle}
                        currentDescription={resolvedCurrentDescription}
                        discoveryProfileRows={safeDiscoveryProfileRows}
                        discoveryWarnings={stageWarnings}
                        sourceLabel={sourceLabel}
                        onNext={goNextStage}
                        onToggleRefine={handleOpenRefine}
                      />
                    ) : null}

                    {stage === "knowledge" ? (
                      <SetupStudioKnowledgeStage
                        key="knowledge"
                        knowledgePreview={stageKnowledgeItems}
                        knowledgeItems={stageKnowledgeItems}
                        actingKnowledgeId={actingKnowledgeId}
                        sourceLabel={sourceLabel}
                        warnings={stageWarnings}
                        onApproveKnowledge={onApproveKnowledge}
                        onRejectKnowledge={onRejectKnowledge}
                        onNext={goNextStage}
                        onToggleKnowledge={handleOpenKnowledge}
                      />
                    ) : null}

                    {stage === "service" ? (
                      <SetupStudioServiceStage
                        key="service"
                        serviceSuggestionTitle={serviceSuggestionTitle}
                        meta={meta}
                        services={safeServices}
                        sourceLabel={sourceLabel}
                        savingServiceSuggestion={savingServiceSuggestion}
                        onCreateSeed={handleCreateServiceAndNext}
                        onSkip={goNextStage}
                      />
                    ) : null}

                    {stage === "ready" ? (
                      <SetupStudioReadyStage
                        key="ready"
                        meta={meta}
                        studioProgress={studioProgress}
                        hasKnowledge={hasKnowledge}
                        sourceLabel={sourceLabel}
                        warnings={stageWarnings}
                        onToggleRefine={handleOpenRefine}
                        onToggleKnowledge={handleOpenKnowledge}
                        onOpenWorkspace={handleOpenWorkspace}
                      />
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </main>
          )}
        </div>
      </div>

      <SetupStudioModalLayer
        open={hasRefineModalContent && !hasKnowledgeModalContent}
        zIndexClass="z-[160]"
        backdropClass="bg-slate-950/42 backdrop-blur-md"
      >
        <SetupStudioRefineModal
          savingBusiness={savingBusiness}
          businessForm={businessForm}
          discoveryProfileRows={safeDiscoveryProfileRows}
          manualSections={manualSections}
          onSetBusinessField={onSetBusinessField}
          onSetManualSection={onSetManualSection}
          onSaveBusiness={onSaveBusiness}
          onClose={handleCloseRefine}
        />
      </SetupStudioModalLayer>

      <SetupStudioModalLayer
        open={hasKnowledgeModalContent}
        zIndexClass="z-[170]"
        backdropClass="bg-slate-950/52 backdrop-blur-lg"
      >
        <SetupStudioIntakeModal
          knowledgeItems={intakeItems}
          actingKnowledgeId={actingKnowledgeId}
          onApproveKnowledge={onApproveKnowledge}
          onRejectKnowledge={onRejectKnowledge}
          onClose={handleCloseKnowledge}
          onRefresh={onReloadReviewDraft}
        />
      </SetupStudioModalLayer>
    </div>
  );
}