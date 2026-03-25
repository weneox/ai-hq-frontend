import { motion } from "framer-motion";
import {
  AlertTriangle,
  BadgeCheck,
  Brain,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  X,
} from "lucide-react";

import { humanizeStudioIssue } from "../logic/helpers.js";

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
    .filter((item) => item.label || item.value || item.provenance);
}

function countLogicalLines(value = "") {
  return s(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function needsReview(value = "") {
  return !s(value);
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function fieldClassName({ multiline = false, needsAttention = false } = {}) {
  return cx(
    multiline ? "min-h-[132px] resize-none py-3.5" : "h-12",
    "w-full rounded-[20px] border px-4 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400",
    needsAttention
      ? "border-amber-200 bg-amber-50/70 focus:border-amber-300"
      : "border-slate-200 bg-white/88 focus:border-slate-300"
  );
}

function Chip({ icon: Icon, tone = "default", children }) {
  const toneClass =
    tone === "warn"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-slate-200 bg-white/80 text-slate-600";

  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]",
        toneClass
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-full border border-slate-200 bg-white/78 px-3 py-1.5 text-[11px] font-medium text-slate-600">
      <span className="font-semibold text-slate-950">{value}</span> {label}
    </div>
  );
}

function SectionHeader({ title, body = "" }) {
  return (
    <div className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </div>
      {body ? (
        <div className="mt-2 max-w-[720px] text-sm leading-7 text-slate-500">
          {body}
        </div>
      ) : null}
    </div>
  );
}

function FieldLabel({ label, needsAttention = false, hint = "" }) {
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

function SnapshotRow({ label, value, provenance = "" }) {
  return (
    <div className="grid gap-2 border-t border-slate-200 py-3 first:border-t-0 first:pt-0 md:grid-cols-[180px_minmax(0,1fr)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="min-w-0">
        <div className="break-words text-sm leading-7 text-slate-700">
          {value || "-"}
        </div>
        {provenance ? (
          <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-400">
            {provenance}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EvidenceItem({ label, url = "", role = "" }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white/76 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium text-slate-900">{label || "Source"}</div>
        {role ? <Chip tone="success">{role}</Chip> : null}
      </div>
      {url ? (
        <div className="mt-1 break-all text-sm text-slate-500">{url}</div>
      ) : null}
    </div>
  );
}

function GuideRow({ icon: Icon, title, value }) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-white/76 px-4 py-3">
      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-900">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-500">{value}</div>
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
  const form = obj(businessForm);
  const draft = obj(reviewDraft);
  const overview = obj(draft.overview);
  const completeness = obj(draft.completeness);
  const rows = normalizeRows(discoveryProfileRows).slice(0, 8);

  const sections = {
    servicesText: s(manualSections?.servicesText),
    faqsText: s(manualSections?.faqsText),
    policiesText: s(manualSections?.policiesText),
  };

  const quickSummary = s(
    draft.quickSummary ||
      overview.summaryShort ||
      overview.companySummaryShort ||
      overview.description
  );

  const reviewFlags = arr(draft.reviewFlags)
    .map((item) => humanizeStudioIssue(item))
    .filter(Boolean);
  const warnings = arr(draft.warnings)
    .map((item) => humanizeStudioIssue(item))
    .filter(Boolean);

  const sources = arr(reviewSources)
    .map((item) => ({
      label: s(item?.label || item?.sourceType || item?.url),
      url: s(item?.url),
      role: sourceRoleLabel(item),
    }))
    .filter((item) => item.label || item.url);

  const serviceCount = countLogicalLines(sections.servicesText);
  const faqCount = countLogicalLines(sections.faqsText);
  const policyCount = countLogicalLines(sections.policiesText);
  const attentionCount = [
    needsReview(form.companyName),
    needsReview(form.websiteUrl),
    needsReview(form.primaryPhone),
    needsReview(form.primaryEmail),
    needsReview(form.primaryAddress),
    needsReview(form.description),
  ].filter(Boolean).length;

  const completenessItems = [
    s(completeness.label || completeness.status),
    s(completeness.filledFields || completeness.filled),
    s(completeness.missingFields || completeness.missing),
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex max-h-[calc(100vh-1rem)] w-full max-w-[1120px] flex-col overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#fbfbfb_0%,#f4f4f5_100%)] shadow-[0_32px_90px_rgba(15,23,42,.16)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_circle_at_top_left,rgba(255,255,255,0.88),transparent_40%),radial-gradient(620px_circle_at_top_right,rgba(226,232,240,0.34),transparent_34%)]" />

      <div className="relative z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-[rgba(250,250,250,0.88)] px-6 py-5 backdrop-blur-[16px] sm:px-7">
        <div className="min-w-0 max-w-[800px]">
          <div className="flex flex-wrap items-center gap-2">
            <Chip icon={Brain}>Business twin review</Chip>
            <Chip icon={BadgeCheck} tone="success">
              Temporary review draft
            </Chip>
            {attentionCount > 0 ? (
              <Chip icon={AlertTriangle} tone="warn">
                {attentionCount} field{attentionCount === 1 ? "" : "s"} need review
              </Chip>
            ) : null}
          </div>

          <h2 className="mt-4 text-[28px] font-semibold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-[36px]">
            Confirm one clean business twin before it becomes canonical.
          </h2>

          <p className="mt-3 max-w-[760px] text-sm leading-7 text-slate-500">
            The observed source evidence stays separate below. The fields in this
            draft are the only values that will be finalized.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Metric label="services" value={serviceCount} />
            <Metric label="faq lines" value={faqCount} />
            <Metric label="policy lines" value={policyCount} />
            <Metric label="warnings" value={warnings.length} />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={savingBusiness}
          aria-label="Close"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/86 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <form
          id={FORM_ID}
          onSubmit={onSaveBusiness}
          className="mx-auto flex w-full max-w-[980px] min-w-0 flex-col gap-8 px-6 py-6 sm:px-7"
        >
          <div className="space-y-4">
            <div className="text-sm leading-7 text-slate-600">
              {quickSummary ||
                "This temporary review draft is ready for confirmation. Strengthen weak identity fields before finalizing."}
            </div>

            {(reviewFlags.length || warnings.length || completenessItems.length) ? (
              <div className="flex flex-wrap gap-2">
                {reviewFlags.map((item, index) => (
                  <Chip key={`${item}-${index}`} icon={AlertTriangle} tone="warn">
                    {item}
                  </Chip>
                ))}
                {warnings.slice(0, 3).map((item, index) => (
                  <Chip key={`${item}-${index}`}>{item}</Chip>
                ))}
                {completenessItems.map((item, index) => (
                  <Chip key={`${item}-${index}`}>{item}</Chip>
                ))}
              </div>
            ) : null}
          </div>

          <SectionHeader
            title="Core identity"
            body="Keep the business identity clean and specific. Empty or weak fields stay visibly reviewable instead of being filled with source labels or generic placeholders."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel label="Company name" needsAttention={needsReview(form.companyName)} />
              <input
                value={s(form.companyName)}
                onChange={(e) => onSetBusinessField?.("companyName", e.target.value)}
                className={fieldClassName({ needsAttention: needsReview(form.companyName) })}
                placeholder="SaytPro"
                autoComplete="off"
              />
            </div>

            <div className="min-w-0">
              <FieldLabel label="Website" needsAttention={needsReview(form.websiteUrl)} />
              <input
                value={s(form.websiteUrl)}
                onChange={(e) => onSetBusinessField?.("websiteUrl", e.target.value)}
                className={fieldClassName({ needsAttention: needsReview(form.websiteUrl) })}
                placeholder="https://yourbusiness.com"
                autoComplete="off"
              />
            </div>

            <div className="min-w-0">
              <FieldLabel label="Primary phone" needsAttention={needsReview(form.primaryPhone)} />
              <input
                value={s(form.primaryPhone)}
                onChange={(e) => onSetBusinessField?.("primaryPhone", e.target.value)}
                className={fieldClassName({ needsAttention: needsReview(form.primaryPhone) })}
                placeholder="+994 50 123 45 67"
                autoComplete="off"
              />
            </div>

            <div className="min-w-0">
              <FieldLabel label="Primary email" needsAttention={needsReview(form.primaryEmail)} />
              <input
                value={s(form.primaryEmail)}
                onChange={(e) => onSetBusinessField?.("primaryEmail", e.target.value)}
                className={fieldClassName({ needsAttention: needsReview(form.primaryEmail) })}
                placeholder="hello@yourbusiness.com"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel label="Primary address" needsAttention={needsReview(form.primaryAddress)} />
            <input
              value={s(form.primaryAddress)}
              onChange={(e) => onSetBusinessField?.("primaryAddress", e.target.value)}
              className={fieldClassName({ needsAttention: needsReview(form.primaryAddress) })}
              placeholder="Baku, Azerbaijan"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="min-w-0">
              <FieldLabel label="Timezone" hint="Region context" />
              <input
                value={s(form.timezone)}
                onChange={(e) => onSetBusinessField?.("timezone", e.target.value)}
                className={fieldClassName()}
                placeholder="Asia/Baku"
                autoComplete="off"
              />
            </div>

            <div className="min-w-0">
              <FieldLabel label="Primary language" hint="Runtime default" />
              <select
                value={s(form.language || "en")}
                onChange={(e) => onSetBusinessField?.("language", e.target.value)}
                className={fieldClassName()}
              >
                <option value="en">English</option>
                <option value="az">Azerbaijani</option>
                <option value="tr">Turkish</option>
                <option value="ru">Russian</option>
              </select>
            </div>
          </div>

          <div className="min-w-0">
            <FieldLabel
              label="Business summary"
              needsAttention={needsReview(form.description)}
              hint="What the business does and why it matters"
            />
            <textarea
              value={s(form.description)}
              onChange={(e) => onSetBusinessField?.("description", e.target.value)}
              className={fieldClassName({
                multiline: true,
                needsAttention: needsReview(form.description),
              })}
              placeholder="We help businesses build and automate their digital presence."
            />
          </div>

          <SectionHeader
            title="Operating layer"
            body="Keep this draft compact and editable. The goal is a believable working twin, not a noisy import dump."
          />

          <div className="space-y-5">
            <div className="min-w-0">
              <FieldLabel label="Services" hint={`${serviceCount} line${serviceCount === 1 ? "" : "s"}`} />
              <textarea
                value={sections.servicesText}
                onChange={(e) => onSetManualSection?.("servicesText", e.target.value)}
                className={fieldClassName({
                  multiline: true,
                  needsAttention: !serviceCount,
                })}
                placeholder={"Website design | Launch-ready business site\nAutomation setup | CRM, lead capture, and follow-up flows"}
              />
            </div>

            <div className="min-w-0">
              <FieldLabel label="FAQ" hint={`${faqCount} line${faqCount === 1 ? "" : "s"}`} />
              <textarea
                value={sections.faqsText}
                onChange={(e) => onSetManualSection?.("faqsText", e.target.value)}
                className={fieldClassName({
                  multiline: true,
                  needsAttention: !faqCount,
                })}
                placeholder={"How long does a website launch take? | Usually 2-4 weeks depending on scope\nDo you manage ongoing updates? | Yes, through monthly support retainers"}
              />
            </div>

            <div className="min-w-0">
              <FieldLabel
                label="Policies and notes"
                hint={`${policyCount} line${policyCount === 1 ? "" : "s"}`}
              />
              <textarea
                value={sections.policiesText}
                onChange={(e) => onSetManualSection?.("policiesText", e.target.value)}
                className={fieldClassName({
                  multiline: true,
                  needsAttention: !policyCount,
                })}
                placeholder={"Payment terms | 50% upfront, 50% before launch\nSupport window | Client requests answered on business days"}
              />
            </div>
          </div>

          {(sources.length || rows.length || reviewFlags.length || warnings.length) ? (
            <>
              <SectionHeader
                title="Supporting evidence"
                body="Observed source data stays separate from the editable draft. Use it as evidence, not as canonical truth."
              />

              {sources.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {sources.slice(0, 6).map((item, index) => (
                    <EvidenceItem
                      key={`${item.label}-${item.url}-${index}`}
                      label={item.label}
                      url={item.url}
                      role={item.role}
                    />
                  ))}
                </div>
              ) : null}

              {rows.length ? (
                <div className="rounded-[24px] border border-slate-200 bg-white/78 px-5 py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Observed snapshot
                  </div>
                  <div className="mt-4 space-y-1">
                    {rows.map((item, index) => (
                      <SnapshotRow
                        key={`${item.label}-${index}`}
                        label={item.label}
                        value={item.value}
                        provenance={item.provenance}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <SectionHeader
            title="Formatting guide"
            body="Use short structured lines that stay readable for both people and runtime systems."
          />

          <div className="grid gap-3 lg:grid-cols-2">
            <GuideRow icon={FileText} title="Services" value="Name | Description" />
            <GuideRow icon={Sparkles} title="FAQ" value="Question | Answer" />
            <GuideRow icon={BadgeCheck} title="Policies" value="Title | Description" />
            <GuideRow icon={Globe2} title="Summary" value="One clean business summary, not navigation labels or fragments." />
            <GuideRow icon={Phone} title="Phone" value="+994 50 123 45 67" />
            <GuideRow icon={Mail} title="Email" value="hello@yourbusiness.com" />
            <GuideRow icon={MapPin} title="Address" value="Baku, Azerbaijan" />
          </div>
        </form>
      </div>

      <div className="relative z-10 border-t border-slate-200 bg-[rgba(250,250,250,0.9)] px-6 py-4 backdrop-blur-[16px] sm:px-7">
        <div className="mx-auto flex w-full max-w-[980px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-[720px] text-sm leading-7 text-slate-500">
            Confirming will finalize only this reviewed draft into canonical business truth using the existing save flow.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingBusiness}
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white/86 px-5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
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
