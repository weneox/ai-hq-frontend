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

const STEP_LABELS = {
  entry: "Source",
  identity: "Identity",
  knowledge: "Knowledge",
  service: "Service",
  ready: "Launch",
};

function findProfileRowValue(rows = [], wantedKeys = []) {
  const normalizedWanted = wantedKeys.map((x) => s(x).toLowerCase());

  const match = rows.find(([label]) =>
    normalizedWanted.includes(s(label).toLowerCase())
  );

  return s(match?.[1]);
}

function normalizeStageCandidate(stage = "", { hasKnowledge, hasServices, scanSucceeded } = {}) {
  const x = s(stage);

  if (x === "scanning") return "scanning";
  if (x === "ready") return "ready";
  if (x === "service") return "service";
  if (x === "knowledge") return hasKnowledge ? "knowledge" : hasServices ? "ready" : "service";
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
    studioProgress?.nextStudioStage ||
      studioProgress?.progress?.nextStudioStage
  );

  if (studioProgress?.setupCompleted) {
    return "ready";
  }

  if (!scanSucceeded && !hasScannedUrl) {
    return nextStudioStage === "entry" ? "entry" : "entry";
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
  discoveryProfileRows,
  knowledgePreview,
  knowledgeItems,
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
  discoveryModeLabel = defaultDiscoveryModeLabel,
}) {
  const navigate = useNavigate();

  const scanSucceeded = isSuccessMode(discoveryState.mode);
  const hasScannedUrl = !!s(discoveryState.lastUrl);
  const hasKnowledge = knowledgePreview.length > 0;
  const intakeItems =
    Array.isArray(knowledgeItems) && knowledgeItems.length
      ? knowledgeItems
      : knowledgePreview;
  const hasServices = Array.isArray(services) && services.length > 0;

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

  const scanLines = [
    "Reading the primary source",
    "Extracting business identity",
    "Collecting knowledge signals",
    "Detecting service structure",
  ];

  useEffect(() => {
    document.documentElement.classList.add("setup-studio-lock");
    document.body.classList.add("setup-studio-lock");

    return () => {
      document.documentElement.classList.remove("setup-studio-lock");
      document.body.classList.remove("setup-studio-lock");
    };
  }, []);

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

  const discoveredTitle =
    findProfileRowValue(discoveryProfileRows, [
      "name",
      "business name",
      "company name",
      "title",
    ]) || s(meta?.companyName);

  const discoveredDescription =
    findProfileRowValue(discoveryProfileRows, [
      "description",
      "summary",
      "about",
      "business description",
    ]) || s(meta?.companySummaryShort || meta?.description);

  const currentTitle =
    s(businessForm.companyName) || discoveredTitle || "Business identity";

  const currentDescription =
    s(businessForm.description) ||
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
  const stageWarnings = arr(discoveryState?.warnings).filter(Boolean);
  const nextStudioStage = s(stageMeta?.nextStudioStage || studioProgress?.nextStudioStage || "");

  if (loading) {
    return (
      <div className="setup-studio-loading">
        <div className="setup-studio-loading__pill">Setup studio hazırlanır...</div>
      </div>
    );
  }

  return (
    <div
      className={`setup-studio-scene ${isEntryStage ? "is-entry-stage" : ""}`}
      data-stage={stage}
      data-scan-url={hasScannedUrl ? "yes" : "no"}
    >
      <header className="setup-studio-scene__topbar">
        <div className="setup-studio-scene__brand">
          <span className="setup-studio-scene__brand-mark" />
          <span className="setup-studio-scene__brand-text">AI SETUP STUDIO</span>
        </div>

        <div className="setup-studio-scene__progress" aria-label="Setup progress">
          {progressSteps.map((item, index) => {
            const isActive = index === progressCurrentIndex;
            const isDone = index < progressCurrentIndex;

            return (
              <div
                key={item}
                className={[
                  "setup-studio-scene__progress-item",
                  isActive ? "is-active" : "",
                  isDone ? "is-done" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="setup-studio-scene__progress-dot" />
                <span className="setup-studio-scene__progress-label">
                  {STEP_LABELS[item]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="setup-studio-scene__topbar-actions">
          {!isEntryStage ? (
            <div
              className="setup-studio-scene__status"
              data-mode={importingWebsite ? "running" : s(discoveryState.mode || "idle")}
            >
              <span className="setup-studio-scene__status-dot" />
              <span>{statusLabel}</span>
            </div>
          ) : null}

          <button
            type="button"
            className="setup-studio-scene__refresh"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {!isEntryStage && (error || sourceLabel || stageWarnings.length > 0) ? (
        <div className="setup-studio-scene__meta-strip">
          {sourceLabel ? (
            <span className="setup-studio-scene__meta-chip">
              Source: {sourceLabel}
            </span>
          ) : null}

          {nextStudioStage ? (
            <span className="setup-studio-scene__meta-chip">
              Next: {nextStudioStage}
            </span>
          ) : null}

          {discoveryState?.shouldReview ? (
            <span className="setup-studio-scene__meta-chip">
              Review required
            </span>
          ) : null}

          {stageWarnings.length > 0 ? (
            <span className="setup-studio-scene__meta-chip">
              {stageWarnings[0]}
            </span>
          ) : null}

          {error ? (
            <span className="setup-studio-scene__meta-chip is-error">
              {error}
            </span>
          ) : null}
        </div>
      ) : null}

      {isEntryStage ? (
        <main className="setup-studio-entry-page">
          <div className="setup-studio-entry-page__shell">
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
        <main className="setup-studio-flow-page">
          <div className="setup-studio-flow-page__host">
            <AnimatePresence mode="wait" initial={false}>
              {stage === "scanning" ? (
                <SetupStudioScanningStage
                  key="scanning"
                  lastUrl={discoveryState.lastUrl}
                  sourceLabel={sourceLabel}
                  scanLines={scanLines}
                  scanLineIndex={scanLineIndex}
                  requestId={s(discoveryState.requestId)}
                />
              ) : null}

              {stage === "identity" ? (
                <SetupStudioIdentityStage
                  key="identity"
                  currentTitle={currentTitle}
                  currentDescription={currentDescription}
                  discoveryProfileRows={discoveryProfileRows}
                  discoveryWarnings={stageWarnings}
                  sourceLabel={sourceLabel}
                  onNext={goNextStage}
                  onToggleRefine={onToggleRefine}
                />
              ) : null}

              {stage === "knowledge" ? (
                <SetupStudioKnowledgeStage
                  key="knowledge"
                  knowledgePreview={knowledgePreview}
                  actingKnowledgeId={actingKnowledgeId}
                  sourceLabel={sourceLabel}
                  warnings={stageWarnings}
                  onApproveKnowledge={onApproveKnowledge}
                  onRejectKnowledge={onRejectKnowledge}
                  onNext={goNextStage}
                  onToggleKnowledge={onToggleKnowledge}
                />
              ) : null}

              {stage === "service" ? (
                <SetupStudioServiceStage
                  key="service"
                  serviceSuggestionTitle={serviceSuggestionTitle}
                  meta={meta}
                  services={services}
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
                  onToggleRefine={onToggleRefine}
                  onToggleKnowledge={onToggleKnowledge}
                  onOpenWorkspace={handleOpenWorkspace}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      )}

      <AnimatePresence>
        {showRefine ? (
          <div className="setup-studio-overlay">
            <SetupStudioRefineModal
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
          <div className="setup-studio-overlay setup-studio-overlay--deep">
            <SetupStudioIntakeModal
              knowledgeItems={intakeItems}
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