import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import MobileNav from "./MobileNav.jsx";

export default function Shell() {
  return (
    <div className="min-h-[100dvh] text-slate-900 dark:text-slate-100">
      {/* Backdrop */}
      <div className="min-h-[100dvh] bg-[radial-gradient(1200px_circle_at_18%_-10%,rgba(99,102,241,0.10),transparent_45%),radial-gradient(900px_circle_at_85%_10%,rgba(14,165,233,0.08),transparent_42%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(241,245,249,1))] dark:bg-[radial-gradient(1200px_circle_at_18%_-10%,rgba(99,102,241,0.14),transparent_46%),radial-gradient(900px_circle_at_85%_10%,rgba(14,165,233,0.10),transparent_44%),linear-gradient(to_bottom,#020617,#031112)]">
        <div className="mx-auto min-h-[100dvh] max-w-[1600px] px-4 lg:px-6">
          <div className="grid min-h-[100dvh] grid-cols-1 gap-4 py-5 lg:grid-cols-[300px_1fr] lg:gap-6">
            {/* Sidebar (desktop only) */}
            <aside className="hidden lg:block">
              <div className="sticky top-5">
                <Sidebar />
              </div>
            </aside>

            {/* Main column */}
            <section className="min-w-0 flex flex-col">
              {/* Sticky header */}
              <div className="sticky top-5 z-20">
                <Header />
              </div>

              {/* Page content (normal flow; no nested scroll traps) */}
              <main className="min-w-0 flex-1 pt-5">
                {/* IMPORTANT:
                    - Mobile/PWA üçün altda space saxla (bottom nav + safe-area)
                    - Desktopda normal */}
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

        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </div>
  );
}