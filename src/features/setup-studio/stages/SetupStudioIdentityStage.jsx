import { Brain, ChevronRight } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";

export default function SetupStudioIdentityStage({
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  onNext,
  onToggleRefine,
}) {
  return (
    <SetupStudioStageShell
      eyebrow="identity"
      title={
        <>
          We think your business
          <br />
          is this.
        </>
      }
      body="İlk çıxarılan form budur. Düzdürsə davam et. Lazımdırsa dərhal refine et."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end">
        <div>
          <div className="text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            {currentTitle}
          </div>

          <div className="mt-4 max-w-[680px] text-lg leading-8 text-slate-600">
            {currentDescription}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <GhostButton onClick={onNext} icon={ChevronRight} active>
              Looks right
            </GhostButton>

            <GhostButton onClick={onToggleRefine} icon={Brain}>
              Refine it
            </GhostButton>
          </div>
        </div>

        <div className="border-l border-slate-300/80 pl-6">
          {discoveryProfileRows.length ? (
            <div className="space-y-4">
              {discoveryProfileRows.map(([label, value]) => (
                <div key={label}>
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