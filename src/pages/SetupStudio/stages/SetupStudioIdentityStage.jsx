import {
  AlertTriangle,
  ArrowRight,
  FileSearch,
  PencilLine,
} from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";
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

function isBarrierWarning(value = "") {
  const x = s(value).toLowerCase();
  return [
    "http_403",
    "http_429",
    "fetch_failed",
    "non_html_response",
    "website_fetch_timeout",
    "website_entry_timeout",
  ].includes(x);
}

function ActionButton({ active = false, icon: Icon, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white hover:bg-slate-800"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function SnapshotRow({ label, value, provenance = "" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label || "Field"}
      </div>
      <div className="mt-1.5 text-sm leading-6 text-slate-700">
        {value || "-"}
      </div>
      {provenance ? (
        <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
          {provenance}
        </div>
      ) : null}
    </div>
  );
}

function sourceBadgeLabel(sourceLabel = "") {
  const x = s(sourceLabel);
  if (!x) return "";
  if (x.toLowerCase() === "manual") return "Manual input";
  return x;
}

function sourceRoleLabel(source = {}) {
  const role = s(source?.role).toLowerCase();
  if (source?.isPrimary || role === "primary") return "Primary";
  if (source?.isSupporting || role === "supporting") return "Supporting";
  return "";
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
  const warnings = arr(discoveryWarnings).map((x) => s(x)).filter(Boolean);
  const sources = arr(reviewSources)
    .map((item) => ({
      label: s(item?.label || item?.sourceType || item?.url),
      url: s(item?.url),
      role: sourceRoleLabel(item),
    }))
    .filter((item) => item.label || item.url)
    .slice(0, 4);

  const barrierWarning = warnings.find(isBarrierWarning) || "";
  const barrierState = !!barrierWarning;
  const sourceBadge = sourceBadgeLabel(sourceLabel);

  const resolvedTitle =
    !barrierState && s(currentTitle)
      ? s(currentTitle)
      : barrierState
        ? "This source needs manual review."
        : rows.length
          ? "Your first business draft is ready."
          : "Your business draft needs a quick review.";

  const resolvedDescription =
    !barrierState && s(currentDescription)
      ? s(currentDescription)
      : barrierState
        ? humanizeStudioIssue(barrierWarning)
        : rows.length
          ? "Review the first structured draft, fix anything important, then continue."
          : "The system did not produce many strong fields yet. Refine the draft manually and continue.";

  return (
    <SetupStudioStageShell
      eyebrow="identity"
      title="Review the first business draft."
      body="This is the first structured version of the business. Keep it clean, believable, and minimal."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              <FileSearch className="h-3.5 w-3.5" />
              review draft
            </span>

            {sourceBadge ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {sourceBadge}
              </span>
            ) : null}

            {rows.length ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {rows.length} fields
              </span>
            ) : null}
          </div>

          <div className="mt-6">
            <h3 className="text-[28px] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-[36px]">
              {resolvedTitle}
            </h3>

            <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-slate-600">
              {resolvedDescription}
            </p>
          </div>

          {warnings.length ? (
            <div className="mt-6 space-y-3">
              {warnings.slice(0, 3).map((warning, index) => (
                <div
                  key={`${warning}-${index}`}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm ${
                    isBarrierWarning(warning)
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{humanizeStudioIssue(warning)}</span>
                </div>
              ))}
            </div>
          ) : null}

          {sources.length ? (
            <div className="mt-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Participating sources
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {sources.map((item, index) => (
                  <span
                    key={`${item.label}-${item.url}-${index}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                  >
                    {item.label}
                    {item.role ? ` ${item.role}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <ActionButton active icon={ArrowRight} onClick={onNext}>
              {barrierState ? "Continue manually" : "Continue"}
            </ActionButton>

            <ActionButton icon={PencilLine} onClick={onToggleRefine}>
              Refine draft
            </ActionButton>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Snapshot
          </div>

          <div className="mt-5 space-y-3">
            {rows.length ? (
              rows.map((item, index) => (
                <SnapshotRow
                  key={`${item.label}-${index}`}
                  label={item.label}
                  value={item.value}
                  provenance={item.provenance}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm leading-6 text-slate-500">
                No structured fields are visible yet. Use refine to complete the
                draft manually.
              </div>
            )}
          </div>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}
