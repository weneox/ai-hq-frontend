import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  isSuccessMode,
  s,
  profilePreviewRows,
} from "./lib/setupStudioHelpers.js";
import SetupStudioRefineModal from "./components/SetupStudioRefineModal.jsx";
import SetupStudioIntakeModal from "./components/SetupStudioIntakeModal.jsx";
import SetupStudioEntryStage from "./stages/SetupStudioEntryStage.jsx";
import SetupStudioScanningStage from "./stages/SetupStudioScanningStage.jsx";
import SetupStudioIdentityStage from "./stages/SetupStudioIdentityStage.jsx";
import SetupStudioKnowledgeStage from "./stages/SetupStudioKnowledgeStage.jsx";
import SetupStudioServiceStage from "./stages/SetupStudioServiceStage.jsx";
import SetupStudioReadyStage from "./stages/SetupStudioReadyStage.jsx";
import { discoveryModeLabel as defaultDiscoveryModeLabel } from "./lib/setupStudioHelpers.js";

const JOURNEY = [
  { key: "entry", index: "01", label: "signal" },
  { key: "scanning", index: "02", label: "reading" },
  { key: "identity", index: "03", label: "shape" },
  { key: "knowledge", index: "04", label: "memory" },
  { key: "service", index: "05", label: "offer" },
  { key: "ready", index: "06", label: "launch" },
];

const STAGE_META = {
  entry: {
    eyebrow: "first move",
    title: "Bring the business into the room.",
    copy:
      "Website, notes, and raw direction enter here. The page should feel like it listens, not like it asks you to fill a wizard.",
  },
  scanning: {
    eyebrow: "reading surface",
    title: "The system is pulling shape from the source.",
    copy:
      "We are scanning for signals, extracting business language, and drafting the first live version of the studio memory.",
  },
  identity: {
    eyebrow: "identity draft",
    title: "The first version of the business is taking form.",
    copy:
      "This stage should feel like a shaped response, not a spreadsheet of extracted fields.",
  },
  knowledge: {
    eyebrow: "memory build",
    title: "Signals are turning into usable knowledge.",
    copy:
      "Approve, reject, or refine what matters. The point is not quantity, it is sharpness.",
  },
  service: {
    eyebrow: "offer frame",
    title: "The offer layer comes into focus.",
    copy:
      "Services should emerge from the business direction naturally, not as a dull catalog setup step.",
  },
  ready: {
    eyebrow: "launch state",
    title: "The studio is close to becoming operational.",
    copy:
      "What remains is polishing the first working version and opening the workspace with confidence.",
  },
};

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

  const journeyItems = useMemo(() => {
    const currentIndex = JOURNEY.findIndex((item) => item.key === stage);

    return JOURNEY.map((item, index) => ({
      ...item,
      active: index === currentIndex,
      done: index < currentIndex,
    }));
  }, [stage]);

  const currentMeta = STAGE_META[stage] || STAGE_META.entry;
  const currentTitle =
    s(businessForm.companyName) ||
    discoveryProfileRows?.find?.(([label]) => label === "Name")?.[1] ||
    "Business identity";

  const currentDescription =
    s(businessForm.description) ||
    discoveryProfileRows?.find?.(([label]) => label === "Description")?.[1] ||
    "We extracted a first draft of the business direction from the website.";

  const rightRailItems = useMemo(() => {
    const readiness = `${Number(meta?.readinessScore || 0)}%`;
    const pending = String(Number(meta?.pendingCandidateCount || 0)).padStart(2, "0");
    const approved = String(Number(meta?.approvedKnowledgeCount || 0)).padStart(2, "0");
    const serviceCount = String(Number(meta?.serviceCount || services.length || 0)).padStart(2, "0");

    if (stage === "identity") {
      return [
        { label: "current draft", value: currentTitle },
        { label: "language", value: s(businessForm.language || "az").toUpperCase() },
        { label: "timezone", value: s(businessForm.timezone || "Asia/Baku") },
      ];
    }

    if (stage === "knowledge") {
      return [
        { label: "pending", value: pending },
        { label: "approved", value: approved },
        { label: "signals", value: String(knowledgePreview.length).padStart(2, "0") },
      ];
    }

    if (stage === "service") {
      return [
        { label: "services", value: serviceCount },
        { label: "seed title", value: s(serviceSuggestionTitle || "not set") },
        { label: "readiness", value: readiness },
      ];
    }

    if (stage === "ready") {
      return [
        { label: "readiness", value: readiness },
        { label: "knowledge", value: approved },
        { label: "services", value: serviceCount },
      ];
    }

    if (stage === "scanning") {
      return [
        { label: "surface", value: s(discoveryState.lastUrl || "waiting") },
        { label: "mode", value: "live scan" },
        { label: "pass", value: scanLines[scanLineIndex] },
      ];
    }

    return [
      { label: "state", value: "ready to begin" },
      { label: "knowledge", value: approved },
      { label: "services", value: serviceCount },
    ];
  }, [
    stage,
    meta,
    services.length,
    businessForm.language,
    businessForm.timezone,
    currentTitle,
    serviceSuggestionTitle,
    knowledgePreview.length,
    discoveryState.lastUrl,
    scanLines,
    scanLineIndex,
  ]);

  const statusLabel = discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode);

  if (loading) {
    return (
      <div className="setup-studio-loading">
        <div className="setup-studio-loading__pill">Setup studio hazırlanır...</div>
      </div>
    );
  }

  return (
    <div className="setup-studio-scene" data-stage={stage}>
      <div className="setup-studio-scene__backdrop">
        <div className="setup-studio-scene__ring setup-studio-scene__ring--left" />
        <div className="setup-studio-scene__ring setup-studio-scene__ring--right" />
        <div className="setup-studio-scene__beam setup-studio-scene__beam--top" />
        <div className="setup-studio-scene__beam setup-studio-scene__beam--bottom" />
      </div>

      <header className="setup-studio-scene__topbar">
        <div className="setup-studio-scene__brand">
          <span className="setup-studio-scene__brand-mark" />
          <span className="setup-studio-scene__brand-text">AI Setup Studio</span>
        </div>

        <div className="setup-studio-scene__topbar-actions">
          <div className="setup-studio-scene__status" data-mode={importingWebsite ? "running" : s(discoveryState.mode || "idle")}>
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

      <div className="setup-studio-scene__frame">
        <aside className="setup-studio-scene__rail setup-studio-scene__rail--left">
          <div className="setup-studio-scene__rail-index">
            {journeyItems.find((item) => item.active)?.index || "01"}
          </div>

          <div className="setup-studio-scene__rail-eyebrow">{currentMeta.eyebrow}</div>

          <h2 className="setup-studio-scene__rail-title">{currentMeta.title}</h2>

          <p className="setup-studio-scene__rail-copy">
            {stage === "identity" ? currentDescription : currentMeta.copy}
          </p>

          {error ? <div className="setup-studio-scene__error">{error}</div> : null}
        </aside>

        <main className="setup-studio-scene__main">
          <div className="setup-studio-scene__main-glow" />
          <div className="setup-studio-scene__stage-host">
            <AnimatePresence mode="wait" initial={false}>
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
        </main>

        <aside className="setup-studio-scene__rail setup-studio-scene__rail--right">
          <div className="setup-studio-scene__signal-label">live signals</div>

          <div className="setup-studio-scene__signal-list">
            {rightRailItems.map((item) => (
              <div key={item.label} className="setup-studio-scene__signal-row">
                <div className="setup-studio-scene__signal-name">{item.label}</div>
                <div className="setup-studio-scene__signal-value">{item.value}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="setup-studio-scene__journey">
        {journeyItems.map((item) => (
          <div
            key={item.key}
            className={[
              "setup-studio-scene__journey-item",
              item.active ? "is-active" : "",
              item.done ? "is-done" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="setup-studio-scene__journey-line" />
            <div className="setup-studio-scene__journey-meta">
              <span className="setup-studio-scene__journey-index">{item.index}</span>
              <span className="setup-studio-scene__journey-label">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

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