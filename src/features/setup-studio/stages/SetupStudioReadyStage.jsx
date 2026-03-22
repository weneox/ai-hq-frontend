// src/features/setup-studio/stages/SetupStudioReadyStage.jsx

import {
  ArrowRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
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

function MetricCard({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "accent"
      ? "border-sky-200 bg-sky-50/75"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50/70"
        : "border-slate-200/80 bg-white/88";

  return (
    <div
      className={`rounded-[24px] border px-4 py-5 text-center shadow-[0_12px_28px_rgba(15,23,42,.04)] ${toneClass}`}
    >
      <div className="text-[30px] font-semibold tracking-[-0.05em] text-slate-950 sm:text-[36px]">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
    </div>
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
      eyebrow="launch"
      title={
        <>
          Your first business draft
          <br />
          is ready to move forward.
        </>
      }
      body="This is no longer an empty setup. You now have enough structure to enter the workspace, refine important details, and connect the first live channel flow."
      align="center"
    >
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-6">
        <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/84 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-6">
            <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                launch-ready draft
              </div>

              <div className="mt-4 text-[30px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[40px]">
                Your studio has a working first shape.
              </div>

              <div className="mt-3 max-w-[700px] text-[15px] leading-8 text-slate-600">
                Review the summary below, make final refinements if needed, then
                open the workspace and continue the real launch setup.
              </div>

              {readinessLabel ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  {readinessLabel}
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Readiness"
                value={`${readinessScore}%`}
                tone="accent"
              />
              <MetricCard
                label="Approved"
                value={approvedKnowledgeCount}
                tone={approvedKnowledgeCount > 0 ? "success" : "neutral"}
              />
              <MetricCard
                label="Services"
                value={serviceCount}
                tone={serviceCount > 0 ? "success" : "neutral"}
              />
              <MetricCard
                label="Progress"
                value={`${progressPercent}%`}
                tone="neutral"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-5 py-4.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Next actions
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Refine important details
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Adjust identity, business info, and any fields that should feel cleaner before launch.
                </div>
              </div>

              {hasKnowledge ? (
                <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/72 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    Review approved intake
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    Revisit knowledge items and make sure the runtime memory stays clean and useful.
                  </div>
                </div>
              ) : null}

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Open workspace
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Continue with channel setup, playbooks, and the first live automation flow.
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-5 py-4.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Completion state
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Current status
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {summaryLine}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/72 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Recommended move
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  Open the workspace once the draft feels acceptable. You can continue polishing there without blocking launch progress.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
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

        <div className="text-center text-sm text-slate-500">
          {summaryLine}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}