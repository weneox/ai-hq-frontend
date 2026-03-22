import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../../api/app.js";
import {
  importSourceForSetup,
  getCurrentSetupReview,
  patchCurrentSetupReview,
  finalizeCurrentSetupReview,
} from "../../api/setup.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../../api/knowledge.js";
import { createSetupService, getSetupServices } from "../../api/services.js";
import SetupStudioScene from "./SetupStudioScene.jsx";
import {
  arr,
  obj,
  s,
  firstLanguage,
  extractItems,
  isPendingKnowledge,
  candidateTitle,
  candidateCategory,
  candidateValue,
  candidateSource,
  candidateConfidence,
  evidenceList,
  profilePatchFromDiscovery,
  mergeBusinessForm,
  profilePreviewRows,
  discoveryModeLabel,
  deriveStudioProgress,
} from "./lib/setupStudioHelpers.js";

const KNOWN_LANGS = new Set(["az", "en", "tr", "ru"]);

function createEmptyReviewState() {
  return {
    session: null,
    draft: {},
    sources: [],
    events: [],
  };
}

function createEmptyLegacyDraft() {
  return {
    sourceId: "",
    sourceRunId: "",
    snapshotId: "",
    quickSummary: "",
    overview: {},
    capabilities: {},
    sections: {},
    reviewQueue: [],
    existing: {},
    stats: {},
    warnings: [],
    completeness: {},
    confidenceSummary: {},
    rawDraft: {},
    session: null,
    draft: {},
    sources: [],
    events: [],
    reviewRequired: false,
    reviewFlags: [],
    fieldConfidence: {},
    mainLanguage: "",
    primaryLanguage: "",
  };
}

function createIdleDiscoveryState() {
  return {
    mode: "idle",
    lastUrl: "",
    lastSourceType: "",
    sourceLabel: "",
    message: "",
    candidateCount: 0,
    profileApplied: false,
    shouldReview: false,
    warnings: [],
    requestId: "",
    intakeContext: {},
    profile: {},
    signals: {},
    snapshot: {},
    sourceId: "",
    sourceRunId: "",
    snapshotId: "",
    reviewSessionId: "",
    reviewSessionStatus: "",
    hasResults: false,
    resultCount: 0,
    importedKnowledgeItems: [],
    importedServices: [],
    mainLanguage: "",
    primaryLanguage: "",
    reviewRequired: false,
    reviewFlags: [],
    fieldConfidence: {},
  };
}

function pickSetupProfile(setup = {}, workspace = {}) {
  return obj(
    setup?.tenantProfile ||
      setup?.businessProfile ||
      workspace?.tenantProfile ||
      workspace?.businessProfile
  );
}

function normalizeBootMeta(boot = {}, pendingKnowledge = [], serviceItems = []) {
  const workspace = obj(boot?.workspace);
  const setup = obj(boot?.setup);
  const knowledge = obj(setup?.knowledge || workspace?.knowledge);
  const catalog = obj(setup?.catalog || workspace?.catalog);
  const progress = obj(setup?.progress || workspace?.progress || workspace);
  const runtime = obj(setup?.runtime || workspace?.runtime);

  return {
    readinessScore: Number(
      progress?.readinessScore || workspace?.readinessScore || 0
    ),
    readinessLabel: s(
      progress?.readinessLabel || workspace?.readinessLabel || ""
    ),
    missingSteps: arr(progress?.missingSteps || workspace?.missingSteps),
    primaryMissingStep: s(
      progress?.primaryMissingStep || workspace?.primaryMissingStep || ""
    ),
    nextRoute: s(progress?.nextRoute || workspace?.nextRoute || "/"),
    nextSetupRoute: s(
      progress?.nextSetupRoute || workspace?.nextSetupRoute || "/setup/studio"
    ),
    nextStudioStage: s(
      progress?.nextStudioStage || workspace?.nextStudioStage || ""
    ),
    setupCompleted: !!(
      progress?.setupCompleted ?? workspace?.setupCompleted ?? false
    ),
    pendingCandidateCount: Number(
      knowledge?.pendingCandidateCount || pendingKnowledge.length || 0
    ),
    approvedKnowledgeCount: Number(knowledge?.approvedKnowledgeCount || 0),
    serviceCount: Number(catalog?.serviceCount || serviceItems.length || 0),
    playbookCount: Number(catalog?.playbookCount || 0),
    runtimeKnowledgeCount: Number(runtime?.knowledgeCount || 0),
    runtimeServiceCount: Number(runtime?.serviceCount || 0),
    runtimePlaybookCount: Number(runtime?.playbookCount || 0),
  };
}

function resolveMainLanguageValue(...candidates) {
  for (const candidate of candidates) {
    const value = s(candidate).toLowerCase();
    if (KNOWN_LANGS.has(value)) return value;
  }
  return "";
}

function normalizeFieldConfidenceMap(value = {}) {
  const out = {};
  const map = obj(value);

  for (const [key, raw] of Object.entries(map)) {
    if (!s(key)) continue;

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const score = Number(raw.score ?? raw.value ?? raw.confidence);
      out[key] = {
        score: Number.isFinite(score) ? score : 0,
        label: s(raw.label || raw.confidenceLabel),
      };
      continue;
    }

    const score = Number(raw);
    out[key] = {
      score: Number.isFinite(score) ? score : 0,
      label: "",
    };
  }

  return out;
}

function extractReviewMetadata(value = {}) {
  const x = obj(value);

  const reviewFlags = arr(
    x.reviewFlags || x.review_flags || x.flags || x.review_flags_list
  )
    .map((item) => s(item))
    .filter(Boolean);

  const fieldConfidence = normalizeFieldConfidenceMap(
    x.fieldConfidence || x.field_confidence
  );

  const mainLanguage = resolveMainLanguageValue(
    x.mainLanguage,
    x.main_language,
    x.primaryLanguage,
    x.primary_language,
    x.language,
    x.sourceLanguage,
    x.source_language
  );

  return {
    reviewRequired: !!(x.reviewRequired ?? x.review_required ?? false),
    reviewFlags,
    fieldConfidence,
    mainLanguage,
    primaryLanguage: mainLanguage,
  };
}

function deriveSuggestedServicePayload({
  discoveryForm,
  discoveryState,
  knowledgeCandidates,
}) {
  const serviceCandidate = knowledgeCandidates.find((item) => {
    const category = s(candidateCategory(item)).toLowerCase();
    return category === "service" || category === "product";
  });

  const discoveredServices = arr(
    discoveryState?.profile?.services ||
      discoveryState?.signals?.sourceFusion?.profile?.services ||
      discoveryState?.signals?.website?.offerings?.services
  );

  const fallbackTitle =
    s(candidateTitle(serviceCandidate)) ||
    s(discoveredServices[0]) ||
    s(discoveryForm.note.split(".")[0]) ||
    "Discovered service";

  const fallbackDescription =
    s(candidateValue(serviceCandidate)) ||
    s(discoveryForm.note) ||
    s(
      discoveryState?.profile?.summaryShort ||
        discoveryState?.profile?.companySummaryShort ||
        discoveryState?.profile?.description
    ) ||
    `Service discovered from ${s(discoveryState?.lastUrl || "source import")}.`;

  const category = (() => {
    const raw = s(candidateCategory(serviceCandidate)).toLowerCase();
    if (raw === "service" || raw === "product") return raw;
    return "general";
  })();

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    category,
    priceFrom: "",
    currency: "AZN",
    pricingModel: "custom_quote",
    durationMinutes: "",
    sortOrder: 0,
    highlightsText: "",
    isActive: true,
  };
}

function normalizeIncomingSourceType(value = "") {
  const x = s(value).toLowerCase().replace(/[\s-]+/g, "_");

  if (x === "website" || x === "site" || x === "web") return "website";
  if (
    x === "google_maps" ||
    x === "googlemaps" ||
    x === "maps" ||
    x === "gmaps"
  ) {
    return "google_maps";
  }

  return "";
}

function detectSourceTypeFromUrl(url = "") {
  const value = s(url).toLowerCase();

  if (
    value.includes("google.com/maps") ||
    value.includes("maps.app.goo.gl") ||
    value.includes("g.co/kgs")
  ) {
    return "google_maps";
  }

  return "website";
}

function normalizeScanRequest(input, discoveryForm = {}) {
  if (input && typeof input.preventDefault === "function") {
    input.preventDefault();

    const fallbackUrl = s(discoveryForm.websiteUrl);
    return {
      sourceType: detectSourceTypeFromUrl(fallbackUrl),
      url: fallbackUrl,
      note: s(discoveryForm.note),
      sources: [],
      primarySource: null,
    };
  }

  const payload = obj(input);
  const url = s(payload.url || payload.sourceUrl || discoveryForm.websiteUrl);
  const sourceType =
    normalizeIncomingSourceType(payload.sourceType || payload.type) ||
    detectSourceTypeFromUrl(url);

  return {
    sourceType,
    url,
    note: s(payload.note || discoveryForm.note),
    sources: arr(payload.sources),
    primarySource: payload.primarySource || null,
  };
}

function scanStartLabel(sourceType = "") {
  return sourceType === "google_maps"
    ? "Google Maps scan başladı..."
    : "Website scan başladı...";
}

function scanCompleteLabel(sourceType = "", candidateCount = 0) {
  const count = Number(candidateCount || 0);

  if (count > 0) {
    return `${count} discovery hazırlandı.`;
  }

  return sourceType === "google_maps"
    ? "Google Maps import tamamlandı."
    : "Website import tamamlandı.";
}

function applyUiHintsFromMeta({
  nextMeta = {},
  pendingKnowledge = [],
  setShowKnowledge,
  setShowRefine,
}) {
  const stage = s(nextMeta?.nextStudioStage).toLowerCase();

  if (stage === "knowledge" && arr(pendingKnowledge).length > 0) {
    setShowKnowledge(true);
    return;
  }

  if (stage === "identity" || stage === "business_profile") {
    setShowRefine(true);
  }
}

function formFromProfile(profile = {}, prev = {}) {
  const x = obj(profile);
  const resolvedLanguage =
    resolveMainLanguageValue(
      x.mainLanguage,
      x.main_language,
      x.primaryLanguage,
      x.primary_language,
      x.language,
      x.sourceLanguage,
      x.source_source_language
    ) || s(prev.language || "az");

  return {
    ...prev,
    companyName: s(
      x.companyName ||
        x.company_name ||
        x.displayName ||
        x.display_name ||
        x.name ||
        prev.companyName
    ),
    description: s(
      x.summaryShort ||
        x.summary_short ||
        x.summaryLong ||
        x.summary_long ||
        x.description ||
        prev.description
    ),
    timezone: s(x.timezone || prev.timezone || "Asia/Baku"),
    language: resolvedLanguage,
    websiteUrl: s(
      x.websiteUrl ||
        x.website_url ||
        x.siteUrl ||
        x.site_url ||
        prev.websiteUrl
    ),
    primaryPhone: s(x.primaryPhone || x.primary_phone || prev.primaryPhone),
    primaryEmail: s(x.primaryEmail || x.primary_email || prev.primaryEmail),
    primaryAddress: s(x.primaryAddress || x.primary_address || prev.primaryAddress),
  };
}

function normalizeReviewState(payload = {}) {
  const review = obj(payload?.review || payload);

  return {
    session: review?.session || null,
    draft: obj(review?.draft),
    sources: arr(review?.sources),
    events: arr(review?.events),
  };
}

function safeNormalizeUrl(input = "") {
  const raw = s(input);
  if (!raw) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

function comparableHost(input = "") {
  const raw = s(input);
  if (!raw) return "";

  try {
    const u = new URL(safeNormalizeUrl(raw));
    return s(u.hostname).toLowerCase().replace(/^www\./, "");
  } catch {
    return s(raw)
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(/[/?#]/)[0];
  }
}

function comparableUrl(input = "") {
  const raw = s(input);
  if (!raw) return "";

  try {
    const u = new URL(safeNormalizeUrl(raw));
    const host = s(u.hostname).toLowerCase().replace(/^www\./, "");
    const path = s(u.pathname || "/").replace(/\/+$/, "") || "/";
    const search = s(u.search || "");
    return `${host}${path}${search}`;
  } catch {
    return s(raw)
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/+$/, "");
  }
}

function sourceIdentityKey(sourceType = "", sourceUrl = "") {
  const normalizedType =
    normalizeIncomingSourceType(sourceType) || detectSourceTypeFromUrl(sourceUrl);

  if (!normalizedType && !s(sourceUrl)) return "";

  if (normalizedType === "website") {
    return `website|${comparableHost(sourceUrl)}`;
  }

  return `${normalizedType || "unknown"}|${comparableUrl(sourceUrl)}`;
}

function resolveReviewSourceInfo(review = {}, legacyDraft = {}) {
  const normalizedReview = normalizeReviewState(review);
  const draft = obj(normalizedReview?.draft);
  const sourceSummary = obj(draft?.sourceSummary);
  const latestImport = obj(sourceSummary?.latestImport);
  const payload = obj(draft?.draftPayload);
  const profile = obj(draft?.businessProfile || payload?.profile);
  const primarySource = obj(payload?.intakeContext?.primarySource);
  const firstSource = obj(arr(normalizedReview?.sources)[0]);

  const sourceType = firstNonEmpty(
    latestImport?.sourceType,
    sourceSummary?.primarySourceType,
    payload?.sourceType,
    primarySource?.sourceType,
    firstSource?.sourceType,
    firstSource?.source_type,
    profile?.sourceType,
    profile?.source_type,
    legacyDraft?.rawDraft?.sourceSummary?.latestImport?.sourceType
  );

  const sourceUrl = firstNonEmpty(
    latestImport?.sourceUrl,
    sourceSummary?.primarySourceUrl,
    payload?.sourceUrl,
    primarySource?.url,
    primarySource?.sourceUrl,
    firstSource?.url,
    firstSource?.sourceUrl,
    firstSource?.source_url,
    profile?.sourceUrl,
    profile?.source_url,
    profile?.websiteUrl,
    profile?.website_url,
    legacyDraft?.rawDraft?.sourceSummary?.latestImport?.sourceUrl
  );

  return {
    sourceType,
    sourceUrl,
  };
}

function reviewStateMatchesSource(
  review = {},
  legacyDraft = {},
  sourceType = "",
  sourceUrl = ""
) {
  const expectedKey = sourceIdentityKey(sourceType, sourceUrl);
  const reviewInfo = resolveReviewSourceInfo(review, legacyDraft);
  const reviewKey = sourceIdentityKey(reviewInfo.sourceType, reviewInfo.sourceUrl);

  if (!expectedKey || !reviewKey) return false;
  return expectedKey === reviewKey;
}

function hasExtractedIdentityProfile(profile = {}) {
  const x = obj(profile);

  return !!(
    s(x.companyName || x.company_name || x.displayName || x.display_name || x.name) ||
    s(x.summaryShort || x.summary_short || x.summaryLong || x.summary_long || x.description) ||
    s(x.primaryPhone || x.primary_phone || x.phone) ||
    s(x.primaryEmail || x.primary_email || x.email) ||
    s(x.primaryAddress || x.primary_address || x.address) ||
    arr(x.services).length > 0 ||
    arr(x.socialLinks || x.social_links).length > 0 ||
    arr(x.faqItems || x.faq_items).length > 0 ||
    arr(x.pricingHints || x.pricing_hints).length > 0
  );
}

function isWebsiteBarrierWarning(value = "") {
  const code = s(value).toLowerCase();
  return (
    /^http_\d{3}$/.test(code) ||
    [
      "fetch_failed",
      "backend_access_blocked_by_remote_site",
      "remote_site_rate_limited_backend_access",
      "remote_site_temporarily_unavailable",
      "backend_could_not_reach_site",
      "non_html_website_response",
      "website_entry_not_found",
      "website_fetch_barrier_detected",
    ].includes(code)
  );
}

function isBarrierOnlyImportResult(result = {}, sourceType = "") {
  if (normalizeIncomingSourceType(sourceType) !== "website") return false;

  const mode = s(result?.mode).toLowerCase();
  const warnings = arr(result?.warnings).map((x) => s(x));
  const profile = obj(result?.profile);

  const hasBarrierWarning = warnings.some((item) => isWebsiteBarrierWarning(item));
  const hasMeaningfulIdentity = hasExtractedIdentityProfile(profile);
  const hasCandidates = Number(result?.candidateCount || 0) > 0;
  const hasServices = arr(result?.services).length > 0;
  const hasKnowledgeItems =
    arr(result?.knowledgeItems).length > 0 || arr(result?.candidates).length > 0;

  return (
    mode === "partial" &&
    hasBarrierWarning &&
    !hasMeaningfulIdentity &&
    !hasCandidates &&
    !hasServices &&
    !hasKnowledgeItems
  );
}

function normalizeDraftServiceItem(item = {}) {
  const x = obj(item);

  return {
    id: s(x.id || x.key || x.title),
    key: s(x.key),
    title: s(x.title || x.name || x.label),
    valueText: s(x.description || x.valueText || x.value_text),
    description: s(x.description || x.valueText || x.value_text),
    category: s(x.category || "service"),
    sourceType: s(x.sourceType || x.source_type),
    status: s(x.status || "pending"),
    confidence:
      typeof x.confidence === "number"
        ? x.confidence
        : Number(x.confidence || 0) || 0,
    confidenceLabel: s(x.confidenceLabel || x.confidence_label),
    evidence: arr(x.evidence),
    metadataJson: obj(x.metadataJson || x.metadata_json),
    origin: s(x.origin || "setup_review_session"),
  };
}

function normalizeDraftKnowledgeItem(item = {}) {
  const x = obj(item);

  return {
    id: s(x.id || x.key || x.title),
    candidateId: s(x.candidateId || x.id),
    key: s(x.key || x.itemKey || x.item_key),
    title: s(x.title || x.label || x.key),
    valueText: s(
      x.valueText ||
        x.value_text ||
        x.normalizedText ||
        x.normalized_text ||
        x.description
    ),
    category: s(x.category || "general"),
    sourceType: s(x.sourceType || x.source_type),
    status: s(x.status || "pending"),
    confidence:
      typeof x.confidence === "number"
        ? x.confidence
        : Number(x.confidence || 0) || 0,
    confidenceLabel: s(x.confidenceLabel || x.confidence_label),
    evidence: arr(x.evidence),
    sourceEvidenceJson: arr(x.evidence),
    metadataJson: obj(x.metadataJson || x.metadata_json),
    origin: s(x.origin || "setup_review_session"),
  };
}

function normalizeVisibleKnowledgeItem(item = {}) {
  const x = obj(item);
  const fallbackEvidence = arr(
    x.evidence || x.sourceEvidenceJson || x.source_evidence_json
  );
  const helperEvidence = arr(evidenceList(x));
  const allEvidence = fallbackEvidence.length ? fallbackEvidence : helperEvidence;

  return {
    id: s(x.id || x.candidateId || x.key || x.title),
    candidateId: s(x.candidateId || x.id),
    key: s(x.key || x.itemKey || x.item_key),
    title: s(x.title || x.label || candidateTitle(x)),
    valueText: s(
      x.valueText ||
        x.value_text ||
        x.normalizedText ||
        x.normalized_text ||
        x.description ||
        candidateValue(x)
    ),
    category: s(x.category || candidateCategory(x) || "general"),
    sourceType: s(x.sourceType || x.source_type),
    source: s(x.source || candidateSource(x) || x.sourceType || x.source_type),
    status: s(x.status || "pending"),
    confidence:
      typeof x.confidence === "number"
        ? x.confidence
        : Number(x.confidence || candidateConfidence(x) || 0) || 0,
    confidenceLabel: s(x.confidenceLabel || x.confidence_label),
    evidence: allEvidence,
    evidenceUrl: s(
      allEvidence[0]?.url ||
        allEvidence[0]?.source_url ||
        allEvidence[0]?.link ||
        allEvidence[0]?.pageUrl
    ),
    metadataJson: obj(x.metadataJson || x.metadata_json),
    origin: s(x.origin || "setup_review_session"),
  };
}

function normalizeVisibleServiceItem(item = {}) {
  const x = obj(item);

  return {
    id: s(x.id || x.serviceId || x.key || x.title || x.name),
    key: s(x.key) || safeDraftKey(s(x.title || x.name || x.label), "service"),
    title: s(x.title || x.name || x.label),
    valueText: s(x.valueText || x.description || x.summary || x.notes),
    description: s(x.description || x.valueText || x.summary || x.notes),
    category: s(x.category || "service"),
    sourceType: s(x.sourceType || x.source_type),
    status: s(x.status || "pending"),
    confidence:
      typeof x.confidence === "number"
        ? x.confidence
        : Number(x.confidence || 0) || 0,
    confidenceLabel: s(x.confidenceLabel || x.confidence_label),
    evidence: arr(x.evidence),
    metadataJson: obj(x.metadataJson || x.metadata_json),
    origin: s(x.origin || "setup_review_session"),
  };
}

function normalizeVisibleSourceItem(item = {}) {
  const x = obj(item);

  return {
    id: s(
      x.id || x.sourceId || x.source_id || x.key || x.url || x.sourceUrl
    ),
    sourceType: s(x.sourceType || x.source_type || x.type),
    label: s(
      x.label ||
        x.title ||
        x.name ||
        x.sourceLabel ||
        x.source_label ||
        x.sourceType ||
        x.source_type
    ),
    url: s(x.url || x.sourceUrl || x.source_url),
    status: s(x.status),
    runId: s(x.runId || x.run_id),
    snapshotId: s(x.snapshotId || x.snapshot_id),
    metadataJson: obj(x.metadataJson || x.metadata_json || x.metadata),
  };
}

function normalizeVisibleEventItem(item = {}) {
  const x = obj(item);

  return {
    id: s(x.id || x.eventId || x.event_id || x.createdAt || x.type),
    type: s(x.type),
    title: s(x.title || x.name || x.type),
    message: s(x.message || x.description || x.summary),
    status: s(x.status),
    createdAt: s(x.createdAt || x.created_at),
    metadataJson: obj(x.metadataJson || x.metadata_json || x.metadata),
  };
}

function draftItemsToText(items = [], mode = "default") {
  return arr(items)
    .map((item) => {
      const x = obj(item);

      if (mode === "service") {
        return `${s(x.title)} | ${s(x.valueText || x.description)}`.trim();
      }

      return `${s(x.title)} | ${s(x.valueText)}`.trim();
    })
    .filter(Boolean)
    .join("\n");
}

function mapCurrentReviewToLegacyDraft(review = {}) {
  const session = review?.session || null;
  const draft = obj(review?.draft);

  const payloadProfile = obj(draft?.draftPayload?.profile);
  const businessProfile = obj(draft?.businessProfile);
  const mergedProfile = {
    ...businessProfile,
    ...payloadProfile,
  };

  const profileMeta = extractReviewMetadata(mergedProfile);
  const draftMeta = extractReviewMetadata(draft);

  const capabilities = obj(draft?.capabilities);
  const sourceSummary = obj(draft?.sourceSummary);
  const latestImport = obj(sourceSummary?.latestImport);

  const services = arr(draft?.services).map((item) =>
    normalizeDraftServiceItem(item)
  );
  const knowledgeItems = arr(draft?.knowledgeItems).map((item) =>
    normalizeDraftKnowledgeItem(item)
  );

  const faqItems = knowledgeItems.filter((item) =>
    ["faq", "faqs"].includes(s(item.category).toLowerCase())
  );

  const policyItems = knowledgeItems.filter((item) =>
    ["policy", "policies"].includes(s(item.category).toLowerCase())
  );

  const pendingReviewCount = knowledgeItems.filter((item) => {
    const status = s(item.status).toLowerCase();
    return !status || status === "pending" || status === "review";
  }).length;

  return {
    sourceId: s(
      session?.primarySourceId ||
        sourceSummary?.latestSourceId ||
        latestImport?.sourceId
    ),
    sourceRunId: s(sourceSummary?.latestRunId || latestImport?.runId),
    snapshotId: s(draft?.lastSnapshotId),
    quickSummary: s(
      payloadProfile?.summaryShort ||
        payloadProfile?.companySummaryShort ||
        mergedProfile?.summaryShort ||
        mergedProfile?.description ||
        mergedProfile?.summaryLong
    ),
    overview: mergedProfile,
    capabilities,
    sections: {
      services,
      faqs: faqItems,
      policies: policyItems,
    },
    reviewQueue: knowledgeItems,
    existing: {},
    stats: {
      pendingReviewCount,
      knowledgeCount: knowledgeItems.length,
      serviceCount: services.length,
      warningCount: arr(draft?.warnings).length,
    },
    completeness: obj(draft?.completeness),
    confidenceSummary: obj(draft?.confidenceSummary),
    warnings: arr(draft?.warnings),
    rawDraft: draft,
    session,
    draft,
    sources: arr(review?.sources),
    events: arr(review?.events),
    reviewRequired: !!(
      draftMeta.reviewRequired || profileMeta.reviewRequired
    ),
    reviewFlags: arr(draftMeta.reviewFlags).length
      ? arr(draftMeta.reviewFlags)
      : arr(profileMeta.reviewFlags),
    fieldConfidence: Object.keys(draftMeta.fieldConfidence).length
      ? obj(draftMeta.fieldConfidence)
      : obj(profileMeta.fieldConfidence),
    mainLanguage:
      draftMeta.mainLanguage || profileMeta.mainLanguage || "",
    primaryLanguage:
      draftMeta.primaryLanguage || profileMeta.primaryLanguage || "",
  };
}

function buildManualSectionsFromReview(review = {}) {
  const draft = obj(review?.draft);
  const services = arr(draft?.services).map((item) =>
    normalizeDraftServiceItem(item)
  );
  const knowledgeItems = arr(draft?.knowledgeItems).map((item) =>
    normalizeDraftKnowledgeItem(item)
  );

  const faqs = knowledgeItems.filter((item) =>
    ["faq", "faqs"].includes(s(item.category).toLowerCase())
  );
  const policies = knowledgeItems.filter((item) =>
    ["policy", "policies"].includes(s(item.category).toLowerCase())
  );

  return {
    servicesText: draftItemsToText(services, "service"),
    faqsText: draftItemsToText(faqs, "faq"),
    policiesText: draftItemsToText(policies, "policy"),
  };
}

function safeDraftKey(value = "", fallback = "item") {
  return (
    s(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || fallback
  );
}

function mergeItemsByKey(existing = [], incoming = [], keys = ["key", "title", "category"]) {
  const map = new Map();

  const buildKey = (item = {}) =>
    keys
      .map((key) => s(item?.[key]).toLowerCase())
      .filter(Boolean)
      .join("|");

  for (const item of arr(existing)) {
    const stableKey = buildKey(item) || JSON.stringify(item);
    map.set(stableKey, { ...obj(item) });
  }

  for (const item of arr(incoming)) {
    const stableKey = buildKey(item) || JSON.stringify(item);
    if (!map.has(stableKey)) {
      map.set(stableKey, { ...obj(item) });
      continue;
    }

    map.set(stableKey, {
      ...obj(map.get(stableKey)),
      ...obj(item),
    });
  }

  return [...map.values()];
}

function parseServicesText(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...rest] = line.split("|");
      const name = s(namePart);
      const description = s(rest.join("|"));
      return {
        name: name || description,
        description: description || name,
      };
    })
    .filter((item) => s(item.name) || s(item.description));
}

function parseFaqsText(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [questionPart, ...rest] = line.split("|");
      const question = s(questionPart);
      const answer = s(rest.join("|"));
      return {
        question: question || answer,
        answer: answer || question,
      };
    })
    .filter((item) => s(item.question) || s(item.answer));
}

function parsePoliciesText(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, ...rest] = line.split("|");
      const title = s(titlePart);
      const description = s(rest.join("|"));
      return {
        title: title || description,
        description: description || title,
      };
    })
    .filter((item) => s(item.title) || s(item.description));
}

function buildServiceDraftItemsFromManual(value = "", existing = []) {
  const manual = parseServicesText(value).map((item) => ({
    key: safeDraftKey(s(item.name), "service"),
    title: s(item.name),
    description: s(item.description),
    valueText: s(item.description),
    category: "service",
    origin: "manual_setup",
    status: "approved",
  }));

  return mergeItemsByKey(existing, manual, ["key", "title"]);
}

function buildKnowledgeDraftItemsFromManual({
  faqsText = "",
  policiesText = "",
  existing = [],
}) {
  const preserved = arr(existing).filter((item) => {
    const category = s(item.category).toLowerCase();
    return (
      category !== "faq" &&
      category !== "faqs" &&
      category !== "policy" &&
      category !== "policies"
    );
  });

  const faqItems = parseFaqsText(faqsText).map((item) => ({
    key: safeDraftKey(s(item.question), "faq"),
    title: s(item.question),
    valueText: s(item.answer),
    normalizedText: s(item.answer),
    category: "faq",
    origin: "manual_setup",
    status: "approved",
  }));

  const policyItems = parsePoliciesText(policiesText).map((item) => ({
    key: safeDraftKey(s(item.title), "policy"),
    title: s(item.title),
    valueText: s(item.description),
    normalizedText: s(item.description),
    category: "policy",
    origin: "manual_setup",
    status: "approved",
  }));

  return mergeItemsByKey(preserved, [...faqItems, ...policyItems], [
    "key",
    "title",
    "category",
  ]);
}

function buildBusinessProfilePatch({
  businessForm = {},
  currentReview = {},
  discoveryState = {},
}) {
  const existing = obj(currentReview?.draft?.businessProfile);

  const resolvedLanguage =
    resolveMainLanguageValue(
      businessForm.language,
      existing.mainLanguage,
      existing.primaryLanguage,
      existing.language,
      discoveryState.mainLanguage,
      discoveryState.primaryLanguage,
      discoveryState.language
    ) || "en";

  const supportedLanguages = arr(existing.supportedLanguages).length
    ? arr(existing.supportedLanguages)
    : [resolvedLanguage];

  return {
    ...existing,
    companyName: s(businessForm.companyName),
    displayName: s(businessForm.companyName),
    name: s(businessForm.companyName || existing.name),
    summaryShort: s(businessForm.description),
    summaryLong: s(businessForm.description || existing.summaryLong),
    description: s(businessForm.description),
    mainLanguage: resolvedLanguage,
    primaryLanguage: resolvedLanguage,
    language: resolvedLanguage,
    supportedLanguages,
    timezone: s(businessForm.timezone || "Asia/Baku"),
    websiteUrl: s(
      businessForm.websiteUrl || existing.websiteUrl || discoveryState?.lastUrl
    ),
    primaryPhone: s(businessForm.primaryPhone),
    primaryEmail: s(businessForm.primaryEmail),
    primaryAddress: s(businessForm.primaryAddress),
    reviewRequired: !!(
      existing.reviewRequired ?? discoveryState.reviewRequired ?? false
    ),
    reviewFlags: arr(existing.reviewFlags).length
      ? arr(existing.reviewFlags)
      : arr(discoveryState.reviewFlags),
    fieldConfidence: Object.keys(obj(existing.fieldConfidence)).length
      ? obj(existing.fieldConfidence)
      : obj(discoveryState.fieldConfidence),
  };
}

function buildCapabilitiesPatch({ currentReview = {}, businessForm = {} }) {
  const existing = obj(currentReview?.draft?.capabilities);

  const language =
    resolveMainLanguageValue(
      businessForm.language,
      existing.primaryLanguage,
      existing.mainLanguage,
      existing.language
    ) || "en";

  const supportedLanguages = arr(existing.supportedLanguages).length
    ? arr(existing.supportedLanguages)
    : [language];

  return {
    ...existing,
    primaryLanguage: language,
    mainLanguage: language,
    supportedLanguages,
    supportsMultilanguage: supportedLanguages.length > 1,
  };
}

function extractProfileName(profile = {}) {
  const x = obj(profile);
  return s(
    x.companyName ||
      x.company_name ||
      x.displayName ||
      x.display_name ||
      x.name
  );
}

function hasMeaningfulProfile(profile = {}) {
  const x = obj(profile);
  return !!(
    extractProfileName(x) ||
    s(
      x.summaryShort ||
        x.summary_short ||
        x.description ||
        x.summaryLong ||
        x.summary_long
    ) ||
    s(x.websiteUrl || x.website_url) ||
    s(x.primaryPhone || x.primary_phone) ||
    s(x.primaryEmail || x.primary_email) ||
    s(x.primaryAddress || x.primary_address)
  );
}

function isPlaceholderBusinessName(value = "") {
  const x = s(value).toLowerCase();

  if (!x) return true;

  return ["google maps", "maps", "website", "source", "business", "company"].includes(
    x
  );
}

function shouldPreferCandidateCompanyName(currentValue = "", nextValue = "") {
  const current = s(currentValue);
  const next = s(nextValue);

  if (!next) return false;
  if (!current) return true;
  if (isPlaceholderBusinessName(current) && !isPlaceholderBusinessName(next)) {
    return true;
  }
  return false;
}

function hydrateBusinessFormFromProfile(prev = {}, profile = {}, { force = false } = {}) {
  const candidate = formFromProfile(profile, prev);

  const next = { ...prev };

  const prevCompanyName = s(prev.companyName);
  const nextCompanyName = s(candidate.companyName);

  if (force || shouldPreferCandidateCompanyName(prevCompanyName, nextCompanyName)) {
    next.companyName = nextCompanyName;
  }

  if (force || !s(next.description)) {
    next.description = s(candidate.description || prev.description);
  }

  if (force || !s(next.websiteUrl)) {
    next.websiteUrl = s(candidate.websiteUrl || prev.websiteUrl);
  }

  if (force || !s(next.primaryPhone)) {
    next.primaryPhone = s(candidate.primaryPhone || prev.primaryPhone);
  }

  if (force || !s(next.primaryEmail)) {
    next.primaryEmail = s(candidate.primaryEmail || prev.primaryEmail);
  }

  if (force || !s(next.primaryAddress)) {
    next.primaryAddress = s(candidate.primaryAddress || prev.primaryAddress);
  }

  if (force || !s(next.timezone)) {
    next.timezone = s(candidate.timezone || prev.timezone || "Asia/Baku");
  }

  if (force || !s(next.language)) {
    next.language = s(candidate.language || prev.language || "az");
  }

  return next;
}

function chooseBestProfileForForm(...profiles) {
  for (const profile of profiles) {
    if (hasMeaningfulProfile(profile)) return obj(profile);
  }
  return {};
}

function deriveVisibleKnowledgeItems({
  reviewDraft = {},
  currentReview = {},
  discoveryState = {},
}) {
  const reviewQueueItems = arr(reviewDraft?.reviewQueue).map((item) =>
    normalizeVisibleKnowledgeItem(item)
  );

  const currentDraftItems = arr(currentReview?.draft?.knowledgeItems).map((item) =>
    normalizeVisibleKnowledgeItem(item)
  );

  const snapshotItems = arr(
    discoveryState?.snapshot?.knowledgeItems ||
      discoveryState?.snapshot?.items ||
      discoveryState?.importedKnowledgeItems
  ).map((item) => normalizeVisibleKnowledgeItem(item));

  const merged = mergeItemsByKey(
    reviewQueueItems,
    [...currentDraftItems, ...snapshotItems],
    ["candidateId", "key", "title", "category"]
  );

  return merged.map((item) => normalizeVisibleKnowledgeItem(item));
}

function deriveVisibleServiceItems({
  reviewDraft = {},
  currentReview = {},
  discoveryState = {},
}) {
  const sectionServices = arr(reviewDraft?.sections?.services).map((item) =>
    normalizeVisibleServiceItem(item)
  );

  const currentDraftServices = arr(currentReview?.draft?.services).map((item) =>
    normalizeVisibleServiceItem(item)
  );

  const snapshotServices = [
    ...arr(discoveryState?.importedServices),
    ...arr(
      discoveryState?.snapshot?.services ||
        discoveryState?.profile?.services ||
        discoveryState?.signals?.sourceFusion?.profile?.services ||
        discoveryState?.signals?.website?.offerings?.services
    ),
  ].map((item) =>
    typeof item === "string"
      ? normalizeVisibleServiceItem({ title: item, description: item })
      : normalizeVisibleServiceItem(item)
  );

  const merged = mergeItemsByKey(
    sectionServices,
    [...currentDraftServices, ...snapshotServices],
    ["id", "key", "title", "category"]
  );

  return merged.map((item) => normalizeVisibleServiceItem(item));
}

function deriveVisibleSources({ currentReview = {}, discoveryState = {} }) {
  const reviewSources = arr(currentReview?.sources).map((item) =>
    normalizeVisibleSourceItem(item)
  );

  const intakeSources = arr(discoveryState?.intakeContext?.sources).map((item) =>
    normalizeVisibleSourceItem(item)
  );

  const primarySource = obj(discoveryState?.intakeContext?.primarySource);
  const directStateSource =
    s(discoveryState?.lastUrl) || s(discoveryState?.sourceId)
      ? [
          normalizeVisibleSourceItem({
            id: discoveryState?.sourceId,
            sourceType: discoveryState?.lastSourceType,
            label: discoveryState?.sourceLabel,
            url: discoveryState?.lastUrl,
            runId: discoveryState?.sourceRunId,
            snapshotId: discoveryState?.snapshotId,
            status: discoveryState?.mode,
          }),
        ]
      : [];

  const incoming = [
    ...intakeSources,
    ...(Object.keys(primarySource).length
      ? [normalizeVisibleSourceItem(primarySource)]
      : []),
    ...directStateSource,
  ];

  const merged = mergeItemsByKey(reviewSources, incoming, [
    "id",
    "sourceType",
    "url",
    "label",
  ]);

  return merged
    .map((item) => normalizeVisibleSourceItem(item))
    .filter((item) => item.id || item.url || item.label || item.sourceType);
}

function deriveVisibleEvents(currentReview = {}) {
  return arr(currentReview?.events)
    .map((item) => normalizeVisibleEventItem(item))
    .filter((item) => item.id || item.type || item.message || item.createdAt);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const x = s(value);
    if (x) return x;
  }
  return "";
}

export default function SetupStudioScreen() {
  const navigate = useNavigate();
  const autoRevealRef = useRef("");

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
    companyName: "",
    description: "",
    timezone: "Asia/Baku",
    language: "az",
    websiteUrl: "",
    primaryPhone: "",
    primaryEmail: "",
    primaryAddress: "",
  });

  const [manualSections, setManualSections] = useState({
    servicesText: "",
    faqsText: "",
    policiesText: "",
  });

  const [currentReview, setCurrentReview] = useState(createEmptyReviewState);
  const [reviewDraft, setReviewDraft] = useState(createEmptyLegacyDraft);
  const [discoveryState, setDiscoveryState] = useState(createIdleDiscoveryState);

  const [discoveryForm, setDiscoveryForm] = useState({
    websiteUrl: "",
    note: "",
  });

  const [knowledgeCandidates, setKnowledgeCandidates] = useState([]);
  const [services, setServices] = useState([]);

  const [meta, setMeta] = useState({
    readinessScore: 0,
    readinessLabel: "",
    missingSteps: [],
    primaryMissingStep: "",
    nextRoute: "/",
    nextSetupRoute: "/setup/studio",
    nextStudioStage: "",
    setupCompleted: false,
    pendingCandidateCount: 0,
    approvedKnowledgeCount: 0,
    serviceCount: 0,
    playbookCount: 0,
    runtimeKnowledgeCount: 0,
    runtimeServiceCount: 0,
    runtimePlaybookCount: 0,
  });

  function clearStudioReviewState() {
    autoRevealRef.current = "";
    setCurrentReview(createEmptyReviewState());
    setReviewDraft(createEmptyLegacyDraft());
    setDiscoveryState(createIdleDiscoveryState());
    setShowRefine(false);
    setShowKnowledge(false);
  }

  function resetBusinessTwinDraftForNewScan(nextSourceUrl = "") {
    setBusinessForm((prev) => ({
      ...prev,
      companyName: "",
      description: "",
      websiteUrl: s(nextSourceUrl),
      primaryPhone: "",
      primaryEmail: "",
      primaryAddress: "",
    }));

    setManualSections({
      servicesText: "",
      faqsText: "",
      policiesText: "",
    });
  }

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

  function syncDiscoveryStateFromReview(review = {}, { preserveCounts = true } = {}) {
    const normalized = normalizeReviewState(review);
    const legacy = mapCurrentReviewToLegacyDraft(normalized);
    const profile = obj(legacy.overview);
    const metadata = extractReviewMetadata({
      ...legacy,
      ...profile,
      reviewRequired: legacy.reviewRequired,
      reviewFlags: legacy.reviewFlags,
      fieldConfidence: legacy.fieldConfidence,
      mainLanguage: legacy.mainLanguage || profile.mainLanguage,
      primaryLanguage: legacy.primaryLanguage || profile.primaryLanguage,
    });

    setDiscoveryState((prev) => ({
      ...prev,
      mainLanguage:
        metadata.mainLanguage || prev.mainLanguage || "",
      primaryLanguage:
        metadata.primaryLanguage || prev.primaryLanguage || "",
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
      warnings: arr(legacy.warnings).length ? arr(legacy.warnings) : arr(prev.warnings),
      candidateCount: preserveCounts
        ? prev.candidateCount
        : Number(legacy.stats?.knowledgeCount || prev.candidateCount || 0),
      sourceRunId: s(legacy.sourceRunId || prev.sourceRunId),
      snapshotId: s(legacy.snapshotId || prev.snapshotId),
      sourceId: s(legacy.sourceId || prev.sourceId),
      lastSourceType: s(
        resolveReviewSourceInfo(normalized, legacy).sourceType || prev.lastSourceType
      ),
      lastUrl: s(
        resolveReviewSourceInfo(normalized, legacy).sourceUrl || prev.lastUrl
      ),
    }));
  }

  function applyReviewState(
    reviewPayload = {},
    { preserveBusinessForm = false, fallbackProfile = {} } = {}
  ) {
    const normalized = normalizeReviewState(reviewPayload);
    const legacy = mapCurrentReviewToLegacyDraft(normalized);
    const nextManualSections = buildManualSectionsFromReview(normalized);

    setCurrentReview(normalized);
    setReviewDraft(legacy);

    const preferredProfile = chooseBestProfileForForm(
      legacy.overview,
      fallbackProfile
    );

    setBusinessForm((prev) => {
      if (!hasMeaningfulProfile(preferredProfile)) {
        return preserveBusinessForm ? prev : formFromProfile(legacy.overview, prev);
      }

      if (preserveBusinessForm) {
        return hydrateBusinessFormFromProfile(prev, preferredProfile, {
          force: false,
        });
      }

      return hydrateBusinessFormFromProfile(prev, preferredProfile, {
        force: true,
      });
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

  async function loadCurrentReview({
    preserveBusinessForm = false,
    activateReviewSession = true,
  } = {}) {
    try {
      const payload = await getCurrentSetupReview({ eventLimit: 30 });
      const normalized = normalizeReviewState(payload);
      const legacy = mapCurrentReviewToLegacyDraft(normalized);

      const shouldApplyIntoActiveStudio =
        !preserveBusinessForm ||
        !s(discoveryState.lastUrl) ||
        reviewStateMatchesSource(
          normalized,
          legacy,
          discoveryState.lastSourceType,
          discoveryState.lastUrl
        );

      if (activateReviewSession && shouldApplyIntoActiveStudio) {
        setFreshEntryMode(false);
      }

      if (!shouldApplyIntoActiveStudio) {
        setCurrentReview(normalized);
        setReviewDraft(legacy);

        return {
          currentReview: normalized,
          reviewDraft: legacy,
        };
      }

      return applyReviewState(payload, { preserveBusinessForm });
    } catch {
      const empty = createEmptyReviewState();
      setCurrentReview(empty);
      setReviewDraft(createEmptyLegacyDraft());
      return {
        currentReview: empty,
        reviewDraft: createEmptyLegacyDraft(),
      };
    }
  }

  async function loadData({
    silent = false,
    preserveBusinessForm = false,
    hydrateReview = false,
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

      if (hydrateReview) {
        const reviewState = normalizeReviewState(reviewPayload);
        const legacyDraft = mapCurrentReviewToLegacyDraft(reviewState);

        const shouldApplyIntoActiveStudio =
          !preserveBusinessForm ||
          !s(discoveryState.lastUrl) ||
          reviewStateMatchesSource(
            reviewState,
            legacyDraft,
            discoveryState.lastSourceType,
            discoveryState.lastUrl
          );

        setCurrentReview(reviewState);
        setReviewDraft(legacyDraft);

        if (shouldApplyIntoActiveStudio) {
          const baseProfile = chooseBestProfileForForm(legacyDraft?.overview, profile);

          setBusinessForm((prev) => {
            if (!preserveBusinessForm) {
              return hydrateBusinessFormFromProfile(
                {
                  ...prev,
                  companyName: s(profile?.companyName),
                  description: s(profile?.description),
                  timezone: s(profile?.timezone || "Asia/Baku"),
                  language:
                    resolveMainLanguageValue(
                      profile?.mainLanguage,
                      profile?.primaryLanguage,
                      profile?.language,
                      firstLanguage(profile)
                    ) || "az",
                  websiteUrl: s(profile?.websiteUrl || profile?.website_url),
                  primaryPhone: s(profile?.primaryPhone || profile?.primary_phone),
                  primaryEmail: s(profile?.primaryEmail || profile?.primary_email),
                  primaryAddress: s(profile?.primaryAddress || profile?.primary_address),
                },
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

          syncDiscoveryStateFromReview(reviewState, { preserveCounts: false });

          applyUiHintsFromMeta({
            nextMeta,
            pendingKnowledge,
            setShowKnowledge,
            setShowRefine,
          });
        }

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

      if (!preserveBusinessForm) {
        setCurrentReview(createEmptyReviewState());
        setReviewDraft(createEmptyLegacyDraft());
        setDiscoveryState(createIdleDiscoveryState());
        setShowRefine(false);
        setShowKnowledge(false);

        setBusinessForm((prev) => ({
          ...prev,
          companyName: s(profile?.companyName),
          description: s(profile?.description),
          timezone: s(profile?.timezone || "Asia/Baku"),
          language:
            resolveMainLanguageValue(
              profile?.mainLanguage,
              profile?.primaryLanguage,
              profile?.language,
              firstLanguage(profile)
            ) || "az",
          websiteUrl: s(profile?.websiteUrl || profile?.website_url),
          primaryPhone: s(profile?.primaryPhone || profile?.primary_phone),
          primaryEmail: s(profile?.primaryEmail || profile?.primary_email),
          primaryAddress: s(profile?.primaryAddress || profile?.primary_address),
        }));
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

  useEffect(() => {
    loadData({
      hydrateReview: false,
      preserveBusinessForm: false,
    });
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

  async function refreshAndMaybeRouteHome({
    preserveBusinessForm = false,
    hydrateReview = !freshEntryMode,
  } = {}) {
    const snapshot = await loadData({
      silent: true,
      preserveBusinessForm,
      hydrateReview,
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
    const sourceType = request.sourceType;
    const sourceUrl = s(request.url);

    if (!sourceUrl) {
      setError("Source URL boş ola bilməz.");
      return;
    }

    if (!sourceType) {
      setError("Scan üçün source type müəyyən edilə bilmədi.");
      return;
    }

    try {
      setImportingWebsite(true);
      setFreshEntryMode(false);
      setError("");
      autoRevealRef.current = "";

      clearStudioReviewState();
      resetBusinessTwinDraftForNewScan(sourceUrl);

      setDiscoveryState((prev) => ({
        ...prev,
        mode: "running",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: sourceType === "google_maps" ? "Google Maps" : "Website",
        message: scanStartLabel(sourceType),
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

      const result = await importSourceForSetup({
        sourceType,
        url: sourceUrl,
        sourceUrl: sourceUrl,
        note: request.note,
        businessNote: request.note,
        sources: request.sources,
        primarySource: request.primarySource,
      });

      const importedReview = normalizeReviewState(result?.review || {});
      const legacyImportedDraft = mapCurrentReviewToLegacyDraft(importedReview);
      const incomingReviewAligned = reviewStateMatchesSource(
        importedReview,
        legacyImportedDraft,
        sourceType,
        sourceUrl
      );

      const reviewBackedProfile = incomingReviewAligned
        ? obj(legacyImportedDraft?.overview)
        : {};

      const discoveredProfile = obj(result?.profile);
      const helperProfilePatch = profilePatchFromDiscovery(discoveredProfile);
      const barrierOnlyResult = isBarrierOnlyImportResult(result, sourceType);

      const bestIncomingProfile = barrierOnlyResult
        ? chooseBestProfileForForm(discoveredProfile, helperProfilePatch)
        : chooseBestProfileForForm(
            reviewBackedProfile,
            discoveredProfile,
            helperProfilePatch
          );

      const resultMetadata = extractReviewMetadata({
        ...discoveredProfile,
        reviewRequired:
          result?.reviewRequired ?? legacyImportedDraft?.reviewRequired ?? false,
        reviewFlags:
          result?.reviewFlags || legacyImportedDraft?.reviewFlags || [],
        fieldConfidence:
          result?.fieldConfidence || legacyImportedDraft?.fieldConfidence || {},
        mainLanguage:
          result?.mainLanguage ||
          legacyImportedDraft?.mainLanguage ||
          discoveredProfile?.mainLanguage,
      });

      setBusinessForm((prev) => {
        const blankBase = {
          ...prev,
          companyName: "",
          description: "",
          websiteUrl: sourceUrl,
          primaryPhone: "",
          primaryEmail: "",
          primaryAddress: "",
        };

        const mergedFromHelper = mergeBusinessForm(blankBase, helperProfilePatch);
        const next = hydrateBusinessFormFromProfile(
          mergedFromHelper,
          bestIncomingProfile,
          { force: false }
        );

        if (!s(next.language) && resultMetadata.mainLanguage) {
          next.language = resultMetadata.mainLanguage;
        }

        return next;
      });

      if (result?.review && !barrierOnlyResult && incomingReviewAligned) {
        applyReviewState(result.review, {
          preserveBusinessForm: true,
          fallbackProfile: discoveredProfile,
        });
      } else {
        setCurrentReview(createEmptyReviewState());
        setReviewDraft(createEmptyLegacyDraft());
      }

      const resultWarnings = arr(result?.warnings)
        .map((x) => s(x))
        .filter(Boolean);

      const sourceId = s(result?.source?.id || legacyImportedDraft?.sourceId);
      const sourceRunId = s(result?.run?.id || legacyImportedDraft?.sourceRunId);
      const snapshotId = s(legacyImportedDraft?.snapshotId || result?.snapshot?.id);

      const immediateDiscoveryState = {
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: s(
          result?.sourceLabel ||
            (sourceType === "google_maps" ? "Google Maps" : "Website")
        ),
        intakeContext: obj(result?.intakeContext),
        snapshot: obj(result?.snapshot),
        profile: discoveredProfile,
        signals: obj(result?.signals),
        sourceId,
        sourceRunId,
        snapshotId,
        importedKnowledgeItems: barrierOnlyResult
          ? []
          : arr(result?.candidates || result?.knowledgeItems),
        importedServices: barrierOnlyResult ? [] : arr(result?.services),
        mainLanguage:
          resultMetadata.mainLanguage ||
          resolveMainLanguageValue(
            discoveredProfile?.mainLanguage,
            discoveredProfile?.primaryLanguage,
            discoveredProfile?.language
          ),
        primaryLanguage:
          resultMetadata.primaryLanguage ||
          resolveMainLanguageValue(
            discoveredProfile?.primaryLanguage,
            discoveredProfile?.mainLanguage,
            discoveredProfile?.language
          ),
        reviewRequired: !!(result?.shouldReview || resultMetadata.reviewRequired),
        reviewFlags: arr(resultMetadata.reviewFlags),
        fieldConfidence: obj(resultMetadata.fieldConfidence),
      };

      const importedVisibleKnowledgeItems = barrierOnlyResult
        ? []
        : deriveVisibleKnowledgeItems({
            reviewDraft: incomingReviewAligned ? legacyImportedDraft : createEmptyLegacyDraft(),
            currentReview: incomingReviewAligned ? importedReview : createEmptyReviewState(),
            discoveryState: immediateDiscoveryState,
          });

      const importedVisibleServiceItems = barrierOnlyResult
        ? []
        : deriveVisibleServiceItems({
            reviewDraft: incomingReviewAligned ? legacyImportedDraft : createEmptyLegacyDraft(),
            currentReview: incomingReviewAligned ? importedReview : createEmptyReviewState(),
            discoveryState: immediateDiscoveryState,
          });

      const importedVisibleSources = deriveVisibleSources({
        currentReview: incomingReviewAligned ? importedReview : createEmptyReviewState(),
        discoveryState: immediateDiscoveryState,
      });

      const importedProfileRows = profilePreviewRows(
        chooseBestProfileForForm(bestIncomingProfile, reviewBackedProfile)
      );

      const hasImmediateVisibleResults =
        importedVisibleKnowledgeItems.length > 0 ||
        importedVisibleServiceItems.length > 0 ||
        importedVisibleSources.length > 0 ||
        importedProfileRows.length > 0 ||
        resultWarnings.length > 0 ||
        hasMeaningfulProfile(bestIncomingProfile);

      setDiscoveryState({
        mode: s(result?.mode) || "success",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: s(
          result?.sourceLabel ||
            (sourceType === "google_maps" ? "Google Maps" : "Website")
        ),
        message:
          resultWarnings.length > 0
            ? resultWarnings[0]
            : scanCompleteLabel(sourceType, result?.candidateCount),
        candidateCount: barrierOnlyResult ? 0 : Number(result?.candidateCount || 0),
        profileApplied: hasMeaningfulProfile(bestIncomingProfile),
        shouldReview: !!result?.shouldReview,
        warnings: resultWarnings,
        requestId: s(result?.requestId),
        intakeContext: obj(result?.intakeContext),
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
        signals: obj(result?.signals),
        snapshot: obj(result?.snapshot),
        sourceId,
        sourceRunId,
        snapshotId,
        reviewSessionId: barrierOnlyResult
          ? ""
          : s(result?.reviewSessionId || importedReview?.session?.id),
        reviewSessionStatus: barrierOnlyResult
          ? ""
          : s(result?.reviewSessionStatus || importedReview?.session?.status),
        hasResults: hasImmediateVisibleResults,
        resultCount:
          importedVisibleKnowledgeItems.length +
          importedVisibleServiceItems.length +
          importedVisibleSources.length +
          importedProfileRows.length,
        importedKnowledgeItems: barrierOnlyResult
          ? []
          : arr(result?.candidates || result?.knowledgeItems),
        importedServices: barrierOnlyResult ? [] : arr(result?.services),
        mainLanguage: immediateDiscoveryState.mainLanguage,
        primaryLanguage: immediateDiscoveryState.primaryLanguage,
        reviewRequired: immediateDiscoveryState.reviewRequired,
        reviewFlags: arr(immediateDiscoveryState.reviewFlags),
        fieldConfidence: obj(immediateDiscoveryState.fieldConfidence),
      });

      const refreshResult = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: !barrierOnlyResult,
      });

      if (!refreshResult.routed) {
        const refreshedPendingKnowledge = arr(
          refreshResult?.snapshot?.pendingKnowledge
        );

        const shouldOpenKnowledge =
          !barrierOnlyResult &&
          (
            !!result?.shouldReview ||
            Number(result?.candidateCount || 0) > 0 ||
            refreshedPendingKnowledge.length > 0 ||
            importedVisibleKnowledgeItems.length > 0 ||
            importedVisibleServiceItems.length > 0 ||
            s(refreshResult?.snapshot?.meta?.nextStudioStage).toLowerCase() ===
              "knowledge"
          );

        const shouldOpenRefine =
          !barrierOnlyResult &&
          (
            hasImmediateVisibleResults ||
            hasMeaningfulProfile(bestIncomingProfile) ||
            importedProfileRows.length > 0
          );

        setShowKnowledge(shouldOpenKnowledge);
        setShowRefine(shouldOpenRefine);
      }
    } catch (e2) {
      const message = String(e2?.message || e2 || "Source scan alınmadı.");
      setDiscoveryState((prev) => ({
        ...prev,
        mode: "error",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: sourceType === "google_maps" ? "Google Maps" : "Website",
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

      const activeSessionId = s(currentReview?.session?.id);

      if (!activeSessionId) {
        throw new Error("Aktiv setup review session tapılmadı.");
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
      });

      await finalizeCurrentSetupReview({
        reason: "setup_studio_finalize",
        metadata: {
          requestId: s(discoveryState.requestId),
        },
      });

      setShowRefine(false);
      setShowKnowledge(false);

      const refreshed = await refreshAndMaybeRouteHome({
        preserveBusinessForm: false,
        hydrateReview: true,
      });

      if (!refreshed?.routed) {
        await loadCurrentReview({
          preserveBusinessForm: false,
          activateReviewSession: true,
        });
      }

      return { ok: true };
    } catch (e2) {
      setError(
        String(e2?.message || e2 || "Business twin finalize edilə bilmədi.")
      );
      return { ok: false };
    } finally {
      setSavingBusiness(false);
    }
  }

  async function onApproveKnowledge(item) {
    const id = s(item.id || item.candidateId);
    if (!id) return { ok: false };

    try {
      setFreshEntryMode(false);
      setActingKnowledgeId(id);
      setError("");

      await approveKnowledgeCandidate(id, {});
      await loadCurrentReview({
        preserveBusinessForm: true,
        activateReviewSession: true,
      });

      const refreshed = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: true,
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
    const id = s(item.id || item.candidateId);
    if (!id) return { ok: false };

    try {
      setFreshEntryMode(false);
      setActingKnowledgeId(id);
      setError("");

      await rejectKnowledgeCandidate(id, {});
      await loadCurrentReview({
        preserveBusinessForm: true,
        activateReviewSession: true,
      });

      const refreshed = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
        hydrateReview: true,
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

  const activeReviewAligned = useMemo(() => {
    if (freshEntryMode) return false;
    if (!s(discoveryState.lastUrl)) return true;

    return reviewStateMatchesSource(
      currentReview,
      reviewDraft,
      discoveryState.lastSourceType,
      discoveryState.lastUrl
    );
  }, [
    freshEntryMode,
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
      setupCompleted: !!(
        effectiveMeta.setupCompleted ?? derived.setupCompleted
      ),
    };
  }, [importingWebsite, discoveryState, effectiveMeta]);

  const knowledgePreview = useMemo(() => {
    return visibleKnowledgeItems.slice(0, 6).map((item) => ({
      id: s(item.id || item.candidateId),
      title: s(item.title),
      value: s(item.valueText),
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
    const businessName = s(businessForm.companyName);
    const reviewName = s(
      scopedReviewDraft?.overview?.companyName ||
        scopedReviewDraft?.overview?.displayName ||
        scopedReviewDraft?.overview?.name
    );

    if (shouldPreferCandidateCompanyName(businessName, reviewName)) {
      return reviewName;
    }

    return s(businessName || reviewName);
  }, [businessForm.companyName, scopedReviewDraft]);

  const currentDescription = useMemo(
    () =>
      s(
        scopedReviewDraft?.quickSummary ||
          businessForm.description ||
          scopedReviewDraft?.overview?.summaryShort ||
          discoveryState?.profile?.summaryShort
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
  ]);

  useEffect(() => {
    if (freshEntryMode) return;

    const mode = s(discoveryState.mode).toLowerCase();

    if (!hasVisibleResults) return;
    if (mode === "idle" || mode === "running") return;
    if (!autoRevealKey) return;
    if (!activeReviewAligned && !hasExtractedIdentityProfile(discoveryState.profile) && arr(discoveryState.warnings).length === 0) {
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
      (
        visibleKnowledgeItems.length > 0 ||
        visibleServiceItems.length > 0 ||
        discoveryProfileRows.length > 0
      )
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
      onScanBusiness={onScanBusiness}
      onSaveBusiness={onSaveBusiness}
      onApproveKnowledge={onApproveKnowledge}
      onRejectKnowledge={onRejectKnowledge}
      onCreateSuggestedService={onCreateSuggestedService}
      onOpenWorkspace={onOpenWorkspace}
      onReloadReviewDraft={() =>
        loadCurrentReview({
          preserveBusinessForm: true,
          activateReviewSession: true,
        })
      }
      onRefresh={() =>
        loadData({
          silent: true,
          preserveBusinessForm: !freshEntryMode,
          hydrateReview: !freshEntryMode,
        })
      }
      onToggleRefine={() => setShowRefine((prev) => !prev)}
      onToggleKnowledge={() => setShowKnowledge((prev) => !prev)}
      discoveryModeLabel={discoveryModeLabel}
    />
  );
}