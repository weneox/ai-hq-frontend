import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from "lucide-react";
import { getAuthMe, loginUser } from "../api/auth.js";
import LoginBackgroundScene from "../components/auth/LoginBackgroundScene.jsx";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "hq",
  "mail",
  "docs",
  "status",
  "admin",
  "app",
  "cdn",
  "assets",
  "blog",
  "help",
  "support",
  "auth",
  "m",
  "dev",
  "staging",
  "demo",
]);

function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function getTenantKeyFromHost() {
  if (typeof window === "undefined") return "";

  const host = s(window.location.hostname).toLowerCase();
  if (!host) return "";

  if (host === "localhost" || host === "127.0.0.1") {
    const url = new URL(window.location.href);
    const qp =
      url.searchParams.get("tenant") ||
      url.searchParams.get("tenantKey") ||
      url.searchParams.get("workspace") ||
      "";
    return s(qp).toLowerCase();
  }

  if (host === "weneox.com" || host === "hq.weneox.com") {
    return "";
  }

  if (host.endsWith(".weneox.com")) {
    const sub = host.slice(0, -".weneox.com".length).trim().toLowerCase();
    if (!sub || RESERVED_SUBDOMAINS.has(sub)) return "";
    return sub;
  }

  return "";
}

function formatWorkspaceName(key) {
  const clean = s(key);
  if (!clean) return "";

  return clean
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeTenantKey(value) {
  return s(value)
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function isServiceUnavailableError(error) {
  const message = s(error?.message).toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("load failed") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("auth check failed") ||
    message.includes("vte_api_base is not set".toLowerCase())
  );
}

function getFriendlyError(error, fallback = "We could not sign you in.") {
  if (isServiceUnavailableError(error)) {
    return "Authentication is temporarily unavailable. You can keep this page open and try again in a moment.";
  }

  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback;

  return s(message, fallback);
}

function Surface({ children, className = "" }) {
  return (
    <div
      className={`rounded-[28px] border border-white/70 bg-white/80 shadow-[0_30px_80px_-40px_rgba(15,23,42,.35)] backdrop-blur-[18px] ${className}`}
    >
      {children}
    </div>
  );
}

function StatusPanel({
  tone = "info",
  icon: Icon,
  title,
  body,
}) {
  const toneClass =
    tone === "error"
      ? "border-rose-200 bg-rose-50/90 text-rose-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50/90 text-amber-900"
        : tone === "success"
          ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
          : "border-slate-200 bg-slate-50/90 text-slate-900";

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-6 opacity-80">{body}</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  right = null,
  children,
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>
        {right}
      </div>
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,.7)] transition focus-within:border-slate-300 focus-within:ring-4 focus-within:ring-slate-200/50">
        <span className="shrink-0 text-slate-400">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {children}
      </div>
    </label>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const detectedTenantKey = useMemo(() => getTenantKeyFromHost(), []);
  const redirectTo = location.state?.from?.pathname || "/";

  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceNotice, setServiceNotice] = useState({
    visible: false,
    tone: "warning",
    title: "",
    body: "",
  });

  const [form, setForm] = useState({
    tenantKey: detectedTenantKey || "",
    email: "",
    password: "",
    remember: true,
  });

  const activeTenantKey = useMemo(
    () => normalizeTenantKey(form.tenantKey),
    [form.tenantKey]
  );

  const workspaceName = useMemo(
    () => formatWorkspaceName(activeTenantKey),
    [activeTenantKey]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const auth = await getAuthMe();
        if (!alive) return;

        if (auth?.authenticated) {
          navigate(redirectTo, { replace: true });
          return;
        }

        setServiceNotice({
          visible: false,
          tone: "warning",
          title: "",
          body: "",
        });
      } catch (error) {
        if (!alive) return;

        setServiceNotice({
          visible: true,
          tone: "warning",
          title: "Auth service unavailable",
          body: getFriendlyError(
            error,
            "We could not verify your current session right now."
          ),
        });
      } finally {
        if (alive) setChecking(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate, redirectTo]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "tenantKey"
            ? normalizeTenantKey(value)
            : value,
    }));

    if (error) setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;

    const tenantKey = normalizeTenantKey(form.tenantKey);
    const email = s(form.email);
    const password = String(form.password || "");

    if (!tenantKey) {
      setError("Enter your workspace key.");
      return;
    }

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setServiceNotice((prev) => ({ ...prev, visible: false }));

      await loginUser({
        email,
        password,
        tenantKey,
      });

      window.location.replace(redirectTo);
    } catch (err) {
      const unavailable = isServiceUnavailableError(err);

      if (unavailable) {
        setServiceNotice({
          visible: true,
          tone: "warning",
          title: "Authentication is temporarily unavailable",
          body: getFriendlyError(err),
        });
        setError("");
      } else {
        setError(getFriendlyError(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3efe8] text-slate-950">
      <LoginBackgroundScene />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,.16),rgba(243,239,232,.54))]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1280px] items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.04fr)_440px]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="max-w-[640px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-[0_12px_30px_-20px_rgba(15,23,42,.25)]">
                <Sparkles className="h-3.5 w-3.5" />
                Premium workspace access
              </div>

              <h1 className="mt-6 max-w-[560px] font-['Sora',ui-sans-serif,system-ui] text-[48px] font-semibold leading-[0.96] tracking-[-0.06em] text-slate-950">
                A stable login screen, even when auth is having a bad day.
              </h1>

              <p className="mt-5 max-w-[560px] text-[17px] leading-8 text-slate-600">
                Sign in to your AIHQ workspace with a cleaner, more resilient auth
                experience. If the backend is temporarily unavailable, the page
                stays polished and explains the issue clearly.
              </p>

              <div className="mt-10 grid max-w-[560px] gap-4 sm:grid-cols-2">
                <Surface className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        Protected workspace access
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">
                        Session-aware routing keeps healthy logins fast.
                      </div>
                    </div>
                  </div>
                </Surface>

                <Surface className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d97706] text-white">
                      <WifiOff className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        Graceful degraded state
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-600">
                        Backend failures become clear inline guidance, not raw fetch errors.
                      </div>
                    </div>
                  </div>
                </Surface>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Surface className="overflow-hidden p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,.6)]">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      AIHQ
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-slate-700">
                      Secure workspace login
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Protected
                </div>
              </div>

              <div className="mt-8">
                <h2 className="font-['Sora',ui-sans-serif,system-ui] text-[32px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950">
                  Welcome back
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">
                  {activeTenantKey
                    ? `Continue into ${workspaceName || activeTenantKey}.`
                    : "Sign in to your AIHQ workspace."}
                </p>

                {activeTenantKey ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-700">
                    <Building2 className="h-4 w-4" />
                    {activeTenantKey}
                  </div>
                ) : null}
              </div>

              {serviceNotice.visible ? (
                <div className="mt-6">
                  <StatusPanel
                    tone={serviceNotice.tone}
                    icon={WifiOff}
                    title={serviceNotice.title}
                    body={serviceNotice.body}
                  />
                </div>
              ) : null}

              {checking ? (
                <div className="mt-6">
                  <StatusPanel
                    tone="info"
                    icon={Loader2}
                    title="Checking your session"
                    body="We’re verifying whether you already have an active login."
                  />
                </div>
              ) : null}

              <form className="mt-6 space-y-5" onSubmit={onSubmit}>
                <Field label="Workspace" icon={Building2}>
                  <input
                    type="text"
                    name="tenantKey"
                    placeholder="company-name"
                    value={form.tenantKey}
                    onChange={onChange}
                    autoComplete="organization"
                    spellCheck={false}
                    className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                  />
                </Field>

                <Field label="Email" icon={Mail}>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                  />
                </Field>

                <Field
                  label="Password"
                  icon={Lock}
                  right={
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      Forgot password?
                    </button>
                  }
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                    className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    className="shrink-0 text-slate-400 transition hover:text-slate-800"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                </Field>

                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-300"
                  />
                  <span>Remember me on this device</span>
                </label>

                {error ? (
                  <StatusPanel
                    tone="error"
                    icon={AlertCircle}
                    title="Sign-in failed"
                    body={error}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={loading || checking}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-[15px] font-medium text-white shadow-[0_22px_36px_-20px_rgba(15,23,42,.75)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-3 text-[12px] text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="uppercase tracking-[0.18em]">Workspace status</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">Clean form states</span>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    Loading, inline validation, and auth availability are handled inside the card.
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-slate-700" />
                    <span className="text-sm font-medium">Flow preserved</span>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    Once the backend is healthy again, the existing session check and login redirect continue to work.
                  </div>
                </div>
              </div>
            </Surface>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
