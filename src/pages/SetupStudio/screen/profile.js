// FILE: src/pages/SetupStudio/screen/profile.js

import { arr, obj, s, resolveMainLanguageValue } from "./shared.js";

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

    const text = typeof raw === "string" ? s(raw) : raw;
    if (text === "") continue;

    out[key] = text;
  }

  return out;
}

function normalizeProfile(profile = {}) {
  const p = obj(profile);

  return {
    companyName: s(
      p.companyName ||
        p.displayName ||
        p.businessName ||
        p.name ||
        p.title
    ),
    description: s(
      p.description ||
        p.summaryShort ||
        p.summary ||
        p.companySummaryShort ||
        p.companySummaryLong ||
        p.summaryLong
    ),
    websiteUrl: s(
      p.websiteUrl ||
        p.website ||
        p.url ||
        p.siteUrl ||
        p.site_url
    ),
    primaryPhone: s(p.primaryPhone || p.primary_phone || arr(p.phones)[0]),
    primaryEmail: s(p.primaryEmail || p.primary_email || arr(p.emails)[0]),
    primaryAddress: s(
      p.primaryAddress || p.primary_address || arr(p.addresses)[0]
    ),
    timezone: s(p.timezone || p.timeZone),
    language: resolveMainLanguageValue(
      p.language,
      p.mainLanguage,
      p.primaryLanguage,
      arr(p.languages)[0],
      arr(p.supportedLanguages)[0],
      arr(p.supported_languages)[0]
    ),
    services: arr(p.services),
  };
}

export function isWebsiteBarrierWarning(value = "") {
  const text = s(value).toLowerCase();
  if (!text) return false;

  return /^(http_\d{3}|fetch_failed|non_html_response|robots_disallow_all_detected|sitemap_not_found_or_unreadable|partial_website_extraction)$/.test(
    text
  ) || /(timeout|timed out|fetch failed|http_403|http_404|http_429|http_500|non html|non-html|robots|sitemap)/i.test(text);
}

export function hasMeaningfulProfile(profile = {}) {
  const p = normalizeProfile(profile);

  return !!(
    p.companyName ||
    p.description ||
    p.websiteUrl ||
    p.primaryPhone ||
    p.primaryEmail ||
    p.primaryAddress ||
    p.timezone ||
    p.language ||
    p.services.length
  );
}

export function hasExtractedIdentityProfile(profile = {}) {
  const p = normalizeProfile(profile);

  return !!(
    p.companyName ||
    p.description ||
    p.primaryPhone ||
    p.primaryEmail ||
    p.primaryAddress
  );
}

export function formFromProfile(profile = {}, fallback = {}) {
  const base = obj(fallback);
  const p = normalizeProfile(profile);

  return {
    companyName: p.companyName || s(base.companyName),
    description: p.description || s(base.description),
    timezone: p.timezone || s(base.timezone || "Asia/Baku"),
    language: p.language || s(base.language || "az"),
    websiteUrl: p.websiteUrl || s(base.websiteUrl),
    primaryPhone: p.primaryPhone || s(base.primaryPhone),
    primaryEmail: p.primaryEmail || s(base.primaryEmail),
    primaryAddress: p.primaryAddress || s(base.primaryAddress),
  };
}

export function chooseBestProfileForForm(...candidates) {
  for (const candidate of candidates) {
    const normalized = normalizeProfile(candidate);
    if (hasMeaningfulProfile(normalized)) {
      return normalized;
    }
  }

  return normalizeProfile(candidates[0] || {});
}

export function hydrateBusinessFormFromProfile(
  current = {},
  profile = {},
  { force = false } = {}
) {
  const prev = obj(current);
  const p = normalizeProfile(profile);

  const next = { ...prev };

  const fields = [
    "companyName",
    "description",
    "timezone",
    "language",
    "websiteUrl",
    "primaryPhone",
    "primaryEmail",
    "primaryAddress",
  ];

  for (const key of fields) {
    const value = s(p[key]);
    if (!value) continue;

    if (force || !s(prev[key])) {
      next[key] = value;
    }
  }

  return next;
}

export function shouldPreferCandidateCompanyName(
  businessName = "",
  reviewName = ""
) {
  const a = s(businessName);
  const b = s(reviewName);

  if (!b) return false;
  if (!a) return true;

  const generic = /^(business|company|brand|website|instagram|facebook|linkedin)$/i;
  if (generic.test(a) && !generic.test(b)) return true;

  return false;
}

export function deriveSuggestedServicePayload({
  discoveryForm = {},
  discoveryState = {},
  knowledgeCandidates = [],
} = {}) {
  const firstKnowledge = arr(knowledgeCandidates).find(
    (item) => s(item.title) || s(item.valueText || item.value)
  );

  const title = s(
    firstKnowledge?.title ||
      obj(discoveryState.profile).companyName ||
      "Primary service"
  );

  const description = s(
    firstKnowledge?.valueText ||
      firstKnowledge?.value ||
      obj(discoveryState.profile).description ||
      discoveryForm.note ||
      "Imported from setup studio draft."
  );

  return compactObject({
    title,
    description,
  });
}

export function isBarrierOnlyImportResult(importResult = {}, sourceType = "") {
  const warnings = arr(importResult?.warnings);
  const barrierWarnings = warnings.filter((item) => isWebsiteBarrierWarning(item));
  const profile = normalizeProfile(importResult?.profile || {});
  const candidateCount = Number(importResult?.candidateCount || 0);
  const snapshot = obj(importResult?.snapshot);

  if (sourceType !== "website") return false;

  return !!(
    barrierWarnings.length &&
    !hasMeaningfulProfile(profile) &&
    candidateCount <= 0 &&
    Object.keys(snapshot).length === 0
  );
}

export function buildBusinessProfilePatch({
  businessForm = {},
  currentReview = {},
  discoveryState = {},
} = {}) {
  const form = obj(businessForm);
  const draft = obj(currentReview?.draft?.businessProfile);
  const profile = obj(discoveryState?.profile);

  return compactObject({
    companyName: s(form.companyName || draft.companyName || profile.companyName),
    description: s(form.description || draft.description || profile.description),
    websiteUrl: s(form.websiteUrl || draft.websiteUrl || profile.websiteUrl),
    primaryPhone: s(
      form.primaryPhone || draft.primaryPhone || profile.primaryPhone
    ),
    primaryEmail: s(
      form.primaryEmail || draft.primaryEmail || profile.primaryEmail
    ),
    primaryAddress: s(
      form.primaryAddress || draft.primaryAddress || profile.primaryAddress
    ),
    timezone: s(form.timezone || draft.timezone || profile.timezone),
    language: s(
      form.language ||
        draft.language ||
        profile.language ||
        resolveMainLanguageValue(
          discoveryState?.mainLanguage,
          discoveryState?.primaryLanguage
        )
    ),
  });
}

export function buildCapabilitiesPatch({
  currentReview = {},
  businessForm = {},
} = {}) {
  const capabilities = obj(currentReview?.draft?.capabilities);

  return compactObject({
    ...capabilities,
    timezone: s(businessForm?.timezone || capabilities.timezone),
    mainLanguage: resolveMainLanguageValue(
      businessForm?.language,
      capabilities.mainLanguage,
      capabilities.primaryLanguage
    ),
    primaryLanguage: resolveMainLanguageValue(
      businessForm?.language,
      capabilities.primaryLanguage,
      capabilities.mainLanguage
    ),
  });
}