import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, LoaderCircle } from "lucide-react";

import { listExecutions, getExecution } from "../api/executions.js";

import ExecutionCommandBar from "../components/executions/ExecutionCommandBar.jsx";
import ExecutionPanorama from "../components/executions/ExecutionPanorama.jsx";
import ExecutionHero from "../components/executions/ExecutionHero.jsx";
import ExecutionRiver from "../components/executions/ExecutionRiver.jsx";
import ExecutionInspector from "../components/executions/ExecutionInspector.jsx";

import { formatDate } from "../components/executions/execution-ui.jsx";

export default function Executions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailErr, setDetailErr] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [tab, setTab] = useState("overview");

  async function loadAll() {
    setLoading(true);
    setErr("");

    try {
      const rows = await listExecutions({ status: "", limit: 120 });
      const safeRows = Array.isArray(rows) ? rows : [];

      setItems(safeRows);
      setLastUpdated(formatDate(new Date().toISOString()));

      if (selectedId && !safeRows.some((r) => String(r.id) === String(selectedId))) {
        setSelectedId("");
        setDetail(null);
        setDetailErr("");
        setInspectorOpen(false);
      }
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function openExecution(id) {
    if (!id) return;

    setSelectedId(String(id));
    setInspectorOpen(true);
    setTab("overview");
    setDetailErr("");
    setDetailLoading(true);

    try {
      const row = await getExecution(id);
      setDetail(row && typeof row === "object" ? row : null);
    } catch (e) {
      const message = String(e?.message || e);
      setDetailErr(message);
      setDetail({
        id: String(id),
        type: "execution.lookup",
        status: "failed",
        created_at: "",
        finished_at: "",
        proposal_id: "",
        error: message,
        input: null,
        output: null,
      });
      setTab("error");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeInspector() {
    setInspectorOpen(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const counts = useMemo(() => {
    const c = {
      all: items.length,
      running: 0,
      queued: 0,
      completed: 0,
      failed: 0,
    };

    items.forEach((x) => {
      const s = String(x.status || "").toLowerCase();
      if (c[s] != null) c[s] += 1;
    });

    return c;
  }, [items]);

  const visibleItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((x) => String(x.status || "").toLowerCase() === filter);
  }, [items, filter]);

  const featuredExecution = useMemo(() => {
    return (
      items.find((x) => String(x.status || "").toLowerCase() === "running") ||
      items.find((x) => String(x.status || "").toLowerCase() === "queued") ||
      items[0] ||
      null
    );
  }, [items]);

  return (
    <div className="relative min-w-0 space-y-5">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(56,189,248,0.08),transparent_34%),radial-gradient(700px_circle_at_100%_0%,rgba(168,85,247,0.08),transparent_36%)]" />

      <ExecutionCommandBar
        total={counts.all}
        running={counts.running}
        failed={counts.failed}
        lastUpdated={lastUpdated}
        loading={loading}
        onRefresh={loadAll}
      />

      <ExecutionPanorama
        counts={counts}
        filter={filter}
        setFilter={setFilter}
      />

      {err ? (
        <div className="rounded-[28px] border border-rose-400/16 bg-rose-400/[0.08] px-4 py-4 text-sm text-rose-100">
          {err}
        </div>
      ) : null}

      <ExecutionHero
        execution={featuredExecution}
        onOpen={openExecution}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/38">
              Execution river
            </div>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-white">
              {filter === "all" ? "All operational runs" : `${filter} runs`}
            </h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60">
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Updating surface
              </>
            ) : counts.failed > 0 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-rose-300" />
                Incident-aware surface
              </>
            ) : counts.running > 0 ? (
              <>
                <Activity className="h-4 w-4 text-cyan-300" />
                Live activity detected
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                System calm
              </>
            )}
          </div>
        </div>

        <ExecutionRiver
          items={visibleItems}
          selectedId={selectedId}
          onOpen={openExecution}
        />
      </section>

      <ExecutionInspector
        open={inspectorOpen}
        detail={detail}
        detailErr={detailErr}
        loading={detailLoading}
        tab={tab}
        setTab={setTab}
        onClose={closeInspector}
      />
    </div>
  );
}