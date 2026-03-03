import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";

import { listExecutions, getExecution } from "../api/executions.js";

function safeJson(x) {
  try {
    if (x == null) return null;
    if (typeof x === "string") return JSON.parse(x);
    return x;
  } catch {
    return null;
  }
}

function pickContentPack(exec) {
  // mümkün yerlər:
  // - exec.result.contentPackText (biz n8n meta callback-də belə göndərdik)
  // - exec.output / exec.result.output
  // - exec.input.proposal.payload (backend screenshot-da payload içində idi)
  const job = exec?.job || exec;

  const a = job?.result?.contentPackText ?? job?.output?.contentPackText ?? null;
  const b = job?.result ?? job?.output ?? null;
  const c = job?.input?.proposal?.payload ?? job?.input?.payload ?? null;

  // 1) contentPackText JSON string ola bilər
  const aJson = safeJson(a);
  if (aJson) return aJson;

  // 2) payload artıq object ola bilər
  if (c && typeof c === "object") return c;

  // 3) result/output object ola bilər
  if (b && typeof b === "object") return b;

  // 4) string kimi qaytar
  if (typeof a === "string" && a.trim()) return a;

  return null;
}

function statusPill(s) {
  const v = String(s || "").toLowerCase();
  if (v === "completed" || v === "done" || v === "success") return { label: "completed", tone: "ok" };
  if (v === "running" || v === "in_progress" || v === "pending") return { label: "running", tone: "warn" };
  if (v === "failed" || v === "error") return { label: "failed", tone: "bad" };
  return { label: s || "unknown", tone: "muted" };
}

function fmtTs(x) {
  if (!x) return "";
  const d = new Date(x);
  if (Number.isNaN(d.getTime())) return String(x);
  return d.toLocaleString();
}

function copyText(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch {}
}

export default function Executions() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function refresh() {
    setErr("");
    setLoading(true);
    try {
      const list = await listExecutions();
      setItems(list);
      if (!selectedId && list?.[0]?.id) setSelectedId(list[0].id);
    } catch (e) {
      setErr(e?.message || "Failed to load executions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadOne() {
      if (!selectedId) return;
      setDetailLoading(true);
      try {
        const one = await getExecution(selectedId);
        if (alive) setSelected(one);
      } catch (e) {
        if (alive) setSelected({ error: e?.message || "Failed to load execution" });
      } finally {
        if (alive) setDetailLoading(false);
      }
    }
    loadOne();
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
  }, [items, q]);

  const contentPack = useMemo(() => pickContentPack(selected), [selected]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT: list */}
      <Card className="p-4 lg:col-span-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Executions</div>
          <Button onClick={refresh} disabled={loading} className="text-sm">
            Refresh
          </Button>
        </div>

        <div className="mt-3 flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search… (jobId, proposalId, status)"
            className="w-full"
          />
        </div>

        {err ? (
          <div className="mt-3 text-sm text-red-600">{err}</div>
        ) : null}

        {loading ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading…</div>
        ) : (
          <div className="mt-3 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-sm text-slate-600 dark:text-slate-300">No executions.</div>
            ) : (
              filtered.map((x) => {
                const id = x?.id || x?.jobId || "";
                const st = statusPill(x?.status);
                const isActive = String(id) === String(selectedId);
                return (
                  <button
                    key={id || Math.random()}
                    onClick={() => setSelectedId(id)}
                    className={[
                      "w-full text-left rounded-xl border p-3 transition",
                      "bg-white/50 dark:bg-slate-900/30",
                      isActive
                        ? "border-slate-400 dark:border-slate-600"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">{id || "(no id)"}</div>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 truncate">
                      proposal: {x?.proposal_id || x?.proposalId || x?.proposal?.id || "-"}
                    </div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {fmtTs(x?.created_at || x?.createdAt || x?.updated_at || x?.updatedAt)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* RIGHT: detail */}
      <Card className="p-4 lg:col-span-7">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">Execution Detail</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => copyText(JSON.stringify(selected ?? {}, null, 2))}
              className="text-sm"
              disabled={!selected}
            >
              Copy JSON
            </Button>
          </div>
        </div>

        {detailLoading ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">Loading detail…</div>
        ) : !selected ? (
          <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">Select an execution.</div>
        ) : selected?.error ? (
          <div className="mt-4 text-sm text-red-600">{selected.error}</div>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">Job ID</div>
                <div className="mt-1 text-sm font-medium break-all">
                  {selected?.id || selected?.job?.id || selected?.jobId || "-"}
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">Proposal ID</div>
                <div className="mt-1 text-sm font-medium break-all">
                  {selected?.proposal_id || selected?.job?.proposal_id || selected?.proposalId || "-"}
                </div>
              </Card>
            </div>

            <div className="mt-4">
              <div className="text-sm font-semibold">Content Pack</div>

              {!contentPack ? (
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  No content pack found in this execution.
                </div>
              ) : typeof contentPack === "string" ? (
                <Card className="mt-2 p-3">
                  <pre className="text-xs whitespace-pre-wrap break-words">{contentPack}</pre>
                </Card>
              ) : (
                <ContentPackView pack={contentPack} />
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function ContentPackView({ pack }) {
  const title = pack?.title || pack?.name || "Content Pack";
  const kpis = Array.isArray(pack?.kpis) ? pack.kpis : [];
  const steps = Array.isArray(pack?.steps) ? pack.steps : [];
  const days = steps
    .filter((s) => typeof s?.day === "number" && Array.isArray(s?.tasks))
    .sort((a, b) => a.day - b.day);

  return (
    <div className="mt-2 space-y-3">
      <Card className="p-3">
        <div className="text-sm font-semibold">{title}</div>

        {kpis.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {kpis.map((x, i) => (
              <Badge key={i} tone="muted">
                {String(x)}
              </Badge>
            ))}
          </div>
        ) : null}
      </Card>

      {days.length ? (
        <div className="space-y-2">
          {days.map((d) => (
            <Card key={d.day} className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Day {d.day}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{d.tasks.length} task</div>
              </div>
              <ul className="mt-2 space-y-1">
                {d.tasks.map((t, idx) => (
                  <li key={idx} className="text-sm text-slate-700 dark:text-slate-200">
                    • {String(t)}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">Raw JSON</div>
          <pre className="mt-2 text-xs whitespace-pre-wrap break-words">{JSON.stringify(pack, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}