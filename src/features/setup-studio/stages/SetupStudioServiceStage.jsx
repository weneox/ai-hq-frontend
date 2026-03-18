import { ChevronRight, Wand2 } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton, TinyChip } from "../components/SetupStudioUi.jsx";

export default function SetupStudioServiceStage({
  serviceSuggestionTitle,
  meta,
  services,
  savingServiceSuggestion,
  onCreateSeed,
  onSkip,
}) {
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
            {serviceSuggestionTitle || "Service layer seed"}
          </div>

          <div className="mt-4 max-w-[680px] text-lg leading-8 text-slate-600">
            {meta.serviceCount > 0
              ? `${meta.serviceCount} service artıq hazır görünür. İstəsən birbaşa ready mərhələsinə keç.`
              : "Qısa fokus qeydindən service seed yaradıla bilər və sonra refine edilə bilər."}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <GhostButton onClick={onCreateSeed} icon={Wand2} active>
              {savingServiceSuggestion ? "Creating..." : "Create seed"}
            </GhostButton>

            <GhostButton onClick={onSkip} icon={ChevronRight}>
              Skip for now
            </GhostButton>
          </div>
        </div>

        <div className="space-y-3">
          <TinyChip>services {services.length}</TinyChip>
          <TinyChip>readiness {meta.readinessScore}%</TinyChip>
          <TinyChip>playbooks {meta.playbookCount}</TinyChip>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}