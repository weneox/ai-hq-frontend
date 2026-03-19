// src/features/setup-studio/components/SetupStudioIntakeModal.jsx

import { motion } from "framer-motion";
import { BadgeCheck, X } from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";
import SetupStudioKnowledgeLine from "./SetupStudioKnowledgeLine.jsx";

export default function SetupStudioIntakeModal({
  knowledgeItems,
  actingKnowledgeId,
  onApproveKnowledge,
  onRejectKnowledge,
  onClose,
}) {
  const items = Array.isArray(knowledgeItems) ? knowledgeItems : [];

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
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[62vh] overflow-y-auto px-5 pb-5 sm:px-6">
        {items.length ? (
          items.map((item, index) => (
            <SetupStudioKnowledgeLine
              key={item.id || item.title || index}
              item={{ ...item, index: String(index + 1).padStart(2, "0") }}
              busy={actingKnowledgeId === item.id}
              onApprove={() => onApproveKnowledge(item)}
              onReject={() => onRejectKnowledge(item)}
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