export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function statusMeta(status) {
  const s = String(status || "").toLowerCase();

  if (s === "running") {
    return {
      label: "Running",
      dot: "bg-cyan-300",
      badge:
        "border-cyan-400/20 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(56,189,248,0.16)]",
      cardGlow:
        "before:absolute before:inset-0 before:rounded-[30px] before:bg-[radial-gradient(420px_circle_at_0%_0%,rgba(56,189,248,0.16),transparent_36%),radial-gradient(340px_circle_at_100%_0%,rgba(34,211,238,0.10),transparent_42%)] before:pointer-events-none",
      border: "border-cyan-400/16",
      ring: "from-cyan-300/30 via-sky-300/10 to-transparent",
      softText: "text-cyan-100/78",
    };
  }

  if (s === "queued") {
    return {
      label: "Queued",
      dot: "bg-violet-300",
      badge:
        "border-violet-400/20 bg-violet-400/10 text-violet-100 shadow-[0_0_24px_rgba(167,139,250,0.12)]",
      cardGlow:
        "before:absolute before:inset-0 before:rounded-[30px] before:bg-[radial-gradient(360px_circle_at_0%_0%,rgba(139,92,246,0.14),transparent_34%),radial-gradient(260px_circle_at_100%_0%,rgba(168,85,247,0.08),transparent_40%)] before:pointer-events-none",
      border: "border-violet-400/14",
      ring: "from-violet-300/25 via-fuchsia-300/8 to-transparent",
      softText: "text-violet-100/78",
    };
  }

  if (s === "completed") {
    return {
      label: "Completed",
      dot: "bg-emerald-300",
      badge:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.12)]",
      cardGlow:
        "before:absolute before:inset-0 before:rounded-[30px] before:bg-[radial-gradient(340px_circle_at_0%_0%,rgba(16,185,129,0.12),transparent_34%),radial-gradient(260px_circle_at_100%_0%,rgba(45,212,191,0.08),transparent_42%)] before:pointer-events-none",
      border: "border-emerald-400/14",
      ring: "from-emerald-300/22 via-teal-300/6 to-transparent",
      softText: "text-emerald-100/78",
    };
  }

  if (s === "failed") {
    return {
      label: "Failed",
      dot: "bg-rose-300",
      badge:
        "border-rose-400/20 bg-rose-400/10 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.12)]",
      cardGlow:
        "before:absolute before:inset-0 before:rounded-[30px] before:bg-[radial-gradient(360px_circle_at_0%_0%,rgba(244,63,94,0.14),transparent_34%),radial-gradient(240px_circle_at_100%_0%,rgba(251,113,133,0.08),transparent_40%)] before:pointer-events-none",
      border: "border-rose-400/16",
      ring: "from-rose-300/28 via-pink-300/8 to-transparent",
      softText: "text-rose-100/78",
    };
  }

  return {
    label: "Unknown",
    dot: "bg-white/40",
    badge: "border-white/10 bg-white/5 text-white/80",
    cardGlow:
      "before:absolute before:inset-0 before:rounded-[30px] before:bg-[radial-gradient(360px_circle_at_0%_0%,rgba(255,255,255,0.08),transparent_34%)] before:pointer-events-none",
    border: "border-white/10",
    ring: "from-white/14 via-white/4 to-transparent",
    softText: "text-white/72",
  };
}

export function shortId(id) {
  const x = String(id || "");
  if (x.length <= 12) return x;
  return `${x.slice(0, 8)}…${x.slice(-4)}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function formatRelative(value) {
  if (!value) return "—";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return String(value);

  const diff = Math.round((Date.now() - time) / 1000);
  const abs = Math.abs(diff);

  if (abs < 60) return `${abs}s ${diff >= 0 ? "ago" : "from now"}`;
  if (abs < 3600) return `${Math.floor(abs / 60)}m ${diff >= 0 ? "ago" : "from now"}`;
  if (abs < 86400) return `${Math.floor(abs / 3600)}h ${diff >= 0 ? "ago" : "from now"}`;
  return `${Math.floor(abs / 86400)}d ${diff >= 0 ? "ago" : "from now"}`;
}

export function durationBetween(start, end) {
  if (!start) return "—";
  const a = new Date(start).getTime();
  const b = end ? new Date(end).getTime() : Date.now();
  if (Number.isNaN(a) || Number.isNaN(b)) return "—";

  const sec = Math.max(0, Math.floor((b - a) / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function pretty(value) {
  try {
    if (value == null) return "";
    if (typeof value === "string") {
      const t = value.trim();
      if (
        (t.startsWith("{") && t.endsWith("}")) ||
        (t.startsWith("[") && t.endsWith("]"))
      ) {
        return JSON.stringify(JSON.parse(t), null, 2);
      }
      return value;
    }
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value ?? "");
  }
}

export function displayValue(value, fallback = "—") {
  if (value == null || value === "") return fallback;

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (!value.length) return fallback;
    try {
      const raw = JSON.stringify(value);
      return raw.length <= 120 ? raw : `${value.length} items`;
    } catch {
      return `${value.length} items`;
    }
  }

  if (typeof value === "object") {
    if (typeof value.label === "string") return value.label;
    if (typeof value.name === "string") return value.name;
    if (typeof value.title === "string") return value.title;
    if (typeof value.id === "string" && Object.keys(value).length === 1) return value.id;

    const keys = Object.keys(value);
    if (!keys.length) return fallback;

    try {
      const raw = JSON.stringify(value);
      return raw.length <= 140 ? raw : `Object · ${keys.length} keys`;
    } catch {
      return `Object · ${keys.length} keys`;
    }
  }

  return String(value);
}

export function extractSummary(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];

  return Object.entries(value)
    .slice(0, 6)
    .map(([key, val]) => ({
      key,
      value: displayValue(val),
    }));
}