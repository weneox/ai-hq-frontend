export function DetailSection({ title, children, right }) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/44">
          {title}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function MetaRow({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/36">{k}</span>
      <span className="max-w-[60%] truncate text-right text-white/78" title={String(v || "")}>
        {v || "—"}
      </span>
    </div>
  );
}