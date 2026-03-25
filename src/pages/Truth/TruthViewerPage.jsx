import { useEffect, useState } from "react";

import { getCanonicalTruthSnapshot } from "../../api/truth.js";
import TruthHeader from "../../components/truth/TruthHeader.jsx";
import TruthFieldTable from "../../components/truth/TruthFieldTable.jsx";
import TruthProvenancePanel from "../../components/truth/TruthProvenancePanel.jsx";
import TruthHistoryPanel from "../../components/truth/TruthHistoryPanel.jsx";

function initialState() {
  return {
    loading: true,
    error: "",
    data: {
      fields: [],
      approval: { approvedAt: "", approvedBy: "", version: "" },
      history: [],
      notices: [],
      hasProvenance: false,
    },
  };
}

export default function TruthViewerPage() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let alive = true;

    getCanonicalTruthSnapshot()
      .then((data) => {
        if (!alive) return;
        setState({
          loading: false,
          error: "",
          data: {
            fields: data.fields || [],
            approval: data.approval || {},
            history: data.history || [],
            notices: data.notices || [],
            hasProvenance: !!data.hasProvenance,
          },
        });
      })
      .catch((error) => {
        if (!alive) return;
        setState({
          loading: false,
          error: String(error?.message || error || "Truth viewer could not be loaded."),
          data: initialState().data,
        });
      });

    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/80 px-5 py-5 text-sm text-slate-500">
          Loading approved business truth...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 lg:px-8">
      <TruthHeader
        approval={state.data.approval}
        notices={state.data.notices}
      />

      {state.error ? (
        <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50/90 px-5 py-4 text-sm leading-6 text-rose-700">
          {state.error}
        </div>
      ) : null}

      <div className="mt-8">
        <TruthFieldTable fields={state.data.fields} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <TruthProvenancePanel hasProvenance={state.data.hasProvenance} />
        <TruthHistoryPanel history={state.data.history} />
      </div>
    </div>
  );
}
