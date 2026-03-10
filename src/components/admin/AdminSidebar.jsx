import { NavLink } from "react-router-dom";
import { ShieldCheck, Building2, Users, KeyRound, LogOut } from "lucide-react";
import { cx } from "../../lib/cx.js";
import { logoutAdminAuth } from "../../api/adminAuth.js";

function navItemClass(active) {
  return cx(
    "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition",
    active
      ? "border-cyan-400/30 bg-cyan-500/10 text-white"
      : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.05] hover:text-white"
  );
}

export default function AdminSidebar() {
  return (
    <aside className="hidden w-[290px] shrink-0 border-r border-white/10 bg-[#060a12] xl:flex xl:flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Private Zone
            </div>
            <div className="mt-1 text-base font-semibold text-white">
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Platform
        </div>

        <NavLink to="/admin/tenants">
          {({ isActive }) => (
            <div className={navItemClass(isActive)}>
              <Building2 className="h-4 w-4" />
              <span>Tenants</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/admin/team">
          {({ isActive }) => (
            <div className={navItemClass(isActive)}>
              <Users className="h-4 w-4" />
              <span>Team</span>
            </div>
          )}
        </NavLink>

        <NavLink to="/admin/secrets">
          {({ isActive }) => (
            <div className={navItemClass(isActive)}>
              <KeyRound className="h-4 w-4" />
              <span>Secrets</span>
            </div>
          )}
        </NavLink>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() =>
            logoutAdminAuth()
              .then(() => {
                window.location.href = "/admin/login";
              })
              .catch((e) => alert(String(e?.message || e)))
          }
          className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}