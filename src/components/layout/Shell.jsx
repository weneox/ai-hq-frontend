import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import MobileNav from "./MobileNav.jsx";
import { cx } from "../../lib/cx.js";

export default function Shell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // lock body scroll when drawer open
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-[100dvh] text-slate-900 dark:text-slate-100">
      {/* Backdrop */}
      <div className="min-h-[100dvh] bg-[radial-gradient(1200px_circle_at_18%_-10%,rgba(99,102,241,0.10),transparent_45%),radial-gradient(900px_circle_at_85%_10%,rgba(14,165,233,0.08),transparent_42%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(241,245,249,1))] dark:bg-[radial-gradient(1200px_circle_at_18%_-10%,rgba(99,102,241,0.14),transparent_46%),radial-gradient(900px_circle_at_85%_10%,rgba(14,165,233,0.10),transparent_44%),linear-gradient(to_bottom,#020617,#031112)]">
        <div className="mx-auto min-h-[100dvh] max-w-[1600px] px-4 lg:px-6">
          <div className="grid min-h-[100dvh] grid-cols-1 gap-4 py-5 lg:grid-cols-[340px_1fr] lg:gap-6">
            {/* Sidebar (desktop only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-5">
                <Sidebar variant="desktop" />
              </div>
            </aside>

            {/* Main column */}
            <section className="min-w-0 flex flex-col">
              {/* Sticky header */}
              <div className="sticky top-5 z-20">
                <Header
                  onOpenSidebar={() => setMobileSidebarOpen(true)}
                />
              </div>

              {/* Page content */}
              <main className="min-w-0 flex-1 pt-5">
                <div className="min-w-0 pb-[96px] lg:pb-10">
                  <Outlet />
                </div>

                <footer className="pb-[96px] lg:pb-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  AI HQ · CEO Command Center · Sprint 1
                </footer>
              </main>
            </section>
          </div>
        </div>

        {/* Mobile drawer sidebar */}
        <div
          className={cx(
            "lg:hidden fixed inset-0 z-[60]",
            mobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
          aria-hidden={!mobileSidebarOpen}
        >
          {/* Backdrop */}
          <div
            className={cx(
              "absolute inset-0 bg-slate-950/30 backdrop-blur-sm transition-opacity",
              mobileSidebarOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Panel */}
          <div
            className={cx(
              "absolute left-0 top-0 h-full w-[86%] max-w-[360px] p-4",
              "transition-transform duration-300 ease-out",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
            )}
          >
            <Sidebar variant="mobile" onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <MobileNav onOpenSidebar={() => setMobileSidebarOpen(true)} />
      </div>
    </div>
  );
}