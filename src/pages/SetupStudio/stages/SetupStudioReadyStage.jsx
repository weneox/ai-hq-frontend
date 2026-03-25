import { ArrowRight, BadgeCheck, PencilLine } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import {
  GhostButton,
  MetricCard,
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
  ).map((item) => humanizeStudioIssue(item));

  const readinessLabel = s(
    studioProgress?.readinessLabel || meta?.readinessLabel
  );

  const nextStudioStage = s(studioProgress?.nextStudioStage).toLowerCase();

  const summaryLine = missingSteps.length
    ? `Remaining: ${missingSteps.join(" | ")}`
    : "Core onboarding now has enough structure to move into the workspace.";

  const isTrulyReady =
    !missingSteps.length ||
    nextStudioStage === "ready" ||
    !!meta?.setupCompleted;

  return (
    <SetupStudioStageShell
      eyebrow="ready"
      title="The first business draft is ready."
      body="You now have enough structure to move into the workspace and continue setup without stretching onboarding too far."
      align="center"
    >
      <div className="mx-auto max-w-[980px] space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <TinyLabel>{readinessLabel || "Ready state"}</TinyLabel>

            <TinyChip>{isTrulyReady ? "Ready to continue" : "Almost ready"}</TinyChip>
          </div>

          <div className="mt-4 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[38px]">
            Your studio now has a working first shape.
          </div>

          <div className="mx-auto mt-4 max-w-[760px] text-[15px] leading-7 text-slate-600">
            Review the summary, refine anything important, then open the workspace
            and continue setup from a cleaner foundation.
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Readiness" value={`${readinessScore}%`} />
            <MetricCard label="Approved" value={approvedKnowledgeCount} />
            <MetricCard label="Services" value={serviceCount} />
            <MetricCard
              label="Status"
              value={isTrulyReady ? "Ready" : "Draft"}
            />
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Current state
          </div>

          <div className="mt-4 text-sm leading-7 text-slate-600">
            {summaryLine}
          </div>

          {missingSteps.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {missingSteps.map((item, index) => (
                <TinyChip key={`${item}-${index}`}>{item}</TinyChip>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <GhostButton icon={PencilLine} onClick={onToggleRefine}>
            Refine details
          </GhostButton>

          {hasKnowledge ? (
            <GhostButton icon={BadgeCheck} onClick={onToggleKnowledge}>
              Review intake
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
