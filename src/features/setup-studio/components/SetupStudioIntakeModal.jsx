import { motion } from "framer-motion";
import { BadgeCheck, RotateCw, X } from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";
import SetupStudioKnowledgeLine from "./SetupStudioKnowledgeLine.jsx";

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

export default function SetupStudioIntakeModal({
  knowledgeItems,
  actingKnowledgeId,
  onApproveKnowledge,
  onRejectKnowledge,
  onClose,
  onRefresh,
}) {
  const items = arr(knowledgeItems).map((item, index) =>
    normalizeKnowledgeItem(item, index)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-[32px] border border-white/80 bg-white/94 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
        <div>
          <TinyLabel>
            <BadgeCheck className="h-3.5 w-3.5" />
            knowledge intake
          </TinyLabel>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Review what enters the twin
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Burda source-dan çıxarılan knowledge item-ləri approve və reject edə bilərsən.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {typeof onRefresh === "function" ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
              aria-label="Refresh intake"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[62vh] overflow-y-auto px-5 pb-5 sm:px-6">
        {items.length ? (
          items.map((item) => (
            <SetupStudioKnowledgeLine
              key={item.id || item.title || item.index}
              item={item}
              busy={actingKnowledgeId === item.id}
              onApprove={() => onApproveKnowledge({ ...item, id: item.id })}
              onReject={() => onRejectKnowledge({ ...item, id: item.id })}
            />
          ))
        ) : (
          <div className="py-8 text-sm text-slate-500">
            Review üçün knowledge item yoxdur.
          </div>
        )}
      </div>
    </motion.div>
  );
}