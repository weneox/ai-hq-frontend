import { TinyChip } from "./SetupStudioUi.jsx";

export default function SetupStudioKnowledgeLine({
  item,
  busy,
  onApprove,
  onReject,
}) {
  return (
    <div className="grid gap-4 border-t border-slate-900/8 py-4 md:grid-cols-[28px_minmax(0,1fr)_auto] md:items-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
        {item.index}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <TinyChip>{item.category}</TinyChip>
          {item.confidence ? <TinyChip>{item.confidence}</TinyChip> : null}
          <TinyChip>{item.source}</TinyChip>
        </div>

        <div className="mt-3 text-lg font-semibold tracking-[-0.04em] text-slate-950">
          {item.title}
        </div>

        <div className="mt-1 text-sm leading-7 text-slate-600">
          {item.value || "Preview yoxdur."}
        </div>
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