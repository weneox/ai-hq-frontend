import { Suspense, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Environment,
  MeshTransmissionMaterial,
  PerspectiveCamera,
} from "@react-three/drei";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  Check,
} from "lucide-react";
import * as THREE from "three";
import { loginUser } from "../api/auth.js";

function OrbCluster() {
  const group = useMemo(() => new THREE.Group(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.rotation.y = t * 0.08;
    group.rotation.x = Math.sin(t * 0.25) * 0.08;
  });

  return (
    <primitive object={group}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
        <mesh position={[-1.8, 0.5, -0.3]}>
          <icosahedronGeometry args={[1.25, 16]} />
          <MeshTransmissionMaterial
            thickness={0.8}
            roughness={0.05}
            transmission={1}
            ior={1.2}
            chromaticAberration={0.06}
            backside
          />
        </mesh>
      </Float>

      <Float speed={1.7} rotationIntensity={0.5} floatIntensity={0.85}>
        <mesh position={[1.9, -0.2, -0.6]}>
          <octahedronGeometry args={[1.05, 0]} />
          <meshStandardMaterial
            metalness={1}
            roughness={0.08}
            color="#dcefff"
            envMapIntensity={1.7}
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.45} floatIntensity={0.65}>
        <mesh position={[0.2, 1.45, -1.5]}>
          <torusKnotGeometry args={[0.78, 0.2, 220, 32]} />
          <meshStandardMaterial
            color="#f8fbff"
            metalness={0.95}
            roughness={0.1}
            envMapIntensity={1.5}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.65}>
        <mesh position={[0.1, -1.5, -1.2]}>
          <sphereGeometry args={[0.75, 64, 64]} />
          <MeshTransmissionMaterial
            thickness={0.9}
            roughness={0.03}
            transmission={1}
            ior={1.18}
            chromaticAberration={0.03}
            backside
          />
        </mesh>
      </Float>
    </primitive>
  );
}

function ParticlesField() {
  const points = useMemo(() => {
    const count = 800;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }

    return positions;
  }, []);

  const ref = useMemo(() => ({ current: null }), []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    ref.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.04;
  });

  return (
    <points ref={(el) => (ref.current = el)}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#b9d9ff" transparent opacity={0.6} />
    </points>
  );
}

function SceneGlow() {
  return (
    <>
      <mesh position={[-4.5, 2.4, -3]}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color="#b9e4ff" transparent opacity={0.22} />
      </mesh>

      <mesh position={[4.8, -1.8, -4]}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial color="#d7c6ff" transparent opacity={0.16} />
      </mesh>
    </>
  );
}

function LoginScene() {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 7]} fov={42} />
      <color attach="background" args={["#f4f8fd"]} />
      <fog attach="fog" args={["#f4f8fd", 8, 18]} />

      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 4, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-4, 2, 4]} intensity={2.2} color="#bfe3ff" />
      <pointLight position={[4, -2, 3]} intensity={1.8} color="#e5d9ff" />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <SceneGlow />
        <ParticlesField />
        <OrbCluster />
      </Suspense>
    </Canvas>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="login-stat-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getErrorMessage(error) {
  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Login failed.";

  if (typeof message !== "string") return "Login failed.";
  return message;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  const redirectTo = location.state?.from?.pathname || "/";

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");

    const email = String(form.email || "").trim();
    const password = String(form.password || "");

    if (!email || !password) {
      setError("Email və şifrəni daxil et.");
      return;
    }

    try {
      setLoading(true);

      await loginUser({
        email,
        password,
        remember: !!form.remember,
      });

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-3d">
        <LoginScene />
      </div>

      <div className="login-noise" />
      <div className="login-grid-lines" />

      <div className="login-shell">
        <motion.div
          className="login-left"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="login-badge">
            <ShieldCheck size={16} />
            <span>Secure access portal</span>
          </div>

          <h1 className="login-title">
            Control your
            <br />
            next-generation
            <br />
            workspace
          </h1>

          <p className="login-subtitle">
            Premium command access for teams, operations, analytics and AI-powered workflows.
          </p>

          <div className="login-stats">
            <StatPill label="Latency" value="24ms" />
            <StatPill label="Security" value="AES-256" />
            <StatPill label="Sessions" value="Protected" />
          </div>
        </motion.div>

        <motion.div
          className="login-right"
          initial={{ opacity: 0, y: 26, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.12 }}
        >
          <div className="login-card">
            <div className="login-card-top">
              <div className="login-logo-wrap">
                <div className="login-logo-core" />
              </div>

              <div>
                <p className="login-kicker">Welcome back</p>
                <h2 className="login-card-title">Sign in</h2>
              </div>
            </div>

            <form className="login-form" onSubmit={onSubmit}>
              <label className="login-field">
                <span className="login-field-label">Email address</span>
                <div
                  className={`login-input-wrap ${
                    focusedField === "email" ? "is-active" : ""
                  }`}
                >
                  <div className="login-input-icon">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={onChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="login-field">
                <span className="login-field-label">Password</span>
                <div
                  className={`login-input-wrap ${
                    focusedField === "password" ? "is-active" : ""
                  }`}
                >
                  <div className="login-input-icon">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField("")}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="login-row">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                  />
                  <span className="login-checkbox-ui">
                    <Check size={12} />
                  </span>
                  <span>Remember me</span>
                </label>

                <button type="button" className="login-link-btn">
                  Forgot password?
                </button>
              </div>

              {error ? <div className="login-error">{error}</div> : null}

              <button type="submit" className="login-submit" disabled={loading}>
                <span>{loading ? "Signing in..." : "Continue"}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            <div className="login-divider">
              <span>Protected enterprise access</span>
            </div>

            <div className="login-bottom-note">
              <div className="login-bottom-chip">Zero-trust session</div>
              <div className="login-bottom-chip">Encrypted</div>
              <div className="login-bottom-chip">Premium UI</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}