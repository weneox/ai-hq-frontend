import { apiGet } from "./client.js";
import { getSetupOverview } from "./setup.js";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function obj(v, d = {}) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : d;
}

function hasKeys(value = {}) {
  return Object.keys(obj(value)).length > 0;
}

function pickFirstObject(...values) {
  for (const value of values) {
    const next = obj(value);
    if (Object.keys(next).length) return next;
  }
  return {};
}

function pickFirstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value;
  }
  return [];
}

function normalizeFieldValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? s(item)
          : s(item?.title || item?.name || item?.label || item?.value || item?.description)
      )
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return s(
      value.text ||
        value.value ||
        value.label ||
        value.name ||
        value.title ||
        value.description
    );
  }

  return s(value);
}

function summarizeProvenance(value = {}) {
  const item = obj(value);
  const sources = arr(item.sources || item.sourceList || item.contributors);
  const labels = [
    s(item.label || item.sourceLabel || item.sourceType),
    ...sources.map((source) =>
      s(source?.label || source?.sourceLabel || source?.sourceType || source?.title)
    ),
  ].filter(Boolean);

  const unique = [...new Set(labels)];
  const note = s(item.note || item.reason || item.summary || item.display);

  if (unique.length && note) return `${unique.join(", ")} - ${note}`;
  if (unique.length) return unique.join(", ");
  return note;
}

function normalizeHistory(items = []) {
  return arr(items)
    .map((entry, index) => {
      const item = obj(entry);
      const approvedAt = s(item.approvedAt || item.createdAt || item.updatedAt);
      const approvedBy = s(
        item.approvedBy ||
          item.actor ||
          item.createdBy ||
          item.updatedBy ||
          item.user
      );
      const version = s(item.version || item.revision || item.id);

      if (!approvedAt && !approvedBy && !version) return null;

      return {
        id: version || `history-${index + 1}`,
        approvedAt,
        approvedBy,
        version,
      };
    })
    .filter(Boolean);
}

function normalizeTruthResponse(payload = {}, source = "") {
  const root = obj(payload);
  const truth = pickFirstObject(
    root.truth,
    root.snapshot,
    root.approvedTruth,
    root.approved_truth,
    root.currentTruth,
    root.current_truth
  );

  const profile = pickFirstObject(
    truth.profile,
    truth.businessProfile,
    truth.tenantProfile,
    root.profile,
    root.businessProfile,
    root.tenantProfile,
    root.workspace?.businessProfile,
    root.workspace?.tenantProfile,
    root.setup?.businessProfile,
    root.setup?.tenantProfile
  );

  const fieldProvenance = pickFirstObject(
    truth.fieldProvenance,
    truth.field_provenance,
    root.fieldProvenance,
    root.field_provenance
  );

  const history = normalizeHistory(
    pickFirstArray(
      truth.history,
      truth.versions,
      root.history,
      root.versions,
      root.snapshots
    )
  );

  const fields = [
    ["Company name", normalizeFieldValue(profile.companyName || profile.name), "companyName"],
    ["Short business summary", normalizeFieldValue(profile.description || profile.summaryShort || profile.companySummaryShort), "description"],
    ["Website URL", normalizeFieldValue(profile.websiteUrl), "websiteUrl"],
    ["Primary phone", normalizeFieldValue(profile.primaryPhone), "primaryPhone"],
    ["Primary email", normalizeFieldValue(profile.primaryEmail), "primaryEmail"],
    ["Primary address", normalizeFieldValue(profile.primaryAddress), "primaryAddress"],
    ["Timezone", normalizeFieldValue(profile.timezone), "timezone"],
    ["Primary language", normalizeFieldValue(profile.language || profile.mainLanguage || profile.primaryLanguage), "language"],
    ["Services", normalizeFieldValue(profile.services), "services"],
    ["Products", normalizeFieldValue(profile.products), "products"],
    ["Pricing", normalizeFieldValue(profile.pricingHints), "pricingHints"],
    ["Social", normalizeFieldValue(profile.socialLinks), "socialLinks"],
  ]
    .map(([label, value, key]) => ({
      key,
      label,
      value,
      provenance: summarizeProvenance(fieldProvenance[key]),
      hasProvenance: !!summarizeProvenance(fieldProvenance[key]),
    }))
    .filter((field) => field.value);

  const approval = {
    approvedAt: s(
      truth.approvedAt ||
        root.approvedAt ||
        truth.updatedAt ||
        root.updatedAt
    ),
    approvedBy: s(
      truth.approvedBy ||
        root.approvedBy ||
        truth.updatedBy ||
        root.updatedBy
    ),
    version: s(truth.version || truth.revision || root.version || root.revision),
  };

  const hasApprovalMeta = !!(approval.approvedAt || approval.approvedBy || approval.version);
  const hasTruth = fields.length > 0 || hasKeys(profile);

  return {
    source,
    fields,
    approval,
    hasApprovalMeta,
    hasHistory: history.length > 0,
    history,
    hasProvenance: fields.some((field) => field.hasProvenance),
    hasTruth,
  };
}

export async function getCanonicalTruthSnapshot() {
  const candidates = [
    "/api/truth/current",
    "/api/setup/truth/current",
    "/api/setup/business-truth/current",
    "/api/setup/approved-truth/current",
  ];

  for (const path of candidates) {
    const payload = await apiGet(path, { allowStatuses: [404] }).catch(() => null);
    if (!payload || payload?.ok === false || payload?.status === 404) continue;

    const normalized = normalizeTruthResponse(payload, path);
    if (normalized.hasTruth || normalized.hasApprovalMeta || normalized.hasHistory) {
      return normalized;
    }
  }

  const overview = await getSetupOverview().catch(() => null);
  if (overview) {
    const fallback = normalizeTruthResponse(overview, "/api/setup/overview");
    return {
      ...fallback,
      notices: [
        "Approved-truth metadata is not currently exposed by the backend. Showing the current saved business profile instead.",
      ],
    };
  }

  return {
    source: "",
    fields: [],
    approval: { approvedAt: "", approvedBy: "", version: "" },
    hasApprovalMeta: false,
    hasHistory: false,
    history: [],
    hasProvenance: false,
    hasTruth: false,
    notices: [
      "No approved truth endpoint was available from the backend.",
    ],
  };
}
