function s(v, d = "") {
  return String(v ?? d).trim();
}

export default function TruthHistoryPanel({ history = [] }) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white/80 px-5 py-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        History
      </div>
      <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
        Approval history
      </div>

      {Array.isArray(history) && history.length ? (
        <div className="mt-4 space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="border-t border-slate-200/70 pt-3 first:border-t-0 first:pt-0"
            >
              <div className="text-sm font-medium text-slate-800">
                {s(item.version) || "Recorded version"}
              </div>
              <div className="mt-1 text-sm leading-6 text-slate-600">
                {[s(item.approvedAt), s(item.approvedBy)].filter(Boolean).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-sm leading-6 text-slate-600">
          The backend did not return approval history for this truth snapshot.
        </div>
      )}
    </section>
  );
}
