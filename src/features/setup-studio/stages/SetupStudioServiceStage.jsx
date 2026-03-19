// src/features/setup-studio/stages/SetupStudioServiceStage.jsx

import { ChevronRight, Wand2 } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton, TinyChip } from "../components/SetupStudioUi.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export default function SetupStudioServiceStage({
  serviceSuggestionTitle,
  meta,
  services,
  savingServiceSuggestion,
  onCreateSeed,
  onSkip,
}) {
  const serviceCount = Array.isArray(services) ? services.length : 0;
  const hasSuggestion = !!s(serviceSuggestionTitle);
  const isCreating = !!savingServiceSuggestion;

  const headline =
    hasSuggestion && serviceCount === 0
      ? serviceSuggestionTitle
      : serviceCount > 0
        ? "Service layer already has a base"
        : "Service layer seed";

  return (
    <SetupStudioStageShell
      eyebrow="service"
      title={
        <>
          This is the first service
          <br />
          layer we can prepare.
        </>
      }
      body="Burda böyük katalog yoxdu. Sadəcə ilk real seed. Sonra workspace içində dərinləşdirərsən."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
        <div>
          <div className="text-4xl font-semibold tracking-[-0.06em] text-slate-950 sm:text-5xl">
            {headline}
          </div>

          <div className="mt-4 max-w-[680px] text-lg leading-8 text-slate-600">
            {serviceCount > 0
              ? `${serviceCount} service artıq hazır görünür. İstəsən birbaşa ready mərhələsinə keç.`
              : hasSuggestion
                ? "Discovery-dən çıxan ilk service seed hazırdır. İndi bunu kataloqa əlavə edə bilərsən."
                : "Qısa fokus qeydindən və ya discovery nəticəsindən service seed yaradıla bilər, sonra workspace içində refine edilə bilər."}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <GhostButton
              onClick={onCreateSeed}
              icon={Wand2}
              active
              disabled={isCreating || (!hasSuggestion && serviceCount === 0)}
            >
              {isCreating ? "Creating..." : serviceCount > 0 ? "Create another seed" : "Create seed"}
            </GhostButton>

            <GhostButton onClick={onSkip} icon={ChevronRight}>
              {serviceCount > 0 ? "Continue" : "Skip for now"}
            </GhostButton>
          </div>
        </div>

        <div className="space-y-3">
          <TinyChip>services {serviceCount}</TinyChip>
          <TinyChip>readiness {num(meta?.readinessScore, 0)}%</TinyChip>
          <TinyChip>playbooks {num(meta?.playbookCount, 0)}</TinyChip>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}