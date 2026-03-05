// src/components/BackgroundFX.jsx
import { useMemo } from "react";

export default function BackgroundFX() {
  const dots = useMemo(() => {
    // cheap decorative dots positions
    const arr = [];
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 80,
        s: 6 + Math.random() * 18,
        o: 0.06 + Math.random() * 0.08,
      });
    }
    return arr;
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-[#f6f7fb]" />

      {/* aurora */}
      <div className="absolute -top-40 left-1/2 h-[620px] w-[1050px] -translate-x-1/2 rounded-full bg-gradient-to-r from-fuchsia-200/45 via-indigo-200/35 to-cyan-200/35 blur-3xl" />
      <div className="absolute top-[340px] left-[-120px] h-[520px] w-[520px] rounded-full bg-amber-200/25 blur-3xl" />
      <div className="absolute top-[420px] right-[-140px] h-[560px] w-[760px] rounded-full bg-emerald-200/20 blur-3xl" />

      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.25) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* dots */}
      {dots.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full bg-slate-900"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.s}px`,
            height: `${d.s}px`,
            opacity: d.o,
          }}
        />
      ))}

      {/* grain */}
      <div
        className="absolute inset-0 opacity-[0.10] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}