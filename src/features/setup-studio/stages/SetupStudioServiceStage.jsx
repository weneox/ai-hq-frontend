// src/features/setup-studio/stages/SetupStudioServiceStage.jsx

import { ChevronRight, Sparkles, Wand2 } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton, TinyChip } from "../components/SetupStudioUi.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function truncate(value = "", max = 180) {
  const x = s(value);
  if (!x) return "";
  if (x.length <= max) return x;
  return `${x.slice(0, max - 1)}…`;
}

function normalizeService(item = {}, index = 0) {
  const x = item && typeof item === "object" ? item : {};

  return {
    id: s(x.id || x.serviceId || x.service_id || `service-${index + 1}`),
    title: s(x.title || x.name || x.label || `Service ${index + 1}`),
    description: s(
      x.description ||
        x.summary ||
        x.value ||
        x.valueText ||
        x.value_text
    ),
    status: s(x.status || "ready"),
  };
}

export default function SetupStudioServiceStage({
  serviceSuggestionTitle,
  meta,
  services,
  savingServiceSuggestion,
  onCreateSeed,
  onSkip,
}) {
  const normalizedServices = arr(services)
    .map((item, index) => normalizeService(item, index))
    .filter((item) => item.title);

  const serviceCount = normalizedServices.length;
  const hasSuggestion = !!s(serviceSuggestionTitle);
  const isCreating = !!savingServiceSuggestion;

  const readinessScore = num(meta?.readinessScore, 0);
  const playbookCount = num(meta?.playbookCount, 0);

  const headline =
    hasSuggestion && serviceCount === 0
      ? serviceSuggestionTitle
      : serviceCount > 0
        ? "The service layer already has a foundation."
        : "Prepare the first service seed.";

  const supportingCopy =
    serviceCount > 0
      ? "A base service structure already exists. You can keep moving now, or add another seed if the draft still feels thin."
      : hasSuggestion
        ? "The first service suggestion is ready from the draft. Create it now and refine the catalog later inside the workspace."
        : "You do not need a full catalog here. One good starting service is enough to make the launch flow feel grounded.";

  const canCreate = !isCreating && (hasSuggestion || serviceCount > 0);

  return (
    <SetupStudioStageShell
      eyebrow="build draft"
      title={
        <>
          Shape the first
          <br />
          service layer.
        </>
      }
      body="You do not need a perfect catalog here. Just create enough service structure for the first launch to feel real, then deepen it later in the workspace."
    >
      <div className="mx-auto max-w-[1120px] space-y-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.06fr)_360px]">
          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/84 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-5 py-4.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                service layer
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div>
                <div className="text-[32px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[42px]">
                  {headline}
                </div>

                <div className="mt-4 max-w-[760px] text-[15px] leading-8 text-slate-600">
                  {supportingCopy}
                </div>
              </div>

              {hasSuggestion ? (
                <div className="rounded-[24px] border border-sky-200 bg-sky-50/80 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Suggested first seed
                  </div>
                  <div className="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
                    {serviceSuggestionTitle}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    This suggestion came from the current draft and can become the first real service object.
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <GhostButton
                  onClick={onCreateSeed}
                  icon={Wand2}
                  active
                  disabled={!canCreate}
                >
                  {isCreating
                    ? "Creating..."
                    : serviceCount > 0
                      ? "Create another seed"
                      : "Create seed"}
                </GhostButton>

                <GhostButton onClick={onSkip} icon={ChevronRight}>
                  {serviceCount > 0 ? "Continue" : "Skip for now"}
                </GhostButton>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/84 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="border-b border-slate-200/70 px-5 py-4.5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Readiness
              </div>
            </div>

            <div className="space-y-3 px-5 py-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Services
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                    {serviceCount}
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Readiness
                  </div>
                  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                    {readinessScore}%
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/72 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Playbooks
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  {playbookCount}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <TinyChip>services {serviceCount}</TinyChip>
                <TinyChip>readiness {readinessScore}%</TinyChip>
                <TinyChip>playbooks {playbookCount}</TinyChip>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_24px_70px_rgba(15,23,42,.08)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 px-5 py-4.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Current service base
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-600">
                  The first launch only needs a small, believable foundation.
                </div>
              </div>

              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {serviceCount} item{serviceCount === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="px-5 py-5">
            {serviceCount > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {normalizedServices.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_10px_24px_rgba(15,23,42,.03)]"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Service
                    </div>
                    <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">
                      {truncate(item.description, 180) || "A base service entry is ready for refinement in the workspace."}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/72 px-5 py-8 text-center">
                <div className="text-base font-semibold text-slate-900">
                  No service seed exists yet
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-500">
                  Create one starting service now, or move on and finish the service structure later in the workspace.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}