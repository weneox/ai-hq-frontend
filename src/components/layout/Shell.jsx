import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const HEADER_H = 82;

export default function Shell() {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen overflow-x-clip bg-[#02050c] text-white selection:bg-cyan-300/20 selection:text-white"
      style={{
        "--header-h": `${HEADER_H}px`,
      }}
    >
      <div className="pointer-events-none fixed inset-0 -z-50 bg-[linear-gradient(180deg,#02050c_0%,#040814_38%,#030611_72%,#02050c_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(88,101,242,0.12),transparent_24%),radial-gradient(760px_circle_at_100%_0%,rgba(34,211,238,0.055),transparent_18%),radial-gradient(1100px_circle_at_50%_100%,rgba(76,29,149,0.10),transparent_26%),radial-gradient(700px_circle_at_50%_18%,rgba(255,255,255,0.018),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(700px_circle_at_50%_8%,rgba(255,255,255,0.03),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')]" />

      <Header
        onMenuClick={() => setMobileOpen(true)}
        expanded={expanded}
      />

      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main className="relative pt-[var(--header-h)]">
        <section className="relative min-h-[calc(100vh-var(--header-h))] overflow-hidden bg-[linear-gradient(180deg,rgba(8,13,26,0.18),rgba(4,8,18,0.14))]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(34,211,238,0.03),transparent_22%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.045),transparent_24%),radial-gradient(700px_circle_at_50%_100%,rgba(91,33,182,0.05),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.010),rgba(255,255,255,0.003))]" />

          <div className="relative p-3 md:p-4 xl:p-5">
            <div className="relative min-h-[calc(100vh-var(--header-h)-24px)] overflow-hidden rounded-[30px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(8,13,26,0.82),rgba(4,8,18,0.93))] shadow-[0_30px_120px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.035)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(34,211,238,0.045),transparent_22%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.065),transparent_24%),radial-gradient(700px_circle_at_50%_100%,rgba(91,33,182,0.065),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.006))]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              <div className="pointer-events-none absolute left-[8%] top-0 h-28 w-28 rounded-full bg-cyan-300/[0.035] blur-3xl" />
              <div className="pointer-events-none absolute right-[10%] top-[8%] h-36 w-36 rounded-full bg-indigo-400/[0.04] blur-3xl" />
              <div className="pointer-events-none absolute bottom-[8%] left-[34%] h-32 w-32 rounded-full bg-violet-400/[0.028] blur-3xl" />

              <div className="relative h-full p-2.5 md:p-3.5 xl:p-4">
                <div className="relative min-h-[calc(100vh-var(--header-h)-52px)] rounded-[22px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.012),rgba(255,255,255,0.004))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.022)]">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/7 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(500px_circle_at_50%_0%,rgba(255,255,255,0.015),transparent_34%)]" />

                  <div className="relative min-h-[calc(100vh-var(--header-h)-78px)] overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,rgba(5,9,18,0.44),rgba(4,7,15,0.22))]">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.010),transparent_14%,transparent_86%,rgba(255,255,255,0.006))]" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

                    <div className="relative h-full">
                      <Outlet />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}