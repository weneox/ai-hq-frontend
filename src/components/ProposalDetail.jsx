// src/components/ProposalDetail.jsx (FINAL v4.1 — adds auto-fetch /api/content?proposalId=...)
// ✅ Fixes "no draft" when proposal list doesn't include latestDraft/latestContent
// ✅ Draft actions stay same

import { useEffect, useMemo, useState } from "react";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
import { getApiBase } from "../api/client.js";

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
function pretty(x) {
  try {
    return JSON.stringify(x ?? null, null, 2);
  } catch {
    return String(x ?? "");
  }
}
function shortId(id) {
  const s = String(id || "");
  return s.length <= 8 ? s : s.slice(0, 8);
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

function badgeTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "draft" || s === "in_progress" || s === "drafting") return "neutral";
  if (s === "approved") return "success";
  if (s === "published") return "success";
  if (s === "rejected") return "danger";
  return "neutral";
}
function draftTone(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("ready")) return "success";
  if (s.includes("approved")) return "success";
  if (s.includes("published")) return "success";
  if (s.includes("regenerat") || s.includes("changes") || s.includes("revise")) return "warn";
  if (s.includes("fail") || s.includes("error")) return "danger";
  return "neutral";
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

function pickPayloadObj(p) {
  const raw =
    p?.payload ?? p?.proposal ?? p?.data ?? p?.content ?? p?.draft ?? p?.latestDraft ?? p?.latest_draft ?? null;
  const obj = safeJson(raw) || raw;
  if (!obj || typeof obj !== "object") return null;
  if (obj.payload && typeof obj.payload === "object") return obj.payload;
  return obj;
}

function titleOf(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const t = safeText(obj.title) || safeText(obj.name) || safeText(obj.topic) || safeText(obj.summary) || safeText(obj.goal);
    if (t) return t;
    const c = safeText(obj.caption) || safeText(obj.text) || "";
    if (c) return c.slice(0, 80);
  }
  return `Item #${shortId(p?.id)}`;
}
function summaryOf(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const s = safeText(obj.summary) || safeText(obj.description) || safeText(obj.value) || "";
    if (s) return s;
    const c = safeText(obj.caption) || safeText(obj.text) || "";
    if (c) return c.slice(0, 140);
  }
  return "";
}

function pickDraftCandidate(proposal, draftProp) {
  return (
    draftProp ||
    proposal?.latestContent ||
    proposal?.latestDraft ||
    proposal?.latest_draft ||
    proposal?.draft ||
    proposal?.contentDraft ||
    proposal?.latest_execution ||
    proposal?.lastExecution ||
    proposal?.latestExecution ||
    proposal?.execution ||
    proposal?.job ||
    (Array.isArray(proposal?.jobs) ? proposal.jobs[0] : null) ||
    null
  );
}

// Accepts shapes like:
// - content_items row: {id,status,content_pack,last_feedback,updated_at,version?}
// - job callback: {output:{contentPack}} etc
function normalizeDraft(rawDraft) {
  if (!rawDraft) return null;
  const d = typeof rawDraft === "string" ? safeJson(rawDraft) : rawDraft;
  if (!d) return null;

  const contentPack =
    d.content_pack ||
    d.contentPack ||
    d.result?.contentPack ||
    d.result?.content_pack ||
    d.output?.contentPack ||
    d.output?.content_pack ||
    d.pack ||
    d.payload ||
    null;

  const pack = typeof contentPack === "string" ? safeJson(contentPack) : contentPack;

  const status = d.status || d.draftStatus || (pack ? "draft.ready" : "") || "";
  const version = Number(d.version || pack?.version || 1) || 1;

  return {
    id: d.id || d.contentItemId || d.content_item_id || d.content_item?.id || null,
    status,
    version,
    updatedAt: d.updated_at || d.updatedAt || null,
    lastFeedback: d.last_feedback || d.lastFeedback || "",
    pack: pack || null,
  };
}

/** ---------- pack readers (flexible keys) ---------- */
function packType(pack) {
  if (!pack) return "";
  return pack.post_type || pack.postType || pack.format || pack.type || pack.assetType || "";
}
function packCaption(pack) {
  if (!pack) return "";
  return pack.caption || pack.postCaption || pack.text || "";
}
function packHashtags(pack) {
  if (!pack) return [];
  return normalizeHashtags(pack.hashtags || pack.tags || pack.hashTags);
}
function packPostTime(pack) {
  if (!pack) return "";
  return pack.post_time || pack.postTime || pack.suggestedTime || pack.time || "";
}
function packLanguage(pack) {
  if (!pack) return "";
  return pack.language || pack.lang || "";
}
function packPlatform(pack) {
  if (!pack) return "instagram";
  return pack.platform || "instagram";
}
function packCta(pack) {
  if (!pack) return "";
  return pack.cta || pack.call_to_action || pack.callToAction || "";
}
function packReelScript(pack) {
  if (!pack) return "";
  return pack.reel_script || pack.reelScript || pack.script || pack.voiceover || "";
}
function packImagePrompt(pack) {
  if (!pack) return "";
  return pack.image_prompt || pack.imagePrompt || pack.visual_prompt || pack.visualPrompt || "";
}
function packDesign(pack) {
  if (!pack) return "";
  return (
    pack.design_instructions ||
    pack.designInstructions ||
    pack.layout_instructions ||
    pack.layoutInstructions ||
    pack.visual_direction ||
    pack.visualDirection ||
    ""
  );
}
function packStoryboard(pack) {
  if (!pack) return null;
  return pack.storyboard || pack.shot_list || pack.shotList || pack.scenes || null;
}
function packAssetSpecs(pack) {
  if (!pack) return null;
  return pack.asset_specs || pack.assetSpecs || pack.specs || pack.output_specs || null;
}
function packHook(pack) {
  if (!pack) return "";
  return pack.hook || pack.opening_line || pack.openingLine || "";
}
function packKeyPoints(pack) {
  if (!pack) return null;
  return pack.key_points || pack.keyPoints || pack.bullets || null;
}
function packMusic(pack) {
  if (!pack) return "";
  return pack.music || pack.audio || pack.sound || "";
}
function packCompliance(pack) {
  if (!pack) return "";
  return pack.compliance_notes || pack.complianceNotes || pack.rules || "";
}
function packShotDuration(pack) {
  if (!pack) return "";
  return pack.duration || pack.video_duration || pack.videoDuration || "";
}

function asDisplay(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(asDisplay).filter(Boolean).join("\n");
  if (typeof v === "object") return pretty(v);
  return String(v);
}

function Section({ title, children, right }) {
  return (
    <Card variant="panel" padded="sm" className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{title}</div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      <div className="mt-2 min-w-0">{children}</div>
    </Card>
  );
}

function SmallPill({ label, value }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{label}</div>
      <div className="text-[11px] text-slate-800 dark:text-slate-100 truncate" title={String(value || "")}>
        {value || "—"}
      </div>
    </div>
  );
}

async function fetchLatestDraft(apiBase, proposalId) {
  if (!apiBase || !proposalId) return null;
  const url = `${String(apiBase).replace(/\/+$/, "")}/api/content?proposalId=${encodeURIComponent(String(proposalId))}`;
  const r = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);

  // Accept shapes:
  // { ok:true, content: {...} }
  // { ok:true, items:[...] }
  // { item: {...} } / { draft: {...} }
  const item =
    j?.content ||
    j?.item ||
    j?.draft ||
    (Array.isArray(j?.items) ? j.items[0] : null) ||
    (Array.isArray(j?.contentItems) ? j.contentItems[0] : null) ||
    null;

  return item || null;
}

export default function ProposalDetail({
  proposal,

  // flags
  busy,
  draftBusy,

  // handlers (support both naming styles)
  onRequestChanges,
  onApproveDraft,

  onRejectDraft,
  onReject, // fallback

  onPublish,
  onPublishDraft, // fallback

  // optional injected draft (if parent fetches /content separately)
  draft,
}) {
  const apiBase = useMemo(() => getApiBase(), []);

  const [feedback, setFeedback] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // ✅ NEW: local fetched draft fallback
  const [fetchedDraftRaw, setFetchedDraftRaw] = useState(null);
  const [fetchingDraft, setFetchingDraft] = useState(false);

  const resolvedDraft = useMemo(() => {
    const candidate = pickDraftCandidate(proposal, draft) || fetchedDraftRaw;
    return normalizeDraft(candidate);
  }, [proposal, draft, fetchedDraftRaw]);

  const pack = resolvedDraft?.pack || null;

  useEffect(() => {
    setFeedback("");
    setRejectReason("");
    setFetchedDraftRaw(null);
  }, [proposal?.id]);

  // ✅ NEW: auto-fetch when pack missing
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!proposal?.id) return;

      // if parent already passed draft or proposal already has candidate, skip
      const candidate = pickDraftCandidate(proposal, draft);
      const normalized = normalizeDraft(candidate);
      if (normalized?.pack) return;

      if (!apiBase) return;

      setFetchingDraft(true);
      try {
        const item = await fetchLatestDraft(apiBase, proposal.id);
        if (!alive) return;
        setFetchedDraftRaw(item);
      } catch {
        // ignore
      } finally {
        if (alive) setFetchingDraft(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [apiBase, proposal?.id, draft]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!proposal) {
    return (
      <Card className="min-w-0 h-full flex flex-col justify-center items-center text-center" variant="panel" padded="lg">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Select an item</div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-[460px]">
          Soldakı list-dən bir item seç — burada Draft Studio açılacaq.
        </div>
      </Card>
    );
  }

  const title = titleOf(proposal);
  const summary = summaryOf(proposal);

  // statuses: draft / in_progress / approved / published / rejected
  const status = String(proposal.status || "draft").toLowerCase();
  const isRejected = status === "rejected";
  const isPublished = status === "published";
  const isApproved = status === "approved";

  // draft stage includes: draft + in_progress
  const isDraftStage = !isRejected && !isPublished && !isApproved;

  const draftStatusLc = String(resolvedDraft?.status || "").toLowerCase();
  const isRegenerating =
    draftStatusLc.includes("regenerat") || draftStatusLc.includes("changes") || draftStatusLc.includes("revise");

  const isDraftReady = Boolean(pack) && (draftStatusLc.includes("ready") || draftStatusLc === "" || draftStatusLc.includes("draft"));

  const isDraftApproved = draftStatusLc.includes("approved") || isApproved;
  const canPublish = Boolean(pack) && isDraftApproved && !isPublished;

  const effectiveBusy = Boolean(busy || draftBusy || fetchingDraft);

  const agent = proposal.agent_key || proposal.agentKey || proposal.agent || "—";
  const created = relTime(proposal.created_at || proposal.createdAt);

  const copy = async (t) => {
    try {
      await navigator.clipboard.writeText(String(t || ""));
    } catch {}
  };
  const copyJson = async (obj) => {
    try {
      await navigator.clipboard.writeText(pretty(obj));
    } catch {}
  };

  const doRequestChanges = async () => {
    if (!onRequestChanges) return;
    const fb = String(feedback || "").trim();
    if (!fb) return;
    if (!resolvedDraft?.id) return;
    await onRequestChanges(String(proposal.id), String(resolvedDraft.id), fb);
    setFeedback("");
  };

  const doApproveDraft = async () => {
    if (!onApproveDraft) return;
    if (!resolvedDraft?.id) return;
    await onApproveDraft(String(proposal.id), String(resolvedDraft.id));
  };

  const doRejectDraft = async () => {
    const handler = onRejectDraft || onReject;
    if (!handler) return;
    const r = String(rejectReason || "").trim();
    if (!r) return;
    await handler(String(proposal.id), String(resolvedDraft?.id || ""), r);
    setRejectReason("");
  };

  const doPublish = async () => {
    const handler = onPublish || onPublishDraft;
    if (!handler) return;
    if (!resolvedDraft?.id) return;
    await handler(String(proposal.id), String(resolvedDraft.id));
  };

  // --- build detailed view fields ---
  const payloadObj = pickPayloadObj(proposal);
  const lang = packLanguage(pack) || safeText(payloadObj?.language) || safeText(payloadObj?.lang) || "";
  const platform = packPlatform(pack);
  const postType = packType(pack);
  const postTime = packPostTime(pack);
  const cta = packCta(pack);
  const hook = packHook(pack);
  const hashtags = packHashtags(pack);
  const design = packDesign(pack);
  const script = packReelScript(pack);
  const imgPrompt = packImagePrompt(pack);
  const storyboard = packStoryboard(pack);
  const specs = packAssetSpecs(pack);
  const keyPoints = packKeyPoints(pack);
  const music = packMusic(pack);
  const compliance = packCompliance(pack);
  const duration = packShotDuration(pack);

  return (
    <Card className="min-w-0 p-0 overflow-hidden flex flex-col h-full" variant="elevated" padded={false} clip>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold leading-snug min-w-0 break-words" title={title}>
              {title}
            </h2>

            {summary ? <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{summary}</div> : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <SmallPill label="Backend" value={apiBase || "VITE_API_BASE missing"} />
              <span className="opacity-50">·</span>
              <SmallPill label="Agent" value={`${agent}${created ? ` · ${created}` : ""}`} />
              <span className="opacity-50">·</span>
              <SmallPill label="Ref" value={`PR-${shortId(proposal.id).toUpperCase()}`} />
              <Button variant="outline" size="sm" onClick={() => copy(String(proposal.id))}>
                Copy ID
              </Button>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Badge tone={badgeTone(status)}>{status}</Badge>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 px-4 py-4 space-y-4 min-w-0 overflow-auto pb-10">
        {/* Draft Studio */}
        <Card variant="soft" tone={pack ? "info" : "neutral"} padded="md">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Draft Studio</div>
                <Badge tone={draftTone(resolvedDraft?.status || (pack ? "draft.ready" : "no draft"))}>
                  {resolvedDraft?.status || (pack ? "draft.ready" : fetchingDraft ? "loading…" : "no draft")}
                </Badge>
                {typeof resolvedDraft?.version === "number" ? (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">v{resolvedDraft.version}</span>
                ) : null}
              </div>

              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Axın: <b>draft</b> → <b>approved</b> → <b>published</b>. “Request changes” yaz — loop edib yeni draft gəlir.
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(packCaption(pack))} disabled={!packCaption(pack)}>
                Copy caption
              </Button>
              <Button variant="outline" size="sm" onClick={() => copyJson(pack)} disabled={!pack}>
                Copy JSON
              </Button>
            </div>
          </div>

          {!pack ? (
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              {fetchingDraft ? (
                <>Draft axtarıram… `/api/content?proposalId=...` çağırılır.</>
              ) : (
                <>
                  Draft hələ görünmür. Ya backend draft-ı `content_items`-ə yazmır, ya da `GET /api/content?proposalId=...`
                  boş qayıdır.
                </>
              )}
            </div>
          ) : (
            <>
              {/* Top summary grid */}
              <div className="mt-3 grid gap-2 lg:grid-cols-3 min-w-0">
                <Section title="Basics">
                  <div className="space-y-1">
                    <SmallPill label="Platform" value={platform} />
                    <SmallPill label="Language" value={lang || "—"} />
                    <SmallPill label="Format" value={postType || "—"} />
                    <SmallPill label="Post time" value={postTime || "—"} />
                    <SmallPill label="CTA" value={cta || "—"} />
                    {duration ? <SmallPill label="Duration" value={duration} /> : null}
                  </div>
                </Section>

                <Section title="Hook / Angle">
                  <div className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                    {hook ? hook : "—"}
                  </div>
                  {keyPoints ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Key points
                      </summary>
                      <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
                        {asDisplay(keyPoints) || "—"}
                      </pre>
                    </details>
                  ) : null}
                </Section>

                <Section
                  title="Hashtags"
                  right={<span className="text-[11px] text-slate-500 dark:text-slate-400">{hashtags.length}</span>}
                >
                  <div className="flex flex-wrap gap-1">
                    {hashtags.slice(0, 28).map((h, i) => (
                      <span
                        key={`${h}_${i}`}
                        className="text-[11px] rounded-full border border-slate-200 bg-white px-2 py-0.5
                                   dark:border-slate-800 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200"
                      >
                        {h}
                      </span>
                    ))}
                    {hashtags.length > 28 ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">+{hashtags.length - 28} more</span>
                    ) : null}
                  </div>
                </Section>
              </div>

              {/* Caption */}
              <Section
                title="Caption (full)"
                right={
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copy(packCaption(pack))} disabled={!packCaption(pack)}>
                      Copy
                    </Button>
                  </div>
                }
              >
                <div className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words max-h-[320px] overflow-auto pr-2">
                  {packCaption(pack) || "—"}
                </div>
              </Section>

              {/* Design / Layout instructions */}
              <div className="grid gap-2 lg:grid-cols-2 min-w-0">
                <Section title="Design / Layout instructions (VERY IMPORTANT)">
                  <div className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words max-h-[380px] overflow-auto pr-2">
                    {design || "—"}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    Burada: rəng palitrası, font, grid, elementlərin yerləşimi, cover frame, logo placement, CTA button,
                    overlay text, ikonlar, spacing və s. olmalıdır.
                  </div>
                </Section>

                <Section title="Asset specs / Output">
                  <pre className="text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 max-h-[380px] overflow-auto pr-2">
                    {asDisplay(specs) || "—"}
                  </pre>

                  {imgPrompt ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Image prompt (generator üçün)
                      </summary>
                      <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
                        {imgPrompt}
                      </pre>
                    </details>
                  ) : null}

                  {compliance ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Compliance / Notes
                      </summary>
                      <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
                        {compliance}
                      </pre>
                    </details>
                  ) : null}
                </Section>
              </div>

              {/* Storyboard / Script */}
              <div className="grid gap-2 lg:grid-cols-2 min-w-0">
                <Section title="Storyboard / Shotlist">
                  <pre className="text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 max-h-[420px] overflow-auto pr-2">
                    {asDisplay(storyboard) || "—"}
                  </pre>
                </Section>

                <Section title="Reel script / Voiceover">
                  <pre className="text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100 max-h-[420px] overflow-auto pr-2">
                    {script || "—"}
                  </pre>

                  {music ? (
                    <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <b>Music/SFX:</b> {music}
                    </div>
                  ) : null}
                </Section>
              </div>

              {/* Actions */}
              <Card variant="panel" padded="sm" className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Actions</div>
                  {resolvedDraft?.lastFeedback ? (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Last feedback: {String(resolvedDraft.lastFeedback).slice(0, 90)}
                    </div>
                  ) : null}
                </div>

                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none transition-all duration-200
                             focus:border-indigo-300/80 focus:ring-2 focus:ring-indigo-500/25 focus:ring-offset-2 focus:ring-offset-white
                             dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-100 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/25 dark:focus:ring-offset-slate-950"
                  placeholder='Dəyişiklik: "Caption daha qısa. 8 hashtag. CTA WhatsApp. Dizaynda 3 kadr: 1) hook 2) benefit 3) CTA. Rəng: neon-blue + dark."'
                  disabled={effectiveBusy || isRegenerating || isRejected || isPublished}
                />

                {isDraftStage ? (
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Reject reason</div>
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                                 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-100"
                      placeholder='Məs: "Brand uyğun deyil" / "Bu gün video yox, carousel olsun" / "Mövzu dəyişsin"...'
                      disabled={effectiveBusy || isRegenerating}
                    />
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    isLoading={effectiveBusy && isRegenerating}
                    disabled={
                      effectiveBusy ||
                      !onRequestChanges ||
                      !resolvedDraft?.id ||
                      !String(feedback || "").trim() ||
                      isRejected ||
                      isPublished
                    }
                    onClick={doRequestChanges}
                    className="min-w-[180px]"
                    title={!resolvedDraft?.id ? "contentId yoxdur" : ""}
                  >
                    Request changes
                  </Button>

                  <Button
                    variant="primary"
                    isLoading={effectiveBusy && !isRegenerating}
                    disabled={
                      effectiveBusy ||
                      !onApproveDraft ||
                      !resolvedDraft?.id ||
                      !isDraftStage ||
                      !isDraftReady ||
                      isRejected ||
                      isPublished
                    }
                    onClick={doApproveDraft}
                    className="min-w-[160px]"
                  >
                    Approve draft
                  </Button>

                  <Button
                    variant="destructive"
                    isLoading={effectiveBusy && !isRegenerating}
                    disabled={
                      effectiveBusy ||
                      !(onRejectDraft || onReject) ||
                      !isDraftStage ||
                      isRejected ||
                      isPublished ||
                      !String(rejectReason || "").trim()
                    }
                    onClick={doRejectDraft}
                    className="min-w-[140px]"
                    title={!String(rejectReason || "").trim() ? "Reject reason yaz" : ""}
                  >
                    Reject
                  </Button>

                  <Button
                    variant="primary"
                    isLoading={effectiveBusy && !isRegenerating}
                    disabled={effectiveBusy || !(onPublish || onPublishDraft) || !resolvedDraft?.id || !canPublish || isRejected}
                    onClick={doPublish}
                    className="min-w-[140px]"
                  >
                    Publish
                  </Button>

                  {isRegenerating ? (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center">
                      Regenerating… (n8n işləyir)
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Loop: Request changes → n8n revise → yeni draft (v2,v3…) → yenə approve/reject/publish.
                </div>
              </Card>
            </>
          )}
        </Card>

        <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30 min-w-0">
          <summary className="cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200">
            Advanced (Raw)
          </summary>
          <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs whitespace-pre-wrap break-words dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
            {pretty({ proposal, draft: resolvedDraft, fetchedDraftRaw })}
          </pre>
        </details>
      </div>
    </Card>
  );
}