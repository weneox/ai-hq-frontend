// src/features/setup-studio/lib/setupStudioHelpers.js
// FINAL v1.2

export function arr(value) {
  return Array.isArray(value) ? value : [];
}

export function obj(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

export function truncateMiddle(value = "", start = 28, end = 18) {
  const text = s(value);
  if (!text || text.length <= start + end + 3) return text;
  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

export function firstLanguage(profile) {
  if (profile?.language) return String(profile.language);
  if (Array.isArray(profile?.languages) && profile.languages[0]) {
    return String(profile.languages[0]);
  }
  return "az";
}

export function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.items,
    payload.rows,
    payload.results,
    payload.data,
    payload.entries,
    payload.candidates,
    payload.queue,
    payload.services,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

export function parseJsonArray(value) {
  if (Array.isArray(value)) return value;

  if (value && typeof value === "object") {
    return [value];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

export function compactValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => s(item))
      .filter(Boolean)
      .slice(0, 3)
      .join(" · ");
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => s(item))
      .filter(Boolean)
      .slice(0, 3)
      .join(" · ");
  }

  return s(value);
}

export function isPendingKnowledge(item = {}) {
  const status = s(item.status || item.review_status || item.state).toLowerCase();
  if (!status) return true;

  return ["pending", "needs_review", "conflict", "review", "awaiting_review"].includes(
    status
  );
}

export function candidateTitle(item = {}) {
  return s(item.title) || s(item.item_key) || s(item.canonical_key) || "Untitled discovery";
}

export function candidateCategory(item = {}) {
  return s(item.category || item.candidate_group || "general");
}

export function candidateValue(item = {}) {
  const text = s(item.value_text || item.summary || item.description);
  if (text) return text;

  const valueJson = obj(item.value_json);

  const combined =
    s(valueJson.question) && s(valueJson.answer)
      ? `${s(valueJson.question)} — ${s(valueJson.answer)}`
      : s(
          valueJson.summary ||
            valueJson.text ||
            valueJson.description ||
            valueJson.service ||
            valueJson.product ||
            valueJson.policy ||
            valueJson.address ||
            valueJson.hours ||
            valueJson.email ||
            valueJson.phone ||
            valueJson.url ||
            valueJson.title
        );

  if (combined) return combined;

  const compact = compactValue(valueJson);
  if (compact) return compact;

  try {
    return JSON.stringify(valueJson, null, 2);
  } catch {
    return "";
  }
}

export function candidateSource(item = {}) {
  const evidence = evidenceList(item)[0] || {};

  return (
    s(item.source_display_name) ||
    s(item.display_name) ||
    s(item.source_type) ||
    s(item.source_key) ||
    s(evidence.type) ||
    s(evidence.source_type) ||
    "Unknown source"
  );
}

export function candidateConfidence(item = {}) {
  const n = Number(item.confidence);
  if (!Number.isFinite(n)) return "";

  const percent = n <= 1 ? n * 100 : n;
  return `${Math.round(percent)}%`;
}

export function evidenceList(item = {}) {
  return parseJsonArray(item.source_evidence_json).slice(0, 2);
}

export function profilePatchFromDiscovery(profile = {}) {
  const p = obj(profile);
  const languages = arr(p.languages);

  return {
    companyName: s(
      p.companyName ||
        p.businessName ||
        p.name ||
        p.title ||
        p.brandName ||
        p.companyTitle
    ),
    description: s(
      p.description ||
        p.summary ||
        p.businessDescription ||
        p.about ||
        p.companySummaryShort ||
        p.companySummaryLong ||
        p.aboutSection
    ),
    timezone: s(p.timezone || p.timeZone),
    language: s(p.language || languages[0]),
  };
}

export function mergeBusinessForm(prev, patch = {}) {
  const next = { ...prev };

  if (s(patch.companyName) && !s(prev.companyName)) {
    next.companyName = s(patch.companyName);
  }

  if (s(patch.description) && !s(prev.description)) {
    next.description = s(patch.description);
  }

  if (s(patch.timezone) && (!s(prev.timezone) || s(prev.timezone) === "Asia/Baku")) {
    next.timezone = s(patch.timezone);
  }

  if (s(patch.language) && (!s(prev.language) || s(prev.language) === "az")) {
    next.language = s(patch.language);
  }

  return next;
}

export function profilePreviewRows(profile = {}) {
  const p = obj(profile);

  const services = arr(p.services).filter(Boolean).slice(0, 4).join(", ");

  return [
    [
      "Name",
      s(
        p.companyName ||
          p.businessName ||
          p.name ||
          p.title ||
          p.brandName ||
          p.companyTitle
      ),
    ],
    [
      "Description",
      s(
        p.description ||
          p.summary ||
          p.businessDescription ||
          p.about ||
          p.companySummaryShort ||
          p.companySummaryLong ||
          p.aboutSection
      ),
    ],
    ["Timezone", s(p.timezone || p.timeZone)],
    ["Language", s(p.language || arr(p.languages)[0])],
    ["Website", s(p.website || p.url || p.siteUrl)],
    ["Services", services],
  ].filter(([, value]) => value);
}

export function discoveryModeLabel(mode = "") {
  const value = s(mode).toLowerCase();

  if (!value || value === "idle") return "Ready to scan";
  if (["running", "queued", "processing", "syncing"].includes(value)) return "AI is scanning";
  if (["success", "completed", "complete", "done"].includes(value)) return "Scan completed";
  if (["error", "failed"].includes(value)) return "Scan failed";

  return value;
}

export function stepDone(meta, key) {
  const missing = arr(meta?.missingSteps).map((x) => s(x).toLowerCase());
  return !missing.includes(String(key).toLowerCase());
}

export function deriveStudioProgress({ importingWebsite, discoveryState, meta }) {
  const readinessScore = Number(meta?.readinessScore || 0);
  const setupCompleted = !!meta?.setupCompleted;
  const missingSteps = arr(meta?.missingSteps);
  const primaryMissingStep = s(meta?.primaryMissingStep);
  const nextRoute = s(meta?.nextRoute || "/");
  const nextSetupRoute = s(meta?.nextSetupRoute || "/setup");
  const readinessLabel = s(meta?.readinessLabel);

  let progressPercent = readinessScore;

  if (setupCompleted) {
    progressPercent = 100;
  } else if (importingWebsite) {
    progressPercent = Math.max(
      24,
      Math.min(76, 36 + Number(meta?.pendingCandidateCount || 0) * 4)
    );
  } else {
    const mode = s(discoveryState?.mode).toLowerCase();

    if (["success", "completed", "complete", "done"].includes(mode)) {
      progressPercent = Math.max(readinessScore, 72);
    } else if (["error", "failed"].includes(mode)) {
      progressPercent = Math.max(12, readinessScore);
    } else {
      progressPercent = Math.max(8, readinessScore);
    }
  }

  return {
    progressPercent,
    readinessScore,
    readinessLabel,
    missingSteps,
    primaryMissingStep,
    nextRoute,
    nextSetupRoute,
    setupCompleted,
  };
}

export function isSuccessMode(mode = "") {
  return ["success", "completed", "complete", "done"].includes(s(mode).toLowerCase());
}

export function pageTone(mode = "", importingWebsite = false) {
  const value = importingWebsite ? "running" : s(mode).toLowerCase();

  if (["error", "failed"].includes(value)) {
    return {
      dot: "bg-rose-500",
      text: "text-rose-700",
      chip: "border-rose-500/15 bg-rose-500/10 text-rose-700",
    };
  }

  if (["running", "queued", "processing", "syncing"].includes(value)) {
    return {
      dot: "bg-cyan-500",
      text: "text-cyan-700",
      chip: "border-cyan-500/15 bg-cyan-500/10 text-cyan-700",
    };
  }

  if (["success", "completed", "complete", "done"].includes(value)) {
    return {
      dot: "bg-emerald-500",
      text: "text-emerald-700",
      chip: "border-emerald-500/15 bg-emerald-500/10 text-emerald-700",
    };
  }

  return {
    dot: "bg-slate-400",
    text: "text-slate-600",
    chip: "border-slate-900/8 bg-slate-900/5 text-slate-600",
  };
}