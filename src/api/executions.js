import { apiGet } from "./client.js";

const LIST_CANDIDATES = [
  "/api/executions",
  "/api/executions?limit=50",
  "/api/jobs",
  "/api/jobs?limit=50",
];

const GET_CANDIDATES = (id) => [
  `/api/executions/${encodeURIComponent(id)}`,
  `/api/jobs/${encodeURIComponent(id)}`,
];

async function firstOk(paths) {
  let lastErr = null;
  for (const p of paths) {
    try {
      return await apiGet(p);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("No executions endpoint found");
}

function normalizeList(j) {
  const items =
    j.executions ||
    j.jobs ||
    j.items ||
    j.rows ||
    j.data ||
    [];

  return Array.isArray(items) ? items : [];
}

export async function listExecutions() {
  const j = await firstOk(LIST_CANDIDATES);
  return normalizeList(j);
}

export async function getExecution(id) {
  const j = await firstOk(GET_CANDIDATES(id));
  return j.execution || j.job || j.item || j;
}