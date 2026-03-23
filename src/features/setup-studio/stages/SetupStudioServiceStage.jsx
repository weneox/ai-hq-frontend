import { ArrowRight, Plus } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";

function s(v, d = "") {
  return String(v ?? d).trim();
}

function num(v, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

function arr(v, d = []) {
  return Array.isArray(v) ? v : d;
}

function truncate(value = "", max = 180) {
  const x = s(value);
  if (!x) return "";
  if (x.length <= max) return x;
  return `${x.slice(0, max - 1)}…`;
}

function normalizeService(item = {}, index = 0) {
  const x = item && typeof item === "object" ? item : {};

  return {
    id: s(x.id || x.serviceId || x.service_id || `service-${index + 1}`),
    title: s(x.title || x.name || x.label || `Service ${index + 1}`),
    description: s(
      x.description ||
        x.summary ||
        x.value ||
        x.valueText ||
        x.value_text
    ),
  };
}

function ActionButton({ active = false, icon: Icon, children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50"
          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-950 disabled:opacity-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

export default function SetupStudioServiceStage({
  serviceSuggestionTitle,
  meta,
  services,
  savingServiceSuggestion,
  onCreateSeed,
  onSkip,
}) {
  const normalizedServices = arr(services)
    .map((item, index) => normalizeService(item, index))
    .filter((item) => item.title);

  const serviceCount = normalizedServices.length;
  const hasSuggestion = !!s(serviceSuggestionTitle);
  const isCreating = !!savingServiceSuggestion;

  const readinessScore = num(meta?.readinessScore, 0);

  const headline =
    hasSuggestion && serviceCount === 0
      ? serviceSuggestionTitle
      : serviceCount > 0
        ? "The service layer already has a base."
        : "Create the first service seed.";

  const supportingCopy =
    serviceCount > 0
      ? "You already have enough to move forward. Add more detail later inside the workspace."
      : hasSuggestion
        ? "A first service suggestion is ready from the current draft."
        : "One believable service is enough for the first launch pass.";

  return (
    <SetupStudioStageShell
      eyebrow="services"
      title="Shape the first service layer."
      body="You do not need a full catalog here. Just enough structure to make the business real."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6">
            <h3 className="text-[28px] font-semibold leading-[1.02] tracking-[-0.04em] text-slate-950 sm:text-[34px]">
              {headline}
            </h3>

            <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-slate-600">
              {supportingCopy}
            </p>

            {hasSuggestion ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Suggested seed
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-950">
                  {serviceSuggestionTitle}
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <ActionButton
                active
                icon={Plus}
                onClick={onCreateSeed}
                disabled={isCreating || (!hasSuggestion && serviceCount === 0)}
              >
                {isCreating
                  ? "Creating..."
                  : serviceCount > 0
                    ? "Create another seed"
                    : "Create seed"}
              </ActionButton>

              <ActionButton icon={ArrowRight} onClick={onSkip}>
                {serviceCount > 0 ? "Continue" : "Skip for now"}
              </ActionButton>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Summary
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Services
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  {serviceCount}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Readiness
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-slate-950">
                  {readinessScore}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Current service base
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Keep this small and believable.
              </div>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {serviceCount} item{serviceCount === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mt-5">
            {serviceCount > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {normalizedServices.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Service
                    </div>
                    <div className="mt-2 text-[18px] font-semibold tracking-[-0.03em] text-slate-950">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">
                      {truncate(item.description, 180) ||
                        "A base service entry is ready for refinement in the workspace."}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <div className="text-base font-semibold text-slate-900">
                  No service seed exists yet
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-500">
                  Create one starting service now, or move on and finish it later.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}