import {
  AlertTriangle,
  Brain,
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

  const primaryRows = rows.slice(0, 6);
  const extraRows = rows.slice(6);

  const resolvedTitle = s(currentTitle) || "Business identity";
  const resolvedDescription =
    s(currentDescription) ||
    "We extracted a first business summary from the source and prepared it for approval.";

  return (
    <SetupStudioStageShell
      eyebrow="identity"
      title={
        <>
          We mapped the business
          <br />
          into a usable draft.
        </>
      }
      body="Sistem source-u analiz edib ilkin biznes draftını çıxarıb. İndi bunu yoxlayıb təsdiqləyə və ya refine edə bilərsən."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
              <FileSearch className="h-3.5 w-3.5" />
              review draft
            </div>

            {s(sourceLabel) ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                <Sparkles className="h-3.5 w-3.5" />
                {sourceLabel}
              </div>
            ) : null}

            {rows.length ? (
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-600">
                {rows.length} fields extracted
              </div>
            ) : null}
          </div>

          <div className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            {resolvedTitle}
          </div>

          <div className="mt-4 max-w-[720px] text-lg leading-8 text-slate-600">
            {resolvedDescription}
          </div>

          {warnings.length ? (
            <div className="mt-6 space-y-2">
              {warnings.slice(0, 2).map((warning, index) => (
                <div
                  key={`${warning}-${index}`}
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <GhostButton onClick={onNext} icon={ChevronRight} active>
              Continue review
            </GhostButton>

            <GhostButton onClick={onToggleRefine} icon={Brain}>
              Refine draft
            </GhostButton>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_16px_50px_rgba(15,23,42,.06)]">
          {primaryRows.length ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    Extracted identity
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Source-dan çıxan ilkin biznes məlumatları
                  </div>
                </div>

                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {primaryRows.length} visible
                </div>
              </div>

              <div className="grid gap-3">
                {primaryRows.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                      {item.label || "Field"}
                    </div>
                    <div className="mt-1.5 text-sm leading-6 text-slate-700">
                      {truncate(item.value, 220) || "—"}
                    </div>
                  </div>
                ))}
              </div>

              {extraRows.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-500">
                  +{extraRows.length} əlavə field də tapılıb. Hamısını görmək və düzəltmək üçün{" "}
                  <span className="font-medium text-slate-700">Refine draft</span>{" "}
                  aç.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
                <FileSearch className="h-5 w-5" />
              </div>

              <div className="mt-4 text-base font-semibold text-slate-800">
                Identity snapshot hələ hazır deyil
              </div>

              <div className="mt-2 max-w-[320px] text-sm leading-6 text-slate-500">
                Scan nəticəsində title/description və ya profil field-ləri görünmür.
                Refine draft ilə manual düzəliş edə bilərsən.
              </div>
            </div>
          )}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}