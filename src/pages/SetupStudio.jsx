import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Globe, Loader2, Sparkles, Wand2 } from "lucide-react";
import { getAppBootstrap } from "../api/app.js";
import { importWebsiteForSetup, saveBusinessProfile } from "../api/setup.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../api/knowledge.js";
import {
  createSetupService,
  getSetupServices,
} from "../api/services.js";

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function obj(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function firstLanguage(profile) {
  if (profile?.language) return String(profile.language);
  if (Array.isArray(profile?.languages) && profile.languages[0]) {
    return String(profile.languages[0]);
  }
  return "az";
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.items,
    payload.rows,
    payload.results,
    payload.data,
    payload.entries,
    payload.candidates,
    payload.queue,
    payload.services,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isPendingKnowledge(item = {}) {
  const status = s(item.status || item.review_status || item.state).toLowerCase();
  if (!status) return true;

  return [
    "pending",
    "needs_review",
    "conflict",
    "review",
    "awaiting_review",
  ].includes(status);
}

function candidateTitle(item = {}) {
  return (
    s(item.title) ||
    s(item.item_key) ||
    s(item.canonical_key) ||
    "Untitled discovery"
  );
}

function candidateCategory(item = {}) {
  return s(item.category || item.candidate_group || "general");
}

function candidateValue(item = {}) {
  const text = s(item.value_text || item.summary || item.description);
  if (text) return text;

  const valueJson = obj(item.value_json);
  const keys = Object.keys(valueJson);
  if (!keys.length) return "";

  try {
    return JSON.stringify(valueJson, null, 2);
  } catch {
    return "";
  }
}

function candidateSource(item = {}) {
  return (
    s(item.source_display_name) ||
    s(item.display_name) ||
    s(item.source_type) ||
    s(item.source_key) ||
    "Unknown source"
  );
}

function candidateConfidence(item = {}) {
  const n = Number(item.confidence);
  if (!Number.isFinite(n)) return "";
  return `${Math.round(n * 100)}%`;
}

function evidenceList(item = {}) {
  return parseJsonArray(item.source_evidence_json).slice(0, 2);
}

function profilePatchFromDiscovery(profile = {}) {
  const p = obj(profile);
  const languages = arr(p.languages);

  return {
    companyName: s(
      p.companyName || p.businessName || p.name || p.title || p.brandName
    ),
    description: s(
      p.description || p.summary || p.businessDescription || p.about
    ),
    timezone: s(p.timezone || p.timeZone),
    language: s(p.language || languages[0]),
  };
}

function mergeBusinessForm(prev, patch = {}) {
  const next = { ...prev };

  if (s(patch.companyName) && !s(prev.companyName)) {
    next.companyName = s(patch.companyName);
  }

  if (s(patch.description) && !s(prev.description)) {
    next.description = s(patch.description);
  }

  if (s(patch.timezone) && (!s(prev.timezone) || s(prev.timezone) === "Asia/Baku")) {
    next.timezone = s(patch.timezone);
  }

  if (s(patch.language) && (!s(prev.language) || s(prev.language) === "az")) {
    next.language = s(patch.language);
  }

  return next;
}

function profilePreviewRows(profile = {}) {
  const p = obj(profile);

  return [
    ["Name", s(p.companyName || p.businessName || p.name || p.title || p.brandName)],
    ["Description", s(p.description || p.summary || p.businessDescription || p.about)],
    ["Timezone", s(p.timezone || p.timeZone)],
    ["Language", s(p.language || arr(p.languages)[0])],
    ["Website", s(p.website || p.url || p.siteUrl)],
  ].filter(([, value]) => value);
}

function discoveryModeLabel(mode = "") {
  const value = s(mode).toLowerCase();

  if (!value || value === "idle") return "Ready to scan";
  if (["running", "queued", "processing", "syncing"].includes(value)) return "AI is scanning";
  if (["success", "completed", "complete", "done"].includes(value)) return "Scan completed";
  if (["error", "failed"].includes(value)) return "Scan failed";

  return value;
}

function stepDone(meta, key) {
  const missing = arr(meta.missingSteps).map((x) => s(x).toLowerCase());
  return !missing.includes(String(key).toLowerCase());
}

function CompactStep({ done, label }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ${
        done ? "bg-emerald-500/10 text-emerald-700" : "bg-slate-900/5 text-slate-500"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${done ? "bg-emerald-500" : "bg-slate-300"}`}
      />
      {label}
    </div>
  );
}

function StatMini({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-900/8 bg-white/70 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

function DiscoveryCard({ title, value, meta }) {
  return (
    <div className="rounded-[28px] border border-slate-900/8 bg-white/78 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {meta}
      </div>
      <div className="mt-3 text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </div>
      <div className="mt-3 text-sm leading-7 text-slate-600">
        {value}
      </div>
    </div>
  );
}

export default function SetupStudio() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [importingWebsite, setImportingWebsite] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [actingKnowledgeId, setActingKnowledgeId] = useState("");
  const [savingServiceSuggestion, setSavingServiceSuggestion] = useState("");

  const [showRefine, setShowRefine] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);

  const [error, setError] = useState("");

  const [businessForm, setBusinessForm] = useState({
    companyName: "",
    description: "",
    timezone: "Asia/Baku",
    language: "az",
  });

  const [discoveryForm, setDiscoveryForm] = useState({
    websiteUrl: "",
    note: "",
  });

  const [discoveryState, setDiscoveryState] = useState({
    mode: "idle",
    lastUrl: "",
    message: "",
    candidateCount: 0,
    profileApplied: false,
    profile: {},
    signals: {},
  });

  const [knowledgeCandidates, setKnowledgeCandidates] = useState([]);
  const [services, setServices] = useState([]);

  const [meta, setMeta] = useState({
    readinessScore: 0,
    missingSteps: [],
    setupCompleted: false,
    pendingCandidateCount: 0,
    approvedKnowledgeCount: 0,
    serviceCount: 0,
    playbookCount: 0,
  });

  async function loadData({ silent = false, preserveBusinessForm = false } = {}) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [boot, knowledgePayload, servicesPayload] = await Promise.all([
        getAppBootstrap(),
        getKnowledgeCandidates(),
        getSetupServices(),
      ]);

      const workspace = obj(boot?.workspace);
      const setup = obj(boot?.setup);
      const profile = obj(setup?.businessProfile);
      const knowledge = obj(setup?.knowledge);
      const catalog = obj(setup?.catalog);

      const rawKnowledge = extractItems(knowledgePayload);
      const pendingKnowledge = rawKnowledge.filter(isPendingKnowledge);
      const serviceItems = extractItems(servicesPayload);

      setMeta({
        readinessScore: Number(workspace?.readinessScore || 0),
        missingSteps: arr(workspace?.missingSteps),
        setupCompleted: !!workspace?.setupCompleted,
        pendingCandidateCount: Number(
          knowledge?.pendingCandidateCount || pendingKnowledge.length || 0
        ),
        approvedKnowledgeCount: Number(knowledge?.approvedKnowledgeCount || 0),
        serviceCount: Number(catalog?.serviceCount || serviceItems.length || 0),
        playbookCount: Number(catalog?.playbookCount || 0),
      });

      if (!preserveBusinessForm) {
        setBusinessForm({
          companyName: s(profile?.companyName),
          description: s(profile?.description),
          timezone: s(profile?.timezone || "Asia/Baku"),
          language: firstLanguage(profile),
        });
      }

      setKnowledgeCandidates(pendingKnowledge);
      setServices(serviceItems);
    } catch (e) {
      setError(String(e?.message || e || "Setup studio data could not be loaded."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function refreshAndMaybeRouteHome({ preserveBusinessForm = false } = {}) {
    const boot = await getAppBootstrap();
    const workspace = obj(boot?.workspace);

    if (workspace?.setupCompleted) {
      navigate("/", { replace: true });
      return true;
    }

    await loadData({ silent: true, preserveBusinessForm });
    return false;
  }

  function setBusinessField(key, value) {
    setBusinessForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function setDiscoveryField(key, value) {
    setDiscoveryForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function onScanBusiness(e) {
    e.preventDefault();

    const websiteUrl = s(discoveryForm.websiteUrl);
    if (!websiteUrl) {
      setError("Website URL boş ola bilməz.");
      return;
    }

    try {
      setImportingWebsite(true);
      setError("");

      setDiscoveryState((prev) => ({
        ...prev,
        mode: "running",
        lastUrl: websiteUrl,
        message: "Website scan başladı...",
      }));

      const result = await importWebsiteForSetup({
        url: websiteUrl,
        sourceUrl: websiteUrl,
        note: discoveryForm.note,
        businessNote: discoveryForm.note,
      });

      const discoveredProfile = obj(result?.profile);
      const patch = profilePatchFromDiscovery(discoveredProfile);
      const mergedForm = mergeBusinessForm(businessForm, patch);
      const profileApplied =
        JSON.stringify(mergedForm) !== JSON.stringify(businessForm);

      if (profileApplied) {
        setBusinessForm(mergedForm);
      }

      setDiscoveryState({
        mode: s(result?.mode) || "success",
        lastUrl: websiteUrl,
        message:
          Number(result?.candidateCount || 0) > 0
            ? `${Number(result?.candidateCount || 0)} discovery hazırlandı.`
            : "Website import tamamlandı.",
        candidateCount: Number(result?.candidateCount || 0),
        profileApplied,
        profile: discoveredProfile,
        signals: obj(result?.signals),
      });

      setShowKnowledge(true);
      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });
    } catch (e2) {
      setDiscoveryState((prev) => ({
        ...prev,
        mode: "error",
        message: String(e2?.message || e2 || "Website scan alınmadı."),
      }));
      setError(String(e2?.message || e2 || "Website scan alınmadı."));
    } finally {
      setImportingWebsite(false);
    }
  }

  async function onSaveBusiness(e) {
    e.preventDefault();

    try {
      setSavingBusiness(true);
      setError("");

      await saveBusinessProfile({
        companyName: businessForm.companyName,
        description: businessForm.description,
        timezone: businessForm.timezone,
        language: businessForm.language,
        languages: businessForm.language ? [businessForm.language] : [],
      });

      await refreshAndMaybeRouteHome({ preserveBusinessForm: false });
    } catch (e2) {
      setError(String(e2?.message || e2 || "Business profile could not be saved."));
    } finally {
      setSavingBusiness(false);
    }
  }

  async function onApproveKnowledge(item) {
    const id = s(item.id);
    if (!id) return;

    try {
      setActingKnowledgeId(id);
      setError("");

      await approveKnowledgeCandidate(id, {});
      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be approved."));
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onRejectKnowledge(item) {
    const id = s(item.id);
    if (!id) return;

    try {
      setActingKnowledgeId(id);
      setError("");

      await rejectKnowledgeCandidate(id, {});
      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be rejected."));
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onCreateSuggestedService() {
    try {
      if (!s(discoveryForm.note)) {
        setError("Suggested service yaratmaq üçün description yaz.");
        return;
      }

      setSavingServiceSuggestion("creating");
      setError("");

      await createSetupService({
        title: s(discoveryForm.note.split(".")[0] || "Discovered service"),
        description: s(discoveryForm.note),
        category: "general",
        priceFrom: "",
        currency: "AZN",
        pricingModel: "custom_quote",
        durationMinutes: "",
        sortOrder: 0,
        highlightsText: "",
        isActive: true,
      });

      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });
    } catch (e) {
      setError(String(e?.message || e || "Suggested service could not be created."));
    } finally {
      setSavingServiceSuggestion("");
    }
  }

  async function onOpenWorkspace() {
    try {
      setError("");

      const boot = await getAppBootstrap();
      const workspace = obj(boot?.workspace);

      if (workspace?.setupCompleted) {
        navigate("/", { replace: true });
        return;
      }

      await loadData({ silent: true, preserveBusinessForm: true });
      setError("Hələ bir neçə step qalır. Onları tamamlayıb yenə yoxla.");
    } catch (e) {
      setError(String(e?.message || e || "Workspace status could not be checked."));
    }
  }

  const discoveryProfileRows = useMemo(
    () => profilePreviewRows(discoveryState.profile),
    [discoveryState.profile]
  );

  const serviceSuggestionTitle = useMemo(() => {
    const note = s(discoveryForm.note);
    if (!note) return "";
    return note.split(".")[0]?.trim() || "";
  }, [discoveryForm.note]);

  const heroSteps = [
    { key: "businessprofile", label: "Business" },
    { key: "knowledge", label: "Knowledge" },
    { key: "services", label: "Services" },
    { key: "playbooks", label: "Playbooks" },
    { key: "policies", label: "Policies" },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <section className="mx-auto flex min-h-[88vh] max-w-[1160px] flex-col justify-center py-6">
        <div className="mx-auto w-full max-w-[980px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-white/70 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
              AI Setup Studio
            </div>

            <button
              type="button"
              onClick={() => loadData({ silent: true, preserveBusinessForm: true })}
              className="inline-flex items-center rounded-full border border-slate-900/8 bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="rounded-[40px] border border-white/70 bg-white/70 p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mx-auto max-w-[760px] text-center">
              <h1 className="text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
                Turn your website into a ready business twin.
              </h1>

              <p className="mx-auto mt-5 max-w-[700px] text-lg leading-8 text-slate-600">
                Bir website ver. Sistem business identity-ni çıxarsın, knowledge
                hazırlasın və onboarding-i sənin yerinə başlatsın.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {heroSteps.map((item) => (
                  <CompactStep
                    key={item.key}
                    done={stepDone(meta, item.key)}
                    label={item.label}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={onScanBusiness} className="mx-auto mt-10 max-w-[820px]">
              <div className="rounded-[32px] border border-slate-900/8 bg-[#fbfcfe] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 rounded-[24px] border border-slate-900/8 bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <Globe className="h-5 w-5 text-slate-400" />
                    <input
                      value={discoveryForm.websiteUrl}
                      onChange={(e) => setDiscoveryField("websiteUrl", e.target.value)}
                      className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>

                  <textarea
                    value={discoveryForm.note}
                    onChange={(e) => setDiscoveryField("note", e.target.value)}
                    className="min-h-[104px] rounded-[24px] border border-slate-900/8 bg-white px-4 py-4 text-sm leading-7 text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="İstəsən qısa qeyd yaz: məsələn əsas fokusumuz Instagram DM automation və lead qualification-dır."
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-900/5 px-3 py-1.5">
                        Detects services
                      </span>
                      <span className="rounded-full bg-slate-900/5 px-3 py-1.5">
                        Extracts knowledge
                      </span>
                      <span className="rounded-full bg-slate-900/5 px-3 py-1.5">
                        Prepares runtime
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={importingWebsite}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] disabled:opacity-60"
                    >
                      {importingWebsite ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scanning business
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4" />
                          Scan business
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="mx-auto mt-8 max-w-[980px]">
              <div className="grid gap-4 md:grid-cols-3">
                <StatMini label="Readiness" value={`${meta.readinessScore}%`} />
                <StatMini label="Knowledge" value={String(meta.approvedKnowledgeCount)} />
                <StatMini label="Services" value={String(meta.serviceCount)} />
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-[980px] rounded-[32px] border border-slate-900/8 bg-[#fbfcfe] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    Discovery status
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {discoveryModeLabel(importingWebsite ? "running" : discoveryState.mode)}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">
                    {s(discoveryState.message) || "Hələ scan edilməyib."}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-600">
                    New discoveries: {Number(discoveryState.candidateCount || 0)}
                  </div>
                  {s(discoveryState.lastUrl) ? (
                    <div className="rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-600">
                      {discoveryState.lastUrl}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {error ? (
              <div className="mx-auto mt-6 max-w-[980px] rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {(discoveryProfileRows.length || meta.pendingCandidateCount || meta.serviceCount) ? (
              <div className="mx-auto mt-8 max-w-[980px] grid gap-4 lg:grid-cols-3">
                <DiscoveryCard
                  meta="Business identity"
                  title={
                    discoveryProfileRows.find(([label]) => label === "Name")?.[1] ||
                    s(businessForm.companyName) ||
                    "Business identity"
                  }
                  value={
                    discoveryProfileRows.find(([label]) => label === "Description")?.[1] ||
                    s(businessForm.description) ||
                    "Scan completed. You can refine the business twin before entering the workspace."
                  }
                />

                <DiscoveryCard
                  meta="Knowledge findings"
                  title={`${meta.pendingCandidateCount} pending discoveries`}
                  value={
                    meta.pendingCandidateCount
                      ? "AI artıq review üçün knowledge çıxarıb. İstəsən indi baxıb approve edə bilərsən."
                      : "Pending discovery yoxdur. Approved knowledge artıq runtime-a bağlanıb."
                  }
                />

                <DiscoveryCard
                  meta="Service layer"
                  title={
                    meta.serviceCount
                      ? `${meta.serviceCount} service ready`
                      : serviceSuggestionTitle || "No service yet"
                  }
                  value={
                    meta.serviceCount
                      ? "Service layer formalaşmağa başlayıb. İndi refine edib pricing və positioning əlavə edə bilərsən."
                      : "İstəsən aşağıdan suggested service yarada və sonra refine edə bilərsən."
                  }
                />
              </div>
            ) : null}

            <div className="mx-auto mt-8 flex max-w-[980px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() => setShowRefine((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
              >
                {showRefine ? "Hide details" : "Refine details"}
              </button>

              {(meta.pendingCandidateCount > 0 || knowledgeCandidates.length > 0) ? (
                <button
                  type="button"
                  onClick={() => setShowKnowledge((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
                >
                  {showKnowledge ? "Hide discoveries" : "Review discoveries"}
                </button>
              ) : null}

              <button
                type="button"
                onClick={onOpenWorkspace}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
              >
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showRefine ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <form
                onSubmit={onSaveBusiness}
                className="rounded-[32px] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]"
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Refine business twin
                </div>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Adjust only what matters
                </h2>

                <p className="mt-3 max-w-[520px] text-sm leading-7 text-slate-600">
                  Burada yalnız əsas şeylər qalır. AI nə çıxarıbsa sən onu qısa şəkildə
                  düzəldə bilərsən.
                </p>

                <div className="mt-6 grid gap-4">
                  <input
                    value={businessForm.companyName}
                    onChange={(e) => setBusinessField("companyName", e.target.value)}
                    className="rounded-[22px] border border-slate-900/8 bg-[#fbfcfe] px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Company name"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={businessForm.timezone}
                      onChange={(e) => setBusinessField("timezone", e.target.value)}
                      className="rounded-[22px] border border-slate-900/8 bg-[#fbfcfe] px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                      placeholder="Timezone"
                    />

                    <select
                      value={businessForm.language}
                      onChange={(e) => setBusinessField("language", e.target.value)}
                      className="rounded-[22px] border border-slate-900/8 bg-[#fbfcfe] px-4 py-3.5 text-slate-900 outline-none"
                    >
                      <option value="az">Azerbaijani</option>
                      <option value="en">English</option>
                      <option value="tr">Turkish</option>
                      <option value="ru">Russian</option>
                    </select>
                  </div>

                  <textarea
                    value={businessForm.description}
                    onChange={(e) => setBusinessField("description", e.target.value)}
                    className="min-h-[140px] rounded-[22px] border border-slate-900/8 bg-[#fbfcfe] px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Business description"
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={savingBusiness}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {savingBusiness ? "Saving..." : "Save business twin"}
                  </button>

                  <button
                    type="button"
                    onClick={() => loadData({ silent: true, preserveBusinessForm: true })}
                    className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm text-slate-700"
                  >
                    Sync from backend
                  </button>
                </div>
              </form>

              <div className="rounded-[32px] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                  Suggested service
                </div>

                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Keep service setup tiny
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Böyük form yox. Bir suggested service yarat, sonra workspace içində
                  təkmilləşdir.
                </p>

                <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-[#fbfcfe] p-4">
                  <div className="text-sm text-slate-500">Suggested title</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    {serviceSuggestionTitle || "Use the note above to generate a service seed"}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!!savingServiceSuggestion}
                    onClick={onCreateSuggestedService}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {savingServiceSuggestion ? "Creating..." : "Create suggested service"}
                  </button>

                  <div className="rounded-full bg-slate-900/5 px-4 py-3 text-sm text-slate-600">
                    Current services: {services.length}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {showKnowledge && knowledgeCandidates.length ? (
            <div className="mt-8 rounded-[36px] border border-white/70 bg-white/78 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    Review discoveries
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                    Approve only the useful ones
                  </h2>
                </div>

                <div className="rounded-full bg-slate-900/5 px-4 py-2.5 text-sm text-slate-600">
                  Pending: {knowledgeCandidates.length}
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {knowledgeCandidates.slice(0, 4).map((item) => {
                  const id = s(item.id);
                  const busy = actingKnowledgeId === id;
                  const title = candidateTitle(item);
                  const value = candidateValue(item);
                  const evidence = evidenceList(item);

                  return (
                    <div
                      key={id || title}
                      className="rounded-[28px] border border-slate-900/8 bg-[#fbfcfe] p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-500">
                              {s(item.status || "pending")}
                            </span>

                            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-500">
                              {candidateCategory(item)}
                            </span>

                            {candidateConfidence(item) ? (
                              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-500">
                                {candidateConfidence(item)}
                              </span>
                            ) : null}

                            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-500">
                              {candidateSource(item)}
                            </span>
                          </div>

                          <div className="text-2xl font-semibold tracking-tight text-slate-950">
                            {title}
                          </div>

                          <div className="mt-3 rounded-[20px] border border-slate-900/8 bg-white px-4 py-3 text-sm leading-7 text-slate-700">
                            {value || "Preview yoxdur."}
                          </div>

                          {evidence.length ? (
                            <div className="mt-3 text-sm text-slate-500">
                              {s(evidence[0]?.url || evidence[0]?.source_url || evidence[0]?.link)}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[190px]">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onApproveKnowledge(item)}
                            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                          >
                            {busy ? "Working..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => onRejectKnowledge(item)}
                            className="rounded-full border border-slate-900/10 bg-white px-5 py-3 text-sm text-slate-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {knowledgeCandidates.length > 4 ? (
                <div className="mt-5 text-sm text-slate-500">
                  Daha çox discovery var. Qalanlarını bu axından sonra da review edə bilərsən.
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
            >
              Continue to workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {meta.missingSteps.length ? (
            <div className="mt-6 text-center text-sm text-slate-500">
              Remaining: {meta.missingSteps.join(" · ")}
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-700">
              <Check className="h-4 w-4" />
              Core onboarding is ready.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}