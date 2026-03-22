import { arr, obj, s } from "./shared.js";
import {
  firstArrayWithItems,
  firstNonEmpty,
  inferSourceLabel,
  LANGUAGE_LABELS,
  lower,
  uniqText,
} from "./shared.js";

export function hasMeaningfulReviewDraft(reviewDraft = {}) {
  const rd = obj(reviewDraft);
  const draft = obj(
    rd.draft ||
      rd.reviewDraft ||
      rd.review_draft ||
      rd.currentDraft ||
      rd.current_draft
  );
  const session = obj(rd.session || rd.reviewSession || rd.review_session);
  const stats = obj(rd.stats);
  const sources = arr(rd.sources || draft.sources);
  const events = arr(rd.events || draft.events);
  const queue = arr(
    rd.reviewQueue ||
      rd.review_queue ||
      rd.queue ||
      rd.candidates ||
      draft.reviewQueue ||
      draft.review_queue ||
      draft.candidates
  );

  const profile = obj(
    draft.profile || draft.businessProfile || draft.business_profile
  );
  const fieldConfidence = obj(
    draft.fieldConfidence || draft.field_confidence || profile.fieldConfidence
  );
  const reviewFlags = firstArrayWithItems(
    rd.reviewFlags,
    rd.review_flags,
    draft.reviewFlags,
    draft.review_flags,
    profile.reviewFlags,
    profile.review_flags
  );

  const textSignals = [
    session.id,
    session.reviewSessionId,
    session.review_session_id,
    rd.reviewSessionId,
    rd.review_session_id,
    draft.companyName,
    draft.businessName,
    draft.name,
    draft.title,
    draft.companyTitle,
    draft.description,
    draft.summary,
    draft.companySummaryShort,
    draft.companySummaryLong,
    draft.aboutSection,
    profile.companyName,
    profile.companyTitle,
    profile.companySummaryShort,
    profile.companySummaryLong,
  ]
    .map((x) => s(x))
    .filter(Boolean);

  return (
    textSignals.length > 0 ||
    sources.length > 0 ||
    events.length > 0 ||
    queue.length > 0 ||
    reviewFlags.length > 0 ||
    Object.keys(fieldConfidence).length > 0 ||
    Number(stats.pendingReviewCount || stats.pending_review_count || 0) > 0
  );
}

export function hasMeaningfulIdentityData({
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  meta,
  businessForm,
}) {
  const m = obj(meta);
  const bf = obj(businessForm);

  return !!(
    s(currentTitle) ||
    s(currentDescription) ||
    arr(discoveryProfileRows).length > 0 ||
    s(m.companyName) ||
    s(m.companySummaryShort) ||
    s(m.companySummaryLong) ||
    s(m.description) ||
    s(m.mainLanguage) ||
    s(m.primaryLanguage) ||
    s(m.language) ||
    s(bf.companyName) ||
    s(bf.description) ||
    s(bf.websiteUrl) ||
    s(bf.primaryPhone) ||
    s(bf.primaryEmail) ||
    s(bf.primaryAddress)
  );
}

export function buildRecoveredStage({
  importingWebsite,
  studioProgress,
  hasIdentityData,
  hasReviewPayload,
  hasVisibleResults,
  hasKnowledge,
  hasServices,
  hasScannedUrl,
  stayOnSourceStage,
}) {
  if (importingWebsite) {
    return stayOnSourceStage ? "entry" : "scanning";
  }

  if (studioProgress?.setupCompleted) {
    return "ready";
  }

  const hasAnyResultFlow = !!(
    hasVisibleResults ||
    hasIdentityData ||
    hasReviewPayload ||
    hasKnowledge ||
    hasServices ||
    hasScannedUrl
  );

  if (!hasAnyResultFlow) {
    return "entry";
  }

  if (stayOnSourceStage) {
    return "entry";
  }

  return "identity";
}

export function buildStatusLabel({
  importingWebsite,
  discoveryState,
  discoveryModeLabel,
  reviewRequired,
}) {
  if (importingWebsite) return "Analyzing";
  if (reviewRequired) return "Needs review";

  if (arr(discoveryState?.warnings).length > 0) {
    return "Review needed";
  }

  if (discoveryState?.shouldReview) {
    return "Needs review";
  }

  return discoveryModeLabel(discoveryState?.mode);
}

export function resolveLanguageValue({
  discoveryState = {},
  reviewDraft = {},
  businessForm = {},
  meta = {},
}) {
  const rd = obj(reviewDraft);
  const draft = obj(
    rd.draft ||
      rd.reviewDraft ||
      rd.review_draft ||
      rd.currentDraft ||
      rd.current_draft
  );
  const profile = obj(
    draft.profile || draft.businessProfile || draft.business_profile
  );
  const m = obj(meta);
  const bf = obj(businessForm);

  const candidates = [
    discoveryState?.mainLanguage,
    discoveryState?.primaryLanguage,
    discoveryState?.sourceLanguage,
    discoveryState?.language,
    rd?.mainLanguage,
    rd?.primaryLanguage,
    draft?.mainLanguage,
    draft?.primaryLanguage,
    draft?.language,
    profile?.mainLanguage,
    profile?.primaryLanguage,
    profile?.language,
    profile?.sourceLanguage,
    m?.mainLanguage,
    m?.primaryLanguage,
    m?.language,
    bf?.mainLanguage,
    bf?.primaryLanguage,
    bf?.language,
  ]
    .map((x) => lower(x))
    .filter(Boolean);

  for (const value of candidates) {
    if (LANGUAGE_LABELS[value]) return value;
  }

  return "";
}

export function resolveLanguageLabel(language = "") {
  return LANGUAGE_LABELS[lower(language)] || s(language).toUpperCase();
}

export function collectReviewFlags({
  discoveryState = {},
  reviewDraft = {},
  businessForm = {},
  meta = {},
}) {
  const rd = obj(reviewDraft);
  const draft = obj(
    rd.draft ||
      rd.reviewDraft ||
      rd.review_draft ||
      rd.currentDraft ||
      rd.current_draft
  );
  const profile = obj(
    draft.profile || draft.businessProfile || draft.business_profile
  );
  const m = obj(meta);
  const bf = obj(businessForm);

  return uniqText(
    [
      ...arr(discoveryState?.reviewFlags),
      ...arr(discoveryState?.review_flags),
      ...arr(rd?.reviewFlags),
      ...arr(rd?.review_flags),
      ...arr(draft?.reviewFlags),
      ...arr(draft?.review_flags),
      ...arr(profile?.reviewFlags),
      ...arr(profile?.review_flags),
      ...arr(m?.reviewFlags),
      ...arr(m?.review_flags),
      ...arr(bf?.reviewFlags),
      ...arr(bf?.review_flags),
    ],
    16
  );
}

export function resolveReviewRequired({
  discoveryState = {},
  reviewDraft = {},
  businessForm = {},
  meta = {},
  reviewFlags = [],
}) {
  const rd = obj(reviewDraft);
  const draft = obj(
    rd.draft ||
      rd.reviewDraft ||
      rd.review_draft ||
      rd.currentDraft ||
      rd.current_draft
  );
  const profile = obj(
    draft.profile || draft.businessProfile || draft.business_profile
  );
  const m = obj(meta);
  const bf = obj(businessForm);

  return !!(
    discoveryState?.reviewRequired ||
    discoveryState?.review_required ||
    discoveryState?.shouldReview ||
    rd?.reviewRequired ||
    rd?.review_required ||
    draft?.reviewRequired ||
    draft?.review_required ||
    profile?.reviewRequired ||
    profile?.review_required ||
    m?.reviewRequired ||
    m?.review_required ||
    bf?.reviewRequired ||
    bf?.review_required ||
    arr(reviewFlags).length > 0
  );
}

export function resolveFieldConfidence({
  discoveryState = {},
  reviewDraft = {},
  meta = {},
  businessForm = {},
}) {
  const rd = obj(reviewDraft);
  const draft = obj(
    rd.draft ||
      rd.reviewDraft ||
      rd.review_draft ||
      rd.currentDraft ||
      rd.current_draft
  );
  const profile = obj(
    draft.profile || draft.businessProfile || draft.business_profile
  );
  const m = obj(meta);
  const bf = obj(businessForm);

  return obj(
    discoveryState?.fieldConfidence ||
      discoveryState?.field_confidence ||
      rd?.fieldConfidence ||
      rd?.field_confidence ||
      draft?.fieldConfidence ||
      draft?.field_confidence ||
      profile?.fieldConfidence ||
      profile?.field_confidence ||
      m?.fieldConfidence ||
      m?.field_confidence ||
      bf?.fieldConfidence ||
      bf?.field_confidence
  );
}

export function buildTopFieldConfidenceBadges(fieldConfidence = {}) {
  const entries = Object.entries(obj(fieldConfidence))
    .map(([key, value]) => ({
      key: s(key),
      score: Number(value?.score ?? value),
      label: s(value?.label),
    }))
    .filter((item) => item.key && Number.isFinite(item.score))
    .sort((a, b) => a.score - b.score);

  return entries.slice(0, 3);
}

export function buildSceneSummaryState({
  discoveryState = {},
  discoveryForm = {},
  reviewDraft = {},
  businessForm = {},
  meta = {},
  currentTitle = "",
  currentDescription = "",
  discoveryProfileRows = [],
  knowledgeItems = [],
  knowledgePreview = [],
  services = [],
  reviewSources = [],
  reviewEvents = [],
  visibleKnowledgeCount = 0,
  visibleServiceCount = 0,
}) {
  const safeKnowledgePreview = arr(knowledgePreview);
  const safeKnowledgeItems = arr(knowledgeItems);
  const safeServices = arr(services);
  const safeDiscoveryProfileRows = arr(discoveryProfileRows);
  const safeWarnings = arr(discoveryState?.warnings).filter(Boolean);
  const safeReviewSources = arr(reviewSources);
  const safeReviewEvents = arr(reviewEvents);

  const draftQueue = arr(
    reviewDraft?.reviewQueue || reviewDraft?.review_queue
  );

  const intakeItems =
    safeKnowledgeItems.length > 0
      ? safeKnowledgeItems
      : draftQueue.length > 0
        ? draftQueue
        : safeKnowledgePreview;

  const stageKnowledgeItems =
    safeKnowledgeItems.length > 0 ? safeKnowledgeItems : intakeItems;

  const hasKnowledge =
    safeKnowledgeItems.length > 0 ||
    draftQueue.length > 0 ||
    safeKnowledgePreview.length > 0 ||
    Number(visibleKnowledgeCount || 0) > 0;

  const hasServices =
    safeServices.length > 0 || Number(visibleServiceCount || 0) > 0;

  const hasReviewPayload = hasMeaningfulReviewDraft(reviewDraft);

  const hasIdentityData = hasMeaningfulIdentityData({
    currentTitle,
    currentDescription,
    discoveryProfileRows: safeDiscoveryProfileRows,
    meta,
    businessForm,
  });

  const scanSucceeded =
    String(discoveryState?.mode || "").toLowerCase() === "success";

  const sourceLabelFromState = s(
    discoveryState?.sourceLabel ||
      discoveryState?.source_label ||
      inferSourceLabel(
        discoveryState?.lastSourceType || discoveryState?.last_source_type,
        discoveryState?.lastUrl ||
          discoveryState?.last_url ||
          discoveryState?.url ||
          discoveryState?.sourceUrl ||
          discoveryState?.source_url
      )
  );

  const primarySourceUrlFromState = s(
    discoveryState?.lastUrl ||
      discoveryState?.last_url ||
      discoveryState?.url ||
      discoveryState?.sourceUrl ||
      discoveryState?.source_url
  );

  const primarySourceUrl =
    primarySourceUrlFromState || s(discoveryForm?.websiteUrl);
  const sourceLabel =
    sourceLabelFromState ||
    inferSourceLabel(
      discoveryState?.lastSourceType || discoveryState?.last_source_type,
      discoveryForm?.websiteUrl
    );

  const hasScannedUrl = !!primarySourceUrl;

  const resolvedLanguage = resolveLanguageValue({
    discoveryState,
    reviewDraft,
    businessForm,
    meta,
  });

  const reviewFlags = collectReviewFlags({
    discoveryState,
    reviewDraft,
    businessForm,
    meta,
  });

  const reviewRequired = resolveReviewRequired({
    discoveryState,
    reviewDraft,
    businessForm,
    meta,
    reviewFlags,
  });

  const fieldConfidence = resolveFieldConfidence({
    discoveryState,
    reviewDraft,
    meta,
    businessForm,
  });

  const weakestFieldBadges = buildTopFieldConfidenceBadges(fieldConfidence);

  const discoveredTitle =
    firstNonEmpty(
      findProfileRowValue(safeDiscoveryProfileRows, [
        "name",
        "business name",
        "company name",
        "title",
      ]),
      meta?.companyName
    );

  const discoveredDescription =
    firstNonEmpty(
      findProfileRowValue(safeDiscoveryProfileRows, [
        "description",
        "summary",
        "about",
        "business description",
      ]),
      meta?.companySummaryShort,
      meta?.description
    );

  const resolvedCurrentTitle =
    s(currentTitle) ||
    s(businessForm?.companyName) ||
    discoveredTitle ||
    "Business identity";

  const resolvedCurrentDescription =
    s(currentDescription) ||
    s(businessForm?.description) ||
    discoveredDescription ||
    "We extracted a first draft of the business direction from the source signals.";

  const reviewStatusLabel = firstNonEmpty(
    discoveryState?.reviewSessionStatus,
    reviewDraft?.session?.status,
    reviewDraft?.status
  );

  const resultKnowledgeCount = Math.max(
    Number(visibleKnowledgeCount || 0),
    safeKnowledgeItems.length,
    safeKnowledgePreview.length
  );

  const resultServiceCount = Math.max(
    Number(visibleServiceCount || 0),
    safeServices.length
  );

  const resultSourceCount = countDistinctSources(
    safeReviewSources,
    primarySourceUrl
  );

  const resultEventCount = safeReviewEvents.length;

  const summaryVisible = !!(
    primarySourceUrl ||
    sourceLabel ||
    resultKnowledgeCount > 0 ||
    resultServiceCount > 0 ||
    resultSourceCount > 0 ||
    resultEventCount > 0 ||
    safeWarnings.length > 0 ||
    reviewRequired ||
    reviewFlags.length > 0 ||
    resolvedLanguage ||
    s(discoveryState?.message)
  );

  return {
    safeKnowledgePreview,
    safeKnowledgeItems,
    safeServices,
    safeDiscoveryProfileRows,
    safeWarnings,
    safeReviewSources,
    safeReviewEvents,
    draftQueue,
    intakeItems,
    stageKnowledgeItems,
    hasKnowledge,
    hasServices,
    hasReviewPayload,
    hasIdentityData,
    scanSucceeded,
    sourceLabel,
    primarySourceUrl,
    hasScannedUrl,
    resolvedLanguage,
    reviewFlags,
    reviewRequired,
    fieldConfidence,
    weakestFieldBadges,
    resolvedCurrentTitle,
    resolvedCurrentDescription,
    reviewStatusLabel,
    resultKnowledgeCount,
    resultServiceCount,
    resultSourceCount,
    resultEventCount,
    summaryVisible,
  };
}

function findProfileRowValue(rows = [], wantedKeys = []) {
  const normalizedWanted = arr(wantedKeys).map((x) => s(x).toLowerCase());

  const match = arr(rows).find((item) => {
    if (!Array.isArray(item)) return false;
    return normalizedWanted.includes(s(item[0]).toLowerCase());
  });

  return s(match?.[1]);
}

function countDistinctSources(reviewSources = [], primarySourceUrl = "") {
  const keys = new Set();

  if (s(primarySourceUrl)) {
    keys.add(lower(primarySourceUrl));
  }

  for (const item of arr(reviewSources)) {
    const key =
      lower(item?.url) ||
      lower(item?.sourceUrl) ||
      lower(item?.source_url) ||
      lower(item?.id);

    if (!key) continue;
    keys.add(key);
  }

  return keys.size;
}