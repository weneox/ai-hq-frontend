// src/features/setup-studio/stages/SetupStudioKnowledgeStage.jsx

import { BadgeCheck, ChevronRight } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";
import SetupStudioKnowledgeLine from "../components/SetupStudioKnowledgeLine.jsx";

export default function SetupStudioKnowledgeStage({
  knowledgePreview,
  actingKnowledgeId,
  onApproveKnowledge,
  onRejectKnowledge,
  onNext,
  onToggleKnowledge,
}) {
  const items = Array.isArray(knowledgePreview) ? knowledgePreview.slice(0, 3) : [];

  return (
    <SetupStudioStageShell
      eyebrow="knowledge"
      title={
        <>
          Here’s what we found
          <br />
          worth remembering.
        </>
      }
      body="Bu hissədə sadəcə faydalı olanları saxlayırsan. Noise içəri girmir."
    >
      <div className="mx-auto max-w-[980px]">
        {items.length ? (
          <div className="space-y-1">
            {items.map((item, index) => (
              <SetupStudioKnowledgeLine
                key={item.id || item.title || index}
                item={{ ...item, index: String(index + 1).padStart(2, "0") }}
                busy={actingKnowledgeId === item.id}
                onApprove={() => onApproveKnowledge(item)}
                onReject={() => onRejectKnowledge(item)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/60 bg-white/70 px-5 py-5 text-sm text-slate-600 backdrop-blur-xl">
            Review üçün pending knowledge tapılmadı. Davam edə bilərsən və ya full intake-a baxa bilərsən.
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <GhostButton onClick={onNext} icon={ChevronRight} active>
            Continue
          </GhostButton>

          <GhostButton onClick={onToggleKnowledge} icon={BadgeCheck}>
            Open full intake
          </GhostButton>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}