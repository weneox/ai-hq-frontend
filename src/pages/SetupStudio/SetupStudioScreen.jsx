import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import SetupStudioScene from "./SetupStudioScene.jsx";

import {
  arr,
  obj,
  s,
  profilePreviewRows,
  discoveryModeLabel,
  deriveStudioProgress,
} from "./lib/setupStudioHelpers.js";

import {
  createEmptyReviewState,
  createEmptyLegacyDraft,
  createIdleDiscoveryState,
  createEmptySourceScope,
  resolveMainLanguageValue,
  normalizeReviewState,
} from "./state/shared.js";

import {
  deriveSuggestedServicePayload,
  formFromProfile,
  hasExtractedIdentityProfile,
  isWebsiteBarrierWarning,
  hasMeaningfulProfile,
  shouldPreferCandidateCompanyName,
  hydrateBusinessFormFromProfile,
  chooseBestProfileForForm,
} from "./state/profile.js";

import {
  mapCurrentReviewToLegacyDraft,
  buildManualSectionsFromReview,
  resolveReviewSourceInfo,
  reviewStateMatchesSource,
  deriveVisibleKnowledgeItems,
  deriveVisibleServiceItems,
  deriveVisibleSources,
  deriveVisibleEvents,
} from "./state/reviewState.js";

import {
  DEFAULT_BUSINESS_FORM,
  DEFAULT_MANUAL_SECTIONS,
  DEFAULT_DISCOVERY_FORM,
  DEFAULT_SETUP_META,
} from "./logic/constants.js";

import {
  normalizeStudioSourceType,
  lowerText,
  pickKnowledgeCandidateId,
  pickKnowledgeRowId,
  sanitizeUiIdentityText,
} from "./logic/helpers.js";

import { createSetupStudioActions } from "./logic/actions.js";

export default function SetupStudioScreen() {
  const navigate = useNavigate();

  const autoRevealRef = useRef("");
  const activeSourceRef = useRef(createEmptySourceScope());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [importingWebsite, setImportingWebsite] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [actingKnowledgeId, setActingKnowledgeId] = useState("");
  const [savingServiceSuggestion, setSavingServiceSuggestion] = useState("");

  const [showRefine, setShowRefine] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);

  const [freshEntryMode, setFreshEntryMode] = useState(true);
  const [error, setError] = useState("");

  const [businessForm, setBusinessForm] = useState({
    ...DEFAULT_BUSINESS_FORM,
  });
  const [manualSections, setManualSections] = useState({
    ...DEFAULT_MANUAL_SECTIONS,
  });
  const [discoveryForm, setDiscoveryForm] = useState({
    ...DEFAULT_DISCOVERY_FORM,
  });

  const [currentReview, setCurrentReview] = useState(createEmptyReviewState);
  const [reviewDraft, setReviewDraft] = useState(createEmptyLegacyDraft);
  const [discoveryState, setDiscoveryState] = useState(createIdleDiscoveryState);
  const [activeSourceScope, setActiveSourceScope] = useState(
    createEmptySourceScope
  );

  const [knowledgeCandidates, setKnowledgeCandidates] = useState([]);
  const [services, setServices] = useState([]);
  const [meta, setMeta] = useState({
    ...DEFAULT_SETUP_META,
  });

  function setBusinessField(key, value) {
    setBusinessForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function setManualSection(key, value) {
    setManualSections((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function setDiscoveryField(key, value) {
    setDiscoveryForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateActiveSourceScope(sourceType = "", sourceUrl = "") {
    const normalizedUrl = s(sourceUrl);
    const normalizedType = normalizeStudioSourceType(sourceType, normalizedUrl);

    const next =
      normalizedUrl || normalizedType
        ? {
            sourceType: normalizedType,
            sourceUrl: normalizedUrl,
          }
        : createEmptySourceScope();

    activeSourceRef.current = next;
    setActiveSourceScope(next);
    return next;
  }

  function resolveActiveSourceScope(override = {}) {
    const rawUrl = s(
      override?.sourceUrl ||
        activeSourceRef.current?.sourceUrl ||
        activeSourceScope.sourceUrl ||
        discoveryState.lastUrl
    );

    const rawType =
      normalizeStudioSourceType(
        override?.sourceType ||
          activeSourceRef.current?.sourceType ||
          activeSourceScope.sourceType ||
          discoveryState.lastSourceType,
        rawUrl
      ) || "";

    return {
      sourceType: rawType,
      sourceUrl: rawUrl,
    };
  }

  function clearStudioReviewState({ preserveActiveSource = false } = {}) {
    autoRevealRef.current = "";
    setCurrentReview(createEmptyReviewState());
    setReviewDraft(createEmptyLegacyDraft());
    setDiscoveryState(createIdleDiscoveryState());
    setShowRefine(false);
    setShowKnowledge(false);

    if (!preserveActiveSource) {
      updateActiveSourceScope("", "");
    }
  }

  function resetBusinessTwinDraftForNewScan(nextSourceUrl = "") {
    setBusinessForm((prev) => ({
      ...DEFAULT_BUSINESS_FORM,
      timezone: s(prev.timezone || "Asia/Baku"),
      language: s(prev.language || "az"),
      websiteUrl: s(nextSourceUrl),
    }));

    setManualSections({
      ...DEFAULT_MANUAL_SECTIONS,
    });
  }

  function seedBusinessFormFromBootProfile(profile = {}) {
    setBusinessForm((prev) =>
      formFromProfile(profile, {
        ...DEFAULT_BUSINESS_FORM,
        timezone: s(prev.timezone || "Asia/Baku"),
      })
    );
  }

  function syncDiscoveryStateFromReview(review = {}, { preserveCounts = true } = {}) {
    const normalized = normalizeReviewState(review);
    const legacy = mapCurrentReviewToLegacyDraft(normalized);
    const profile = obj(legacy.overview);
    const reviewInfo = resolveReviewSourceInfo(normalized, legacy);

    const metadata = {
      reviewRequired: !!legacy.reviewRequired,
      reviewFlags: arr(legacy.reviewFlags),
      fieldConfidence: obj(legacy.fieldConfidence),
      mainLanguage:
        legacy.mainLanguage ||
        resolveMainLanguageValue(
          profile.mainLanguage,
          profile.primaryLanguage,
          profile.language
        ),
      primaryLanguage:
        legacy.primaryLanguage ||
        resolveMainLanguageValue(
          profile.primaryLanguage,
          profile.mainLanguage,
          profile.language
        ),
    };

    if (s(reviewInfo.sourceUrl) || lowerText(reviewInfo.sourceType) === "manual") {
      updateActiveSourceScope(reviewInfo.sourceType, reviewInfo.sourceUrl);
    }

    setDiscoveryState((prev) => ({
      ...prev,
      mainLanguage: metadata.mainLanguage || prev.mainLanguage || "",
      primaryLanguage: metadata.primaryLanguage || prev.primaryLanguage || "",
      reviewRequired: metadata.reviewRequired,
      reviewFlags: arr(metadata.reviewFlags),
      fieldConfidence: obj(metadata.fieldConfidence),
      reviewSessionId: s(normalized?.session?.id || prev.reviewSessionId),
      reviewSessionStatus: s(
        normalized?.session?.status || prev.reviewSessionStatus
      ),
      hasResults:
        prev.hasResults ||
        hasMeaningfulProfile(profile) ||
        arr(normalized?.sources).length > 0 ||
        arr(normalized?.events).length > 0 ||
        arr(legacy.reviewQueue).length > 0 ||
        arr(legacy.sections?.services).length > 0,
      resultCount: preserveCounts
        ? prev.resultCount
        : arr(legacy.reviewQueue).length +
          arr(legacy.sections?.services).length +
          arr(normalized?.sources).length +
          arr(normalized?.events).length,
      profile: Object.keys(profile).length ? profile : obj(prev.profile),
      warnings: arr(legacy.warnings).length
        ? arr(legacy.warnings)
        : arr(prev.warnings),
      candidateCount: preserveCounts
        ? prev.candidateCount
        : Number(legacy.stats?.knowledgeCount || prev.candidateCount || 0),
      sourceRunId: s(legacy.sourceRunId || prev.sourceRunId),
      snapshotId: s(legacy.snapshotId || prev.snapshotId),
      sourceId: s(legacy.sourceId || prev.sourceId),
      lastSourceType: s(reviewInfo.sourceType || prev.lastSourceType),
      lastUrl: s(reviewInfo.sourceUrl || prev.lastUrl),
    }));
  }

  function applyReviewState(
    reviewPayload = {},
    { preserveBusinessForm = false, fallbackProfile = {} } = {}
  ) {
    const normalized = normalizeReviewState(reviewPayload);
    const legacy = mapCurrentReviewToLegacyDraft(normalized);
    const nextManualSections = buildManualSectionsFromReview(normalized);
    const reviewInfo = resolveReviewSourceInfo(normalized, legacy);

    if (s(reviewInfo.sourceUrl) || lowerText(reviewInfo.sourceType) === "manual") {
      updateActiveSourceScope(reviewInfo.sourceType, reviewInfo.sourceUrl);
    }

    setCurrentReview(normalized);
    setReviewDraft(legacy);

    const preferredProfile = chooseBestProfileForForm(
      legacy.overview,
      fallbackProfile
    );

    setBusinessForm((prev) => {
      if (!hasMeaningfulProfile(preferredProfile)) {
        return preserveBusinessForm
          ? prev
          : formFromProfile(legacy.overview, prev);
      }

      return hydrateBusinessFormFromProfile(
        preserveBusinessForm ? prev : formFromProfile(legacy.overview, prev),
        preferredProfile,
        { force: !preserveBusinessForm }
      );
    });

    setManualSections((prev) => ({
      servicesText:
        preserveBusinessForm && s(prev.servicesText)
          ? s(prev.servicesText)
          : s(nextManualSections.servicesText),
      faqsText:
        preserveBusinessForm && s(prev.faqsText)
          ? s(prev.faqsText)
          : s(nextManualSections.faqsText),
      policiesText:
        preserveBusinessForm && s(prev.policiesText)
          ? s(prev.policiesText)
          : s(nextManualSections.policiesText),
    }));

    syncDiscoveryStateFromReview(normalized, { preserveCounts: false });

    return {
      currentReview: normalized,
      reviewDraft: legacy,
    };
  }

  const activeReviewAligned = useMemo(() => {
    if (freshEntryMode) return false;

    const scopedUrl = s(activeSourceScope.sourceUrl || discoveryState.lastUrl);
    const scopedType = normalizeStudioSourceType(
      activeSourceScope.sourceType || discoveryState.lastSourceType,
      scopedUrl
    );

    if (scopedType === "manual") {
      return !!s(currentReview?.session?.id);
    }

    if (!scopedUrl) return false;

    return reviewStateMatchesSource(
      currentReview,
      reviewDraft,
      scopedType,
      scopedUrl
    );
  }, [
    freshEntryMode,
    activeSourceScope,
    currentReview,
    reviewDraft,
    discoveryState.lastSourceType,
    discoveryState.lastUrl,
  ]);

  const scopedCurrentReview = useMemo(() => {
    if (freshEntryMode || !activeReviewAligned) return createEmptyReviewState();
    return currentReview;
  }, [freshEntryMode, activeReviewAligned, currentReview]);

  const scopedReviewDraft = useMemo(() => {
    if (freshEntryMode || !activeReviewAligned) return createEmptyLegacyDraft();
    return reviewDraft;
  }, [freshEntryMode, activeReviewAligned, reviewDraft]);

  const visibleKnowledgeItems = useMemo(() => {
    if (freshEntryMode) return [];

    return deriveVisibleKnowledgeItems({
      reviewDraft: scopedReviewDraft,
      currentReview: scopedCurrentReview,
      discoveryState,
    });
  }, [freshEntryMode, scopedReviewDraft, scopedCurrentReview, discoveryState]);

  const visibleServiceItems = useMemo(() => {
    if (freshEntryMode) return [];

    return deriveVisibleServiceItems({
      reviewDraft: scopedReviewDraft,
      currentReview: scopedCurrentReview,
      discoveryState,
    });
  }, [freshEntryMode, scopedReviewDraft, scopedCurrentReview, discoveryState]);

  const visibleSources = useMemo(() => {
    if (freshEntryMode) return [];
    return deriveVisibleSources({
      currentReview: scopedCurrentReview,
      discoveryState,
    });
  }, [freshEntryMode, scopedCurrentReview, discoveryState]);

  const visibleEvents = useMemo(() => {
    if (freshEntryMode) return [];
    return deriveVisibleEvents(scopedCurrentReview);
  }, [freshEntryMode, scopedCurrentReview]);

  const draftBackedProfile = useMemo(() => {
    if (freshEntryMode) return obj(discoveryState.profile);

    if (Object.keys(obj(scopedReviewDraft?.overview)).length) {
      return obj(scopedReviewDraft?.overview);
    }

    return obj(discoveryState.profile);
  }, [freshEntryMode, scopedReviewDraft, discoveryState.profile]);

  const discoveryProfileRows = useMemo(
    () => (freshEntryMode ? [] : profilePreviewRows(draftBackedProfile)),
    [freshEntryMode, draftBackedProfile]
  );

  const hasVisibleResults = useMemo(() => {
    if (freshEntryMode) return false;

    return !!(
      hasMeaningfulProfile(draftBackedProfile) ||
      discoveryProfileRows.length > 0 ||
      visibleKnowledgeItems.length > 0 ||
      visibleServiceItems.length > 0 ||
      visibleSources.length > 0 ||
      visibleEvents.length > 0 ||
      arr(discoveryState?.warnings).length > 0 ||
      arr(discoveryState?.reviewFlags).length > 0 ||
      s(scopedReviewDraft?.quickSummary)
    );
  }, [
    freshEntryMode,
    draftBackedProfile,
    discoveryProfileRows,
    visibleKnowledgeItems,
    visibleServiceItems,
    visibleSources,
    visibleEvents,
    discoveryState?.warnings,
    discoveryState?.reviewFlags,
    scopedReviewDraft?.quickSummary,
  ]);

  const effectiveMeta = useMemo(() => {
    const pendingVisibleCount = visibleKnowledgeItems.filter((item) => {
      const status = s(item.status).toLowerCase();
      return !status || status === "pending" || status === "review";
    }).length;

    const mergedReviewFlags = arr(scopedReviewDraft?.reviewFlags).length
      ? arr(scopedReviewDraft.reviewFlags)
      : arr(discoveryState.reviewFlags);

    return {
      ...meta,
      pendingCandidateCount: Math.max(
        Number(meta.pendingCandidateCount || 0),
        pendingVisibleCount
      ),
      serviceCount: Math.max(
        Number(meta.serviceCount || 0),
        visibleServiceItems.length
      ),
      mainLanguage:
        resolveMainLanguageValue(
          scopedReviewDraft?.mainLanguage,
          draftBackedProfile?.mainLanguage,
          discoveryState?.mainLanguage,
          businessForm?.language
        ) || "",
      reviewRequired: !!(
        scopedReviewDraft?.reviewRequired || discoveryState?.reviewRequired
      ),
      reviewFlags: mergedReviewFlags,
      fieldConfidence: Object.keys(obj(scopedReviewDraft?.fieldConfidence)).length
        ? obj(scopedReviewDraft.fieldConfidence)
        : obj(discoveryState.fieldConfidence),
    };
  }, [
    meta,
    visibleKnowledgeItems,
    visibleServiceItems,
    scopedReviewDraft,
    discoveryState,
    draftBackedProfile,
    businessForm,
  ]);

  const serviceSuggestionTitle = useMemo(() => {
    const derived = deriveSuggestedServicePayload({
      discoveryForm,
      discoveryState,
      knowledgeCandidates: visibleKnowledgeItems,
    });
    return s(derived.title);
  }, [discoveryForm, discoveryState, visibleKnowledgeItems]);

  const studioProgress = useMemo(() => {
    const derived = obj(
      deriveStudioProgress({
        importingWebsite,
        discoveryState,
        meta: effectiveMeta,
      })
    );

    return {
      ...derived,
      readinessScore: Number(
        effectiveMeta.readinessScore || derived.readinessScore || 0
      ),
      readinessLabel: s(effectiveMeta.readinessLabel || derived.readinessLabel),
      missingSteps: arr(effectiveMeta.missingSteps).length
        ? arr(effectiveMeta.missingSteps)
        : arr(derived.missingSteps),
      primaryMissingStep: s(
        effectiveMeta.primaryMissingStep || derived.primaryMissingStep
      ),
      nextRoute: s(effectiveMeta.nextRoute || derived.nextRoute || "/"),
      nextSetupRoute: s(
        effectiveMeta.nextSetupRoute || derived.nextSetupRoute || "/setup/studio"
      ),
      nextStudioStage: s(effectiveMeta.nextStudioStage || ""),
      setupCompleted: !!(effectiveMeta.setupCompleted ?? derived.setupCompleted),
    };
  }, [importingWebsite, discoveryState, effectiveMeta]);

  const knowledgePreview = useMemo(() => {
    return visibleKnowledgeItems.slice(0, 6).map((item, index) => ({
      ...item,
      id: pickKnowledgeRowId(item, `knowledge-${index + 1}`),
      rowId: pickKnowledgeRowId(item, `knowledge-${index + 1}`),
      candidateId: pickKnowledgeCandidateId(item),
      title: s(item.title),
      value: s(item.valueText || item.value),
      category: s(item.category),
      source: s(item.source || item.sourceType),
      confidence:
        typeof item.confidence === "number"
          ? item.confidence
          : Number(item.confidence || 0) || 0,
      status: s(item.status || "pending"),
      evidenceUrl: s(item.evidenceUrl),
    }));
  }, [visibleKnowledgeItems]);

  const currentTitle = useMemo(() => {
    const warningSet = arr(discoveryState.warnings);

    const businessName = sanitizeUiIdentityText(
      businessForm.companyName,
      warningSet
    );

    const reviewName = sanitizeUiIdentityText(
      scopedReviewDraft?.overview?.companyName ||
        scopedReviewDraft?.overview?.displayName ||
        scopedReviewDraft?.overview?.name,
      warningSet
    );

    if (shouldPreferCandidateCompanyName(businessName, reviewName)) {
      return reviewName;
    }

    return s(businessName || reviewName);
  }, [businessForm.companyName, scopedReviewDraft, discoveryState.warnings]);

  const currentDescription = useMemo(
    () =>
      sanitizeUiIdentityText(
        scopedReviewDraft?.quickSummary ||
          businessForm.description ||
          scopedReviewDraft?.overview?.summaryShort ||
          discoveryState?.profile?.summaryShort,
        arr(discoveryState.warnings)
      ),
    [scopedReviewDraft, businessForm.description, discoveryState]
  );

  const autoRevealKey = useMemo(() => {
    return [
      s(discoveryState.requestId),
      s(discoveryState.sourceRunId),
      s(scopedReviewDraft.sourceRunId),
      String(discoveryProfileRows.length),
      String(visibleKnowledgeItems.length),
      String(visibleServiceItems.length),
      String(visibleSources.length),
      String(visibleEvents.length),
      s(discoveryState.mode),
      s(discoveryState.mainLanguage),
      String(arr(discoveryState.reviewFlags).length),
      s(discoveryState.lastSourceType),
    ]
      .filter(Boolean)
      .join("|");
  }, [
    discoveryState.requestId,
    discoveryState.sourceRunId,
    scopedReviewDraft.sourceRunId,
    discoveryProfileRows.length,
    visibleKnowledgeItems.length,
    visibleServiceItems.length,
    visibleSources.length,
    visibleEvents.length,
    discoveryState.mode,
    discoveryState.mainLanguage,
    discoveryState.reviewFlags,
    discoveryState.lastSourceType,
  ]);

  const actions = createSetupStudioActions({
    navigate,
    freshEntryMode,
    discoveryForm,
    businessForm,
    manualSections,
    currentReview,
    reviewDraft,
    discoveryState,
    activeSourceScope,
    visibleKnowledgeItems,

    autoRevealRef,

    setLoading,
    setRefreshing,
    setImportingWebsite,
    setSavingBusiness,
    setActingKnowledgeId,
    setSavingServiceSuggestion,
    setShowRefine,
    setShowKnowledge,
    setFreshEntryMode,
    setError,
    setBusinessForm,
    setManualSections,
    setCurrentReview,
    setReviewDraft,
    setDiscoveryState,
    setKnowledgeCandidates,
    setServices,
    setMeta,

    updateActiveSourceScope,
    resolveActiveSourceScope,
    clearStudioReviewState,
    resetBusinessTwinDraftForNewScan,
    seedBusinessFormFromBootProfile,
    syncDiscoveryStateFromReview,
    applyReviewState,
    createEmptyReviewState,
    createEmptyLegacyDraft,
    pickKnowledgeCandidateId,
  });

  useEffect(() => {
    actions.loadData({
      hydrateReview: false,
      preserveBusinessForm: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (freshEntryMode) return;
    if (meta.setupCompleted) return;

    if (
      s(meta.nextStudioStage).toLowerCase() === "knowledge" &&
      knowledgeCandidates.length > 0
    ) {
      setShowKnowledge(true);
    }
  }, [
    freshEntryMode,
    meta.nextStudioStage,
    meta.setupCompleted,
    knowledgeCandidates.length,
  ]);

  useEffect(() => {
    if (freshEntryMode) return;

    const mode = s(discoveryState.mode).toLowerCase();

    if (!hasVisibleResults) return;
    if (mode === "idle" || mode === "running") return;
    if (!autoRevealKey) return;

    if (
      !activeReviewAligned &&
      !hasExtractedIdentityProfile(discoveryState.profile) &&
      arr(discoveryState.warnings).length === 0
    ) {
      return;
    }

    if (autoRevealRef.current === autoRevealKey) return;
    autoRevealRef.current = autoRevealKey;

    const barrierOnly =
      mode === "partial" &&
      arr(discoveryState.warnings).some((item) => isWebsiteBarrierWarning(item)) &&
      !hasExtractedIdentityProfile(discoveryState.profile) &&
      visibleKnowledgeItems.length === 0 &&
      visibleServiceItems.length === 0;

    setShowRefine(!barrierOnly);

    if (
      !barrierOnly &&
      (visibleKnowledgeItems.length > 0 ||
        visibleServiceItems.length > 0 ||
        discoveryProfileRows.length > 0)
    ) {
      setShowKnowledge(true);
    }
  }, [
    freshEntryMode,
    autoRevealKey,
    hasVisibleResults,
    discoveryState.mode,
    discoveryState.profile,
    discoveryState.warnings,
    visibleKnowledgeItems.length,
    visibleServiceItems.length,
    discoveryProfileRows.length,
    activeReviewAligned,
  ]);

  return (
    <SetupStudioScene
      loading={loading}
      refreshing={refreshing}
      importingWebsite={importingWebsite}
      savingBusiness={savingBusiness}
      actingKnowledgeId={actingKnowledgeId}
      savingServiceSuggestion={savingServiceSuggestion}
      showRefine={showRefine}
      showKnowledge={showKnowledge}
      error={error}
      businessForm={businessForm}
      discoveryForm={discoveryForm}
      discoveryState={discoveryState}
      reviewDraft={scopedReviewDraft}
      manualSections={manualSections}
      meta={effectiveMeta}
      currentTitle={currentTitle}
      currentDescription={currentDescription}
      discoveryProfileRows={discoveryProfileRows}
      knowledgePreview={knowledgePreview}
      knowledgeItems={visibleKnowledgeItems}
      serviceSuggestionTitle={serviceSuggestionTitle}
      studioProgress={studioProgress}
      services={visibleServiceItems}
      reviewSources={visibleSources}
      reviewEvents={visibleEvents}
      hasVisibleResults={hasVisibleResults}
      visibleKnowledgeCount={visibleKnowledgeItems.length}
      visibleServiceCount={visibleServiceItems.length}
      onSetBusinessField={setBusinessField}
      onSetManualSection={setManualSection}
      onSetDiscoveryField={setDiscoveryField}
      onScanBusiness={actions.onScanBusiness}
      onContinueFlow={() => actions.onScanBusiness(discoveryForm)}
      onSaveBusiness={actions.onSaveBusiness}
      onApproveKnowledge={actions.onApproveKnowledge}
      onRejectKnowledge={actions.onRejectKnowledge}
      onCreateSuggestedService={actions.onCreateSuggestedService}
      onOpenWorkspace={actions.onOpenWorkspace}
      onReloadReviewDraft={() =>
        actions.loadCurrentReview({
          preserveBusinessForm: true,
          activateReviewSession: true,
          activeSourceType: activeSourceScope.sourceType,
          activeSourceUrl: activeSourceScope.sourceUrl,
        })
      }
      onRefresh={() =>
        actions.loadData({
          silent: true,
          preserveBusinessForm: !freshEntryMode,
          hydrateReview: !freshEntryMode,
          activeSourceType: activeSourceScope.sourceType,
          activeSourceUrl: activeSourceScope.sourceUrl,
        })
      }
      onToggleRefine={() => setShowRefine((prev) => !prev)}
      onToggleKnowledge={() => setShowKnowledge((prev) => !prev)}
      discoveryModeLabel={discoveryModeLabel}
    />
  );
}