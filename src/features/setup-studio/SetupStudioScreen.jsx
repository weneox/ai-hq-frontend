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
  const runtime = obj(setup?.runtime || workspace?.runtime);

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
      progress?.nextSetupRoute || workspace?.nextSetupRoute || "/setup/studio"
    ),
    nextStudioStage: s(
      progress?.nextStudioStage || workspace?.nextStudioStage || "entry"
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
    runtimeKnowledgeCount: Number(runtime?.knowledgeCount || 0),
    runtimeServiceCount: Number(runtime?.serviceCount || 0),
    runtimePlaybookCount: Number(runtime?.playbookCount || 0),
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

function applyUiHintsFromMeta({
  nextMeta = {},
  pendingKnowledge = [],
  setShowKnowledge,
  setShowRefine,
}) {
  const stage = s(nextMeta?.nextStudioStage);

  if (stage === "knowledge" && arr(pendingKnowledge).length > 0) {
    setShowKnowledge(true);
  }

  if (stage === "identity" || stage === "business_profile") {
    setShowRefine(true);
  }
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
    sourceLabel: "",
    message: "",
    candidateCount: 0,
    profileApplied: false,
    shouldReview: false,
    warnings: [],
    requestId: "",
    intakeContext: {},
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
    nextSetupRoute: "/setup/studio",
    nextStudioStage: "entry",
    setupCompleted: false,
    pendingCandidateCount: 0,
    approvedKnowledgeCount: 0,
    serviceCount: 0,
    playbookCount: 0,
    runtimeKnowledgeCount: 0,
    runtimeServiceCount: 0,
    runtimePlaybookCount: 0,
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

      applyUiHintsFromMeta({
        nextMeta,
        pendingKnowledge,
        setShowKnowledge,
        setShowRefine,
      });

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

  useEffect(() => {
    if (meta.setupCompleted) return;

    if (s(meta.nextStudioStage) === "knowledge" && knowledgeCandidates.length > 0) {
      setShowKnowledge(true);
    }
  }, [meta.nextStudioStage, meta.setupCompleted, knowledgeCandidates.length]);

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

    applyUiHintsFromMeta({
      nextMeta,
      pendingKnowledge: arr(snapshot?.pendingKnowledge),
      setShowKnowledge,
      setShowRefine,
    });

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
        sourceLabel: sourceType === "google_maps" ? "Google Maps" : "Website",
        message: scanStartLabel(sourceType),
        warnings: [],
        shouldReview: false,
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

      const resultWarnings = arr(result?.warnings).map((x) => s(x)).filter(Boolean);

      setDiscoveryState({
        mode: s(result?.mode) || "success",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: s(result?.sourceLabel || (sourceType === "google_maps" ? "Google Maps" : "Website")),
        message:
          resultWarnings.length > 0
            ? resultWarnings[0]
            : scanCompleteLabel(sourceType, result?.candidateCount),
        candidateCount: Number(result?.candidateCount || 0),
        profileApplied,
        shouldReview: !!result?.shouldReview,
        warnings: resultWarnings,
        requestId: s(result?.requestId),
        intakeContext: obj(result?.intakeContext),
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
          !!result?.shouldReview ||
          Number(result?.candidateCount || 0) > 0 ||
          refreshedPendingKnowledge.length > 0 ||
          s(refreshResult?.snapshot?.meta?.nextStudioStage) === "knowledge";

        setShowKnowledge(shouldOpenKnowledge);

        if (profileApplied || s(refreshResult?.snapshot?.meta?.nextStudioStage) === "identity") {
          setShowRefine(true);
        }
      }
    } catch (e2) {
      const message = String(e2?.message || e2 || "Source scan alınmadı.");
      setDiscoveryState((prev) => ({
        ...prev,
        mode: "error",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: sourceType === "google_maps" ? "Google Maps" : "Website",
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

      const refreshed = await refreshAndMaybeRouteHome({ preserveBusinessForm: false });

      if (!refreshed?.routed && s(refreshed?.snapshot?.meta?.nextStudioStage) === "knowledge") {
        setShowKnowledge(true);
      }

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
      const refreshed = await refreshAndMaybeRouteHome({ preserveBusinessForm: true });

      if (!refreshed?.routed) {
        const nextStage = s(refreshed?.snapshot?.meta?.nextStudioStage);
        if (nextStage !== "knowledge") {
          setShowKnowledge(false);
        }
      }

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
      const refreshed = await refreshAndMaybeRouteHome({ preserveBusinessForm: true });

      if (!refreshed?.routed) {
        const remaining = Number(refreshed?.snapshot?.meta?.pendingCandidateCount || 0);
        if (remaining <= 0) {
          setShowKnowledge(false);
        }
      }

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

      applyUiHintsFromMeta({
        nextMeta,
        pendingKnowledge: arr(snapshot?.pendingKnowledge),
        setShowKnowledge,
        setShowRefine,
      });

      navigate("/setup/studio", { replace: true });
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
      nextSetupRoute: s(meta.nextSetupRoute || derived.nextSetupRoute || "/setup/studio"),
      nextStudioStage: s(meta.nextStudioStage || "entry"),
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