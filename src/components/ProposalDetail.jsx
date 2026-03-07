// src/components/ProposalDetail.jsx
// FINAL v5.4.0 — FIXED publish gating + caption normalization + tolerant asset detection

import { useEffect, useMemo, useState } from "react";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";
import { getApiBase } from "../api/client.js";

/** =========================
 *  Helpers
 *  ========================= */
function safeText(x) {
  if (typeof x === "string") return x;
  if (x && typeof x === "object") {
    if (typeof x.text === "string") return x.text;
    if (typeof x.value === "string") return x.value;
    if (typeof x.caption === "string") return x.caption;
    if (typeof x.label === "string") return x.label;
    if (typeof x.name === "string") return x.name;
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
  if (s === "draft" || s === "in_progress" || s === "drafting" || s === "pending") return "neutral";
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

function asDisplay(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "number" || typeof item === "boolean") return String(item);
        if (item && typeof item === "object") {
          return (
            safeText(item) ||
            safeText(item.caption) ||
            safeText(item.text) ||
            safeText(item.value) ||
            pretty(item)
          );
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (typeof v === "object") {
    return (
      safeText(v) ||
      safeText(v.caption) ||
      safeText(v.text) ||
      safeText(v.value) ||
      pretty(v)
    );
  }
  return String(v);
}

function normalizeInlineText(v) {
  const raw = asDisplay(v);
  return String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

function titleOf(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const t =
      safeText(obj.title) ||
      safeText(obj.name) ||
      safeText(obj.topic) ||
      safeText(obj.summary) ||
      safeText(obj.goal);
    if (t) return t;
    const c = normalizeInlineText(obj.caption || obj.text || "");
    if (c) return c.slice(0, 80);
  }
  return `Item #${shortId(p?.id)}`;
}

function summaryOf(p) {
  const obj = pickPayloadObj(p);
  if (obj) {
    const s = normalizeInlineText(obj.summary || obj.description || obj.value || "");
    if (s) return s;
    const c = normalizeInlineText(obj.caption || obj.text || "");
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
  const status = d.status || d.draftStatus || d.state || (pack ? "draft.ready" : "") || "";
  const version = Number(d.version || pack?.version || 1) || 1;

  return {
    id: d.id || d.contentItemId || d.content_item_id || d.content_item?.id || null,
    status,
    version,
    updatedAt: d.updated_at || d.updatedAt || null,
    lastFeedback: d.last_feedback || d.lastFeedback || "",
    pack: pack || null,
    raw: d,
  };
}

function packType(pack) {
  if (!pack) return "";
  return pack.post_type || pack.postType || pack.format || pack.type || pack.assetType || "";
}
function packCaption(pack) {
  if (!pack) return "";
  return normalizeInlineText(
    pack.caption ||
      pack.postCaption ||
      pack.text ||
      pack.copy ||
      pack.body ||
      pack.lines ||
      ""
  );
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
  return normalizeInlineText(pack.cta || pack.call_to_action || pack.callToAction || "");
}
function packReelScript(pack) {
  if (!pack) return "";
  return normalizeInlineText(pack.reel_script || pack.reelScript || pack.script || pack.voiceover || "");
}
function packImagePrompt(pack) {
  if (!pack) return "";
  return normalizeInlineText(pack.image_prompt || pack.imagePrompt || pack.visual_prompt || pack.visualPrompt || "");
}
function packDesign(pack) {
  if (!pack) return "";
  return normalizeInlineText(
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
  return normalizeInlineText(pack.hook || pack.opening_line || pack.openingLine || "");
}
function packKeyPoints(pack) {
  if (!pack) return null;
  return pack.key_points || pack.keyPoints || pack.bullets || null;
}
function packMusic(pack) {
  if (!pack) return "";
  return normalizeInlineText(pack.music || pack.audio || pack.sound || "");
}
function packCompliance(pack) {
  if (!pack) return "";
  return normalizeInlineText(pack.compliance_notes || pack.complianceNotes || pack.rules || "");
}
function packShotDuration(pack) {
  if (!pack) return "";
  return normalizeInlineText(pack.duration || pack.video_duration || pack.videoDuration || "");
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    const s = normalizeInlineText(v);
    if (s) return s;
  }
  return "";
}

function getAssetUrls(pack) {
  if (!pack || typeof pack !== "object") return [];

  const out = [];
  const push = (u) => {
    const s = String(u || "").trim();
    if (s) out.push(s);
  };

  push(pack.imageUrl);
  push(pack.image_url);
  push(pack.videoUrl);
  push(pack.video_url);
  push(pack.coverUrl);
  push(pack.cover_url);
  push(pack.thumbnailUrl);
  push(pack.thumbnail_url);

  const assets = Array.isArray(pack.assets) ? pack.assets : [];
  for (const a of assets) {
    push(a?.url);
    push(a?.secure_url);
    push(a?.publicUrl);
    push(a?.public_url);
  }

  return Array.from(new Set(out));
}

async function fetchLatestDraft(apiBase, proposalId) {
  if (!apiBase || !proposalId) return null;
  const url = `${String(apiBase).replace(/\/+$/, "")}/api/content?proposalId=${encodeURIComponent(
    String(proposalId)
  )}`;
  const r = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!r.ok) return null;
  const j = await r.json().catch(() => null);

  const item =
    j?.content ||
    j?.item ||
    j?.draft ||
    (Array.isArray(j?.items) ? j.items[0] : null) ||
    (Array.isArray(j?.contentItems) ? j.contentItems[0] : null) ||
    null;

  return item || null;
}

function Pill({ children, tone = "neutral" }) {
  const t = String(tone);
  const cls =
    t === "success"
      ? "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
      : t === "warn"
      ? "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200"
      : t === "danger"
      ? "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
      : "border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function KV({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{k}</div>
      <div
        className="max-w-[210px] truncate text-[11px] text-slate-900 dark:text-slate-100"
        title={String(v || "")}
      >
        {v || "—"}
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition",
        active
          ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-900/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[12px] font-semibold text-slate-800 dark:text-slate-100">{children}</div>
      {right ? <div className="text-[11px] text-slate-500 dark:text-slate-400">{right}</div> : null}
    </div>
  );
}

function statusLc(x) {
  return String(x || "").trim().toLowerCase();
}

function isAssetReadyStatus(s) {
  const v = statusLc(s);
  return (
    v === "asset.ready" ||
    v === "assets.ready" ||
    v === "publish.ready" ||
    v === "approved" ||
    v === "draft.approved"
  );
}

export default function ProposalDetail({
  proposal,
  busy,
  draftBusy,
  onRequestChanges,
  onApproveDraft,
  onRejectDraft,
  onReject,
  onPublish,
  onPublishDraft,
  draft,
}) {
  const apiBase = useMemo(() => getApiBase(), []);

  const [feedback, setFeedback] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [fetchedDraftRaw, setFetchedDraftRaw] = useState(null);
  const [fetchingDraft, setFetchingDraft] = useState(false);
  const [tab, setTab] = useState("design");
  const [showInputs, setShowInputs] = useState(true);

  const resolvedDraft = useMemo(() => {
    const candidate = pickDraftCandidate(proposal, draft) || fetchedDraftRaw;
    return normalizeDraft(candidate);
  }, [proposal, draft, fetchedDraftRaw]);

  const pack = resolvedDraft?.pack || null;

  useEffect(() => {
    setFeedback("");
    setRejectReason("");
    setFetchedDraftRaw(null);
    setTab("design");
    setShowInputs(true);
  }, [proposal?.id]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!proposal?.id) return;

      const candidate = pickDraftCandidate(proposal, draft);
      const normalized = normalizeDraft(candidate);
      if (normalized?.pack && normalized?.id) return;
      if (!apiBase) return;

      setFetchingDraft(true);
      try {
        const item = await fetchLatestDraft(apiBase, proposal.id);
        if (!alive) return;
        setFetchedDraftRaw(item);
      } catch {
      } finally {
        if (alive) setFetchingDraft(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [apiBase, proposal?.id, draft]);

  if (!proposal) {
    return (
      <Card
        className="flex h-full min-h-0 min-w-0 flex-col items-center justify-center text-center"
        variant="panel"
        padded="lg"
      >
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Select an item</div>
        <div className="mt-1 max-w-[460px] text-xs text-slate-500 dark:text-slate-400">
          Soldakı list-dən bir item seç — burada Draft Studio açılacaq.
        </div>
      </Card>
    );
  }

  const title = titleOf(proposal);
  const summary = summaryOf(proposal);

  const proposalStatus = String(proposal.status || "draft").toLowerCase();
  const isRejected = proposalStatus === "rejected";
  const isPublished = proposalStatus === "published";
  const isApproved = proposalStatus === "approved";
  const isDraftStage = !isRejected && !isPublished && !isApproved;

  const draftStatusLc = String(resolvedDraft?.status || "").toLowerCase();
  const isRegenerating =
    draftStatusLc.includes("regenerat") ||
    draftStatusLc.includes("changes") ||
    draftStatusLc.includes("revise");

  const isDraftReady =
    Boolean(pack) &&
    (draftStatusLc.includes("ready") || draftStatusLc === "" || draftStatusLc.includes("draft"));

  const assetUrls = getAssetUrls(pack);
  const hasPublishableAsset = assetUrls.length > 0;
  const isAssetReady = isAssetReadyStatus(resolvedDraft?.status) || (isApproved && hasPublishableAsset);

  const canPublish =
    Boolean(pack) &&
    Boolean(resolvedDraft?.id) &&
    hasPublishableAsset &&
    isAssetReady &&
    !isPublished &&
    !isRejected;

  const effectiveBusy = Boolean(busy || draftBusy || fetchingDraft);

  const agent = proposal.agent_key || proposal.agentKey || proposal.agent || "—";
  const created = relTime(proposal.created_at || proposal.createdAt);

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
  const compliance = packCompliance(pack);
  const duration = packShotDuration(pack);
  const captionText = firstNonEmpty(packCaption(pack), pack?.headline, pack?.copy, pack?.summary);

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
    if (!fb || !resolvedDraft?.id) return;
    await onRequestChanges(String(proposal.id), String(resolvedDraft.id), fb);
    setFeedback("");
  };

  const doApproveDraft = async () => {
    if (!onApproveDraft || !resolvedDraft?.id) return;
    await onApproveDraft(String(proposal.id), String(resolvedDraft.id));
  };

  const doRejectDraft = async () => {
    const handler = onRejectDraft || onReject;
    if (!handler) return;
    const r = String(rejectReason || "").trim();
    if (!r || !resolvedDraft?.id) return;
    await handler(String(proposal.id), String(resolvedDraft.id), r);
    setRejectReason("");
  };

  const doPublish = async () => {
    const handler = onPublish || onPublishDraft;
    if (!handler) return;
    if (!resolvedDraft?.id) return;
    if (!canPublish) return;
    await handler(String(proposal.id), String(resolvedDraft.id));
  };

  const requestDisabledReason = !showInputs
    ? "Inputs hidden"
    : !String(feedback || "").trim()
    ? "Write feedback"
    : "";

  const publishDisabledReason = effectiveBusy
    ? "Busy"
    : !(onPublish || onPublishDraft)
    ? "Publish handler missing"
    : !resolvedDraft?.id
    ? "Content ID missing"
    : isRejected
    ? "Rejected"
    : isPublished
    ? "Already published"
    : !pack
    ? "Draft pack missing"
    : !hasPublishableAsset
    ? "Asset URL missing"
    : !isAssetReady
    ? "Asset not ready yet"
    : "";

  return (
    <Card className="flex min-h-0 min-w-0 w-full flex-col" variant="elevated" padded={false} clip>
      <div className="sticky top-0 z-10">
        <div className="h-[3px] bg-gradient-to-r from-indigo-500/70 via-cyan-400/55 to-emerald-400/55 dark:from-indigo-400/55 dark:via-cyan-300/45 dark:to-emerald-300/45" />
        <div className="border-b border-slate-200/70 bg-white/82 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/72">
          <div className="px-5 pb-3 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="min-w-0 break-words text-[15px] font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:text-[17px]"
                    title={title}
                  >
                    {title}
                  </h2>

                  <Badge tone={badgeTone(proposalStatus)}>{proposalStatus}</Badge>

                  <Badge tone={draftTone(resolvedDraft?.status || (pack ? "draft.ready" : "no draft"))}>
                    {resolvedDraft?.status || (pack ? "draft.ready" : fetchingDraft ? "loading…" : "no draft")}
                    {typeof resolvedDraft?.version === "number" ? (
                      <span className="opacity-70"> · v{resolvedDraft.version}</span>
                    ) : null}
                  </Badge>

                  {isAssetReady ? <Badge tone="success">asset ready</Badge> : null}
                </div>

                {summary ? (
                  <div className="mt-1 line-clamp-2 max-w-[960px] text-[12px] text-slate-500 dark:text-slate-400">
                    {summary}
                  </div>
                ) : null}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Ref</span>
                  PR-{shortId(proposal.id).toUpperCase()}
                  <span className="opacity-50">·</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Agent</span>
                  {agent}
                  {created ? (
                    <>
                      <span className="opacity-50">·</span>
                      {created}
                    </>
                  ) : null}
                  <span className="opacity-50">·</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Backend</span>
                  {apiBase || "VITE_API_BASE missing"}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => copy(String(proposal.id))}>
                    Copy ID
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copy(captionText)}
                    disabled={!captionText}
                  >
                    Copy caption
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyJson(pack)} disabled={!pack}>
                    Copy JSON
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={effectiveBusy && isRegenerating}
                    disabled={
                      effectiveBusy ||
                      !onRequestChanges ||
                      !resolvedDraft?.id ||
                      !showInputs ||
                      !String(feedback || "").trim() ||
                      isRejected ||
                      isPublished
                    }
                    onClick={doRequestChanges}
                    title={requestDisabledReason || (!resolvedDraft?.id ? "contentId yoxdur" : "")}
                  >
                    Request
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
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
                  >
                    Approve
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    isLoading={effectiveBusy && !isRegenerating}
                    disabled={
                      effectiveBusy ||
                      !(onRejectDraft || onReject) ||
                      !resolvedDraft?.id ||
                      !isDraftStage ||
                      isRejected ||
                      isPublished ||
                      !String(rejectReason || "").trim()
                    }
                    onClick={doRejectDraft}
                    title={!String(rejectReason || "").trim() ? "Reject reason yaz" : ""}
                  >
                    Reject
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={effectiveBusy && !isRegenerating}
                    disabled={effectiveBusy || !canPublish || !(onPublish || onPublishDraft)}
                    onClick={doPublish}
                    title={publishDisabledReason}
                  >
                    Publish
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInputs((v) => !v)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showInputs ? "Hide inputs" : "Show inputs"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 min-w-0 px-5 py-5 pb-10">
        {!pack ? (
          <Card variant="panel" padded="lg" className="border border-dashed border-slate-300 dark:border-slate-700">
            <SectionTitle right={fetchingDraft ? "Loading…" : ""}>Draft Studio</SectionTitle>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {fetchingDraft ? <>Draft axtarıram… `/api/content?proposalId=...` çağırılır.</> : <>Draft görünmür.</>}
            </div>
          </Card>
        ) : (
          <>
            <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-b from-white/90 to-slate-50/70 p-5 shadow-sm dark:border-slate-800 dark:from-slate-950/40 dark:to-slate-950/10">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Caption</div>
                  <div className="mt-2 whitespace-pre-wrap break-words text-[14px] leading-[1.75] text-slate-900 dark:text-slate-100">
                    {captionText || "—"}
                  </div>
                </div>
                <div className="flex shrink-0 items-start gap-2">
                  {hook ? <Pill tone="neutral">Hook: {hook}</Pill> : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>{platform}</Pill>
                <Pill>{lang || "—"}</Pill>
                <Pill>{postType || "—"}</Pill>
                {postTime ? <Pill>Time: {postTime}</Pill> : null}
                {cta ? <Pill>CTA: {cta}</Pill> : null}
                {duration ? <Pill>Dur: {duration}</Pill> : null}
                {hasPublishableAsset ? <Pill tone="success">Asset linked</Pill> : null}
              </div>

              {keyPoints ? (
                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/25">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Key points</div>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">
                    {asDisplay(keyPoints) || "—"}
                  </pre>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TabBtn active={tab === "design"} onClick={() => setTab("design")}>
                    Design
                  </TabBtn>
                  <TabBtn active={tab === "script"} onClick={() => setTab("script")}>
                    Script
                  </TabBtn>
                  <TabBtn active={tab === "storyboard"} onClick={() => setTab("storyboard")}>
                    Storyboard
                  </TabBtn>
                  <TabBtn active={tab === "specs"} onClick={() => setTab("specs")}>
                    Specs
                  </TabBtn>
                  <TabBtn active={tab === "raw"} onClick={() => setTab("raw")}>
                    Raw
                  </TabBtn>

                  {isRegenerating ? (
                    <span className="ml-2 text-[11px] text-slate-500 dark:text-slate-400">
                      Regenerating… (n8n işləyir)
                    </span>
                  ) : null}
                </div>

                <Card variant="panel" padded="lg" className="min-w-0">
                  {tab === "design" ? (
                    <>
                      <SectionTitle>Design / Layout instructions</SectionTitle>
                      <div className="mt-2 whitespace-pre-wrap break-words text-[13px] text-slate-900 dark:text-slate-100">
                        {design || "—"}
                      </div>

                      {imgPrompt ? (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Image prompt (generator)
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">
                            {imgPrompt}
                          </pre>
                        </details>
                      ) : null}

                      {compliance ? (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Compliance / Notes
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">
                            {compliance}
                          </pre>
                        </details>
                      ) : null}

                      {hasPublishableAsset ? (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Asset URLs
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-800 dark:text-slate-100">
                            {assetUrls.join("\n")}
                          </pre>
                        </details>
                      ) : null}
                    </>
                  ) : tab === "script" ? (
                    <>
                      <SectionTitle>Reel script / Voiceover</SectionTitle>
                      <pre className="mt-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 whitespace-pre-wrap break-words text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-100">
                        {script || "—"}
                      </pre>
                      {packMusic(pack) ? (
                        <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <b>Music/SFX:</b> {packMusic(pack)}
                        </div>
                      ) : null}
                    </>
                  ) : tab === "storyboard" ? (
                    <>
                      <SectionTitle>Storyboard / Shotlist</SectionTitle>
                      <pre className="mt-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 whitespace-pre-wrap break-words text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-100">
                        {asDisplay(storyboard) || "—"}
                      </pre>
                    </>
                  ) : tab === "specs" ? (
                    <>
                      <SectionTitle>Asset specs / Output</SectionTitle>
                      <pre className="mt-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 whitespace-pre-wrap break-words text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-100">
                        {asDisplay(specs) || "—"}
                      </pre>
                    </>
                  ) : (
                    <>
                      <SectionTitle>Advanced (Raw)</SectionTitle>
                      <pre className="mt-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 whitespace-pre-wrap break-words text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-100">
                        {pretty({ proposal, draft: resolvedDraft, fetchedDraftRaw, assetUrls })}
                      </pre>
                    </>
                  )}
                </Card>

                {showInputs ? (
                  <Card variant="panel" padded="lg" className="min-w-0">
                    <SectionTitle right="Loop">Feedback loop</SectionTitle>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Request changes → n8n revise → yeni draft (v2,v3…) → yenə approve/reject/publish.
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Change request
                        </div>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={5}
                          className="mt-2 w-full rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-sm outline-none transition focus:border-indigo-300/80 focus:ring-2 focus:ring-indigo-500/15 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-100 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/20"
                          placeholder='Məs: "Caption daha qısa. 8 hashtag. CTA WhatsApp. Dizaynda 3 kadr: 1) hook 2) benefit 3) CTA."'
                          disabled={effectiveBusy || isRegenerating || isRejected || isPublished}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Reject reason
                        </div>
                        <input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-100"
                          placeholder='Məs: "Brand uyğun deyil" / "Bu gün video yox, carousel olsun"...'
                          disabled={effectiveBusy || isRegenerating}
                        />

                        {resolvedDraft?.lastFeedback ? (
                          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                            <b>Last feedback:</b> {String(resolvedDraft.lastFeedback).slice(0, 140)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                ) : null}
              </div>

              <div className="min-w-0 space-y-4">
                <Card variant="panel" padded="lg">
                  <SectionTitle>Overview</SectionTitle>
                  <div className="mt-3 space-y-2">
                    <KV k="Platform" v={platform} />
                    <KV k="Language" v={lang || "—"} />
                    <KV k="Format" v={postType || "—"} />
                    <KV k="Post time" v={postTime || "—"} />
                    <KV k="CTA" v={cta || "—"} />
                    <KV k="Content ID" v={resolvedDraft?.id || "—"} />
                    <KV k="Updated" v={resolvedDraft?.updatedAt ? relTime(resolvedDraft.updatedAt) : "—"} />
                    <KV k="Draft status" v={resolvedDraft?.status || "—"} />
                    <KV k="Assets" v={hasPublishableAsset ? `${assetUrls.length} linked` : "—"} />
                    <KV k="Publish ready" v={canPublish ? "yes" : "no"} />
                  </div>
                </Card>

                <Card variant="panel" padded="lg">
                  <SectionTitle right={String(hashtags.length)}>Hashtags</SectionTitle>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(hashtags || []).slice(0, 36).map((h, i) => (
                      <span
                        key={`${h}_${i}`}
                        className="rounded-full border border-slate-200/70 bg-white/80 px-2.5 py-1 text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-950/25 dark:text-slate-200"
                      >
                        {h}
                      </span>
                    ))}
                    {hashtags.length > 36 ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        +{hashtags.length - 36} more
                      </span>
                    ) : null}
                  </div>
                </Card>

                {hook ? (
                  <Card variant="panel" padded="lg">
                    <SectionTitle>Hook / Angle</SectionTitle>
                    <div className="mt-2 whitespace-pre-wrap break-words text-[13px] text-slate-900 dark:text-slate-100">
                      {hook}
                    </div>
                  </Card>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}