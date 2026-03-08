import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Target,
  Trophy,
  Users,
  RefreshCw,
  Instagram,
  Facebook,
  MessageCircleMore,
  Mail,
  Globe,
  CircleDot,
  Link2,
  ShieldCheck,
  UserRound,
  FolderKanban,
  Save,
  CalendarDays,
  UserCog,
  Flag,
  FileText,
  ArrowUpRight,
  Clock3,
  Activity,
} from "lucide-react";
import { createWsClient } from "../lib/ws.js";
import {
  listLeads,
  getLeadEvents,
  updateLead,
  setLeadStage,
  setLeadStatus,
  setLeadOwner,
  setLeadFollowUp,
  addLeadNote,
} from "../api/leads.js";

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

function fmtDateTime(input) {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function toDatetimeLocalValue(input) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDatetimeLocalValue(input) {
  const v = String(input || "").trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function StatCard({ label, value, icon: Icon, tone = "neutral" }) {
  const toneMap = {
    neutral:
      "border-white/10 bg-white/[0.03] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.06] text-white shadow-[0_18px_40px_rgba(34,211,238,0.08)]",
    emerald:
      "border-emerald-300/20 bg-emerald-300/[0.06] text-white shadow-[0_18px_40px_rgba(16,185,129,0.08)]",
    violet:
      "border-violet-400/20 bg-violet-400/[0.06] text-white shadow-[0_18px_40px_rgba(139,92,246,0.08)]",
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

function channelIconFromLead(lead) {
  const extra = lead?.extra && typeof lead.extra === "object" ? lead.extra : {};
  const channel =
    String(extra.channel || extra.platform || lead?.source || "").toLowerCase();

  if (channel.includes("instagram")) return Instagram;
  if (channel.includes("facebook")) return Facebook;
  if (channel.includes("whatsapp")) return MessageCircleMore;
  if (channel.includes("email")) return Mail;
  return Globe;
}

function sourceTone(lead) {
  const extra = lead?.extra && typeof lead.extra === "object" ? lead.extra : {};
  const channel =
    String(extra.channel || extra.platform || lead?.source || "").toLowerCase();

  if (channel.includes("instagram")) return "text-pink-200 border-pink-400/20 bg-pink-400/[0.06]";
  if (channel.includes("facebook")) return "text-blue-200 border-blue-400/20 bg-blue-400/[0.06]";
  if (channel.includes("whatsapp")) return "text-emerald-200 border-emerald-400/20 bg-emerald-400/[0.06]";
  if (channel.includes("email")) return "text-amber-100 border-amber-300/20 bg-amber-300/[0.06]";
  return "text-white/80 border-white/10 bg-white/[0.04]";
}

function stageTone(stage) {
  const s = String(stage || "").toLowerCase();
  if (s === "contacted") return "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-100";
  if (s === "qualified") return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100";
  if (s === "won") return "border-yellow-300/20 bg-yellow-300/[0.08] text-yellow-100";
  if (s === "lost") return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (s === "proposal") return "border-violet-400/20 bg-violet-400/[0.08] text-violet-100";
  return "border-white/10 bg-white/[0.05] text-white/78";
}

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "closed") return "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-100";
  if (s === "spam") return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (s === "archived") return "border-white/10 bg-white/[0.05] text-white/62";
  return "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-100";
}

function priorityTone(priority) {
  const p = String(priority || "normal").toLowerCase();
  if (p === "urgent") return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (p === "high") return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  if (p === "low") return "border-white/10 bg-white/[0.05] text-white/62";
  return "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-100";
}

function formatMoneyAZN(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${new Intl.NumberFormat("en-US").format(n)} ₼`;
}

function pickLeadValue(lead) {
  const score = Number(lead?.score || 0);
  const extra = lead?.extra && typeof lead.extra === "object" ? lead.extra : {};

  const raw =
    lead?.value_azn ??
    extra.value ??
    extra.pipelineValue ??
    extra.amount ??
    extra.budget ??
    0;

  const val = Number(raw);
  if (Number.isFinite(val) && val > 0) return val;

  if (score >= 90) return 7000;
  if (score >= 80) return 5000;
  if (score >= 60) return 2500;
  if (score >= 40) return 1200;
  return 0;
}

function prettySource(lead) {
  const source = String(lead?.source || "").toLowerCase();
  const extra = lead?.extra && typeof lead.extra === "object" ? lead.extra : {};
  const channel = String(extra.channel || extra.platform || "").toLowerCase();

  if (channel === "instagram") return "Instagram DM";
  if (channel === "whatsapp") return "WhatsApp";
  if (channel === "facebook") return "Facebook";
  if (channel === "email") return "Email";
  if (source === "comment") return "Comment";
  if (source === "manual") return "Manual";
  if (source === "meta") return "Meta Inbox";
  if (source === "inbox") return "Inbox";
  return source || "—";
}

function leadName(lead) {
  return (
    lead?.full_name ||
    lead?.username ||
    lead?.email ||
    lead?.phone ||
    "Unnamed lead"
  );
}

function leadHandle(lead) {
  if (lead?.username) return `@${String(lead.username).replace(/^@+/, "")}`;
  return lead?.email || lead?.phone || "lead";
}

function scoreBand(score) {
  const s = Number(score || 0);
  if (s >= 85) return "high";
  if (s >= 60) return "medium";
  return "low";
}

function scoreTone(score) {
  const band = scoreBand(score);
  if (band === "high") return "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-100";
  if (band === "medium") return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  return "border-white/10 bg-white/[0.05] text-white/72";
}

function LeadRow({ lead, selected, onSelect }) {
  const name = leadName(lead);
  const source = prettySource(lead);
  const interest = lead?.interest || "—";
  const stage = String(lead?.stage || "new").toLowerCase();
  const value = formatMoneyAZN(pickLeadValue(lead));
  const status = String(lead?.status || "open").toLowerCase();
  const ChannelIcon = channelIconFromLead(lead);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(lead)}
      className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
        selected
          ? "border-cyan-400/20 bg-cyan-400/[0.05]"
          : "border-white/8 bg-black/20 hover:border-white/12 hover:bg-black/26"
      }`}
    >
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr_1fr_0.8fr_0.8fr_0.7fr] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${sourceTone(
                lead
              )}`}
            >
              <ChannelIcon className="h-3.5 w-3.5" />
            </div>
            <div className="truncate text-sm font-semibold text-white">{name}</div>
          </div>
          <div className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-white/34">
            {leadHandle(lead)}
          </div>
        </div>

        <div className="text-sm text-white/62">{source}</div>
        <div className="truncate text-sm text-white/62">{interest}</div>

        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${stageTone(
              stage
            )}`}
          >
            {stage}
          </span>
        </div>

        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${statusTone(
              status
            )}`}
          >
            {status}
          </span>
        </div>

        <div className="text-right text-sm font-medium text-white/74">{value}</div>
      </div>
    </button>
  );
}

function MiniInfo({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-white/76">
        {Icon ? <Icon className="h-4 w-4 text-white/42" /> : null}
        <span>{value || "—"}</span>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
        {label}
      </div>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder = "", type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/24 focus:border-cyan-400/20"
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/20"
    >
      {children}
    </select>
  );
}

function TextArea({ value, onChange, rows = 4, placeholder = "" }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/24 focus:border-cyan-400/20"
    />
  );
}

function eventTone(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("won")) return "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-100";
  if (t.includes("lost")) return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (t.includes("stage")) return "border-violet-400/20 bg-violet-400/[0.08] text-violet-100";
  if (t.includes("followup")) return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
  return "border-white/10 bg-white/[0.05] text-white/72";
}

function prettyEventType(type) {
  return String(type || "")
    .replace(/^lead\./, "")
    .replaceAll("_", " ");
}

export default function Leads() {
  const location = useLocation();
  const navigate = useNavigate();
  const wsRef = useRef(null);

  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dbDisabled, setDbDisabled] = useState(false);
  const [error, setError] = useState("");
  const [wsState, setWsState] = useState("idle");

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [savingField, setSavingField] = useState("");
  const [noteText, setNoteText] = useState("");
  const [form, setForm] = useState({
    stage: "new",
    status: "open",
    owner: "",
    priority: "normal",
    valueAzn: "",
    followUpAt: "",
    nextAction: "",
  });

  const requestedLeadId = String(location?.state?.selectedLeadId || "").trim();

  async function loadLeadsData() {
    try {
      setLoading(true);
      setError("");

      const j = await listLeads({ tenantKey: "neox" });
      const arr = Array.isArray(j?.leads) ? j.leads : [];

      setLeads(arr);
      setDbDisabled(Boolean(j?.dbDisabled));

      if (arr.length > 0) {
        setSelectedLead((prev) => {
          if (requestedLeadId) {
            const fromNav = arr.find((x) => x.id === requestedLeadId);
            if (fromNav) return fromNav;
          }

          if (prev && arr.some((x) => x.id === prev.id)) {
            return arr.find((x) => x.id === prev.id) || arr[0];
          }

          return arr[0];
        });
      } else {
        setSelectedLead(null);
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function loadEventsData(leadId) {
    if (!leadId) {
      setEvents([]);
      return;
    }

    try {
      setEventsLoading(true);
      const j = await getLeadEvents(leadId, 50);
      setEvents(Array.isArray(j?.events) ? j.events : []);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }

  function patchLeadInState(lead) {
    if (!lead?.id) return;

    setLeads((prev) => {
      const exists = prev.some((x) => x.id === lead.id);
      if (!exists) return [lead, ...prev];
      return prev.map((x) => (x.id === lead.id ? { ...x, ...lead } : x));
    });

    setSelectedLead((prev) => {
      if (prev && prev.id === lead.id) return { ...prev, ...lead };
      return prev;
    });
  }

  useEffect(() => {
    loadLeadsData();
  }, []);

  useEffect(() => {
    if (!requestedLeadId || !Array.isArray(leads) || !leads.length) return;
    const found = leads.find((x) => String(x?.id || "") === requestedLeadId);
    if (found) setSelectedLead(found);
  }, [requestedLeadId, leads]);

  useEffect(() => {
    const sel = selectedLead;
    setForm({
      stage: String(sel?.stage || "new").toLowerCase(),
      status: String(sel?.status || "open").toLowerCase(),
      owner: String(sel?.owner || ""),
      priority: String(sel?.priority || "normal").toLowerCase(),
      valueAzn:
        sel?.value_azn !== undefined && sel?.value_azn !== null
          ? String(Number(sel.value_azn || 0))
          : "",
      followUpAt: toDatetimeLocalValue(sel?.follow_up_at),
      nextAction: String(sel?.next_action || ""),
    });
    setNoteText("");
    loadEventsData(sel?.id);
  }, [selectedLead?.id]);

  useEffect(() => {
    const client = createWsClient({
      onStatus: (status) => {
        setWsState(String(status?.state || "idle"));
      },
      onEvent: ({ type, payload }) => {
        if (!type) return;

        if (type === "lead.created" || type === "lead.updated") {
          const lead = payload?.lead;
          if (!lead?.id) return;
          patchLeadInState(lead);
          return;
        }

        if (type === "lead.event.created") {
          const ev = payload?.event;
          if (!ev?.id || !selectedLead?.id) return;
          if (String(ev?.lead_id || "") !== String(selectedLead.id)) return;
          setEvents((prev) => [ev, ...prev]);
        }
      },
    });

    wsRef.current = client;

    if (client.canUseWs()) client.start();
    else setWsState("off");

    return () => {
      try {
        client.stop();
      } catch {}
      wsRef.current = null;
    };
  }, [selectedLead?.id]);

  const filteredLeads = useMemo(() => {
    if (stageFilter === "all") return leads;
    return leads.filter(
      (lead) => String(lead?.stage || "new").toLowerCase() === stageFilter
    );
  }, [leads, stageFilter]);

  const stats = useMemo(() => {
    let qualified = 0;
    let won = 0;
    let open = 0;
    let pipelineValue = 0;

    for (const lead of leads) {
      const stage = String(lead?.stage || "new").toLowerCase();
      const status = String(lead?.status || "open").toLowerCase();

      if (stage === "qualified") qualified += 1;
      if (stage === "won") won += 1;
      if (status === "open") open += 1;

      pipelineValue += pickLeadValue(lead);
    }

    return {
      total: leads.length,
      qualified,
      won,
      open,
      pipelineValue,
    };
  }, [leads]);

  const sourceMix = useMemo(() => {
    const counts = {
      "Instagram DM": 0,
      WhatsApp: 0,
      Facebook: 0,
      Other: 0,
    };

    for (const lead of leads) {
      const src = prettySource(lead);
      if (src === "Instagram DM") counts["Instagram DM"] += 1;
      else if (src === "WhatsApp") counts["WhatsApp"] += 1;
      else if (src === "Facebook") counts["Facebook"] += 1;
      else counts["Other"] += 1;
    }

    const total = Math.max(leads.length, 1);

    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [leads]);

  const stageMix = useMemo(() => {
    const counts = {
      new: 0,
      contacted: 0,
      qualified: 0,
      proposal: 0,
      won: 0,
      lost: 0,
    };

    for (const lead of leads) {
      const stage = String(lead?.stage || "new").toLowerCase();
      if (counts[stage] !== undefined) counts[stage] += 1;
    }

    return counts;
  }, [leads]);

  const sel = selectedLead;
  const selExtra = sel?.extra && typeof sel.extra === "object" ? sel.extra : {};
  const score = Number(sel?.score || 0);

  async function saveStage(value) {
    if (!sel?.id) return;
    try {
      setSavingField("stage");
      const j = await setLeadStage(sel.id, value, "operator");
      patchLeadInState(j?.lead);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSavingField("");
    }
  }

  async function saveStatus(value) {
    if (!sel?.id) return;
    try {
      setSavingField("status");
      const j = await setLeadStatus(sel.id, value, "operator");
      patchLeadInState(j?.lead);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSavingField("");
    }
  }

  async function saveOwner() {
    if (!sel?.id) return;
    try {
      setSavingField("owner");
      const j = await setLeadOwner(sel.id, form.owner, "operator");
      patchLeadInState(j?.lead);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSavingField("");
    }
  }

  async function saveCoreFields() {
    if (!sel?.id) return;
    try {
      setSavingField("core");
      const j = await updateLead(sel.id, {
        priority: form.priority,
        valueAzn: Number(form.valueAzn || 0),
      });
      patchLeadInState(j?.lead);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSavingField("");
    }
  }

  async function saveFollowUp() {
    if (!sel?.id) return;
    try {
      setSavingField("followup");
      const j = await setLeadFollowUp(sel.id, {
        followUpAt: fromDatetimeLocalValue(form.followUpAt),
        nextAction: form.nextAction,
        actor: "operator",
      });
      patchLeadInState(j?.lead);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSavingField("");
    }
  }

  async function saveNote() {
    if (!sel?.id || !noteText.trim()) return;
    try {
      setSavingField("note");
      const j = await addLeadNote(sel.id, noteText.trim(), "operator");
      patchLeadInState(j?.lead);
      setNoteText("");
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setSavingField("");
    }
  }

  async function quickSetStage(stage) {
    setForm((prev) => ({ ...prev, stage }));
    await saveStage(stage);
  }

  function openInboxThread() {
    if (!sel?.inbox_thread_id) return;
    navigate("/inbox", {
      state: {
        selectedThreadId: sel.inbox_thread_id,
      },
    });
  }

  return (
    <div className="min-h-screen px-6 pb-6 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[30px] font-semibold tracking-[-0.05em] text-white">
            Leads
          </div>
          <div className="mt-2 text-sm text-white/46">
            AI Inbox, DM və satış axınlarından yaranan lead-lər üçün enterprise CRM paneli.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-white/60">
            WS: {wsState}
          </div>

          {dbDisabled ? (
            <div className="rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-amber-100">
              DB disabled
            </div>
          ) : null}

          <button
            type="button"
            onClick={loadLeadsData}
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

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} icon={Users} />
        <StatCard label="Open Leads" value={stats.open} icon={CircleDot} tone="cyan" />
        <StatCard label="Won" value={stats.won} icon={Trophy} tone="emerald" />
        <StatCard
          label="Pipeline Value"
          value={formatMoneyAZN(stats.pipelineValue)}
          icon={BadgeDollarSign}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                Lead Pipeline
              </div>
              <div className="mt-1 text-sm text-white/46">
                Inbox-dən yaranan və CRM-də saxlanan lead siyahısı.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "new", "contacted", "qualified", "proposal", "won", "lost"].map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={`rounded-full border px-3.5 py-2 text-[12px] font-medium transition ${
                    stageFilter === stage
                      ? "border-white/10 bg-white/[0.04] text-white/78"
                      : "border-white/10 bg-white/[0.02] text-white/44 hover:border-white/16 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="hidden xl:grid xl:grid-cols-[1.25fr_0.9fr_1fr_0.8fr_0.8fr_0.7fr] xl:gap-3 xl:px-2 xl:text-[11px] xl:uppercase xl:tracking-[0.18em] xl:text-white/28">
              <div>Name</div>
              <div>Source</div>
              <div>Interest</div>
              <div>Stage</div>
              <div>Status</div>
              <div className="text-right">Value</div>
            </div>

            {loading ? (
              <div className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-10 text-center text-sm text-white/52">
                Loading leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-10 text-center">
                <div className="text-sm font-medium text-white/64">No leads yet</div>
                <div className="mt-2 text-sm leading-6 text-white/40">
                  Inbox və satış axını bağlandıqca lead-lər burada görünəcək.
                </div>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  selected={selectedLead?.id === lead.id}
                  onSelect={setSelectedLead}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <BriefcaseBusiness className="h-4 w-4 text-white/72" />
              </div>
              <div>
                <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
                  Lead Detail
                </div>
                <div className="mt-1 text-sm text-white/46">
                  Seçilmiş lead üçün interaktiv CRM görünüşü.
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 p-4">
              {!sel ? (
                <div className="px-2 py-8 text-center">
                  <div className="text-sm font-medium text-white/64">No lead selected</div>
                  <div className="mt-2 text-sm leading-6 text-white/40">
                    Sol tərəfdən bir lead seç.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-[18px] font-semibold tracking-[-0.03em] text-white">
                        {leadName(sel)}
                      </div>
                      <div className="mt-1 text-sm text-white/44">{leadHandle(sel)}</div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${stageTone(
                          sel.stage
                        )}`}
                      >
                        {sel.stage || "new"}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${statusTone(
                          sel.status
                        )}`}
                      >
                        {sel.status || "open"}
                      </span>

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${priorityTone(
                          sel.priority
                        )}`}
                      >
                        {sel.priority || "normal"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openInboxThread}
                      disabled={!sel?.inbox_thread_id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Open Inbox Thread
                    </button>

                    <button
                      type="button"
                      onClick={() => quickSetStage("contacted")}
                      disabled={savingField === "stage"}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
                    >
                      <CircleDot className="h-3.5 w-3.5" />
                      Mark Contacted
                    </button>

                    <button
                      type="button"
                      onClick={() => quickSetStage("qualified")}
                      disabled={savingField === "stage"}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[12px] font-medium text-white/72 transition hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
                    >
                      <Target className="h-3.5 w-3.5" />
                      Move to Qualified
                    </button>

                    <button
                      type="button"
                      onClick={() => quickSetStage("won")}
                      disabled={savingField === "stage"}
                      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-2 text-[12px] font-medium text-emerald-100 transition hover:bg-emerald-400/[0.1]"
                    >
                      <Trophy className="h-3.5 w-3.5" />
                      Mark Won
                    </button>

                    <button
                      type="button"
                      onClick={() => quickSetStage("lost")}
                      disabled={savingField === "stage"}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/[0.06] px-3.5 py-2 text-[12px] font-medium text-rose-100 transition hover:bg-rose-400/[0.1]"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Mark Lost
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <MiniInfo label="Source" value={prettySource(sel)} icon={Link2} />
                    <MiniInfo label="Score" value={String(sel.score ?? 0)} icon={Target} />
                    <MiniInfo label="Interest" value={sel.interest || "—"} icon={FolderKanban} />
                    <MiniInfo
                      label="Pipeline value"
                      value={formatMoneyAZN(pickLeadValue(sel))}
                      icon={BadgeDollarSign}
                    />
                    <MiniInfo label="Company" value={sel.company || "—"} icon={BriefcaseBusiness} />
                    <MiniInfo label="Created" value={fmtDateTime(sel.created_at)} icon={CircleDot} />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Stage">
                      <div className="flex gap-2">
                        <Select
                          value={form.stage}
                          onChange={(e) => setForm((prev) => ({ ...prev, stage: e.target.value }))}
                        >
                          <option value="new">new</option>
                          <option value="contacted">contacted</option>
                          <option value="qualified">qualified</option>
                          <option value="proposal">proposal</option>
                          <option value="won">won</option>
                          <option value="lost">lost</option>
                        </Select>
                        <button
                          type="button"
                          onClick={() => saveStage(form.stage)}
                          disabled={savingField === "stage"}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white/78 transition hover:border-white/16 hover:bg-white/[0.06]"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    </Field>

                    <Field label="Status">
                      <div className="flex gap-2">
                        <Select
                          value={form.status}
                          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="open">open</option>
                          <option value="archived">archived</option>
                          <option value="spam">spam</option>
                          <option value="closed">closed</option>
                        </Select>
                        <button
                          type="button"
                          onClick={() => saveStatus(form.status)}
                          disabled={savingField === "status"}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white/78 transition hover:border-white/16 hover:bg-white/[0.06]"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    </Field>

                    <Field label="Owner">
                      <div className="flex gap-2">
                        <Input
                          value={form.owner}
                          onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
                          placeholder="Assign owner"
                        />
                        <button
                          type="button"
                          onClick={saveOwner}
                          disabled={savingField === "owner"}
                          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white/78 transition hover:border-white/16 hover:bg-white/[0.06]"
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                      </div>
                    </Field>

                    <Field label="Priority">
                      <Select
                        value={form.priority}
                        onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">low</option>
                        <option value="normal">normal</option>
                        <option value="high">high</option>
                        <option value="urgent">urgent</option>
                      </Select>
                    </Field>

                    <Field label="Value (AZN)">
                      <Input
                        type="number"
                        value={form.valueAzn}
                        onChange={(e) => setForm((prev) => ({ ...prev, valueAzn: e.target.value }))}
                        placeholder="0"
                      />
                    </Field>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={saveCoreFields}
                        disabled={savingField === "core"}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/[0.12]"
                      >
                        <Save className="h-4 w-4" />
                        Save CRM Fields
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Follow-up date">
                      <Input
                        type="datetime-local"
                        value={form.followUpAt}
                        onChange={(e) => setForm((prev) => ({ ...prev, followUpAt: e.target.value }))}
                      />
                    </Field>

                    <Field label="Next action">
                      <Input
                        value={form.nextAction}
                        onChange={(e) => setForm((prev) => ({ ...prev, nextAction: e.target.value }))}
                        placeholder="Call, send proposal, demo..."
                      />
                    </Field>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={saveFollowUp}
                      disabled={savingField === "followup"}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/78 transition hover:border-white/16 hover:bg-white/[0.06]"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Save Follow-up
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MiniInfo label="Phone" value={sel.phone || "—"} icon={UserRound} />
                    <MiniInfo label="Email" value={sel.email || "—"} icon={Mail} />
                    <MiniInfo
                      label="Inbox thread"
                      value={sel.inbox_thread_id || "—"}
                      icon={Link2}
                    />
                    <MiniInfo
                      label="Updated"
                      value={fmtDateTime(sel.updated_at)}
                      icon={RefreshCw}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                      Score band
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${scoreTone(
                          score
                        )}`}
                      >
                        {scoreBand(score)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
                      <FileText className="h-3.5 w-3.5" />
                      Add Note
                    </div>
                    <TextArea
                      rows={4}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write internal note..."
                    />
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={saveNote}
                        disabled={savingField === "note" || !noteText.trim()}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/78 transition hover:border-white/16 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Save className="h-4 w-4" />
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                      Full Notes
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/76">
                      {sel.notes || "—"}
                    </div>
                  </div>

                  {selExtra && Object.keys(selExtra).length > 0 ? (
                    <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Extra
                      </div>
                      <pre className="overflow-auto text-xs leading-6 text-white/58">
                        {JSON.stringify(selExtra, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.03em] text-white">
              <Activity className="h-4 w-4 text-white/70" />
              Activity Timeline
            </div>

            <div className="mt-5 space-y-3">
              {!sel ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-8 text-center text-sm text-white/52">
                  Select a lead to see activity.
                </div>
              ) : eventsLoading ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-8 text-center text-sm text-white/52">
                  Loading activity...
                </div>
              ) : events.length === 0 ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-8 text-center text-sm text-white/52">
                  No events yet.
                </div>
              ) : (
                events.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-[22px] border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${eventTone(
                            ev.type
                          )}`}
                        >
                          {prettyEventType(ev.type)}
                        </span>
                        <div className="mt-3 text-sm font-medium text-white/78">
                          {ev.actor || "system"}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/32">
                          {fmtDateTime(ev.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-white/38">
                        <Clock3 className="h-3.5 w-3.5" />
                        {fmtRelative(ev.created_at)}
                      </div>
                    </div>

                    {ev?.payload ? (
                      <pre className="mt-3 overflow-auto rounded-2xl border border-white/6 bg-white/[0.02] p-3 text-xs leading-6 text-white/54">
                        {JSON.stringify(ev.payload, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
              Source Mix
            </div>

            <div className="mt-5 space-y-4">
              {sourceMix.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white/62">{item.label}</span>
                    <span className="text-white/42">{item.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div
                      className="h-2 rounded-full bg-white/40"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="text-[16px] font-semibold tracking-[-0.03em] text-white">
              Stage Overview
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {Object.entries(stageMix).map(([stage, count]) => (
                <div
                  key={stage}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3"
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                    {stage}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">{count}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                Last refresh
              </div>
              <div className="mt-2 text-sm text-white/76">
                {fmtRelative(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}