// src/components/ProposalList.jsx (FINAL — PREMIUM + ALWAYS SHOW DETAILS)
// ✅ Tabs: Draft (= pending + in_progress), Approved, Published, Rejected
// ✅ Does NOT depend on uiFormat.js (fixes "Proposal / empty details" issue)
// ✅ Reads details from p.payload / p.proposal / drafts / executions (best-effort)
// ✅ Shows title + caption snippet + tags count reliably

import Card from "./ui/Card.jsx";
import Input from "./ui/Input.jsx";
import Badge from "./ui/Badge.jsx";
import { Tabs } from "./ui/Tabs.jsx";

function safeText(x) {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    if (typeof x.text === "string") return x.text;
    if (typeof x.value === "string") return x.value;
  }
  return "";
}

function safeJson(x) {
  try {
    if (!x) return null;
    if (typeof x === "string") return JSON.parse(x);
    if (typeof x === "object") return x;
    return null;
  } catch {
    return null;
  }
}

function pickPayloadObj(p) {
  // try common shapes from backend
  const raw =
    p?.payload ??
    p?.proposal ??
    p?.data ??
    p?.content ??
    p?.draft ??
    p?.latestDraft ??
    p?.latest_draft ??
    null;

  const obj = safeJson(raw) || raw;
  if (!obj || typeof obj !== "object") return null;

  // many backends wrap as {type,title,payload}
  if (obj.payload && typeof obj.payload === "object") return obj.payload;

  return obj;
}

function pickDraftPackFromAnything(p) {
  // best-effort: look for content pack inside latestDraft/latest_execution/job result
  const sources = [
    p?.latestDraft,
    p?.latest_draft,
    p?.draft,
    p?.contentDraft,
    p?.latest_execution,
    p?.lastExecution,
    p?.latestExecution,
    p?.execution,
    p?.job,
    p?.jobs?.[0],
  ].filter(Boolean);

  for (const src of sources) {
    const dj = safeJson(src) || src;
    if (!dj) continue;

    const pack =
      dj?.content_pack ||
      dj?.contentPack ||
      dj?.result?.contentPack ||
      dj?.result?.content_pack ||
      dj?.output?.contentPack ||
      dj?.output?.content_pack ||
      dj?.pack ||
      dj?.payload ||
      null;

    const packObj = safeJson(pack) || pack;
    if (packObj && typeof packObj === "object") return packObj;
  }

  return null;
}

function normalizeHashtags(h) {
  if (!h) return [];
  if (Array.isArray(h)) return h.map(String).map((x) => x.trim()).filter(Boolean);
  if (typeof h === "string") {
    return h
      .split(/[\s,]+/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => (x.startsWith("#") ? x : `#${x}`));
  }
  return [];
}

function titleFrom(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const t =
      safeText(obj.title) ||
      safeText(obj.name) ||
      safeText(obj.topic) ||
      safeText(obj.summary) ||
      safeText(obj.goal);
    if (t) return t;
  }

  // fallback: caption head
  const cap = captionFrom(p);
  if (cap) return cap.slice(0, 80);

  return `Proposal #${String(p?.id || "").slice(0, 8)}`;
}

function captionFrom(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const c =
      safeText(obj.caption) ||
      safeText(obj.postCaption) ||
      safeText(obj.text) ||
      safeText(obj.description) ||
      "";
    if (c) return c;
  }

  const pack = pickDraftPackFromAnything(p);
  if (pack) {
    const c = safeText(pack.caption) || safeText(pack.postCaption) || safeText(pack.text) || "";
    if (c) return c;
  }

  // final fallback: maybe stored as raw string
  if (typeof p?.payload === "string" && p.payload.trim().length > 10) return p.payload.trim();
  return "";
}

function tagsFrom(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const h = normalizeHashtags(obj.hashtags || obj.tags || obj.hashTags);
    if (h.length) return h;
  }

  const pack = pickDraftPackFromAnything(p);
  if (pack) {
    const h = normalizeHashtags(pack.hashtags || pack.tags || pack.hashTags);
    if (h.length) return h;
  }

  return [];
}

function clip(s, n) {
  const t = String(s || "").trim();
  if (!t) return "";
  return t.length <= n ? t : t.slice(0, n - 1).trimEnd() + "…";
}

function relTime(iso) {
  const ms = iso ? Date.parse(iso) : NaN;
  if (!Number.isFinite(ms)) return "";
  const d = Date.now() - ms;
  const m = Math.round(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return `${days}d ago`;
}

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
    const t = String(titleFrom(p) || "").toLowerCase();
    const c = String(captionFrom(p) || "").toLowerCase();
    const id = String(p?.id || "").toLowerCase();
    const agent = String(p?.agent_key || p?.agentKey || p?.agent || "").toLowerCase();
    return !q || t.includes(q) || c.includes(q) || id.includes(q) || agent.includes(q);
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
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search proposals…"
            />
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

              const stage = stageOf(p);
              const stageTxt = stageLabel(p);

              const t = titleFrom(p);
              const cap = captionFrom(p);
              const tags = tagsFrom(p);

              const capPreview = clip(cap, 120);
              const hCount = tags.length;

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
                            <span className="line-clamp-2 break-words">{t}</span>
                          </div>

                          {capPreview ? (
                            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {capPreview}
                            </div>
                          ) : (
                            <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              Draft (caption yoxdur)
                            </div>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>
                              {agent}
                              {when ? ` · ${when}` : ""}
                            </span>

                            <Badge tone={stageTone(stage, p.status)} className="shrink-0">
                              {stage === "draft" ? "Draft" : stage}
                            </Badge>

                            {stageTxt ? (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                {stageTxt}
                              </span>
                            ) : null}
                          </div>

                          {/* Quick meta */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              #{hCount} tags
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-2">
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