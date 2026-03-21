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

function findProfileRowValue(rows = [], wantedKeys = []) {
  const normalizedWanted = wantedKeys.map((x) => s(x).toLowerCase());

  const match = rows.find(([label]) =>
    normalizedWanted.includes(s(label).toLowerCase())
  );

  return s(match?.[1]);
}

function normalizeStageCandidate(
  stage = "",
  { hasKnowledge, hasServices, scanSucceeded } = {}
) {
  const x = s(stage);

  if (x === "scanning") return "scanning";
  if (x === "ready") return "ready";
  if (x === "service") return "service";
  if (x === "knowledge") {
    return hasKnowledge ? "knowledge" : hasServices ? "ready" : "service";
  }
  if (x === "identity") return scanSucceeded ? "identity" : "entry";
  return "entry";
}

function buildRecoveredStage({
  importingWebsite,
  scanSucceeded,
  hasKnowledge,
  hasServices,
  studioProgress,
  hasScannedUrl,
}) {
  if (importingWebsite) return "scanning";

  const nextStudioStage = s(
    studioProgress?.nextStudioStage || studioProgress?.progress?.nextStudioStage
  );

  if (studioProgress?.setupCompleted) {
    return "ready";
  }

  if (!scanSucceeded && !hasScannedUrl) {
    return "entry";
  }

  if (nextStudioStage) {
    return normalizeStageCandidate(nextStudioStage, {
      hasKnowledge,
      hasServices,
      scanSucceeded,
    });
  }

  if (!scanSucceeded) return "entry";
  if (hasKnowledge) return "knowledge";
  if (hasServices) return "ready";
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

  const scanSucceeded = isSuccessMode(discoveryState?.mode);
  const hasScannedUrl = !!s(discoveryState?.lastUrl);

  const draftQueue = arr(reviewDraft?.reviewQueue);
  const hasKnowledge = draftQueue.length > 0 || safeKnowledgePreview.length > 0;

  const intakeItems =
    safeKnowledgeItems.length > 0
      ? safeKnowledgeItems
      : draftQueue.length > 0
        ? draftQueue
        : safeKnowledgePreview;

  const hasServices = safeServices.length > 0;

  const stageSequence = useMemo(() => {
    const list = ["identity"];
    if (hasKnowledge) list.push("knowledge");
    list.push("service", "ready");
    return list;
  }, [hasKnowledge]);

  const progressSteps = useMemo(() => {
    const list = ["entry", "identity"];
    if (hasKnowledge) list.push("knowledge");
    list.push("service", "ready");
    return list;
  }, [hasKnowledge]);

  const [stage, setStage] = useState(() =>
    buildRecoveredStage({
      importingWebsite,
      scanSucceeded,
      hasKnowledge,
      hasServices,
      studioProgress,
      hasScannedUrl,
    })
  );

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
    !!s(businessForm?.description);

  const knowledgeContentAvailable = intakeItems.length > 0;

  const wantsRefineOverlay = overlayIntent === "refine";
  const wantsKnowledgeOverlay = overlayIntent === "knowledge";

  const hasRefineModalContent =
    wantsRefineOverlay && !!showRefine && refineContentAvailable;

  const hasKnowledgeModalContent =
    wantsKnowledgeOverlay && !!showKnowledge && knowledgeContentAvailable;

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
    const recovered = buildRecoveredStage({
      importingWebsite,
      scanSucceeded,
      hasKnowledge,
      hasServices,
      studioProgress,
      hasScannedUrl,
    });

    if (importingWebsite) {
      setStage("scanning");
      return;
    }

    if (stage === "entry" || stage === "scanning") {
      setStage(recovered);
      return;
    }

    if (studioProgress?.setupCompleted && stage !== "ready") {
      setStage("ready");
      return;
    }

    if (!hasKnowledge && stage === "knowledge") {
      setStage(hasServices ? "ready" : "service");
      return;
    }

    const requestedStage = normalizeStageCandidate(
      s(studioProgress?.nextStudioStage),
      {
        hasKnowledge,
        hasServices,
        scanSucceeded,
      }
    );

    if (
      requestedStage &&
      requestedStage !== "entry" &&
      requestedStage !== "scanning"
    ) {
      if (stage === "identity" && requestedStage === "knowledge" && hasKnowledge) {
        setStage("knowledge");
        return;
      }

      if (stage === "knowledge" && requestedStage === "service") {
        setStage("service");
        return;
      }

      if (
        (stage === "service" || stage === "identity" || stage === "knowledge") &&
        requestedStage === "ready" &&
        (hasServices || studioProgress?.setupCompleted)
      ) {
        setStage("ready");
      }
    }
  }, [
    importingWebsite,
    scanSucceeded,
    hasKnowledge,
    hasServices,
    studioProgress,
    stage,
    hasScannedUrl,
  ]);

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
    if (importingWebsite || stage === "entry" || stage === "scanning") {
      setOverlayIntent("");
    }
  }, [importingWebsite, stage]);

  useEffect(() => {
    if (!showKnowledge && overlayIntent === "knowledge") {
      setOverlayIntent("");
    }
  }, [showKnowledge, overlayIntent]);

  useEffect(() => {
    if (!showRefine && overlayIntent === "refine") {
      setOverlayIntent("");
    }
  }, [showRefine, overlayIntent]);

  useEffect(() => {
    if (overlayIntent === "knowledge" && showKnowledge && !knowledgeContentAvailable) {
      setOverlayIntent("");
      if (typeof onToggleKnowledge === "function") {
        onToggleKnowledge();
      }
    }
  }, [overlayIntent, showKnowledge, knowledgeContentAvailable, onToggleKnowledge]);

  useEffect(() => {
    if (overlayIntent === "refine" && showRefine && !refineContentAvailable) {
      setOverlayIntent("");
      if (typeof onToggleRefine === "function") {
        onToggleRefine();
      }
    }
  }, [overlayIntent, showRefine, refineContentAvailable, onToggleRefine]);

  function goNextStage() {
    const idx = stageSequence.indexOf(stage);
    if (idx >= 0 && idx < stageSequence.length - 1) {
      setStage(stageSequence[idx + 1]);
    }
  }

  async function handleCreateServiceAndNext() {
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
    ? normalizeStageCandidate(s(studioProgress?.nextStudioStage || "identity"), {
        hasKnowledge,
        hasServices,
        scanSucceeded: true,
      })
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
      (s(discoveryState?.lastSourceType) === "google_maps"
        ? "Google Maps"
        : s(discoveryState?.lastSourceType) === "website"
          ? "Website"
          : "")
  );

  const stageMeta = obj(meta);
  const stageWarnings = safeWarnings;
  const nextStudioStage = s(
    stageMeta?.nextStudioStage || studioProgress?.nextStudioStage || ""
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-slate-200 bg-white/90 px-5 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur">
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`setup-studio-scene min-h-screen overflow-x-hidden ${
        hasOverlay ? "is-overlay-open" : ""
      }`}
      data-stage={stage}
      data-scan-url={hasScannedUrl ? "yes" : "no"}
      data-overlay-intent={overlayIntent || "none"}
      data-overlay-open={hasOverlay ? "yes" : "no"}
    >
      <div
        aria-hidden={hasOverlay ? "true" : "false"}
        className={`transition-[filter,opacity,transform] duration-200 ${
          hasOverlay ? "pointer-events-none select-none opacity-[0.96] blur-[1px]" : ""
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/72 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-4.5 w-4.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,.95),rgba(191,219,254,.95)_40%,rgba(148,163,184,.85)_70%,rgba(148,163,184,.18)_100%)] shadow-[0_0_0_1px_rgba(148,163,184,.18),0_10px_30px_rgba(15,23,42,.08)]" />
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
              {!isEntryStage ? (
                <div
                  className="hidden rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm sm:flex"
                  data-mode={importingWebsite ? "running" : s(discoveryState?.mode || "idle")}
                >
                  <span className="mr-2 mt-[1px] inline-block h-2 w-2 rounded-full bg-slate-400" />
                  {statusLabel}
                </div>
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

        {!isEntryStage && (error || sourceLabel || stageWarnings.length > 0) ? (
          <div className="border-b border-slate-200/60 bg-white/55 backdrop-blur-sm">
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
                      lastUrl={discoveryState?.lastUrl}
                      sourceLabel={sourceLabel}
                      scanLines={scanLines}
                      scanLineIndex={scanLineIndex}
                      requestId={s(discoveryState?.requestId)}
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
                      knowledgePreview={safeKnowledgePreview}
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