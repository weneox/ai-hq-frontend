import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { listExecutions, getExecution } from "../api/executions.js";

const STATUS = ["", "queued", "running", "completed", "failed"];

function toneForStatus(s) {
  const x = String(s || "").toLowerCase();
  if (x === "completed") return "success";
  if (x === "running" || x === "queued") return "neutral";
  if (x === "failed") return "danger";
  return "neutral";
}

function pretty(v) {
  try {
    if (v == null) return "";
    if (typeof v === "string") {
      // if looks like JSON, pretty it
      const t = v.trim();
      if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
        return JSON.stringify(JSON.parse(t), null, 2);
      }
      return v;
    }
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v ?? "");
  }
}

export default function Executions() {
  const [status, setStatus] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // detail panel
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailErr, setDetailErr] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  const title = useMemo(() => (status ? `Executions — ${status}` : "Executions"), [status]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const rows = await listExecutions({ status, limit: 80 });
      setItems(Array.isArray(rows) ? rows : []);
      // keep selected if still exists
      if (selectedId && Array.isArray(rows) && rows.some((r) => String(r.id) === String(selectedId))) {
        // ok
      } else {
        setSelectedId("");
        setDetail(null);
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id) {
    if (!id) return;
    setDetailLoading(true);
    setDetailErr("");
    try {
      const ex = await getExecution(id);
      setDetail(ex || null);
    } catch (e) {
      setDetailErr(String(e?.message || e));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    // when selected changes, fetch detail
    if (!selectedId) {
      setDetail(null);
      setDetailErr("");
      return;
    }
    loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const copy = async (t) => {
    try {
      await navigator.clipboard.writeText(String(t ?? ""));
    } catch {}
  };

  const closeDetail = () => {
    setSelectedId("");
    setDetail(null);
    setDetailErr("");
  };

  return (
    <div className="min-w-0 min-h-0 grid gap-5 grid-cols-1 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      {/* LEFT: list */}
      <Card className="p-4 min-w-0 min-h-0 overflow-hidden flex flex-col">
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

            <Button variant="outline" size="sm" onClick={load}>
              Refresh
            </Button>
          </div>
        </div>

        {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}
        {loading ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">No executions yet.</div>
        ) : (
          <div className="mt-3 min-h-0 overflow-auto space-y-2 pr-1">
            {items.map((x) => {
              const isSel = String(x.id) === String(selectedId);
              const idShort = String(x.id).slice(0, 8);
              return (
                <button
                  key={x.id}
                  onClick={() => setSelectedId(String(x.id))}
                  className={[
                    "w-full text-left rounded-2xl border p-3 transition-all duration-200 min-w-0",
                    "bg-white/60 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800",
                    "hover:bg-slate-50 dark:hover:bg-slate-900/50",
                    isSel ? "border-indigo-200 bg-indigo-50/60 dark:border-indigo-500/25 dark:bg-indigo-500/10" : "",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="text-sm font-medium min-w-0">
                      <span className="truncate">
                        {x.type || "job"} <span className="text-slate-400">•</span>{" "}
                        <span className="text-slate-600 dark:text-slate-300">{idShort}</span>
                      </span>
                    </div>

                    <Badge tone={toneForStatus(x.status)} className="shrink-0">
                      {x.status}
                    </Badge>
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    created: {x.created_at || "-"}
                    {x.finished_at ? ` • finished: ${x.finished_at}` : ""}
                  </div>

                  {x.error ? <div className="mt-2 text-xs text-red-600">{String(x.error)}</div> : null}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* RIGHT: detail */}
      <Card className="p-0 min-w-0 min-h-0 overflow-hidden flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Execution detail</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Click soldakı item → burada input/output görünəcək.
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedId ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => loadDetail(selectedId)} disabled={detailLoading}>
                    Refresh detail
                  </Button>
                  <Button variant="outline" size="sm" onClick={closeDetail}>
                    Close
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-auto p-4 space-y-3">
          {!selectedId ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              Execution seçilməyib.
            </div>
          ) : detailErr ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {detailErr}
            </div>
          ) : detailLoading ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">Loading detail…</div>
          ) : !detail ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">No detail.</div>
          ) : (
            <>
              {/* header row */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{detail.type || "job"}</Badge>
                <Badge tone={toneForStatus(detail.status)}>{detail.status}</Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">ID:</span>
                <span className="text-xs font-mono text-slate-700 dark:text-slate-200 break-all">
                  {detail.id}
                </span>
                <Button variant="outline" size="sm" onClick={() => copy(detail.id)}>
                  Copy
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">created_at</div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 break-words">
                    {detail.created_at || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">finished_at</div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 break-words">
                    {detail.finished_at || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">proposal_id</div>
                  <div className="mt-1 text-sm font-mono text-slate-900 dark:text-slate-100 break-all">
                    {detail.proposal_id || "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">error</div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 break-words">
                    {detail.error ? String(detail.error) : "—"}
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Input</div>
                  <Button variant="outline" size="sm" onClick={() => copy(pretty(detail.input))}>
                    Copy JSON
                  </Button>
                </div>
                <pre className="mt-2 max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs whitespace-pre-wrap break-words dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
                  {pretty(detail.input) || "—"}
                </pre>
              </div>

              {/* Output */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Output</div>
                  <Button variant="outline" size="sm" onClick={() => copy(pretty(detail.output))}>
                    Copy JSON
                  </Button>
                </div>
                <pre className="mt-2 max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs whitespace-pre-wrap break-words dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
                  {pretty(detail.output) || "—"}
                </pre>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}