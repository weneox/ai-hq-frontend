import { Check, ExternalLink, X } from "lucide-react";
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
  const raw = item.confidenceLabel || item.confidence || "";
  const text = s(raw);

  if (!text) return "";

  if (text === "1") return "high";
  if (text === "0") return "";

  return text;
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
    <div className="rounded-[26px] border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {s(item.index) ? <TinyChip>{s(item.index)}</TinyChip> : null}
            {s(item.category) ? <TinyChip>{s(item.category)}</TinyChip> : null}
            {confidence ? <TinyChip>{confidence}</TinyChip> : null}
            {s(item.source) ? <TinyChip>{s(item.source)}</TinyChip> : null}
          </div>

          <div className="mt-4 text-[20px] font-semibold leading-[1.15] tracking-[-0.03em] text-slate-950">
            {s(item.title) || "Untitled item"}
          </div>

          <div className="mt-2 text-sm leading-7 text-slate-600">
            {s(item.value) || "Preview yoxdur."}
          </div>

          {evidenceUrl ? (
            <a
              href={evidenceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              <ExternalLink className="h-4 w-4" />
              Open evidence
            </a>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onApprove}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {busy ? "Saving..." : "Approve"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onReject}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}