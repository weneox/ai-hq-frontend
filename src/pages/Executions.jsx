import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import { listExecutions } from "../api/executions.js";

const STATUS = ["", "queued", "running", "completed", "failed"];

export default function Executions() {
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (status ? `Executions — ${status}` : "Executions"), [status]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await listExecutions({ status, limit: 50 });
      setItems(rows);
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          <select
            className="text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS.map((s) => (
              <option key={s || "all"} value={s}>
                {s || "all"}
              </option>
            ))}
          </select>
          <button
            onClick={load}
            className="text-sm rounded-md px-3 py-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {err ? (
        <div className="mt-3 text-sm text-red-600">{err}</div>
      ) : loading ? (
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading…</div>
      ) : items.length === 0 ? (
        <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">No executions yet.</div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((x) => (
            <div
              key={x.id}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-950/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium">
                  {x.type || "job"} <span className="text-slate-400">•</span>{" "}
                  <span className="text-slate-600 dark:text-slate-300">{String(x.id).slice(0, 8)}</span>
                </div>
                <div className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800">
                  {x.status}
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                created: {x.created_at || "-"}
                {x.finished_at ? ` • finished: ${x.finished_at}` : ""}
              </div>

              {x.error ? <div className="mt-2 text-xs text-red-600">{String(x.error)}</div> : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}