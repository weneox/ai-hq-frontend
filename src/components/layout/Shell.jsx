import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

const HEADER_H = 74;
const SIDEBAR_W = 76;

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
        "--sidebar-w": `${SIDEBAR_W}px`,
      }}
    >
      <div className="pointer-events-none fixed inset-0 -z-40 bg-[linear-gradient(180deg,#02050c_0%,#040814_38%,#030611_72%,#02050c_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(88,101,242,0.14),transparent_24%),radial-gradient(800px_circle_at_100%_0%,rgba(34,211,238,0.07),transparent_18%),radial-gradient(1000px_circle_at_50%_100%,rgba(76,29,149,0.12),transparent_26%),radial-gradient(700px_circle_at_50%_18%,rgba(255,255,255,0.025),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 -z-20 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(600px_circle_at_50%_10%,rgba(255,255,255,0.045),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')]" />

      <Header onMenuClick={() => setMobileOpen(true)} />

      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="relative min-h-screen md:pl-[var(--sidebar-w)]">
        <main className="px-3 pb-3 pt-[calc(var(--header-h)+8px)] md:px-4 md:pb-4 md:pt-[calc(var(--header-h)+10px)] xl:px-5">
          <section className="relative min-h-[calc(100vh-var(--header-h)-14px)] overflow-hidden rounded-[26px] border border-white/[0.065] bg-[linear-gradient(180deg,rgba(8,13,26,0.90),rgba(4,8,18,0.97))] shadow-[0_26px_100px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_0%_0%,rgba(34,211,238,0.06),transparent_22%),radial-gradient(900px_circle_at_100%_0%,rgba(99,102,241,0.08),transparent_24%),radial-gradient(700px_circle_at_50%_100%,rgba(91,33,182,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.007))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/16 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/[0.045] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/[0.04] to-transparent" />
            <div className="pointer-events-none absolute left-[8%] top-0 h-28 w-28 rounded-full bg-cyan-300/[0.045] blur-3xl" />
            <div className="pointer-events-none absolute right-[10%] top-[8%] h-36 w-36 rounded-full bg-indigo-400/[0.05] blur-3xl" />

            <div className="relative h-full p-2.5 md:p-4 xl:p-5 2xl:p-6">
              <div className="relative h-full min-h-[calc(100vh-var(--header-h)-62px)] rounded-[20px] border border-white/[0.04] bg-[linear-gradient(180deg,rgba(255,255,255,0.016),rgba(255,255,255,0.005))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] md:p-3 xl:p-3.5">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                <div className="relative h-full rounded-[18px] bg-[linear-gradient(180deg,rgba(5,9,18,0.58),rgba(4,7,15,0.30))]">
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