import { getAppBootstrap } from "../../../api/app.js";
import {
  importBundleForSetup,
  importSourceForSetup,
  analyzeSetupIntake,
  getCurrentSetupReview,
  patchCurrentSetupReview,
  finalizeCurrentSetupReview,
} from "../../../api/setup.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../../../api/knowledge.js";
import { createSetupService, getSetupServices } from "../../../api/services.js";

import {
  arr,
  obj,
  s,
  firstLanguage,
  extractItems,
  isPendingKnowledge,
  profilePatchFromDiscovery,
  profilePreviewRows,
} from "../lib/setupStudioHelpers.js";

import {
  pickSetupProfile,
  normalizeBootMeta,
  resolveMainLanguageValue,
  normalizeReviewState,
  normalizeScanRequest,
  scanStartLabel,
  scanCompleteLabel,
  applyUiHintsFromMeta,
} from "../state/shared.js";

import {
  deriveSuggestedServicePayload,
  formFromProfile,
  hasMeaningfulProfile,
  isBarrierOnlyImportResult,
  buildBusinessProfilePatch,
  buildCapabilitiesPatch,
  hydrateBusinessFormFromProfile,
  chooseBestProfileForForm,
} from "../state/profile.js";

import {
  mapCurrentReviewToLegacyDraft,
  buildManualSectionsFromReview,
  resolveReviewSourceInfo,
  reviewStateMatchesSource,
  buildServiceDraftItemsFromManual,
  buildKnowledgeDraftItemsFromManual,
  deriveVisibleKnowledgeItems,
  deriveVisibleServiceItems,
  deriveVisibleSources,
  deriveVisibleEvents,
} from "../state/reviewState.js";

import {
  compactObject,
  normalizeRequestedSourceRows,
  pickRequestedPrimarySource,
  buildAnalyzePayloadFromStudioState,
  buildSafeUiProfile,
  sourceLabelFor,
  lowerText,
} from "./helpers.js";
import { DEFAULT_BUSINESS_FORM } from "./constants.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function maybeUuid(value = "") {
  const x = s(value);
  return UUID_RE.test(x) ? x : "";
}

function pickDirectKnowledgeCandidateUuid(item = {}) {
  const x = obj(item);
  const candidate = obj(x.candidate);

  return (
    maybeUuid(x.candidateUuid) ||
    maybeUuid(x.candidate_uuid) ||
    maybeUuid(x.candidateId) ||
    maybeUuid(x.candidate_id) ||
    maybeUuid(x.knowledgeCandidateId) ||
    maybeUuid(x.knowledge_candidate_id) ||
    maybeUuid(x.reviewCandidateId) ||
    maybeUuid(x.review_candidate_id) ||
    maybeUuid(x.uuid) ||
    maybeUuid(candidate.id) ||
    maybeUuid(candidate.uuid) ||
    maybeUuid(candidate.candidateId) ||
    maybeUuid(candidate.candidate_id) ||
    ""
  );
}

function knowledgeSignature(item = {}) {
  const x = obj(item);
  const candidate = obj(x.candidate);

  const evidenceUrl = s(
    x.evidenceUrl ||
      x.evidence_url ||
      x.url ||
      x.link ||
      obj(arr(x.evidence)[0]).url ||
      obj(arr(x.evidence)[0]).pageUrl
  );

  return [
    s(x.rowId || x.row_id),
    s(x.id),
    s(x.key),
    s(x.itemKey || x.item_key),
    s(x.title || x.label),
    s(x.value || x.valueText || x.value_text || x.description),
    evidenceUrl,
    s(candidate.id || candidate.uuid || candidate.candidateId),
  ]
    .filter(Boolean)
    .join("::")
    .toLowerCase();
}

function resolveKnowledgeCandidateUuid({
  item,
  visibleKnowledgeItems,
  pickKnowledgeCandidateId,
}) {
  const fromCtx = maybeUuid(
    typeof pickKnowledgeCandidateId === "function"
      ? pickKnowledgeCandidateId(item)
      : ""
  );

  if (fromCtx) return fromCtx;

  const direct = pickDirectKnowledgeCandidateUuid(item);
  if (direct) return direct;

  const targetSig = knowledgeSignature(item);
  const targetRowId = s(item?.rowId || item?.row_id);
  const targetId = s(item?.id);
  const targetTitle = s(item?.title || item?.label);
  const targetValue = s(
    item?.value || item?.valueText || item?.value_text || item?.description
  );

  const matched = arr(visibleKnowledgeItems).find((entry) => {
    const sig = knowledgeSignature(entry);

    if (targetSig && sig && targetSig === sig) return true;
    if (targetRowId && targetRowId === s(entry?.rowId || entry?.row_id))
      return true;
    if (targetId && targetId === s(entry?.id)) return true;

    return (
      targetTitle &&
      targetValue &&
      targetTitle === s(entry?.title || entry?.label) &&
      targetValue ===
        s(
          entry?.value ||
            entry?.valueText ||
            entry?.value_text ||
            entry?.description
        )
    );
  });

  const matchedFromCtx = maybeUuid(
    typeof pickKnowledgeCandidateId === "function"
      ? pickKnowledgeCandidateId(matched)
      : ""
  );

  if (matchedFromCtx) return matchedFromCtx;

  return pickDirectKnowledgeCandidateUuid(matched);
}

function currentReviewConcurrencyMeta(review = {}, discoveryState = {}) {
  const session = obj(review?.session);

  return {
    sessionId: s(
      session.id ||
        session.sessionId ||
        session.session_id ||
        discoveryState?.reviewSessionId
    ),
    sessionStatus: s(
      session.status ||
        session.reviewStatus ||
        session.review_status ||
        discoveryState?.reviewSessionStatus
    ),
    revision: s(
      session.revision ||
        session.reviewRevision ||
        session.review_revision ||
        session.version ||
        session.etag ||
        discoveryState?.reviewSessionRevision
    ),
    freshness: s(session.freshness || discoveryState?.reviewFreshness || "unknown"),
    stale: !!(
      session.stale ||
      session.isStale ||
      discoveryState?.reviewStale ||
      s(session.freshness || discoveryState?.reviewFreshness).toLowerCase() === "stale"
    ),
    conflicted: !!(
      session.conflicted ||
      session.conflict ||
      discoveryState?.reviewConflicted ||
      s(session.freshness || discoveryState?.reviewFreshness).toLowerCase() === "conflict"
    ),
    message: s(
      session.conflictMessage ||
        session.conflict_message ||
        discoveryState?.reviewConflictMessage
    ),
  };
}

function buildReviewConcurrencyPayload(meta = {}) {
  const sessionId = s(meta.sessionId);
  const revision = s(meta.revision);
  const payload = {};

  if (sessionId) {
    payload.sessionId = sessionId;
    payload.reviewSessionId = sessionId;
  }

  if (revision) {
    payload.revision = revision;
    payload.reviewRevision = revision;
    payload.version = revision;
  }

  return payload;
}

function parseReviewConcurrencyError(error, meta = {}) {
  const message = String(error?.message || error || "").trim();
  const lowered = lowerText(message);
  const conflicted =
    /conflict|revision mismatch|version mismatch|precondition|409|412/.test(
      lowered
    );
  const stale =
    !conflicted &&
    /stale|expired|out[_ -]?of[_ -]?date|outdated/.test(lowered);

  return {
    sessionId: s(meta.sessionId),
    sessionStatus: s(meta.sessionStatus),
    revision: s(meta.revision),
    freshness: conflicted ? "conflict" : stale ? "stale" : s(meta.freshness || "unknown"),
    stale,
    conflicted,
    message,
  };
}

export function createSetupStudioActions(ctx) {
  const {
    navigate,
    freshEntryMode,
    discoveryForm,
    businessForm,
    manualSections,
    currentReview,
    reviewDraft,
    discoveryState,
    activeSourceScope,
    activeReviewAligned,
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
  } = ctx;

  function clearActiveReviewSession() {
    const empty = createEmptyReviewState();
    setCurrentReview(empty);
    setReviewDraft(createEmptyLegacyDraft());
    return empty;
  }

  function setReviewSyncIssue(issue = {}) {
    setDiscoveryState((prev) => ({
      ...prev,
      reviewSessionId: s(issue.sessionId || prev.reviewSessionId),
      reviewSessionStatus: s(issue.sessionStatus || prev.reviewSessionStatus),
      reviewSessionRevision: s(issue.revision || prev.reviewSessionRevision),
      reviewFreshness: s(issue.freshness || prev.reviewFreshness || "unknown"),
      reviewStale: !!issue.stale,
      reviewConflicted: !!issue.conflicted,
      reviewConflictMessage: s(issue.message || issue.conflictMessage),
    }));
  }

  async function loadCurrentReview({
    preserveBusinessForm = false,
    activateReviewSession = true,
    activeSourceType = "",
    activeSourceUrl = "",
  } = {}) {
    try {
      const payload = await getCurrentSetupReview({ eventLimit: 30 });
      const normalized = normalizeReviewState(payload);
      const legacy = mapCurrentReviewToLegacyDraft(normalized);
      const sourceScope = resolveActiveSourceScope({
        sourceType: activeSourceType,
        sourceUrl: activeSourceUrl,
      });

      const shouldApplyIntoActiveStudio =
        !preserveBusinessForm ||
        !s(sourceScope.sourceUrl) ||
        sourceScope.sourceType === "manual" ||
        reviewStateMatchesSource(
          normalized,
          legacy,
          sourceScope.sourceType,
          sourceScope.sourceUrl
        );

      if (!shouldApplyIntoActiveStudio) {
        setCurrentReview(normalized);
        setReviewDraft(legacy);
        setReviewSyncIssue({
          sessionId: s(normalized?.session?.id || legacy?.reviewSessionId),
          sessionStatus: s(normalized?.session?.status || legacy?.reviewSessionStatus),
          revision: s(normalized?.session?.revision || legacy?.reviewSessionRevision),
          freshness: "source_mismatch",
          message:
            "A review session exists, but it belongs to a different source than the active draft.",
        });

        if (activateReviewSession) {
          setFreshEntryMode(false);
        }

        return {
          currentReview: normalized,
          reviewDraft: legacy,
        };
      }

      setCurrentReview(normalized);
      setReviewDraft(legacy);

      if (activateReviewSession) {
        setFreshEntryMode(false);
      }

      return applyReviewState(payload, { preserveBusinessForm });
    } catch (e) {
      setReviewSyncIssue({
        freshness: "unknown",
        message: String(
          e?.message || e || "The current review session could not be loaded."
        ),
      });

      return {
        currentReview,
        reviewDraft,
      };
    }
  }

  async function loadData({
    silent = false,
    preserveBusinessForm = false,
    hydrateReview = false,
    activeSourceType = "",
    activeSourceUrl = "",
  } = {}) {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const requests = [
        getAppBootstrap(),
        getKnowledgeCandidates(),
        getSetupServices(),
      ];

      if (hydrateReview) {
        requests.push(
          getCurrentSetupReview({ eventLimit: 30 }).catch(() => ({ review: {} }))
        );
      }

      const responses = await Promise.all(requests);

      const boot = responses[0];
      const knowledgePayload = responses[1];
      const servicesPayload = responses[2];
      const reviewPayload = hydrateReview ? responses[3] : { review: {} };

      const workspace = obj(boot?.workspace);
      const setup = obj(boot?.setup);
      const profile = pickSetupProfile(setup, workspace);

      const rawKnowledge = extractItems(knowledgePayload);
      const pendingKnowledge = rawKnowledge.filter(isPendingKnowledge);
      const serviceItems = extractItems(servicesPayload);

      const nextMeta = normalizeBootMeta(boot, pendingKnowledge, serviceItems);

      setMeta(nextMeta);
      setKnowledgeCandidates(pendingKnowledge);
      setServices(serviceItems);

      if (!hydrateReview) {
        if (!preserveBusinessForm) {
          clearStudioReviewState({ preserveActiveSource: false });
          seedBusinessFormFromBootProfile(profile);
        }

        return {
          boot,
          workspace,
          setup,
          profile,
          pendingKnowledge,
          serviceItems,
          meta: nextMeta,
          currentReview: createEmptyReviewState(),
        };
      }

      const reviewState = normalizeReviewState(reviewPayload);
      const legacyDraft = mapCurrentReviewToLegacyDraft(reviewState);

      const sourceScope = resolveActiveSourceScope({
        sourceType: activeSourceType,
        sourceUrl: activeSourceUrl,
      });

      const shouldApplyIntoActiveStudio =
        !preserveBusinessForm ||
        !s(sourceScope.sourceUrl) ||
        sourceScope.sourceType === "manual" ||
        reviewStateMatchesSource(
          reviewState,
          legacyDraft,
          sourceScope.sourceType,
          sourceScope.sourceUrl
        );

      if (!shouldApplyIntoActiveStudio) {
        setCurrentReview(reviewState);
        setReviewDraft(legacyDraft);
        setReviewSyncIssue({
          sessionId: s(reviewState?.session?.id || legacyDraft?.reviewSessionId),
          sessionStatus: s(
            reviewState?.session?.status || legacyDraft?.reviewSessionStatus
          ),
          revision: s(
            reviewState?.session?.revision || legacyDraft?.reviewSessionRevision
          ),
          freshness: "source_mismatch",
          message:
            "A review session was loaded, but it does not match the active source draft.",
        });

        return {
          boot,
          workspace,
          setup,
          profile,
          pendingKnowledge,
          serviceItems,
          meta: nextMeta,
          currentReview: reviewState,
        };
      }

      setCurrentReview(reviewState);
      setReviewDraft(legacyDraft);

      const reviewInfo = resolveReviewSourceInfo(reviewState, legacyDraft);

      if (s(reviewInfo.sourceUrl) || lowerText(reviewInfo.sourceType) === "manual") {
        updateActiveSourceScope(reviewInfo.sourceType, reviewInfo.sourceUrl);
      }

      const baseProfile = chooseBestProfileForForm(legacyDraft?.overview);

      setBusinessForm((prev) => {
        if (!hasMeaningfulProfile(baseProfile)) {
          return {
            ...DEFAULT_BUSINESS_FORM,
            timezone: s(prev.timezone || "Asia/Baku"),
            language: s(prev.language || "en"),
            websiteUrl: s(reviewInfo.sourceUrl),
          };
        }

        if (!preserveBusinessForm) {
          return hydrateBusinessFormFromProfile(
            formFromProfile(baseProfile, {
              ...prev,
              timezone: s(baseProfile?.timezone || "Asia/Baku"),
              language:
                resolveMainLanguageValue(
                  baseProfile?.mainLanguage,
                  baseProfile?.primaryLanguage,
                  baseProfile?.language,
                  firstLanguage(baseProfile)
                ) || "en",
            }),
            baseProfile,
            { force: true }
          );
        }

        return hydrateBusinessFormFromProfile(prev, baseProfile, {
          force: false,
        });
      });

      const nextManualSections = buildManualSectionsFromReview(reviewState);
      setManualSections((prev) => ({
        servicesText: s(nextManualSections.servicesText),
        faqsText: s(nextManualSections.faqsText),
        policiesText: s(nextManualSections.policiesText),
      }));

      syncDiscoveryStateFromReview(reviewState, { preserveCounts: false });

      applyUiHintsFromMeta({
        nextMeta,
        pendingKnowledge,
        setShowKnowledge,
        setShowRefine,
      });

      return {
        boot,
        workspace,
        setup,
        profile,
        pendingKnowledge,
        serviceItems,
        meta: nextMeta,
        currentReview: reviewState,
      };
    } catch (e) {
      const message = String(
        e?.message || e || "Setup studio data could not be loaded."
      );
      setError(message);

      return {
        boot: {},
        workspace: {},
        setup: {},
        profile: {},
        pendingKnowledge: [],
        serviceItems: [],
        meta: {},
        currentReview: {},
        error: message,
      };
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshAndMaybeRouteHome({
    preserveBusinessForm = false,
    hydrateReview = !freshEntryMode,
    activeSourceType = "",
    activeSourceUrl = "",
  } = {}) {
    const snapshot = await loadData({
      silent: true,
      preserveBusinessForm,
      hydrateReview,
      activeSourceType,
      activeSourceUrl,
    });

    const nextMeta = obj(snapshot?.meta);

    if (nextMeta.setupCompleted) {
      navigate(s(nextMeta.nextRoute || "/"), { replace: true });
      return {
        routed: true,
        snapshot,
      };
    }

    if (hydrateReview) {
      applyUiHintsFromMeta({
        nextMeta,
        pendingKnowledge: arr(snapshot?.pendingKnowledge),
        setShowKnowledge,
        setShowRefine,
      });
    }

    return {
      routed: false,
      snapshot,
    };
  }

  async function onScanBusiness(input) {
    const request = normalizeScanRequest(input, discoveryForm);
    const requestedSources = normalizeRequestedSourceRows(request.sources);
    const requestedPrimarySource = pickRequestedPrimarySource({
      sources: requestedSources,
      primarySource: request.primarySource,
    });

    const sourceType = s(request.sourceType);
    const sourceUrl = s(request.url);
    const hasImportableSource = !!(
      request?.hasImportableSource &&
      sourceType &&
      sourceUrl
    );
    const hasRequestedSources = requestedSources.length > 0;
    const requestedPrimarySourceType = s(
      request.requestedPrimarySourceType || requestedPrimarySource?.sourceType
    );
    const requestedPrimarySourceUrl = s(
      request.requestedPrimarySourceUrl || requestedPrimarySource?.url
    );
    const shouldUseBundledImport = !!(
      hasImportableSource &&
      requestedSources.length > 1 &&
      requestedPrimarySourceType === "website"
    );

    const analyzePayload = buildAnalyzePayloadFromStudioState({
      businessForm,
      manualSections,
      discoveryForm: {
        ...discoveryForm,
        note: request.note,
      },
      fallbackSourceUrl: sourceUrl || requestedPrimarySourceUrl,
      scanRequest: {
        ...request,
        sources: requestedSources,
        primarySource: requestedPrimarySource,
      },
    });

    if (
      !hasImportableSource &&
      !analyzePayload.hasAnyInput &&
      !hasRequestedSources
    ) {
      setError(
        "Add a source, manual notes, or a business description before continuing."
      );
      return;
    }

    const uiSourceType = hasImportableSource
      ? requestedPrimarySourceType || sourceType
      : "manual";

    const displaySourceType =
      requestedPrimarySourceType ||
      (hasImportableSource ? sourceType : "manual");

    const displaySourceUrl = requestedPrimarySourceUrl || sourceUrl;

    try {
      setImportingWebsite(true);
      setFreshEntryMode(false);
      setError("");
      autoRevealRef.current = "";

      updateActiveSourceScope(
        uiSourceType,
        hasImportableSource ? displaySourceUrl : ""
      );

      clearStudioReviewState({ preserveActiveSource: true });
      resetBusinessTwinDraftForNewScan(
        hasImportableSource ? displaySourceUrl : ""
      );

      setDiscoveryState((prev) => ({
        ...prev,
        mode: "running",
        lastUrl: hasImportableSource ? displaySourceUrl : "",
        lastSourceType: uiSourceType,
        sourceLabel: sourceLabelFor(displaySourceType),
        message: hasImportableSource
          ? scanStartLabel(sourceType)
          : hasRequestedSources
            ? `${sourceLabelFor(displaySourceType)} context attached to the temporary draft...`
            : "Building the temporary business draft...",
        warnings: [],
        shouldReview: false,
        reviewRequired: false,
        reviewFlags: [],
        fieldConfidence: {},
        hasResults: false,
        resultCount: 0,
        importedKnowledgeItems: [],
        importedServices: [],
      }));

      let importResult = null;
      let analyzeResult = null;
      let reviewPayload = {};

      if (hasImportableSource) {
        const importPayload = {
          sourceType,
          url: sourceUrl,
          sourceUrl,
          note: request.note,
          businessNote: request.note,
          manualText: analyzePayload.manualText,
          answers: analyzePayload.answers,
          sources: requestedSources,
          primarySource: requestedPrimarySource,
        };

        if (shouldUseBundledImport) {
          importResult = await importBundleForSetup(importPayload);
          reviewPayload = await getCurrentSetupReview({ eventLimit: 30 });
        } else {
          importResult = await importSourceForSetup(importPayload);
        }
      }

      if (!shouldUseBundledImport) {
        analyzeResult = await analyzeSetupIntake(analyzePayload);
        reviewPayload = analyzeResult?.review || importResult?.review || {};
      }

      const importedReview = normalizeReviewState(reviewPayload);
      const legacyImportedDraft = mapCurrentReviewToLegacyDraft(importedReview);
      const reviewInfo = resolveReviewSourceInfo(
        importedReview,
        legacyImportedDraft
      );

      const effectiveSourceType = s(
        reviewInfo.sourceType ||
          analyzeResult?.sourceType ||
          uiSourceType ||
          "manual"
      );

      const effectiveSourceUrl = s(
        reviewInfo.sourceUrl ||
          analyzeResult?.sourceUrl ||
          (hasImportableSource ? displaySourceUrl : "")
      );
      const expectedReviewSourceType = hasImportableSource
        ? requestedPrimarySourceType || sourceType
        : "manual";
      const expectedReviewSourceUrl = hasImportableSource
        ? requestedPrimarySourceUrl || sourceUrl
        : "";
      const importedReviewMatchesActiveSource =
        expectedReviewSourceType === "manual"
          ? !!s(importedReview?.session?.id)
          : reviewStateMatchesSource(
              importedReview,
              legacyImportedDraft,
              expectedReviewSourceType,
              expectedReviewSourceUrl
            );

      if (effectiveSourceUrl || effectiveSourceType === "manual") {
        updateActiveSourceScope(effectiveSourceType, effectiveSourceUrl);
      }

      const importWarnings = arr(importResult?.warnings)
        .map((x) => s(x))
        .filter(Boolean);

      const analyzeWarnings = arr(analyzeResult?.warnings)
        .map((x) => s(x))
        .filter(Boolean);

      const contextualWarnings = [
        ...(!hasImportableSource && hasRequestedSources
          ? ["Selected sources were attached as temporary draft context."]
          : []),
        ...(hasImportableSource && request?.hasUnsupportedSources
          ? ["Additional sources were attached as supporting draft context."]
          : []),
        ...(!importedReviewMatchesActiveSource && hasImportableSource
          ? [
              "The backend review session did not match this source yet, so the editable draft stayed isolated.",
            ]
          : []),
      ];

      const combinedWarnings = [
        ...new Set([
          ...importWarnings,
          ...analyzeWarnings,
          ...contextualWarnings,
        ]),
      ];

      const barrierOnlyResult =
        hasImportableSource &&
        isBarrierOnlyImportResult(importResult, sourceType) &&
        !hasMeaningfulProfile(
          chooseBestProfileForForm(
            obj(legacyImportedDraft?.overview),
            obj(analyzeResult?.profile)
          )
        );

      const reviewBackedProfile = obj(legacyImportedDraft?.overview);
      const helperProfilePatch = profilePatchFromDiscovery(
        obj(analyzeResult?.profile || importResult?.profile)
      );

      const resultMetadata = {
        reviewRequired: !!(
          analyzeResult?.reviewRequired ??
          legacyImportedDraft?.reviewRequired ??
          false
        ),
        reviewFlags: arr(
          analyzeResult?.reviewFlags || legacyImportedDraft?.reviewFlags || []
        ),
        fieldConfidence: obj(
          analyzeResult?.fieldConfidence ||
            legacyImportedDraft?.fieldConfidence ||
            {}
        ),
        mainLanguage:
          s(analyzeResult?.mainLanguage) ||
          s(legacyImportedDraft?.mainLanguage) ||
          resolveMainLanguageValue(
            reviewBackedProfile?.mainLanguage,
            reviewBackedProfile?.primaryLanguage,
            reviewBackedProfile?.language
          ),
        primaryLanguage:
          s(analyzeResult?.primaryLanguage) ||
          s(legacyImportedDraft?.primaryLanguage) ||
          resolveMainLanguageValue(
            reviewBackedProfile?.primaryLanguage,
            reviewBackedProfile?.mainLanguage,
            reviewBackedProfile?.language
          ),
      };

      const rawBestIncomingProfile = barrierOnlyResult
        ? chooseBestProfileForForm(
            obj(analyzeResult?.profile),
            helperProfilePatch
          )
        : chooseBestProfileForForm(
            reviewBackedProfile,
            obj(analyzeResult?.profile),
            obj(importResult?.profile),
            helperProfilePatch
          );

      const bestIncomingProfile = buildSafeUiProfile({
        rawProfile: rawBestIncomingProfile,
        sourceType: effectiveSourceType,
        sourceUrl: effectiveSourceUrl,
        warnings: combinedWarnings,
        mainLanguage: resultMetadata.mainLanguage,
        primaryLanguage: resultMetadata.primaryLanguage,
        reviewRequired: resultMetadata.reviewRequired,
        reviewFlags: resultMetadata.reviewFlags,
        fieldConfidence: resultMetadata.fieldConfidence,
        barrierOnly: barrierOnlyResult,
      });

      if (
        importedReviewMatchesActiveSource &&
        (importedReview?.session ||
          Object.keys(obj(importedReview?.draft)).length ||
          arr(importedReview?.bundleSources).length ||
          arr(importedReview?.sources).length)
      ) {
        applyReviewState(reviewPayload, {
          preserveBusinessForm: true,
          fallbackProfile: bestIncomingProfile,
        });
      } else {
        setCurrentReview(importedReview);
        setReviewDraft(legacyImportedDraft);
        setReviewSyncIssue({
          sessionId: s(
            importedReview?.session?.id || legacyImportedDraft?.reviewSessionId
          ),
          sessionStatus: s(
            importedReview?.session?.status ||
              legacyImportedDraft?.reviewSessionStatus
          ),
          revision: s(
            importedReview?.session?.revision ||
              legacyImportedDraft?.reviewSessionRevision
          ),
          freshness:
            hasImportableSource && !importedReviewMatchesActiveSource
              ? "source_mismatch"
              : s(
                  importedReview?.session?.freshness ||
                    legacyImportedDraft?.reviewFreshness ||
                    "unknown"
                ),
          message:
            hasImportableSource && !importedReviewMatchesActiveSource
              ? "The backend review session did not match this source yet, so editing remains isolated."
              : s(legacyImportedDraft?.reviewConflictMessage),
        });
      }

      const sourceId = s(
        analyzeResult?.source?.id ||
          importResult?.source?.id ||
          legacyImportedDraft?.sourceId
      );
      const sourceRunId = s(
        analyzeResult?.run?.id ||
          importResult?.run?.id ||
          legacyImportedDraft?.sourceRunId
      );
      const snapshotId = s(
        legacyImportedDraft?.snapshotId ||
          analyzeResult?.snapshot?.id ||
          importResult?.snapshot?.id
      );

      const scopedImportedReview =
        !barrierOnlyResult && importedReviewMatchesActiveSource
          ? importedReview
          : createEmptyReviewState();

      const scopedImportedDraft =
        !barrierOnlyResult && importedReviewMatchesActiveSource
          ? legacyImportedDraft
          : createEmptyLegacyDraft();

      const immediateDiscoveryState = {
        lastUrl: effectiveSourceUrl,
        lastSourceType: effectiveSourceType,
        sourceLabel: sourceLabelFor(
          hasImportableSource ? effectiveSourceType : displaySourceType
        ),
        intakeContext: {
          ...obj(importResult?.intakeContext),
          requestedSources,
          primarySource: requestedPrimarySource || null,
          hasImportableSource,
          hasUnsupportedSources: !!request?.hasUnsupportedSources,
          sourceCount: Number(
            request?.sourceCount || requestedSources.length || 0
          ),
        },
        snapshot: obj(analyzeResult?.snapshot || importResult?.snapshot),
        profile: bestIncomingProfile,
        signals: obj(analyzeResult?.signals || importResult?.signals),
        sourceId,
        sourceRunId,
        snapshotId,
        importedKnowledgeItems: barrierOnlyResult
          ? []
          : arr(scopedImportedDraft?.reviewQueue),
        importedServices: barrierOnlyResult
          ? []
          : arr(scopedImportedDraft?.sections?.services),
        mainLanguage: resultMetadata.mainLanguage,
        primaryLanguage: resultMetadata.primaryLanguage,
        reviewRequired: !!resultMetadata.reviewRequired,
        reviewFlags: arr(resultMetadata.reviewFlags),
        fieldConfidence: obj(resultMetadata.fieldConfidence),
      };

      const importedVisibleKnowledgeItems = barrierOnlyResult
        ? []
        : deriveVisibleKnowledgeItems({
            reviewDraft: scopedImportedDraft,
            currentReview: scopedImportedReview,
            discoveryState: immediateDiscoveryState,
          });

      const importedVisibleServiceItems = barrierOnlyResult
        ? []
        : deriveVisibleServiceItems({
            reviewDraft: scopedImportedDraft,
            currentReview: scopedImportedReview,
            discoveryState: immediateDiscoveryState,
          });

      const importedVisibleSources = deriveVisibleSources({
        currentReview: scopedImportedReview,
        discoveryState: immediateDiscoveryState,
      });

      const importedVisibleEvents = deriveVisibleEvents(scopedImportedReview);
      const importedProfileRows = profilePreviewRows(bestIncomingProfile);

      const hasImmediateVisibleResults =
        importedVisibleKnowledgeItems.length > 0 ||
        importedVisibleServiceItems.length > 0 ||
        importedVisibleSources.length > 0 ||
        importedVisibleEvents.length > 0 ||
        importedProfileRows.length > 0 ||
        combinedWarnings.length > 0 ||
        hasMeaningfulProfile(bestIncomingProfile);

      setDiscoveryState({
        mode: s(analyzeResult?.mode || importResult?.mode) || "success",
        lastUrl: effectiveSourceUrl,
        lastSourceType: effectiveSourceType,
        sourceLabel: sourceLabelFor(
          hasImportableSource ? effectiveSourceType : displaySourceType
        ),
        message:
          combinedWarnings.length > 0
            ? combinedWarnings[0]
            : effectiveSourceType === "manual"
              ? "Business draft generated"
              : scanCompleteLabel(
                  effectiveSourceType,
                  analyzeResult?.candidateCount
                ),
        candidateCount: Number(analyzeResult?.candidateCount || 0),
        profileApplied: hasMeaningfulProfile(bestIncomingProfile),
        shouldReview: !!analyzeResult?.shouldReview,
        warnings: combinedWarnings,
        requestId: s(analyzeResult?.requestId || importResult?.requestId),
        intakeContext: {
          ...obj(importResult?.intakeContext),
          requestedSources,
          primarySource: requestedPrimarySource || null,
          hasImportableSource,
          hasUnsupportedSources: !!request?.hasUnsupportedSources,
          sourceCount: Number(
            request?.sourceCount || requestedSources.length || 0
          ),
        },
        profile: {
          ...bestIncomingProfile,
          mainLanguage:
            immediateDiscoveryState.mainLanguage ||
            bestIncomingProfile.mainLanguage,
          primaryLanguage:
            immediateDiscoveryState.primaryLanguage ||
            bestIncomingProfile.primaryLanguage,
          reviewRequired: immediateDiscoveryState.reviewRequired,
          reviewFlags: arr(immediateDiscoveryState.reviewFlags),
          fieldConfidence: obj(immediateDiscoveryState.fieldConfidence),
        },
        signals: obj(analyzeResult?.signals || importResult?.signals),
        snapshot: obj(analyzeResult?.snapshot || importResult?.snapshot),
        sourceId,
        sourceRunId,
        snapshotId,
        reviewSessionId: s(
          analyzeResult?.reviewSessionId || importedReview?.session?.id
        ),
        reviewSessionStatus: s(
          analyzeResult?.reviewSessionStatus || importedReview?.session?.status
        ),
        hasResults: hasImmediateVisibleResults,
        resultCount:
          importedVisibleKnowledgeItems.length +
          importedVisibleServiceItems.length +
          importedVisibleSources.length +
          importedVisibleEvents.length +
          importedProfileRows.length,
        importedKnowledgeItems: barrierOnlyResult
          ? []
          : arr(scopedImportedDraft?.reviewQueue),
        importedServices: barrierOnlyResult
          ? []
          : arr(scopedImportedDraft?.sections?.services),
        mainLanguage: immediateDiscoveryState.mainLanguage,
        primaryLanguage: immediateDiscoveryState.primaryLanguage,
        reviewRequired: immediateDiscoveryState.reviewRequired,
        reviewFlags: arr(immediateDiscoveryState.reviewFlags),
        fieldConfidence: obj(immediateDiscoveryState.fieldConfidence),
      });

      const refreshResult = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: true,
        activeSourceType: effectiveSourceType,
        activeSourceUrl: effectiveSourceUrl,
      });

      if (!refreshResult.routed) {
        const refreshedPendingKnowledge = arr(
          refreshResult?.snapshot?.pendingKnowledge
        );

        const shouldOpenKnowledge =
          !barrierOnlyResult &&
          (!!analyzeResult?.shouldReview ||
            Number(analyzeResult?.candidateCount || 0) > 0 ||
            refreshedPendingKnowledge.length > 0 ||
            importedVisibleKnowledgeItems.length > 0 ||
            importedVisibleServiceItems.length > 0 ||
            s(refreshResult?.snapshot?.meta?.nextStudioStage).toLowerCase() ===
              "knowledge");

        const shouldOpenRefine =
          !barrierOnlyResult &&
          (hasImmediateVisibleResults ||
            hasMeaningfulProfile(bestIncomingProfile) ||
            importedProfileRows.length > 0);

        setShowKnowledge(shouldOpenKnowledge);
        setShowRefine(shouldOpenRefine);
      }
    } catch (e2) {
      const message = String(
        e2?.message || e2 || "The business draft could not be prepared."
      );

      setDiscoveryState((prev) => ({
        ...prev,
        mode: "error",
        lastUrl: s(requestedPrimarySourceUrl || sourceUrl),
        lastSourceType: uiSourceType,
        sourceLabel: sourceLabelFor(displaySourceType),
        message,
        hasResults: false,
        resultCount: 0,
        importedKnowledgeItems: [],
        importedServices: [],
      }));

      setError(message);
    } finally {
      setImportingWebsite(false);
    }
  }

  async function onSaveBusiness(e) {
    if (e?.preventDefault) e.preventDefault();

    try {
      setFreshEntryMode(false);
      setSavingBusiness(true);
      setError("");

      const reviewMeta = currentReviewConcurrencyMeta(
        currentReview,
        discoveryState
      );
      const concurrencyPayload = buildReviewConcurrencyPayload(reviewMeta);
      const activeSessionId = s(reviewMeta.sessionId);

      if (!activeSessionId) {
        throw new Error(
          "No active matching review session was found for this draft yet."
        );
      }

      if (!activeReviewAligned) {
        throw new Error(
          "The loaded review session does not match the active source draft. Reload review before finalizing."
        );
      }

      if (reviewMeta.conflicted || reviewMeta.stale) {
        setReviewSyncIssue(reviewMeta);
        throw new Error(
          reviewMeta.conflicted
            ? reviewMeta.message ||
                "This review session is in conflict. Reload the draft before finalizing."
            : reviewMeta.message ||
                "This review session is stale. Reload the draft before finalizing."
        );
      }

      const businessProfilePatch = buildBusinessProfilePatch({
        businessForm,
        currentReview,
        discoveryState,
      });

      const capabilitiesPatch = buildCapabilitiesPatch({
        currentReview,
        businessForm,
      });

      const mergedServices = buildServiceDraftItemsFromManual(
        manualSections.servicesText,
        arr(currentReview?.draft?.services)
      );

      const mergedKnowledgeItems = buildKnowledgeDraftItemsFromManual({
        faqsText: manualSections.faqsText,
        policiesText: manualSections.policiesText,
        existing: arr(currentReview?.draft?.knowledgeItems),
      });

      await patchCurrentSetupReview({
        patch: {
          businessProfile: businessProfilePatch,
          capabilities: capabilitiesPatch,
          services: mergedServices,
          knowledgeItems: mergedKnowledgeItems,
        },
        metadata: compactObject({
          requestId: s(discoveryState.requestId),
          ...concurrencyPayload,
        }),
      });

      await finalizeCurrentSetupReview({
        reason: "setup_studio_finalize",
        metadata: compactObject({
          requestId: s(discoveryState.requestId),
          ...concurrencyPayload,
        }),
      });

      setShowRefine(false);
      setShowKnowledge(false);

      const refreshed = await refreshAndMaybeRouteHome({
        preserveBusinessForm: false,
        hydrateReview: true,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      if (!refreshed?.routed) {
        await loadCurrentReview({
          preserveBusinessForm: false,
          activateReviewSession: true,
          activeSourceType: activeSourceScope.sourceType,
          activeSourceUrl: activeSourceScope.sourceUrl,
        });
      }

      return { ok: true };
    } catch (e2) {
      const reviewMeta = currentReviewConcurrencyMeta(currentReview, discoveryState);
      const issue = parseReviewConcurrencyError(e2, reviewMeta);

      if (issue.stale || issue.conflicted) {
        setReviewSyncIssue(issue);
      }

      setError(
        String(e2?.message || e2 || "The business twin could not be finalized.")
      );
      return { ok: false };
    } finally {
      setSavingBusiness(false);
    }
  }

  async function onApproveKnowledge(item) {
    const candidateId = resolveKnowledgeCandidateUuid({
      item,
      visibleKnowledgeItems,
      pickKnowledgeCandidateId: ctx.pickKnowledgeCandidateId,
    });

    if (!candidateId) {
      setError("This knowledge item did not include a review candidate UUID.");
      return { ok: false };
    }

    try {
      setFreshEntryMode(false);
      setActingKnowledgeId(candidateId);
      setError("");

      await approveKnowledgeCandidate(candidateId, {});
      await loadCurrentReview({
        preserveBusinessForm: true,
        activateReviewSession: true,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      const refreshed = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: true,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      if (!refreshed?.routed) {
        const nextStage = s(
          refreshed?.snapshot?.meta?.nextStudioStage
        ).toLowerCase();

        if (nextStage !== "knowledge") {
          setShowKnowledge(false);
        }
      }

      return { ok: true };
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be approved."));
      return { ok: false };
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onRejectKnowledge(item) {
    const candidateId = resolveKnowledgeCandidateUuid({
      item,
      visibleKnowledgeItems,
      pickKnowledgeCandidateId: ctx.pickKnowledgeCandidateId,
    });

    if (!candidateId) {
      setError("This knowledge item did not include a review candidate UUID.");
      return { ok: false };
    }

    try {
      setFreshEntryMode(false);
      setActingKnowledgeId(candidateId);
      setError("");

      await rejectKnowledgeCandidate(candidateId, {});
      await loadCurrentReview({
        preserveBusinessForm: true,
        activateReviewSession: true,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      const refreshed = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: true,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      if (!refreshed?.routed) {
        const remaining = Number(
          refreshed?.snapshot?.meta?.pendingCandidateCount || 0
        );

        if (remaining <= 0) {
          setShowKnowledge(false);
        }
      }

      return { ok: true };
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be rejected."));
      return { ok: false };
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onCreateSuggestedService() {
    try {
      setFreshEntryMode(false);
      setSavingServiceSuggestion("creating");
      setError("");

      const payload = deriveSuggestedServicePayload({
        discoveryForm,
        discoveryState,
        knowledgeCandidates: visibleKnowledgeItems,
      });

      await createSetupService(payload);

      await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: true,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      return { ok: true };
    } catch (e) {
      setError(
        String(e?.message || e || "Suggested service could not be created.")
      );
      return { ok: false, error: String(e?.message || e || "") };
    } finally {
      setSavingServiceSuggestion("");
    }
  }

  async function onOpenWorkspace() {
    try {
      setError("");

      const snapshot = await loadData({
        silent: true,
        preserveBusinessForm: true,
        hydrateReview: !freshEntryMode,
        activeSourceType: activeSourceScope.sourceType,
        activeSourceUrl: activeSourceScope.sourceUrl,
      });

      const nextMeta = obj(snapshot?.meta);

      if (nextMeta.setupCompleted) {
        navigate(s(nextMeta.nextRoute || "/"), { replace: true });
        return;
      }

      if (!freshEntryMode) {
        applyUiHintsFromMeta({
          nextMeta,
          pendingKnowledge: arr(snapshot?.pendingKnowledge),
          setShowKnowledge,
          setShowRefine,
        });
      }

      navigate("/setup/studio", { replace: true });
    } catch (e) {
      setError(
        String(e?.message || e || "Workspace status could not be checked.")
      );
    }
  }

  return {
    loadCurrentReview,
    loadData,
    refreshAndMaybeRouteHome,
    onScanBusiness,
    onSaveBusiness,
    onApproveKnowledge,
    onRejectKnowledge,
    onCreateSuggestedService,
    onOpenWorkspace,
  };
}
