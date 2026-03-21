import { BadgeCheck, ChevronRight } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import { GhostButton } from "../components/SetupStudioUi.jsx";
import SetupStudioKnowledgeLine from "../components/SetupStudioKnowledgeLine.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function obj(v, d = {}) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : d;
}

function normalizeKnowledgeItem(item = {}, index = 0) {
  const x = obj(item);
  const evidence = arr(x.evidence || x.source_evidence_json);

  return {
    ...x,
    id: s(x.id || x.candidateId),
    index: String(index + 1).padStart(2, "0"),
    title: s(x.title),
    value: s(x.value || x.valueText || x.value_text),
    category: s(x.category),
    source: s(x.source || x.sourceLabel || x.source_display_name || x.source_type),
    confidence: s(x.confidence || x.confidenceLabel || x.confidence_label),
    confidenceLabel: s(x.confidenceLabel || x.confidence_label),
    evidence,
    evidenceUrl: s(
      x.evidenceUrl ||
        evidence[0]?.pageUrl ||
        evidence[0]?.url ||
        evidence[0]?.source_url ||
        evidence[0]?.link
    ),
  };
}

export default function SetupStudioKnowledgeStage({
  knowledgePreview,
  actingKnowledgeId,
  sourceLabel,
  warnings,
  onApproveKnowledge,
  onRejectKnowledge,
  onNext,
  onToggleKnowledge,
}) {
  const items = arr(knowledgePreview)
    .slice(0, 3)
    .map((item, index) => normalizeKnowledgeItem(item, index));

  const warningList = arr(warnings).filter(Boolean);

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
        {sourceLabel || warningList.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {sourceLabel ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {sourceLabel}
              </span>
            ) : null}

            {warningList.length ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-amber-700">
                {warningList[0]}
              </span>
            ) : null}
          </div>
        ) : null}

        {items.length ? (
          <div className="space-y-1">
            {items.map((item) => (
              <SetupStudioKnowledgeLine
                key={item.id || item.title || item.index}
                item={item}
                busy={actingKnowledgeId === item.id}
                onApprove={() => onApproveKnowledge({ ...item, id: item.id })}
                onReject={() => onRejectKnowledge({ ...item, id: item.id })}
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