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
          provenance: "",
        };
      }

      const x = obj(item);
      return {
        label: s(x.label || x.key || x.title),
        value: s(x.value || x.text || x.description),
        provenance: s(x.provenance),
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

function inputClassName(needsReview = false) {
  return [
    "h-12 w-full max-w-full rounded-[20px] border bg-white/80 px-4 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400",
    needsReview
      ? "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] focus:border-amber-300"
      : "border-slate-200/80 focus:border-slate-300",
  ].join(" ");
}

function textAreaClassName(minHeightClass = "min-h-[120px]", needsReview = false) {
  return [
    minHeightClass,
    "block w-full max-w-full resize-none rounded-[22px] border px-4 py-3.5 text-[14px] leading-7 text-slate-950 outline-none transition placeholder:text-slate-400",
    needsReview
      ? "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] focus:border-amber-300"
      : "border-slate-200/80 bg-white/80 focus:border-slate-300",
  ].join(" ");
}

function needsReview(value = "") {
  return !s(value);
}

function CanvasChip({ icon: Icon, children, tone = "default" }) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200/90 bg-amber-50/90 text-amber-700"
      : tone === "success"
        ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-700"
        : tone === "danger"
          ? "border-rose-200/90 bg-rose-50/90 text-rose-700"
          : "border-slate-200/90 bg-white/76 text-slate-600";

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClass}`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-slate-600">
      <span className="font-semibold text-slate-900">{value}</span> {label}
    </div>
  );
}

function SectionDivider({ title, subtitle = "" }) {
  return (
    <div className="border-t border-slate-200/80 pt-8">
      <div className="max-w-[720px]">
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

function FieldHeader({ label, needsAttention = false, hint = "" }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      {needsAttention ? (
        <div className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700">
          Needs review
        </div>
      ) : hint ? (
        <div className="text-[11px] text-slate-400">{hint}</div>
      ) : null}
    </div>
  );
}

function SnapshotLine({ label, value, provenance = "" }) {
  return (
    <div className="grid gap-2 border-b border-slate-200/70 py-3 last:border-b-0 md:grid-cols-[160px_minmax(0,1fr)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="min-w-0">
        <div className="break-words text-sm leading-7 text-slate-700">{value || "-"}</div>
        {provenance ? (
          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">
            {provenance}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SourceLine({ label, url, role }) {
  return (
    <div className="border-b border-slate-200/70 py-3 last:border-b-0">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium text-slate-900">{label || "Source"}</div>
        {role ? <CanvasChip tone="success">{role}</CanvasChip> : null}
      </div>
      {url ? (
        <div className="mt-1 break-all text-sm text-slate-500">{url}</div>
      ) : null}
    </div>
  );
}

function FormatHint({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200/70 py-3 last:border-b-0">
      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-500">{value}</div>
      </div>
    </div>
  );
}

function sourceRoleLabel(source = {}) {
  const role = s(source?.role).toLowerCase();
  if (source?.isPrimary || role === "primary") return "Primary";
  if (source?.isSupporting || role === "supporting") return "Supporting";
  return "";
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
  reviewSources = [],
}) {
  const rows = normalizeRows(discoveryProfileRows);
  const form = obj(businessForm);
  const draft = obj(reviewDraft);
  const overview = obj(draft.overview);
  const completeness = obj(draft.completeness);

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
      overview.description
  );

  const warnings = arr(draft.warnings)
    .map((item) => s(item))
    .filter(Boolean);

  const reviewFlags = arr(draft.reviewFlags)
    .map((item) => s(item))
    .filter(Boolean);

  const sources = arr(reviewSources)
    .map((item) => ({
      label: s(item?.label || item?.sourceType || item?.url),
      url: s(item?.url),
      role: sourceRoleLabel(item),
    }))
    .filter((item) => item.label || item.url)
    .slice(0, 6);

  const completenessItems = [
    s(completeness.filledFields || completeness.filled),
    s(completeness.missingFields || completeness.missing),
    s(completeness.label || completeness.status),
  ].filter(Boolean);

  const attentionCount = [
    needsReview(form.companyName),
    needsReview(form.websiteUrl),
    needsReview(form.primaryPhone),
    needsReview(form.primaryEmail),
    needsReview(form.primaryAddress),
    needsReview(form.description),
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 14, scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex w-full max-w-[1180px] flex-col overflow-hidden rounded-[34px] border border-slate-200/90 bg-[linear-gradient(180deg,#fbfbfb_0%,#f4f4f5_100%)] shadow-[0_32px_90px_rgba(15,23,42,.16)] max-h-[calc(100vh-1rem)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_circle_at_top_left,rgba(255,255,255,0.88),transparent_38%),radial-gradient(720px_circle_at_100%_0%,rgba(226,232,240,0.36),transparent_34%)]" />

      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-[rgba(250,250,250,0.88)] px-6 py-5 backdrop-blur-[18px] sm:px-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 max-w-[820px]">
            <div className="flex flex-wrap items-center gap-2">
              <CanvasChip icon={Brain}>Business twin review</CanvasChip>
              <CanvasChip icon={BadgeCheck} tone="success">
                Current review draft
              </CanvasChip>
              {attentionCount > 0 ? (
                <CanvasChip icon={AlertTriangle} tone="warn">
                  {attentionCount} field{attentionCount === 1 ? "" : "s"} need review
                </CanvasChip>
              ) : null}
            </div>

            <h2 className="mt-4 text-[27px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[34px]">
              Shape one clean business twin before it becomes canonical.
            </h2>

            <p className="mt-3 max-w-[760px] text-sm leading-7 text-slate-500">
              Review the extracted identity, strengthen weak fields, and finalize one continuous
              business layer instead of editing isolated fragments.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <StatPill label="services" value={serviceCount} />
              <StatPill label="faq lines" value={faqCount} />
              <StatPill label="policy lines" value={policyCount} />
              <StatPill label="warnings" value={warnings.length} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={savingBusiness}
            aria-label="Close"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white/86 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div className="grid gap-0 px-6 py-6 sm:px-7 xl:grid-cols-[minmax(0,1.28fr)_340px]">
          <form id={FORM_ID} onSubmit={onSaveBusiness} className="min-w-0 pr-0 xl:pr-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="max-w-[760px]">
                  <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Overview
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">
                    {quickSummary ||
                      "This review draft is ready for manual confirmation. Fill any weak identity fields before finalizing."}
                  </div>
                </div>

                {(reviewFlags.length || warnings.length || sources.length) ? (
                  <div className="flex flex-wrap gap-2">
                    {reviewFlags.map((item, index) => (
                      <CanvasChip key={`${item}-${index}`} icon={AlertTriangle} tone="warn">
                        {item}
                      </CanvasChip>
                    ))}
                    {warnings.slice(0, 2).map((item, index) => (
                      <CanvasChip key={`${item}-${index}`} icon={Info} tone="danger">
                        {item}
                      </CanvasChip>
                    ))}
                    {sources.slice(0, 2).map((item, index) => (
                      <CanvasChip key={`${item.label}-${index}`} icon={Globe2}>
                        {item.label}
                      </CanvasChip>
                    ))}
                  </div>
                ) : null}
              </div>

              <SectionDivider
                title="Core identity"
                subtitle="Make the essentials feel credible and publishable. Empty fields are surfaced with a softer review treatment instead of separate warning cards."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <FieldHeader label="Company name" needsAttention={needsReview(form.companyName)} />
                  <input
                    value={s(form.companyName)}
                    onChange={(e) => onSetBusinessField?.("companyName", e.target.value)}
                    className={inputClassName(needsReview(form.companyName))}
                    placeholder="SaytPro"
                    autoComplete="off"
                  />
                </div>

                <div className="min-w-0">
                  <FieldHeader label="Website" needsAttention={needsReview(form.websiteUrl)} />
                  <input
                    value={s(form.websiteUrl)}
                    onChange={(e) => onSetBusinessField?.("websiteUrl", e.target.value)}
                    className={inputClassName(needsReview(form.websiteUrl))}
                    placeholder="https://yourbusiness.com"
                    autoComplete="off"
                  />
                </div>

                <div className="min-w-0">
                  <FieldHeader label="Primary phone" needsAttention={needsReview(form.primaryPhone)} />
                  <input
                    value={s(form.primaryPhone)}
                    onChange={(e) => onSetBusinessField?.("primaryPhone", e.target.value)}
                    className={inputClassName(needsReview(form.primaryPhone))}
                    placeholder="+994 50 123 45 67"
                    autoComplete="off"
                  />
                </div>

                <div className="min-w-0">
                  <FieldHeader label="Primary email" needsAttention={needsReview(form.primaryEmail)} />
                  <input
                    value={s(form.primaryEmail)}
                    onChange={(e) => onSetBusinessField?.("primaryEmail", e.target.value)}
                    className={inputClassName(needsReview(form.primaryEmail))}
                    placeholder="hello@yourbusiness.com"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <FieldHeader label="Primary address" needsAttention={needsReview(form.primaryAddress)} />
                <input
                  value={s(form.primaryAddress)}
                  onChange={(e) => onSetBusinessField?.("primaryAddress", e.target.value)}
                  className={inputClassName(needsReview(form.primaryAddress))}
                  placeholder="Baku, Azerbaijan"
                  autoComplete="off"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <FieldHeader label="Timezone" hint="Region context" />
                  <input
                    value={s(form.timezone)}
                    onChange={(e) => onSetBusinessField?.("timezone", e.target.value)}
                    className={inputClassName()}
                    placeholder="Asia/Baku"
                    autoComplete="off"
                  />
                </div>

                <div className="min-w-0">
                  <FieldHeader label="Primary language" hint="Runtime default" />
                  <select
                    value={s(form.language || "az")}
                    onChange={(e) => onSetBusinessField?.("language", e.target.value)}
                    className={inputClassName()}
                  >
                    <option value="az">Azerbaijani</option>
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
              </div>

              <div className="min-w-0">
                <FieldHeader
                  label="Business summary"
                  needsAttention={needsReview(form.description)}
                  hint="What the business does and why it matters"
                />
                <textarea
                  value={s(form.description)}
                  onChange={(e) => onSetBusinessField?.("description", e.target.value)}
                  className={textAreaClassName("min-h-[172px]", needsReview(form.description))}
                  placeholder="We help businesses build and automate their digital presence."
                />
              </div>

              <SectionDivider
                title="Structured operating layer"
                subtitle="Keep this as clean working memory. Use compact, operator-friendly formatting instead of long prose."
              />

              <div className="space-y-6">
                <div className="min-w-0">
                  <FieldHeader label="Services" hint={`${serviceCount} line${serviceCount === 1 ? "" : "s"}`} />
                  <textarea
                    value={sections.servicesText}
                    onChange={(e) => onSetManualSection?.("servicesText", e.target.value)}
                    className={textAreaClassName("min-h-[126px]", !serviceCount)}
                    placeholder={"Website design | Launch-ready business site\nAutomation setup | CRM, lead capture, and follow-up flows"}
                  />
                </div>

                <div className="min-w-0">
                  <FieldHeader label="FAQ" hint={`${faqCount} line${faqCount === 1 ? "" : "s"}`} />
                  <textarea
                    value={sections.faqsText}
                    onChange={(e) => onSetManualSection?.("faqsText", e.target.value)}
                    className={textAreaClassName("min-h-[126px]", !faqCount)}
                    placeholder={"How long does a website launch take? | Usually 2-4 weeks depending on scope\nDo you manage ongoing updates? | Yes, through monthly support retainers"}
                  />
                </div>

                <div className="min-w-0">
                  <FieldHeader label="Policies and notes" hint={`${policyCount} line${policyCount === 1 ? "" : "s"}`} />
                  <textarea
                    value={sections.policiesText}
                    onChange={(e) => onSetManualSection?.("policiesText", e.target.value)}
                    className={textAreaClassName("min-h-[126px]", !policyCount)}
                    placeholder={"Payment terms | 50% upfront, 50% before launch\nSupport window | Client requests answered on business days"}
                  />
                </div>
              </div>
            </div>
          </form>

          <aside className="min-w-0 border-t border-slate-200/80 pt-8 xl:border-l xl:border-t-0 xl:pl-10 xl:pt-0">
            <div className="space-y-8">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Review signals
                </div>
                <div className="mt-4 space-y-3">
                  {reviewFlags.length ? (
                    <div className="space-y-2">
                      {reviewFlags.map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="rounded-[18px] border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {warnings.length ? (
                    <div className="space-y-2">
                      {warnings.slice(0, 6).map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="rounded-[18px] border border-slate-200/80 bg-white/72 px-4 py-3 text-sm leading-6 text-slate-600"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {completenessItems.length ? (
                    <div className="flex flex-wrap gap-2">
                      {completenessItems.map((item, index) => (
                        <CanvasChip key={`${item}-${index}`}>{item}</CanvasChip>
                      ))}
                    </div>
                  ) : null}

                  {!reviewFlags.length && !warnings.length && !completenessItems.length ? (
                    <div className="text-sm leading-7 text-slate-500">
                      No special review signals are active on this draft.
                    </div>
                  ) : null}
                </div>
              </div>

              <SectionDivider title="Participating sources" subtitle="Visible context shaping this review session." />
              <div className="space-y-1">
                {sources.length ? (
                  sources.map((item, index) => (
                    <SourceLine
                      key={`${item.label}-${item.url}-${index}`}
                      label={item.label}
                      url={item.url}
                      role={item.role}
                    />
                  ))
                ) : (
                  <div className="text-sm leading-7 text-slate-500">
                    No participating sources are visible yet.
                  </div>
                )}
              </div>

              <SectionDivider title="Extracted snapshot" subtitle="What the review session currently believes about the business." />
              <div className="space-y-1">
                {rows.length ? (
                  rows.slice(0, 8).map((item, index) => (
                    <SnapshotLine
                      key={`${item.label}-${index}`}
                      label={item.label}
                      value={item.value}
                      provenance={item.provenance}
                    />
                  ))
                ) : (
                  <div className="text-sm leading-7 text-slate-500">
                    No extracted snapshot is visible yet.
                  </div>
                )}
              </div>

              <SectionDivider title="Formatting guide" subtitle="Keep manual structure compact and runtime-friendly." />
              <div className="space-y-1">
                <FormatHint icon={FileText} title="Services" value="Name | Description" />
                <FormatHint icon={Sparkles} title="FAQ" value="Question | Answer" />
                <FormatHint icon={BadgeCheck} title="Policies" value="Title | Description" />
                <FormatHint icon={Globe2} title="Business summary" value="One clean description, not marketing fragments." />
                <FormatHint icon={Phone} title="Phone" value="+994 50 123 45 67" />
                <FormatHint icon={Mail} title="Email" value="hello@yourbusiness.com" />
                <FormatHint icon={MapPin} title="Address" value="Baku, Azerbaijan" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-[rgba(250,250,250,0.9)] px-6 py-4 backdrop-blur-[18px] sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[680px] text-sm leading-7 text-slate-500">
            Finalizing will write this reviewed draft into the canonical business layer using the
            current save flow.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingBusiness}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200/90 bg-white/86 px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
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
