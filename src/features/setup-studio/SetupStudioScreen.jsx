import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../../api/app.js";
import {
  importSourceForSetup,
  getSetupReviewDraft,
  finalizeSetupReview,
} from "../../api/setup.js";
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

function formFromProfile(profile = {}, prev = {}) {
  const x = obj(profile);

  return {
    ...prev,
    companyName: s(
      x.companyName || x.company_name || x.displayName || x.display_name || prev.companyName
    ),
    description: s(
      x.summaryShort ||
        x.summary_short ||
        x.summaryLong ||
        x.summary_long ||
        x.description ||
        prev.description
    ),
    timezone: s(prev.timezone || "Asia/Baku"),
    language: s(
      x.mainLanguage || x.main_language || x.language || prev.language || "az"
    ),
    websiteUrl: s(x.websiteUrl || x.website_url || prev.websiteUrl),
    primaryPhone: s(x.primaryPhone || x.primary_phone || prev.primaryPhone),
    primaryEmail: s(x.primaryEmail || x.primary_email || prev.primaryEmail),
    primaryAddress: s(x.primaryAddress || x.primary_address || prev.primaryAddress),
  };
}

function mapDraftToBusinessForm(draft = {}, prev = {}) {
  return formFromProfile(obj(draft?.overview), prev);
}

function parseServicesText(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, ...rest] = line.split("|");
      const name = s(namePart);
      const description = s(rest.join("|"));
      return {
        name: name || description,
        description: description || name,
      };
    })
    .filter((item) => s(item.name) || s(item.description));
}

function parseFaqsText(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [questionPart, ...rest] = line.split("|");
      const question = s(questionPart);
      const answer = s(rest.join("|"));
      return {
        question: question || answer,
        answer: answer || question,
      };
    })
    .filter((item) => s(item.question) || s(item.answer));
}

function parsePoliciesText(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [titlePart, ...rest] = line.split("|");
      const title = s(titlePart);
      const description = s(rest.join("|"));
      return {
        title: title || description,
        description: description || title,
      };
    })
    .filter((item) => s(item.title) || s(item.description));
}

function textFromDraftSection(items = [], mode = "title") {
  return arr(items)
    .map((item) => {
      const x = obj(item);

      if (mode === "faq") {
        return `${s(x.title)} | ${s(x.valueText)}`.trim();
      }

      return `${s(x.title)} | ${s(x.valueText)}`.trim();
    })
    .filter(Boolean)
    .join("\n");
}

function buildManualSectionsFromDraft(draft = {}) {
  const sections = obj(draft?.sections);

  return {
    servicesText: textFromDraftSection(sections.services, "service"),
    faqsText: textFromDraftSection(sections.faqs, "faq"),
    policiesText: textFromDraftSection(sections.policies, "policy"),
  };
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
    websiteUrl: "",
    primaryPhone: "",
    primaryEmail: "",
    primaryAddress: "",
  });

  const [manualSections, setManualSections] = useState({
    servicesText: "",
    faqsText: "",
    policiesText: "",
  });

  const [reviewDraft, setReviewDraft] = useState({
    sourceId: "",
    sourceRunId: "",
    snapshotId: "",
    quickSummary: "",
    overview: {},
    capabilities: {},
    sections: {},
    reviewQueue: [],
    existing: {},
    stats: {},
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
    sourceId: "",
    sourceRunId: "",
    snapshotId: "",
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

  function setBusinessField(key, value) {
    setBusinessForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function setManualSection(key, value) {
    setManualSections((prev) => ({
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

  async function loadDraft({ sourceId = "", sourceRunId = "" } = {}) {
    try {
      const payload = await getSetupReviewDraft({
        sourceId,
        sourceRunId,
      });

      const nextDraft = obj(payload?.draft);
      if (Object.keys(nextDraft).length) {
        setReviewDraft(nextDraft);
        setBusinessForm((prev) => mapDraftToBusinessForm(nextDraft, prev));
        setManualSections((prev) => {
          const draftSections = buildManualSectionsFromDraft(nextDraft);
          return {
            servicesText: s(prev.servicesText) || s(draftSections.servicesText),
            faqsText: s(prev.faqsText) || s(draftSections.faqsText),
            policiesText: s(prev.policiesText) || s(draftSections.policiesText),
          };
        });
      }

      return nextDraft;
    } catch {
      return {};
    }
  }

  async function loadData({ silent = false, preserveBusinessForm = false } = {}) {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const [boot, knowledgePayload, servicesPayload, reviewPayload] = await Promise.all([
        getAppBootstrap(),
        getKnowledgeCandidates(),
        getSetupServices(),
        getSetupReviewDraft().catch(() => ({ draft: {} })),
      ]);

      const workspace = obj(boot?.workspace);
      const setup = obj(boot?.setup);
      const profile = pickSetupProfile(setup, workspace);

      const rawKnowledge = extractItems(knowledgePayload);
      const pendingKnowledge = rawKnowledge.filter(isPendingKnowledge);
      const serviceItems = extractItems(servicesPayload);

      const nextMeta = normalizeBootMeta(boot, pendingKnowledge, serviceItems);

      setMeta(nextMeta);

      const loadedDraft = obj(reviewPayload?.draft);
      if (Object.keys(loadedDraft).length) {
        setReviewDraft(loadedDraft);
      }

      if (!preserveBusinessForm) {
        const baseProfile =
          Object.keys(loadedDraft).length > 0 ? loadedDraft?.overview : profile;

        setBusinessForm((prev) =>
          formFromProfile(baseProfile, {
            ...prev,
            companyName: s(profile?.companyName),
            description: s(profile?.description),
            timezone: s(profile?.timezone || "Asia/Baku"),
            language: firstLanguage(profile),
            websiteUrl: s(profile?.websiteUrl || profile?.website_url),
            primaryPhone: s(profile?.primaryPhone || profile?.primary_phone),
            primaryEmail: s(profile?.primaryEmail || profile?.primary_email),
            primaryAddress: s(profile?.primaryAddress || profile?.primary_address),
          })
        );
      }

      if (Object.keys(loadedDraft).length) {
        setManualSections((prev) => {
          const draftSections = buildManualSectionsFromDraft(loadedDraft);
          return {
            servicesText: s(prev.servicesText) || s(draftSections.servicesText),
            faqsText: s(prev.faqsText) || s(draftSections.faqsText),
            policiesText: s(prev.policiesText) || s(draftSections.policiesText),
          };
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
        reviewDraft: loadedDraft,
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
        reviewDraft: {},
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
      const draftFromImport = obj(result?.draft);
      const profilePatch =
        Object.keys(draftFromImport).length > 0
          ? mapDraftToBusinessForm(draftFromImport, {})
          : profilePatchFromDiscovery(discoveredProfile);

      const mergedForm = mergeBusinessForm(businessForm, profilePatch);
      const profileApplied =
        JSON.stringify(mergedForm) !== JSON.stringify(businessForm);

      if (profileApplied) {
        setBusinessForm(mergedForm);
      }

      const resultWarnings = arr(result?.warnings).map((x) => s(x)).filter(Boolean);

      const sourceId = s(result?.source?.id);
      const sourceRunId = s(result?.run?.id);
      const snapshotId = s(result?.snapshot?.id);

      setDiscoveryState({
        mode: s(result?.mode) || "success",
        lastUrl: sourceUrl,
        lastSourceType: sourceType,
        sourceLabel: s(
          result?.sourceLabel || (sourceType === "google_maps" ? "Google Maps" : "Website")
        ),
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
        sourceId,
        sourceRunId,
        snapshotId,
      });

      let nextDraft = draftFromImport;

      if (!Object.keys(nextDraft).length) {
        nextDraft = await loadDraft({ sourceId, sourceRunId });
      } else {
        setReviewDraft(nextDraft);
        setManualSections((prev) => {
          const draftSections = buildManualSectionsFromDraft(nextDraft);
          return {
            servicesText: s(prev.servicesText) || s(draftSections.servicesText),
            faqsText: s(prev.faqsText) || s(draftSections.faqsText),
            policiesText: s(prev.policiesText) || s(draftSections.policiesText),
          };
        });
      }

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
          arr(nextDraft?.reviewQueue).length > 0 ||
          s(refreshResult?.snapshot?.meta?.nextStudioStage) === "knowledge";

        setShowKnowledge(shouldOpenKnowledge);
        setShowRefine(true);
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
    if (e?.preventDefault) e.preventDefault();

    try {
      setSavingBusiness(true);
      setError("");

      const approveCandidateIds = arr(reviewDraft?.reviewQueue)
        .map((item) => s(item.candidateId || item.id))
        .filter(Boolean);

      await finalizeSetupReview({
        sourceId: s(reviewDraft?.sourceId || discoveryState?.sourceId),
        sourceRunId: s(reviewDraft?.sourceRunId || discoveryState?.sourceRunId),
        snapshotId: s(reviewDraft?.snapshotId || discoveryState?.snapshotId),
        profile: {
          companyName: s(businessForm.companyName),
          displayName: s(businessForm.companyName),
          summaryShort: s(businessForm.description),
          summaryLong: s(businessForm.description),
          mainLanguage: s(businessForm.language || "az"),
          supportedLanguages: businessForm.language ? [businessForm.language] : [],
          websiteUrl: s(
            businessForm.websiteUrl || reviewDraft?.overview?.websiteUrl || discoveryState?.lastUrl
          ),
          primaryPhone: s(businessForm.primaryPhone),
          primaryEmail: s(businessForm.primaryEmail),
          primaryAddress: s(businessForm.primaryAddress),
        },
        capabilities: {
          ...obj(reviewDraft?.capabilities),
          primaryLanguage: s(businessForm.language || "az"),
          supportedLanguages: businessForm.language ? [businessForm.language] : [],
          supportsMultilanguage: false,
        },
        services: parseServicesText(manualSections.servicesText),
        faqs: parseFaqsText(manualSections.faqsText),
        policies: parsePoliciesText(manualSections.policiesText),
        candidateDecisions: {
          approve: approveCandidateIds.map((candidateId) => ({ candidateId })),
          reject: [],
        },
        metadataJson: {
          source: "setup_studio_finalize",
          requestId: s(discoveryState.requestId),
        },
      });

      setShowRefine(false);
      setShowKnowledge(false);

      const refreshed = await refreshAndMaybeRouteHome({ preserveBusinessForm: false });

      if (!refreshed?.routed) {
        await loadDraft();
      }

      return { ok: true };
    } catch (e2) {
      setError(String(e2?.message || e2 || "Business twin finalize edilə bilmədi."));
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
      await loadDraft();
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
      await loadDraft();
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

  const draftBackedProfile = useMemo(() => {
    if (Object.keys(obj(reviewDraft?.overview)).length) {
      return obj(reviewDraft?.overview);
    }
    return obj(discoveryState.profile);
  }, [reviewDraft, discoveryState.profile]);

  const discoveryProfileRows = useMemo(
    () => profilePreviewRows(draftBackedProfile),
    [draftBackedProfile]
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

  const knowledgePreview = useMemo(() => {
    const sourceItems = arr(reviewDraft?.reviewQueue).length
      ? arr(reviewDraft?.reviewQueue)
      : knowledgeCandidates;

    return sourceItems.slice(0, 6).map((item) => ({
      id: s(item.id || item.candidateId),
      title: s(item.title || candidateTitle(item)),
      value: s(item.valueText || candidateValue(item)),
      category: s(item.category || candidateCategory(item)),
      source: candidateSource(item),
      confidence: candidateConfidence(item),
      status: s(item.status || "pending"),
      evidenceUrl: s(
        evidenceList(item)[0]?.url ||
          evidenceList(item)[0]?.source_url ||
          evidenceList(item)[0]?.link ||
          arr(item?.evidence)[0]?.pageUrl
      ),
    }));
  }, [knowledgeCandidates, reviewDraft]);

  const currentTitle = useMemo(
    () =>
      s(
        businessForm.companyName ||
          reviewDraft?.overview?.companyName ||
          reviewDraft?.overview?.displayName
      ),
    [businessForm.companyName, reviewDraft]
  );

  const currentDescription = useMemo(
    () =>
      s(
        reviewDraft?.quickSummary ||
          businessForm.description ||
          reviewDraft?.overview?.summaryShort ||
          discoveryState?.profile?.summaryShort
      ),
    [reviewDraft, businessForm.description, discoveryState]
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
      reviewDraft={reviewDraft}
      manualSections={manualSections}
      meta={meta}
      currentTitle={currentTitle}
      currentDescription={currentDescription}
      discoveryProfileRows={discoveryProfileRows}
      knowledgePreview={knowledgePreview}
      serviceSuggestionTitle={serviceSuggestionTitle}
      studioProgress={studioProgress}
      services={services}
      onSetBusinessField={setBusinessField}
      onSetManualSection={setManualSection}
      onSetDiscoveryField={setDiscoveryField}
      onScanBusiness={onScanBusiness}
      onSaveBusiness={onSaveBusiness}
      onApproveKnowledge={onApproveKnowledge}
      onRejectKnowledge={onRejectKnowledge}
      onCreateSuggestedService={onCreateSuggestedService}
      onOpenWorkspace={onOpenWorkspace}
      onReloadReviewDraft={() => loadDraft()}
      onRefresh={() => loadData({ silent: true, preserveBusinessForm: true })}
      onToggleRefine={() => setShowRefine((prev) => !prev)}
      onToggleKnowledge={() => setShowKnowledge((prev) => !prev)}
      discoveryModeLabel={discoveryModeLabel}
    />
  );
}