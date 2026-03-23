import { ArrowRight, BadgeCheck, PencilLine } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";

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

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-5 text-center">
      <div className="text-[30px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[34px]">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
    </div>
  );
}

function ActionButton({ active = false, icon: Icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
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

  const readinessScore = num(meta?.readinessScore, 0);
  const approvedKnowledgeCount = num(meta?.approvedKnowledgeCount, 0);
  const serviceCount = num(meta?.serviceCount, 0);

  const missingSteps = arr(
    studioProgress?.missingSteps?.length
      ? studioProgress.missingSteps
      : meta?.missingSteps
  );

  const readinessLabel = s(
    studioProgress?.readinessLabel || meta?.readinessLabel
  );

  const summaryLine = missingSteps.length
    ? `Remaining: ${missingSteps.join(" · ")}`
    : "Core onboarding is ready for workspace setup.";

  return (
    <SetupStudioStageShell
      eyebrow="ready"
      title="The first business draft is ready."
      body="You now have enough structure to move into the workspace and continue setup without dragging this onboarding out."
      align="center"
    >
      <div className="mx-auto max-w-[980px] space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8">
          {readinessLabel ? (
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {readinessLabel}
            </div>
          ) : null}

          <div className="mt-4 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[38px]">
            Your studio has a working first shape.
          </div>

          <div className="mt-4 text-[15px] leading-7 text-slate-600">
            Review the summary, refine anything important, and then open the
            workspace.
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Readiness" value={`${readinessScore}%`} />
            <MetricCard label="Approved" value={approvedKnowledgeCount} />
            <MetricCard label="Services" value={serviceCount} />
            <MetricCard label="Progress" value={`${progressPercent}%`} />
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Current state
          </div>

          <div className="mt-4 text-sm leading-7 text-slate-600">{summaryLine}</div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ActionButton icon={PencilLine} onClick={onToggleRefine}>
            Refine details
          </ActionButton>

          {hasKnowledge ? (
            <ActionButton icon={BadgeCheck} onClick={onToggleKnowledge}>
              Review intake
            </ActionButton>
          ) : null}

          <ActionButton active icon={ArrowRight} onClick={onOpenWorkspace}>
            Open workspace
          </ActionButton>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}