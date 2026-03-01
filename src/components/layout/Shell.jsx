import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function Shell() {
  return (
    <div className="h-dvh overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Backdrop */}
      <div className="h-full bg-[radial-gradient(1200px_circle_at_18%_-10%,rgba(99,102,241,0.10),transparent_45%),radial-gradient(900px_circle_at_85%_10%,rgba(14,165,233,0.08),transparent_42%),linear-gradient(to_bottom,rgba(248,250,252,1),rgba(241,245,249,1))] dark:bg-[radial-gradient(1200px_circle_at_18%_-10%,rgba(99,102,241,0.14),transparent_46%),radial-gradient(900px_circle_at_85%_10%,rgba(14,165,233,0.10),transparent_44%),linear-gradient(to_bottom,#020617,#031112)]">
        <div className="mx-auto h-full max-w-[1600px] px-4 lg:px-6">
          {/* IMPORTANT: min-h-0 so children can scroll */}
          <div className="grid h-full min-h-0 grid-cols-1 gap-4 py-5 lg:grid-cols-[300px_1fr] lg:gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block min-h-0">
              <div className="sticky top-5">
                <Sidebar />
              </div>
            </aside>

            {/* Main column */}
            <section className="min-w-0 min-h-0 flex flex-col">
              {/* Sticky header (always visible) */}
              <div className="sticky top-5 z-20">
                <Header />
              </div>

              {/* Single scroll area */}
              <main className="min-w-0 min-h-0 flex-1 overflow-y-auto pt-5">
                <div className="min-w-0 pb-10">
                  <Outlet />
                </div>

                <footer className="pb-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  AI HQ · CEO Command Center · Sprint 1
                </footer>
              </main>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}