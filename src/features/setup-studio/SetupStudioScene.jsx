import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { pageTone, isSuccessMode, s } from "./lib/setupStudioHelpers.js";
import SetupStudioHeader from "./components/SetupStudioHeader.jsx";
import SetupStudioProgressDots from "./components/SetupStudioProgressDots.jsx";
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
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1320px] flex-col px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <SetupStudioHeader
          tone={tone}
          refreshing={refreshing}
          onRefresh={onRefresh}
          statusLabel={discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
        />

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[36px] border border-white/80 bg-white/44 shadow-[0_40px_140px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-[88px] h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-[16%] top-[50%] h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
          <div className="pointer-events-none absolute left-[10%] top-[18%] h-[180px] w-[180px] rounded-full border border-white/70" />
          <div className="pointer-events-none absolute right-[8%] top-[16%] h-[240px] w-[240px] rounded-full border border-white/70" />

          <div className="relative flex h-full flex-col">
            <div className="px-5 pt-5 sm:px-8 sm:pt-7">
              <SetupStudioProgressDots items={miniProgress} />
            </div>

            <div className="relative flex min-h-0 flex-1 items-center px-5 pb-6 pt-4 sm:px-8 sm:pb-8">
              <AnimatePresence mode="wait">
                {stage === "entry" ? (
                  <SetupStudioEntryStage
                    key="entry"
                    discoveryForm={discoveryForm}
                    error={error}
                    importingWebsite={importingWebsite}
                    onSetDiscoveryField={onSetDiscoveryField}
                    onScanBusiness={onScanBusiness}
                  />
                ) : null}

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
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showRefine ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/16 px-4 backdrop-blur-[6px]">
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
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/16 px-4 backdrop-blur-[6px]">
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