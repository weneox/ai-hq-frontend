import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Mail,
  LockKeyhole,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { loginUser } from "../api/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    tenantKey: "",
    email: "",
    password: "",
    remember: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const from = location.state?.from?.pathname || "/";

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.tenantKey.trim()) {
      setError("Workspace code is required");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!form.password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        tenantKey: form.tenantKey.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setError(String(err?.message || err || "Unable to sign in"));
    } finally {
      setLoading(false);
    }
  }

  const fieldState = useMemo(
    () => ({
      tenantKey: getFieldVisualState("tenantKey", focusedField, form.tenantKey),
      email: getFieldVisualState("email", focusedField, form.email),
      password: getFieldVisualState("password", focusedField, form.password),
    }),
    [focusedField, form]
  );

  return (
    <div className="hqlogin-page">
      <div className="hqlogin-bg" aria-hidden="true">
        <div className="hqlogin-grid" />
        <div className="hqlogin-glow glow-a" />
        <div className="hqlogin-glow glow-b" />
        <div className="hqlogin-glow glow-c" />
        <div className="hqlogin-lightband band-a" />
        <div className="hqlogin-lightband band-b" />
      </div>

      <div className="hqlogin-layout">
        <motion.section
          className="hqlogin-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hqlogin-topline">
            <div className="hqlogin-brand">
              <AIHQMark />
              <div className="hqlogin-brand-copy">
                <div className="hqlogin-brand-title">AI HQ</div>
                <div className="hqlogin-brand-sub">
                  orchestration for modern companies
                </div>
              </div>
            </div>

            <div className="hqlogin-mini-pill">
              <Sparkles className="h-[14px] w-[14px]" />
              Enterprise intelligence
            </div>
          </div>

          <div className="hqlogin-copy-wrap">
            <p className="hqlogin-kicker">Control your system</p>

            <h1 className="hqlogin-title">
              One place
              <br />
              for decisions,
              <br />
              automations
              <br />
              and execution.
            </h1>

            <p className="hqlogin-desc">
              AI HQ brings your operations, approvals, workflows and intelligence
              layer into one premium control surface.
            </p>
          </div>

          <div className="hqlogin-stat-row">
            <InfoTile label="Realtime" value="Live ops" />
            <InfoTile label="Approval flow" value="Protected" />
            <InfoTile label="Automation" value="24/7" />
          </div>
        </motion.section>

        <motion.section
          className="hqlogin-stage"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.58, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hqlogin-stage-frame" />
          <div className="hqlogin-stage-panel panel-a" />
          <div className="hqlogin-stage-panel panel-b" />
          <div className="hqlogin-stage-panel panel-c" />

          <div className="hqlogin-stage-lines">
            <span />
            <span />
            <span />
          </div>

          <div className="hqlogin-floating-note note-a">
            <span className="dot" />
            Smart governance
          </div>

          <div className="hqlogin-floating-note note-b">
            <span className="dot" />
            Connected workflows
          </div>

          <motion.div
            className="hqlogin-auth"
            initial={{ opacity: 0, x: 26, y: 18 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.52, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hqlogin-auth-head">
              <div>
                <div className="hqlogin-auth-eyebrow">Secure access</div>
                <h2 className="hqlogin-auth-title">Sign in</h2>
              </div>

              <div className="hqlogin-auth-badge">
                <ShieldCheck className="h-[14px] w-[14px]" />
                Verified
              </div>
            </div>

            <form className="hqlogin-form" onSubmit={onSubmit} noValidate>
              <Field
                label="Workspace"
                name="tenantKey"
                value={form.tenantKey}
                onChange={onChange}
                onFocus={() => setFocusedField("tenantKey")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "tenantKey" ? "" : prev))
                }
                placeholder="company / tenant code"
                autoComplete="organization"
                icon={Building2}
                state={fieldState.tenantKey}
              />

              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                onFocus={() => setFocusedField("email")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "email" ? "" : prev))
                }
                placeholder="Email address"
                autoComplete="username"
                icon={Mail}
                state={fieldState.email}
              />

              <Field
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() =>
                  setFocusedField((prev) => (prev === "password" ? "" : prev))
                }
                placeholder="Password"
                autoComplete="current-password"
                icon={LockKeyhole}
                state={fieldState.password}
                trailing={
                  <button
                    type="button"
                    className="hqlogin-icon-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>
                }
              />

              <div className="hqlogin-row">
                <label className="hqlogin-check">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                  />
                  <span className="hqlogin-check-ui">
                    <Check className="h-[12px] w-[12px]" />
                  </span>
                  <span>Remember me</span>
                </label>

                <a href="/forgot-password" className="hqlogin-link">
                  Forgot password?
                </a>
              </div>

              {error ? <div className="hqlogin-error">{error}</div> : null}

              <button type="submit" disabled={loading} className="hqlogin-submit">
                <span className="hqlogin-submit-text">
                  {loading ? "Signing in..." : "Enter workspace"}
                </span>
                <ArrowRight className="h-[18px] w-[18px]" />
              </button>

              <div className="hqlogin-meta">
                <span className="hqlogin-meta-item">
                  <ShieldCheck className="h-[14px] w-[14px]" />
                  Encrypted session
                </span>
                <span className="hqlogin-meta-sep" />
                <span className="hqlogin-meta-item">
                  Role-based access
                  <ArrowUpRight className="h-[13px] w-[13px]" />
                </span>
              </div>
            </form>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  autoComplete,
  icon: Icon,
  trailing = null,
  state = "idle",
}) {
  const inputId = `hqlogin-${name}`;

  return (
    <label htmlFor={inputId} className="hqlogin-field">
      <span className="hqlogin-field-label">{label}</span>

      <span className={`hqlogin-field-box is-${state}`}>
        <span className={`hqlogin-field-icon is-${state}`} aria-hidden="true">
          <Icon className="h-[18px] w-[18px]" />
        </span>

        <input
          id={inputId}
          className="hqlogin-input"
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        {trailing ? (
          <span className="hqlogin-field-trailing">{trailing}</span>
        ) : null}
      </span>
    </label>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="hqlogin-info-tile">
      <div className="hqlogin-info-label">{label}</div>
      <div className="hqlogin-info-value">{value}</div>
    </div>
  );
}

function AIHQMark() {
  return (
    <div className="hqlogin-mark" aria-hidden="true">
      <svg viewBox="0 0 92 72" className="hqlogin-mark-svg">
        <defs>
          <linearGradient id="hqlogin-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d6df6" />
            <stop offset="52%" stopColor="#35b8ff" />
            <stop offset="100%" stopColor="#84e9ff" />
          </linearGradient>
        </defs>

        <path
          d="M10 58 L30 14 H48 L31 44 H57 L44 22 H61 L82 58 H10 Z"
          fill="url(#hqlogin-logo-grad)"
        />
        <path d="M35 18 L53 18 L45 32 L27 32 Z" fill="#dbeafe" />
      </svg>
    </div>
  );
}

function getFieldVisualState(name, focusedField, value) {
  const filled = String(value || "").trim().length > 0;
  if (focusedField === name) return "active";
  if (filled) return "complete";
  return "idle";
}