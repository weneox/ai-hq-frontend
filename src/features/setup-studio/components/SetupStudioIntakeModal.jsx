import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, CircleAlert, RotateCw, X } from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";
import SetupStudioKnowledgeLine from "./SetupStudioKnowledgeLine.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function obj(v, d = {}) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : d;
}

function n(v, d = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : d;
}

function normalizeEvidence(item = {}) {
  const x = obj(item);
  return arr(
    x.evidence ||
      x.sourceEvidenceJson ||
      x.source_evidence_json ||
      x.sourceEvidence ||
      x.sources
  )
    .map((entry) => obj(entry))
    .filter((entry) => Object.keys(entry).length > 0);
}

function pickEvidenceUrl(item = {}, evidence = []) {
  const x = obj(item);
  const first = obj(arr(evidence)[0]);

  return s(
    x.evidenceUrl ||
      x.evidence_url ||
      first.pageUrl ||
      first.page_url ||
      first.url ||
      first.source_url ||
      first.link
  );
}

function humanConfidence(item = {}) {
  const x = obj(item);

  const explicitLabel = s(
    x.confidenceLabel ||
      x.confidence_label ||
      x.confidenceText ||
      x.confidence_text
  );
  if (explicitLabel) return explicitLabel;

  const raw = typeof x.confidence === "number" ? x.confidence : Number(x.confidence);
  if (!Number.isFinite(raw)) return "";

  if (raw >= 0.85) return "high";
  if (raw >= 0.6) return "medium";
  if (raw > 0) return "low";
  return "";
}

function normalizeKnowledgeItem(item = {}, index = 0) {
  const x = obj(item);
  const evidence = normalizeEvidence(x);
  const confidenceValue =
    typeof x.confidence === "number" ? x.confidence : Number(x.confidence || 0) || 0;

  return {
    ...x,
    id: s(x.id || x.candidateId || x.candidate_id || x.key || x.title),
    candidateId: s(x.candidateId || x.candidate_id || x.id),
    index: String(index + 1).padStart(2, "0"),
    title: s(x.title || x.label || x.key || "Untitled item"),
    value: s(
      x.value ||
        x.valueText ||
        x.value_text ||
        x.normalizedText ||
        x.normalized_text ||
        x.description
    ),
    valueText: s(
      x.valueText ||
        x.value_text ||
        x.value ||
        x.normalizedText ||
        x.normalized_text ||
        x.description
    ),
    category: s(x.category || "general"),
    status: s(x.status || "pending"),
    source: s(
      x.source ||
        x.sourceLabel ||
        x.source_label ||
        x.source_display_name ||
        x.sourceType ||
        x.source_type
    ),
    sourceType: s(x.sourceType || x.source_type),
    confidence: confidenceValue,
    confidenceLabel: humanConfidence(x),
    evidence,
    evidenceUrl: pickEvidenceUrl(x, evidence),
  };
}

function categoryLabel(value = "") {
  const x = s(value).toLowerCase();
  if (x === "faq" || x === "faqs") return "FAQ";
  if (x === "policy" || x === "policies") return "Policy";
  if (x === "service" || x === "services") return "Service";
  if (x === "product" || x === "products") return "Product";
  if (x === "contact" || x === "contacts") return "Contact";
  return "Knowledge";
}

export default function SetupStudioIntakeModal({
  knowledgeItems,
  actingKnowledgeId,
  onApproveKnowledge,
  onRejectKnowledge,
  onClose,
  onRefresh,
}) {
  const [refreshing, setRefreshing] = useState(false);

  const items = arr(knowledgeItems)
    .map((item, index) => normalizeKnowledgeItem(item, index))
    .filter((item) => item.id || item.title || item.value);

  const avgConfidence = items.length
    ? Math.round(
        (items.reduce((sum, item) => sum + n(item.confidence, 0), 0) / items.length) * 100
      )
    : 0;

  const categoryCounts = items.reduce((acc, item) => {
    const key = s(item.category || "general").toLowerCase() || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const categoryBadges = Object.entries(categoryCounts).slice(0, 6);

  async function handleRefresh() {
    if (typeof onRefresh !== "function" || refreshing) return;

    try {
      setRefreshing(true);
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex w-full max-w-[1080px] flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/94 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl max-h-[calc(100vh-1rem)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/92 px-5 py-5 backdrop-blur-xl sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <TinyLabel>
              <BadgeCheck className="h-3.5 w-3.5" />
              knowledge intake
            </TinyLabel>

            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-3xl">
              Review what enters the twin
            </h2>

            <p className="mt-3 max-w-[720px] text-sm leading-7 text-slate-500">
              Burda source-dan çıxarılan knowledge item-ləri approve və reject edə bilərsən.
              Yalnız düzgün və faydalı məlumat canonical twin-ə keçməlidir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {typeof onRefresh === "function" ? (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
                aria-label="Refresh intake"
              >
                <RotateCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              aria-label="Close intake"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200/70 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
          <div className="rounded-[24px] border border-slate-200/80 bg-white/86 p-4 shadow-[0_12px_36px_rgba(15,23,42,.04)]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Intake summary
            </div>

            <div className="text-sm leading-6 text-slate-600">
              Bu siyahı hazırda review session-da görünən knowledge item-lərdir.
              Hər item ayrıca approve/reject edilə bilər.
            </div>

            {categoryBadges.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {categoryBadges.map(([key, count]) => (
                  <span
                    key={key}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {categoryLabel(key)} · {count}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-white/86 p-4 shadow-[0_12px_36px_rgba(15,23,42,.04)]">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Signal quality
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Items
                </div>
                <div className="mt-1 text-xl font-semibold text-slate-950">
                  {items.length}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Avg confidence
                </div>
                <div className="mt-1 text-xl font-semibold text-slate-950">
                  {avgConfidence}%
                </div>
              </div>
            </div>

            {!items.length ? (
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Review üçün knowledge item yoxdur.</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <SetupStudioKnowledgeLine
                key={item.id || item.title || item.index}
                item={item}
                busy={actingKnowledgeId === item.id}
                onApprove={() =>
                  onApproveKnowledge?.({
                    ...item,
                    id: item.id,
                    candidateId: item.candidateId || item.id,
                  })
                }
                onReject={() =>
                  onRejectKnowledge?.({
                    ...item,
                    id: item.id,
                    candidateId: item.candidateId || item.id,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
              <BadgeCheck className="h-5 w-5" />
            </div>

            <div className="mt-4 text-base font-semibold text-slate-900">
              Review üçün knowledge item yoxdur
            </div>

            <div className="mt-2 max-w-[360px] text-sm leading-6 text-slate-500">
              Hazırda intake siyahısında approve/reject ediləcək element görünmür.
              Refresh edib yenidən yoxlaya bilərsən.
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-white/92 px-5 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Approve edilən item-lər review flow ilə twin daxilinə keçəcək.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {typeof onRefresh === "function" ? (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
              >
                <RotateCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Close intake
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}