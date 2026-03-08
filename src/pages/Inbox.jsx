import { useEffect, useMemo, useState } from "react";
import {
  MessageSquareText,
  Sparkles,
  UserRound,
  AlertTriangle,
  RefreshCw,
  Instagram,
  Facebook,
  MessageCircleMore,
  Mail,
  Globe,
} from "lucide-react";

function getApiBase() {
  const raw = String(import.meta.env.VITE_API_BASE || "").trim();
  return raw ? raw.replace(/\/+$/, "") : "";
}

async function readJsonSafe(r) {
  const text = await r.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function apiGet(path) {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");
  const r = await fetch(`${base}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const j = await readJsonSafe(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(j?.error || j?.details?.message || "Request failed");
  }
  return j;
}

async function apiPost(path, body = {}) {
  const base = getApiBase();
  if (!base) throw new Error("VITE_API_BASE is not set");
  const r = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const j = await readJsonSafe(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(j?.error || j?.details?.message || "Request failed");
  }
  return j;
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
  if (c === "instagram") return Instagram;
  if (c === "facebook") return Facebook;
  if (c === "whatsapp") return MessageCircleMore;
  if (c === "email") return Mail;
  return Globe;
}

function channelTone(channel) {
  const c = String(channel || "").toLowerCase();
  if (c === "instagram") return "text-pink-200 border-pink-400/20 bg-pink-400/[0.06]";
  if (c === "facebook") return "text-blue-200 border-blue-400/20 bg-blue-400/[0.06]";
  if (c === "whatsapp") return "text-emerald-200 border-emerald-400/20 bg-emerald-400/[0.06]";
  if (c === "email") return "text-amber-100 border-amber-300/20 bg-amber-300/[0.06]";
  return "text-white/80 border-white/10 bg-white/[0.04]";
}

function mapThreadStatus(thread) {
  const unread = Number(thread?.unread_count || 0);
  const assigned = String(thread?.assigned_to || "").trim();
  const status = String(thread?.status || "open").toLowerCase();

  if (status === "resolved" || status === "closed") return "resolved";
  if (assigned) return "needs_human";
  if (unread > 0) return "open";
  return "ai_replied";
}

function StatCard({ label, value, icon: Icon, tone = "neutral" }) {
  const toneMap = {
    neutral:
      "border-white/10 bg-white/[0.03] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.06] text-white shadow-[0_18px_40px_rgba(34,211,238,0.08)]",
    amber:
      "border-amber-300/20 bg-amber-300/[0.06] text-white shadow-[0_18px_40px_rgba(251,191,36,0.08)]",
  };

  return (
    <div
      className={`rounded-[24px] border p-5 backdrop-blur-xl ${toneMap[tone] || toneMap.neutral}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            {label}
          </div>
          <div className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-white">
            {value}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon className="h-4 w-4 text-white/72" />
        </div>
      </div>
    </div>
  );
}

function ThreadCard({ thread, selected, onOpen }) {
  const derivedStatus = mapThreadStatus(thread);

  const statusMap = {
    open: "bg-white/10 text-white/80 border-white/10",
    ai_replied: "bg-cyan-400/[0.08] text-cyan-100 border-cyan-400/20",
    needs_human: "bg-amber-300/[0.08] text-amber-100 border-amber-300/20",
    resolved: "bg-emerald-400/[0.08] text-emerald-100 border-emerald-400/20",
  };

  const ChannelIcon = channelIcon(thread.channel);

  const name =
    thread.customer_name ||
    thread.external_username ||
    thread.external_user_id ||
    "Unknown user";

  const handle = thread.external_username
    ? `@${thread.external_username.replace(/^@+/, "")}`
    : thread.external_user_id || "—";

  const preview = thread.last_message_text || "No messages yet";
  const unread = Number(thread.unread_count || 0);

  return (
    <div
      className={[
        "group rounded-[26px] border p-5 transition duration-200",
        selected
          ? "border-cyan-400/22 bg-cyan-400/[0.05]"
          : "border-white/10 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.04]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${channelTone(
                thread.channel
              )}`}
            >
              <ChannelIcon className="h-3.5 w-3.5" />
            </div>

            <div className="truncate text-[15px] font-semibold tracking-[-0.03em] text-white">
              {name}
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/42">
              {thread.channel || "other"}
            </span>

            {unread > 0 ? (
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-100">
                {unread} unread
              </span>
            ) : null}
          </div>

          <div className="mt-1 truncate text-sm text-white/44">{handle}</div>
        </div>

        <div
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${
            statusMap[derivedStatus] || statusMap.open
          }`}
        >
          {derivedStatus.replace("_", " ")}
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/62">{preview}</p>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/30">
          {fmtRelative(thread.last_message_at || thread.updated_at || thread.created_at)}
        </div>

        <button
          type="button"
          onClick={() => onOpen?.(thread)}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium tracking-[0.01em] text-white/72 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
        >
          Open
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ m }) {
  const inbound = m.direction === "inbound";
  const align = inbound ? "items-start" : "items-end";
  const bubble = inbound
    ? "border-white/10 bg-white/[0.04] text-white/84"
    : "border-cyan-400/18 bg-cyan-400/[0.07] text-cyan-50";

  return (
    <div className={`flex flex-col ${align}`}>
      <div className="mb-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
        {m.sender_type || m.direction || "message"} · {fmtRelative(m.sent_at || m.created_at)}
      </div>
      <div
        className={`max-w-[92%] rounded-[20px] border px-4 py-3 text-sm leading-6 shadow-[0_10px_24px_rgba(0,0,0,0.15)] ${bubble}`}
      >
        {m.text || <span className="text-white/40">(empty message)</span>}
      </div>
    </div>
  );
}

export default function Inbox() {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [dbDisabled, setDbDisabled] = useState(false);

  async function loadThreads() {
    try {
      setLoadingThreads(true);
      setError("");
      const j = await apiGet("/api/inbox/threads?tenantKey=neox");
      const arr = Array.isArray(j?.threads) ? j.threads : [];
      setThreads(arr);
      setDbDisabled(Boolean(j?.dbDisabled));

      if (arr.length > 0) {
        setSelectedThread((prev) => {
          if (prev && arr.some((x) => x.id === prev.id)) {
            return arr.find((x) => x.id === prev.id) || arr[0];
          }
          return arr[0];
        });
      } else {
        setSelectedThread(null);
        setMessages([]);
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadMessages(threadId) {
    if (!threadId) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);
      const j = await apiGet(`/api/inbox/threads/${threadId}/messages?limit=200`);
      setMessages(Array.isArray(j?.messages) ? j.messages : []);
    } catch (e) {
      setMessages([]);
      setError(String(e?.message || e));
    } finally {
      setLoadingMessages(false);
    }
  }

  async function markRead(threadId) {
    if (!threadId) return;
    try {
      await apiPost(`/api/inbox/threads/${threadId}/read`, {});
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, unread_count: 0 } : t))
      );
      setSelectedThread((prev) =>
        prev && prev.id === threadId ? { ...prev, unread_count: 0 } : prev
      );
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread?.id) loadMessages(selectedThread.id);
    else setMessages([]);
  }, [selectedThread?.id]);

  const filteredThreads = useMemo(() => {
    if (filter === "needs_human") {
      return threads.filter((t) => mapThreadStatus(t) === "needs_human");
    }
    if (filter === "open") {
      return threads.filter((t) => mapThreadStatus(t) === "open");
    }
    return threads;
  }, [threads, filter]);

  const stats = useMemo(() => {
    let open = 0;
    let aiReplied = 0;
    let needsHuman = 0;

    for (const t of threads) {
      const s = mapThreadStatus(t);
      if (s === "open") open += 1;
      else if (s === "ai_replied") aiReplied += 1;
      else if (s === "needs_human") needsHuman += 1;
    }

    return { open, aiReplied, needsHuman };
  }, [threads]);

  const selectedMeta = selectedThread?.meta || {};
  const selectedName =
    selectedThread?.customer_name ||
    selectedThread?.external_username ||
    selectedThread?.external_user_id ||
    "No thread selected";

  return (
    <div className="min-h-screen px-6 pb-6 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[30px] font-semibold tracking-[-0.05em] text-white">
            Inbox
          </div>
          <div className="mt-2 text-sm text-white/46">
            DM, comments və gələcək AI handover axınları üçün operativ inbox paneli.
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dbDisabled ? (
            <div className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100">
              DB disabled
            </div>
          ) : null}

          <button
            type="button"
            onClick={loadThreads}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[12px] font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-[22px] border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Open Threads" value={stats.open} icon={MessageSquareText} />
        <StatCard label="AI Replied" value={stats.aiReplied} icon={Sparkles} tone="cyan" />
        <StatCard
          label="Needs Human"
          value={stats.needsHuman}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                Active Threads
              </div>
              <div className="mt-1 text-sm text-white/46">
                Real inbox axını burada görünür.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${
                  filter === "all"
                    ? "border-white/10 bg-white/[0.04] text-white/78"
                    : "border-white/10 bg-white/[0.02] text-white/44 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setFilter("open")}
                className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${
                  filter === "open"
                    ? "border-white/10 bg-white/[0.04] text-white/78"
                    : "border-white/10 bg-white/[0.02] text-white/44 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                Open
              </button>

              <button
                type="button"
                onClick={() => setFilter("needs_human")}
                className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${
                  filter === "needs_human"
                    ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-100"
                    : "border-white/10 bg-white/[0.02] text-white/44 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                Needs human
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            {loadingThreads ? (
              <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-10 text-center text-sm text-white/52">
                Loading threads...
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center">
                <div className="text-sm font-medium text-white/68">No threads yet</div>
                <div className="mt-2 text-sm leading-6 text-white/40">
                  Meta webhook və inbox flow bağlanandan sonra burada real thread-lər görünəcək.
                </div>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <ThreadCard
                  key={thread.id}
                  thread={thread}
                  selected={selectedThread?.id === thread.id}
                  onOpen={setSelectedThread}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[17px] font-semibold tracking-[-0.03em] text-white">
                  Conversation Detail
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Seçilmiş thread-in mesaj axını və statusu.
                </div>
              </div>

              {selectedThread?.id ? (
                <button
                  type="button"
                  onClick={() => markRead(selectedThread.id)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
                >
                  Mark as read
                </button>
              ) : null}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-semibold tracking-[-0.03em] text-white">
                    {selectedName}
                  </div>
                  <div className="mt-1 truncate text-sm text-white/42">
                    {selectedThread?.external_username
                      ? `@${String(selectedThread.external_username).replace(/^@+/, "")}`
                      : selectedThread?.external_user_id || "—"}
                  </div>
                </div>

                {selectedThread?.channel ? (
                  <div
                    className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${channelTone(
                      selectedThread.channel
                    )}`}
                  >
                    {selectedThread.channel}
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                    Unread
                  </div>
                  <div className="mt-2 text-sm text-white/76">
                    {selectedThread?.unread_count ?? 0}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                    Last activity
                  </div>
                  <div className="mt-2 text-sm text-white/76">
                    {fmtRelative(selectedThread?.last_message_at || selectedThread?.updated_at)}
                  </div>
                </div>
              </div>

              <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                {!selectedThread ? (
                  <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-10 text-center">
                    <div className="text-sm font-medium text-white/66">
                      Select a thread
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/40">
                      Sol tərəfdən thread seç, mesajlar burada görünsün.
                    </div>
                  </div>
                ) : loadingMessages ? (
                  <div className="rounded-[22px] border border-white/10 px-4 py-10 text-center text-sm text-white/52">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-10 text-center">
                    <div className="text-sm font-medium text-white/66">
                      No messages yet
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/40">
                      Bu thread üçün hələ mesaj yoxdur.
                    </div>
                  </div>
                ) : (
                  messages.map((m) => <MessageBubble key={m.id} m={m} />)
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <UserRound className="h-4 w-4 text-white/72" />
              </div>
              <div>
                <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
                  Human Handover
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Operatora ötürüləcək thread-lər üçün blok.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-8">
              <div className="text-sm font-medium text-white/64">
                {threads.filter((t) => mapThreadStatus(t) === "needs_human").length} escalated thread
              </div>
              <div className="mt-2 text-sm leading-6 text-white/40">
                `assigned_to` gələndə və ya human routing bağlananda bu blok daha ağıllı işləyəcək.
              </div>

              {selectedMeta && Object.keys(selectedMeta).length > 0 ? (
                <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
                    Selected thread meta
                  </div>
                  <pre className="overflow-auto text-xs leading-6 text-white/58">
                    {JSON.stringify(selectedMeta, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}