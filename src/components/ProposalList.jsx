// src/components/ProposalList.jsx (PREMIUM)
// ✅ Segmented tabs (Pending/Drafting/Approved/Rejected)
// ✅ Premium list item: hover lift + selected ring + press scale
// ✅ Shows Draft badge + draft status chip (ready/approved/published/changes/failed)

import Card from "./ui/Card.jsx";
import Input from "./ui/Input.jsx";
import Badge from "./ui/Badge.jsx";
import { Tabs } from "./ui/Tabs.jsx";
import { relTime, titleOf, summaryOf, safeText } from "../lib/uiFormat.js";

function badgeTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "warn";
  if (s === "in_progress") return "neutral";
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "neutral";
}

function draftTone(draftStatus) {
  const s = String(draftStatus || "").toLowerCase();
  if (s.includes("published")) return "success";
  if (s.includes("approved")) return "success";
  if (s.includes("ready")) return "success";
  if (s.includes("change") || s.includes("regen")) return "warn";
  if (s.includes("fail") || s.includes("error")) return "danger";
  return "neutral";
}

function draftLabel(draftStatus) {
  const s = String(draftStatus || "").toLowerCase();
  if (!s) return "";
  if (s.includes("published")) return "published";
  if (s.includes("approved")) return "approved";
  if (s.includes("ready")) return "ready";
  if (s.includes("change")) return "changes";
  if (s.includes("regen")) return "regen";
  if (s.includes("fail") || s.includes("error")) return "failed";
  return "draft";
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
    { value: "in_progress", label: "Drafting" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const q = (search || "").trim().toLowerCase();
  const filtered = (proposals || []).filter((p) => {
    const t = String(titleOf(p) || "").toLowerCase();
    const s = String(summaryOf(p) || "").toLowerCase();
    const id = String(p?.id || "").toLowerCase();
    const agent = String(p?.agent_key || p?.agentKey || p?.agent || "").toLowerCase();
    return !q || t.includes(q) || s.includes(q) || id.includes(q) || agent.includes(q);
  });

  return (
    <Card className="min-w-0 p-0 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold tracking-tight">Proposals</div>
              <span
                className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                aria-hidden="true"
              />
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pending → Approve → Drafting → Approve draft → Publish
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
            <div className="hidden md:block w-[260px]">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search proposals…"
              />
            </div>
          </div>

          <div className="md:hidden">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 p-3 overflow-auto">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">No proposals</div>
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
              const summary = safeText(summaryOf(p), 96);

              const draftStatus =
                p?.latestDraft?.status ||
                p?.draft?.status ||
                p?.contentDraft?.status ||
                "";

              const itemCls = [
                "group w-full text-left min-w-0",
                "rounded-2xl border p-3 transition-all duration-200",
                // base
                "bg-white border-slate-200",
                "hover:bg-slate-50 hover:shadow-sm",
                "active:scale-[0.995] active:shadow-none",
                // dark
                "dark:bg-slate-900/40 dark:border-slate-800",
                "dark:hover:bg-slate-900/65",
                // focus
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                // selected
                isSel
                  ? "border-indigo-200 bg-indigo-50/70 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/12"
                  : "",
                isSel ? "translate-y-[-1px]" : "hover:translate-y-[-1px]",
              ].join(" ");

              return (
                <button key={p.id} onClick={() => onSelect(String(p.id))} className={itemCls}>
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Accent bar */}
                    <div
                      className={[
                        "mt-1 h-10 w-1 rounded-full shrink-0 transition-opacity",
                        isSel
                          ? "bg-gradient-to-b from-indigo-500/75 via-cyan-400/65 to-emerald-400/65"
                          : "bg-slate-200/70 dark:bg-slate-800/70 group-hover:opacity-90",
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

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {agent} · {when}
                            </span>

                            {draftStatus ? (
                              <>
                                <Badge tone={draftTone(draftStatus)} className="shrink-0">
                                  Draft
                                </Badge>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {draftLabel(draftStatus)}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          <Badge tone={badgeTone(p.status)}>{p.status || status}</Badge>

                          {/* subtle hint on hover */}
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to open →
                          </div>
                        </div>
                      </div>

                      {/* Selected glow */}
                      {isSel ? (
                        <div className="mt-3 h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/25 to-indigo-500/0" />
                      ) : null}
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