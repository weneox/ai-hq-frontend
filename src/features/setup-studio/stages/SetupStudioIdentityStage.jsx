import { Brain, ChevronRight, FileSearch } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function s(v, d = "") {
  return String(v ?? d).trim();
}

export default function SetupStudioIdentityStage({
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  onNext,
  onToggleRefine,
}) {
  const rows = arr(discoveryProfileRows);

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
      <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">
            <FileSearch className="h-3.5 w-3.5" />
            review draft
          </div>

          <div className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            {s(currentTitle) || "Business identity"}
          </div>

          <div className="mt-4 max-w-[680px] text-lg leading-8 text-slate-600">
            {s(currentDescription) ||
              "We extracted a first business summary from the source and prepared it for approval."}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <GhostButton onClick={onNext} icon={ChevronRight} active>
              Continue review
            </GhostButton>

            <GhostButton onClick={onToggleRefine} icon={Brain}>
              Refine draft
            </GhostButton>
          </div>
        </div>

        <div className="border-l border-slate-300/80 pl-6">
          {rows.length ? (
            <div className="space-y-4">
              {rows.map(([label, value], index) => (
                <div key={`${label}-${index}`}>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                    {label}
                  </div>
                  <div className="mt-1 text-base text-slate-700">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Identity snapshot hələ hazır deyil.
            </div>
          )}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}