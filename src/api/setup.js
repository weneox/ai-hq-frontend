// src/api/setup.js
// FINAL v1.1

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