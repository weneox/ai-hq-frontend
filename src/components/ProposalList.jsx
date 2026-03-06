// src/components/ProposalList.jsx (FINAL v1.3.0 — FIXED double filtering / parent-owned tab data)
// ✅ Parent artıq status-a görə data verir, burada ikinci dəfə stage filter YOXDUR
// ✅ Search yalnız görünən list üzərində işləyir
// ✅ Tabs qalır
// ✅ Scroll/layout qorunur
// ✅ Empty state stabil işləyir

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

  if (obj.payload && typeof obj.payload === "object") return obj.payload;
  return obj;
}

function pickDraftPackFromAnything(p) {
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
    p?.latestContent,
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

  if (typeof p?.payload === "string" && p.payload.trim().length > 10) return p.payload.trim();
  return "";
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

  const cap = captionFrom(p);
  if (cap) return cap.slice(0, 80);

  return `Proposal #${String(p?.id || "").slice(0, 8)}`;
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

function formatFrom(p) {
  const obj = pickPayloadObj(p);
  const pack = pickDraftPackFromAnything(p);

  const v =
    safeText(obj?.format) ||
    safeText(obj?.post_type) ||
    safeText(obj?.postType) ||
    safeText(pack?.format) ||
    safeText(pack?.post_type) ||
    safeText(pack?.postType) ||
    "";

  const s = String(v || "").toLowerCase();
  if (!s) return "";
  if (s.includes("reel") || s.includes("video")) return "Reel";
  if (s.includes("carousel")) return "Carousel";
  if (s.includes("story")) return "Story";
  if (s.includes("image") || s.includes("post")) return "Image";
  return v;
}

function ctaFrom(p) {
  const obj = pickPayloadObj(p);
  const pack = pickDraftPackFromAnything(p);
  return (
    safeText(obj?.cta) ||
    safeText(obj?.callToAction) ||
    safeText(pack?.cta) ||
    safeText(pack?.callToAction) ||
    ""
  );
}

function clip(s, n) {
  const t = String(s || "").trim();
  if (!t) return "";
  return t.length <= n ? t : `${t.slice(0, n - 1).trimEnd()}…`;
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

function rawStatusOf(p) {
  return String(
    p?.status ||
      p?.latestContent?.status ||
      p?.latestDraft?.status ||
      p?.latest_draft?.status ||
      ""
  ).toLowerCase();
}

function stageOf(p) {
  const s = rawStatusOf(p);
  if (s === "pending" || s === "in_progress" || s === "drafting" || s === "draft") return "draft";
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
  const s = rawStatusOf(p);
  if (s === "pending") return "needs approval";
  if (s === "in_progress") return "drafting";
  if (s === "approved") return "approved";
  if (s === "published") return "published";
  if (s === "rejected") return "rejected";
  if (s.startsWith("asset.")) return s;
  if (s.startsWith("publish.")) return s;
  return s || "";
}

function MiniChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/65 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-300">
      {children}
    </span>
  );
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

  const q = String(search || "").trim().toLowerCase();

  // ✅ IMPORTANT:
  // parent artıq düzgün tab üçün proposals verir.
  // burada ikinci dəfə status filter etmirik.
  const baseItems = Array.isArray(proposals) ? proposals : [];

  const filtered = baseItems.filter((p) => {
    const t = String(titleFrom(p) || "").toLowerCase();
    const c = String(captionFrom(p) || "").toLowerCase();
    const id = String(p?.id || "").toLowerCase();
    const agent = String(p?.agent_key || p?.agentKey || p?.agent || "").toLowerCase();
    return !q || t.includes(q) || c.includes(q) || id.includes(q) || agent.includes(q);
  });

  const shownCount = filtered.length;

  const totalInTab =
    status === "draft"
      ? stats?.draft ?? baseItems.length
      : status === "approved"
      ? stats?.approved ?? baseItems.length
      : status === "published"
      ? stats?.published ?? baseItems.length
      : status === "rejected"
      ? stats?.rejected ?? baseItems.length
      : baseItems.length;

  return (
    <Card className="min-w-0 h-full overflow-hidden p-0">
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <div className="border-b border-slate-200/70 px-4 pb-3 pt-4 dark:border-slate-800">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold tracking-tight">Draft Pipeline</div>
                <span
                  className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]"
                  aria-hidden="true"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Live</span>
              </div>

              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Draft → Approve draft → Publish
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <MiniChip>
                  Showing{" "}
                  <span className="mx-1 font-semibold text-slate-800 dark:text-slate-100">
                    {shownCount}
                  </span>
                  {q ? <span className="opacity-70">/ {totalInTab}</span> : null}
                </MiniChip>

                {status === "draft" ? <MiniChip>Auto-merge: draft + in_progress + pending</MiniChip> : null}
                <MiniChip>AI HQ</MiniChip>
              </div>
            </div>

            <div className="shrink-0">
              <Badge tone="neutral">{shownCount}</Badge>
            </div>
          </div>

          <div className="mt-3 flex min-w-0 flex-col gap-2">
            <Tabs value={status} onChange={setStatus} items={tabs} />
            <div className="w-full">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search drafts, captions, agent…"
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain p-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-slate-100">No items</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {q
                  ? "Search nəticəsi tapılmadı."
                  : "Bu tab üçün item yoxdur. Başqa tab seçə bilərsən."}
              </div>

              {DEV ? (
                <div className="mt-3 overflow-auto rounded-xl border border-slate-200/70 bg-white/70 p-3 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-200">
                  POST /api/debate {"{ \"mode\": \"proposal\" }"}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const isSel = String(p?.id) === String(selectedId);

                const agent = p?.agent_key || p?.agentKey || p?.agent || "agent";
                const when = relTime(p?.updated_at || p?.updatedAt || p?.created_at || p?.createdAt);

                const stage = stageOf(p);
                const rawStatus = rawStatusOf(p);
                const stageTxt = stageLabel(p);

                const t = titleFrom(p);
                const cap = captionFrom(p);
                const tags = tagsFrom(p);
                const fmt = formatFrom(p);
                const cta = ctaFrom(p);

                const capPreview = clip(cap, 140);
                const tagPreview = tags.slice(0, 3);

                const itemCls = [
                  "group w-full min-w-0 rounded-2xl border text-left transition-all duration-200",
                  "border-slate-200/70 bg-white/70",
                  "hover:bg-white/85 hover:shadow-[0_18px_40px_-30px_rgba(2,6,23,0.35)]",
                  "active:scale-[0.995]",
                  "dark:border-slate-800 dark:bg-slate-950/25",
                  "dark:hover:bg-slate-950/35",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                  isSel
                    ? "border-indigo-200/70 bg-indigo-50/60 shadow-[0_16px_40px_-34px_rgba(79,70,229,0.55)] dark:border-indigo-500/25 dark:bg-indigo-500/10"
                    : "",
                ].join(" ");

                return (
                  <button
                    key={p?.id}
                    type="button"
                    onClick={() => (onSelect ? onSelect(String(p?.id)) : null)}
                    className={itemCls}
                  >
                    <div className="p-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={[
                            "mt-1 h-10 w-1 shrink-0 rounded-full transition-opacity",
                            isSel
                              ? "bg-gradient-to-b from-indigo-500/75 via-cyan-400/65 to-emerald-400/65"
                              : "bg-slate-200/70 group-hover:opacity-90 dark:bg-slate-800/70",
                          ].join(" ")}
                          aria-hidden="true"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                                <span className="line-clamp-2 break-words">{t}</span>
                              </div>

                              {capPreview ? (
                                <div className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                  {capPreview}
                                </div>
                              ) : (
                                <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                  Draft (caption yoxdur)
                                </div>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <Badge tone={stageTone(stage, rawStatus)} className="shrink-0">
                                {stage === "draft" ? "Draft" : stage}
                              </Badge>

                              <div className="text-[11px] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500">
                                Open →
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {agent}
                            </span>
                            {when ? <span>· {when}</span> : null}
                            {stageTxt ? <span>· {stageTxt}</span> : null}

                            {fmt ? (
                              <span className="ml-1 inline-flex items-center rounded-full border border-slate-200/70 bg-white/60 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-300">
                                {fmt}
                              </span>
                            ) : null}

                            {cta ? (
                              <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/60 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-300">
                                CTA: {clip(cta, 26)}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {tagPreview.length ? (
                              <>
                                {tagPreview.map((h) => (
                                  <span
                                    key={h}
                                    className="inline-flex items-center rounded-full border border-slate-200/70 bg-slate-50/70 px-2 py-0.5 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-300"
                                  >
                                    {h}
                                  </span>
                                ))}
                                {tags.length > tagPreview.length ? (
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    +{tags.length - tagPreview.length} more
                                  </span>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                #{tags.length} tags
                              </span>
                            )}
                          </div>

                          {isSel ? (
                            <div className="mt-3 h-px w-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/25 to-indigo-500/0" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}