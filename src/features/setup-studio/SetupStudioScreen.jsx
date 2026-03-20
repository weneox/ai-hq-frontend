import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../../api/app.js";
import { importSourceForSetup, saveBusinessProfile } from "../../api/setup.js";
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
  deriveStudioProgress,
} from "./lib/setupStudioHelpers.js";

function pickSetupProfile(setup = {}, workspace = {}) {
  return obj(
    setup?.tenantProfile ||
      setup?.businessProfile ||
      workspace?.tenantProfile ||
      workspace?.businessProfile
  );
}

function normalizeBootMeta(boot = {}, pendingKnowledge = [], serviceItems = []) {
  const workspace = obj(boot?.workspace);
  const setup = obj(boot?.setup);
  const knowledge = obj(setup?.knowledge || workspace?.knowledge);
  const catalog = obj(setup?.catalog || workspace?.catalog);
  const progress = obj(setup?.progress || workspace?.progress || workspace);

  return {
    readinessScore: Number(
      progress?.readinessScore || workspace?.readinessScore || 0
    ),
    readinessLabel: s(
      progress?.readinessLabel || workspace?.readinessLabel || ""
    ),
    missingSteps: arr(progress?.missingSteps || workspace?.missingSteps),
    primaryMissingStep: s(
      progress?.primaryMissingStep || workspace?.primaryMissingStep || ""
    ),
    nextRoute: s(progress?.nextRoute || workspace?.nextRoute || "/"),
    nextSetupRoute: s(
      progress?.nextSetupRoute || workspace?.nextSetupRoute || "/setup"
    ),
    setupCompleted: !!(
      progress?.setupCompleted ?? workspace?.setupCompleted ?? false
    ),
    pendingCandidateCount: Number(
      knowledge?.pendingCandidateCount || pendingKnowledge.length || 0
    ),
    approvedKnowledgeCount: Number(knowledge?.approvedKnowledgeCount || 0),
    serviceCount: Number(catalog?.serviceCount || serviceItems.length || 0),
    playbookCount: Number(catalog?.playbookCount || 0),
  };
}

function deriveSuggestedServicePayload({
  discoveryForm,
  discoveryState,
  knowledgeCandidates,
}) {
  const serviceCandidate = knowledgeCandidates.find((item) => {
    const category = s(candidateCategory(item)).toLowerCase();
    return category === "service" || category === "product";
  });

  const discoveredServices = arr(
    discoveryState?.profile?.services ||
      discoveryState?.signals?.sourceFusion?.profile?.services ||
      discoveryState?.signals?.website?.offerings?.services
  );

  const fallbackTitle =
    s(candidateTitle(serviceCandidate)) ||
    s(discoveredServices[0]) ||
    s(discoveryForm.note.split(".")[0]) ||
    "Discovered service";

  const fallbackDescription =
    s(candidateValue(serviceCandidate)) ||
    s(discoveryForm.note) ||
    s(
      discoveryState?.profile?.summaryShort ||
        discoveryState?.profile?.companySummaryShort ||
        discoveryState?.profile?.description
    ) ||
    `Service discovered from ${s(discoveryState?.lastUrl || "source import")}.`;

  const category = (() => {
    const raw = s(candidateCategory(serviceCandidate)).toLowerCase();
    if (raw === "service" || raw === "product") return raw;
    return "general";
  })();

  return {
    title: fallbackTitle,
    description: fallbackDescription,
    category,
    priceFrom: "",
    currency: "AZN",
    pricingModel: "custom_quote",
    durationMinutes: "",
    sortOrder: 0,
    highlightsText: "",
    isActive: true,
  };
}

function normalizeIncomingSourceType(value = "") {
  const x = s(value).toLowerCase().replace(/[\s-]+/g, "_");

  if (x === "website" || x === "site" || x === "web") return "website";
  if (x === "google_maps" || x === "googlemaps" || x === "maps" || x === "gmaps") {
    return "google_maps";
  }

  return "";
}

function detectSourceTypeFromUrl(url = "") {
  const value = s(url).toLowerCase();

  if (
    value.includes("google.com/maps") ||
    value.includes("maps.app.goo.gl") ||
    value.includes("g.co/kgs")
  ) {
    return "google_maps";
  }

  return "website";
}

function normalizeScanRequest(input, discoveryForm = {}) {
  if (input && typeof input.preventDefault === "function") {
    input.preventDefault();

    const fallbackUrl = s(discoveryForm.websiteUrl);
    return {
      sourceType: detectSourceTypeFromUrl(fallbackUrl),
      url: fallbackUrl,
      note: s(discoveryForm.note),
      sources: [],
      primarySource: null,
    };
  }

  const payload = obj(input);
  const url = s(payload.url || payload.sourceUrl || discoveryForm.websiteUrl);
  const sourceType =
    normalizeIncomingSourceType(payload.sourceType || payload.type) ||
    detectSourceTypeFromUrl(url);

  return {
    sourceType,
    url,
    note: s(payload.note || discoveryForm.note),
    sources: arr(payload.sources),
    primarySource: payload.primarySource || null,
  };
}

function scanStartLabel(sourceType = "") {
  return sourceType === "google_maps"
    ? "Google Maps scan başladı..."
    : "Website scan başladı...";
}

function scanCompleteLabel(sourceType = "", candidateCount = 0) {
  const count = Number(candidateCount || 0);

  if (count > 0) {
    return `${count} discovery hazırlandı.`;
  }

  return sourceType === "google_maps"
    ? "Google Maps import tamamlandı."
    : "Website import tamamlandı.";
}

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
    lastSourceType: "",
    message: "",
    candidateCount: 0,
    profileApplied: false,
    profile: {},
    signals: {},
    snapshot: {},
  });

  const [knowledgeCandidates, setKnowledgeCandidates] = useState([]);
  const [services, setServices] = useState([]);

  const [meta, setMeta] = useState({
    readinessScore: 0,
    readinessLabel: "",
    missingSteps: [],
    primaryMissingStep: "",
    nextRoute: "/",
    nextSetupRoute: "/setup",
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
      const profile = pickSetupProfile(setup, workspace);

      const rawKnowledge = extractItems(knowledgePayload);
      const pendingKnowledge = rawKnowledge.filter(isPendingKnowledge);
      const serviceItems = extractItems(servicesPayload);

      const nextMeta = normalizeBootMeta(boot, pendingKnowledge, serviceItems);

      setMeta(nextMeta);

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

      return {
        boot,
        workspace,
        setup,
        profile,
        pendingKnowledge,
        serviceItems,
        meta: nextMeta,
      };
    } catch (e) {
      const message = String(
        e?.message || e || "Setup studio data could not be loaded."
      );
      setError(message);
      return {
        boot: {},
        workspace: {},
        setup: {},
        profile: {},
        pendingKnowledge: [],
        serviceItems: [],
        meta: {},
        error: message,
      };
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function refreshAndMaybeRouteHome({ preserveBusinessForm = false } = {}) {
    const snapshot = await loadData({
      silent: true,
      preserveBusinessForm,
    });

    const nextMeta = obj(snapshot?.meta);

    if (nextMeta.setupCompleted) {
      navigate(s(nextMeta.nextRoute || "/"), { replace: true });
      return {
        routed: true,
        snapshot,
      };
    }

    return {
      routed: false,
      snapshot,
    };
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

  async function onScanBusiness(input) {
    const request = normalizeScanRequest(input, discoveryForm);
    const sourceType = request.sourceType;
    const sourceUrl = s(request.url);

    if (!sourceUrl) {
      setError("Source URL boş ola bilməz.");
      return;
    }

    if (!sourceType) {
      setError("Scan üçün source type müəyyən edilə bilmədi.");
      return;
    }

    try {
      setImportingWebsite(true);
      setError("");

      setDiscoveryState((prev) => ({
        ...prev,
        mode: "running",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        message: scanStartLabel(sourceType),
      }));

      const result = await importSourceForSetup({
        sourceType,
        url: sourceUrl,
        sourceUrl: sourceUrl,
        note: request.note,
        businessNote: request.note,
        sources: request.sources,
        primarySource: request.primarySource,
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
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        message: scanCompleteLabel(sourceType, result?.candidateCount),
        candidateCount: Number(result?.candidateCount || 0),
        profileApplied,
        profile: discoveredProfile,
        signals: obj(result?.signals),
        snapshot: obj(result?.snapshot),
      });

      const refreshResult = await refreshAndMaybeRouteHome({
        preserveBusinessForm: true,
      });

      if (!refreshResult.routed) {
        const refreshedPendingKnowledge = arr(
          refreshResult?.snapshot?.pendingKnowledge
        );

        const shouldOpenKnowledge =
          Number(result?.candidateCount || 0) > 0 ||
          refreshedPendingKnowledge.length > 0;

        setShowKnowledge(shouldOpenKnowledge);
      }
    } catch (e2) {
      const message = String(e2?.message || e2 || "Source scan alınmadı.");
      setDiscoveryState((prev) => ({
        ...prev,
        mode: "error",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        message,
      }));
      setError(message);
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
      return { ok: true };
    } catch (e2) {
      setError(String(e2?.message || e2 || "Business profile could not be saved."));
      return { ok: false };
    } finally {
      setSavingBusiness(false);
    }
  }

  async function onApproveKnowledge(item) {
    const id = s(item.id);
    if (!id) return { ok: false };

    try {
      setActingKnowledgeId(id);
      setError("");

      await approveKnowledgeCandidate(id, {});
      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });
      return { ok: true };
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be approved."));
      return { ok: false };
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onRejectKnowledge(item) {
    const id = s(item.id);
    if (!id) return { ok: false };

    try {
      setActingKnowledgeId(id);
      setError("");

      await rejectKnowledgeCandidate(id, {});
      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });
      return { ok: true };
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be rejected."));
      return { ok: false };
    } finally {
      setActingKnowledgeId("");
    }
  }

  async function onCreateSuggestedService() {
    try {
      setSavingServiceSuggestion("creating");
      setError("");

      const payload = deriveSuggestedServicePayload({
        discoveryForm,
        discoveryState,
        knowledgeCandidates,
      });

      await createSetupService(payload);
      await refreshAndMaybeRouteHome({ preserveBusinessForm: true });

      return { ok: true };
    } catch (e) {
      setError(String(e?.message || e || "Suggested service could not be created."));
      return { ok: false, error: String(e?.message || e || "") };
    } finally {
      setSavingServiceSuggestion("");
    }
  }

  async function onOpenWorkspace() {
    try {
      setError("");

      const snapshot = await loadData({ silent: true, preserveBusinessForm: true });
      const nextMeta = obj(snapshot?.meta);

      if (nextMeta.setupCompleted) {
        navigate(s(nextMeta.nextRoute || "/"), { replace: true });
        return;
      }

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
    const derived = deriveSuggestedServicePayload({
      discoveryForm,
      discoveryState,
      knowledgeCandidates,
    });
    return s(derived.title);
  }, [discoveryForm, discoveryState, knowledgeCandidates]);

  const studioProgress = useMemo(() => {
    const derived = obj(deriveStudioProgress({ importingWebsite, discoveryState, meta }));

    return {
      ...derived,
      readinessScore: Number(meta.readinessScore || derived.readinessScore || 0),
      readinessLabel: s(meta.readinessLabel || derived.readinessLabel),
      missingSteps: arr(meta.missingSteps).length
        ? arr(meta.missingSteps)
        : arr(derived.missingSteps),
      primaryMissingStep: s(meta.primaryMissingStep || derived.primaryMissingStep),
      nextRoute: s(meta.nextRoute || derived.nextRoute || "/"),
      nextSetupRoute: s(meta.nextSetupRoute || derived.nextSetupRoute || "/setup"),
      setupCompleted: !!(meta.setupCompleted ?? derived.setupCompleted),
    };
  }, [importingWebsite, discoveryState, meta]);

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