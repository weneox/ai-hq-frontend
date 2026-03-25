import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ChevronDown, X } from "lucide-react";

import {
  StageSection,
  TinyChip,
  TinyLabel,
} from "./SetupStudioUi.jsx";
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
    multiline ? "min-h-[120px] resize-none py-3.5" : "h-11",
    "w-full rounded-[16px] bg-white/84 px-4 text-[14px] text-slate-950 outline-none transition placeholder:text-slate-400",
    needsAttention ? "ring-1 ring-amber-200 focus:ring-amber-300" : "focus:ring-1 focus:ring-slate-300"
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  needsAttention = false,
}) {
  const Element = multiline ? "textarea" : "input";

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </div>
        {needsAttention ? <TinyChip tone="warn">Needs review</TinyChip> : null}
      </div>

      <Element
        value={s(value)}
        onChange={(e) => onChange?.(e.target.value)}
        className={fieldClassName({ multiline, needsAttention })}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}

function SnapshotRow({ label, value, provenance = "" }) {
  return (
    <div className="grid gap-2 border-t border-slate-200/80 py-3 first:border-t-0 first:pt-0 md:grid-cols-[160px_minmax(0,1fr)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="min-w-0">
        <div className="break-words text-sm leading-6 text-slate-700">
          {value || "Missing"}
        </div>
        {provenance ? (
          <div className="mt-1 text-[11px] text-slate-400">{provenance}</div>
        ) : null}
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

function SectionTitle({ label, title, body = "" }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-slate-950">
        {title}
      </div>
      {body ? (
        <div className="mt-2 max-w-[720px] text-sm leading-6 text-slate-500">
          {body}
        </div>
      ) : null}
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
  reviewSources = [],
}) {
  const form = obj(businessForm);
  const draft = obj(reviewDraft);
  const overview = obj(draft.overview);
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

  const issues = [
    ...arr(draft.reviewFlags).map((item) => humanizeStudioIssue(item)),
    ...arr(draft.warnings).map((item) => humanizeStudioIssue(item)),
  ]
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 6);

  const sources = arr(reviewSources)
    .map((item) => ({
      label: s(item?.label || item?.sourceType || item?.url),
      role: sourceRoleLabel(item),
    }))
    .filter((item) => item.label)
    .slice(0, 4);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative my-2 flex max-h-[calc(100vh-1rem)] w-full max-w-[1080px] flex-col overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,.94)_0%,rgba(246,247,249,.9)_100%)] shadow-[0_34px_90px_-40px_rgba(15,23,42,.42)] sm:my-4 sm:max-h-[calc(100vh-2rem)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(780px_circle_at_top_left,rgba(255,255,255,.94),transparent_42%),radial-gradient(620px_circle_at_bottom_right,rgba(226,232,240,.22),transparent_34%)]" />

      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-slate-200/80 px-5 py-4 backdrop-blur-[14px] sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TinyLabel>Review draft</TinyLabel>
            <TinyChip>Temporary</TinyChip>
            {attentionCount ? (
              <TinyChip tone="warn">
                {attentionCount} field{attentionCount === 1 ? "" : "s"} to check
              </TinyChip>
            ) : (
              <TinyChip tone="success">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Ready
              </TinyChip>
            )}
          </div>
          <div className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-slate-950">
            Confirm the reviewed business twin
          </div>
          {quickSummary ? (
            <div className="mt-1 text-sm leading-6 text-slate-500">
              {quickSummary}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={savingBusiness}
          aria-label="Close"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/86 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
        <form
          id={FORM_ID}
          onSubmit={onSaveBusiness}
          className="mx-auto flex w-full max-w-[940px] min-w-0 flex-col px-5 py-5 sm:px-6"
        >
          {issues.length ? (
            <div className="flex flex-wrap gap-2">
              {issues.map((item, index) => (
                <TinyChip key={`${item}-${index}`} tone="warn">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  {item}
                </TinyChip>
              ))}
            </div>
          ) : null}

          <StageSection className="mt-5">
            <SectionTitle
              label="Core identity"
              title="Primary business fields"
              body="Edit the values you want to save."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field
                label="Company name"
                value={form.companyName}
                onChange={(value) => onSetBusinessField?.("companyName", value)}
                placeholder="Company name"
                needsAttention={needsReview(form.companyName)}
              />
              <Field
                label="Website URL"
                value={form.websiteUrl}
                onChange={(value) => onSetBusinessField?.("websiteUrl", value)}
                placeholder="Website URL"
                needsAttention={needsReview(form.websiteUrl)}
              />
              <Field
                label="Primary phone"
                value={form.primaryPhone}
                onChange={(value) => onSetBusinessField?.("primaryPhone", value)}
                placeholder="Primary phone"
                needsAttention={needsReview(form.primaryPhone)}
              />
              <Field
                label="Primary email"
                value={form.primaryEmail}
                onChange={(value) => onSetBusinessField?.("primaryEmail", value)}
                placeholder="Primary email"
                needsAttention={needsReview(form.primaryEmail)}
              />
            </div>

            <div className="mt-4">
              <Field
                label="Primary address"
                value={form.primaryAddress}
                onChange={(value) => onSetBusinessField?.("primaryAddress", value)}
                placeholder="Primary address"
                needsAttention={needsReview(form.primaryAddress)}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field
                label="Timezone"
                value={form.timezone}
                onChange={(value) => onSetBusinessField?.("timezone", value)}
                placeholder="Timezone"
              />
              <div className="min-w-0">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Primary language
                </div>
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

            <div className="mt-4">
              <Field
                label="Short business summary"
                value={form.description}
                onChange={(value) => onSetBusinessField?.("description", value)}
                placeholder="Short business summary"
                multiline
                needsAttention={needsReview(form.description)}
              />
            </div>
          </StageSection>

          <StageSection className="mt-6">
            <SectionTitle
              label="Content"
              title="Services, FAQ, and policies"
              body="Keep each section short and clear."
            />

            <div className="mt-5 space-y-4">
              <Field
                label={`Services${serviceCount ? ` - ${serviceCount}` : ""}`}
                value={sections.servicesText}
                onChange={(value) => onSetManualSection?.("servicesText", value)}
                placeholder="Services"
                multiline
              />
              <Field
                label={`Frequently asked questions${faqCount ? ` - ${faqCount}` : ""}`}
                value={sections.faqsText}
                onChange={(value) => onSetManualSection?.("faqsText", value)}
                placeholder="Frequently asked questions"
                multiline
              />
              <Field
                label={`Policies${policyCount ? ` - ${policyCount}` : ""}`}
                value={sections.policiesText}
                onChange={(value) => onSetManualSection?.("policiesText", value)}
                placeholder="Policies"
                multiline
              />
            </div>
          </StageSection>

          {(rows.length || sources.length) ? (
            <StageSection className="mt-6">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Observed evidence
                    </div>
                    <div className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
                      Secondary reference
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                </summary>

                <div className="mt-5">
                  {sources.length ? (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {sources.map((item, index) => (
                        <TinyChip key={`${item.label}-${index}`}>
                          {item.label}
                          {item.role ? ` - ${item.role}` : ""}
                        </TinyChip>
                      ))}
                    </div>
                  ) : null}

                  {rows.length ? (
                    rows.map((item, index) => (
                      <SnapshotRow
                        key={`${item.label}-${index}`}
                        label={item.label}
                        value={item.value}
                        provenance={item.provenance}
                      />
                    ))
                  ) : null}
                </div>
              </details>
            </StageSection>
          ) : null}
        </form>
      </div>

      <div className="relative z-10 border-t border-slate-200/80 bg-[rgba(250,250,250,0.88)] px-5 py-4 backdrop-blur-[16px] sm:px-6">
        <div className="mx-auto flex w-full max-w-[940px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-6 text-slate-500">
            Only this reviewed draft will be finalized.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={savingBusiness}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white/86 px-5 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-900 disabled:opacity-60"
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
