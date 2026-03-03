import { apiGet } from "./client.js";

export async function listExecutions({ status = "", limit = 50 } = {}) {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (limit) qs.set("limit", String(limit));
  const j = await apiGet(`/api/executions?${qs.toString()}`);
  return j.executions || [];
}

export async function getExecution(id) {
  const j = await apiGet(`/api/executions/${encodeURIComponent(String(id))}`);
  return j.execution;
}