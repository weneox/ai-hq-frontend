import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  isSuccessMode,
  s,
  obj,
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
import SetupStudioModalLayer from "./scene/SetupStudioModalLayer.jsx";
import { formatFieldLabel } from "./scene/shared.js";
import {
  buildRecoveredStage,
  buildStatusLabel,
  buildSceneSummaryState,
  resolveLanguageLabel,
} from "./scene/derived.js";

function toneClasses(tone = "neutral") {
  if (tone === "warn") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (tone === "danger") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (tone === "info") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (tone === "success") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-white text-slate-700";
}

function normalizeUiFlag(value = "") {
  const x = s(value).toLowerCase();

  if (!x) return "";

  if (x === "http_403") return "Website access limited";
  if (x === "http_429") return "Website rate limited";
  if (x === "fetch_failed") return "Could not read website";
  if (x === "non_html_response") return "Unsupported website response";
  if (x === "sitemap_fetch_timeout") return "Sitemap timed out";
  if (x === "some_pages_rejected_as_weak_or_placeholder") return "Weak pages filtered";
  if (x === "review_required") return "Review required";

  return s(value).replaceAll("_", " ");
}

function stageIntroMeta({
  stage,
  importingWebsite,
  hasScannedUrl,
  reviewRequired,
  sourceLabel,
  resolvedLanguage,
}) {
  if (importingWebsite || stage === "scanning") {
    return {
      eyebrow: "BUILDING DRAFT",
      title: "We’re preparing the first business draft.",
      description:
        "We’re reading the primary source, extracting business signals, and structuring a reviewable draft.",
    };
  }

  if (stage === "entry") {
    return {
      eyebrow: "START",
      title: hasScannedUrl
        ? "Review the first pass, then continue."
        : "Tell AI how to learn your business.",
      description: hasScannedUrl
        ? "Use the source result as a starting point, refine the draft, then continue into launch setup."
        : "Start with a source, a short business description, or both. The system should help — not force a long setup form.",
    };
  }

  if (stage === "identity") {
    return {
      eyebrow: "BUILD DRAFT",
      title: "Confirm the business identity.",
      description:
        "Check the business name, description, contact signals, and source quality before moving forward.",
    };
  }

  if (stage === "knowledge") {
    return {
      eyebrow: "BUILD DRAFT",
      title: "Review what customers may ask about.",
      description:
        "Approve the useful knowledge, reject the noise, and shape the questions AI should answer well.",
    };
  }

  if (stage === "service") {
    return {
      eyebrow: "BUILD DRAFT",
      title: "Shape the service structure.",
      description:
        "Decide what should become real service seeds so the runtime can answer with more confidence.",
    };
  }

  if (stage === "ready") {
    return {
      eyebrow: "LAUNCH",
      title: "The draft is ready for launch setup.",
      description:
        "Open the workspace, review the final details, and connect the channel flow you want to run first.",
    };
  }

  return {
    eyebrow: "SETUP STUDIO",
    title: sourceLabel
      ? `Working from ${sourceLabel}`
      : "Prepare your business draft",
    description: resolvedLanguage
      ? `Detected language: ${resolveLanguageLabel(resolvedLanguage)}`
      : "Review the current studio state and continue.",
  };
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

  const [stayOnSourceStage, setStayOnSourceStage] = useState(true);
  const [stage, setStage] = useState("entry");
  const [scanLineIndex, setScanLineIndex] = useState(0);
  const [overlayIntent, setOverlayIntent] = useState("");

  const scanLines = [
    "Reading the primary source",
    "Extracting business identity",
    "Collecting knowledge signals",
    "Detecting service structure",
  ];

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

  const flowSteps = [
    { key: "start", label: "Start" },
    { key: "draft", label: "Build Draft" },
    { key: "launch", label: "Launch" },
  ];

  const currentFlowStep = importingWebsite
    ? "draft"
    : stage === "entry"
      ? "start"
      : stage === "ready"
        ? "launch"
        : "draft";

  const currentFlowIndex = Math.max(
    0,
    flowSteps.findIndex((item) => item.key === currentFlowStep)
  );

  const stageIntro = stageIntroMeta({
    stage,
    importingWebsite,
    hasScannedUrl,
    reviewRequired,
    sourceLabel: entryAnalysisSourceLabel || sourceLabel,
    resolvedLanguage,
  });

  const uiFlags = useMemo(() => {
    const list = [];

    if (entryAnalysisSourceLabel || sourceLabel) {
      list.push({
        key: "source",
        label: `Source · ${entryAnalysisSourceLabel || sourceLabel}`,
        tone: "neutral",
      });
    }

    if (resolvedLanguage) {
      list.push({
        key: "language",
        label: `Language · ${resolveLanguageLabel(resolvedLanguage)}`,
        tone: "info",
      });
    }

    if (reviewRequired) {
      list.push({
        key: "review",
        label: "Needs review",
        tone: "warn",
      });
    }

    if (reviewStatusLabel) {
      list.push({
        key: "session",
        label: `Session · ${reviewStatusLabel}`,
        tone: "neutral",
      });
    }

    if (weakestFieldBadges.length > 0) {
      const item = weakestFieldBadges[0];
      list.push({
        key: `weak-${item.key}`,
        label: `${formatFieldLabel(item.key)} · ${item.label || `${Math.round(item.score * 100)}%`}`,
        tone: "danger",
      });
    }

    if (stageWarnings.length > 0) {
      list.push({
        key: "warning",
        label: normalizeUiFlag(stageWarnings[0]),
        tone: "warn",
      });
    }

    if (reviewFlags.length > 0) {
      list.push({
        key: "flag",
        label: normalizeUiFlag(reviewFlags[0]),
        tone: "warn",
      });
    }

    if (error) {
      list.push({
        key: "error",
        label: s(error),
        tone: "danger",
      });
    }

    return list.slice(0, 5);
  }, [
    entryAnalysisSourceLabel,
    sourceLabel,
    resolvedLanguage,
    reviewRequired,
    reviewStatusLabel,
    weakestFieldBadges,
    stageWarnings,
    reviewFlags,
    error,
  ]);

  const statusLabel = buildStatusLabel({
    importingWebsite,
    discoveryState,
    discoveryModeLabel,
    reviewRequired,
  });

  const statusTone = importingWebsite
    ? "info"
    : reviewRequired || stageWarnings.length > 0
      ? "warn"
      : scanSucceeded
        ? "success"
        : "neutral";

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.28),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-6">
        <div className="rounded-full border border-slate-200 bg-white/90 px-5 py-2 text-sm font-medium text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`setup-studio-scene h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.34),transparent_34%),radial-gradient(circle_at_right_top,rgba(216,180,254,0.14),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#f2f6fd_46%,#eef3fb_100%)] ${
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
          hasOverlay
            ? "pointer-events-none select-none opacity-[0.96] blur-[1px]"
            : ""
        }`}
      >
        <header className="shrink-0 border-b border-white/60 bg-white/68 backdrop-blur-xl">
          <div className="mx-auto flex h-[78px] w-full max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <span className="h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,.96),rgba(147,197,253,.92)_40%,rgba(15,23,42,.82)_85%)]" />
              </span>

              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold tracking-[0.28em] text-slate-950">
                  AI SETUP STUDIO
                </div>
                <div className="truncate text-[12px] text-slate-500">
                  Guided onboarding for your first live business draft
                </div>
              </div>
            </div>

            <div className="hidden min-w-0 items-center md:flex">
              <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                {flowSteps.map((item, index) => {
                  const isActive = index === currentFlowIndex;
                  const isDone = index < currentFlowIndex;

                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      {index > 0 ? (
                        <span
                          className={`h-px w-8 ${
                            isDone ? "bg-slate-400" : "bg-slate-200"
                          }`}
                        />
                      ) : null}

                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                            isActive
                              ? "bg-slate-950 text-white"
                              : isDone
                                ? "bg-slate-200 text-slate-700"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span
                          className={`text-[13px] font-medium ${
                            isActive
                              ? "text-slate-950"
                              : isDone
                                ? "text-slate-700"
                                : "text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={`hidden rounded-full border px-3 py-2 text-sm font-medium shadow-sm sm:flex ${toneClasses(
                  statusTone
                )}`}
                data-mode={importingWebsite ? "running" : s(discoveryState?.mode || "idle")}
              >
                <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-current opacity-80" />
                {statusLabel}
              </div>

              {!importingWebsite && stage !== "entry" ? (
                <button
                  type="button"
                  onClick={handleGoToSourceStage}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/88 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Source
                </button>
              ) : null}

              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                aria-label="Refresh"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/88 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <main className="px-4 pb-8 pt-5 sm:px-6 lg:px-10 lg:pb-10 lg:pt-6">
            <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5">
              <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/72 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-200/20 blur-3xl" />
                <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-indigo-200/15 blur-3xl" />

                <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between lg:p-7">
                  <div className="max-w-[860px]">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      <Sparkles className="h-3.5 w-3.5" />
                      {stageIntro.eyebrow}
                    </div>

                    <h1 className="max-w-[900px] text-[30px] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-[38px] lg:text-[52px]">
                      {stageIntro.title}
                    </h1>

                    <p className="mt-3 max-w-[820px] text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                      {stageIntro.description}
                    </p>
                  </div>

                  <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-[420px]">
                    <div className="rounded-[22px] border border-white/80 bg-white/82 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Knowledge
                      </div>
                      <div className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-slate-950">
                        {resultKnowledgeCount}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/80 bg-white/82 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Services
                      </div>
                      <div className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-slate-950">
                        {resultServiceCount}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/80 bg-white/82 px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Sources
                      </div>
                      <div className="mt-2 text-[26px] font-semibold tracking-[-0.04em] text-slate-950">
                        {resultSourceCount}
                      </div>
                    </div>
                  </div>
                </div>

                {uiFlags.length > 0 ? (
                  <div className="relative border-t border-slate-200/70 px-5 py-4 sm:px-6 lg:px-7">
                    <div className="flex flex-wrap gap-2.5">
                      {uiFlags.map((item) => (
                        <span
                          key={item.key}
                          className={`rounded-full border px-3 py-1.5 text-[13px] font-medium ${toneClasses(
                            item.tone
                          )}`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              {nextStudioStage || reviewDraft?.stats?.pendingReviewCount ? (
                <section className="grid gap-3 lg:grid-cols-2">
                  {nextStudioStage ? (
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/78 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)] backdrop-blur">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Next up
                      </div>
                      <div className="mt-2 text-[15px] font-medium text-slate-900">
                        {nextStudioStage}
                      </div>
                    </div>
                  ) : null}

                  {reviewDraft?.stats?.pendingReviewCount ? (
                    <div className="rounded-[24px] border border-slate-200/80 bg-white/78 px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.04)] backdrop-blur">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Pending review
                      </div>
                      <div className="mt-2 text-[15px] font-medium text-slate-900">
                        {Number(reviewDraft.stats.pendingReviewCount || 0)} item
                        {Number(reviewDraft.stats.pendingReviewCount || 0) === 1 ? "" : "s"}
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="relative">
                <AnimatePresence mode="wait" initial={false}>
                  {stage === "entry" ? (
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
                      onOpenKnowledge={
                        knowledgeContentAvailable ? handleOpenKnowledge : undefined
                      }
                      onContinueFlow={handleContinueFlow}
                    />
                  ) : null}

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
              </section>

              {!importingWebsite && stage !== "entry" ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGoToSourceStage}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/86 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
                  >
                    Return to source setup
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </main>
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