import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import MobileNav from "./MobileNav.jsx";

export default function Shell() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-clip bg-[#02050d] text-white selection:bg-cyan-300/20 selection:text-white">
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(99,102,241,0.18),transparent_22%),radial-gradient(900px_circle_at_100%_0%,rgba(34,211,238,0.08),transparent_18%),radial-gradient(1200px_circle_at_50%_100%,rgba(76,29,149,0.18),transparent_28%),linear-gradient(180deg,#02050d_0%,#040816_38%,#02050d_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px] opacity-[0.24]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(600px_circle_at_50%_16%,rgba(255,255,255,0.035),transparent_32%)]" />

      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="relative min-h-screen md:pl-[72px]">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <MobileNav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="px-4 pb-4 pt-4 md:px-6 md:pb-6 md:pt-5">
          <section className="relative min-h-[calc(100vh-108px)] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(7,12,24,0.96),rgba(4,8,18,0.98))] shadow-[0_30px_100px_rgba(0,0,0,0.34)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_0%_0%,rgba(34,211,238,0.06),transparent_24%),radial-gradient(1000px_circle_at_100%_0%,rgba(99,102,241,0.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
            <div className="relative h-full p-4 md:p-6 xl:p-7">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}