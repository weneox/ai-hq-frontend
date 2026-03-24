// FILE: src/pages/SetupStudio/screen/reviewState.js

import {
  arr,
  obj,
  s,
  normalizeIncomingSourceType,
  detectSourceTypeFromUrl,
  normalizeReviewState,
} from "./shared.js";

function normalizeSourceRecord(item = {}) {
  const x = obj(item);

  const sourceUrl = s(
    x.sourceUrl ||
      x.source_url ||
      x.url ||
      x.value
  );

  const sourceType =
    normalizeIncomingSourceType(
      x.sourceType || x.source_type || x.type || x.key
    ) || detectSourceTypeFromUrl(sourceUrl);

  return {
    id: s(x.id || x.sourceId || x.source_id),
    sourceType,
    sourceUrl,
    label: s(x.label || x.title || x.name || sourceType),
    status: s(x.status || x.syncStatus || x.sync_status),
  };
}

function normalizeServiceItem(item = {}) {
  const x = obj(item);

  return {
    id: s(x.id || x.key || x.title || x.name),
    title: s(x.title || x.name || x.label),
    description: s(x.description || x.summary || x.value),
    status: s(x.status || "pending"),
    sourceType: s(x.sourceType || x.source_type),
  };
}

function normalizeKnowledgeItem(item = {}) {
  const x = obj(item);
  const valueText = s(
    x.valueText ||
      x.value_text ||
      x.value ||
      x.description ||
      x.summary
  );

  return {
    ...x,
    id: s(x.id || x.key || x.title || x.name || valueText),
    title: s(x.title || x.name || x.label || x.question || x.key),
    valueText,
    value: valueText,
    category: s(x.category || x.group || "general"),
    status: s(x.status || "pending"),
    sourceType: s(x.sourceType || x.source_type),
    source: s(x.source || x.sourceLabel || x.source_label),
    candidateId: s(
      x.candidateId ||
        x.candidate_id ||
        obj(x.candidate).id
    ),
    evidenceUrl: s(x.evidenceUrl || x.evidence_url),
  };
}

function toLine(title = "", description = "") {
  const a = s(title);
  const b = s(description);

  if (a && b) return `${a} | ${b}`;
  return a || b;
}

function splitManualLines(text = "") {
  return s(text)
    .split(/\n+/)
    .map((line) => s(line))
    .filter(Boolean);
}

export function resolveReviewSourceInfo(reviewPayload = {}, legacyDraft = {}) {
  const review = normalizeReviewState(reviewPayload);
  const draft = obj(review.draft);
  const firstSource = normalizeSourceRecord(arr(review.sources)[0]);

  const sourceUrl = s(
    firstSource.sourceUrl ||
      draft.sourceUrl ||
      draft.source_url ||
      obj(legacyDraft).sourceUrl
  );

  const sourceType =
    normalizeIncomingSourceType(
      firstSource.sourceType ||
        draft.sourceType ||
        draft.source_type ||
        obj(legacyDraft).sourceType
    ) || detectSourceTypeFromUrl(sourceUrl);

  return {
    sourceType,
    sourceUrl,
    sourceLabel: s(
      firstSource.label ||
        draft.sourceLabel ||
        draft.source_label ||
        obj(legacyDraft).sourceLabel
    ),
  };
}

export function mapCurrentReviewToLegacyDraft(reviewPayload = {}) {
  const review = normalizeReviewState(reviewPayload);
  const draft = obj(review.draft);
  const profile = obj(
    draft.businessProfile ||
      draft.business_profile ||
      draft.profile ||
      draft.overview
  );

  const services = arr(draft.services).map(normalizeServiceItem);
  const knowledgeItems = arr(draft.knowledgeItems).map(normalizeKnowledgeItem);
  const sourceInfo = resolveReviewSourceInfo(review);

  return {
    overview: profile,
    quickSummary: s(
      draft.quickSummary ||
        draft.quick_summary ||
        profile.summaryShort ||
        profile.companySummaryShort ||
        profile.description
    ),
    sourceType: s(sourceInfo.sourceType),
    sourceLabel: s(sourceInfo.sourceLabel),
    sourceUrl: s(sourceInfo.sourceUrl),
    warnings: arr(draft.warnings),
    reviewFlags: arr(draft.reviewFlags || draft.review_flags),
    fieldConfidence: obj(draft.fieldConfidence || draft.field_confidence),
    sections: {
      services,
    },
    reviewQueue: knowledgeItems,
    stats: {
      knowledgeCount: knowledgeItems.length,
    },
    reviewRequired: !!(
      draft.reviewRequired ??
      draft.review_required ??
      false
    ),
    sourceId: s(draft.sourceId || draft.source_id),
    sourceRunId: s(draft.sourceRunId || draft.source_run_id),
    snapshotId: s(draft.snapshotId || draft.snapshot_id),
    mainLanguage: s(draft.mainLanguage || draft.main_language),
    primaryLanguage: s(draft.primaryLanguage || draft.primary_language),
  };
}

export function buildManualSectionsFromReview(reviewPayload = {}) {
  const legacy = mapCurrentReviewToLegacyDraft(reviewPayload);
  const services = arr(legacy.sections?.services);

  const faqItems = arr(legacy.reviewQueue).filter(
    (item) => s(item.category).toLowerCase() === "faq"
  );

  const policyItems = arr(legacy.reviewQueue).filter((item) =>
    ["policy", "pricing_policy", "legal"].includes(
      s(item.category).toLowerCase()
    )
  );

  return {
    servicesText: services
      .map((item) => toLine(item.title, item.description))
      .filter(Boolean)
      .join("\n"),
    faqsText: faqItems
      .map((item) => toLine(item.title, item.valueText || item.value))
      .filter(Boolean)
      .join("\n"),
    policiesText: policyItems
      .map((item) => toLine(item.title, item.valueText || item.value))
      .filter(Boolean)
      .join("\n"),
  };
}

export function reviewStateMatchesSource(
  currentReview = {},
  reviewDraft = {},
  sourceType = "",
  sourceUrl = ""
) {
  const info = resolveReviewSourceInfo(currentReview, reviewDraft);

  const aType = normalizeIncomingSourceType(info.sourceType);
  const bType = normalizeIncomingSourceType(sourceType);

  const normalizeUrl = (value = "") =>
    s(value).toLowerCase().replace(/\/+$/, "");

  const aUrl = normalizeUrl(info.sourceUrl);
  const bUrl = normalizeUrl(sourceUrl);

  if (bType && aType && aType !== bType) return false;
  if (bUrl && aUrl && aUrl !== bUrl) return false;
  if (bUrl && !aUrl) return false;

  return !!(aType || aUrl);
}

export function buildServiceDraftItemsFromManual(
  text = "",
  existing = []
) {
  const base = arr(existing).map(normalizeServiceItem);
  const seen = new Set(
    base.map((item) => `${s(item.title).toLowerCase()}|${s(item.description).toLowerCase()}`)
  );

  for (const line of splitManualLines(text)) {
    const [title, ...rest] = line.split("|");
    const item = normalizeServiceItem({
      title: s(title),
      description: s(rest.join("|")),
      status: "pending",
      sourceType: "manual",
    });

    const key = `${s(item.title).toLowerCase()}|${s(item.description).toLowerCase()}`;
    if (!item.title || seen.has(key)) continue;

    seen.add(key);
    base.push(item);
  }

  return base;
}

export function buildKnowledgeDraftItemsFromManual({
  faqsText = "",
  policiesText = "",
  existing = [],
} = {}) {
  const base = arr(existing).map(normalizeKnowledgeItem);
  const seen = new Set(
    base.map((item) => `${s(item.category).toLowerCase()}|${s(item.title).toLowerCase()}|${s(item.valueText).toLowerCase()}`)
  );

  for (const line of splitManualLines(faqsText)) {
    const [title, ...rest] = line.split("|");
    const item = normalizeKnowledgeItem({
      category: "faq",
      title: s(title),
      valueText: s(rest.join("|")),
      status: "pending",
      sourceType: "manual",
    });

    const key = `${s(item.category).toLowerCase()}|${s(item.title).toLowerCase()}|${s(item.valueText).toLowerCase()}`;
    if (!item.title || seen.has(key)) continue;

    seen.add(key);
    base.push(item);
  }

  for (const line of splitManualLines(policiesText)) {
    const [title, ...rest] = line.split("|");
    const item = normalizeKnowledgeItem({
      category: "policy",
      title: s(title),
      valueText: s(rest.join("|")),
      status: "pending",
      sourceType: "manual",
    });

    const key = `${s(item.category).toLowerCase()}|${s(item.title).toLowerCase()}|${s(item.valueText).toLowerCase()}`;
    if (!item.title || seen.has(key)) continue;

    seen.add(key);
    base.push(item);
  }

  return base;
}

export function deriveVisibleKnowledgeItems({
  reviewDraft = {},
  currentReview = {},
  discoveryState = {},
} = {}) {
  const fromDraft = arr(obj(reviewDraft).reviewQueue).map(normalizeKnowledgeItem);
  const fromCurrent = arr(obj(currentReview).draft?.knowledgeItems).map(
    normalizeKnowledgeItem
  );
  const fromDiscovery = arr(obj(discoveryState).importedKnowledgeItems).map(
    normalizeKnowledgeItem
  );

  const out = [];
  const seen = new Set();

  for (const item of [...fromDraft, ...fromCurrent, ...fromDiscovery]) {
    const key = `${s(item.candidateId)}|${s(item.category)}|${s(item.title)}|${s(item.valueText)}`;
    if ((!item.title && !item.valueText) || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export function deriveVisibleServiceItems({
  reviewDraft = {},
  currentReview = {},
  discoveryState = {},
} = {}) {
  const fromDraft = arr(obj(reviewDraft).sections?.services).map(normalizeServiceItem);
  const fromCurrent = arr(obj(currentReview).draft?.services).map(normalizeServiceItem);
  const fromDiscovery = arr(obj(discoveryState).importedServices).map(
    normalizeServiceItem
  );

  const out = [];
  const seen = new Set();

  for (const item of [...fromDraft, ...fromCurrent, ...fromDiscovery]) {
    const key = `${s(item.title)}|${s(item.description)}`;
    if (!item.title || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export function deriveVisibleSources({
  currentReview = {},
  discoveryState = {},
} = {}) {
  const reviewSources = arr(obj(currentReview).sources).map(normalizeSourceRecord);

  if (reviewSources.length) {
    return reviewSources.filter((item) => item.sourceType || item.sourceUrl);
  }

  return arr(obj(discoveryState).intakeContext?.sources).map(normalizeSourceRecord);
}

export function deriveVisibleEvents(currentReview = {}) {
  return arr(obj(currentReview).events).map((item) => ({
    id: s(item?.id || item?.eventId || item?.event_id),
    title: s(item?.title || item?.name || item?.type || "Event"),
    message: s(item?.message || item?.description),
    status: s(item?.status),
    createdAt: s(item?.createdAt || item?.created_at),
  }));
}