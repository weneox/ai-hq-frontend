import { ExternalLink } from "lucide-react";
import { TinyChip } from "./SetupStudioUi.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function normalizeEvidenceUrl(item = {}) {
  const evidence = arr(item.evidence);
  const first = evidence[0] || {};

  return s(
    item.evidenceUrl ||
      first.pageUrl ||
      first.url ||
      first.source_url ||
      first.link
  );
}

function normalizeConfidence(item = {}) {
  return s(item.confidenceLabel || item.confidence || "");
}

export default function SetupStudioKnowledgeLine({
  item,
  busy,
  onApprove,
  onReject,
}) {
  const evidenceUrl = normalizeEvidenceUrl(item);
  const confidence = normalizeConfidence(item);

  return (
    <div className="grid gap-4 border-t border-slate-900/8 py-4 md:grid-cols-[28px_minmax(0,1fr)_auto] md:items-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
        {s(item.index)}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          {s(item.category) ? <TinyChip>{s(item.category)}</TinyChip> : null}
          {confidence ? <TinyChip>{confidence}</TinyChip> : null}
          {s(item.source) ? <TinyChip>{s(item.source)}</TinyChip> : null}
        </div>

        <div className="mt-3 text-lg font-semibold tracking-[-0.04em] text-slate-950">
          {s(item.title) || "Untitled item"}
        </div>

        <div className="mt-1 text-sm leading-7 text-slate-600">
          {s(item.value) || "Preview yoxdur."}
        </div>

        {evidenceUrl ? (
          <a
            href={evidenceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open evidence
          </a>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onApprove}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "..." : "Approve"}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={onReject}
          className="inline-flex items-center justify-center rounded-full border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  );
}