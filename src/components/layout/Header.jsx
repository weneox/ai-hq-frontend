import { Bell, Menu, Search } from "lucide-react";

export default function Header({ onMenuClick }) {
  return (
    <div className="sticky top-0 z-40 px-4 pt-4 md:px-6 md:pt-5">
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0a0f1d]/78 shadow-[0_16px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))]" />

        <div className="relative flex h-[68px] items-center gap-3 px-3 md:px-4">
          <button
            onClick={onMenuClick}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/76 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/56 md:flex">
            <Search className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex h-11 items-center rounded-[16px] border border-white/10 bg-white/[0.03] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 focus-within:border-cyan-300/35 focus-within:bg-white/[0.05]">
              <Search className="mr-3 h-4 w-4 shrink-0 text-white/24 md:hidden" />
              <input
                placeholder="Search flows, agents, signals, incidents..."
                className="w-full bg-transparent text-[14px] text-white/84 outline-none placeholder:text-white/24"
              />
            </div>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            <div className="rounded-[16px] border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] uppercase tracking-[0.30em] text-white/38">
              Live system
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/[0.035] px-4 py-2 text-[11px] uppercase tracking-[0.30em] text-white/38">
              Executive shell
            </div>
          </div>

          <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04] text-white/76 transition hover:bg-white/[0.06]">
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}