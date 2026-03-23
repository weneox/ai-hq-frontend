import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Brain,
  FileText,
  Globe2,
  Info,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  X,
} from "lucide-react";

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

function countLogicalLines(value = "") {
  return s(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function inputClassName() {
  return "h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300";
}

function textAreaClassName(minHeightClass = "min-h-[120px]") {
  return `${minHeightClass} w-full resize-none rounded-[22px] border border-slate-200 bg-white px-4 py-3.5 text-[14px] leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300`;
}

function labelClassName() {
  return "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";
}

function MicroLabel({ icon: Icon, children, tone = "default" }) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] ${toneClass}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}

function Section({ title, children, className = "", right = null }) {
  return (
    <section
      className={`rounded-[24px] border border-slate-200 bg-white ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5">
        <div className="text-sm font-semibold text-slate-950">{title}</div>
        {right}
      </div>

      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

function SnapshotRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="mt-1.5 break-words text-sm leading-6 text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

function KeyFactRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </div>
        <div className="mt-1 break-words text-sm leading-6 text-slate-700">
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, hint }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="text-[11px] text-slate-400">
        {count} line{count === 1 ? "" : "s"}
        {hint ? ` · ${hint}` : ""}
      </div>
    </div>
  );
}

function EmptySectionHint({ text }) {
  return <div className="mt-2 text-xs leading-6 text-slate-400">{text}</div>;
}

function FormatRow({ icon: Icon, title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <div className="flex items-center gap-2 text-slate-900">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="mt-1.5 text-sm text-slate-600">{value}</div>
    </div>
  );
}

function TonePill({ children, tone = "default" }) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "danger"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div
      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${toneClass}`}
    >
      {children}
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
  reviewDraft,
}) {
  const rows = normalizeRows(discoveryProfileRows);
  const form = obj(businessForm);
  const draft = obj(reviewDraft);
  const overview = obj(draft.overview);

  const sections = {
    servicesText: s(manualSections?.servicesText),
    faqsText: s(manualSections?.faqsText),
    policiesText: s(manualSections?.policiesText),
  };

  const serviceCount = countLogicalLines(sections.servicesText);
  const faqCount = countLogicalLines(sections.faqsText);
  const policyCount = countLogicalLines(sections.policiesText);

  const quickSummary = s(
    draft.quickSummary ||
      overview.summaryShort ||
      overview.companySummaryShort ||
      form.description
  );

  const sourceLabel = s(draft.sourceLabel || draft.sourceType || "Draft");
  const sourceUrl = s(draft.sourceUrl || overview.websiteUrl || form.websiteUrl);

  const warnings = arr(draft.warnings)
    .map((item) => s(item))
    .filter(Boolean);

  const reviewFlags = arr(draft.reviewFlags)
    .map((item) => s(item))
    .filter(Boolean);

  const keyFacts = [
    {
      icon: Globe2,
      label: "Website",
      value: s(form.websiteUrl || overview.websiteUrl),
    },
    {
      icon: Phone,
      label: "Phone",
      value: s(form.primaryPhone || overview.primaryPhone),
    },
    {
      icon: Mail,
      label: "Email",
      value: s(form.primaryEmail || overview.primaryEmail),
    },
    {
      icon: MapPin,
      label: "Address",
      value: s(form.primaryAddress || overview.primaryAddress),
    },
  ].filter((item) => item.value);

  const metaStats = [
    {
      label: "Services",
      value: String(
        Math.max(serviceCount, arr(draft.sections?.services).length, 0)
      ),
    },
    {
      label: "Knowledge",
      value: String(Number(draft.stats?.knowledgeCount || 0)),
    },
    {
      label: "Warnings",
      value: String(warnings.length),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex w-full max-w-[1120px] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[#f6f6f7] shadow-[0_24px_60px_rgba(15,23,42,.14)] max-h-[calc(100vh-1rem)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#f6f6f7] px-5 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 max-w-[760px]">
            <div className="flex flex-wrap items-center gap-2">
              <MicroLabel icon={Brain}>Refine draft</MicroLabel>

              {sourceLabel ? (
                <MicroLabel icon={BadgeCheck} tone="success">
                  {sourceLabel}
                </MicroLabel>
              ) : null}

              {reviewFlags.length ? (
                <MicroLabel icon={AlertTriangle} tone="warn">
                  Review needed
                </MicroLabel>
              ) : null}
            </div>

            <h2 className="mt-4 text-[24px] font-semibold leading-[1.04] tracking-[-0.04em] text-slate-950 sm:text-[30px]">
              Review and confirm the business draft
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              Clean the core identity, keep only the structured details that matter,
              then confirm the final business twin.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={savingBusiness}
            aria-label="Close"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-5 px-5 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <form
            id={FORM_ID}
            onSubmit={onSaveBusiness}
            className="min-w-0 space-y-5"
          >
            <Section
              title="Core business identity"
              right={
                <div className="flex flex-wrap gap-2">
                  {metaStats.map((item) => (
                    <TonePill key={item.label}>
                      {item.label}: {item.value}
                    </TonePill>
                  ))}
                </div>
              }
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClassName()}>Company name</label>
                  <input
                    value={s(form.companyName)}
                    onChange={(e) =>
                      onSetBusinessField?.("companyName", e.target.value)
                    }
                    className={inputClassName()}
                    placeholder="Company name"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className={labelClassName()}>Website</label>
                  <input
                    value={s(form.websiteUrl)}
                    onChange={(e) =>
                      onSetBusinessField?.("websiteUrl", e.target.value)
                    }
                    className={inputClassName()}
                    placeholder="yourbusiness.com"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClassName()}>Primary phone</label>
                  <input
                    value={s(form.primaryPhone)}
                    onChange={(e) =>
                      onSetBusinessField?.("primaryPhone", e.target.value)
                    }
                    className={inputClassName()}
                    placeholder="+994 ..."
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className={labelClassName()}>Primary email</label>
                  <input
                    value={s(form.primaryEmail)}
                    onChange={(e) =>
                      onSetBusinessField?.("primaryEmail", e.target.value)
                    }
                    className={inputClassName()}
                    placeholder="info@company.com"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClassName()}>Primary address</label>
                <input
                  value={s(form.primaryAddress)}
                  onChange={(e) =>
                    onSetBusinessField?.("primaryAddress", e.target.value)
                  }
                  className={inputClassName()}
                  placeholder="Primary address"
                  autoComplete="off"
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClassName()}>Timezone</label>
                  <input
                    value={s(form.timezone)}
                    onChange={(e) =>
                      onSetBusinessField?.("timezone", e.target.value)
                    }
                    className={inputClassName()}
                    placeholder="Asia/Baku"
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className={labelClassName()}>Primary language</label>
                  <select
                    value={s(form.language || "az")}
                    onChange={(e) =>
                      onSetBusinessField?.("language", e.target.value)
                    }
                    className={inputClassName()}
                  >
                    <option value="az">Azerbaijani</option>
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClassName()}>Business summary</label>
                <textarea
                  value={s(form.description)}
                  onChange={(e) =>
                    onSetBusinessField?.("description", e.target.value)
                  }
                  className={textAreaClassName("min-h-[150px]")}
                  placeholder="Describe what the business does and who it serves."
                />
              </div>
            </Section>

            <Section title="Structured knowledge">
              <div className="space-y-5">
                <div>
                  <SectionHeader
                    title="Services"
                    count={serviceCount}
                    hint="Name | Description"
                  />
                  <textarea
                    value={sections.servicesText}
                    onChange={(e) =>
                      onSetManualSection?.("servicesText", e.target.value)
                    }
                    className={textAreaClassName("min-h-[120px]")}
                    placeholder={
                      "Hair coloring | Premium color service\nConsultation | First visit consultation"
                    }
                  />
                  {serviceCount === 0 ? (
                    <EmptySectionHint text="Format: Name | Description" />
                  ) : null}
                </div>

                <div>
                  <SectionHeader
                    title="FAQ"
                    count={faqCount}
                    hint="Question | Answer"
                  />
                  <textarea
                    value={sections.faqsText}
                    onChange={(e) =>
                      onSetManualSection?.("faqsText", e.target.value)
                    }
                    className={textAreaClassName("min-h-[120px]")}
                    placeholder={
                      "Do you work on weekends? | Yes, Saturdays are open from 10:00 to 18:00"
                    }
                  />
                  {faqCount === 0 ? (
                    <EmptySectionHint text="Format: Question | Answer" />
                  ) : null}
                </div>

                <div>
                  <SectionHeader
                    title="Policies and notes"
                    count={policyCount}
                    hint="Title | Description"
                  />
                  <textarea
                    value={sections.policiesText}
                    onChange={(e) =>
                      onSetManualSection?.("policiesText", e.target.value)
                    }
                    className={textAreaClassName("min-h-[120px]")}
                    placeholder={
                      "Booking policy | Appointments should be confirmed in advance"
                    }
                  />
                  {policyCount === 0 ? (
                    <EmptySectionHint text="Format: Title | Description" />
                  ) : null}
                </div>
              </div>
            </Section>
          </form>

          <div className="min-w-0 space-y-5">
            <Section title="Draft overview">
              <div className="space-y-3">
                {quickSummary ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Summary
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-700">
                      {quickSummary}
                    </div>
                  </div>
                ) : null}

                {sourceUrl ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Source
                    </div>
                    <div className="mt-2 break-words text-sm leading-6 text-slate-700">
                      {sourceUrl}
                    </div>
                  </div>
                ) : null}

                {!quickSummary && !sourceUrl ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    The draft summary will appear here after analysis.
                  </div>
                ) : null}
              </div>
            </Section>

            {!!reviewFlags.length || !!warnings.length ? (
              <Section title="Review signals">
                <div className="space-y-3">
                  {reviewFlags.length ? (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Review flags
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {reviewFlags.map((item, index) => (
                          <TonePill key={`${item}-${index}`} tone="warn">
                            {item}
                          </TonePill>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {warnings.length ? (
                    <div>
                      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Warnings
                      </div>

                      <div className="space-y-2">
                        {warnings.slice(0, 6).map((item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-6 text-amber-800"
                          >
                            <Info className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}

            <Section title="Extracted snapshot">
              <div className="mb-4">
                <MicroLabel icon={BadgeCheck}>Snapshot</MicroLabel>
              </div>

              <div className="space-y-3">
                {rows.length ? (
                  rows.slice(0, 8).map((item, index) => (
                    <SnapshotRow
                      key={`${item.label}-${index}`}
                      label={item.label}
                      value={item.value}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                    No extracted snapshot is visible yet.
                  </div>
                )}
              </div>
            </Section>

            <Section title="Key facts">
              {keyFacts.length ? (
                <div className="space-y-3">
                  {keyFacts.map((item) => (
                    <KeyFactRow
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500">
                  Key contact fields are still empty.
                </div>
              )}
            </Section>

            <Section title="Input format">
              <div className="space-y-3">
                <FormatRow
                  icon={FileText}
                  title="Services"
                  value="Name | Description"
                />

                <FormatRow
                  icon={Sparkles}
                  title="FAQ"
                  value="Question | Answer"
                />

                <FormatRow
                  icon={BadgeCheck}
                  title="Policies"
                  value="Title | Description"
                />
              </div>
            </Section>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-[#f6f6f7] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Confirming will write this reviewed draft into the canonical business layer.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingBusiness}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
            >
              Close
            </button>

            <button
              type="submit"
              form={FORM_ID}
              disabled={savingBusiness}
              className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {savingBusiness ? "Finalizing..." : "Confirm business twin"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}