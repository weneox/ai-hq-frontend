// src/components/ProposalList.jsx
import Card from "./ui/Card.jsx";
import Input from "./ui/Input.jsx";
import Badge from "./ui/Badge.jsx";
import { Tabs } from "./ui/Tabs.jsx";
import { relTime, parsePayload, titleOf, summaryOf, safeText } from "../lib/uiFormat.js";

function badgeTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "warn";
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "neutral";
}

export default function ProposalList({
  proposals,
  selectedId,
  onSelect,
  status,
  setStatus,
  search,
  setSearch,
}) {
  const DEV = import.meta.env.DEV;

  const tabs = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const q = (search || "").trim().toLowerCase();
  const filtered = (proposals || []).filter((p) => {
    const t = titleOf(p).toLowerCase();
    const s = summaryOf(p).toLowerCase();
    return !q || t.includes(q) || s.includes(q);
  });

  return (
    <Card className="min-w-0 p-0 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">Queue</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Review → approve / reject (CEO-ready)
            </div>
          </div>

          <Badge tone="neutral" className="shrink-0">
            {filtered.length}
          </Badge>
        </div>

        <div className="mt-3 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <Tabs value={status} onChange={setStatus} items={tabs} />
            </div>
            <div className="hidden md:block w-[240px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
              />
            </div>
          </div>

          <div className="md:hidden">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="p-3 overflow-auto">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              No proposals yet
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Agentlər proposal yaradanda burada görünəcək.
            </div>

            {DEV ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 overflow-auto">
                POST /api/debate {"{ \"mode\": \"proposal\" }"}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => {
              const isSel = String(p.id) === String(selectedId);
              const agent = p.agent_key || p.agentKey || p.agent || "agent";
              const when = relTime(p.created_at || p.createdAt);
              const payload = parsePayload(p);
              const summary = safeText(summaryOf(p), 96);

              return (
                <button
                  key={p.id}
                  onClick={() => onSelect(String(p.id))}
                  className={[
                    "w-full text-left min-w-0",
                    "rounded-2xl border p-3 transition-all duration-200",
                    "bg-white border-slate-200 hover:bg-slate-50 hover:shadow-sm",
                    "dark:bg-slate-900/40 dark:border-slate-800 dark:hover:bg-slate-900/60",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                    isSel ? "border-indigo-200 bg-indigo-50/70 dark:border-indigo-500/25 dark:bg-indigo-500/10" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={[
                        "mt-1 h-10 w-1 rounded-full shrink-0",
                        isSel
                          ? "bg-gradient-to-b from-indigo-500/70 via-cyan-400/60 to-emerald-400/60"
                          : "bg-slate-200/70 dark:bg-slate-800/70",
                      ].join(" ")}
                      aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold leading-snug min-w-0">
                            <span className="line-clamp-2 break-words">{titleOf(p)}</span>
                          </div>

                          {summary ? (
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {summary}
                            </div>
                          ) : null}

                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                            {agent} · {when}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <Badge tone={badgeTone(p.status)}>{p.status || status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}