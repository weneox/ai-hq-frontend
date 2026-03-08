import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquareText,
  Sparkles,
  UserRound,
  AlertTriangle,
  RefreshCw,
  Bot,
  Send,
  CheckCheck,
  ShieldAlert,
  UserCog,
  XCircle,
  CheckCircle2,
  BadgeDollarSign,
  Link2,
  ArrowUpRight,
  BriefcaseBusiness,
  Target,
} from "lucide-react";

import { createWsClient } from "../lib/ws.js";
import { apiGet, apiPost } from "../api/inbox.js";
import {
  deriveThreadState,
  fmtDateTime,
  fmtRelative,
  formatMoneyAZN,
  getPriorityTone,
  leadHandle,
  leadName,
  pickLeadValue,
  prettyLeadSource,
  prettyState,
  scoreBand,
  scoreTone,
  stageTone,
  stateBadgeTone,
  statusTone,
} from "../lib/inbox-ui.js";

import InboxStatCard from "../components/inbox/InboxStatCard.jsx";
import InboxThreadCard from "../components/inbox/InboxThreadCard.jsx";
import InboxMessageBubble from "../components/inbox/InboxMessageBubble.jsx";
import InboxMiniInfo from "../components/inbox/InboxMiniInfo.jsx";

function Button({ children, onClick, tone = "default", disabled = false, icon: Icon }) {
  const toneMap = {
    default:
      "border-white/10 bg-white/[0.04] text-white/76 hover:border-white/16 hover:bg-white/[0.06] hover:text-white",
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-100 hover:border-cyan-400/30 hover:bg-cyan-400/[0.12]",
    amber:
      "border-amber-300/20 bg-amber-300/[0.08] text-amber-100 hover:border-amber-300/30 hover:bg-amber-300/[0.12]",
    emerald:
      "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-100 hover:border-emerald-400/30 hover:bg-emerald-400/[0.12]",
    rose:
      "border-rose-400/20 bg-rose-400/[0.08] text-rose-100 hover:border-rose-400/30 hover:bg-rose-400/[0.12]",
    violet:
      "border-violet-400/20 bg-violet-400/[0.08] text-violet-100 hover:border-violet-400/30 hover:bg-violet-400/[0.12]",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-[12px] font-medium transition",
        toneMap[tone] || toneMap.default,
        disabled ? "cursor-not-allowed opacity-45" : "",
      ].join(" ")}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  );
}

export default function Inbox() {
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [relatedLead, setRelatedLead] = useState(null);

  const [filter, setFilter] = useState("all");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [dbDisabled, setDbDisabled] = useState(false);
  const [wsState, setWsState] = useState("idle");

  const [operatorName, setOperatorName] = useState("Emil");
  const [replyText, setReplyText] = useState("");

  const wsRef = useRef(null);

  async function loadThreads(preferredId = "") {
    try {
      setLoadingThreads(true);
      setError("");

      const qs =
        filter === "handoff"
          ? "/api/inbox/threads?tenantKey=neox&handoffOnly=true"
          : "/api/inbox/threads?tenantKey=neox";

      const j = await apiGet(qs);
      const arr = Array.isArray(j?.threads) ? j.threads : [];

      setThreads(arr);
      setDbDisabled(Boolean(j?.dbDisabled));

      if (arr.length > 0) {
        setSelectedThread((prev) => {
          const wantedId = preferredId || prev?.id || "";
          if (wantedId && arr.some((x) => x.id === wantedId)) {
            return arr.find((x) => x.id === wantedId) || arr[0];
          }
          return arr[0];
        });
      } else {
        setSelectedThread(null);
        setMessages([]);
        setRelatedLead(null);
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoadingThreads(false);
    }
  }

  async function loadThreadDetail(threadId) {
    if (!threadId) return;
    try {
      const j = await apiGet(`/api/inbox/threads/${threadId}`);
      if (j?.thread) {
        setSelectedThread(j.thread);
        setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, ...j.thread } : t)));
      }
    } catch (e) {
      setError(String(e?.message || e));
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

  async function loadRelatedLead(threadId) {
    if (!threadId) {
      setRelatedLead(null);
      return;
    }

    try {
      setLoadingLead(true);
      const j = await apiGet("/api/leads?tenantKey=neox");
      const arr = Array.isArray(j?.leads) ? j.leads : [];
      const found = arr.find((x) => String(x?.inbox_thread_id || "") === String(threadId));
      setRelatedLead(found || null);
    } catch (e) {
      setRelatedLead(null);
      setError(String(e?.message || e));
    } finally {
      setLoadingLead(false);
    }
  }

  async function syncSelected(threadId) {
    await Promise.all([
      loadThreadDetail(threadId),
      loadMessages(threadId),
      loadRelatedLead(threadId),
    ]);
  }

  async function markRead(threadId) {
    if (!threadId) return;
    try {
      setBusyAction("read");
      await apiPost(`/api/inbox/threads/${threadId}/read`, {});
      await syncSelected(threadId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyAction("");
    }
  }

  async function assignThread(threadId) {
    if (!threadId) return;
    try {
      setBusyAction("assign");
      await apiPost(`/api/inbox/threads/${threadId}/assign`, {
        assignedTo: operatorName,
        actor: operatorName,
      });
      await loadThreads(threadId);
      await syncSelected(threadId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyAction("");
    }
  }

  async function activateHandoff(threadId) {
    if (!threadId) return;
    try {
      setBusyAction("handoff");
      await apiPost(`/api/inbox/threads/${threadId}/handoff/activate`, {
        reason: "manual_review",
        priority: "high",
        assignedTo: operatorName,
        actor: operatorName,
      });
      await loadThreads(threadId);
      await syncSelected(threadId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyAction("");
    }
  }

  async function releaseHandoff(threadId) {
    if (!threadId) return;
    try {
      setBusyAction("release");
      await apiPost(`/api/inbox/threads/${threadId}/handoff/release`, {
        actor: operatorName,
      });
      await loadThreads(threadId);
      await syncSelected(threadId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyAction("");
    }
  }

  async function setThreadStatus(threadId, status) {
    if (!threadId) return;
    try {
      setBusyAction(status);
      await apiPost(`/api/inbox/threads/${threadId}/status`, {
        status,
        actor: operatorName,
      });
      await loadThreads(threadId);
      await syncSelected(threadId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyAction("");
    }
  }

  async function sendOperatorReply() {
    if (!selectedThread?.id) return;
    if (!replyText.trim()) return;

    try {
      setBusyAction("reply");
      await apiPost(`/api/inbox/threads/${selectedThread.id}/messages`, {
        tenantKey: "neox",
        direction: "outbound",
        senderType: "agent",
        operatorName,
        messageType: "text",
        text: replyText.trim(),
        releaseHandoff: false,
        meta: {
          source: "inbox_ui",
        },
      });

      setReplyText("");
      await loadThreads(selectedThread.id);
      await syncSelected(selectedThread.id);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusyAction("");
    }
  }

  function openLeadDetail() {
    if (!relatedLead?.id) return;
    navigate("/leads", {
      state: {
        selectedLeadId: relatedLead.id,
      },
    });
  }

  useEffect(() => {
    loadThreads();
  }, [filter]);

  useEffect(() => {
    if (selectedThread?.id) {
      loadMessages(selectedThread.id);
      loadRelatedLead(selectedThread.id);
    } else {
      setMessages([]);
      setRelatedLead(null);
    }
  }, [selectedThread?.id]);

  useEffect(() => {
    const client = createWsClient({
      onStatus: (status) => {
        setWsState(String(status?.state || "idle"));
      },
      onEvent: ({ type, payload }) => {
        if (!type) return;

        if (type === "inbox.thread.created" || type === "inbox.thread.updated") {
          const thread = payload?.thread;
          if (!thread?.id) return;

          setThreads((prev) => {
            const existing = prev.find((x) => x.id === thread.id);
            if (existing) {
              return prev.map((x) => (x.id === thread.id ? { ...x, ...thread } : x));
            }
            return [thread, ...prev];
          });

          setSelectedThread((prev) =>
            prev && prev.id === thread.id ? { ...prev, ...thread } : prev
          );

          return;
        }

        if (type === "inbox.thread.read") {
          const threadId = payload?.threadId;
          if (!threadId) return;

          setThreads((prev) =>
            prev.map((x) => (x.id === threadId ? { ...x, unread_count: 0 } : x))
          );

          setSelectedThread((prev) =>
            prev && prev.id === threadId ? { ...prev, unread_count: 0 } : prev
          );

          return;
        }

        if (type === "inbox.message.created") {
          const threadId = payload?.threadId;
          const message = payload?.message;
          if (!threadId || !message?.id) return;

          if (selectedThread?.id === threadId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) return prev;
              return [...prev, message];
            });
          }

          loadThreads(selectedThread?.id || threadId);
          if (selectedThread?.id === threadId) {
            loadThreadDetail(threadId);
            loadRelatedLead(threadId);
          }
          return;
        }

        if (type === "lead.created" || type === "lead.updated") {
          const lead = payload?.lead;
          if (!lead?.id) return;

          if (String(lead?.inbox_thread_id || "") === String(selectedThread?.id || "")) {
            setRelatedLead(lead);
          }
        }
      },
    });

    wsRef.current = client;

    if (client.canUseWs()) {
      client.start();
    } else {
      setWsState("off");
    }

    return () => {
      try {
        client.stop();
      } catch {}
      wsRef.current = null;
    };
  }, [selectedThread?.id]);

  const filteredThreads = useMemo(() => {
    if (filter === "handoff") {
      return threads.filter((t) => Boolean(t.handoff_active));
    }
    if (filter === "open") {
      return threads.filter((t) => deriveThreadState(t) === "open");
    }
    if (filter === "assigned") {
      return threads.filter((t) => deriveThreadState(t) === "assigned");
    }
    if (filter === "resolved") {
      return threads.filter((t) => {
        const s = deriveThreadState(t);
        return s === "resolved" || s === "closed";
      });
    }
    return threads;
  }, [threads, filter]);

  const stats = useMemo(() => {
    let open = 0;
    let aiActive = 0;
    let handoff = 0;
    let resolved = 0;

    for (const t of threads) {
      const s = deriveThreadState(t);
      if (s === "open") open += 1;
      else if (s === "ai_active") aiActive += 1;
      else if (s === "handoff" || s === "assigned") handoff += 1;
      else if (s === "resolved" || s === "closed") resolved += 1;
    }

    return { open, aiActive, handoff, resolved };
  }, [threads]);

  const selectedName =
    selectedThread?.customer_name ||
    selectedThread?.external_username ||
    selectedThread?.external_user_id ||
    "No thread selected";

  const selectedState = deriveThreadState(selectedThread);
  const selectedLabels = Array.isArray(selectedThread?.labels) ? selectedThread.labels : [];
  const relatedLeadValue = relatedLead ? formatMoneyAZN(pickLeadValue(relatedLead)) : "—";
  const relatedLeadScore = Number(relatedLead?.score || 0);

  return (
    <div className="min-h-screen px-6 pb-6 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[30px] font-semibold tracking-[-0.05em] text-white">
            Inbox
          </div>
          <div className="mt-2 text-sm text-white/46">
            DM, operator handoff və AI reply axını üçün enterprise inbox paneli.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/72">
            Operator:
            <input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="ml-2 w-[100px] bg-transparent text-white outline-none placeholder:text-white/25"
              placeholder="Name"
            />
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/60">
            WS: {wsState}
          </div>

          {dbDisabled ? (
            <div className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100">
              DB disabled
            </div>
          ) : null}

          <Button onClick={() => loadThreads(selectedThread?.id || "")} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-[22px] border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <InboxStatCard label="Open Threads" value={stats.open} icon={MessageSquareText} />
        <InboxStatCard label="AI Active" value={stats.aiActive} icon={Sparkles} tone="cyan" />
        <InboxStatCard label="Handoff" value={stats.handoff} icon={ShieldAlert} tone="amber" />
        <InboxStatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                Active Threads
              </div>
              <div className="mt-1 text-sm text-white/46">
                Real inbox axını və operator handoff vəziyyəti.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "open", "handoff", "assigned", "resolved"].map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setFilter(x)}
                  className={`rounded-full border px-3.5 py-2 text-[12px] font-medium capitalize transition ${
                    filter === x
                      ? x === "handoff"
                        ? "border-amber-300/20 bg-amber-300/[0.08] text-amber-100"
                        : "border-white/10 bg-white/[0.04] text-white/78"
                      : "border-white/10 bg-white/[0.02] text-white/44 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  {x}
                </button>
              ))}
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
                  Thread-lər gələndə burada tam status və handoff görünəcək.
                </div>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <InboxThreadCard
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
                  Seçilmiş thread-in tam statusu, timeline-ı və control paneli.
                </div>
              </div>

              {selectedThread?.id ? (
                <Button
                  onClick={() => markRead(selectedThread.id)}
                  disabled={busyAction === "read"}
                  icon={CheckCheck}
                >
                  Mark as read
                </Button>
              ) : null}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
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

                <div className="flex flex-wrap gap-2">
                  {selectedThread?.channel ? (
                    <div
                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${getPriorityTone(
                        selectedThread.channel
                      )}`}
                    >
                      {selectedThread.channel}
                    </div>
                  ) : null}

                  {selectedThread ? (
                    <div
                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${stateBadgeTone(
                        selectedState
                      )}`}
                    >
                      {prettyState(selectedState)}
                    </div>
                  ) : null}

                  {selectedThread?.handoff_active ? (
                    <div
                      className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${getPriorityTone(
                        selectedThread.handoff_priority
                      )}`}
                    >
                      {selectedThread.handoff_priority || "normal"}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InboxMiniInfo
                  label="AI state"
                  value={selectedThread?.handoff_active ? "AI paused" : "AI active"}
                  icon={Bot}
                />
                <InboxMiniInfo
                  label="Assigned"
                  value={selectedThread?.assigned_to || "—"}
                  icon={UserCog}
                />
                <InboxMiniInfo
                  label="Last activity"
                  value={fmtRelative(selectedThread?.last_message_at || selectedThread?.updated_at)}
                  icon={RefreshCw}
                />
                <InboxMiniInfo
                  label="Unread"
                  value={String(selectedThread?.unread_count ?? 0)}
                  icon={AlertTriangle}
                />
                <InboxMiniInfo
                  label="Handoff at"
                  value={fmtDateTime(selectedThread?.handoff_at)}
                  icon={ShieldAlert}
                />
                <InboxMiniInfo
                  label="Thread status"
                  value={prettyState(selectedState)}
                  icon={CheckCircle2}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                  Labels
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedLabels.length ? (
                    selectedLabels.map((x) => (
                      <span
                        key={x}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white/70"
                      >
                        {x}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/50">—</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  tone="violet"
                  icon={UserCog}
                  onClick={() => assignThread(selectedThread?.id)}
                  disabled={!selectedThread?.id || busyAction === "assign"}
                >
                  Assign
                </Button>

                <Button
                  tone="amber"
                  icon={ShieldAlert}
                  onClick={() => activateHandoff(selectedThread?.id)}
                  disabled={!selectedThread?.id || busyAction === "handoff"}
                >
                  Activate handoff
                </Button>

                <Button
                  tone="cyan"
                  icon={Bot}
                  onClick={() => releaseHandoff(selectedThread?.id)}
                  disabled={!selectedThread?.id || busyAction === "release"}
                >
                  Release AI
                </Button>

                <Button
                  tone="emerald"
                  icon={CheckCircle2}
                  onClick={() => setThreadStatus(selectedThread?.id, "resolved")}
                  disabled={!selectedThread?.id || busyAction === "resolved"}
                >
                  Resolve
                </Button>

                <Button
                  tone="rose"
                  icon={XCircle}
                  onClick={() => setThreadStatus(selectedThread?.id, "closed")}
                  disabled={!selectedThread?.id || busyAction === "closed"}
                >
                  Close
                </Button>
              </div>

              <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-1">
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
                  messages.map((m) => <InboxMessageBubble key={m.id} m={m} />)
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <BriefcaseBusiness className="h-4 w-4 text-white/72" />
              </div>
              <div>
                <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
                  Related Lead
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Bu thread-ə bağlı lead varsa burada görünəcək.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
              {!selectedThread ? (
                <div className="text-sm text-white/46">No thread selected.</div>
              ) : loadingLead ? (
                <div className="text-sm text-white/52">Loading related lead...</div>
              ) : !relatedLead ? (
                <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-8 text-center">
                  <div className="text-sm font-medium text-white/66">No related lead</div>
                  <div className="mt-2 text-sm leading-6 text-white/40">
                    Bu thread üçün hələ lead yaradılmayıb və ya sistemdə görünmür.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[17px] font-semibold tracking-[-0.03em] text-white">
                        {leadName(relatedLead)}
                      </div>
                      <div className="mt-1 text-sm text-white/44">
                        {leadHandle(relatedLead)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${stageTone(
                          relatedLead.stage
                        )}`}
                      >
                        {relatedLead.stage || "new"}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${statusTone(
                          relatedLead.status
                        )}`}
                      >
                        {relatedLead.status || "open"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InboxMiniInfo
                      label="Source"
                      value={prettyLeadSource(relatedLead)}
                      icon={Link2}
                    />
                    <InboxMiniInfo
                      label="Interest"
                      value={relatedLead.interest || "—"}
                      icon={BriefcaseBusiness}
                    />
                    <InboxMiniInfo
                      label="Score"
                      value={String(relatedLead.score ?? 0)}
                      icon={Target}
                    />
                    <InboxMiniInfo
                      label="Pipeline value"
                      value={relatedLeadValue}
                      icon={BadgeDollarSign}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                      Score band
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${scoreTone(
                          relatedLeadScore
                        )}`}
                      >
                        {scoreBand(relatedLeadScore)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button tone="violet" icon={ArrowUpRight} onClick={openLeadDetail}>
                      Open in Leads
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Send className="h-4 w-4 text-white/72" />
              </div>
              <div>
                <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
                  Operator Reply
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Manual cavab, escalation və operator workflow üçün.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply as operator..."
                className="min-h-[120px] w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/28"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  tone="violet"
                  icon={Send}
                  onClick={sendOperatorReply}
                  disabled={!selectedThread?.id || !replyText.trim() || busyAction === "reply"}
                >
                  Send operator reply
                </Button>

                <Button
                  tone="cyan"
                  icon={Bot}
                  onClick={() => releaseHandoff(selectedThread?.id)}
                  disabled={!selectedThread?.id || busyAction === "release"}
                >
                  Release handoff
                </Button>
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
                  Thread Meta
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Debug və operator visibility üçün raw məlumat.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-4">
              {selectedThread ? (
                <pre className="overflow-auto text-xs leading-6 text-white/58">
                  {JSON.stringify(selectedThread, null, 2)}
                </pre>
              ) : (
                <div className="text-sm text-white/46">No thread selected.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}