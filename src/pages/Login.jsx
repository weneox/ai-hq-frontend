import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
    <div className="login-page">
      <BackgroundScene />

      <div className="login-shell">
        <div className="login-grid">
          <HeroPanel />

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="pointer-events-none absolute -left-[16%] top-[14%] hidden h-px w-[48%] rotate-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.88),transparent)] lg:block" />
            <div className="pointer-events-none absolute -left-[8%] bottom-[18%] hidden h-px w-[34%] rotate-[-28deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)] lg:block" />
            <div className="pointer-events-none absolute right-[-8%] top-[8%] hidden h-[74vh] w-[28vw] rounded-full bg-[radial-gradient(circle,rgba(255,233,203,0.32),rgba(255,214,167,0.12),transparent_70%)] blur-[36px] lg:block" />
            <div className="pointer-events-none absolute right-[6%] top-[14%] hidden h-[64vh] w-[19vw] rotate-[17deg] rounded-[999px] border border-white/16 [mask-image:linear-gradient(180deg,transparent,black_14%,black_86%,transparent)] lg:block" />

            <div className="relative w-full max-w-[560px]">
              <div className="login-card p-6 sm:p-8 md:p-9">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)]" />
                <div className="pointer-events-none absolute right-[-18%] top-[-12%] h-[58%] w-[68%] rotate-[18deg] bg-[linear-gradient(180deg,rgba(255,233,205,0.42),rgba(255,192,136,0.16),transparent)] blur-3xl" />
                <div className="pointer-events-none absolute left-[-12%] bottom-[-12%] h-[34%] w-[42%] rounded-full bg-cyan-100/14 blur-3xl" />
                <div className="pointer-events-none absolute right-[12%] top-[8%] h-[84%] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.5),transparent)]" />
                <div className="pointer-events-none absolute left-[8%] top-[42%] h-px w-[38%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]" />

                <div className="relative z-10">
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                        Secure Portal
                      </p>
                      <h2 className="mt-2 text-[34px] font-semibold tracking-[-0.06em] text-[#06122e] sm:text-[38px]">
                        Workspace access
                      </h2>
                    </div>

                    <div className="grid h-12 w-12 place-items-center rounded-[18px] border border-white/60 bg-white/46 text-slate-700 shadow-[0_12px_26px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mb-8 max-w-[34ch] text-[14px] leading-6 text-slate-500">
                    Continue into your company environment through a private, scoped authentication layer.
                  </p>

                  <form onSubmit={onSubmit} className="space-y-5">
                    <Field
                      label="Company code"
                      name="tenantKey"
                      value={form.tenantKey}
                      onChange={onChange}
                      placeholder="e.g. neox"
                      autoComplete="organization"
                    />

                    <Field
                      label="Email address"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      placeholder="name@company.com"
                      autoComplete="username"
                    />

                    <Field
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-slate-900/5 hover:text-slate-600"
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

                    {error ? (
                      <div className="rounded-[22px] border border-rose-200/90 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 shadow-[0_12px_26px_rgba(244,63,94,0.08)] backdrop-blur-xl">
                        {error}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={loading}
                      className="login-button mt-2 inline-flex h-[60px] items-center justify-center gap-2 px-6 text-[16px] font-semibold"
                    >
                      <span className="relative z-10 inline-flex items-center gap-2">
                        {loading ? "Entering workspace..." : "Enter workspace"}
                        <ArrowRight className="h-4 w-4 opacity-85" />
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function HeroPanel() {
  const reduceMotion = useReducedMotion();

  const ribbonA = reduceMotion
    ? {}
    : {
        animate: {
          x: [0, 14, -10, 0],
          y: [0, -8, 5, 0],
          rotate: [-16, -14.4, -16],
          opacity: [0.72, 0.94, 0.72],
        },
        transition: {
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const ribbonB = reduceMotion
    ? {}
    : {
        animate: {
          x: [0, -12, 7, 0],
          y: [0, 8, -4, 0],
          rotate: [-27, -24.8, -27],
          opacity: [0.42, 0.66, 0.42],
        },
        transition: {
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const glow = reduceMotion
    ? {}
    : {
        animate: {
          x: [0, 10, -6, 0],
          y: [0, -6, 5, 0],
          opacity: [0.26, 0.44, 0.26],
          scale: [1, 1.06, 1],
        },
        transition: {
          duration: 19,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[560px] items-center"
    >
      <div className="relative w-full max-w-[780px] py-8 lg:py-0">
        <div className="relative z-10 max-w-[720px]">
          <div className="login-badge">
            <span className="login-badge-dot" />
            <span className="login-badge-text">AI HQ Workspace</span>
          </div>

          <div className="mt-10 sm:mt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
              Command-grade entry
            </p>

            <h1 className="login-title mt-5 text-balance">Sign in</h1>

            <p className="login-copy mt-7 text-pretty">
              Secure access to your operational workspace
            </p>

            <div className="mt-14 flex items-center gap-5 sm:mt-16">
              <div className="h-px w-16 bg-[linear-gradient(90deg,rgba(148,163,184,0),rgba(148,163,184,0.65),rgba(148,163,184,0))]" />
              <p className="login-help">Need help? Contact your workspace admin.</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-20">
          <motion.div
            className="absolute left-[-2%] top-[18%] hidden h-[120px] w-[88%] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.92),rgba(229,238,241,0.48),rgba(255,255,255,0))] blur-[1px] sm:block"
            initial={{ rotate: -16, opacity: 0.72 }}
            {...ribbonA}
          />

          <motion.div
            className="absolute left-[2%] top-[44%] hidden h-[160px] w-[72%] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(226,236,240,0.46),rgba(255,255,255,0))] blur-[4px] sm:block"
            initial={{ rotate: -27, opacity: 0.42 }}
            {...ribbonB}
          />

          <motion.div
            className="absolute left-[11%] top-[30%] hidden h-[30vh] w-[16vw] rounded-full bg-cyan-100/14 blur-[58px] lg:block"
            initial={{ opacity: 0.26 }}
            {...glow}
          />

          <div className="absolute left-[13%] top-[35%] hidden h-px w-[50%] rotate-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)] lg:block" />
          <div className="absolute left-[25%] top-[53%] hidden h-px w-[34%] rotate-[-28deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.74),transparent)] lg:block" />
          <div className="absolute left-[10%] top-[72%] hidden h-8 w-[40vw] rounded-full bg-white/22 blur-[18px] lg:block" />
        </div>
      </div>
    </motion.section>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  trailing = null,
}) {
  return (
    <div>
      <label className="mb-3 block text-[14px] font-semibold tracking-[-0.02em] text-slate-800">
        {label}
      </label>

      <div className="login-input-wrap">
        <div className="login-input-core" />
        <div className="login-input-outline" />

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="login-input"
        />

        {trailing ? (
          <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
    </div>
  );
}

function BackgroundScene() {
  const reduceMotion = useReducedMotion();

  const flow = (
    duration,
    {
      x = 0,
      y = 0,
      rotateA = 0,
      rotateB = 0,
      opacityA = 1,
      opacityB = 1,
      scaleA = 1,
      scaleB = 1.03,
      delay = 0,
    } = {}
  ) =>
    reduceMotion
      ? {}
      : {
          animate: {
            x: [0, x, -x * 0.72, 0],
            y: [0, -y, y * 0.66, 0],
            rotate: [rotateA, rotateB, rotateA],
            opacity: [opacityA, opacityB, opacityA],
            scale: [scaleA, scaleB, scaleA],
          },
          transition: {
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),transparent)]" />
      <div className="absolute inset-y-0 left-[8%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(148,163,184,0.08),transparent)] xl:block" />
      <div className="absolute inset-y-0 right-[8.5%] hidden w-px bg-[linear-gradient(180deg,transparent,rgba(148,163,184,0.08),transparent)] xl:block" />

      <motion.div
        className="absolute left-[-12%] top-[18%] h-[22vh] w-[82vw] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.74),rgba(255,255,255,0))] blur-[1px]"
        initial={{ rotate: -18, opacity: 0.72 }}
        {...flow(24, {
          x: 18,
          y: 7,
          rotateA: -18,
          rotateB: -15.8,
          opacityA: 0.7,
          opacityB: 0.94,
          scaleA: 1,
          scaleB: 1.04,
        })}
      />

      <motion.div
        className="absolute left-[2%] top-[41%] h-[26vh] w-[64vw] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(224,236,240,0.5),rgba(255,255,255,0))] blur-[4px]"
        initial={{ rotate: -28, opacity: 0.46 }}
        {...flow(20, {
          x: -12,
          y: 9,
          rotateA: -28,
          rotateB: -25.4,
          opacityA: 0.44,
          opacityB: 0.72,
          scaleA: 1,
          scaleB: 1.035,
          delay: 0.14,
        })}
      />

      <motion.div
        className="absolute left-[12%] top-[64%] h-[14vh] w-[42vw] rounded-[999px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.46),rgba(255,255,255,0))]"
        initial={{ rotate: -30, opacity: 0.32 }}
        {...flow(18, {
          x: 8,
          y: 4,
          rotateA: -30,
          rotateB: -28.7,
          opacityA: 0.3,
          opacityB: 0.52,
          scaleA: 1,
          scaleB: 1.03,
          delay: 0.28,
        })}
      />

      <div className="absolute left-[16%] top-[26%] h-[46vh] w-[44vw] rotate-[-22deg] rounded-[56px] bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(232,238,240,0.06),rgba(255,255,255,0))] blur-[52px]" />

      <motion.div
        className="absolute right-[-19%] top-[-13%] h-[154vh] w-[37vw] rounded-[999px] bg-[linear-gradient(180deg,rgba(255,235,206,0.98)_0%,rgba(245,199,139,0.94)_24%,rgba(231,162,112,0.8)_48%,rgba(244,212,214,0.2)_73%,rgba(255,255,255,0)_100%)]"
        initial={{ rotate: 22.5, opacity: 0.88 }}
        {...flow(26, {
          x: -16,
          y: 12,
          rotateA: 22.5,
          rotateB: 20.8,
          opacityA: 0.86,
          opacityB: 0.98,
          scaleA: 1,
          scaleB: 1.05,
        })}
      />

      <motion.div
        className="absolute right-[0.5%] top-[-11%] h-[136vh] w-[15vw] rounded-[999px] bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(255,232,182,0.94)_28%,rgba(255,183,117,0.36)_66%,rgba(255,255,255,0)_100%)]"
        initial={{ rotate: 22.5, opacity: 0.96 }}
        {...flow(20, {
          x: 8,
          y: 6,
          rotateA: 22.5,
          rotateB: 21.8,
          opacityA: 0.93,
          opacityB: 1,
          scaleA: 1,
          scaleB: 1.03,
          delay: 0.15,
        })}
      />

      <motion.div
        className="absolute right-[8.2%] top-[-6%] h-[128vh] w-[5.3vw] rounded-[999px] bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(255,241,214,0.98)_34%,rgba(255,203,141,0.34)_70%,rgba(255,255,255,0)_100%)]"
        initial={{ rotate: 22.5, opacity: 0.98 }}
        {...flow(16, {
          x: -5,
          y: 4,
          rotateA: 22.5,
          rotateB: 22.08,
          opacityA: 0.96,
          opacityB: 1,
          scaleA: 1,
          scaleB: 1.02,
          delay: 0.28,
        })}
      />

      <motion.div
        className="absolute right-[12.7%] top-[3%] h-[104vh] w-[2px] rounded-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.98),transparent)]"
        initial={{ rotate: 22.5, opacity: 0.72 }}
        {...flow(14, {
          x: 2,
          y: 3,
          rotateA: 22.5,
          rotateB: 22.16,
          opacityA: 0.7,
          opacityB: 0.95,
          scaleA: 1,
          scaleB: 1.01,
        })}
      />

      <motion.div
        className="absolute right-[11%] top-[16%] h-[48vh] w-[22vw] rounded-full bg-[radial-gradient(circle,rgba(255,240,217,0.68),rgba(255,215,168,0.2),transparent_70%)] blur-[42px]"
        initial={{ opacity: 0.38 }}
        {...flow(18, {
          x: -8,
          y: 7,
          rotateA: 0,
          rotateB: 2,
          opacityA: 0.34,
          opacityB: 0.6,
          scaleA: 1,
          scaleB: 1.06,
        })}
      />

      <div className="absolute right-[-4%] top-[10%] h-[90vh] w-[33vw] rotate-[17deg] rounded-[999px] border border-white/22 [mask-image:linear-gradient(180deg,transparent,black_14%,black_84%,transparent)]" />
      <div className="absolute right-[2.5%] top-[18%] h-[72vh] w-[24vw] rotate-[17deg] rounded-[999px] border border-white/16 [mask-image:linear-gradient(180deg,transparent,black_12%,black_88%,transparent)]" />
      <div className="absolute right-[7.8%] top-[28%] h-[52vh] w-[15vw] rotate-[17deg] rounded-[999px] border border-white/12 [mask-image:linear-gradient(180deg,transparent,black_12%,black_90%,transparent)]" />

      <div className="absolute bottom-[7%] left-[13%] h-7 w-[40vw] rounded-full bg-white/34 blur-[14px]" />
      <div className="absolute bottom-[10%] left-[14%] h-px w-[38vw] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.82),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_58%,rgba(15,23,42,0.03)_100%)]" />
    </div>
  );
}