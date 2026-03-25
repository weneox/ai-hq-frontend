import { ArrowRight, PencilLine } from "lucide-react";

import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
import {
  GhostButton,
  SectionHeading,
  StagePanel,
  TinyChip,
  TinyLabel,
} from "../components/SetupStudioUi.jsx";
import { humanizeStudioIssue } from "../logic/helpers.js";

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function s(v, d = "") {
  return String(v ?? d).trim();
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

      if (item && typeof item === "object") {
        return {
          label: s(item.label || item.key || item.title),
          value: s(item.value || item.text || item.description),
          provenance: s(item.provenance),
        };
      }

      return { label: "", value: "", provenance: "" };
    })
    .filter((item) => item.label || item.value);
}

function sourceRoleLabel(source = {}) {
  const role = s(source?.role).toLowerCase();
  if (source?.isPrimary || role === "primary") return "Primary";
  if (source?.isSupporting || role === "supporting") return "Supporting";
  return "";
}

function Row({ label, value, provenance = "" }) {
  return (
    <div className="grid gap-2 border-t border-slate-200/70 py-3 first:border-t-0 first:pt-0 md:grid-cols-[160px_minmax(0,1fr)]">
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

export default function SetupStudioIdentityStage({
  currentTitle,
  currentDescription,
  discoveryProfileRows,
  discoveryWarnings = [],
  sourceLabel = "",
  reviewSources = [],
  onNext,
  onToggleRefine,
}) {
  const rows = normalizeRows(discoveryProfileRows).slice(0, 8);
  const warnings = arr(discoveryWarnings)
    .map((item) => humanizeStudioIssue(item))
    .filter(Boolean)
    .slice(0, 4);
  const sources = arr(reviewSources)
    .map((item) => ({
      label: s(item?.label || item?.sourceType || item?.url),
      url: s(item?.url),
      role: sourceRoleLabel(item),
    }))
    .filter((item) => item.label || item.url)
    .slice(0, 4);

  const identityTitle = s(currentTitle) || "Business name needs review";
  const identitySummary =
    s(currentDescription) || "Add a short business summary before finalizing.";

  return (
    <SetupStudioStageShell
      eyebrow="identity"
      title="Shape one clean business identity."
      body="Review the draft first. Source evidence stays secondary."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <StagePanel className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <TinyLabel>Editable draft</TinyLabel>
            {sourceLabel ? <TinyChip>{sourceLabel}</TinyChip> : null}
            {warnings.length ? (
              <TinyChip tone="warn">
                {warnings.length} review item{warnings.length === 1 ? "" : "s"}
              </TinyChip>
            ) : (
              <TinyChip tone="success">Draft visible</TinyChip>
            )}
          </div>

          <div>
            <div className="text-[32px] font-semibold leading-[1.04] tracking-[-0.05em] text-slate-950 sm:text-[38px]">
              {identityTitle}
            </div>
            <div className="mt-3 max-w-[760px] text-[15px] leading-7 text-slate-600">
              {identitySummary}
            </div>
          </div>

          {warnings.length ? (
            <div className="flex flex-wrap gap-2">
              {warnings.map((warning, index) => (
                <TinyChip key={`${warning}-${index}`} tone="warn">
                  {warning}
                </TinyChip>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/72 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Name
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-950">
                {identityTitle}
              </div>
            </div>

            <div className="rounded-[24px] bg-white/72 px-4 py-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Draft state
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-950">
                {rows.length ? `${rows.length} observed fields` : "Needs manual review"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <GhostButton active icon={ArrowRight} onClick={onNext}>
              Continue
            </GhostButton>
            <GhostButton icon={PencilLine} onClick={onToggleRefine}>
              Review draft
            </GhostButton>
          </div>
        </StagePanel>

        <div className="grid gap-4">
          <StagePanel tone="subtle">
            <SectionHeading
              label="Observed"
              title="Evidence snapshot"
              body={
                rows.length
                  ? "Observed values are shown here for review."
                  : "No strong observed fields yet."
              }
            />
            <div className="mt-5 space-y-1">
              {rows.length ? (
                rows.map((item, index) => (
                  <Row
                    key={`${item.label}-${index}`}
                    label={item.label}
                    value={item.value}
                    provenance={item.provenance}
                  />
                ))
              ) : (
                <div className="rounded-[22px] bg-white/70 px-4 py-4 text-sm leading-6 text-slate-500">
                  Open the draft and fill the missing identity fields manually.
                </div>
              )}
            </div>
          </StagePanel>

          {sources.length ? (
            <StagePanel tone="subtle">
              <SectionHeading
                label="Sources"
                title="Attached evidence"
                body="These sources inform the draft but do not define saved truth."
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {sources.map((item, index) => (
                  <TinyChip key={`${item.label}-${item.url}-${index}`}>
                    {item.label}
                    {item.role ? ` - ${item.role}` : ""}
                  </TinyChip>
                ))}
              </div>
            </StagePanel>
          ) : null}
        </div>
      </div>
    </SetupStudioStageShell>
  );
}
