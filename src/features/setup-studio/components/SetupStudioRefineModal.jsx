import { motion } from "framer-motion";
import { BadgeCheck, Brain, X } from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";

export default function SetupStudioRefineModal({
  savingBusiness,
  businessForm,
  discoveryProfileRows,
  onSetBusinessField,
  onSaveBusiness,
  onClose,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
        <div>
          <TinyLabel>
            <Brain className="h-3.5 w-3.5" />
            refine draft
          </TinyLabel>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Edit only the essentials
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

      <div className="grid gap-8 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_0.78fr]">
        <form onSubmit={onSaveBusiness} className="space-y-4">
          <input
            value={businessForm.companyName}
            onChange={(e) => onSetBusinessField("companyName", e.target.value)}
            className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Company name"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={businessForm.timezone}
              onChange={(e) => onSetBusinessField("timezone", e.target.value)}
              className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Timezone"
            />

            <select
              value={businessForm.language}
              onChange={(e) => onSetBusinessField("language", e.target.value)}
              className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none"
            >
              <option value="az">Azerbaijani</option>
              <option value="en">English</option>
              <option value="tr">Turkish</option>
              <option value="ru">Russian</option>
            </select>
          </div>

          <textarea
            value={businessForm.description}
            onChange={(e) => onSetBusinessField("description", e.target.value)}
            className="min-h-[156px] w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Business description"
          />

          <button
            type="submit"
            disabled={savingBusiness}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {savingBusiness ? "Saving..." : "Save business twin"}
          </button>
        </form>

        <div>
          <TinyLabel>
            <BadgeCheck className="h-3.5 w-3.5" />
            snapshot
          </TinyLabel>

          <div className="mt-5 divide-y divide-slate-900/8 overflow-hidden rounded-[24px] border border-slate-900/8 bg-white">
            {discoveryProfileRows.length ? (
              discoveryProfileRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {label}
                  </div>
                  <div className="text-sm text-slate-700 sm:max-w-[62%] sm:text-right">
                    {value}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm text-slate-500">
                Extracted snapshot hələ görünmür.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}