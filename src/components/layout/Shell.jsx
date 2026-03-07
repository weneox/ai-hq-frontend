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
    <div className="min-h-screen overflow-x-clip bg-[#02050c] text-white selection:bg-cyan-300/20 selection:text-white">
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[linear-gradient(180deg,#02050c_0%,#040814_38%,#030611_72%,#02050c_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(88,101,242,0.16),transparent_24%),radial-gradient(800px_circle_at_100%_0%,rgba(34,211,238,0.08),transparent_18%),radial-gradient(1000px_circle_at_50%_100%,rgba(76,29,149,0.14),transparent_26%),radial-gradient(700px_circle_at_50%_18%,rgba(255,255,255,0.03),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 -z-20 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(600px_circle_at_50%_10%,rgba(255,255,255,0.05),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.045] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')]" />

      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="relative min-h-screen md:pl-[86px]">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <MobileNav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className="px-4 pb-4 pt-[116px] md:px-6 md:pb-6 md:pt-[128px]">
          <section className="relative min-h-[calc(100vh-160px)] overflow-hidden rounded-[34px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(8,13,26,0.94),rgba(4,8,18,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(34,211,238,0.07),transparent_22%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.10),transparent_24%),radial-gradient(700px_circle_at_50%_100%,rgba(91,33,182,0.10),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />

            <div className="pointer-events-none absolute left-[8%] top-0 h-32 w-32 rounded-full bg-cyan-300/[0.05] blur-3xl" />
            <div className="pointer-events-none absolute right-[10%] top-[8%] h-40 w-40 rounded-full bg-indigo-400/[0.06] blur-3xl" />

            <div className="relative h-full p-4 md:p-6 xl:p-7 2xl:p-8">
              <div className="relative h-full min-h-[calc(100vh-220px)] rounded-[28px] border border-white/[0.045] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:p-4 xl:p-5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="relative h-full rounded-[22px] bg-[linear-gradient(180deg,rgba(5,9,18,0.72),rgba(4,7,15,0.46))]">
                  <Outlet />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}