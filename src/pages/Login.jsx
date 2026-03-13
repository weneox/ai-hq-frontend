import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  Mail,
  KeyRound,
  LockKeyhole,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { loginUser } from "../api/auth.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    tenantKey: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.tenantKey.trim()) {
      setError("Company code is required");
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
      setError(String(err?.message || err || "Unable to continue"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authx-page">
      <AuthBackdrop />

      <div className="authx-shell">
        <div className="authx-grid">
          <HeroSide />

          <motion.section
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="authx-core-wrap"
          >
            <div className="authx-orbit authx-orbit-a" />
            <div className="authx-orbit authx-orbit-b" />
            <div className="authx-orbit authx-orbit-c" />
            <div className="authx-beam authx-beam-a" />
            <div className="authx-beam authx-beam-b" />
            <div className="authx-float-tag authx-float-tag-a">Scoped tenant</div>
            <div className="authx-float-tag authx-float-tag-b">Encrypted route</div>
            <div className="authx-float-tag authx-float-tag-c">Zero-trust entry</div>

            <div className="authx-frame">
              <div className="authx-frame-grid" />
              <div className="authx-corner authx-corner-tl" />
              <div className="authx-corner authx-corner-tr" />
              <div className="authx-corner authx-corner-bl" />
              <div className="authx-corner authx-corner-br" />

              <div className="authx-panel-top">
                <div>
                  <p className="authx-kicker">Authentication core</p>
                  <h2 className="authx-panel-title">Workspace handshake</h2>
                </div>

                <div className="authx-shield">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <p className="authx-panel-copy">
                Tenant-bound access sequence for your private operational environment.
              </p>

              <form onSubmit={onSubmit} className="authx-form">
                <DockField
                  index="01"
                  label="Company code"
                  name="tenantKey"
                  value={form.tenantKey}
                  onChange={onChange}
                  placeholder="e.g. neox"
                  autoComplete="organization"
                  icon={Building2}
                />

                <DockField
                  index="02"
                  label="Email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="name@company.com"
                  autoComplete="username"
                  icon={Mail}
                />

                <DockField
                  index="03"
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  icon={KeyRound}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="authx-icon-btn"
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

                {error ? <div className="authx-error">{error}</div> : null}

                <button type="submit" disabled={loading} className="authx-submit">
                  <span className="authx-submit-glow" />
                  <span className="authx-submit-content">
                    {loading ? "Establishing secure session..." : "Enter workspace"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </button>

                <div className="authx-meta-row">
                  <div className="authx-meta-pill">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Session is encrypted
                  </div>

                  <div className="authx-meta-dot" />

                  <div className="authx-meta-text">Node / access-gateway</div>
                </div>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function HeroSide() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="authx-hero"
    >
      <div className="authx-badge">
        <span className="authx-badge-dot" />
        <span className="authx-badge-text">AI HQ // ACCESS GRID</span>
      </div>

      <div className="authx-hero-copy">
        <p className="authx-overline">Command-grade authentication</p>

        <h1 className="authx-title">
          Enter the
          <br />
          command mesh
        </h1>

        <p className="authx-copy">
          A darker, sharper, neon-blue entry experience designed like a secure access node
          instead of a generic login card.
        </p>
      </div>

      <div className="authx-stats">
        <div className="authx-stat">
          <span className="authx-stat-label">Protocol</span>
          <strong>Tenant scoped</strong>
        </div>

        <div className="authx-stat">
          <span className="authx-stat-label">Layer</span>
          <strong>Zero-trust gate</strong>
        </div>

        <div className="authx-stat">
          <span className="authx-stat-label">Route</span>
          <strong>Encrypted session</strong>
        </div>
      </div>

      <div className="authx-help-line">
        <span className="authx-help-track" />
        <p>Need access? Contact your workspace admin for your tenant code.</p>
      </div>

      {!reduceMotion ? (
        <>
          <div className="authx-hero-glow authx-hero-glow-a" />
          <div className="authx-hero-glow authx-hero-glow-b" />
        </>
      ) : null}
    </motion.section>
  );
}

function DockField({
  index,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  icon: Icon,
  trailing = null,
}) {
  return (
    <div className="authx-field">
      <div className="authx-field-meta">
        <span className="authx-field-index">{index}</span>
        <label className="authx-field-label">{label}</label>
      </div>

      <div className="authx-field-shell">
        <div className="authx-field-icon">
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <input
          className="authx-input"
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        {trailing ? <div className="authx-field-trailing">{trailing}</div> : null}
      </div>
    </div>
  );
}

function AuthBackdrop() {
  const reduceMotion = useReducedMotion();

  const floatA = reduceMotion
    ? {}
    : {
        animate: {
          x: [0, 30, -14, 0],
          y: [0, -22, 8, 0],
          scale: [1, 1.04, 1],
          opacity: [0.48, 0.72, 0.48],
        },
        transition: {
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const floatB = reduceMotion
    ? {}
    : {
        animate: {
          x: [0, -18, 12, 0],
          y: [0, 20, -10, 0],
          scale: [1, 1.06, 1],
          opacity: [0.38, 0.58, 0.38],
        },
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const rotate = reduceMotion
    ? {}
    : {
        animate: { rotate: [0, 360] },
        transition: {
          duration: 42,
          repeat: Infinity,
          ease: "linear",
        },
      };

  return (
    <div className="authx-backdrop">
      <div className="authx-grid-bg" />
      <div className="authx-scanlines" />
      <div className="authx-vignette" />

      <motion.div className="authx-ambient authx-ambient-a" {...floatA} />
      <motion.div className="authx-ambient authx-ambient-b" {...floatB} />
      <motion.div className="authx-ambient authx-ambient-c" {...floatA} />

      <motion.div className="authx-ring-field authx-ring-field-a" {...rotate} />
      <motion.div className="authx-ring-field authx-ring-field-b" {...rotate} />
      <div className="authx-vertical-line authx-vertical-line-a" />
      <div className="authx-vertical-line authx-vertical-line-b" />
      <div className="authx-horizon-line authx-horizon-line-a" />
      <div className="authx-horizon-line authx-horizon-line-b" />
    </div>
  );
}