import { useEffect, useMemo, useState, useCallback } from "react";
import {
  MessageCircle,
  RefreshCw,
  Instagram,
  Facebook,
  MessageSquareText,
  ShieldAlert,
  CheckCircle2,
  Clock3,
  Search,
  Filter,
  Bot,
  UserRound,
  Globe,
  Ban,
  Send,
} from "lucide-react";
import { apiGet, apiPost } from "../api/client.js";

function s(v) {
  return String(v ?? "").trim();
}

function StatCard({ label, value, icon: Icon, tone = "neutral" }) {
  const toneMap = {
    neutral:
      "border-white/10 bg-white/[0.03] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.06] text-white shadow-[0_18px_40px_rgba(34,211,238,0.08)]",
    emerald:
      "border-emerald-300/20 bg-emerald-300/[0.06] text-white shadow-[0_18px_40px_rgba(16,185,129,0.08)]",
    amber:
      "border-amber-300/20 bg-amber-300/[0.06] text-white shadow-[0_18px_40px_rgba(245,158,11,0.08)]",
  };

  return (
    <div className={`rounded-[24px] border p-5 backdrop-blur-xl ${toneMap[tone] || toneMap.neutral}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</div>
          <div className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-white">{value}</div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon className="h-4 w-4 text-white/72" />
        </div>
      </div>
    </div>
  );
}

function fmtRelative(input) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";

  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

function channelIcon(channel) {
  const c = String(channel || "").toLowerCase();
  if (c.includes("instagram")) return Instagram;
  if (c.includes("facebook")) return Facebook;
  if (c.includes("messenger")) return MessageSquareText;
  return Globe;
}

function channelTone(channel) {
  const c = String(channel || "").toLowerCase();
  if (c.includes("instagram")) return "text-pink-200 border-pink-400/20 bg-pink-400/[0.06]";
  if (c.includes("facebook")) return "text-blue-200 border-blue-400/20 bg-blue-400/[0.06]";
  if (c.includes("messenger")) return "text-cyan-200 border-cyan-400/20 bg-cyan-400/[0.06]";
  return "text-white/80 border-white/10 bg-white/[0.04]";
}

function statusTone(status) {
  const s = String(status || "").toLowerCase();

  if (s === "replied" || s === "approved" || s === "reviewed") {
    return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100";
  }

  if (s === "pending" || s === "manual_review") {
    return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  }

  if (s === "flagged" || s === "ignored") {
    return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  }

  return "border-white/10 bg-white/[0.05] text-white/72";
}

function sentimentTone(sentiment) {
  const x = String(sentiment || "").toLowerCase();
  if (x === "positive") return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100";
  if (x === "negative") return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (x === "mixed") return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  return "border-white/10 bg-white/[0.05] text-white/72";
}

function priorityTone(priority) {
  const p = String(priority || "").toLowerCase();
  if (p === "urgent") return "border-rose-500/25 bg-rose-500/[0.12] text-rose-100";
  if (p === "high") return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (p === "medium") return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  return "border-white/10 bg-white/[0.05] text-white/72";
}

function categoryToFallbackStatus(category) {
  const c = String(category || "").toLowerCase();
  if (c === "spam" || c === "toxic") return "flagged";
  if (c === "sales" || c === "support") return "pending";
  return "pending";
}

function pickUiStatus(classification = {}) {
  const moderationStatus = s(classification?.moderation?.status || "").toLowerCase();
  if (moderationStatus) return moderationStatus;
  return categoryToFallbackStatus(classification?.category);
}

function mapCommentToUi(row) {
  const classification = row?.classification || {};
  const raw = row?.raw || {};
  const moderation = classification?.moderation || {};
  const reply = classification?.reply || {};

  return {
    id: s(row?.id || ""),
    platform: s(row?.channel || "other"),
    author:
      s(row?.customer_name || "") ||
      s(row?.external_username || "") ||
      s(row?.external_user_id || "") ||
      "Unknown user",
    text: s(row?.text || ""),
    postTitle: s(row?.external_post_id || "") || "Post",
    status: pickUiStatus(classification),
    sentiment: s(classification?.sentiment || "neutral").toLowerCase() || "neutral",
    priority: s(classification?.priority || "low").toLowerCase() || "low",
    assignedTo: classification?.requiresHuman ? "Manual Review" : "AI Copilot",
    createdAt: row?.created_at || row?.updated_at || null,
    suggestedReply:
      s(reply?.text || "") ||
      s(classification?.replySuggestion || ""),
    category: s(classification?.category || "unknown").toLowerCase(),
    requiresHuman: Boolean(classification?.requiresHuman),
    shouldCreateLead: Boolean(classification?.shouldCreateLead),
    externalCommentId: s(row?.external_comment_id || ""),
    externalPostId: s(row?.external_post_id || ""),
    externalUsername: s(row?.external_username || ""),
    externalUserId: s(row?.external_user_id || ""),
    source: s(row?.source || ""),
    moderationActor: s(moderation?.actor || ""),
    moderationNote: s(moderation?.note || ""),
    moderationReason: s(moderation?.reason || ""),
    moderationUpdatedAt: moderation?.updatedAt || null,
    replyApproved: Boolean(reply?.approved),
    replySent: Boolean(reply?.sent),
    raw,
    original: row,
  };
}

function CommentRow({ item, selected, onSelect }) {
  const Icon = channelIcon(item.platform);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
        selected
          ? "border-cyan-400/20 bg-cyan-400/[0.05]"
          : "border-white/8 bg-black/20 hover:border-white/12 hover:bg-black/26"
      }`}
    >
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.7fr] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${channelTone(item.platform)}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="truncate text-sm font-semibold text-white">{item.author}</div>
          </div>
          <div className="mt-1 truncate text-xs text-white/42">{item.postTitle}</div>
        </div>

        <div className="truncate text-sm text-white/66">{item.text}</div>

        <div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${statusTone(item.status)}`}>
            {item.status}
          </span>
        </div>

        <div>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${sentimentTone(item.sentiment)}`}>
            {item.sentiment}
          </span>
        </div>

        <div className="text-right">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${priorityTone(item.priority)}`}>
            {item.priority}
          </span>
        </div>
      </div>
    </button>
  );
}

function MiniInfo({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">{label}</div>
      <div className="mt-2 flex items-center gap-2 text-sm text-white/76">
        {Icon ? <Icon className="h-4 w-4 text-white/42" /> : null}
        <span>{value || "—"}</span>
      </div>
    </div>
  );
}

export default function Comments() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadComments = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const params = new URLSearchParams();
      params.set("tenantKey", "neox");
      params.set("limit", "100");

      const response = await apiGet(`/api/comments?${params.toString()}`);
      const mapped = Array.isArray(response?.comments)
        ? response.comments.map(mapCommentToUi)
        : [];

      setItems(mapped);
    } catch (e) {
      setError(String(e?.message || e || "Failed to load comments"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const okStatus = statusFilter === "all" || item.status === statusFilter;

      const q = search.trim().toLowerCase();
      const okSearch =
        !q ||
        item.author.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        item.postTitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      return okStatus && okSearch;
    });
  }, [items, statusFilter, search]);

  const selected = useMemo(
    () => filtered.find((x) => x.id === selectedId) || null,
    [filtered, selectedId]
  );

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId("");
      return;
    }

    if (!selectedId) {
      setSelectedId(filtered[0].id);
      return;
    }

    const exists = filtered.some((x) => x.id === selectedId);
    if (!exists) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    setReplyDraft(selected?.suggestedReply || "");
  }, [selected?.id, selected?.suggestedReply]);

  const stats = useMemo(() => {
    let pending = 0;
    let replied = 0;
    let flagged = 0;

    for (const item of items) {
      if (item.status === "pending" || item.status === "manual_review") pending += 1;
      if (item.status === "replied" || item.status === "approved" || item.status === "reviewed") replied += 1;
      if (item.status === "flagged" || item.status === "ignored") flagged += 1;
    }

    return {
      total: items.length,
      pending,
      replied,
      flagged,
    };
  }, [items]);

  async function handleReview(status) {
    if (!selected?.id) return;

    try {
      setActionLoading(`review:${status}`);

      const j = await apiPost(`/api/comments/${selected.id}/review`, {
        status,
        actor: "ceo",
        note: status === "manual_review" ? "Sent to manual review" : "",
      });

      if (j?.ok === false) {
        throw new Error(j?.error || j?.details?.message || "Failed to review comment");
      }

      await loadComments({ silent: true });
    } catch (e) {
      setError(String(e?.message || e || "Failed to review comment"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleReplySave() {
    if (!selected?.id) return;

    const replyText = s(replyDraft);
    if (!replyText) {
      setError("Reply text is required");
      return;
    }

    try {
      setActionLoading("reply");

      const j = await apiPost(`/api/comments/${selected.id}/reply`, {
        replyText,
        actor: "ceo",
        approved: true,
      });

      if (j?.ok === false) {
        throw new Error(j?.error || j?.details?.message || "Failed to save reply");
      }

      await loadComments({ silent: true });
    } catch (e) {
      setError(String(e?.message || e || "Failed to save reply"));
    } finally {
      setActionLoading("");
    }
  }

  async function handleIgnore() {
    if (!selected?.id) return;

    try {
      setActionLoading("ignore");

      const j = await apiPost(`/api/comments/${selected.id}/ignore`, {
        actor: "ceo",
        note: "Ignored from comments panel",
      });

      if (j?.ok === false) {
        throw new Error(j?.error || j?.details?.message || "Failed to ignore comment");
      }

      await loadComments({ silent: true });
    } catch (e) {
      setError(String(e?.message || e || "Failed to ignore comment"));
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div className="min-h-screen px-6 pb-6 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[30px] font-semibold tracking-[-0.05em] text-white">
            Comments
          </div>
          <div className="mt-2 text-sm text-white/46">
            Sosial media comment axını üçün moderation, AI reply və operator review paneli.
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadComments({ silent: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Comments" value={stats.total} icon={MessageCircle} />
        <StatCard label="Pending Review" value={stats.pending} icon={Clock3} tone="amber" />
        <StatCard label="Replied / Reviewed" value={stats.replied} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Flagged / Ignored" value={stats.flagged} icon={ShieldAlert} tone="cyan" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-4">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                Comment Stream
              </div>
              <div className="mt-1 text-sm text-white/46">
                Post altı rəylər, sentiment və cavab axını.
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/34" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Author, text, post..."
                  className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-white/16"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "pending", "manual_review", "reviewed", "replied", "flagged", "ignored"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${
                      statusFilter === status
                        ? "border-white/10 bg-white/[0.04] text-white/78"
                        : "border-white/10 bg-white/[0.02] text-white/44 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/70"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="hidden xl:grid xl:grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.7fr] xl:gap-3 xl:px-2 xl:text-[11px] xl:uppercase xl:tracking-[0.18em] xl:text-white/28">
              <div>Author</div>
              <div>Comment</div>
              <div>Status</div>
              <div>Sentiment</div>
              <div className="text-right">Priority</div>
            </div>

            {loading ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center">
                <div className="text-sm font-medium text-white/64">Loading comments...</div>
              </div>
            ) : error ? (
              <div className="rounded-[22px] border border-dashed border-rose-400/20 bg-rose-400/[0.04] px-4 py-10 text-center">
                <div className="text-sm font-medium text-rose-100">Failed to load comments</div>
                <div className="mt-2 text-sm leading-6 text-rose-100/70">{error}</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center">
                <div className="text-sm font-medium text-white/64">No comments</div>
                <div className="mt-2 text-sm leading-6 text-white/40">
                  Hələ comment yoxdur və ya filter nəticə qaytarmadı.
                </div>
              </div>
            ) : (
              filtered.map((item) => (
                <CommentRow
                  key={item.id}
                  item={item}
                  selected={selected?.id === item.id}
                  onSelect={(row) => setSelectedId(row.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <MessageCircle className="h-4 w-4 text-white/72" />
              </div>
              <div>
                <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
                  Comment Detail
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Seçilmiş comment üçün moderation paneli.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 p-4">
              {!selected ? (
                <div className="px-2 py-8 text-center">
                  <div className="text-sm font-medium text-white/64">No comment selected</div>
                  <div className="mt-2 text-sm leading-6 text-white/40">
                    Sol tərəfdən bir comment seç.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[18px] font-semibold tracking-[-0.03em] text-white">
                        {selected.author}
                      </div>
                      <div className="mt-1 text-sm text-white/44">{selected.postTitle}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${statusTone(selected.status)}`}>
                        {selected.status}
                      </span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${priorityTone(selected.priority)}`}>
                        {selected.priority}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                      Original Comment
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/78">
                      {selected.text || "—"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MiniInfo label="Platform" value={selected.platform} icon={Filter} />
                    <MiniInfo label="Sentiment" value={selected.sentiment} icon={ShieldAlert} />
                    <MiniInfo label="Assigned to" value={selected.assignedTo} icon={UserRound} />
                    <MiniInfo label="Created" value={fmtRelative(selected.createdAt)} icon={Clock3} />
                    <MiniInfo label="Category" value={selected.category} icon={Bot} />
                    <MiniInfo label="Lead Intent" value={selected.shouldCreateLead ? "Yes" : "No"} icon={CheckCircle2} />
                    <MiniInfo label="Moderated by" value={selected.moderationActor || "—"} icon={UserRound} />
                    <MiniInfo label="Moderation update" value={fmtRelative(selected.moderationUpdatedAt)} icon={Clock3} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
                      <Bot className="h-3.5 w-3.5" />
                      Suggested Reply
                    </div>

                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      rows={5}
                      placeholder="Reply draft..."
                      className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/28 focus:border-white/16"
                    />
                  </div>

                  {!!selected.moderationNote && (
                    <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Moderation Note
                      </div>
                      <div className="mt-2 text-sm leading-6 text-white/76">
                        {selected.moderationNote}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleReplySave}
                      disabled={actionLoading === "reply"}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.08] px-4 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {actionLoading === "reply" ? "Saving..." : "Save Reply"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReview("manual_review")}
                      disabled={actionLoading === "review:manual_review"}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/78 transition hover:border-white/16 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      {actionLoading === "review:manual_review" ? "Saving..." : "Manual Review"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReview("reviewed")}
                      disabled={actionLoading === "review:reviewed"}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] px-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {actionLoading === "review:reviewed" ? "Saving..." : "Mark Reviewed"}
                    </button>

                    <button
                      type="button"
                      onClick={handleIgnore}
                      disabled={actionLoading === "ignore"}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/[0.08] px-4 text-sm font-medium text-rose-100 transition hover:bg-rose-400/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Ban className="h-4 w-4" />
                      {actionLoading === "ignore" ? "Saving..." : "Ignore"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
              System Note
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm leading-6 text-white/62">
              Bu səhifə indi real backend-dən `/api/comments` oxuyur və action endpoint-lərinə bağlıdır:
              review, reply, ignore. Növbəti addım Meta reply executor və live websocket item-level sync olacaq.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}