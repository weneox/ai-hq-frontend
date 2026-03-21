import { motion } from "framer-motion";
import { BadgeCheck, Brain, FileText, X } from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

export default function SetupStudioRefineModal({
  savingBusiness,
  businessForm,
  discoveryProfileRows,
  manualSections,
  onSetBusinessField,
  onSetManualSection,
  onSaveBusiness,
  onClose,
}) {
  const rows = Array.isArray(discoveryProfileRows) ? discoveryProfileRows : [];
  const sections =
    manualSections && typeof manualSections === "object"
      ? manualSections
      : {
          servicesText: "",
          faqsText: "",
          policiesText: "",
        };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex w-full max-w-[1120px] flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.16)] backdrop-blur-2xl max-h-[calc(100vh-1rem)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-5 sm:px-6">
        <div>
          <TinyLabel>
            <Brain className="h-3.5 w-3.5" />
            refine draft
          </TinyLabel>

          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            Review, edit and confirm the business twin
          </h2>

          <p className="mt-3 max-w-[620px] text-sm leading-7 text-slate-500">
            Əsas məlumatları düzəlt. Lazımdırsa services, FAQ və policies əlavə et.
            Confirm edəndə bunlar tenant üzrə canonical məlumat kimi yazılacaq.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={savingBusiness}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-600 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 overflow-y-auto">
        <div className="grid gap-8 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
          <form onSubmit={onSaveBusiness} className="min-w-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={businessForm.companyName}
                onChange={(e) => onSetBusinessField("companyName", e.target.value)}
                className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Company name"
                autoComplete="off"
              />

              <input
                value={businessForm.websiteUrl}
                onChange={(e) => onSetBusinessField("websiteUrl", e.target.value)}
                className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Website URL"
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={businessForm.primaryPhone}
                onChange={(e) => onSetBusinessField("primaryPhone", e.target.value)}
                className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Primary phone"
                autoComplete="off"
              />

              <input
                value={businessForm.primaryEmail}
                onChange={(e) => onSetBusinessField("primaryEmail", e.target.value)}
                className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Primary email"
                autoComplete="off"
              />
            </div>

            <input
              value={businessForm.primaryAddress}
              onChange={(e) => onSetBusinessField("primaryAddress", e.target.value)}
              className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Primary address"
              autoComplete="off"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={businessForm.timezone}
                onChange={(e) => onSetBusinessField("timezone", e.target.value)}
                className="w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-3.5 text-slate-900 outline-none placeholder:text-slate-400"
                placeholder="Timezone"
                autoComplete="off"
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
              className="min-h-[132px] w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Short business summary"
            />

            <div className="grid gap-4">
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Services
                </div>
                <textarea
                  value={s(sections.servicesText)}
                  onChange={(e) => onSetManualSection?.("servicesText", e.target.value)}
                  className="min-h-[110px] w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Hər sətirdə: Service name | short description"
                />
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  FAQ
                </div>
                <textarea
                  value={s(sections.faqsText)}
                  onChange={(e) => onSetManualSection?.("faqsText", e.target.value)}
                  className="min-h-[110px] w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Hər sətirdə: Question | Answer"
                />
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Policies
                </div>
                <textarea
                  value={s(sections.policiesText)}
                  onChange={(e) => onSetManualSection?.("policiesText", e.target.value)}
                  className="min-h-[110px] w-full rounded-[22px] border border-slate-900/8 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Hər sətirdə: Policy title | short description"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingBusiness}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              {savingBusiness ? "Finalizing..." : "Confirm business twin"}
            </button>
          </form>

          <div className="min-w-0">
            <TinyLabel>
              <BadgeCheck className="h-3.5 w-3.5" />
              extracted snapshot
            </TinyLabel>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-900/8 bg-white">
              {rows.length ? (
                <div className="divide-y divide-slate-900/8">
                  {rows.map(([label, value], index) => (
                    <div
                      key={`${label}-${index}`}
                      className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        {label}
                      </div>
                      <div className="break-words text-sm text-slate-700 md:max-w-[62%] md:text-right">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-500">
                  Extracted snapshot hələ görünmür.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-900/8 bg-slate-50/90 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                <FileText className="h-4 w-4" />
                Input format
              </div>

              <div className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                <div>
                  Services: <span className="text-slate-900">Name | Description</span>
                </div>
                <div>
                  FAQ: <span className="text-slate-900">Question | Answer</span>
                </div>
                <div>
                  Policies: <span className="text-slate-900">Title | Description</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}