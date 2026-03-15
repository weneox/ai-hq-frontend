import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  Check,
  Chrome,
  KeyRound,
  Building2,
} from "lucide-react";
import { getAuthMe, loginUser } from "../api/auth.js";

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

function getErrorMessage(error) {
  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Login failed.";

  return typeof message === "string" ? message : "Login failed.";
}

function getTenantKeyFromHost() {
  if (typeof window === "undefined") return "";

  const host = String(window.location.hostname || "").trim().toLowerCase();
  if (!host) return "";

  if (host === "localhost" || host === "127.0.0.1") {
    const url = new URL(window.location.href);
    const qp =
      url.searchParams.get("tenant") ||
      url.searchParams.get("tenantKey") ||
      url.searchParams.get("workspace") ||
      "";
    return String(qp).trim().toLowerCase();
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
  const clean = String(key || "").trim();
  if (!clean) return "";
  return clean
    .split("-")
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}

function normalizeTenantKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function AccessOption({ icon: Icon, children }) {
  return (
    <button type="button" className="login-sculpt__access-btn">
      <span className="login-sculpt__access-btn-icon">
        <Icon size={16} />
      </span>
      <span>{children}</span>
    </button>
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
        const j = await getAuthMe();
        if (!alive) return;

        if (j?.authenticated) {
          navigate(redirectTo, { replace: true });
          return;
        }
      } catch {}

      if (!alive) return;
      setChecking(false);
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
    const email = String(form.email || "").trim();
    const password = String(form.password || "");

    if (!tenantKey) {
      setError("Tenant key daxil et.");
      return;
    }

    if (!email || !password) {
      setError("Email və şifrəni daxil et.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await loginUser({
        email,
        password,
        tenantKey,
      });

      window.location.replace(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="login-sculpt">
      <div className="login-sculpt__bg" aria-hidden="true">
        <div className="login-sculpt__glow login-sculpt__glow--left" />
        <div className="login-sculpt__glow login-sculpt__glow--top" />
        <div className="login-sculpt__glow login-sculpt__glow--right" />

        <div className="login-sculpt__art">
          <span className="login-sculpt__plane login-sculpt__plane--ice" />
          <span className="login-sculpt__plane login-sculpt__plane--mint" />
          <span className="login-sculpt__plane login-sculpt__plane--violet" />
          <span className="login-sculpt__plane login-sculpt__plane--line" />
          <span className="login-sculpt__flare" />
        </div>
      </div>

      <main className="login-sculpt__stage">
        <motion.section
          className="login-sculpt__card"
          initial={{ opacity: 0, y: 20, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="login-sculpt__top">
            <div className="login-sculpt__brand">
              <span className="login-sculpt__brand-mark" />
              <span className="login-sculpt__brand-text">AIHQ</span>
            </div>

            <div className="login-sculpt__trust">
              <ShieldCheck size={13} />
              <span>Protected access</span>
            </div>
          </div>

          <div className="login-sculpt__hero">
            <h1 className="login-sculpt__title">Welcome back</h1>
            <p className="login-sculpt__subtitle">
              {activeTenantKey
                ? `Secure access to ${workspaceName || activeTenantKey} workspace.`
                : "Secure access to your AIHQ workspace."}
            </p>

            {activeTenantKey ? (
              <div className="login-sculpt__workspace">
                <Building2 size={13} />
                <span>{activeTenantKey}</span>
              </div>
            ) : null}
          </div>

          <form className="login-sculpt__form" onSubmit={onSubmit}>
            <label className="login-sculpt__field">
              <span className="login-sculpt__label">Tenant</span>
              <div className="login-sculpt__input-wrap">
                <span className="login-sculpt__input-icon">
                  <Building2 size={17} />
                </span>
                <input
                  type="text"
                  name="tenantKey"
                  placeholder="company-name"
                  value={form.tenantKey}
                  onChange={onChange}
                  autoComplete="organization"
                  spellCheck={false}
                />
              </div>
            </label>

            <label className="login-sculpt__field">
              <span className="login-sculpt__label">Email</span>
              <div className="login-sculpt__input-wrap">
                <span className="login-sculpt__input-icon">
                  <Mail size={17} />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                />
              </div>
            </label>

            <div className="login-sculpt__label-row">
              <span className="login-sculpt__label">Password</span>
              <button
                type="button"
                className="login-sculpt__text-btn"
                aria-label="Forgot password"
              >
                Forgot password?
              </button>
            </div>

            <label className="login-sculpt__field">
              <div className="login-sculpt__input-wrap">
                <span className="login-sculpt__input-icon">
                  <Lock size={17} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-sculpt__toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            <div className="login-sculpt__row">
              <label className="login-sculpt__checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={onChange}
                />
                <span className="login-sculpt__checkbox-ui">
                  <Check size={11} />
                </span>
                <span>Remember me</span>
              </label>
            </div>

            {error ? <div className="login-sculpt__error">{error}</div> : null}

            <button
              type="submit"
              className="login-sculpt__submit"
              disabled={loading}
            >
              <span>{loading ? "Signing in..." : "Continue"}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="login-sculpt__divider">
            <span>Other methods</span>
          </div>

          <div className="login-sculpt__access">
            <AccessOption icon={Chrome}>Google</AccessOption>
            <AccessOption icon={KeyRound}>Passkey</AccessOption>
            <AccessOption icon={Building2}>SSO</AccessOption>
          </div>
        </motion.section>
      </main>
    </div>
  );
}