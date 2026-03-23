import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

import SetupStudioEntryStage from "./stages/SetupStudioEntryStage.jsx";
import SetupStudioScanningStage from "./stages/SetupStudioScanningStage.jsx";
import SetupStudioIdentityStage from "./stages/SetupStudioIdentityStage.jsx";
import SetupStudioKnowledgeStage from "./stages/SetupStudioKnowledgeStage.jsx";
import SetupStudioServiceStage from "./stages/SetupStudioServiceStage.jsx";
import SetupStudioReadyStage from "./stages/SetupStudioReadyStage.jsx";
import SetupStudioRefineModal from "./components/SetupStudioRefineModal.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function sourceLabelFromProps(discoveryState = {}, discoveryModeLabel) {
  return s(
    discoveryState?.sourceLabel ||
      (typeof discoveryModeLabel === "function"
        ? discoveryModeLabel(discoveryState?.lastSourceType)
        : "")
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
  knowledgeItems = [],
  serviceSuggestionTitle,
  studioProgress,
  services = [],
  reviewSources = [],
  reviewEvents = [],
  hasVisibleResults,
  visibleKnowledgeCount = 0,
  visibleServiceCount = 0,
  onSetBusinessField,
  onSetManualSection,
  onSetDiscoveryField,
  onContinueFlow,
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
  const [stage, setStage] = useState("entry");

  const sourceLabel = useMemo(
    () => sourceLabelFromProps(discoveryState, discoveryModeLabel),
    [discoveryState, discoveryModeLabel]
  );

  const hasServiceStage = useMemo(() => {
    return (
      !!s(serviceSuggestionTitle) ||
      arr(services).length > 0 ||
      visibleServiceCount > 0
    );
  }, [serviceSuggestionTitle, services, visibleServiceCount]);

  const hasAnyReviewContent = useMemo(() => {
    return !!(
      arr(discoveryProfileRows).length ||
      arr(knowledgeItems).length ||
      arr(services).length ||
      arr(reviewSources).length ||
      arr(reviewEvents).length ||
      arr(discoveryState?.warnings).length
    );
  }, [
    discoveryProfileRows,
    knowledgeItems,
    services,
    reviewSources,
    reviewEvents,
    discoveryState?.warnings,
  ]);

  useEffect(() => {
    const mode = s(discoveryState?.mode).toLowerCase();
    const forcedReady =
      !!meta?.setupCompleted ||
      s(studioProgress?.nextStudioStage).toLowerCase() === "ready";

    if (importingWebsite || mode === "running") {
      setStage("scanning");
      return;
    }

    if (!hasVisibleResults && !hasAnyReviewContent) {
      setStage("entry");
      return;
    }

    if (forcedReady) {
      setStage("ready");
      return;
    }

    setStage((prev) => {
      if (prev === "entry" || prev === "scanning") {
        if (showKnowledge && visibleKnowledgeCount > 0) return "knowledge";
        return "identity";
      }

      if (prev === "knowledge" && visibleKnowledgeCount <= 0) {
        return hasServiceStage ? "service" : "ready";
      }

      if (prev === "service" && !hasServiceStage) {
        return "ready";
      }

      return prev;
    });
  }, [
    importingWebsite,
    discoveryState?.mode,
    hasVisibleResults,
    hasAnyReviewContent,
    studioProgress?.nextStudioStage,
    meta?.setupCompleted,
    visibleKnowledgeCount,
    hasServiceStage,
    showKnowledge,
  ]);

  function goNextFromIdentity() {
    if (visibleKnowledgeCount > 0) {
      setStage("knowledge");
      return;
    }

    if (hasServiceStage) {
      setStage("service");
      return;
    }

    setStage("ready");
  }

  function goNextFromKnowledge() {
    if (hasServiceStage) {
      setStage("service");
      return;
    }

    setStage("ready");
  }

  function goNextFromService() {
    setStage("ready");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen overflow-y-auto">
        <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[12px] font-medium text-slate-400">
              {sourceLabel ? sourceLabel : "Setup studio"}
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <AnimatePresence mode="wait">
            {stage === "entry" ? (
              <SetupStudioEntryStage
                key="entry"
                importingWebsite={importingWebsite}
                discoveryForm={discoveryForm}
                businessForm={businessForm}
                manualSections={manualSections}
                onSetBusinessField={onSetBusinessField}
                onSetManualSection={onSetManualSection}
                onSetDiscoveryField={onSetDiscoveryField}
                onContinueFlow={onContinueFlow}
              />
            ) : null}

            {stage === "scanning" ? (
              <SetupStudioScanningStage
                key="scanning"
                lastUrl={discoveryState?.lastUrl}
              />
            ) : null}

            {stage === "identity" ? (
              <SetupStudioIdentityStage
                key="identity"
                currentTitle={currentTitle}
                currentDescription={currentDescription}
                discoveryProfileRows={discoveryProfileRows}
                discoveryWarnings={arr(discoveryState?.warnings)}
                sourceLabel={sourceLabel}
                onNext={goNextFromIdentity}
                onToggleRefine={onToggleRefine}
              />
            ) : null}

            {stage === "knowledge" ? (
              <SetupStudioKnowledgeStage
                key="knowledge"
                knowledgePreview={knowledgePreview}
                knowledgeItems={knowledgeItems}
                actingKnowledgeId={actingKnowledgeId}
                sourceLabel={sourceLabel}
                warnings={arr(discoveryState?.warnings)}
                onApproveKnowledge={onApproveKnowledge}
                onRejectKnowledge={onRejectKnowledge}
                onNext={goNextFromKnowledge}
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
                onCreateSeed={async () => {
                  await onCreateSuggestedService?.();
                }}
                onSkip={goNextFromService}
              />
            ) : null}

            {stage === "ready" ? (
              <SetupStudioReadyStage
                key="ready"
                meta={meta}
                studioProgress={studioProgress}
                hasKnowledge={visibleKnowledgeCount > 0}
                onToggleRefine={onToggleRefine}
                onToggleKnowledge={onToggleKnowledge}
                onOpenWorkspace={onOpenWorkspace}
              />
            ) : null}
          </AnimatePresence>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </main>
      </div>

      <AnimatePresence>
        {showRefine ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,.34)] px-4 py-4">
            <button
              type="button"
              aria-label="Close refine modal"
              className="absolute inset-0"
              onClick={onToggleRefine}
            />

            <div className="relative z-10 w-full max-w-[1180px]">
              <SetupStudioRefineModal
                savingBusiness={savingBusiness}
                businessForm={businessForm}
                discoveryProfileRows={discoveryProfileRows}
                manualSections={manualSections}
                onSetBusinessField={onSetBusinessField}
                onSetManualSection={onSetManualSection}
                onSaveBusiness={onSaveBusiness}
                onClose={onToggleRefine}
                reviewDraft={reviewDraft}
              />
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}