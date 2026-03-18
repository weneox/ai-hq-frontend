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
        <div className="space-y-1">
          {knowledgePreview.slice(0, 3).map((item, index) => (
            <SetupStudioKnowledgeLine
              key={item.id || item.title}
              item={{ ...item, index: String(index + 1).padStart(2, "0") }}
              busy={actingKnowledgeId === item.id}
              onApprove={() => onApproveKnowledge({ id: item.id })}
              onReject={() => onRejectKnowledge({ id: item.id })}
            />
          ))}
        </div>

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