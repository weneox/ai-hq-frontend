// src/features/setup-studio/stages/SetupStudioReadyStage.jsx

import { ArrowRight, BadgeCheck, Brain } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function s(v, d = "") {
  return String(v ?? d).trim();
}

export default function SetupStudioReadyStage({
  meta,
  studioProgress,
  hasKnowledge,
  onToggleRefine,
  onToggleKnowledge,
  onOpenWorkspace,
}) {
  const progressPercent = num(
    studioProgress?.progressPercent ?? studioProgress,
    0
  );

  const missingSteps = arr(
    studioProgress?.missingSteps?.length ? studioProgress.missingSteps : meta?.missingSteps
  );

  const readinessLabel = s(
    studioProgress?.readinessLabel || meta?.readinessLabel
  );

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
              {num(meta?.readinessScore, 0)}%
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              readiness
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {num(meta?.approvedKnowledgeCount, 0)}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              approved
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {num(meta?.serviceCount, 0)}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              services
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
              {progressPercent}%
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
              progress
            </div>
          </div>
        </div>

        {readinessLabel ? (
          <div className="mt-6 text-center text-sm text-slate-500">
            {readinessLabel}
          </div>
        ) : null}

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
          {missingSteps.length
            ? `Remaining: ${missingSteps.join(" · ")}`
            : "Core onboarding is ready."}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}