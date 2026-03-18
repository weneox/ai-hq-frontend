import { Globe, Loader2, Wand2 } from "lucide-react";
import SetupStudioStageShell from "../components/SetupStudioStageShell.jsx";

export default function SetupStudioEntryStage({
  discoveryForm,
  error,
  importingWebsite,
  onSetDiscoveryField,
  onScanBusiness,
}) {
  return (
    <SetupStudioStageShell
      eyebrow="first move"
      title={
        <>
          Start with the website.
          <br />
          Let the page answer back.
        </>
      }
      body="Tək bir URL yaz. Sonra bu səhifə step-step özü danışacaq: əvvəl scan, sonra identity, sonra knowledge, sonra service."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-end">
        <form onSubmit={onScanBusiness} className="space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-300/90 pb-4">
            <Globe className="h-5 w-5 text-slate-400" />
            <input
              value={discoveryForm.websiteUrl}
              onChange={(e) => onSetDiscoveryField("websiteUrl", e.target.value)}
              className="w-full bg-transparent text-2xl font-medium tracking-[-0.04em] text-slate-950 outline-none placeholder:text-slate-400 sm:text-3xl"
              placeholder="https://yourbusiness.com"
            />
          </div>

          <textarea
            value={discoveryForm.note}
            onChange={(e) => onSetDiscoveryField("note", e.target.value)}
            className="min-h-[76px] w-full resize-none bg-transparent text-sm leading-7 text-slate-600 outline-none placeholder:text-slate-400"
            placeholder="İstəsən fokus yaz: məsələn əsas istiqamətimiz Instagram DM automation və lead qualification-dır."
          />

          {error ? (
            <div className="rounded-[18px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </form>

        <div className="space-y-4">
          <div className="space-y-2 text-sm text-slate-500">
            <div>Detects identity</div>
            <div>Extracts knowledge</div>
            <div>Prepares service direction</div>
          </div>

          <button
            type="button"
            onClick={(e) => onScanBusiness(e)}
            disabled={importingWebsite}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-medium text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)] disabled:opacity-60"
          >
            {importingWebsite ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning business
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Begin scan
              </>
            )}
          </button>
        </div>
      </div>
    </SetupStudioStageShell>
  );
}