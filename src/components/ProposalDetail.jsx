// src/components/ProposalDetail.jsx (PREMIUM FINAL)
// ✅ Sticky decision bar for pending
// ✅ Draft studio layout (status + preview + feedback + actions)
// ✅ Uses premium Button/Card
// ✅ No crop/overflow issues

import { useEffect, useMemo, useState } from "react";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import Button from "./ui/Button.jsx";

import { getApiBase } from "../api/client.js";
import {
  parsePayload,
  titleOf,
  summaryOf,
  rowsForOverview,
  pretty,
  relTime,
  shortId,
  safeText,
} from "../lib/uiFormat.js";

function badgeTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "pending") return "warn";
  if (s === "in_progress") return "neutral";
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "neutral";
}

function draftTone(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("ready")) return "success";
  if (s.includes("approved")) return "success";
  if (s.includes("published")) return "success";
  if (s.includes("regenerat")) return "warn";
  if (s.includes("changes")) return "warn";
  if (s.includes("fail") || s.includes("error")) return "danger";
  return "neutral";
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

function asDisplay(v) {
  if (v == null) return "";
  if (typeof v === "string") return safeText(v, 220);
  if (Array.isArray(v)) return safeText(v.join(", "), 220);
  if (typeof v === "object") return safeText(pretty(v), 220);
  return String(v);
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

function packTitle(pack) {
  if (!pack) return "";
  return pack.title || pack.name || pack.summary || pack.goal || pack.topic || "";
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
function packType(pack) {
  if (!pack) return "";
  return pack.type || pack.postType || pack.format || pack.assetType || "";
}
function packReelScript(pack) {
  if (!pack) return "";
  return pack.reel_script || pack.reelScript || pack.script || "";
}
function packImagePrompt(pack) {
  if (!pack) return "";
  return pack.image_prompt || pack.imagePrompt || pack.visual_prompt || "";
}
function packPostTime(pack) {
  if (!pack) return "";
  return pack.post_time || pack.postTime || pack.suggestedTime || "";
}

function Pill({ label, value, onCopy, title }) {
  return (
    <span className="inline-flex items-center gap-2 min-w-0">
      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      <span
        className="min-w-0 max-w-[520px] truncate rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px]
                   dark:border-slate-800 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200"
        title={title || String(value || "")}
      >
        {value || "—"}
      </span>
      {onCopy ? (
        <Button variant="outline" size="sm" onClick={onCopy}>
          Copy
        </Button>
      ) : null}
    </span>
  );
}

export default function ProposalDetail({
  proposal,
  busy,

  // decision UI
  reason,
  setReason,
  onApprove,
  onReject,

  // draft UI/actions (optional)
  draft,
  draftBusy,
  onRequestChanges,
  onApproveDraft,
  onPublishDraft,
}) {
  const [showFull, setShowFull] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showDraftFull, setShowDraftFull] = useState(false);

  const apiBase = useMemo(() => getApiBase(), []);

  const payload = useMemo(() => parsePayload(proposal), [proposal]);
  const title = useMemo(() => (proposal ? titleOf(proposal) : "Proposal"), [proposal]);
  const summary = useMemo(() => (proposal ? summaryOf(proposal) : ""), [proposal]);
  const rows = useMemo(() => rowsForOverview(payload), [payload]);

  const resolvedDraft = useMemo(() => {
    const candidate =
      draft ||
      proposal?.latestDraft ||
      proposal?.draft ||
      proposal?.contentDraft ||
      proposal?.latest_execution ||
      proposal?.lastExecution ||
      null;
    return normalizeDraft(candidate);
  }, [draft, proposal]);

  const pack = resolvedDraft?.pack || null;

  useEffect(() => {
    setShowFull(false);
    setShowDraftFull(false);
    setFeedback("");
  }, [proposal?.id]);

  if (!proposal) {
    return (
      <Card className="min-w-0 h-full flex flex-col justify-center items-center text-center" variant="panel" padded="lg">
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Select a proposal</div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-[460px]">
          Soldakı queue-dan bir proposal seç — burada CEO Studio açılacaq.
        </div>
      </Card>
    );
  }

  const agent = proposal.agent_key || proposal.agentKey || proposal.agent || "—";
  const created = relTime(proposal.created_at || proposal.createdAt);
  const status = proposal.status || "pending";
  const statusLc = String(status || "").toLowerCase();

  const st = String(resolvedDraft?.status || "").toLowerCase();
  const isDraftRegenerating = st.includes("regenerat") || st.includes("changes");
  const isDraftApproved = st.includes("approved");
  const isDraftPublished = st.includes("published");
  const isDraftReady = st.includes("ready");

  const effectiveDraftBusy = Boolean(draftBusy || busy);
  const hasDraftId = Boolean(resolvedDraft?.id);

  const canRequestChanges = hasDraftId && typeof onRequestChanges === "function";
  const canApproveDraft =
    hasDraftId && typeof onApproveDraft === "function" && isDraftReady && !isDraftApproved && !isDraftPublished;
  const canPublish = hasDraftId && typeof onPublishDraft === "function" && isDraftApproved && !isDraftPublished;

  const rejectDisabled = Boolean(busy || !String(reason || "").trim());

  const copy = async (t) => {
    try {
      await navigator.clipboard.writeText(String(t || ""));
    } catch {}
  };

  const doRequestChanges = async () => {
    const text = String(feedback || "").trim();
    if (!text) return;
    if (!onRequestChanges || !resolvedDraft?.id) return;
    await onRequestChanges(String(proposal.id), String(resolvedDraft.id), text);
  };

  const doApproveDraft = async () => {
    if (!onApproveDraft || !resolvedDraft?.id) return;
    await onApproveDraft(String(proposal.id), String(resolvedDraft.id));
  };

  const doPublishDraft = async () => {
    if (!onPublishDraft || !resolvedDraft?.id) return;
    await onPublishDraft(String(proposal.id), String(resolvedDraft.id));
  };

  return (
    <Card className="min-w-0 p-0 overflow-hidden flex flex-col h-full" variant="elevated" padded={false} clip>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-start gap-2 min-w-0">
              <h2 className={cxTitle(showFull)} title={title}>
                {title}
              </h2>

              {String(title).length > 80 ? (
                <Button variant="outline" size="sm" onClick={() => setShowFull((v) => !v)} className="shrink-0">
                  {showFull ? "Less" : "More"}
                </Button>
              ) : null}
            </div>

            {summary ? (
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{summary}</div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Pill
                label="Backend"
                value={apiBase || "VITE_API_BASE missing"}
                title={apiBase || ""}
                onCopy={apiBase ? () => copy(apiBase) : null}
              />
              <span className="opacity-50">·</span>
              <Pill label="Agent" value={`${agent} · ${created}`} />
              <span className="opacity-50">·</span>
              <Pill
                label="Ref"
                value={`PR-${shortId(proposal.id).toUpperCase()}`}
                onCopy={() => copy(String(proposal.id))}
                title={String(proposal.id)}
              />
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Badge tone={badgeTone(status)}>{status}</Badge>
          </div>
        </div>
      </div>

      {/* Body scroll */}
      <div className="min-h-0 px-4 py-4 space-y-4 min-w-0 overflow-auto pb-24">
        {/* Draft Studio */}
        <Card variant="soft" tone={resolvedDraft?.status ? "info" : "neutral"} padded="md">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Draft Studio</div>
                {resolvedDraft?.status ? (
                  <Badge tone={draftTone(resolvedDraft.status)}>{resolvedDraft.status}</Badge>
                ) : (
                  <Badge tone="neutral">no draft</Badge>
                )}
                {typeof resolvedDraft?.version === "number" ? (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">v{resolvedDraft.version}</span>
                ) : null}
              </div>

              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Draft = n8n-in yaratdığı content pack (caption, hashtags, script, image prompt…)
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => copy(packCaption(pack))} disabled={!packCaption(pack)}>
                Copy caption
              </Button>
              <Button variant="outline" size="sm" onClick={() => copy(pretty(pack))} disabled={!pack}>
                Copy JSON
              </Button>
            </div>
          </div>

          {!pack ? (
            <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white/70 p-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              Hələ draft yoxdur. Pending → Approve etdikdən sonra proposal “Drafting” olacaq və draft burada görünəcək.
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-2 md:grid-cols-2 min-w-0">
                <Card variant="panel" padded="sm">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Type</div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 break-words">
                    {asDisplay(packType(pack) || "—")}
                  </div>

                  {packPostTime(pack) ? (
                    <>
                      <div className="mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        Suggested time
                      </div>
                      <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 break-words">
                        {asDisplay(packPostTime(pack))}
                      </div>
                    </>
                  ) : null}

                  {packTitle(pack) ? (
                    <>
                      <div className="mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">Topic</div>
                      <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 break-words">
                        {asDisplay(packTitle(pack))}
                      </div>
                    </>
                  ) : null}
                </Card>

                <Card variant="panel" padded="sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Hashtags</div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{packHashtags(pack).length || 0}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {packHashtags(pack).slice(0, 20).map((h, i) => (
                      <span
                        key={`${h}_${i}`}
                        className="text-[11px] rounded-full border border-slate-200 bg-white px-2 py-0.5
                                   dark:border-slate-800 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200"
                      >
                        {h.startsWith("#") ? h : `#${h}`}
                      </span>
                    ))}
                    {packHashtags(pack).length > 20 ? (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        +{packHashtags(pack).length - 20} more
                      </span>
                    ) : null}
                  </div>
                </Card>
              </div>

              <Card variant="panel" padded="sm" className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Caption</div>
                  <div className="flex items-center gap-2">
                    {String(packCaption(pack)).length > 240 ? (
                      <Button variant="outline" size="sm" onClick={() => setShowDraftFull((v) => !v)}>
                        {showDraftFull ? "Less" : "More"}
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(packCaption(pack))}
                      disabled={!packCaption(pack)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div
                  className={[
                    "mt-2 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words",
                    showDraftFull ? "" : "line-clamp-7",
                  ].join(" ")}
                >
                  {packCaption(pack) ? packCaption(pack) : "—"}
                </div>
              </Card>

              <div className="mt-3 grid gap-2 md:grid-cols-2 min-w-0">
                <details className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <summary className="cursor-pointer select-none text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Reel script
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
                    {packReelScript(pack) || "—"}
                  </pre>
                </details>

                <details className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 dark:border-slate-800/70 dark:bg-slate-900/40">
                  <summary className="cursor-pointer select-none text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Image prompt
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap break-words text-slate-800 dark:text-slate-100">
                    {packImagePrompt(pack) || "—"}
                  </pre>
                </details>
              </div>

              {/* Feedback + draft actions */}
              <Card variant="panel" padded="sm" className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Feedback</div>
                  {resolvedDraft?.lastFeedback ? (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Last: {safeText(resolvedDraft.lastFeedback, 70)}
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
                  placeholder='Məs: "Caption daha qısa olsun. 8 hashtag. CTA WhatsApp. Ton premium. Reel script 15 saniyə."'
                  disabled={effectiveDraftBusy || isDraftRegenerating}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    isLoading={effectiveDraftBusy && isDraftRegenerating}
                    disabled={effectiveDraftBusy || !canRequestChanges || !String(feedback || "").trim()}
                    onClick={doRequestChanges}
                    className="min-w-[180px]"
                  >
                    Request changes
                  </Button>

                  <Button
                    variant="primary"
                    isLoading={effectiveDraftBusy && !isDraftRegenerating}
                    disabled={effectiveDraftBusy || !canApproveDraft}
                    onClick={doApproveDraft}
                    className="min-w-[160px]"
                  >
                    Approve draft
                  </Button>

                  <Button
                    variant="primary"
                    isLoading={effectiveDraftBusy && !isDraftRegenerating}
                    disabled={effectiveDraftBusy || !canPublish}
                    onClick={doPublishDraft}
                    className="min-w-[160px]"
                  >
                    Publish
                  </Button>

                  {isDraftRegenerating ? (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 self-center">
                      Regenerating… (n8n işləyir)
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Request changes → n8n draft-ı yenidən qurur (v2, v3…).
                </div>
              </Card>
            </>
          )}
        </Card>

        {/* Overview */}
        <Card variant="soft" tone="neutral" padded="md">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Overview</div>

          {rows.length === 0 ? (
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Payload-da CEO üçün seçilən sahələr yoxdur.</div>
          ) : (
            <div className="mt-3 grid gap-2 md:grid-cols-2 min-w-0">
              {rows.map((r) => (
                <Card key={r.k} variant="panel" padded="sm">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{r.label}</div>
                  <div className="mt-1 text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                    {asDisplay(r.v)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Advanced */}
        <details className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30 min-w-0">
          <summary className="cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-200">
            Advanced (Raw payload)
          </summary>

          <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-white p-3 text-xs whitespace-pre-wrap break-words dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100">
            {pretty(payload)}
          </pre>
        </details>
      </div>

      {/* Sticky pending decision bar */}
      {statusLc === "pending" ? (
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-950/55 backdrop-blur-xl">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Decision</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Reject üçün reason məcburidir</div>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto] items-start">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none transition-all duration-200
                           focus:border-indigo-300/80 focus:ring-2 focus:ring-indigo-500/25 focus:ring-offset-2 focus:ring-offset-white
                           dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500/50 dark:focus:ring-indigo-500/25 dark:focus:ring-offset-slate-950"
                placeholder="Qısa reason / qeyd…"
              />

              <Button variant="primary" isLoading={busy} disabled={busy} onClick={onApprove} className="min-w-[140px]">
                Approve
              </Button>

              <Button
                variant="destructive"
                isLoading={busy && !rejectDisabled}
                disabled={rejectDisabled}
                onClick={onReject}
                className="min-w-[140px]"
                title={!String(reason || "").trim() ? "Reject üçün reason yaz" : ""}
              >
                Reject
              </Button>
            </div>

            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Approve → proposal Drafting olur → n8n content pack hazırlayır → burada görünür.
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function cxTitle(showFull) {
  return ["text-base sm:text-lg font-semibold leading-snug min-w-0", showFull ? "break-words" : "line-clamp-2 break-words"].join(
    " "
  );
}