import { arr, obj, s } from "../lib/setupStudioHelpers.js";

export const KNOWN_LANGS = new Set(["az", "en", "tr", "ru"]);

export function createEmptyReviewState() {
  return {
    session: null,
    draft: {},
    sources: [],
    events: [],
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

export function detectSourceTypeFromUrl(url = "") {
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

export function normalizeScanRequest(input, discoveryForm = {}) {
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

export function scanStartLabel(sourceType = "") {
  return sourceType === "google_maps"
    ? "Google Maps scan başladı..."
    : "Website scan başladı...";
}

export function scanCompleteLabel(sourceType = "", candidateCount = 0) {
  const count = Number(candidateCount || 0);

  if (count > 0) {
    return `${count} discovery hazırlandı.`;
  }

  return sourceType === "google_maps"
    ? "Google Maps import tamamlandı."
    : "Website import tamamlandı.";
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
  };
}

export function safeNormalizeUrl(input = "") {
  const raw = s(input);
  if (!raw) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

export function comparableHost(input = "") {
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

export function comparableUrl(input = "") {
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

export function sourceIdentityKey(sourceType = "", sourceUrl = "") {
  const normalizedType =
    normalizeIncomingSourceType(sourceType) || detectSourceTypeFromUrl(sourceUrl);

  if (!normalizedType && !s(sourceUrl)) return "";

  if (normalizedType === "website") {
    return `website|${comparableHost(sourceUrl)}`;
  }

  return `${normalizedType || "unknown"}|${comparableUrl(sourceUrl)}`;
}

export function firstNonEmpty(...values) {
  for (const value of values) {
    const x = s(value);
    if (x) return x;
  }
  return "";
}