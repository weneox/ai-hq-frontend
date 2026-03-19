import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { isSuccessMode, s } from "./lib/setupStudioHelpers.js";
import SetupStudioRefineModal from "./components/SetupStudioRefineModal.jsx";
import SetupStudioIntakeModal from "./components/SetupStudioIntakeModal.jsx";
import SetupStudioEntryStage from "./stages/SetupStudioEntryStage.jsx";
import SetupStudioScanningStage from "./stages/SetupStudioScanningStage.jsx";
import SetupStudioIdentityStage from "./stages/SetupStudioIdentityStage.jsx";
import SetupStudioKnowledgeStage from "./stages/SetupStudioKnowledgeStage.jsx";
import SetupStudioServiceStage from "./stages/SetupStudioServiceStage.jsx";
import SetupStudioReadyStage from "./stages/SetupStudioReadyStage.jsx";
import { discoveryModeLabel as defaultDiscoveryModeLabel } from "./lib/setupStudioHelpers.js";

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
  }, [importingWebsite]);

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

  const currentTitle =
    s(businessForm.companyName) ||
    discoveryProfileRows?.find?.(([label]) => label === "Name")?.[1] ||
    "Business identity";

  const currentDescription =
    s(businessForm.description) ||
    discoveryProfileRows?.find?.(([label]) => label === "Description")?.[1] ||
    "We extracted a first draft of the business direction from the website.";

  const statusLabel = discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode);
  const isEntryStage = stage === "entry";

  if (loading) {
    return (
      <div className="setup-studio-loading">
        <div className="setup-studio-loading__pill">Setup studio hazırlanır...</div>
      </div>
    );
  }

  return (
    <div className={`setup-studio-scene ${isEntryStage ? "is-entry-stage" : ""}`} data-stage={stage}>
      <header className="setup-studio-scene__topbar">
        <div className="setup-studio-scene__brand">
          <span className="setup-studio-scene__brand-mark" />
          <span className="setup-studio-scene__brand-text">AI Setup Studio</span>
        </div>

        <div className="setup-studio-scene__topbar-actions">
          <div
            className="setup-studio-scene__status"
            data-mode={importingWebsite ? "running" : s(discoveryState.mode || "idle")}
          >
            <span className="setup-studio-scene__status-dot" />
            <span>{statusLabel}</span>
          </div>

          <button
            type="button"
            className="setup-studio-scene__refresh"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      {isEntryStage ? (
        <main className="setup-studio-entry-raw">
          <div className="setup-studio-entry-raw__glow setup-studio-entry-raw__glow--left" />
          <div className="setup-studio-entry-raw__glow setup-studio-entry-raw__glow--center" />
          <div className="setup-studio-entry-raw__line setup-studio-entry-raw__line--top" />
          <div className="setup-studio-entry-raw__line setup-studio-entry-raw__line--bottom" />

          <div className="setup-studio-entry-raw__inner">
            <div className="setup-studio-entry-raw__eyebrow">first move</div>
            <h1 className="setup-studio-entry-raw__title">Give me the website.</h1>
            <p className="setup-studio-entry-raw__copy">
              Tək bir source. Qalan shape-ı studio çıxarsın.
            </p>

            <div className="setup-studio-entry-raw__stage">
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
                  scanLines={scanLines}
                  scanLineIndex={scanLineIndex}
                />
              ) : null}

              {stage === "identity" ? (
                <SetupStudioIdentityStage
                  key="identity"
                  currentTitle={currentTitle}
                  currentDescription={currentDescription}
                  discoveryProfileRows={discoveryProfileRows}
                  onNext={goNextStage}
                  onToggleRefine={onToggleRefine}
                />
              ) : null}

              {stage === "knowledge" ? (
                <SetupStudioKnowledgeStage
                  key="knowledge"
                  knowledgePreview={knowledgePreview}
                  actingKnowledgeId={actingKnowledgeId}
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
                  onToggleRefine={onToggleRefine}
                  onToggleKnowledge={onToggleKnowledge}
                  onOpenWorkspace={onOpenWorkspace}
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