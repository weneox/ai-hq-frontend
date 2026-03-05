// src/components/layout/Shell.jsx (NO HEADER — single surface layout)

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import MobileNav from "./MobileNav.jsx";

export default function Shell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 dark:bg-[#070A10] dark:text-slate-100">
      {/* Background wash */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.14),transparent_45%),radial-gradient(900px_circle_at_85%_10%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(1000px_circle_at_50%_110%,rgba(168,85,247,0.10),transparent_55%)]" />

      {/* Mobile nav toggle layer */}
      <MobileNav open={mobileSidebarOpen} setOpen={setMobileSidebarOpen} />

      <div className="mx-auto flex min-h-[100dvh] max-w-[1600px]">
        {/* Sidebar */}
        <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* ✅ NO Header here */}
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}