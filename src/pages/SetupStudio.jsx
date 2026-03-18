import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../api/app.js";
import { saveBusinessProfile } from "../api/setup.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../api/knowledge.js";
import {
  createSetupService,
  deleteSetupService,
  getSetupServices,
  updateSetupService,
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
    "Untitled knowledge candidate"
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
  return parseJsonArray(item.source_evidence_json).slice(0, 3);
}

function formatReason(reason = "") {
  return s(reason) || "No review note";
}

function knowledgeTone(item = {}) {
  const status = s(item.status || item.review_status || item.state || "pending").toLowerCase();

  if (status === "conflict") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  }

  if (status === "needs_review") {
    return "border-sky-400/20 bg-sky-500/10 text-sky-200";
  }

  return "border-white/10 bg-white/5 text-white/80";
}

function formatMoney(value, currency = "AZN") {
  if (value == null || value === "") return "Custom quote";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Custom quote";
  return `${n} ${currency}`;
}

function blankServiceForm() {
  return {
    title: "",
    description: "",
    category: "general",
    priceFrom: "",
    currency: "AZN",
    pricingModel: "custom_quote",
    durationMinutes: "",
    sortOrder: 0,
    highlightsText: "",
    isActive: true,
  };
}

function normalizeServiceForForm(item = {}) {
  const highlights =
    arr(item.highlights).length
      ? arr(item.highlights)
      : parseJsonArray(item.highlights_json);

  return {
    title: s(item.title),
    description: s(item.description),
    category: s(item.category || "general"),
    priceFrom:
      item.priceFrom == null || item.priceFrom === "" ? "" : String(item.priceFrom),
    currency: s(item.currency || "AZN"),
    pricingModel: s(item.pricingModel || "custom_quote"),
    durationMinutes:
      item.durationMinutes == null || item.durationMinutes === ""
        ? ""
        : String(item.durationMinutes),
    sortOrder: Number(item.sortOrder || 0),
    highlightsText: highlights.join("\n"),
    isActive: item.isActive !== false,
  };
}

function servicePayloadFromForm(form) {
  return {
    title: s(form.title),
    description: s(form.description),
    category: s(form.category || "general"),
    priceFrom: s(form.priceFrom),
    currency: s(form.currency || "AZN"),
    pricingModel: s(form.pricingModel || "custom_quote"),
    durationMinutes: s(form.durationMinutes),
    sortOrder: Number(form.sortOrder || 0),
    highlightsText: s(form.highlightsText),
    isActive: !!form.isActive,
  };
}

function studioStepState(meta, key) {
  const missing = arr(meta.missingSteps).map((x) => s(x).toLowerCase());
  return !missing.includes(String(key).toLowerCase());
}

function StepBadge({ done, label }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        done
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : "border-white/10 bg-white/5 text-white/70"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          done ? "bg-emerald-300" : "bg-white/30"
        }`}
      />
      {label}
    </div>
  );
}

export default function SetupStudio() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [savingBusiness, setSavingBusiness] = useState(false);
  const [actingKnowledgeId, setActingKnowledgeId] = useState("");
  const [savingService, setSavingService] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState("");
  const [editingServiceId, setEditingServiceId] = useState("");

  const [error, setError] = useState("");

  const [businessForm, setBusinessForm] = useState({
    companyName: "",
    description: "",
    timezone: "Asia/Baku",
    language: "az",
  });

  const [knowledgeCandidates, setKnowledgeCandidates] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceForm, setServiceForm] = useState(blankServiceForm());

  const [meta, setMeta] = useState({
    readinessScore: 0,
    missingSteps: [],
    nextSetupRoute: "/setup/studio",
    setupCompleted: false,
    pendingCandidateCount: 0,
    approvedKnowledgeCount: 0,
    approvedCandidateCount: 0,
    rejectedCandidateCount: 0,
    serviceCount: 0,
    playbookCount: 0,
  });

  async function loadData({ silent = false } = {}) {
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
        nextSetupRoute:
          s(workspace?.nextSetupRoute) ||
          s(workspace?.initialRoute) ||
          "/setup/studio",
        setupCompleted: !!workspace?.setupCompleted,
        pendingCandidateCount: Number(knowledge?.pendingCandidateCount || pendingKnowledge.length || 0),
        approvedKnowledgeCount: Number(knowledge?.approvedKnowledgeCount || 0),
        approvedCandidateCount: Number(knowledge?.approvedCandidateCount || 0),
        rejectedCandidateCount: Number(knowledge?.rejectedCandidateCount || 0),
        serviceCount: Number(catalog?.serviceCount || serviceItems.length || 0),
        playbookCount: Number(catalog?.playbookCount || 0),
      });

      setBusinessForm({
        companyName: s(profile?.companyName),
        description: s(profile?.description),
        timezone: s(profile?.timezone || "Asia/Baku"),
        language: firstLanguage(profile),
      });

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

  const summaryCards = useMemo(() => {
    return [
      {
        key: "readiness",
        label: "Readiness",
        value: `${meta.readinessScore}%`,
        hint: "Workspace nə qədər tamamlanıb",
      },
      {
        key: "knowledge",
        label: "Approved knowledge",
        value: String(meta.approvedKnowledgeCount),
        hint: "Runtime üçün qəbul olunan bilik",
      },
      {
        key: "services",
        label: "Services",
        value: String(meta.serviceCount),
        hint: "Satdığın xidmətlərin sayı",
      },
      {
        key: "playbooks",
        label: "Playbooks",
        value: String(meta.playbookCount),
        hint: "Response playbook sayı",
      },
    ];
  }, [meta]);

  const stepBusinessDone = studioStepState(meta, "businessprofile");
  const stepKnowledgeDone = studioStepState(meta, "knowledge");
  const stepServicesDone = studioStepState(meta, "services");
  const stepPlaybooksDone = studioStepState(meta, "playbooks");
  const stepPoliciesDone = studioStepState(meta, "policies");
  const stepChannelsDone = studioStepState(meta, "channels");

  function setBusinessField(key, value) {
    setBusinessForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function setServiceField(key, value) {
    setServiceForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetServiceForm() {
    setEditingServiceId("");
    setServiceForm(blankServiceForm());
  }

  function onEditService(item) {
    setEditingServiceId(s(item.id));
    setServiceForm(normalizeServiceForForm(item));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function refreshAndMaybeRouteHome() {
    const boot = await getAppBootstrap();
    const workspace = obj(boot?.workspace);

    if (workspace?.setupCompleted) {
      navigate("/", { replace: true });
      return true;
    }

    await loadData({ silent: true });
    return false;
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

      await refreshAndMaybeRouteHome();
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
      await refreshAndMaybeRouteHome();
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
      await refreshAndMaybeRouteHome();
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be rejected."));
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onSaveService({ refreshStudioAfterSave = false } = {}) {
    try {
      if (!s(serviceForm.title)) {
        setError("Service title boş ola bilməz.");
        return;
      }

      setSavingService(true);
      setError("");

      const payload = servicePayloadFromForm(serviceForm);

      if (editingServiceId) {
        await updateSetupService(editingServiceId, payload);
      } else {
        await createSetupService(payload);
      }

      if (refreshStudioAfterSave) {
        const routed = await refreshAndMaybeRouteHome();
        if (!routed) {
          resetServiceForm();
        }
        return;
      }

      await loadData({ silent: true });
      resetServiceForm();
    } catch (e) {
      setError(String(e?.message || e || "Service could not be saved."));
    } finally {
      setSavingService(false);
    }
  }

  async function onDeleteService(item) {
    const id = s(item.id);
    if (!id) return;

    try {
      setDeletingServiceId(id);
      setError("");

      await deleteSetupService(id);

      if (editingServiceId === id) {
        resetServiceForm();
      }

      await loadData({ silent: true });
    } catch (e) {
      setError(String(e?.message || e || "Service could not be deleted."));
    } finally {
      setDeletingServiceId("");
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

      await loadData({ silent: true });
      setError("Setup hələ tamamlanmayıb. Qalan blokları tamamlayıb yenə yoxla.");
    } catch (e) {
      setError(String(e?.message || e || "Workspace status could not be checked."));
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-10 text-white">
        Setup studio yüklənir...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 text-white">
      <div className="mb-8 rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8">
        <div className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Setup Studio
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Business Twin onboarding
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">
              Burda klassik step-by-step form yox, sənin biznesinin əsas bloklarını
              bir ekranda toplayırıq: business identity, knowledge discoveries,
              services və readiness. Məqsəd budur ki runtime üçün lazım olan əsas
              şeylər bir yerdə formalaşsın.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <StepBadge done={stepBusinessDone} label="Business profile" />
              <StepBadge done={stepChannelsDone} label="Channels" />
              <StepBadge done={stepKnowledgeDone} label="Knowledge" />
              <StepBadge done={stepServicesDone} label="Services" />
              <StepBadge done={stepPlaybooksDone} label="Playbooks" />
              <StepBadge done={stepPoliciesDone} label="Policies" />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">
              Studio status
            </div>

            <div className="mt-4 text-5xl font-semibold">{meta.readinessScore}%</div>

            <div className="mt-2 text-sm text-white/60">
              Current readiness score
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs text-white/45">
                <span>Progress</span>
                <span>{meta.readinessScore}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.max(0, Math.min(100, meta.readinessScore))}%` }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => loadData({ silent: true })}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
              >
                {refreshing ? "Refreshing..." : "Refresh studio"}
              </button>

              <button
                type="button"
                onClick={onOpenWorkspace}
                className="rounded-2xl border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-black"
              >
                Open workspace
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <div
            key={item.key}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">
              {item.label}
            </div>
            <div className="mt-3 text-3xl font-semibold">{item.value}</div>
            <div className="mt-2 text-sm text-white/50">{item.hint}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
          Missing steps
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {meta.missingSteps.length ? (
            meta.missingSteps.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-sm text-white/80"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-emerald-200">
              Heç bir missing step görünmür.
            </span>
          )}
        </div>
      </div>

      {error ? (
        <div className="mb-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8">
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form
            onSubmit={onSaveBusiness}
            className="rounded-[32px] border border-white/10 bg-white/5 p-6"
          >
            <div className="mb-6">
              <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
                Business identity
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">
                Shape the business twin
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Bu hissə runtime-a biznesin kim olduğunu, nə etdiyini və hansı
                dildə işlədiyini anlatmaq üçündür.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <div className="mb-2 text-sm text-white/70">Company name</div>
                <input
                  value={businessForm.companyName}
                  onChange={(e) => setBusinessField("companyName", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Weneox"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm text-white/70">Timezone</div>
                <input
                  value={businessForm.timezone}
                  onChange={(e) => setBusinessField("timezone", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Asia/Baku"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-sm text-white/70">Primary language</div>
                <select
                  value={businessForm.language}
                  onChange={(e) => setBusinessField("language", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                >
                  <option value="az">Azerbaijani</option>
                  <option value="en">English</option>
                  <option value="tr">Turkish</option>
                  <option value="ru">Russian</option>
                </select>
              </label>

              <label className="block md:col-span-2">
                <div className="mb-2 text-sm text-white/70">Description</div>
                <textarea
                  value={businessForm.description}
                  onChange={(e) => setBusinessField("description", e.target.value)}
                  className="min-h-[160px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  placeholder="Biznes, xidmətlər, ideal müştəri və AI sistemin nə üçün istifadə olunacağını qısa yaz."
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingBusiness}
                className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
              >
                {savingBusiness ? "Saving..." : "Save business twin"}
              </button>

              <button
                type="button"
                onClick={() => loadData({ silent: true })}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
              >
                Sync from backend
              </button>
            </div>
          </form>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
              Twin snapshot
            </div>

            <h2 className="text-3xl font-semibold tracking-tight">
              Current model view
            </h2>

            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                  Brand
                </div>
                <div className="mt-2 text-xl font-semibold">
                  {s(businessForm.companyName) || "Not defined yet"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Timezone
                  </div>
                  <div className="mt-2 text-lg font-medium">
                    {s(businessForm.timezone) || "Not defined"}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Language
                  </div>
                  <div className="mt-2 text-lg font-medium">
                    {s(businessForm.language) || "Not defined"}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">
                  Runtime summary
                </div>
                <div className="mt-2 text-sm leading-7 text-white/75">
                  {s(businessForm.description) || "Hələ business summary daxil edilməyib."}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
                Knowledge discoveries
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">
                Review what AI discovered
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
                Source-lardan çıxan knowledge candidate-ləri burda approve və
                reject edirsən. Approved knowledge runtime üçün birbaşa dəyər yaradır.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                Pending: {meta.pendingCandidateCount}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                Approved: {meta.approvedKnowledgeCount}
              </div>
            </div>
          </div>

          {knowledgeCandidates.length ? (
            <div className="grid gap-4">
              {knowledgeCandidates.map((item) => {
                const id = s(item.id);
                const value = candidateValue(item);
                const evidence = evidenceList(item);
                const busy = actingKnowledgeId === id;

                return (
                  <div
                    key={id || candidateTitle(item)}
                    className="rounded-[28px] border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${knowledgeTone(
                              item
                            )}`}
                          >
                            {s(item.status || item.review_status || item.state || "pending")}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                            {candidateCategory(item)}
                          </span>

                          {candidateConfidence(item) ? (
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                              confidence {candidateConfidence(item)}
                            </span>
                          ) : null}

                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                            source: {candidateSource(item)}
                          </span>
                        </div>

                        <h3 className="text-2xl font-semibold tracking-tight">
                          {candidateTitle(item)}
                        </h3>

                        {value ? (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                            <pre className="whitespace-pre-wrap break-words font-sans">
                              {value}
                            </pre>
                          </div>
                        ) : (
                          <div className="mt-3 text-sm text-white/50">
                            Bu candidate üçün text preview yoxdur.
                          </div>
                        )}

                        {s(item.review_reason) ? (
                          <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                            {formatReason(item.review_reason)}
                          </div>
                        ) : null}

                        {evidence.length ? (
                          <div className="mt-4">
                            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">
                              Evidence
                            </div>

                            <div className="grid gap-2">
                              {evidence.map((ev, index) => {
                                const sourceUrl =
                                  s(ev.url) || s(ev.source_url) || s(ev.link);
                                const snippet =
                                  s(ev.snippet) ||
                                  s(ev.text) ||
                                  s(ev.summary) ||
                                  s(ev.title);

                                return (
                                  <div
                                    key={`${id}-evidence-${index}`}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75"
                                  >
                                    {snippet ? <div>{snippet}</div> : null}
                                    {sourceUrl ? (
                                      <div className="mt-1 break-all text-xs text-white/45">
                                        {sourceUrl}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex w-full shrink-0 flex-col gap-3 xl:w-[220px]">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onApproveKnowledge(item)}
                          className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
                        >
                          {busy ? "Processing..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onRejectKnowledge(item)}
                          className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
              <h3 className="text-2xl font-semibold tracking-tight">
                No pending discoveries
              </h3>

              <p className="mt-3 max-w-2xl text-white/65">
                Hazırda review gözləyən knowledge candidate görünmür. Approved
                knowledge artıq varsa readiness buna uyğun yenilənəcək.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => loadData({ silent: true })}
                  className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black"
                >
                  Refresh discoveries
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/65">
                  Service catalog
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Define what you sell
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                  Title və description minimum kifayətdir. Daha sonra service
                  playbooks və pricing hissəsini dərinləşdirərik.
                </p>
              </div>

              {editingServiceId ? (
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveService({ refreshStudioAfterSave: false });
              }}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <div className="mb-2 text-sm text-white/70">Service title</div>
                  <input
                    value={serviceForm.title}
                    onChange={(e) => setServiceField("title", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="Instagram DM automation"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-sm text-white/70">Description</div>
                  <textarea
                    value={serviceForm.description}
                    onChange={(e) => setServiceField("description", e.target.value)}
                    className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="Service nə edir, kim üçündür, hansı nəticəni verir."
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Category</div>
                  <input
                    value={serviceForm.category}
                    onChange={(e) => setServiceField("category", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="automation"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Pricing model</div>
                  <select
                    value={serviceForm.pricingModel}
                    onChange={(e) => setServiceField("pricingModel", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                  >
                    <option value="custom_quote">Custom quote</option>
                    <option value="fixed">Fixed</option>
                    <option value="starting_from">Starting from</option>
                    <option value="hourly">Hourly</option>
                    <option value="package">Package</option>
                    <option value="free">Free</option>
                    <option value="contact">Contact</option>
                  </select>
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Price from</div>
                  <input
                    value={serviceForm.priceFrom}
                    onChange={(e) => setServiceField("priceFrom", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="500"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Currency</div>
                  <input
                    value={serviceForm.currency}
                    onChange={(e) => setServiceField("currency", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="AZN"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Duration (minutes)</div>
                  <input
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceField("durationMinutes", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="60"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm text-white/70">Sort order</div>
                  <input
                    value={serviceForm.sortOrder}
                    onChange={(e) => setServiceField("sortOrder", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder="0"
                  />
                </label>

                <label className="block md:col-span-2">
                  <div className="mb-2 text-sm text-white/70">
                    Highlights (one per line)
                  </div>
                  <textarea
                    value={serviceForm.highlightsText}
                    onChange={(e) => setServiceField("highlightsText", e.target.value)}
                    className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    placeholder={"Fast setup\nLead capture\nHuman handoff"}
                  />
                </label>

                <label className="flex items-center gap-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={!!serviceForm.isActive}
                    onChange={(e) => setServiceField("isActive", e.target.checked)}
                  />
                  <span className="text-sm text-white/75">Service is active</span>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingService}
                  className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
                >
                  {savingService
                    ? "Saving..."
                    : editingServiceId
                    ? "Update service"
                    : "Save service"}
                </button>

                <button
                  type="button"
                  disabled={savingService}
                  onClick={() => onSaveService({ refreshStudioAfterSave: true })}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white disabled:opacity-60"
                >
                  Save and sync studio
                </button>

                <button
                  type="button"
                  onClick={() => loadData({ silent: true })}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
                >
                  Refresh
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5">
              <h2 className="text-3xl font-semibold tracking-tight">
                Current services
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Mövcud service-lər burada görünür. Edit və delete edə bilərsən.
              </p>
            </div>

            {services.length ? (
              <div className="grid gap-4">
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[28px] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        {s(item.category || "general")}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        {s(item.pricingModel || "custom_quote")}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        {item.isActive ? "active" : "inactive"}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold">
                      {s(item.title) || "Untitled service"}
                    </h3>

                    {s(item.description) ? (
                      <p className="mt-2 text-sm leading-6 text-white/70">
                        {s(item.description)}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
                      <span>{formatMoney(item.priceFrom, item.currency)}</span>
                      {item.durationMinutes != null && item.durationMinutes !== "" ? (
                        <span>• {item.durationMinutes} min</span>
                      ) : null}
                    </div>

                    {arr(item.highlights).length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {arr(item.highlights).map((hl, idx) => (
                          <span
                            key={`${item.id}-hl-${idx}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                          >
                            {s(hl)}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onEditService(item)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={deletingServiceId === item.id}
                        onClick={() => onDeleteService(item)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white disabled:opacity-60"
                      >
                        {deletingServiceId === item.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm text-white/60">
                Hələ service əlavə olunmayıb.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}