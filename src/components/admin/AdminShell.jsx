import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";

export default function AdminShell() {
  return (
    <div className="min-h-screen bg-[#02050c] text-white">
      <div className="pointer-events-none fixed inset-0 -z-[100] bg-[linear-gradient(180deg,#02050c_0%,#040814_34%,#030611_72%,#02050c_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-[90] bg-[radial-gradient(1100px_circle_at_0%_0%,rgba(44,212,255,0.10),transparent_24%),radial-gradient(920px_circle_at_100%_0%,rgba(99,102,241,0.10),transparent_24%),radial-gradient(1100px_circle_at_50%_100%,rgba(109,40,217,0.08),transparent_28%)]" />

      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="min-w-0 flex-1 px-4 py-4 md:px-6 md:py-6">
          <div className="space-y-5">
            <AdminTopbar />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}