import { ArrowRight, Plus } from "lucide-react";

import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import {
  GhostButton,
  SectionHeading,
  StagePanel,
  TinyChip,
  TinyLabel,
} from "../components/SetupStudioUi.jsx";

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
  return `${x.slice(0, max - 1)}...`;
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

  return (
    <SetupStudioStageShell
      eyebrow="services"
      title="Set the first service shape."
      body="Keep this compact. One believable service is enough to move forward."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <StagePanel className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <TinyLabel>Service layer</TinyLabel>
              <TinyChip>{serviceCount} current</TinyChip>
              {hasSuggestion ? <TinyChip tone="success">Suggestion ready</TinyChip> : null}
            </div>

            {hasSuggestion ? (
              <div className="rounded-[24px] bg-white/72 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Suggested service
                </div>
                <div className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-slate-950">
                  {serviceSuggestionTitle}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <GhostButton
                active
                icon={Plus}
                onClick={onCreateSeed}
                disabled={isCreating || (!hasSuggestion && serviceCount === 0)}
              >
                {isCreating ? "Creating..." : serviceCount ? "Add seed" : "Create seed"}
              </GhostButton>
              <GhostButton icon={ArrowRight} onClick={onSkip}>
                {serviceCount ? "Continue" : "Skip"}
              </GhostButton>
            </div>
          </StagePanel>

          <StagePanel className="space-y-4">
            <SectionHeading
              label="Current"
              title={
                serviceCount
                  ? "Visible services"
                  : "No service has been saved yet"
              }
              body={
                serviceCount
                  ? "These are the current service seeds."
                  : "You can keep moving and refine this later."
              }
            />

            {serviceCount ? (
              <div className="grid gap-3 md:grid-cols-2">
                {normalizedServices.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] bg-white/72 px-4 py-4"
                  >
                    <div className="text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">
                      {truncate(item.description, 180) || "No description yet."}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] bg-white/70 px-4 py-4 text-sm leading-6 text-slate-500">
                Start with one simple service if you want the workspace to feel more complete.
              </div>
            )}
          </StagePanel>
        </div>

        <div className="grid gap-4">
          <StagePanel tone="subtle">
            <SectionHeading
              label="Readiness"
              title={`${readinessScore}%`}
              body="Service detail can stay light during setup."
            />
          </StagePanel>
          <StagePanel tone="subtle">
            <SectionHeading
              label="Guideline"
              title="Stay believable"
              body="Avoid long catalogs. Keep only the first clear offer."
            />
          </StagePanel>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}
