import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../../api/app.js";
import { importWebsiteForSetup, saveBusinessProfile } from "../../api/setup.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../../api/knowledge.js";
import { createSetupService, getSetupServices } from "../../api/services.js";
import SetupStudioScene from "./SetupStudioScene.jsx";
import {
  arr,
  obj,
  s,
  firstLanguage,
  extractItems,
  isPendingKnowledge,
  candidateTitle,
  candidateCategory,
  candidateValue,
  candidateSource,
  candidateConfidence,
  evidenceList,
  profilePatchFromDiscovery,
  mergeBusinessForm,
  profilePreviewRows,
  discoveryModeLabel,
  stepDone,
  deriveStudioProgress,
} from "./lib/setupStudioHelpers.js";

export default function SetupStudioScreen() {
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
        { key: "entry", label: "start" },
        { key: "scanning", label: "scan" },
        { key: "identity", label: "identity" },
        { key: "knowledge", label: "knowledge" },
        { key: "service", label: "service" },
        { key: "ready", label: "ready" },
      ],
    []
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

  const studioProgress = useMemo(
    () => deriveStudioProgress({ importingWebsite, discoveryState, meta }),
    [importingWebsite, discoveryState, meta]
  );

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
      discoveryProfileRows={discoveryProfileRows}
      knowledgePreview={knowledgePreview}
      serviceSuggestionTitle={serviceSuggestionTitle}
      studioProgress={studioProgress}
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