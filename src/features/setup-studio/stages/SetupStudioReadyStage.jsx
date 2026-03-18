import { ArrowRight, BadgeCheck, Brain } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";

export default function SetupStudioReadyStage({
  meta,
  studioProgress,
  hasKnowledge,
  onToggleRefine,
  onToggleKnowledge,
  onOpenWorkspace,
}) {
  return (
    <SetupStudioStageShell
      eyebrow="ready"
      title={
        <>
          Your studio has a
          <br />
          working first shape.
        </>
      }
      body="Bu artıq boş setup deyil. İçəri keçmək üçün kifayət qədər forma var."
      align="center"
    >
      <div className="mx-auto max-w-[920px]">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {meta.readinessScore}%
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              readiness
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {meta.approvedKnowledgeCount}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              approved
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {meta.serviceCount}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              services
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {studioProgress}%
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              progress
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <GhostButton onClick={onToggleRefine} icon={Brain}>
            Refine details
          </GhostButton>

          {hasKnowledge ? (
            <GhostButton onClick={onToggleKnowledge} icon={BadgeCheck}>
              Review intake
            </GhostButton>
          ) : null}

          <GhostButton onClick={onOpenWorkspace} icon={ArrowRight} active>
            Open workspace
          </GhostButton>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          {meta.missingSteps.length
            ? `Remaining: ${meta.missingSteps.join(" · ")}`
            : "Core onboarding is ready."}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}