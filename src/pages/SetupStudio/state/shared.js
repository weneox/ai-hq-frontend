// src/pages/SetupStudio/state/shared.js

export function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

export function arr(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function obj(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;
}

export const KNOWN_LANGS = new Set(["az", "en", "tr", "ru"]);

export const STUDIO_SOURCE_TYPES = new Set([
  "manual",
  "website",
  "instagram",
  "facebook",
  "linkedin",
  "google_maps",
]);

export const IMPORTABLE_STUDIO_SOURCE_TYPES = new Set([
  "website",
  "google_maps",
]);

function lower(value = "") {
  return s(value).toLowerCase();
}

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function firstObject(...values) {
  for (const value of values) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
  }
  return {};
}

export function createEmptyReviewState() {
  return {
    session: null,
    draft: {},
    sources: [],
    events: [],
    bundleSources: [],
    contributionSummary: {},
    fieldProvenance: {},
    reviewDraftSummary: {},
  };
}

export function createEmptyLegacyDraft() {
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
    bundleSources: [],
    contributionSummary: {},
    fieldProvenance: {},
    reviewDraftSummary: {},
  };
}

export function createIdleDiscoveryState() {
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

export function createEmptySourceScope() {
  return {
    sourceType: "",
    sourceUrl: "",
  };
}

export function pickSetupProfile(setup = {}, workspace = {}) {
  return obj(
    setup?.tenantProfile ||
      setup?.businessProfile ||
      workspace?.tenantProfile ||
      workspace?.businessProfile
  );
}

export function normalizeBootMeta(
  boot = {},
  pendingKnowledge = [],
  serviceItems = []
) {
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

export function resolveMainLanguageValue(...candidates) {
  for (const candidate of candidates) {
    const value = s(candidate).toLowerCase();
    if (KNOWN_LANGS.has(value)) return value;
  }
  return "";
}

export function normalizeFieldConfidenceMap(value = {}) {
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

export function extractReviewMetadata(value = {}) {
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

export function normalizeIncomingSourceType(value = "") {
  const x = s(value).toLowerCase().replace(/[\s-]+/g, "_");

  if (x === "manual" || x === "note" || x === "text" || x === "voice") {
    return "manual";
  }

  if (x === "website" || x === "site" || x === "web") return "website";

  if (
    x === "google_maps" ||
    x === "googlemaps" ||
    x === "google_map" ||
    x === "maps" ||
    x === "gmaps"
  ) {
    return "google_maps";
  }

  if (x === "instagram" || x === "ig" || x === "insta") {
    return "instagram";
  }

  if (x === "facebook" || x === "fb" || x === "meta") {
    return "facebook";
  }

  if (x === "linkedin" || x === "li") {
    return "linkedin";
  }

  return "";
}

export function isImportableStudioSourceType(value = "") {
  return IMPORTABLE_STUDIO_SOURCE_TYPES.has(normalizeIncomingSourceType(value));
}

export function detectSourceTypeFromUrl(url = "") {
  const value = lower(url);
  if (!value) return "";

  if (
    value.includes("google.com/maps") ||
    value.includes("maps.app.goo.gl") ||
    value.includes("g.co/kgs") ||
    value.includes("goo.gl/maps")
  ) {
    return "google_maps";
  }

  if (value.includes("instagram.com") || /^@[a-z0-9._]{2,}$/i.test(s(url))) {
    return "instagram";
  }

  if (
    value.includes("facebook.com") ||
    value.includes("fb.com") ||
    value.includes("m.facebook.com")
  ) {
    return "facebook";
  }

  if (value.includes("linkedin.com")) {
    return "linkedin";
  }

  if (
    /^(https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?$/i.test(
      s(url)
    )
  ) {
    return "website";
  }

  return "";
}

function buildStudioSourceLabel(sourceType = "", sourceUrl = "") {
  const normalizedType =
    normalizeIncomingSourceType(sourceType) || detectSourceTypeFromUrl(sourceUrl);

  if (normalizedType === "google_maps") return "Google Maps";
  if (normalizedType === "instagram") return "Instagram";
  if (normalizedType === "facebook") return "Facebook";
  if (normalizedType === "linkedin") return "LinkedIn";
  if (normalizedType === "website") return "Website";
  if (normalizedType === "manual") return "Manual";
  return "Source";
}

function maybeNormalizeImportableUrl(sourceType = "", value = "") {
  const raw = s(value);
  if (!raw) return "";

  const normalizedType = normalizeIncomingSourceType(sourceType);

  if (normalizedType === "website" || normalizedType === "google_maps") {
    return safeNormalizeUrl(raw);
  }

  return raw;
}

function normalizeStudioSourceRecord(item = {}) {
  const x = obj(item);

  const rawType =
    normalizeIncomingSourceType(
      x.sourceType || x.source_type || x.type || x.key
    ) || detectSourceTypeFromUrl(x.url || x.sourceUrl || x.source_url || x.value);

  const rawValue = s(
    x.url ||
      x.sourceUrl ||
      x.source_url ||
      x.sourceValue ||
      x.source_value ||
      x.value ||
      x.websiteUrl ||
      x.website_url ||
      x.handle
  );

  const normalizedValue = maybeNormalizeImportableUrl(rawType, rawValue);

  const label =
    s(x.label) ||
    s(x.title) ||
    s(x.name) ||
    s(x.displayName) ||
    s(x.display_name) ||
    buildStudioSourceLabel(rawType, normalizedValue);

  const isPrimary =
    typeof x.isPrimary === "boolean"
      ? x.isPrimary
      : typeof x.primary === "boolean"
        ? x.primary
        : false;

  if (!rawType && !normalizedValue) return null;

  return {
    sourceType: rawType,
    url: normalizedValue,
    label,
    isPrimary,
  };
}

function normalizeSourceDraftMap(sourceDrafts = {}) {
  const drafts = obj(sourceDrafts);
  const out = [];

  for (const [key, raw] of Object.entries(drafts)) {
    const item = obj(raw);
    const value = s(item.value || item.url || item.sourceUrl || item.sourceValue);
    if (!value) continue;

    const normalizedType = normalizeIncomingSourceType(key);
    if (!normalizedType) continue;

    out.push({
      sourceType: normalizedType,
      url: maybeNormalizeImportableUrl(normalizedType, value),
      label: buildStudioSourceLabel(normalizedType, value),
      isPrimary: false,
    });
  }

  return out;
}

export function safeNormalizeUrl(input = "") {
  const raw = s(input);
  if (!raw) return "";

  if (/^@[a-z0-9._]{2,}$/i.test(raw)) return raw;
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;

  return `https://${raw.replace(/^\/+/, "")}`;
}

export function comparableHost(input = "") {
  const raw = s(input);
  if (!raw) return "";

  if (/^@[a-z0-9._]{2,}$/i.test(raw)) {
    return raw.toLowerCase().replace(/^@/, "");
  }

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

export function comparableUrl(input = "") {
  const raw = s(input);
  if (!raw) return "";

  if (/^@[a-z0-9._]{2,}$/i.test(raw)) {
    return raw.toLowerCase().replace(/^@/, "");
  }

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

export function sourceIdentityKey(sourceType = "", sourceUrl = "") {
  const normalizedType =
    normalizeIncomingSourceType(sourceType) || detectSourceTypeFromUrl(sourceUrl);

  if (!normalizedType && !s(sourceUrl)) return "";

  if (normalizedType === "website") {
    return `website|${comparableHost(sourceUrl)}`;
  }

  if (normalizedType === "instagram") {
    return `instagram|${comparableUrl(sourceUrl)}`;
  }

  if (normalizedType === "facebook") {
    return `facebook|${comparableUrl(sourceUrl)}`;
  }

  if (normalizedType === "linkedin") {
    return `linkedin|${comparableUrl(sourceUrl)}`;
  }

  return `${normalizedType || "unknown"}|${comparableUrl(sourceUrl)}`;
}

function dedupeStudioSources(items = []) {
  const out = [];
  const seen = new Set();

  for (const raw of arr(items)) {
    const item = normalizeStudioSourceRecord(raw);
    if (!item?.sourceType && !item?.url) continue;

    const key = sourceIdentityKey(item.sourceType, item.url);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    out.push(item);
  }

  return out;
}

function firstImportableSource(items = []) {
  return (
    arr(items).find(
      (item) =>
        isImportableStudioSourceType(item?.sourceType) && s(item?.url)
    ) || null
  );
}

function preferredPrimarySource({
  explicitPrimary = null,
  normalizedSources = [],
  fallbackSourceType = "",
  fallbackUrl = "",
} = {}) {
  const explicit = normalizeStudioSourceRecord(explicitPrimary);
  if (explicit?.sourceType || explicit?.url) {
    return {
      ...explicit,
      isPrimary: true,
    };
  }

  const fromList = arr(normalizedSources).find((item) => item.isPrimary);
  if (fromList) {
    return {
      ...fromList,
      isPrimary: true,
    };
  }

  const fallback = normalizeStudioSourceRecord({
    sourceType: fallbackSourceType,
    url: fallbackUrl,
    isPrimary: true,
  });

  if (fallback?.sourceType || fallback?.url) return fallback;
  return null;
}

export function normalizeScanRequest(input, discoveryForm = {}) {
  if (input && typeof input.preventDefault === "function") {
    input.preventDefault();
    return normalizeScanRequest(obj(discoveryForm), {});
  }

  const payload = obj(input);
  const discovery = obj(discoveryForm);

  const singularPayloadSource = normalizeStudioSourceRecord({
    sourceType: payload.sourceType || payload.type || discovery.sourceType,
    url:
      payload.url ||
      payload.sourceUrl ||
      payload.source_value ||
      payload.sourceValue ||
      payload.websiteUrl ||
      discovery.sourceValue ||
      discovery.websiteUrl,
    isPrimary: true,
  });

  const explicitSources = dedupeStudioSources([
    ...arr(payload.sources),
    ...arr(discovery.sources),
    ...normalizeSourceDraftMap(payload.sourceDrafts),
    ...normalizeSourceDraftMap(discovery.sourceDrafts),
    singularPayloadSource,
  ]);

  const fallbackUrl = s(
    payload.url ||
      payload.sourceUrl ||
      payload.source_value ||
      payload.sourceValue ||
      payload.websiteUrl ||
      discovery.sourceValue ||
      discovery.websiteUrl
  );

  const fallbackType =
    normalizeIncomingSourceType(
      payload.sourceType || payload.type || discovery.sourceType
    ) || detectSourceTypeFromUrl(fallbackUrl);

  const primarySource = preferredPrimarySource({
    explicitPrimary: payload.primarySource || discovery.primarySource,
    normalizedSources: explicitSources,
    fallbackSourceType: fallbackType,
    fallbackUrl,
  });

  const normalizedSources = dedupeStudioSources(
    primarySource
      ? [
          ...explicitSources.map((item) => ({
            ...item,
            isPrimary:
              sourceIdentityKey(item.sourceType, item.url) ===
              sourceIdentityKey(primarySource.sourceType, primarySource.url),
          })),
          primarySource,
        ]
      : explicitSources
  );

  const importablePrimary =
    (primarySource &&
    isImportableStudioSourceType(primarySource.sourceType) &&
    s(primarySource.url)
      ? {
          sourceType: primarySource.sourceType,
          url: primarySource.url,
        }
      : null) || firstImportableSource(normalizedSources);

  return {
    sourceType: s(importablePrimary?.sourceType),
    url: s(importablePrimary?.url),
    note: s(payload.note || discovery.note),
    sources: normalizedSources,
    primarySource: primarySource
      ? {
          sourceType: s(primarySource.sourceType),
          url: s(primarySource.url),
          label:
            s(primarySource.label) ||
            buildStudioSourceLabel(primarySource.sourceType, primarySource.url),
          isPrimary: true,
        }
      : null,
    requestedPrimarySourceType: s(primarySource?.sourceType),
    requestedPrimarySourceUrl: s(primarySource?.url),
    sourceCount: normalizedSources.length,
    hasImportableSource: !!(
      s(importablePrimary?.sourceType) && s(importablePrimary?.url)
    ),
    hasUnsupportedSources: normalizedSources.some(
      (item) =>
        !isImportableStudioSourceType(item?.sourceType) && s(item?.url)
    ),
  };
}

export function scanStartLabel(sourceType = "") {
  const x = normalizeIncomingSourceType(sourceType);

  if (x === "google_maps") return "Google Maps scan başladı...";
  if (x === "instagram") return "Instagram source hazırlandı...";
  if (x === "facebook") return "Facebook source hazırlandı...";
  if (x === "linkedin") return "LinkedIn source hazırlandı...";
  if (x === "manual") return "Business draft hazırlanır...";
  return "Website scan başladı...";
}

export function scanCompleteLabel(sourceType = "", candidateCount = 0) {
  const x = normalizeIncomingSourceType(sourceType);
  const count = Number(candidateCount || 0);

  if (count > 0) {
    return `${count} discovery hazırlandı.`;
  }

  if (x === "google_maps") return "Google Maps import tamamlandı.";
  if (x === "instagram") return "Instagram source hazırdır.";
  if (x === "facebook") return "Facebook source hazırdır.";
  if (x === "linkedin") return "LinkedIn source hazırdır.";
  if (x === "manual") return "Business draft generated.";

  return "Website import tamamlandı.";
}

export function applyUiHintsFromMeta({
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

export function normalizeReviewState(payload = {}) {
  const review = obj(payload?.review || payload);

  return {
    session: review?.session || null,
    draft: obj(review?.draft),
    sources: arr(review?.sources),
    events: arr(review?.events),
    bundleSources: firstArray(payload?.bundleSources, review?.bundleSources),
    contributionSummary: firstObject(
      payload?.contributionSummary,
      review?.contributionSummary
    ),
    fieldProvenance: firstObject(
      payload?.fieldProvenance,
      review?.fieldProvenance
    ),
    reviewDraftSummary: firstObject(
      payload?.reviewDraftSummary,
      review?.reviewDraftSummary
    ),
  };
}

export function firstNonEmpty(...values) {
  for (const value of values) {
    const x = s(value);
    if (x) return x;
  }
  return "";
}
