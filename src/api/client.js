// src/api/client.js
// FINAL v1.1 — resilient API client for same-origin or explicit API base

const RAW = (import.meta.env.VITE_API_BASE || "").trim();
const API_BASE = RAW ? RAW.replace(/\/+$/, "") : "";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function isAbsoluteUrl(value = "") {
  return /^https?:\/\//i.test(s(value));
}

export function getApiBase() {
  return API_BASE;
}

export function apiUrl(path) {
  const cleanPath = s(path);
  if (!cleanPath) return API_BASE || "";

  if (isAbsoluteUrl(cleanPath)) {
    return cleanPath;
  }

  if (!API_BASE) {
    return cleanPath;
  }

  return `${API_BASE}${cleanPath}`;
}

async function readPayload(response) {
  const text = await response.text().catch(() => "");
  const contentType = s(response.headers.get("content-type")).toLowerCase();

  if (!text) {
    return {};
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return {
        ok: false,
        reason: "Invalid JSON response from API",
        raw: text,
      };
    }
  }

  const trimmed = text.trim();
  const looksLikeHtml =
    /^<!doctype html/i.test(trimmed) ||
    /^<html/i.test(trimmed) ||
    trimmed.includes("<head") ||
    trimmed.includes("<body");

  if (looksLikeHtml) {
    return {
      ok: false,
      reason:
        "API returned HTML instead of JSON. Check VITE_API_BASE or your /api proxy/backend routing.",
      raw: trimmed.slice(0, 600),
    };
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: false,
      raw: text,
    };
  }
}

function pickErr(payload, fallback) {
  const reason = s(payload?.reason);
  const message = s(payload?.message || payload?.details?.message);
  const errorCode = s(payload?.error);
  const raw = s(payload?.raw);

  if (reason && errorCode && reason.toLowerCase() !== errorCode.toLowerCase()) {
    return `${reason} (${errorCode})`;
  }

  if (reason) return reason;
  if (message) return message;
  if (errorCode) return errorCode;
  if (raw) return raw;

  return fallback;
}

async function request(path, { method = "GET", body } = {}) {
  const url = apiUrl(path);

  const headers = {
    Accept: "application/json",
  };

  const init = {
    method,
    credentials: "include",
    headers,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    init.body = JSON.stringify(body ?? {});
  }

  let response;
  try {
    response = await fetch(url, init);
  } catch (e) {
    throw new Error(`Network error (${method} ${path}): ${String(e?.message || e)}`);
  }

  const payload = await readPayload(response);

  if (!response.ok || payload?.ok === false) {
    throw new Error(
      pickErr(payload, `${method} ${path} failed (${response.status})`)
    );
  }

  return payload;
}

export async function apiGet(path) {
  return request(path, { method: "GET" });
}

export async function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

export async function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

export async function apiPatch(path, body) {
  return request(path, { method: "PATCH", body });
}

export async function apiDelete(path) {
  return request(path, { method: "DELETE" });
}