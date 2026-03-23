import {
  AlertTriangle,
  ArrowRight,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";

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
  const value = typeof x.confidence === "number" ? x.confidence : Number(x.confidence || 0);

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
    id: s(x.id || x.candidateId || x.candidate_id || x.key || x.title || `knowledge-${index + 1}`),
    candidateId: s(x.candidateId || x.candidate_id || x.id || `knowledge-${index + 1}`),
    title: s(x.title || x.label || x.key || "Untitled item"),
    value: s(
      x.value ||
        x.valueText ||
        x.value_text ||
        x.normalizedText ||
        x.normalized_text ||
        x.description
    ),
    category: s(x.category || "general"),
    source: s(
      x.source ||
        x.sourceLabel ||
        x.source_label ||
        x.source_display_name ||
        x.sourceType ||
        x.source_type
    ),
    confidence: n(x.confidence, 0),
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

function ActionButton({ active = false, icon: Icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
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
    .slice(0, 6);

  const warningList = arr(warnings).map((x) => s(x)).filter(Boolean);

  const avgConfidence = items.length
    ? Math.round(
        (items.reduce((sum, item) => sum + n(item.confidence, 0), 0) / items.length) * 100
      )
    : 0;

  return (
    <SetupStudioStageShell
      eyebrow="knowledge"
      title="Keep only what should shape runtime."
      body="Approve the useful signals. Reject generic or noisy items. The goal is a clean business memory, not a long list."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              {sourceLabel ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {sourceLabel}
                </span>
              ) : null}

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {items.length} visible items
              </span>
            </div>

            <p className="mt-5 text-[15px] leading-7 text-slate-600">
              Review the strongest candidates only. Weak memory here will hurt
              downstream replies.
            </p>

            {warningList.length ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{humanizeWarning(warningList[0])}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Quality
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Preview
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  {items.length}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Avg confidence
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  {avgConfidence}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {items.length ? (
          <div className="space-y-3">
            {items.map((item) => {
              const busy = actingKnowledgeId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {groupLabel(item.category)}
                        </span>

                        {item.confidenceLabel ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.confidenceLabel}
                          </span>
                        ) : null}

                        {item.source ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.source}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
                        {item.title}
                      </div>

                      <div className="mt-2 text-sm leading-7 text-slate-600">
                        {item.value || "No detailed value found."}
                      </div>

                      {item.evidenceUrl ? (
                        <a
                          href={item.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-slate-950"
                        >
                          View evidence
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          onApproveKnowledge?.({
                            ...item,
                            id: item.id,
                            candidateId: item.candidateId || item.id,
                          })
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        {busy ? "Saving..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          onRejectKnowledge?.({
                            ...item,
                            id: item.id,
                            candidateId: item.candidateId || item.id,
                          })
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm leading-7 text-slate-500">
            No strong knowledge items are ready for review yet.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <ActionButton active icon={ArrowRight} onClick={onNext}>
            Continue
          </ActionButton>

          <ActionButton icon={ExternalLink} onClick={onToggleKnowledge}>
            Open full intake
          </ActionButton>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}