import {
  AlertTriangle,
  BadgeCheck,
  ChevronRight,
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

function humanizeWarning(value = "") {
  const x = s(value).toLowerCase();

  if (x === "http_403") return "This website blocked direct access.";
  if (x === "http_429") return "This website rate-limited the request.";
  if (x === "fetch_failed") return "The website could not be read.";
  if (x === "non_html_response") return "The source did not return a readable webpage.";
  if (x === "website_fetch_timeout") return "The website took too long to respond.";
  if (x === "website_entry_timeout") return "The first page took too long to load.";
  if (x === "sitemap_fetch_timeout") return "The sitemap timed out, but some draft data may still exist.";

  return s(value).replaceAll("_", " ");
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

  const highConfidenceCount = items.filter((item) => n(item.confidence, 0) >= 0.85).length;

  return (
    <SetupStudioStageShell
      eyebrow="build draft"
      title={
        <>
          Review what AI should
          <br />
          remember from the source.
        </>
      }
      body="This stage shows the knowledge signals worth keeping. Approve what should shape runtime behavior, reject the noise, and keep the business draft clean."
    >
      <div className="mx-auto max-w-[1120px] space-y-6">
        {(sourceLabel || warningList.length || items.length) ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_360px]">
            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/84 shadow-[0_20px_60px_rgba(15,23,42,.07)] backdrop-blur-xl">
              <div className="border-b border-slate-200/70 px-5 py-4.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
                    <FileSearch className="h-3.5 w-3.5" />
                    knowledge review
                  </span>

                  {sourceLabel ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      {sourceLabel}
                    </span>
                  ) : null}

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                    {items.length} visible item{items.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5">
                <div className="text-sm leading-7 text-slate-600">
                  The system prepared these knowledge candidates from the source.
                  Keep what should influence replies and review behavior, and leave
                  out anything weak, noisy, or overly generic.
                </div>

                {categoryBadges.length ? (
                  <div className="flex flex-wrap gap-2">
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

                {warningList.length ? (
                  <div className="flex items-start gap-3 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{humanizeWarning(warningList[0])}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/84 shadow-[0_20px_60px_rgba(15,23,42,.07)] backdrop-blur-xl">
              <div className="border-b border-slate-200/70 px-5 py-4.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Signal quality
                </div>
              </div>

              <div className="grid gap-3 px-5 py-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Preview
                    </div>
                    <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                      {items.length}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Avg confidence
                    </div>
                    <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                      {avgConfidence}%
                    </div>
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    High-confidence items
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                    {highConfidenceCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {items.length ? (
          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-5 py-4.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Candidate memory
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">
                    Approve useful knowledge and reject anything that should not enter runtime.
                  </div>
                </div>

                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  top {items.length}
                </div>
              </div>
            </div>

            <div className="space-y-1 p-2">
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
          </div>
        ) : (
          <div className="rounded-[30px] border border-white/70 bg-white/82 px-6 py-10 text-center shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm">
              <BadgeCheck className="h-5 w-5" />
            </div>

            <div className="mt-4 text-base font-semibold text-slate-900">
              No knowledge items are ready for review yet
            </div>

            <div className="mt-2 text-sm leading-6 text-slate-500">
              There is nothing meaningful to approve here right now. You can open the full intake or continue to the next stage.
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
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