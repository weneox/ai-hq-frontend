import { ArrowRight, BadgeCheck, PencilLine } from "lucide-react";

import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import {
  GhostButton,
  MetricCard,
  StagePanel,
  TinyChip,
  TinyLabel,
} from "../components/SetupStudioUi.jsx";
import { humanizeStudioIssue } from "../logic/helpers.js";

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
  const readinessScore = num(meta?.readinessScore, 0);
  const approvedKnowledgeCount = num(meta?.approvedKnowledgeCount, 0);
  const serviceCount = num(meta?.serviceCount, 0);

  const missingSteps = arr(
    studioProgress?.missingSteps?.length
      ? studioProgress.missingSteps
      : meta?.missingSteps
  )
    .map((item) => humanizeStudioIssue(item))
    .filter(Boolean);

  const readinessLabel = s(
    studioProgress?.readinessLabel || meta?.readinessLabel || "Ready"
  );

  return (
    <SetupStudioStageShell
      eyebrow="ready"
      title="The draft is ready for review."
      body="It is still temporary until you confirm the reviewed draft."
      align="center"
    >
      <div className="mx-auto max-w-[980px] space-y-4">
        <StagePanel className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <TinyLabel>{readinessLabel}</TinyLabel>
            <TinyChip tone="success">Temporary draft</TinyChip>
          </div>

          <div className="mx-auto mt-4 max-w-[620px] text-[18px] leading-8 text-slate-600">
            Review once more, confirm the business twin, then continue into the workspace.
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Readiness" value={`${readinessScore}%`} />
            <MetricCard label="Approved" value={approvedKnowledgeCount} />
            <MetricCard label="Services" value={serviceCount} />
          </div>
        </StagePanel>

        {missingSteps.length ? (
          <StagePanel tone="subtle" className="text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {missingSteps.map((item, index) => (
                <TinyChip key={`${item}-${index}`} tone="warn">
                  {item}
                </TinyChip>
              ))}
            </div>
          </StagePanel>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <GhostButton icon={PencilLine} onClick={onToggleRefine}>
            Review draft
          </GhostButton>
          {hasKnowledge ? (
            <GhostButton icon={BadgeCheck} onClick={onToggleKnowledge}>
              Review knowledge
            </GhostButton>
          ) : null}
          <GhostButton active icon={ArrowRight} onClick={onOpenWorkspace}>
            Open workspace
          </GhostButton>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}
