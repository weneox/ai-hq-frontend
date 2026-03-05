import { useEffect, useRef } from "react";
import * as THREE from "three";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function makeSpherePoints(count = 9000, radius = 1) {
  // Uniform-ish distribution on sphere
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  const c1 = new THREE.Color("#3b82f6"); // blue
  const c2 = new THREE.Color("#a855f7"); // purple
  const c3 = new THREE.Color("#fb7185"); // pink

  for (let i = 0; i < count; i++) {
    // Fibonacci sphere
    const t = i / (count - 1);
    const y = 1 - 2 * t;
    const r = Math.sqrt(1 - y * y);
    const phi = i * (Math.PI * (3 - Math.sqrt(5)));
    const x = Math.cos(phi) * r;
    const z = Math.sin(phi) * r;

    const ix = i * 3;
    pos[ix + 0] = x * radius;
    pos[ix + 1] = y * radius;
    pos[ix + 2] = z * radius;

    // Color gradient by latitude/longitude
    // mix: blue->purple->pink
    const lat = (y + 1) / 2; // 0..1
    const mix1 = clamp(lat * 1.2, 0, 1);
    const mix2 = clamp((lat - 0.35) * 1.4, 0, 1);

    const tmp = c1.clone().lerp(c2, mix1).lerp(c3, mix2);
    col[ix + 0] = tmp.r;
    col[ix + 1] = tmp.g;
    col[ix + 2] = tmp.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

export default function GlobeCard() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
    camera.position.set(0, 0, 3.2);

    // Points globe
    const geo = makeSpherePoints(10000, 1.05);

    const mat = new THREE.PointsMaterial({
      size: 0.012,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Subtle “orbit line”
    const ringGeo = new THREE.RingGeometry(1.35, 1.355, 256);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#a855f7"),
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    ring.rotation.z = -0.3;
    scene.add(ring);

    // Soft inner glow (fake)
    const glowGeo = new THREE.SphereGeometry(0.92, 48, 48);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#60a5fa"),
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    let raf = 0;
    let t0 = performance.now();

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(r.width));
      const h = Math.max(1, Math.floor(r.height));

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - t0) / 1000;
      t0 = now;

      // Gentle rotation
      points.rotation.y += dt * 0.18;
      points.rotation.x = Math.sin(now * 0.00025) * 0.06;

      ring.rotation.y += dt * 0.08;

      renderer.render(scene, camera);
    };

    // prefers-reduced-motion
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!reduce) animate();
    else renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-3xl border border-black/10 bg-white shadow-[0_24px_80px_-48px_rgba(2,6,23,0.35)] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[12px] font-semibold tracking-wide text-slate-500">
                ANALYTICS
              </div>
              <h3 className="mt-2 text-[22px] leading-tight font-semibold text-slate-900">
                Borderless money movement with stablecoins & crypto
              </h3>
            </div>

            <button className="shrink-0 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-slate-700 shadow-sm hover:bg-white">
              ⤢
            </button>
          </div>
        </div>

        {/* Globe area */}
        <div className="relative h-[320px]">
          {/* WebGL */}
          <div ref={wrapRef} className="absolute inset-0">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>

          {/* Premium overlays */}
          <div className="pointer-events-none absolute inset-0">
            {/* soft gradient wash */}
            <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.35)_42%,rgba(255,255,255,0)_70%)]" />
            {/* bottom tint */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(15,23,42,0.08),rgba(15,23,42,0))]" />
            {/* subtle noise (optional) */}
            <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply [background-image:url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />
          </div>

          {/* Tooltip chip example */}
          <div className="absolute left-5 top-[52%] rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-[12px] font-medium text-slate-700 shadow-sm backdrop-blur">
            85 USDC
          </div>
        </div>

        {/* Footer / stats */}
        <div className="px-6 py-5 border-t border-black/5 bg-white">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-500">Volume</div>
              <div className="mt-1 text-[16px] font-semibold text-slate-900">$1.28M</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-500">Routes</div>
              <div className="mt-1 text-[16px] font-semibold text-slate-900">42</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-500">Success</div>
              <div className="mt-1 text-[16px] font-semibold text-slate-900">99.2%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}