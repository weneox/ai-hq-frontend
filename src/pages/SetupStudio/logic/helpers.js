import {
  arr,
  obj,
  s,
  normalizeIncomingSourceType,
  detectSourceTypeFromUrl,
} from "../state/shared.js";
import { isWebsiteBarrierWarning } from "../state/profile.js";
import { UUID_RE } from "./constants.js";

export function lowerText(value = "") {
  return s(value).toLowerCase();
}

export function maybeUuid(value = "") {
  const x = s(value);
  return UUID_RE.test(x) ? x : "";
}

export function pickKnowledgeCandidateId(item = {}) {
  const x = obj(item);
  const candidate = obj(x.candidate);

  return (
    maybeUuid(x.candidateId) ||
    maybeUuid(x.candidate_id) ||
    maybeUuid(x.knowledgeCandidateId) ||
    maybeUuid(x.knowledge_candidate_id) ||
    maybeUuid(x.reviewCandidateId) ||
    maybeUuid(x.review_candidate_id) ||
    maybeUuid(x.candidateUuid) ||
    maybeUuid(x.candidate_uuid) ||
    maybeUuid(x.uuid) ||
    maybeUuid(candidate.id) ||
    maybeUuid(candidate.candidateId) ||
    maybeUuid(candidate.candidate_id) ||
    maybeUuid(x.id)
  );
}

export function pickKnowledgeRowId(item = {}, fallback = "") {
  const x = obj(item);

  return s(
    x.rowId ||
      x.row_id ||
      x.id ||
      x.key ||
      x.itemKey ||
      x.item_key ||
      x.title ||
      x.label ||
      fallback
  );
}

export function compactObject(input = {}) {
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

export function normalizeStudioSourceType(value = "", url = "") {
  const raw = s(value).toLowerCase();
  if (raw === "manual") return "manual";
  return normalizeIncomingSourceType(value) || detectSourceTypeFromUrl(url);
}

export function sourceLabelFor(type = "") {
  const x = s(type).toLowerCase();
  if (x === "manual") return "Manual";
  if (x === "google_maps" || x === "googlemaps") return "Google Maps";
  if (x === "instagram") return "Instagram";
  if (x === "linkedin") return "LinkedIn";
  if (x === "facebook") return "Facebook";
  return "Website";
}

export function splitManualList(text = "") {
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

export function parseFaqItemsFromText(text = "") {
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

export function normalizeRequestedSourceRows(items = []) {
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

export function pickRequestedPrimarySource(request = {}) {
  const explicit = obj(request.primarySource);

  const explicitType = normalizeStudioSourceType(
    explicit.sourceType || explicit.type,
    explicit.url ||
      explicit.sourceUrl ||
      explicit.source_value ||
      explicit.sourceValue
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

export function sourceSeedKey(item = {}) {
  return `${s(item.sourceType).toLowerCase()}|${s(item.url).toLowerCase()}`;
}

export function buildSourceSeedContext({
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
              normalizedPrimary.label ||
                sourceLabelFor(normalizedPrimary.sourceType)
            ),
            isPrimary: true,
          }
        : null,
    sources: out,
  };
}

export function buildSourceSeedLines({
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

export function buildAnalyzePayloadFromStudioState({
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

export function isBarrierLikeIdentityText(value = "", warnings = []) {
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

export function sanitizeUiIdentityText(value = "", warnings = []) {
  const text = s(value);
  if (!text) return "";
  if (isBarrierLikeIdentityText(text, warnings)) return "";
  return text;
}

export function buildSafeUiProfile({
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