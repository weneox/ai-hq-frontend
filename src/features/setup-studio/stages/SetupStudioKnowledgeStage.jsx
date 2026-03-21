import {
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  FileSearch,
  Sparkles,
} from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";
import SetupStudioKnowledgeLine from "../components/SetupStudioKnowledgeLine.jsx";

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

function humanConfidence(item = {}) {
  const x = obj(item);

  const label = s(
    x.confidenceLabel ||
      x.confidence_label ||
      x.confidenceText ||
      x.confidence_text
  );
  if (label) return label;

  const raw = x.confidence;
  const value = typeof raw === "number" ? raw : Number(raw);

  if (!Number.isFinite(value)) return "";

  if (value >= 0.85) return "high";
  if (value >= 0.6) return "medium";
  if (value > 0) return "low";
  return "";
}

function normalizeEvidenceList(item = {}) {
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

function normalizeKnowledgeItem(item = {}, index = 0) {
  const x = obj(item);
  const evidence = normalizeEvidenceList(x);

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
    confidence:
      typeof x.confidence === "number"
        ? x.confidence
        : Number(x.confidence || 0) || 0,
    confidenceLabel: humanConfidence(x),
    evidence,
    evidenceUrl: pickEvidenceUrl(x, evidence),
  };
}

function groupLabel(category = "") {
  const x = s(category).toLowerCase();

  if (x === "faq" || x === "faqs") return "FAQ";
  if (x === "policy" || x === "policies") return "Policy";
  if (x === "service" || x === "services") return "Service";
  if (x === "product" || x === "products") return "Product";
  if (x === "contact" || x === "contacts") return "Contact";
  return "Knowledge";
}

export default function SetupStudioKnowledgeStage({
  knowledgePreview,
  knowledgeItems = [],
  actingKnowledgeId,
  sourceLabel,
  warnings,
  onApproveKnowledge,
  onRejectKnowledge,
  onNext,
  onToggleKnowledge,
}) {
  const mergedSource = arr(knowledgeItems).length
    ? arr(knowledgeItems)
    : arr(knowledgePreview);

  const items = mergedSource
    .map((item, index) => normalizeKnowledgeItem(item, index))
    .filter((item) => item.id || item.title || item.value)
    .slice(0, 5);

  const warningList = arr(warnings).map((x) => s(x)).filter(Boolean);

  const categoryCounts = items.reduce((acc, item) => {
    const key = s(item.category || "general").toLowerCase() || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const categoryBadges = Object.entries(categoryCounts).slice(0, 4);

  const avgConfidence = items.length
    ? Math.round(
        (items.reduce((sum, item) => sum + n(item.confidence, 0), 0) /
          items.length) *
          100
      )
    : 0;

  return (
    <SetupStudioStageShell
      eyebrow="knowledge"
      title={
        <>
          Here’s what we found
          <br />
          worth remembering.
        </>
      }
      body="Bu hissədə sistemin source-lardan çıxardığı faydalı biliklər görünür. Lazımlı olanları saxlayır, səs-küyü isə içəri buraxmırıq."
    >
      <div className="mx-auto max-w-[1080px]">
        {(sourceLabel || warningList.length || items.length) ? (
          <div className="mb-6 grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,.05)]">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  <FileSearch className="h-3.5 w-3.5" />
                  intake preview
                </span>

                {sourceLabel ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                    {sourceLabel}
                  </span>
                ) : null}

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                  {items.length} visible items
                </span>
              </div>

              <div className="text-sm leading-6 text-slate-600">
                Sistem source-dan çıxan knowledge elementlərini review üçün hazırlayıb.
                Bunlar approve/reject edilə və ya full intake içində daha detallı baxıla bilər.
              </div>

              {categoryBadges.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categoryBadges.map(([key, count]) => (
                    <span
                      key={key}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {groupLabel(key)} · {count}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_14px_40px_rgba(15,23,42,.05)]">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Signal quality
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Preview
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

              {warningList.length ? (
                <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{warningList[0]}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {items.length ? (
          <div className="space-y-1 rounded-[28px] border border-slate-200/80 bg-white/72 p-2 shadow-[0_16px_50px_rgba(15,23,42,.05)] backdrop-blur-xl">
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
          <div className="rounded-[28px] border border-slate-200/80 bg-white/75 px-6 py-8 text-center shadow-[0_16px_50px_rgba(15,23,42,.05)] backdrop-blur-xl">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
              <BadgeCheck className="h-5 w-5" />
            </div>

            <div className="mt-4 text-base font-semibold text-slate-900">
              Review üçün hazır knowledge tapılmadı
            </div>

            <div className="mt-2 text-sm leading-6 text-slate-500">
              Pending knowledge görünmür. Full intake-a baxa və ya növbəti mərhələyə keçə bilərsən.
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <GhostButton onClick={onNext} icon={ChevronRight} active>
            Continue
          </GhostButton>

          <GhostButton onClick={onToggleKnowledge} icon={BadgeCheck}>
            Open full intake
          </GhostButton>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}