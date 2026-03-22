import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  Sparkles,
} from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function s(v, d = "") {
  return String(v ?? d).trim();
}

function normalizeRows(rows = []) {
  return arr(rows)
    .map((item) => {
      if (Array.isArray(item)) {
        return {
          label: s(item[0]),
          value: s(item[1]),
        };
      }

      if (item && typeof item === "object") {
        return {
          label: s(item.label || item.key || item.title),
          value: s(item.value || item.text || item.description),
        };
      }

      return {
        label: "",
        value: "",
      };
    })
    .filter((item) => item.label || item.value);
}

function truncate(value = "", max = 180) {
  const x = s(value);
  if (!x) return "";
  if (x.length <= max) return x;
  return `${x.slice(0, max - 1)}…`;
}

function humanizeWarning(value = "") {
  const x = s(value).toLowerCase();

  if (x === "http_403") return "This website blocked direct access.";
  if (x === "http_429") return "This website rate-limited the request.";
  if (x === "fetch_failed") return "The website could not be read.";
  if (x === "non_html_response") return "The source did not return a readable webpage.";
  if (x === "website_fetch_timeout") return "The website took too long to respond.";
  if (x === "website_entry_timeout") return "The first page took too long to load.";
  if (x === "sitemap_fetch_timeout") return "The sitemap timed out, but some draft data may still exist.";

  return s(value).replaceAll("_", " ");
}

function isBarrierWarning(value = "") {
  const x = s(value).toLowerCase();
  return [
    "http_403",
    "http_429",
    "fetch_failed",
    "non_html_response",
    "website_fetch_timeout",
    "website_entry_timeout",
  ].includes(x);
}

function FieldCard({ label, value }) {
  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white/88 px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,.03)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="mt-1.5 text-sm leading-6 text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

export default function SetupStudioIdentityStage({
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  discoveryWarnings = [],
  sourceLabel = "",
  onNext,
  onToggleRefine,
}) {
  const rows = normalizeRows(discoveryProfileRows);
  const warnings = arr(discoveryWarnings).map((x) => s(x)).filter(Boolean);

  const barrierWarning = warnings.find(isBarrierWarning) || "";
  const barrierState = !!barrierWarning;

  const primaryRows = barrierState ? rows.slice(0, 4) : rows.slice(0, 6);
  const extraRows = barrierState ? rows.slice(4) : rows.slice(6);

  const resolvedTitle =
    !barrierState && s(currentTitle)
      ? s(currentTitle)
      : barrierState
        ? "This source needs manual review."
        : "Your first business draft";

  const resolvedDescription =
    !barrierState && s(currentDescription)
      ? s(currentDescription)
      : barrierState
        ? humanizeWarning(barrierWarning)
        : "We prepared a first-pass business draft from the source. Review it now, refine anything important, then continue into the next setup step.";

  const visibleFieldCount = primaryRows.length;
  const hasRows = rows.length > 0;

  return (
    <SetupStudioStageShell
      eyebrow="build draft"
      title={
        <>
          Review the first
          <br />
          business identity draft.
        </>
      }
      body="This is the first structured version of the business. Confirm what looks right, refine what matters, then continue with the rest of the launch setup."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.06fr)_420px] xl:items-start">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
              <FileSearch className="h-3.5 w-3.5" />
              review draft
            </div>

            {s(sourceLabel) ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5" />
                {sourceLabel}
              </div>
            ) : null}

            {hasRows ? (
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {rows.length} field{rows.length === 1 ? "" : "s"} available
              </div>
            ) : null}

            {barrierState ? (
              <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                limited access
              </div>
            ) : null}
          </div>

          <div>
            <div className="text-[32px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[42px]">
              {resolvedTitle}
            </div>

            <div className="mt-4 max-w-[760px] text-[15px] leading-8 text-slate-600">
              {resolvedDescription}
            </div>
          </div>

          {warnings.length ? (
            <div className="space-y-2.5">
              {warnings.slice(0, 2).map((warning, index) => {
                const isBarrier = isBarrierWarning(warning);

                return (
                  <div
                    key={`${warning}-${index}`}
                    className={`flex items-start gap-3 rounded-[22px] border px-4 py-3.5 text-sm ${
                      isBarrier
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{humanizeWarning(warning)}</span>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <GhostButton onClick={onNext} icon={ChevronRight} active>
              {barrierState ? "Continue manually" : "Continue review"}
            </GhostButton>

            <GhostButton onClick={onToggleRefine} icon={Brain}>
              Refine draft
            </GhostButton>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/84 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-4.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Identity snapshot
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-600">
                  {barrierState
                    ? "The source was limited, so this should be treated as a partial draft."
                    : "A structured first pass of the business identity."}
                </div>
              </div>

              {visibleFieldCount ? (
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {visibleFieldCount} visible
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-5 py-5">
            {primaryRows.length ? (
              <div className="space-y-4">
                {!barrierState ? (
                  <div className="flex items-start gap-3 rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3.5">
                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-emerald-700">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-emerald-900">
                        Reviewable draft is ready
                      </div>
                      <div className="mt-1 text-sm leading-6 text-emerald-800/90">
                        The system found enough signal to show a usable first-pass business identity.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4">
                    <div className="text-sm font-semibold text-amber-900">
                      Partial source result
                    </div>
                    <div className="mt-1 text-sm leading-6 text-amber-800/90">
                      Continue carefully. This source did not provide enough stable signal to be trusted on its own.
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  {primaryRows.map((item, index) => (
                    <FieldCard
                      key={`${item.label}-${index}`}
                      label={item.label}
                      value={truncate(item.value, 240) || "—"}
                    />
                  ))}
                </div>

                {extraRows.length ? (
                  <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm leading-6 text-slate-500">
                    +{extraRows.length} more field{extraRows.length === 1 ? "" : "s"} found.
                    Open <span className="font-medium text-slate-700">Refine draft</span> to review and edit the full result.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
                  <FileSearch className="h-5 w-5" />
                </div>

                <div className="mt-4 text-base font-semibold text-slate-800">
                  Identity snapshot is still light
                </div>

                <div className="mt-2 max-w-[340px] text-sm leading-6 text-slate-500">
                  There are not enough structured fields yet to show a strong identity draft. Use refine to complete it manually and continue.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}