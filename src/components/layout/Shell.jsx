import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const SIDEBAR_RAIL_W = 76;

export default function Shell() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-[#02050c] text-white selection:bg-cyan-300/20 selection:text-white"
      style={{
        "--sidebar-rail-w": `${SIDEBAR_RAIL_W}px`,
      }}
    >
      <div className="pointer-events-none fixed inset-0 -z-[80] bg-[linear-gradient(180deg,#02050c_0%,#040814_34%,#030611_72%,#02050c_100%)]" />

      <div className="pointer-events-none fixed inset-0 -z-[70] bg-[radial-gradient(1200px_circle_at_0%_0%,rgba(44,212,255,0.12),transparent_24%),radial-gradient(960px_circle_at_100%_0%,rgba(99,102,241,0.12),transparent_24%),radial-gradient(1200px_circle_at_50%_100%,rgba(109,40,217,0.10),transparent_28%),radial-gradient(540px_circle_at_52%_18%,rgba(255,255,255,0.025),transparent_30%)]" />

      <div className="pointer-events-none fixed inset-0 -z-[60] opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />

      <div className="pointer-events-none fixed inset-0 -z-[50] opacity-[0.03] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')]" />

      <div className="pointer-events-none fixed left-0 top-0 z-0 h-[220px] w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.008)_40%,transparent)]" />

      <div className="pointer-events-none fixed left-0 top-0 z-0 h-full w-[170px] bg-[linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008)_24%,transparent_74%)]" />

      <div className="pointer-events-none fixed left-[var(--sidebar-rail-w)] top-0 z-0 h-[300px] w-[460px] bg-[radial-gradient(circle_at_0%_0%,rgba(64,220,255,0.10),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none fixed right-0 top-0 z-0 h-[360px] w-[620px] bg-[radial-gradient(circle_at_100%_0%,rgba(129,92,255,0.14),transparent_68%)] blur-3xl" />

      <Header onMenuClick={() => setMobileOpen(true)} />

      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="relative z-10 lg:pl-[var(--sidebar-rail-w)]">
        <div className="relative min-h-screen">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(34,211,238,0.035),transparent_22%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.05),transparent_24%),radial-gradient(900px_circle_at_50%_100%,rgba(91,33,182,0.045),transparent_30%)]" />
          <Outlet />
        </div>
      </main>
    </div>
  );
}