// FILE: src/pages/SetupStudio/screen/shared.js

export function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

export function arr(value) {
  return Array.isArray(value) ? value : [];
}

export function obj(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

const KNOWN_LANGS = ["az", "en", "tr", "ru"];

export function normalizeIncomingSourceType(value = "") {
  const raw = s(value).toLowerCase().replace(/\s+/g, "_");

  if (!raw) return "";
  if (raw === "googlemaps" || raw === "google_map" || raw === "google_maps") {
    return "google_maps";
  }
  if (raw === "instagram") return "instagram";
  if (raw === "facebook") return "facebook";
  if (raw === "linkedin") return "linkedin";
  if (raw === "website" || raw === "web") return "website";
  if (raw === "manual") return "manual";

  return raw;
}

export function detectSourceTypeFromUrl(url = "") {
  const value = s(url).toLowerCase();
  if (!value) return "";

  if (/(instagram\.com|^@[\w.]+)/i.test(value)) return "instagram";
  if (/facebook\.com/i.test(value)) return "facebook";
  if (/linkedin\.com/i.test(value)) return "linkedin";
  if (/(maps\.app\.goo\.gl|maps\.google|goo\.gl\/maps|g\.co\/kgs)/i.test(value)) {
    return "google_maps";
  }
  if (/[a-z0-9-]+\.[a-z0-9-]+/i.test(value)) return "website";

  return "";
}

export function resolveMainLanguageValue(...values) {
  for (const value of values) {
    if (Array.isArray(value)) {
      const nested = resolveMainLanguageValue(...value);
      if (nested) return nested;
      continue;
    }

    if (value && typeof value === "object") {
      const nested = resolveMainLanguageValue(...Object.values(value));
      if (nested) return nested;
      continue;
    }

    const text = s(value).toLowerCase();
    if (!text) continue;

    if (KNOWN_LANGS.includes(text)) return text;

    if (text.startsWith("az")) return "az";
    if (text.startsWith("en")) return "en";
    if (text.startsWith("tr")) return "tr";
    if (text.startsWith("ru")) return "ru";

    return text;
  }

  return "";
}

export function createEmptySourceScope() {
  return {
    sourceType: "",
    sourceUrl: "",
  };
}

export function createEmptyLegacyDraft() {
  return {
    overview: {},
    quickSummary: "",
    sourceType: "",
    sourceLabel: "",
    sourceUrl: "",
    warnings: [],
    reviewFlags: [],
    fieldConfidence: {},
    sections: {
      services: [],
    },
    reviewQueue: [],
    stats: {
      knowledgeCount: 0,
    },
    reviewRequired: false,
    sourceId: "",
    sourceRunId: "",
    snapshotId: "",
    mainLanguage: "",
    primaryLanguage: "",
  };
}

export function createEmptyReviewState() {
  return {
    session: {},
    draft: {
      businessProfile: {},
      capabilities: {},
      services: [],
      knowledgeItems: [],
      warnings: [],
      reviewFlags: [],
      fieldConfidence: {},
    },
    sources: [],
    events: [],
  };
}

export function createIdleDiscoveryState() {
  return {
    mode: "idle",
    message: "",
    lastUrl: "",
    lastSourceType: "",
    sourceLabel: "",
    warnings: [],
    reviewRequired: false,
    reviewFlags: [],
    fieldConfidence: {},
    hasResults: false,
    resultCount: 0,
    candidateCount: 0,
    requestId: "",
    sourceId: "",
    sourceRunId: "",
    snapshotId: "",
    reviewSessionId: "",
    reviewSessionStatus: "",
    importedKnowledgeItems: [],
    importedServices: [],
    profile: {},
    signals: {},
    snapshot: {},
    intakeContext: {},
    mainLanguage: "",
    primaryLanguage: "",
  };
}

export function normalizeReviewState(payload = {}) {
  const raw = obj(payload.review).session || obj(payload.review).draft || arr(obj(payload.review).sources).length
    ? obj(payload.review)
    : obj(payload);

  const session = obj(
    raw.session ||
      raw.reviewSession ||
      raw.review_session ||
      payload.session
  );

  const draft = obj(raw.draft || payload.draft);
  const businessProfile = obj(
    draft.businessProfile ||
      draft.business_profile ||
      draft.profile ||
      draft.overview
  );

  const capabilities = obj(
    draft.capabilities ||
      draft.businessCapabilities ||
      draft.business_capabilities
  );

  const services = arr(
    draft.services ||
      draft.serviceItems ||
      draft.service_items
  );

  const knowledgeItems = arr(
    draft.knowledgeItems ||
      draft.knowledge_items ||
      draft.knowledge ||
      draft.reviewQueue
  );

  return {
    session,
    draft: {
      ...draft,
      businessProfile,
      capabilities,
      services,
      knowledgeItems,
      warnings: arr(draft.warnings),
      reviewFlags: arr(draft.reviewFlags || draft.review_flags),
      fieldConfidence: obj(draft.fieldConfidence || draft.field_confidence),
      reviewRequired: !!(
        draft.reviewRequired ??
        draft.review_required ??
        false
      ),
      quickSummary: s(draft.quickSummary || draft.quick_summary),
      sourceType: s(draft.sourceType || draft.source_type),
      sourceUrl: s(draft.sourceUrl || draft.source_url),
      sourceLabel: s(draft.sourceLabel || draft.source_label),
      sourceId: s(draft.sourceId || draft.source_id),
      sourceRunId: s(draft.sourceRunId || draft.source_run_id),
      snapshotId: s(draft.snapshotId || draft.snapshot_id),
      mainLanguage: s(draft.mainLanguage || draft.main_language),
      primaryLanguage: s(draft.primaryLanguage || draft.primary_language),
    },
    sources: arr(raw.sources || raw.reviewSources || raw.review_sources),
    events: arr(raw.events || raw.reviewEvents || raw.review_events),
  };
}

export function pickSetupProfile(setup = {}, workspace = {}) {
  const setupObj = obj(setup);
  const workspaceObj = obj(workspace);

  return (
    obj(setupObj.businessProfile) ||
    obj(setupObj.profile) ||
    obj(setupObj.overview) ||
    obj(workspaceObj.businessProfile) ||
    obj(workspaceObj.profile) ||
    obj(workspaceObj.overview) ||
    {}
  );
}

export function normalizeBootMeta(
  boot = {},
  pendingKnowledge = [],
  serviceItems = []
) {
  const setup = obj(boot.setup);
  const workspace = obj(boot.workspace);
  const readiness = obj(
    setup.readiness ||
      workspace.readiness ||
      setup.meta ||
      workspace.meta
  );

  const nextStudioStage = s(
    readiness.nextStudioStage ||
      setup.nextStudioStage ||
      workspace.nextStudioStage
  );

  const nextRoute = s(
    readiness.nextRoute ||
      setup.nextRoute ||
      workspace.nextRoute ||
      "/"
  );

  const nextSetupRoute = s(
    readiness.nextSetupRoute ||
      setup.nextSetupRoute ||
      workspace.nextSetupRoute ||
      "/setup/studio"
  );

  const missingSteps = arr(
    readiness.missingSteps ||
      setup.missingSteps ||
      workspace.missingSteps
  );

  const setupCompleted = !!(
    readiness.setupCompleted ??
    setup.setupCompleted ??
    workspace.setupCompleted ??
    false
  );

  return {
    readinessScore: Number(readiness.readinessScore || setup.readinessScore || 0),
    readinessLabel: s(readiness.readinessLabel || setup.readinessLabel),
    missingSteps,
    primaryMissingStep: s(
      readiness.primaryMissingStep ||
        setup.primaryMissingStep ||
        missingSteps[0]
    ),
    nextRoute,
    nextSetupRoute,
    nextStudioStage,
    setupCompleted,
    pendingCandidateCount: Number(
      readiness.pendingCandidateCount || pendingKnowledge.length || 0
    ),
    approvedKnowledgeCount: Number(readiness.approvedKnowledgeCount || 0),
    serviceCount: Number(readiness.serviceCount || serviceItems.length || 0),
    playbookCount: Number(readiness.playbookCount || 0),
    runtimeKnowledgeCount: Number(readiness.runtimeKnowledgeCount || 0),
    runtimeServiceCount: Number(readiness.runtimeServiceCount || 0),
    runtimePlaybookCount: Number(readiness.runtimePlaybookCount || 0),
  };
}

export function normalizeScanRequest(input = {}, fallbackDiscoveryForm = {}) {
  const sourceType = normalizeIncomingSourceType(
    input?.sourceType || input?.type || fallbackDiscoveryForm?.sourceType
  );

  const sourceValue = s(
    input?.sourceValue ||
      input?.sourceUrl ||
      input?.url ||
      input?.websiteUrl ||
      fallbackDiscoveryForm?.sourceValue ||
      fallbackDiscoveryForm?.websiteUrl
  );

  const note = s(
    input?.note ||
      input?.description ||
      fallbackDiscoveryForm?.note
  );

  const sources = arr(input?.sources);
  const primarySource = obj(input?.primarySource);

  const effectivePrimary =
    s(primarySource.sourceType) || s(primarySource.url)
      ? primarySource
      : sourceType && sourceValue
        ? {
            sourceType,
            url: sourceValue,
            label: sourceType,
            isPrimary: true,
          }
        : null;

  return {
    sourceType,
    url: sourceValue,
    note,
    sources,
    primarySource: effectivePrimary,
    requestedPrimarySourceType: s(effectivePrimary?.sourceType || sourceType),
    requestedPrimarySourceUrl: s(effectivePrimary?.url || sourceValue),
    hasImportableSource: !!(sourceType && sourceValue && sourceType !== "manual"),
    hasUnsupportedSources: false,
    sourceCount: Math.max(
      sources.length,
      effectivePrimary ? 1 : 0
    ),
  };
}

export function scanStartLabel(sourceType = "") {
  const type = normalizeIncomingSourceType(sourceType);
  if (type === "instagram") return "Instagram is being analyzed...";
  if (type === "facebook") return "Facebook page is being analyzed...";
  if (type === "linkedin") return "LinkedIn page is being analyzed...";
  if (type === "google_maps") return "Google Maps listing is being analyzed...";
  return "Website is being analyzed...";
}

export function scanCompleteLabel(sourceType = "", candidateCount = 0) {
  const type = normalizeIncomingSourceType(sourceType);
  const label =
    type === "instagram"
      ? "Instagram analysis completed"
      : type === "facebook"
        ? "Facebook analysis completed"
        : type === "linkedin"
          ? "LinkedIn analysis completed"
          : type === "google_maps"
            ? "Google Maps analysis completed"
            : "Website analysis completed";

  const count = Number(candidateCount || 0);
  return count > 0 ? `${label} · ${count} findings` : label;
}

export function applyUiHintsFromMeta({
  nextMeta = {},
  pendingKnowledge = [],
  setShowKnowledge,
  setShowRefine,
}) {
  const stage = s(nextMeta.nextStudioStage).toLowerCase();
  const pendingCount = Number(
    nextMeta.pendingCandidateCount || arr(pendingKnowledge).length || 0
  );

  if (typeof setShowKnowledge === "function") {
    setShowKnowledge(stage === "knowledge" || pendingCount > 0);
  }

  if (typeof setShowRefine === "function") {
    setShowRefine(stage === "identity" || stage === "knowledge" || stage === "service");
  }
}