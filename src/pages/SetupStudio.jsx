import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../api/app.js";
import { importWebsiteForSetup, saveBusinessProfile } from "../api/setup.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../api/knowledge.js";
import { createSetupService, getSetupServices } from "../api/services.js";
import SetupStudioScene from "../components/setup-studio/SetupStudioScene.jsx";

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

function compactValue(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => s(item))
      .filter(Boolean)
      .slice(0, 3)
      .join(" · ");
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => s(item))
      .filter(Boolean)
      .slice(0, 3)
      .join(" · ");
  }

  return s(value);
}

function isPendingKnowledge(item = {}) {
  const status = s(item.status || item.review_status || item.state).toLowerCase();
  if (!status) return true;

  return ["pending", "needs_review", "conflict", "review", "awaiting_review"].includes(
    status
  );
}

function candidateTitle(item = {}) {
  return s(item.title) || s(item.item_key) || s(item.canonical_key) || "Untitled discovery";
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

function deriveStudioProgress({ importingWebsite, discoveryState, meta }) {
  if (meta?.setupCompleted) return 100;
  if (importingWebsite) return Math.max(24, Math.min(76, 36 + Number(meta?.pendingCandidateCount || 0) * 4));

  const mode = s(discoveryState?.mode).toLowerCase();

  if (["success", "completed", "complete", "done"].includes(mode)) {
    return Math.max(Number(meta?.readinessScore || 0), 72);
  }

  if (["error", "failed"].includes(mode)) {
    return Math.max(12, Number(meta?.readinessScore || 0));
  }

  return Math.max(8, Number(meta?.readinessScore || 0));
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
      if (silent) setRefreshing(true);
      else setLoading(true);

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

  const heroSteps = useMemo(
    () =>
      [
        { key: "businessprofile", label: "Business" },
        { key: "knowledge", label: "Knowledge" },
        { key: "services", label: "Services" },
        { key: "playbooks", label: "Playbooks" },
        { key: "policies", label: "Policies" },
      ].map((item) => ({
        ...item,
        done: stepDone(meta, item.key),
      })),
    [meta]
  );

  const discoveryProfileRows = useMemo(
    () => profilePreviewRows(discoveryState.profile),
    [discoveryState.profile]
  );

  const serviceSuggestionTitle = useMemo(() => {
    const note = s(discoveryForm.note);
    if (!note) return "";
    return note.split(".")[0]?.trim() || "";
  }, [discoveryForm.note]);

  const liveSignals = useMemo(() => {
    const items = [];

    if (s(businessForm.companyName)) {
      items.push({
        label: "Identity",
        value: s(businessForm.companyName),
      });
    }

    if (meta.pendingCandidateCount > 0) {
      items.push({
        label: "Knowledge",
        value: `${meta.pendingCandidateCount} pending discovery`,
      });
    }

    if (meta.serviceCount > 0) {
      items.push({
        label: "Services",
        value: `${meta.serviceCount} service ready`,
      });
    }

    if (meta.playbookCount > 0) {
      items.push({
        label: "Playbooks",
        value: `${meta.playbookCount} playbook detected`,
      });
    }

    const signalEntries = Object.entries(obj(discoveryState.signals))
      .map(([key, value]) => ({
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/[_-]+/g, " ")
          .trim(),
        value: compactValue(value),
      }))
      .filter((item) => s(item.value));

    for (const item of signalEntries) {
      if (items.length >= 6) break;
      items.push(item);
    }

    if (!items.length && s(discoveryForm.note)) {
      items.push({
        label: "Focus note",
        value: s(discoveryForm.note).slice(0, 72),
      });
    }

    return items.slice(0, 6);
  }, [
    businessForm.companyName,
    discoveryForm.note,
    discoveryState.signals,
    meta.pendingCandidateCount,
    meta.playbookCount,
    meta.serviceCount,
  ]);

  const metrics = useMemo(
    () => [
      { label: "Readiness", value: `${meta.readinessScore}%` },
      { label: "Approved knowledge", value: String(meta.approvedKnowledgeCount) },
      { label: "Service layer", value: String(meta.serviceCount) },
      { label: "Playbooks", value: String(meta.playbookCount) },
    ],
    [meta]
  );

  const studioProgress = useMemo(
    () => deriveStudioProgress({ importingWebsite, discoveryState, meta }),
    [importingWebsite, discoveryState, meta]
  );

  const narrative = useMemo(() => {
    if (meta.setupCompleted) {
      return "Core onboarding hazırdır. Workspace-ə keçə bilərsən.";
    }

    if (importingWebsite) {
      return "System pages-i oxuyur, intent çıxarır və ilk operational twin qatını hazırlayır.";
    }

    if (["success", "completed", "complete", "done"].includes(s(discoveryState.mode).toLowerCase())) {
      return "İlk siqnallar çıxarıldı. İndi refine et, discovery-ləri review et və workspace-ə keç.";
    }

    if (["error", "failed"].includes(s(discoveryState.mode).toLowerCase())) {
      return "Scan alınmadı. URL və qeydini yeniləyib bir də yoxla.";
    }

    return "Əsas website-i ver. Studio business identity, service layer, knowledge və tone istiqamətlərini çıxarsın.";
  }, [discoveryState.mode, importingWebsite, meta.setupCompleted]);

  const knowledgePreview = useMemo(
    () =>
      knowledgeCandidates.slice(0, 6).map((item) => ({
        id: s(item.id),
        title: candidateTitle(item),
        value: candidateValue(item),
        category: candidateCategory(item),
        source: candidateSource(item),
        confidence: candidateConfidence(item),
        status: s(item.status || "pending"),
        evidenceUrl: s(
          evidenceList(item)[0]?.url ||
            evidenceList(item)[0]?.source_url ||
            evidenceList(item)[0]?.link
        ),
      })),
    [knowledgeCandidates]
  );

  return (
    <SetupStudioScene
      loading={loading}
      refreshing={refreshing}
      importingWebsite={importingWebsite}
      savingBusiness={savingBusiness}
      actingKnowledgeId={actingKnowledgeId}
      savingServiceSuggestion={savingServiceSuggestion}
      showRefine={showRefine}
      showKnowledge={showKnowledge}
      error={error}
      businessForm={businessForm}
      discoveryForm={discoveryForm}
      discoveryState={discoveryState}
      meta={meta}
      heroSteps={heroSteps}
      metrics={metrics}
      liveSignals={liveSignals}
      discoveryProfileRows={discoveryProfileRows}
      knowledgePreview={knowledgePreview}
      serviceSuggestionTitle={serviceSuggestionTitle}
      studioProgress={studioProgress}
      narrative={narrative}
      services={services}
      onSetBusinessField={setBusinessField}
      onSetDiscoveryField={setDiscoveryField}
      onScanBusiness={onScanBusiness}
      onSaveBusiness={onSaveBusiness}
      onApproveKnowledge={onApproveKnowledge}
      onRejectKnowledge={onRejectKnowledge}
      onCreateSuggestedService={onCreateSuggestedService}
      onOpenWorkspace={onOpenWorkspace}
      onRefresh={() => loadData({ silent: true, preserveBusinessForm: true })}
      onToggleRefine={() => setShowRefine((prev) => !prev)}
      onToggleKnowledge={() => setShowKnowledge((prev) => !prev)}
      discoveryModeLabel={discoveryModeLabel}
    />
  );
}