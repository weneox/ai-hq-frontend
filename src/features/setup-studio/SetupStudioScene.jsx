import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import SetupStudioModalLayer from "./scene/SetupStudioModalLayer.jsx";
import { STEP_LABELS, n, formatFieldLabel } from "./scene/shared.js";
import {
  buildRecoveredStage,
  buildStatusLabel,
  buildSceneSummaryState,
  resolveLanguageLabel,
} from "./scene/derived.js";

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

  const [stayOnSourceStage, setStayOnSourceStage] = useState(true);

  const sceneState = useMemo(
    () =>
      buildSceneSummaryState({
        discoveryState,
        discoveryForm,
        reviewDraft,
        businessForm,
        meta,
        currentTitle,
        currentDescription,
        discoveryProfileRows,
        knowledgeItems,
        knowledgePreview,
        services,
        reviewSources,
        reviewEvents,
        visibleKnowledgeCount,
        visibleServiceCount,
      }),
    [
      discoveryState,
      discoveryForm,
      reviewDraft,
      businessForm,
      meta,
      currentTitle,
      currentDescription,
      discoveryProfileRows,
      knowledgeItems,
      knowledgePreview,
      services,
      reviewSources,
      reviewEvents,
      visibleKnowledgeCount,
      visibleServiceCount,
    ]
  );

  const {
    safeKnowledgePreview,
    safeKnowledgeItems,
    safeServices,
    safeDiscoveryProfileRows,
    safeWarnings,
    safeReviewSources,
    safeReviewEvents,
    intakeItems,
    stageKnowledgeItems,
    hasKnowledge,
    hasServices,
    hasReviewPayload,
    hasIdentityData,
    sourceLabel,
    primarySourceUrl,
    hasScannedUrl,
    resolvedLanguage,
    reviewFlags,
    reviewRequired,
    weakestFieldBadges,
    resolvedCurrentTitle,
    resolvedCurrentDescription,
    reviewStatusLabel,
    resultKnowledgeCount,
    resultServiceCount,
    resultSourceCount,
    resultEventCount,
    summaryVisible,
  } = sceneState;

  const scanSucceeded = isSuccessMode(discoveryState?.mode);

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
    wantsRefineOverlay &&
    !!showRefine &&
    refineContentAvailable;

  const hasKnowledgeModalContent =
    wantsKnowledgeOverlay &&
    !!showKnowledge &&
    knowledgeContentAvailable;

  const activeOverlay = hasKnowledgeModalContent
    ? "knowledge"
    : hasRefineModalContent
      ? "refine"
      : "";

  const hasOverlay = !!activeOverlay;

  const stageMeta = obj(meta);
  const stageWarnings = safeWarnings;
  const nextStudioStage = s(
    stageMeta?.nextStudioStage || studioProgress?.nextStudioStage || ""
  );

  const discoveryMode = s(discoveryState?.mode).toLowerCase();
  const hasTerminalDiscoveryMode =
    !!discoveryMode && !["idle", "running"].includes(discoveryMode);

  const hasAnalysisPayload =
    safeDiscoveryProfileRows.length > 0 ||
    stageWarnings.length > 0 ||
    resultKnowledgeCount > 0 ||
    resultServiceCount > 0 ||
    resultSourceCount > 0 ||
    resultEventCount > 0 ||
    safeReviewSources.length > 0 ||
    safeReviewEvents.length > 0 ||
    !!reviewStatusLabel ||
    reviewFlags.length > 0 ||
    reviewRequired ||
    !!s(primarySourceUrl) ||
    !!s(resolvedCurrentTitle) ||
    !!s(resolvedCurrentDescription) ||
    !!s(discoveryState?.message);

  const entryAnalysisVisible = !!(
    !importingWebsite &&
    hasScannedUrl &&
    hasTerminalDiscoveryMode &&
    hasAnalysisPayload &&
    (hasVisibleResults || hasAnalysisPayload || summaryVisible)
  );

  const entryAnalysisSourceLabel = entryAnalysisVisible ? sourceLabel : "";
  const entryAnalysisUrl = entryAnalysisVisible ? primarySourceUrl : "";
  const entryAnalysisTitle = entryAnalysisVisible ? resolvedCurrentTitle : "";
  const entryAnalysisDescription = entryAnalysisVisible
    ? resolvedCurrentDescription
    : "";
  const entryAnalysisMessage = entryAnalysisVisible
    ? s(discoveryState?.message)
    : "";
  const entryAnalysisWarnings = entryAnalysisVisible ? stageWarnings : [];
  const entryAnalysisProfileRows = entryAnalysisVisible
    ? safeDiscoveryProfileRows
    : [];
  const entryAnalysisKnowledgeCount = entryAnalysisVisible
    ? resultKnowledgeCount
    : 0;
  const entryAnalysisServiceCount = entryAnalysisVisible
    ? resultServiceCount
    : 0;
  const entryAnalysisSourceCount = entryAnalysisVisible ? resultSourceCount : 0;
  const entryAnalysisEventCount = entryAnalysisVisible ? resultEventCount : 0;
  const entryAnalysisReviewStatusLabel = entryAnalysisVisible
    ? reviewStatusLabel
    : "";
  const entryAnalysisReviewSources = entryAnalysisVisible
    ? safeReviewSources
    : [];
  const entryAnalysisReviewEvents = entryAnalysisVisible
    ? safeReviewEvents
    : [];

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
    if (overlayIntent === "refine" && !showRefine) {
      setOverlayIntent("");
    }
  }, [overlayIntent, showRefine]);

  useEffect(() => {
    if (overlayIntent === "knowledge" && !showKnowledge) {
      setOverlayIntent("");
    }
  }, [overlayIntent, showKnowledge]);

  useEffect(() => {
    if (importingWebsite) {
      const nextStage = stayOnSourceStage ? "entry" : "scanning";
      if (stage !== nextStage) setStage(nextStage);
      return;
    }

    if (stage === "entry" || stage === "scanning") {
      if (stage !== recoveredStage) setStage(recoveredStage);
      return;
    }

    if (recoveredStage === "ready" && stage !== "ready") {
      setStage("ready");
    }
  }, [importingWebsite, stayOnSourceStage, recoveredStage, stage]);

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

    if (showKnowledge && typeof onToggleKnowledge === "function") {
      onToggleKnowledge();
    }

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

    if (showRefine && typeof onToggleRefine === "function") {
      onToggleRefine();
    }

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

  const progressCurrentStage = stayOnSourceStage
    ? "entry"
    : importingWebsite
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
    reviewRequired,
  });

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
      data-main-language={resolvedLanguage || "unknown"}
      data-review-required={reviewRequired ? "yes" : "no"}
    >
      <div
        aria-hidden={hasOverlay ? "true" : "false"}
        className={`flex h-full flex-col transition-[filter,opacity] duration-200 ${
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
              {entryAnalysisVisible || !isEntryStage ? (
                <div
                  className="hidden rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm sm:flex"
                  data-mode={importingWebsite ? "running" : s(discoveryState?.mode || "idle")}
                >
                  <span
                    className={`mr-2 mt-[1px] inline-block h-2 w-2 rounded-full ${
                      reviewRequired ? "bg-amber-500" : "bg-slate-400"
                    }`}
                  />
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

        {(error ||
          entryAnalysisSourceLabel ||
          stageWarnings.length > 0 ||
          reviewRequired ||
          reviewFlags.length > 0 ||
          resolvedLanguage ||
          weakestFieldBadges.length > 0) ? (
          <div className="shrink-0 border-b border-slate-200/60 bg-white/55 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap gap-2 px-4 py-2.5 sm:px-6 lg:px-10">
              {entryAnalysisSourceLabel ? (
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Source: {entryAnalysisSourceLabel}
                </span>
              ) : null}

              {resolvedLanguage ? (
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700">
                  Language: {resolveLanguageLabel(resolvedLanguage)}
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

              {reviewRequired ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                  Review required
                </span>
              ) : null}

              {reviewStatusLabel ? (
                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700">
                  Session: {reviewStatusLabel}
                </span>
              ) : null}

              {weakestFieldBadges.map((item) => (
                <span
                  key={item.key}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700"
                >
                  {formatFieldLabel(item.key)}: {item.label || `${Math.round(item.score * 100)}%`}
                </span>
              ))}

              {reviewFlags.slice(0, 4).map((flag) => (
                <span
                  key={flag}
                  className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700"
                >
                  {flag}
                </span>
              ))}

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
                    hasAnalysis={entryAnalysisVisible}
                    analysisLoading={importingWebsite}
                    analysisSourceLabel={entryAnalysisSourceLabel}
                    analysisUrl={entryAnalysisUrl}
                    analysisTitle={entryAnalysisTitle}
                    analysisDescription={entryAnalysisDescription}
                    analysisMessage={entryAnalysisMessage}
                    analysisWarnings={entryAnalysisWarnings}
                    analysisProfileRows={entryAnalysisProfileRows}
                    analysisKnowledgeCount={entryAnalysisKnowledgeCount}
                    analysisServiceCount={entryAnalysisServiceCount}
                    analysisSourceCount={entryAnalysisSourceCount}
                    analysisEventCount={entryAnalysisEventCount}
                    analysisReviewStatusLabel={entryAnalysisReviewStatusLabel}
                    analysisReviewSources={entryAnalysisReviewSources}
                    analysisReviewEvents={entryAnalysisReviewEvents}
                    onOpenRefine={handleOpenRefine}
                    onOpenKnowledge={knowledgeContentAvailable ? handleOpenKnowledge : undefined}
                    onContinueFlow={handleContinueFlow}
                  />
                </AnimatePresence>
              </div>
            </main>
          ) : (
            <main className="px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-10 lg:pt-5">
              <div className="mx-auto w-full max-w-[1600px]">
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
                      scanLines={[
                        "Reading the primary source",
                        "Extracting business identity",
                        "Collecting knowledge signals",
                        "Detecting service structure",
                      ]}
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