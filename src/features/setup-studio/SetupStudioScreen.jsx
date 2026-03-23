import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAppBootstrap } from "../../api/app.js";
import {
  importSourceForSetup,
  analyzeSetupIntake,
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
  profilePatchFromDiscovery,
  profilePreviewRows,
  discoveryModeLabel,
  deriveStudioProgress,
} from "./lib/setupStudioHelpers.js";

import {
  createEmptyReviewState,
  createEmptyLegacyDraft,
  createIdleDiscoveryState,
  createEmptySourceScope,
  pickSetupProfile,
  normalizeBootMeta,
  resolveMainLanguageValue,
  normalizeIncomingSourceType,
  detectSourceTypeFromUrl,
  normalizeScanRequest,
  scanStartLabel,
  scanCompleteLabel,
  applyUiHintsFromMeta,
  normalizeReviewState,
} from "./screen/shared.js";

import {
  deriveSuggestedServicePayload,
  formFromProfile,
  hasExtractedIdentityProfile,
  isWebsiteBarrierWarning,
  isBarrierOnlyImportResult,
  buildBusinessProfilePatch,
  buildCapabilitiesPatch,
  hasMeaningfulProfile,
  shouldPreferCandidateCompanyName,
  hydrateBusinessFormFromProfile,
  chooseBestProfileForForm,
} from "./screen/profile.js";

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
} from "./screen/reviewState.js";

const DEFAULT_BUSINESS_FORM = {
  companyName: "",
  description: "",
  timezone: "Asia/Baku",
  language: "az",
  websiteUrl: "",
  primaryPhone: "",
  primaryEmail: "",
  primaryAddress: "",
};

const DEFAULT_MANUAL_SECTIONS = {
  servicesText: "",
  faqsText: "",
  policiesText: "",
};

const DEFAULT_DISCOVERY_FORM = {
  websiteUrl: "",
  note: "",
};

function lowerText(value = "") {
  return s(value).toLowerCase();
}

function compactObject(input = {}) {
  const out = {};

  for (const [key, raw] of Object.entries(obj(input))) {
    if (raw == null) continue;

    if (Array.isArray(raw)) {
      if (raw.length) out[key] = raw;
      continue;
    }

    if (raw && typeof raw === "object") {
      const nested = compactObject(raw);
      if (Object.keys(nested).length) out[key] = nested;
      continue;
    }

    if (typeof raw === "string") {
      const text = s(raw);
      if (text) out[key] = text;
      continue;
    }

    out[key] = raw;
  }

  return out;
}

function normalizeStudioSourceType(value = "", url = "") {
  const raw = s(value).toLowerCase();
  if (raw === "manual") return "manual";
  return normalizeIncomingSourceType(value) || detectSourceTypeFromUrl(url);
}

function sourceLabelFor(type = "") {
  const x = s(type).toLowerCase();
  if (x === "manual") return "Manual";
  if (x === "google_maps" || x === "googlemaps") return "Google Maps";
  if (x === "instagram") return "Instagram";
  if (x === "linkedin") return "LinkedIn";
  if (x === "facebook") return "Facebook";
  return "Website";
}

function splitManualList(text = "") {
  return [
    ...new Set(
      s(text)
        .split(/\n+|[|•·▪●]+|;/g)
        .flatMap((part) => {
          const value = s(part);
          if (!value) return [];

          if (
            value.includes(",") &&
            value.split(",").length >= 2 &&
            value.length <= 220 &&
            !/[.!?]/.test(value)
          ) {
            return value
              .split(",")
              .map((x) => s(x))
              .filter(Boolean);
          }

          return [value];
        })
        .map((item) => s(item))
        .filter(Boolean)
    ),
  ];
}

function parseFaqItemsFromText(text = "") {
  const raw = s(text);
  if (!raw) return [];

  const blocks = raw
    .split(/\n{2,}/)
    .map((item) => s(item))
    .filter(Boolean);

  const out = [];

  for (const block of blocks) {
    const lines = block
      .split(/\n+/)
      .map((line) => s(line))
      .filter(Boolean);

    if (!lines.length) continue;

    let question = "";
    let answer = "";

    for (const line of lines) {
      if (/^(q|question)\s*[:—–-]\s*/i.test(line)) {
        question = s(line.replace(/^(q|question)\s*[:—–-]\s*/i, ""));
        continue;
      }

      if (/^(a|answer)\s*[:—–-]\s*/i.test(line)) {
        answer = s(line.replace(/^(a|answer)\s*[:—–-]\s*/i, ""));
        continue;
      }

      if (!question) {
        question = line;
      } else if (!answer) {
        answer = line;
      } else {
        answer = `${answer} ${line}`.trim();
      }
    }

    if (question) {
      out.push({
        question,
        answer,
      });
    }
  }

  if (out.length) return out;

  return raw
    .split(/\n+/)
    .map((line) => s(line))
    .filter(Boolean)
    .map((question) => ({ question, answer: "" }));
}

function normalizeRequestedSourceRows(items = []) {
  return arr(items)
    .map((item) => {
      const x = obj(item);

      const sourceType = normalizeStudioSourceType(
        x.sourceType || x.source_type || x.type || x.key,
        x.url || x.sourceUrl || x.source_url || x.sourceValue || x.value
      );

      const url = s(
        x.url ||
          x.sourceUrl ||
          x.source_url ||
          x.sourceValue ||
          x.source_value ||
          x.value ||
          x.handle
      );

      if (!sourceType && !url) return null;

      return {
        sourceType,
        url,
        label: s(x.label || x.title || x.name || sourceLabelFor(sourceType)),
        isPrimary:
          typeof x.isPrimary === "boolean"
            ? x.isPrimary
            : typeof x.primary === "boolean"
              ? x.primary
              : false,
      };
    })
    .filter(Boolean);
}

function pickRequestedPrimarySource(request = {}) {
  const explicit = obj(request.primarySource);

  const explicitType = normalizeStudioSourceType(
    explicit.sourceType || explicit.type,
    explicit.url || explicit.sourceUrl || explicit.source_value || explicit.sourceValue
  );

  const explicitUrl = s(
    explicit.url ||
      explicit.sourceUrl ||
      explicit.source_value ||
      explicit.sourceValue ||
      explicit.value
  );

  if (explicitType || explicitUrl) {
    return {
      sourceType: explicitType,
      url: explicitUrl,
      label: s(explicit.label || sourceLabelFor(explicitType)),
      isPrimary: true,
    };
  }

  const requested = normalizeRequestedSourceRows(request.sources);
  const markedPrimary = requested.find((item) => item.isPrimary);
  if (markedPrimary) return { ...markedPrimary, isPrimary: true };

  return requested[0] ? { ...requested[0], isPrimary: true } : null;
}

function sourceSeedKey(item = {}) {
  return `${s(item.sourceType).toLowerCase()}|${s(item.url).toLowerCase()}`;
}

function buildSourceSeedContext({
  requestedSources = [],
  primarySource = null,
} = {}) {
  const normalizedSources = normalizeRequestedSourceRows(requestedSources);
  const normalizedPrimary = primarySource
    ? pickRequestedPrimarySource({
        sources: normalizedSources,
        primarySource,
      })
    : pickRequestedPrimarySource({
        sources: normalizedSources,
      });

  const out = [];
  const seen = new Set();

  for (const item of [
    ...(normalizedPrimary ? [{ ...normalizedPrimary, isPrimary: true }] : []),
    ...normalizedSources,
  ]) {
    const key = sourceSeedKey(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      sourceType: s(item.sourceType),
      url: s(item.url),
      label: s(item.label || sourceLabelFor(item.sourceType)),
      isPrimary:
        normalizedPrimary && key === sourceSeedKey(normalizedPrimary),
    });
  }

  return {
    primarySource:
      normalizedPrimary && s(normalizedPrimary.sourceType)
        ? {
            sourceType: s(normalizedPrimary.sourceType),
            url: s(normalizedPrimary.url),
            label: s(
              normalizedPrimary.label || sourceLabelFor(normalizedPrimary.sourceType)
            ),
            isPrimary: true,
          }
        : null,
    sources: out,
  };
}

function buildSourceSeedLines({
  requestedSources = [],
  primarySource = null,
} = {}) {
  const sourceContext = buildSourceSeedContext({
    requestedSources,
    primarySource,
  });

  const primary = obj(sourceContext.primarySource);
  const primaryLine =
    s(primary.sourceType) && s(primary.url)
      ? `Primary source seed: ${sourceLabelFor(primary.sourceType)} — ${primary.url}`
      : "";

  const others = arr(sourceContext.sources)
    .filter((item) => !item.isPrimary)
    .map((item) => `${sourceLabelFor(item.sourceType)} — ${item.url}`);

  const additionalLine = others.length
    ? `Additional source seeds: ${others.join(" | ")}`
    : "";

  return {
    primarySource: sourceContext.primarySource,
    sources: sourceContext.sources,
    lines: [primaryLine, additionalLine].filter(Boolean),
  };
}

function buildAnalyzePayloadFromStudioState({
  businessForm = {},
  manualSections = {},
  discoveryForm = {},
  fallbackSourceUrl = "",
  scanRequest = {},
} = {}) {
  const sourceSeedContext = buildSourceSeedLines({
    requestedSources: arr(scanRequest.sources),
    primarySource: scanRequest.primarySource,
  });

  const requestedWebsiteSeed = arr(sourceSeedContext.sources).find(
    (item) => s(item.sourceType) === "website" && s(item.url)
  );

  const companyName = s(businessForm.companyName);
  const description = s(businessForm.description);
  const websiteUrl = s(
    businessForm.websiteUrl ||
      discoveryForm.websiteUrl ||
      fallbackSourceUrl ||
      requestedWebsiteSeed?.url
  );
  const primaryPhone = s(businessForm.primaryPhone);
  const primaryEmail = s(businessForm.primaryEmail);
  const primaryAddress = s(businessForm.primaryAddress);
  const language = s(businessForm.language);
  const timezone = s(businessForm.timezone);

  const services = splitManualList(manualSections.servicesText);
  const faqItems = parseFaqItemsFromText(manualSections.faqsText);
  const policiesText = s(manualSections.policiesText);

  const manualLines = [
    companyName ? `Business name: ${companyName}` : "",
    description ? `Description: ${description}` : "",
    websiteUrl ? `Website: ${websiteUrl}` : "",
    primaryPhone ? `Phone: ${primaryPhone}` : "",
    primaryEmail ? `Email: ${primaryEmail}` : "",
    primaryAddress ? `Address: ${primaryAddress}` : "",
    language ? `Language: ${language}` : "",
    timezone ? `Timezone: ${timezone}` : "",
    services.length ? `Services: ${services.join(" | ")}` : "",
    policiesText ? `Policies: ${policiesText}` : "",
    ...arr(sourceSeedContext.lines),
  ]
    .filter(Boolean)
    .join("\n");

  const answers = compactObject({
    companyName,
    description,
    website: websiteUrl,
    phone: primaryPhone,
    email: primaryEmail,
    address: primaryAddress,
    language,
    timezone,
    services,
    faqItems,
    primarySourceSeed: sourceSeedContext.primarySource
      ? compactObject({
          sourceType: s(sourceSeedContext.primarySource.sourceType),
          url: s(sourceSeedContext.primarySource.url),
          label: s(sourceSeedContext.primarySource.label),
        })
      : undefined,
    sourceSeeds: arr(sourceSeedContext.sources).map((item) =>
      compactObject({
        sourceType: s(item.sourceType),
        url: s(item.url),
        label: s(item.label),
        isPrimary: !!item.isPrimary,
      })
    ),
    sourceTypes: [
      ...new Set(
        arr(sourceSeedContext.sources)
          .map((item) => s(item.sourceType))
          .filter(Boolean)
      ),
    ],
    sourceCount: arr(sourceSeedContext.sources).length,
  });

  const hasAnyInput = !!(
    companyName ||
    description ||
    websiteUrl ||
    primaryPhone ||
    primaryEmail ||
    primaryAddress ||
    language ||
    timezone ||
    services.length ||
    faqItems.length ||
    policiesText ||
    s(discoveryForm.note) ||
    arr(sourceSeedContext.sources).length
  );

  return {
    manualText: manualLines,
    voiceTranscript: "",
    answers,
    note: s(discoveryForm.note),
    hasAnyInput,
  };
}

function isBarrierLikeIdentityText(value = "", warnings = []) {
  const text = s(value);
  if (!text) return false;

  const normalized = lowerText(text);

  if (arr(warnings).some((item) => lowerText(item) === normalized)) {
    return true;
  }

  if (isWebsiteBarrierWarning(text)) {
    return true;
  }

  if (
    /^(website|google_maps|googlemaps|source)_(extract|fetch|entry|page|crawl|robots|sitemap|sync)_(timeout|failed|error)(?:_\d+ms)?$/i.test(
      text
    )
  ) {
    return true;
  }

  if (
    /^(http_\d{3}|fetch_failed|non_html_response|robots_disallow_all_detected|sitemap_not_found_or_unreadable|partial_website_extraction)$/i.test(
      text
    )
  ) {
    return true;
  }

  return false;
}

function sanitizeUiIdentityText(value = "", warnings = []) {
  const text = s(value);
  if (!text) return "";
  if (isBarrierLikeIdentityText(text, warnings)) return "";
  return text;
}

function buildSafeUiProfile({
  rawProfile = {},
  sourceType = "",
  sourceUrl = "",
  warnings = [],
  mainLanguage = "",
  primaryLanguage = "",
  reviewRequired = false,
  reviewFlags = [],
  fieldConfidence = {},
  barrierOnly = false,
} = {}) {
  const profile = obj(rawProfile);

  const safeWebsiteUrl = s(
    profile.websiteUrl ||
      profile.website ||
      (sourceType === "website" ? sourceUrl : "")
  );

  const safeName = barrierOnly
    ? ""
    : sanitizeUiIdentityText(
        profile.companyName ||
          profile.displayName ||
          profile.companyTitle ||
          profile.name,
        warnings
      );

  const safeDisplayName = barrierOnly
    ? ""
    : sanitizeUiIdentityText(profile.displayName || safeName, warnings);

  const safeCompanyTitle = barrierOnly
    ? ""
    : sanitizeUiIdentityText(profile.companyTitle || safeName, warnings);

  const safeSummaryShort = sanitizeUiIdentityText(
    profile.companySummaryShort ||
      profile.summaryShort ||
      profile.shortDescription,
    warnings
  );

  const safeSummaryLong = sanitizeUiIdentityText(
    profile.companySummaryLong ||
      profile.summaryLong ||
      profile.description ||
      safeSummaryShort,
    warnings
  );

  const safeMainLanguage =
    s(
      mainLanguage ||
        profile.mainLanguage ||
        profile.primaryLanguage ||
        profile.language
    ) || "";

  const safePrimaryLanguage =
    s(
      primaryLanguage ||
        profile.primaryLanguage ||
        profile.mainLanguage ||
        profile.language
    ) || safeMainLanguage;

  return {
    ...profile,
    companyName: safeName,
    displayName: safeDisplayName,
    companyTitle: safeCompanyTitle,
    name: safeName,
    companySummaryShort: safeSummaryShort,
    summaryShort: safeSummaryShort,
    companySummaryLong: safeSummaryLong,
    summaryLong: safeSummaryLong,
    description: safeSummaryLong || safeSummaryShort,
    websiteUrl: safeWebsiteUrl,
    website: safeWebsiteUrl,
    mainLanguage: safeMainLanguage,
    primaryLanguage: safePrimaryLanguage,
    language: safeMainLanguage || s(profile.language),
    reviewRequired: !!reviewRequired,
    reviewFlags: arr(reviewFlags),
    fieldConfidence: obj(fieldConfidence),
  };
}

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

  const [businessForm, setBusinessForm] = useState(DEFAULT_BUSINESS_FORM);
  const [manualSections, setManualSections] = useState(DEFAULT_MANUAL_SECTIONS);
  const [discoveryForm, setDiscoveryForm] = useState(DEFAULT_DISCOVERY_FORM);

  const [currentReview, setCurrentReview] = useState(createEmptyReviewState);
  const [reviewDraft, setReviewDraft] = useState(createEmptyLegacyDraft);
  const [discoveryState, setDiscoveryState] = useState(createIdleDiscoveryState);
  const [activeSourceScope, setActiveSourceScope] = useState(
    createEmptySourceScope
  );

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

    setManualSections(DEFAULT_MANUAL_SECTIONS);
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
        return preserveBusinessForm ? prev : formFromProfile(legacy.overview, prev);
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

      setCurrentReview(normalized);
      setReviewDraft(legacy);

      if (!shouldApplyIntoActiveStudio) {
        return {
          currentReview: normalized,
          reviewDraft: legacy,
        };
      }

      if (activateReviewSession) {
        setFreshEntryMode(false);
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

      setCurrentReview(reviewState);
      setReviewDraft(legacyDraft);

      if (!shouldApplyIntoActiveStudio) {
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

      const reviewInfo = resolveReviewSourceInfo(reviewState, legacyDraft);

      if (s(reviewInfo.sourceUrl) || lowerText(reviewInfo.sourceType) === "manual") {
        updateActiveSourceScope(reviewInfo.sourceType, reviewInfo.sourceUrl);
      }

      const baseProfile = chooseBestProfileForForm(
        legacyDraft?.overview,
        profile
      );

      setBusinessForm((prev) => {
        if (!preserveBusinessForm) {
          return hydrateBusinessFormFromProfile(
            formFromProfile(profile, {
              ...DEFAULT_BUSINESS_FORM,
              timezone: s(profile?.timezone || "Asia/Baku"),
              language:
                resolveMainLanguageValue(
                  profile?.mainLanguage,
                  profile?.primaryLanguage,
                  profile?.language,
                  firstLanguage(profile)
                ) || "az",
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
      request.requestedPrimarySourceType ||
        requestedPrimarySource?.sourceType
    );
    const requestedPrimarySourceUrl = s(
      request.requestedPrimarySourceUrl ||
        requestedPrimarySource?.url
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

    if (!hasImportableSource && !analyzePayload.hasAnyInput && !hasRequestedSources) {
      setError("Source, manual məlumat və ya biznes təsviri daxil edilməlidir.");
      return;
    }

    const uiSourceType = hasImportableSource
      ? requestedPrimarySourceType || sourceType
      : "manual";

    const displaySourceType =
      requestedPrimarySourceType ||
      (hasImportableSource ? sourceType : "manual");

    const displaySourceUrl =
      requestedPrimarySourceUrl ||
      sourceUrl;

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
            ? `${sourceLabelFor(displaySourceType)} source context əlavə edildi...`
            : "Business draft hazırlanır...",
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

      if (hasImportableSource) {
        importResult = await importSourceForSetup({
          sourceType,
          url: sourceUrl,
          sourceUrl,
          note: request.note,
          businessNote: request.note,
          sources: requestedSources,
          primarySource: requestedPrimarySource,
        });
      }

      const analyzeResult = await analyzeSetupIntake(analyzePayload);

      const importedReview = normalizeReviewState(
        analyzeResult?.review || importResult?.review || {}
      );
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
          ? ["Seçilən source-lar draft context kimi saxlanıldı."]
          : []),
        ...(hasImportableSource && request?.hasUnsupportedSources
          ? ["Bəzi əlavə source-lar draft context kimi saxlanıldı."]
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

      if (analyzeResult?.review) {
        applyReviewState(analyzeResult.review, {
          preserveBusinessForm: true,
          fallbackProfile: bestIncomingProfile,
        });
      } else {
        setCurrentReview(createEmptyReviewState());
        setReviewDraft(createEmptyLegacyDraft());
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
        !barrierOnlyResult ? importedReview : createEmptyReviewState();

      const scopedImportedDraft =
        !barrierOnlyResult ? legacyImportedDraft : createEmptyLegacyDraft();

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
          sourceCount: Number(request?.sourceCount || requestedSources.length || 0),
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
          sourceCount: Number(request?.sourceCount || requestedSources.length || 0),
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
          (
            !!analyzeResult?.shouldReview ||
            Number(analyzeResult?.candidateCount || 0) > 0 ||
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
      const message = String(
        e2?.message || e2 || "Business draft analiz edilə bilmədi."
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
      onContinueFlow={() => onScanBusiness(discoveryForm)}
      onSaveBusiness={onSaveBusiness}
      onApproveKnowledge={onApproveKnowledge}
      onRejectKnowledge={onRejectKnowledge}
      onCreateSuggestedService={onCreateSuggestedService}
      onOpenWorkspace={onOpenWorkspace}
      onReloadReviewDraft={() =>
        loadCurrentReview({
          preserveBusinessForm: true,
          activateReviewSession: true,
          activeSourceType: activeSourceScope.sourceType,
          activeSourceUrl: activeSourceScope.sourceUrl,
        })
      }
      onRefresh={() =>
        loadData({
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