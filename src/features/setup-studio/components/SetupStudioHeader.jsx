import { RefreshCcw, Sparkles } from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";

export default function SetupStudioHeader({
  tone,
  refreshing,
  onRefresh,
  statusLabel,
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <TinyLabel>
        <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
        AI Setup Studio
      </TinyLabel>

      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${tone.chip}`}>
          <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
          {statusLabel}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/82 px-4 py-2.5 text-sm text-slate-600"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}