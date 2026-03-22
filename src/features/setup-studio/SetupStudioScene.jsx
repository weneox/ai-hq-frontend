import SetupStudioEntryStage from "./stages/SetupStudioEntryStage.jsx";

export default function SetupStudioScene({
  loading,
  error,
  discoveryForm,
  onSetDiscoveryField,
  onContinueFlow,
}) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-full border border-white/70 bg-white/55 px-5 py-2.5 text-sm font-medium text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,.06)] backdrop-blur-md">
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <main className="mx-auto flex min-h-screen w-full max-w-[1400px] items-start justify-center px-6 pb-16 pt-12 sm:px-8 lg:px-12 lg:pt-14">
        <div className="w-full">
          <SetupStudioEntryStage
            discoveryForm={discoveryForm}
            onSetDiscoveryField={onSetDiscoveryField}
            onContinueFlow={onContinueFlow}
          />

          {error ? (
            <div className="mx-auto mt-6 max-w-[1280px] rounded-[18px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}