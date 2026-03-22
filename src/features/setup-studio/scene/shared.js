import { arr, obj, s } from "../lib/setupStudioHelpers.js";

export const STEP_LABELS = {
  entry: "Source",
  identity: "Identity",
  knowledge: "Knowledge",
  service: "Service",
  ready: "Launch",
};

export const overlayTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

export const LANGUAGE_LABELS = {
  az: "Azərbaycan dili",
  en: "English",
  tr: "Türkçe",
  ru: "Русский",
};

export function n(value, fallback = 0) {
  const x = Number(value);
  return Number.isFinite(x) ? x : fallback;
}

export function lower(value) {
  return s(value).toLowerCase();
}

export function uniqText(values = [], maxItems = 24) {
  const out = [];
  const seen = new Set();

  for (const raw of arr(values)) {
    const value = s(raw);
    if (!value) continue;

    const key = lower(value);
    if (!key || seen.has(key)) continue;

    seen.add(key);
    out.push(value);

    if (out.length >= maxItems) break;
  }

  return out;
}

export function firstNonEmpty(...values) {
  for (const value of values) {
    const x = s(value);
    if (x) return x;
  }
  return "";
}

export function firstArrayWithItems(...values) {
  for (const value of values) {
    const list = arr(value).filter(Boolean);
    if (list.length) return list;
  }
  return [];
}

export function findProfileRowValue(rows = [], wantedKeys = []) {
  const normalizedWanted = arr(wantedKeys).map((x) => s(x).toLowerCase());

  const match = arr(rows).find((item) => {
    if (!Array.isArray(item)) return false;
    return normalizedWanted.includes(s(item[0]).toLowerCase());
  });

  return s(match?.[1]);
}

export function inferSourceLabel(type = "", url = "") {
  const normalizedType = s(type).toLowerCase();
  const normalizedUrl = s(url).toLowerCase();

  if (normalizedType === "google_maps") return "Google Maps";
  if (normalizedType === "website") return "Website";

  if (
    normalizedUrl.includes("maps.app.goo.gl") ||
    normalizedUrl.includes("google.com/maps") ||
    normalizedUrl.includes("g.co/kgs")
  ) {
    return "Google Maps";
  }

  if (normalizedUrl) {
    return "Website";
  }

  return "";
}

export function formatFieldLabel(key = "") {
  const map = {
    companyName: "Name",
    websiteUrl: "Website",
    summaryShort: "Short summary",
    summaryLong: "Description",
    primaryEmail: "Email",
    primaryPhone: "Phone",
    primaryAddress: "Address",
    services: "Services",
    pricingHints: "Pricing",
    socialLinks: "Social",
    faqItems: "FAQ",
  };

  return map[key] || s(key);
}

export function countDistinctSources(reviewSources = [], primarySourceUrl = "") {
  const keys = new Set();

  if (s(primarySourceUrl)) {
    keys.add(lower(primarySourceUrl));
  }

  for (const item of arr(reviewSources)) {
    const key =
      lower(item?.url) ||
      lower(item?.sourceUrl) ||
      lower(item?.source_url) ||
      lower(item?.id);
    if (!key) continue;
    keys.add(key);
  }

  return keys.size;
}

export { arr, obj, s };