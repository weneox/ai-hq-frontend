// src/api/setup.js
// FINAL v1.3

import { apiGet, apiPost, apiPut } from "./client.js";

export function getSetupStatus() {
  return apiGet("/api/setup/status");
}

export function getSetupOverview() {
  return apiGet("/api/setup/overview");
}

export function saveBusinessProfile(payload = {}) {
  return apiPut("/api/setup/business-profile", payload);
}

export function saveRuntimePreferences(payload = {}) {
  return apiPut("/api/setup/runtime-preferences", payload);
}

export function importWebsiteForSetup(payload = {}) {
  return apiPost("/api/setup/import/website", payload);
}

export function importGoogleMapsForSetup(payload = {}) {
  return apiPost("/api/setup/import/google-maps", payload);
}

export function importSourceForSetup(payload = {}) {
  return apiPost("/api/setup/import/source", payload);
}

export function getSetupReviewDraft(params = {}) {
  const query = new URLSearchParams();

  if (params?.sourceId) {
    query.set("sourceId", String(params.sourceId));
  }

  if (params?.sourceRunId) {
    query.set("sourceRunId", String(params.sourceRunId));
  }

  const qs = query.toString();
  return apiGet(`/api/setup/review-draft${qs ? `?${qs}` : ""}`);
}

export function finalizeSetupReview(payload = {}) {
  return apiPost("/api/setup/review-finalize", payload);
}