import {
  arr,
  obj,
  s,
  candidateTitle,
  candidateCategory,
  candidateValue,
} from "../lib/setupStudioHelpers.js";
import {
  resolveMainLanguageValue,
  normalizeIncomingSourceType,
} from "./shared.js";

export function deriveSuggestedServicePayload({
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

export function formFromProfile(profile = {}, prev = {}) {
  const x = obj(profile);
  const rawCompanyName = s(
    x.companyName ||
      x.company_name ||
      x.displayName ||
      x.display_name ||
      x.name
  );
  const safeCompanyName = isPlaceholderBusinessName(rawCompanyName)
    ? ""
    : rawCompanyName;
  const resolvedLanguage =
    resolveMainLanguageValue(
      x.mainLanguage,
      x.main_language,
      x.primaryLanguage,
      x.primary_language,
      x.language,
      x.sourceLanguage,
      x.source_language
    ) || s(prev.language || "az");

  return {
    ...prev,
    companyName: s(
      safeCompanyName || (!rawCompanyName ? prev.companyName : "")
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
    primaryAddress: s(
      x.primaryAddress || x.primary_address || prev.primaryAddress
    ),
  };
}

export function hasExtractedIdentityProfile(profile = {}) {
  const x = obj(profile);
  const extractedName = extractProfileName(x);

  return !!(
    extractedName ||
    s(
      x.summaryShort ||
        x.summary_short ||
        x.summaryLong ||
        x.summary_long ||
        x.description
    ) ||
    s(x.primaryPhone || x.primary_phone || x.phone) ||
    s(x.primaryEmail || x.primary_email || x.email) ||
    s(x.primaryAddress || x.primary_address || x.address) ||
    arr(x.services).length > 0 ||
    arr(x.socialLinks || x.social_links).length > 0 ||
    arr(x.faqItems || x.faq_items).length > 0 ||
    arr(x.pricingHints || x.pricing_hints).length > 0
  );
}

export function isWebsiteBarrierWarning(value = "") {
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

export function isBarrierOnlyImportResult(result = {}, sourceType = "") {
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

export function safeDraftKey(value = "", fallback = "item") {
  return (
    s(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80) || fallback
  );
}

export function extractProfileName(profile = {}) {
  const x = obj(profile);
  const name = s(
    x.companyName ||
      x.company_name ||
      x.displayName ||
      x.display_name ||
      x.name
  );
  return isPlaceholderBusinessName(name) ? "" : name;
}

export function hasMeaningfulProfile(profile = {}) {
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

export function isPlaceholderBusinessName(value = "") {
  const x = s(value).toLowerCase();

  if (!x) return true;

  return ["google maps", "maps", "website", "source", "business", "company"].includes(
    x
  );
}

export function shouldPreferCandidateCompanyName(
  currentValue = "",
  nextValue = ""
) {
  const current = s(currentValue);
  const next = s(nextValue);

  if (!next) return false;
  if (!current) return true;
  if (isPlaceholderBusinessName(current) && !isPlaceholderBusinessName(next)) {
    return true;
  }
  return false;
}

export function hydrateBusinessFormFromProfile(
  prev = {},
  profile = {},
  { force = false } = {}
) {
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

export function chooseBestProfileForForm(...profiles) {
  for (const profile of profiles) {
    if (hasMeaningfulProfile(profile)) return obj(profile);
  }
  return {};
}

export function buildBusinessProfilePatch({
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

export function buildCapabilitiesPatch({
  currentReview = {},
  businessForm = {},
}) {
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
