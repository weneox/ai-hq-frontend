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
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          Setup studio hazırlanır...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto">
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <SetupStudioEntryStage
          discoveryForm={discoveryForm}
          onSetDiscoveryField={onSetDiscoveryField}
          onContinueFlow={onContinueFlow}
        />

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </main>
    </div>
  );
}