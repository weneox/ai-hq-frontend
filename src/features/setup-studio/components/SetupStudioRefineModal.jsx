import { motion } from "framer-motion";
import {
  BadgeCheck,
  Brain,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { TinyLabel } from "./SetupStudioUi.jsx";

const FORM_ID = "setup-studio-refine-form";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function obj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function normalizeRows(rows = []) {
  return arr(rows)
    .map((item) => {
      if (Array.isArray(item)) {
        return {
          label: s(item[0]),
          value: s(item[1]),
        };
      }

      const x = obj(item);
      return {
        label: s(x.label || x.key || x.title),
        value: s(x.value || x.text || x.description),
      };
    })
    .filter((item) => item.label || item.value);
}

function countLines(value = "") {
  return s(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function fieldClassName() {
  return "w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100";
}

function textAreaClassName(minHeightClass = "min-h-[120px]") {
  return `${minHeightClass} w-full rounded-[22px] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100`;
}

function labelClassName() {
  return "mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";
}

function SnapshotRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="mt-1.5 break-words text-sm leading-6 text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, hint }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className={labelClassName()}>{title}</div>
      <div className="text-[11px] text-slate-400">
        {count} line{count === 1 ? "" : "s"}
        {hint ? ` · ${hint}` : ""}
      </div>
    </div>
  );
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
  const rows = normalizeRows(discoveryProfileRows);
  const form = obj(businessForm);
  const sections = {
    servicesText: s(manualSections?.servicesText),
    faqsText: s(manualSections?.faqsText),
    policiesText: s(manualSections?.policiesText),
  };

  const serviceCount = countLines(sections.servicesText);
  const faqCount = countLines(sections.faqsText);
  const policyCount = countLines(sections.policiesText);

  const keyFacts = [
    {
      icon: Globe,
      label: "Website",
      value: s(form.websiteUrl),
    },
    {
      icon: Phone,
      label: "Phone",
      value: s(form.primaryPhone),
    },
    {
      icon: Mail,
      label: "Email",
      value: s(form.primaryEmail),
    },
    {
      icon: MapPin,
      label: "Address",
      value: s(form.primaryAddress),
    },
  ].filter((item) => item.value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex w-full max-w-[1180px] flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/95 shadow-[0_40px_120px_rgba(15,23,42,0.16)] backdrop-blur-2xl max-h-[calc(100vh-1rem)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/92 px-5 py-5 backdrop-blur-xl sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <TinyLabel>
              <Brain className="h-3.5 w-3.5" />
              refine draft
            </TinyLabel>

            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-3xl">
              Review, edit and confirm the business twin
            </h2>

            <p className="mt-3 max-w-[720px] text-sm leading-7 text-slate-500">
              Əsas məlumatları düzəlt. Lazımdırsa services, FAQ və policies əlavə et.
              Confirm edəndə bunlar tenant üzrə canonical məlumat kimi yazılacaq.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={savingBusiness}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-8 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <form
            id={FORM_ID}
            onSubmit={onSaveBusiness}
            className="min-w-0 space-y-6"
          >
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
              <div className="mb-4 text-sm font-semibold text-slate-900">
                Core business identity
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className={labelClassName()}>Company name</div>
                  <input
                    value={s(form.companyName)}
                    onChange={(e) => onSetBusinessField("companyName", e.target.value)}
                    className={fieldClassName()}
                    placeholder="Company name"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <div className={labelClassName()}>Website URL</div>
                  <input
                    value={s(form.websiteUrl)}
                    onChange={(e) => onSetBusinessField("websiteUrl", e.target.value)}
                    className={fieldClassName()}
                    placeholder="https://example.com"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className={labelClassName()}>Primary phone</div>
                  <input
                    value={s(form.primaryPhone)}
                    onChange={(e) => onSetBusinessField("primaryPhone", e.target.value)}
                    className={fieldClassName()}
                    placeholder="+994 ..."
                    autoComplete="off"
                  />
                </div>

                <div>
                  <div className={labelClassName()}>Primary email</div>
                  <input
                    value={s(form.primaryEmail)}
                    onChange={(e) => onSetBusinessField("primaryEmail", e.target.value)}
                    className={fieldClassName()}
                    placeholder="info@company.com"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className={labelClassName()}>Primary address</div>
                <input
                  value={s(form.primaryAddress)}
                  onChange={(e) => onSetBusinessField("primaryAddress", e.target.value)}
                  className={fieldClassName()}
                  placeholder="Primary address"
                  autoComplete="off"
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className={labelClassName()}>Timezone</div>
                  <input
                    value={s(form.timezone)}
                    onChange={(e) => onSetBusinessField("timezone", e.target.value)}
                    className={fieldClassName()}
                    placeholder="Asia/Baku"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <div className={labelClassName()}>Primary language</div>
                  <select
                    value={s(form.language || "az")}
                    onChange={(e) => onSetBusinessField("language", e.target.value)}
                    className={fieldClassName()}
                  >
                    <option value="az">Azerbaijani</option>
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <div className={labelClassName()}>Short business summary</div>
                <textarea
                  value={s(form.description)}
                  onChange={(e) => onSetBusinessField("description", e.target.value)}
                  className={textAreaClassName("min-h-[148px]")}
                  placeholder="Short business summary"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <FileText className="h-4 w-4" />
                Structured knowledge
              </div>

              <div className="space-y-5">
                <div>
                  <SectionHeader
                    title="Services"
                    count={serviceCount}
                    hint="Name | Description"
                  />
                  <textarea
                    value={sections.servicesText}
                    onChange={(e) => onSetManualSection?.("servicesText", e.target.value)}
                    className={textAreaClassName("min-h-[110px]")}
                    placeholder="Hair coloring | Professional coloring service&#10;Haircut | Men's and women's haircut"
                  />
                </div>

                <div>
                  <SectionHeader
                    title="FAQ"
                    count={faqCount}
                    hint="Question | Answer"
                  />
                  <textarea
                    value={sections.faqsText}
                    onChange={(e) => onSetManualSection?.("faqsText", e.target.value)}
                    className={textAreaClassName("min-h-[110px]")}
                    placeholder="Do you accept walk-ins? | Yes, based on availability"
                  />
                </div>

                <div>
                  <SectionHeader
                    title="Policies"
                    count={policyCount}
                    hint="Title | Description"
                  />
                  <textarea
                    value={sections.policiesText}
                    onChange={(e) => onSetManualSection?.("policiesText", e.target.value)}
                    className={textAreaClassName("min-h-[110px]")}
                    placeholder="Cancellation policy | Please notify us 24 hours in advance"
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="min-w-0 space-y-6">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
              <TinyLabel>
                <BadgeCheck className="h-3.5 w-3.5" />
                extracted snapshot
              </TinyLabel>

              <div className="mt-5 space-y-3">
                {rows.length ? (
                  rows.map((item, index) => (
                    <SnapshotRow
                      key={`${item.label}-${index}`}
                      label={item.label}
                      value={item.value}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                    Extracted snapshot hələ görünmür.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,.05)]">
              <div className="mb-3 text-sm font-semibold text-slate-900">
                Current key facts
              </div>

              {keyFacts.length ? (
                <div className="space-y-3">
                  {keyFacts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                      >
                        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500">
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            {item.label}
                          </div>
                          <div className="mt-1 break-words text-sm text-slate-700">
                            {item.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                  Əsas kontakt məlumatları hələ doldurulmayıb.
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/90 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
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

      <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-white/92 px-5 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Confirm edəndə business twin canonical layer-ə yazılacaq.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingBusiness}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
            >
              Close
            </button>

            <button
              type="submit"
              form={FORM_ID}
              disabled={savingBusiness}
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {savingBusiness ? "Finalizing..." : "Confirm business twin"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}