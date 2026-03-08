import { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Target,
  Trophy,
  Users,
  RefreshCw,
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

function StatCard({ label, value, icon: Icon, tone = "neutral" }) {
  const toneMap = {
    neutral:
      "border-white/10 bg-white/[0.03] text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)]",
    cyan:
      "border-cyan-400/20 bg-cyan-400/[0.06] text-white shadow-[0_18px_40px_rgba(34,211,238,0.08)]",
    emerald:
      "border-emerald-300/20 bg-emerald-300/[0.06] text-white shadow-[0_18px_40px_rgba(16,185,129,0.08)]",
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

function stageTone(stage) {
  const s = String(stage || "").toLowerCase();
  if (s === "contacted") return "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-100";
  if (s === "qualified") return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-100";
  if (s === "won") return "border-yellow-300/20 bg-yellow-300/[0.08] text-yellow-100";
  if (s === "lost") return "border-rose-400/20 bg-rose-400/[0.08] text-rose-100";
  if (s === "proposal") return "border-violet-400/20 bg-violet-400/[0.08] text-violet-100";
  return "border-white/10 bg-white/[0.05] text-white/78";
}

function formatMoneyAZN(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${new Intl.NumberFormat("en-US").format(n)} ₼`;
}

function pickLeadValue(lead) {
  const score = Number(lead?.score || 0);
  const raw =
    lead?.extra?.value ??
    lead?.extra?.pipelineValue ??
    lead?.extra?.amount ??
    0;

  const val = Number(raw);
  if (Number.isFinite(val) && val > 0) return val;

  if (score >= 80) return 5000;
  if (score >= 60) return 2500;
  if (score >= 40) return 1200;
  return 0;
}

function prettySource(lead) {
  const source = String(lead?.source || "").toLowerCase();
  const platform =
    String(lead?.extra?.platform || "").toLowerCase() ||
    String(lead?.source_ref || "").toLowerCase();

  if (source === "inbox" && platform === "instagram") return "Instagram DM";
  if (source === "inbox" && platform === "whatsapp") return "WhatsApp";
  if (source === "inbox" && platform === "facebook") return "Facebook";
  if (source === "comment") return "Comment";
  if (source === "manual") return "Manual";
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

function LeadRow({ lead, selected, onSelect }) {
  const name = leadName(lead);
  const source = prettySource(lead);
  const interest = lead?.interest || "—";
  const stage = String(lead?.stage || "new").toLowerCase();
  const value = formatMoneyAZN(pickLeadValue(lead));

  return (
    <button
      type="button"
      onClick={() => onSelect?.(lead)}
      className={`grid w-full grid-cols-[1.4fr_0.9fr_1.1fr_0.8fr_0.7fr] items-center gap-3 rounded-[22px] border px-4 py-4 text-left transition ${
        selected
          ? "border-cyan-400/20 bg-cyan-400/[0.05]"
          : "border-white/8 bg-black/20 hover:border-white/12 hover:bg-black/26"
      }`}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white">{name}</div>
        <div className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-white/34">
          {lead?.username ? `@${String(lead.username).replace(/^@+/, "")}` : "lead"}
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

      <div className="text-right text-sm font-medium text-white/74">{value}</div>
    </button>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [dbDisabled, setDbDisabled] = useState(false);
  const [error, setError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");
      const j = await apiGet("/api/leads?tenantKey=neox");
      const arr = Array.isArray(j?.leads) ? j.leads : [];
      setLeads(arr);
      setDbDisabled(Boolean(j?.dbDisabled));

      if (arr.length > 0) {
        setSelectedLead((prev) => {
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

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    if (stageFilter === "all") return leads;
    return leads.filter(
      (lead) => String(lead?.stage || "new").toLowerCase() === stageFilter
    );
  }, [leads, stageFilter]);

  const stats = useMemo(() => {
    let qualified = 0;
    let won = 0;
    let pipelineValue = 0;

    for (const lead of leads) {
      const stage = String(lead?.stage || "new").toLowerCase();
      if (stage === "qualified") qualified += 1;
      if (stage === "won") won += 1;
      pipelineValue += pickLeadValue(lead);
    }

    return {
      total: leads.length,
      qualified,
      won,
      pipelineValue,
    };
  }, [leads]);

  const sourceMix = useMemo(() => {
    const counts = {
      "Instagram DM": 0,
      Comments: 0,
      WhatsApp: 0,
      Other: 0,
    };

    for (const lead of leads) {
      const src = prettySource(lead);
      if (src === "Instagram DM") counts["Instagram DM"] += 1;
      else if (src === "Comment") counts["Comments"] += 1;
      else if (src === "WhatsApp") counts["WhatsApp"] += 1;
      else counts["Other"] += 1;
    }

    const total = Math.max(leads.length, 1);

    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [leads]);

  const sel = selectedLead;

  return (
    <div className="min-h-screen px-6 pb-6 pt-6 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[30px] font-semibold tracking-[-0.05em] text-white">
            Leads
          </div>
          <div className="mt-2 text-sm text-white/46">
            AI Inbox və gələcək satış axınlarından çıxan lead-lər üçün pipeline paneli.
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
            onClick={loadLeads}
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
        <StatCard label="Qualified" value={stats.qualified} icon={Target} tone="cyan" />
        <StatCard label="Won" value={stats.won} icon={Trophy} tone="emerald" />
        <StatCard
          label="Pipeline Value"
          value={formatMoneyAZN(stats.pipelineValue)}
          icon={BadgeDollarSign}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                Lead Pipeline
              </div>
              <div className="mt-1 text-sm text-white/46">
                Real CRM lead list burada görünür.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "new", "contacted", "qualified", "won", "lost"].map((stage) => (
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
            <div className="grid grid-cols-[1.4fr_0.9fr_1.1fr_0.8fr_0.7fr] gap-3 px-2 text-[11px] uppercase tracking-[0.18em] text-white/28">
              <div>Name</div>
              <div>Source</div>
              <div>Interest</div>
              <div>Stage</div>
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
                  Inbox və satış axını bağlanandan sonra lead-lər burada görünəcək.
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
                  Seçilmiş lead-in detalları.
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
                      <div className="mt-1 text-sm text-white/44">
                        {sel.username
                          ? `@${String(sel.username).replace(/^@+/, "")}`
                          : sel.email || sel.phone || "—"}
                      </div>
                    </div>

                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${stageTone(
                        sel.stage
                      )}`}
                    >
                      {sel.stage || "new"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Source
                      </div>
                      <div className="mt-2 text-sm text-white/76">{prettySource(sel)}</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Score
                      </div>
                      <div className="mt-2 text-sm text-white/76">{sel.score ?? 0}</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Interest
                      </div>
                      <div className="mt-2 text-sm text-white/76">{sel.interest || "—"}</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Pipeline value
                      </div>
                      <div className="mt-2 text-sm text-white/76">
                        {formatMoneyAZN(pickLeadValue(sel))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Company
                      </div>
                      <div className="mt-2 text-sm text-white/76">{sel.company || "—"}</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Phone
                      </div>
                      <div className="mt-2 text-sm text-white/76">{sel.phone || "—"}</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Email
                      </div>
                      <div className="mt-2 text-sm text-white/76">{sel.email || "—"}</div>
                    </div>

                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Notes
                      </div>
                      <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/76">
                        {sel.notes || "—"}
                      </div>
                    </div>
                  </div>

                  {sel.extra && Object.keys(sel.extra).length > 0 ? (
                    <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.02] p-3">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
                        Extra
                      </div>
                      <pre className="overflow-auto text-xs leading-6 text-white/58">
                        {JSON.stringify(sel.extra, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </>
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
        </div>
      </div>
    </div>
  );
}