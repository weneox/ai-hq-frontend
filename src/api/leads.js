const RAW = (import.meta.env.VITE_API_BASE || "").trim();
const API_BASE = RAW ? RAW.replace(/\/+$/, "") : "";

function assertConfigured() {
  if (!API_BASE) {
    throw new Error(
      "VITE_API_BASE is not set. Example: https://ai-hq-backend-production.up.railway.app"
    );
  }
}

async function readJson(r) {
  const text = await r.text().catch(() => "");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function pickErr(j, fallback) {
  return String(j?.error || j?.details?.message || j?.message || j?.raw || fallback);
}

async function req(path, init = {}) {
  assertConfigured();

  const r = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json; charset=utf-8" } : {}),
      ...(init.headers || {}),
    },
  });

  const j = await readJson(r);
  if (!r.ok || j?.ok === false) {
    throw new Error(pickErr(j, "Request failed"));
  }
  return j;
}

export async function listLeads({
  tenantKey = "neox",
  stage = "",
  status = "",
  owner = "",
  priority = "",
  q = "",
  limit = 50,
} = {}) {
  const qs = new URLSearchParams();
  qs.set("tenantKey", tenantKey);
  if (stage) qs.set("stage", stage);
  if (status) qs.set("status", status);
  if (owner) qs.set("owner", owner);
  if (priority) qs.set("priority", priority);
  if (q) qs.set("q", q);
  qs.set("limit", String(limit));

  return req(`/api/leads?${qs.toString()}`);
}

export async function getLead(id) {
  return req(`/api/leads/${encodeURIComponent(id)}`);
}

export async function getLeadEvents(id, limit = 50) {
  return req(`/api/leads/${encodeURIComponent(id)}/events?limit=${encodeURIComponent(limit)}`);
}

export async function updateLead(id, body) {
  return req(`/api/leads/${encodeURIComponent(id)}`, {
    method: "POST",
    body: JSON.stringify(body || {}),
  });
}

export async function setLeadStage(id, stage, actor = "operator", reason = "") {
  return req(`/api/leads/${encodeURIComponent(id)}/stage`, {
    method: "POST",
    body: JSON.stringify({ stage, actor, reason }),
  });
}

export async function setLeadStatus(id, status, actor = "operator", reason = "") {
  return req(`/api/leads/${encodeURIComponent(id)}/status`, {
    method: "POST",
    body: JSON.stringify({ status, actor, reason }),
  });
}

export async function setLeadOwner(id, owner, actor = "operator") {
  return req(`/api/leads/${encodeURIComponent(id)}/owner`, {
    method: "POST",
    body: JSON.stringify({ owner, actor }),
  });
}

export async function setLeadFollowUp(id, { followUpAt = null, nextAction = "", actor = "operator" } = {}) {
  return req(`/api/leads/${encodeURIComponent(id)}/followup`, {
    method: "POST",
    body: JSON.stringify({
      followUpAt,
      nextAction,
      actor,
    }),
  });
}

export async function addLeadNote(id, note, actor = "operator") {
  return req(`/api/leads/${encodeURIComponent(id)}/note`, {
    method: "POST",
    body: JSON.stringify({ note, actor }),
  });
}

export async function createLead(body) {
  return req(`/api/leads`, {
    method: "POST",
    body: JSON.stringify(body || {}),
  });
}