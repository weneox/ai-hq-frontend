import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { getApiBase } from "../../api/client.js";
import { fetchLatestDraft } from "../../features/proposals/proposal.api.js";
import { DetailSection, MetaRow } from "./ProposalSections.jsx";
import { GlassButton, ToneBadge, cn } from "./proposal-ui.jsx";
import {
  asDisplay,
  firstNonEmpty,
  getAssetUrlsFromEverywhere,
  isAssetReadyStatus,
  normalizeDraft,
  packAssetSpecs,
  packCaption,
  packCompliance,
  packCta,
  packDesign,
  packHashtags,
  packHook,
  packImagePrompt,
  packKeyPoints,
  packLanguage,
  packMusic,
  packPlatform,
  packPostTime,
  packReelScript,
  packShotDuration,
  packStoryboard,
  packType,
  pickDraftCandidate,
  pickPayloadObj,
  pretty,
  rawStatusOf,
  relTime,
  shortId,
  stageOf,
  stageTone,
  summaryOf,
  titleFrom,
} from "../../features/proposals/proposal.selectors.js";

function readString(v) {
  return typeof v === "string" ? v : "";
}

export default function ProposalExpanded({
  item,
  onClose,
  onApprove,
  onReject,
  onPublish,
  onRequestChanges,
  busy,
}) {
  const apiBase = useMemo(() => getApiBase(), []);
  const [tab, setTab] = useState("design");
  const [feedback, setFeedback] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [fetchedDraftRaw, setFetchedDraftRaw] = useState(null);
  const [fetchingDraft, setFetchingDraft] = useState(false);
  const [showInputs, setShowInputs] = useState(true);

  const resolvedDraft = useMemo(() => {
    const primary = pickDraftCandidate(item);
    const normalizedPrimary = normalizeDraft(primary);

    if (normalizedPrimary?.id) return normalizedPrimary;

    const normalizedFetched = normalizeDraft(fetchedDraftRaw);
    if (normalizedFetched?.id) return normalizedFetched;

    return normalizedPrimary || normalizedFetched || null;
  }, [item, fetchedDraftRaw]);

  const pack = resolvedDraft?.pack || null;

  useEffect(() => {
    setFeedback("");
    setRejectReason("");
    setFetchedDraftRaw(null);
    setTab("design");
    setShowInputs(true);
  }, [item?.id]);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!item?.id) return;

      const candidate = pickDraftCandidate(item);
      const normalized = normalizeDraft(candidate);

      if (normalized?.pack && normalized?.id) return;
      if (!apiBase) return;

      setFetchingDraft(true);

      try {
        const next = await fetchLatestDraft(apiBase, item.id);
        if (!alive) return;
        setFetchedDraftRaw(next);
      } catch {
      } finally {
        if (alive) setFetchingDraft(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [apiBase, item?.id]);

  const title = titleFrom(item);
  const summary = summaryOf(item);

  const proposalStatus = String(item?.status || "draft").toLowerCase();
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
    (draftStatusLc.includes("ready") ||
      draftStatusLc === "" ||
      draftStatusLc.includes("draft"));

  const assetUrls = getAssetUrlsFromEverywhere(item, resolvedDraft, pack);
  const hasPublishableAsset = assetUrls.length > 0;

  const isAssetReady =
    isAssetReadyStatus(resolvedDraft?.status) ||
    isAssetReadyStatus(proposalStatus) ||
    (isApproved && hasPublishableAsset);

  const canPublish =
    Boolean(resolvedDraft?.id) &&
    hasPublishableAsset &&
    isAssetReady &&
    !isPublished &&
    !isRejected;

  const effectiveBusy = Boolean(busy || fetchingDraft);

  const agent = item?.agent_key || item?.agentKey || item?.agent || "—";
  const created = relTime(item?.created_at || item?.createdAt);
  const payloadObj = pickPayloadObj(item);

  const lang =
    packLanguage(pack) ||
    readString(payloadObj?.language) ||
    readString(payloadObj?.lang) ||
    "";

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
  const captionText = firstNonEmpty(
    packCaption(pack),
    pack?.headline,
    pack?.copy,
    pack?.summary
  );

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

  const doApprove = async () => {
    if (!resolvedDraft?.id || !onApprove) return;
    await onApprove(item, resolvedDraft);
  };

  const doReject = async () => {
    if (!resolvedDraft?.id || !onReject || !String(rejectReason || "").trim()) return;
    await onReject(item, resolvedDraft, String(rejectReason || "").trim());
    setRejectReason("");
  };

  const doPublish = async () => {
    if (!resolvedDraft?.id || !onPublish || !canPublish) return;
    await onPublish(item, resolvedDraft);
  };

  const doRequestChanges = async () => {
    if (!resolvedDraft?.id || !onRequestChanges) return;
    const fb = String(feedback || "").trim();
    if (!fb) return;
    await onRequestChanges(item, resolvedDraft, fb);
    setFeedback("");
  };

  const tabs = [
    { value: "design", label: "Design" },
    { value: "script", label: "Script" },
    { value: "storyboard", label: "Storyboard" },
    { value: "specs", label: "Specs" },
    { value: "raw", label: "Raw" },
  ];

  return (
    <motion.div
      layoutId={`proposal-card-${item?.id}`}
      className="relative overflow-hidden rounded-[32px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(8,14,24,0.90),rgba(5,9,18,0.82))] shadow-[0_28px_90px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_circle_at_0%_0%,rgba(34,211,238,0.08),transparent_28%),radial-gradient(620px_circle_at_100%_0%,rgba(99,102,241,0.10),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%)]" />

      <div className="relative border-b border-white/[0.07] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ToneBadge tone={stageTone(stageOf(item), rawStatusOf(item))}>
                {stageOf(item) === "draft" ? "Draft" : stageOf(item)}
              </ToneBadge>

              {postType ? <ToneBadge tone="neutral">{postType}</ToneBadge> : null}

              <ToneBadge
                tone={String(resolvedDraft?.status || "").includes("ready") ? "success" : "neutral"}
              >
                {resolvedDraft?.status || (fetchingDraft ? "loading…" : "no draft")}
                {typeof resolvedDraft?.version === "number" ? ` · v${resolvedDraft.version}` : ""}
              </ToneBadge>

              {isAssetReady ? <ToneBadge tone="success">asset ready</ToneBadge> : null}
            </div>

            <h2 className="mt-3 max-w-[900px] text-[24px] font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-[32px]">
              {title}
            </h2>

            {summary ? (
              <div className="mt-2 max-w-[920px] text-[13px] leading-6 text-white/46">
                {summary}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/40">
              <span className="font-medium text-white/58">
                PR-{shortId(item?.id).toUpperCase()}
              </span>
              <span>·</span>
              <span>{agent}</span>
              {created ? (
                <>
                  <span>·</span>
                  <span>{created}</span>
                </>
              ) : null}
              <span>·</span>
              <span>{apiBase || "VITE_API_BASE missing"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <GlassButton onClick={() => copy(String(item?.id || ""))}>
              <Copy className="h-4 w-4" />
              Copy ID
            </GlassButton>

            <GlassButton onClick={() => copy(captionText)} disabled={!captionText}>
              <Copy className="h-4 w-4" />
              Copy caption
            </GlassButton>

            <GlassButton onClick={() => copyJson(pack || resolvedDraft?.raw || item)}>
              <Copy className="h-4 w-4" />
              Copy JSON
            </GlassButton>

            <GlassButton
              variant="primary"
              onClick={doApprove}
              disabled={
                effectiveBusy ||
                !resolvedDraft?.id ||
                !isDraftStage ||
                !isDraftReady ||
                isRejected ||
                isPublished
              }
            >
              <Check className="h-4 w-4" />
              Approve
            </GlassButton>

            <GlassButton
              variant="danger"
              onClick={doReject}
              disabled={
                effectiveBusy ||
                !resolvedDraft?.id ||
                !isDraftStage ||
                isRejected ||
                isPublished ||
                !String(rejectReason || "").trim()
              }
            >
              <X className="h-4 w-4" />
              Reject
            </GlassButton>

            <GlassButton
              variant="primary"
              onClick={doPublish}
              disabled={effectiveBusy || !canPublish}
              className="bg-cyan-300/14"
              title={
                effectiveBusy
                  ? "Busy"
                  : !resolvedDraft?.id
                    ? "Content ID missing"
                    : isRejected
                      ? "Rejected"
                      : isPublished
                        ? "Already published"
                        : !hasPublishableAsset
                          ? "Asset URL missing"
                          : !isAssetReady
                            ? "Asset not ready yet"
                            : ""
              }
            >
              <Send className="h-4 w-4" />
              Publish
            </GlassButton>

            <GlassButton onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </GlassButton>
          </div>
        </div>
      </div>

      <div className="relative px-5 py-5 md:px-6 md:py-6">
        {!pack ? (
          <DetailSection
            title="Draft Studio"
            right={<div className="text-[11px] text-white/34">{fetchingDraft ? "Loading…" : ""}</div>}
          >
            <div className="text-[13px] text-white/48">
              {fetchingDraft ? "Draft axtarıram… /api/content?proposalId=..." : "Draft görünmür."}
            </div>
          </DetailSection>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_320px]">
            <div className="min-w-0 space-y-5">
              <DetailSection
                title="Caption"
                right={
                  <div className="flex items-center gap-2 text-[11px] text-white/34">
                    <Clock3 className="h-3.5 w-3.5" />
                    Canvas focus view
                  </div>
                }
              >
                <div className="whitespace-pre-wrap break-words text-[14px] leading-[1.9] text-white/84">
                  {captionText || "—"}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ToneBadge tone="neutral">{platform}</ToneBadge>
                  <ToneBadge tone="neutral">{lang || "—"}</ToneBadge>
                  <ToneBadge tone="neutral">{postType || "—"}</ToneBadge>
                  {postTime ? <ToneBadge tone="neutral">Time: {postTime}</ToneBadge> : null}
                  {cta ? <ToneBadge tone="neutral">CTA: {cta}</ToneBadge> : null}
                  {duration ? <ToneBadge tone="neutral">Dur: {duration}</ToneBadge> : null}
                  {hasPublishableAsset ? <ToneBadge tone="success">Asset linked</ToneBadge> : null}
                  {hook ? <ToneBadge tone="neutral">Hook: {hook}</ToneBadge> : null}
                </div>

                {keyPoints ? (
                  <div className="mt-4 rounded-[18px] border border-white/[0.06] bg-black/10 p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-white/34">
                      Key points
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-6 text-white/74">
                      {asDisplay(keyPoints) || "—"}
                    </pre>
                  </div>
                ) : null}
              </DetailSection>

              <div className="flex flex-wrap items-center gap-2">
                {tabs.map((t) => {
                  const active = tab === t.value;

                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTab(t.value)}
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-[12px] font-medium transition",
                        active
                          ? "border-white/[0.12] bg-white/[0.09] text-white"
                          : "border-white/[0.06] bg-white/[0.03] text-white/56 hover:bg-white/[0.05] hover:text-white/82"
                      )}
                    >
                      {t.label}
                    </button>
                  );
                })}

                {isRegenerating ? (
                  <span className="ml-2 text-[11px] text-white/34">Regenerating…</span>
                ) : null}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  <DetailSection title={tab}>
                    {tab === "design" ? (
                      <>
                        <div className="whitespace-pre-wrap break-words text-[13px] leading-7 text-white/76">
                          {design || "—"}
                        </div>

                        {imgPrompt ? (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-[11px] font-semibold text-white/42">
                              Image prompt
                            </summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-6 text-white/68">
                              {imgPrompt}
                            </pre>
                          </details>
                        ) : null}

                        {compliance ? (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-[11px] font-semibold text-white/42">
                              Compliance / Notes
                            </summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-6 text-white/68">
                              {compliance}
                            </pre>
                          </details>
                        ) : null}

                        {hasPublishableAsset ? (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-[11px] font-semibold text-white/42">
                              Asset URLs
                            </summary>
                            <pre className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-6 text-white/68">
                              {assetUrls.join("\n")}
                            </pre>
                          </details>
                        ) : null}
                      </>
                    ) : tab === "script" ? (
                      <>
                        <pre className="whitespace-pre-wrap break-words text-[13px] leading-7 text-white/76">
                          {script || "—"}
                        </pre>

                        {packMusic(pack) ? (
                          <div className="mt-3 text-[12px] text-white/48">
                            <b>Music/SFX:</b> {packMusic(pack)}
                          </div>
                        ) : null}
                      </>
                    ) : tab === "storyboard" ? (
                      <pre className="whitespace-pre-wrap break-words text-[13px] leading-7 text-white/76">
                        {asDisplay(storyboard) || "—"}
                      </pre>
                    ) : tab === "specs" ? (
                      <pre className="whitespace-pre-wrap break-words text-[13px] leading-7 text-white/76">
                        {asDisplay(specs) || "—"}
                      </pre>
                    ) : (
                      <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words text-[12px] leading-6 text-white/66">
                        {pretty({
                          proposal: item,
                          draft: resolvedDraft,
                          fetchedDraftRaw,
                          assetUrls,
                          canPublish,
                          isAssetReady,
                        })}
                      </pre>
                    )}
                  </DetailSection>
                </motion.div>
              </AnimatePresence>

              {showInputs ? (
                <DetailSection
                  title="Feedback loop"
                  right={<div className="text-[11px] text-white/34">Loop</div>}
                >
                  <div className="text-[12px] leading-6 text-white/44">
                    Request changes → n8n revise → yeni draft → yenə approve / reject / publish.
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
                        Change request
                      </div>

                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={5}
                        className="mt-2 w-full rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-3 text-[13px] text-white outline-none placeholder:text-white/24 focus:border-cyan-300/20"
                        placeholder='Məs: "Caption daha qısa. 8 hashtag. CTA WhatsApp. Dizaynda 3 kadr..."'
                        disabled={effectiveBusy || isRegenerating || isRejected || isPublished}
                      />

                      <div className="mt-3">
                        <GlassButton
                          onClick={doRequestChanges}
                          disabled={
                            effectiveBusy ||
                            !resolvedDraft?.id ||
                            !showInputs ||
                            !String(feedback || "").trim() ||
                            isRejected ||
                            isPublished
                          }
                        >
                          <Send className="h-4 w-4" />
                          Request changes
                        </GlassButton>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/38">
                        Reject reason
                      </div>

                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="mt-2 h-12 w-full rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-3 text-[13px] text-white outline-none placeholder:text-white/24 focus:border-rose-300/20"
                        placeholder='Məs: "Brand uyğun deyil"...'
                        disabled={effectiveBusy || isRegenerating}
                      />

                      {resolvedDraft?.lastFeedback ? (
                        <div className="mt-3 text-[12px] leading-6 text-white/42">
                          <b>Last feedback:</b> {String(resolvedDraft.lastFeedback).slice(0, 140)}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </DetailSection>
              ) : null}

              <button
                type="button"
                onClick={() => setShowInputs((v) => !v)}
                className="text-[12px] font-medium text-white/42 transition hover:text-white/72"
              >
                {showInputs ? "Hide inputs" : "Show inputs"}
              </button>
            </div>

            <div className="min-w-0 space-y-5">
              <DetailSection title="Overview">
                <div className="space-y-3 text-[13px] text-white/70">
                  <MetaRow k="Platform" v={platform} />
                  <MetaRow k="Language" v={lang || "—"} />
                  <MetaRow k="Format" v={postType || "—"} />
                  <MetaRow k="Post time" v={postTime || "—"} />
                  <MetaRow k="CTA" v={cta || "—"} />
                  <MetaRow k="Content ID" v={resolvedDraft?.id || "—"} />
                  <MetaRow
                    k="Updated"
                    v={resolvedDraft?.updatedAt ? relTime(resolvedDraft.updatedAt) : "—"}
                  />
                  <MetaRow k="Draft status" v={resolvedDraft?.status || "—"} />
                  <MetaRow
                    k="Assets"
                    v={hasPublishableAsset ? `${assetUrls.length} linked` : "—"}
                  />
                  <MetaRow k="Publish ready" v={canPublish ? "yes" : "no"} />
                </div>
              </DetailSection>

              <DetailSection
                title="Hashtags"
                right={
                  <div className="flex items-center gap-1 text-[11px] text-white/34">
                    <Sparkles className="h-3.5 w-3.5" />
                    {hashtags.length}
                  </div>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {hashtags.length ? (
                    hashtags.slice(0, 36).map((tag, i) => (
                      <span
                        key={`${tag}_${i}`}
                        className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/68"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <div className="text-[12px] text-white/30">No hashtags</div>
                  )}
                </div>
              </DetailSection>

              {hook ? (
                <DetailSection title="Hook / Angle">
                  <div className="whitespace-pre-wrap break-words text-[13px] leading-7 text-white/76">
                    {hook}
                  </div>
                </DetailSection>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}