// src/components/ProposalList.jsx (FINAL — PREMIUM + PENDING MERGED INTO DRAFT)
// ✅ Tabs: Draft (= pending + in_progress), Approved, Published, Rejected
// ✅ List item shows stage badge: draft (pending/in_progress) with sublabel
// ✅ Shows quick draft preview if available (type + caption preview + hashtag count)

import Card from "./ui/Card.jsx";
import Input from "./ui/Input.jsx";
import Badge from "./ui/Badge.jsx";
import { Tabs } from "./ui/Tabs.jsx";
import { relTime, titleOf, summaryOf, safeText, parsePayload } from "../lib/uiFormat.js";

function stageOf(p) {
  const s = String(p?.status || "").toLowerCase();
  if (s === "pending" || s === "in_progress") return "draft";
  if (s === "approved") return "approved";
  if (s === "published") return "published";
  if (s === "rejected") return "rejected";
  return "draft";
}

function stageTone(stage, rawStatus) {
  const st = String(stage || "").toLowerCase();
  const rs = String(rawStatus || "").toLowerCase();
  if (st === "draft") return rs === "pending" ? "warn" : "neutral";
  if (st === "approved") return "success";
  if (st === "published") return "success";
  if (st === "rejected") return "danger";
  return "neutral";
}

function stageLabel(p) {
  const s = String(p?.status || "").toLowerCase();
  if (s === "pending") return "needs approval";
  if (s === "in_progress") return "drafting";
  if (s === "approved") return "approved";
  if (s === "published") return "published";
  if (s === "rejected") return "rejected";
  return "";
}

function safeJson(x) {
  try {
    if (!x) return null;
    if (typeof x === "string") return JSON.parse(x);
    return x;
  } catch {
    return null;
  }
}

function pickDraftPack(p) {
  // best-effort, frontend-only (backend untouched)
  const d =
    p?.latestDraft ||
    p?.draft ||
    p?.contentDraft ||
    p?.latest_execution ||
    p?.lastExecution ||
    null;

  const dj = typeof d === "string" ? safeJson(d) : d;
  if (!dj) return null;

  const pack =
    dj.content_pack ||
    dj.contentPack ||
    dj.result?.contentPack ||
    dj.result?.content_pack ||
    dj.output?.contentPack ||
    dj.output?.content_pack ||
    dj.pack ||
    dj.payload ||
    null;

  return typeof pack === "string" ? safeJson(pack) : pack;
}

function packType(pack) {
  if (!pack) return "";
  return pack.type || pack.postType || pack.format || pack.assetType || "";
}
function packCaption(pack) {
  if (!pack) return "";
  return pack.caption || pack.postCaption || pack.text || "";
}
function packHashtags(pack) {
  if (!pack) return [];
  const h = pack.hashtags || pack.tags || pack.hashTags || [];
  if (Array.isArray(h)) return h.filter(Boolean);
  if (typeof h === "string") {
    return h
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ProposalList({
  proposals,
  selectedId,
  onSelect,
  status,
  setStatus,
  search,
  setSearch,
  stats,
}) {
  const DEV = import.meta.env.DEV;

  const tabs = [
    { value: "draft", label: "Draft" },
    { value: "approved", label: "Approved" },
    { value: "published", label: "Published" },
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

  const tabCount =
    status === "draft"
      ? (stats?.draft ?? filtered.length)
      : status === "approved"
      ? (stats?.approved ?? filtered.length)
      : status === "published"
      ? (stats?.published ?? filtered.length)
      : status === "rejected"
      ? (stats?.rejected ?? filtered.length)
      : filtered.length;

  return (
    <Card className="min-w-0 p-0 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold tracking-tight">Queue</div>
              <span
                className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                aria-hidden="true"
              />
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Draft → Approve draft → Publish
            </div>
          </div>

          <Badge tone="neutral" className="shrink-0">
            {tabCount}
          </Badge>
        </div>

        {/* Tabs + Search */}
        <div className="mt-3 flex flex-col gap-2 min-w-0">
          <Tabs value={status} onChange={setStatus} items={tabs} />
          <div className="w-full">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search proposals…" />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 p-3 overflow-auto">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
            <div className="font-semibold text-slate-800 dark:text-slate-100">No items</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cron/agent draft yaradanda burada görünəcək.
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

              const stage = stageOf(p);
              const stageTxt = stageLabel(p);

              // quick draft preview (if available)
              const pack = pickDraftPack(p);
              const packT = safeText(packType(pack), 28);
              const capPreview = safeText(packCaption(pack), 110);
              const hCount = packHashtags(pack).length || 0;

              const itemCls = [
                "group w-full text-left min-w-0",
                "rounded-2xl border p-3 transition-all duration-200",
                "bg-white border-slate-200",
                "hover:bg-slate-50 hover:shadow-sm",
                "active:scale-[0.995] active:shadow-none",
                "dark:bg-slate-900/40 dark:border-slate-800",
                "dark:hover:bg-slate-900/65",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2",
                "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                isSel ? "border-indigo-200 bg-indigo-50/70 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/12" : "",
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
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{summary}</div>
                          ) : null}

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {agent} · {when}
                            </span>

                            <Badge tone={stageTone(stage, p.status)} className="shrink-0">
                              {stage === "draft" ? "Draft" : stage}
                            </Badge>

                            {stageTxt ? (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">{stageTxt}</span>
                            ) : null}
                          </div>

                          {/* ✅ Draft quick preview */}
                          {pack ? (
                            <div className="mt-2 rounded-xl border border-slate-200 bg-white/70 p-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-200">
                              <div className="flex flex-wrap items-center gap-2">
                                {packT ? (
                                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] dark:border-slate-800 dark:bg-slate-900/60">
                                    {packT}
                                  </span>
                                ) : null}
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">#{hCount} tags</span>
                              </div>
                              {capPreview ? (
                                <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                                  {capPreview}
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
                          {/* keep showing backend raw status in small badge if you want */}
                          {/* <Badge tone="neutral">{p.status || "-"}</Badge> */}
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to open →
                          </div>
                        </div>
                      </div>

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