import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../api/app.js";
import {
  approveKnowledgeCandidate,
  getKnowledgeCandidates,
  rejectKnowledgeCandidate,
} from "../api/knowledge.js";

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function obj(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function s(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function extractItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.items,
    payload.rows,
    payload.results,
    payload.data,
    payload.entries,
    payload.candidates,
    payload.queue,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function isPending(item = {}) {
  const status = s(item.status || item.review_status || item.state).toLowerCase();
  if (!status) return true;
  return [
    "pending",
    "needs_review",
    "conflict",
    "review",
    "awaiting_review",
  ].includes(status);
}

function candidateTitle(item = {}) {
  return (
    s(item.title) ||
    s(item.item_key) ||
    s(item.canonical_key) ||
    "Untitled knowledge candidate"
  );
}

function candidateCategory(item = {}) {
  return s(item.category || item.candidate_group || "general");
}

function candidateValue(item = {}) {
  const text = s(item.value_text || item.summary || item.description);
  if (text) return text;

  const valueJson = obj(item.value_json);
  const keys = Object.keys(valueJson);
  if (!keys.length) return "";

  try {
    return JSON.stringify(valueJson, null, 2);
  } catch {
    return "";
  }
}

function candidateSource(item = {}) {
  return (
    s(item.source_display_name) ||
    s(item.display_name) ||
    s(item.source_type) ||
    s(item.source_key) ||
    "Unknown source"
  );
}

function candidateConfidence(item = {}) {
  const n = Number(item.confidence);
  if (!Number.isFinite(n)) return "";
  return `${Math.round(n * 100)}%`;
}

function evidenceList(item = {}) {
  return parseJsonArray(item.source_evidence_json).slice(0, 3);
}

function formatReason(reason = "") {
  return s(reason) || "No review note";
}

function cardStatusTone(item = {}) {
  const status = s(item.status || "pending").toLowerCase();

  if (status === "conflict") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  }

  if (status === "needs_review") {
    return "border-sky-400/20 bg-sky-500/10 text-sky-200";
  }

  return "border-white/10 bg-white/5 text-white/80";
}

export default function SetupKnowledge() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [meta, setMeta] = useState({
    readinessScore: 0,
    missingSteps: [],
    pendingCandidateCount: 0,
    approvedKnowledgeCount: 0,
    approvedCandidateCount: 0,
    rejectedCandidateCount: 0,
    nextSetupRoute: "/setup/knowledge",
    setupCompleted: false,
  });

  async function loadData({ silent = false } = {}) {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [boot, candidatePayload] = await Promise.all([
        getAppBootstrap(),
        getKnowledgeCandidates(),
      ]);

      const workspace = obj(boot.workspace);
      const setup = obj(boot.setup);
      const knowledge = obj(setup.knowledge);

      const rawCandidates = extractItems(candidatePayload);
      const pendingCandidates = rawCandidates.filter(isPending);

      setMeta({
        readinessScore: Number(workspace.readinessScore || 0),
        missingSteps: Array.isArray(workspace.missingSteps)
          ? workspace.missingSteps
          : [],
        pendingCandidateCount: Number(knowledge.pendingCandidateCount || 0),
        approvedKnowledgeCount: Number(knowledge.approvedKnowledgeCount || 0),
        approvedCandidateCount: Number(knowledge.approvedCandidateCount || 0),
        rejectedCandidateCount: Number(knowledge.rejectedCandidateCount || 0),
        nextSetupRoute:
          s(workspace.nextSetupRoute) || s(workspace.initialRoute) || "/setup/knowledge",
        setupCompleted: !!workspace.setupCompleted,
      });

      setCandidates(pendingCandidates);
    } catch (e) {
      setError(String(e?.message || e || "Knowledge setup could not be loaded."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return [
      {
        key: "readiness",
        label: "Readiness",
        value: `${meta.readinessScore}%`,
      },
      {
        key: "pending",
        label: "Pending candidates",
        value: String(meta.pendingCandidateCount),
      },
      {
        key: "approved",
        label: "Approved knowledge",
        value: String(meta.approvedKnowledgeCount),
      },
      {
        key: "reviewed",
        label: "Reviewed candidates",
        value: String(meta.approvedCandidateCount + meta.rejectedCandidateCount),
      },
    ];
  }, [meta]);

  async function syncAndRoute() {
    const boot = await getAppBootstrap();
    const workspace = obj(boot.workspace);

    if (workspace.setupCompleted) {
      navigate("/", { replace: true });
      return;
    }

    const next = s(workspace.nextSetupRoute || workspace.initialRoute);

    if (next && next !== "/setup/knowledge") {
      navigate(next, { replace: true });
      return;
    }

    await loadData({ silent: true });
  }

  async function onApprove(item) {
    const id = s(item.id);
    if (!id) return;

    try {
      setActingId(id);
      setError("");

      await approveKnowledgeCandidate(id, {});
      await syncAndRoute();
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be approved."));
    } finally {
      setActingId("");
    }
  }

  async function onReject(item) {
    const id = s(item.id);
    if (!id) return;

    try {
      setActingId(id);
      setError("");

      await rejectKnowledgeCandidate(id, {});
      await syncAndRoute();
    } catch (e) {
      setError(String(e?.message || e || "Candidate could not be rejected."));
    } finally {
      setActingId("");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-white">
        Knowledge setup yüklənir...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 text-white">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70">
          Setup
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">Knowledge base</h1>

        <p className="mt-3 max-w-3xl text-base text-white/70">
          Burda source-lardan çıxan knowledge candidate-ləri review edib approve
          və reject edəcəyik. İlk approved knowledge daxil olan kimi setup növbəti
          mərhələyə keçəcək.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.key}
            className="rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <div className="text-xs uppercase tracking-[0.2em] text-white/45">
              {item.label}
            </div>
            <div className="mt-3 text-3xl font-semibold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-white/45">
          Missing steps
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {meta.missingSteps.length ? (
            meta.missingSteps.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-white/60">No missing steps</span>
          )}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="text-sm text-white/55">
          {refreshing
            ? "Knowledge məlumatları yenilənir..."
            : "Pending candidate-lər aşağıda göstərilir."}
        </div>

        <button
          type="button"
          onClick={() => loadData({ silent: true })}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
        >
          Refresh
        </button>
      </div>

      {candidates.length ? (
        <div className="grid gap-4">
          {candidates.map((item) => {
            const id = s(item.id);
            const value = candidateValue(item);
            const evidence = evidenceList(item);
            const busy = actingId === id;

            return (
              <div
                key={id || candidateTitle(item)}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs ${cardStatusTone(
                          item
                        )}`}
                      >
                        {s(item.status || "pending")}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        {candidateCategory(item)}
                      </span>

                      {candidateConfidence(item) ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                          confidence {candidateConfidence(item)}
                        </span>
                      ) : null}

                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                        source: {candidateSource(item)}
                      </span>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                      {candidateTitle(item)}
                    </h2>

                    {value ? (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                        <pre className="whitespace-pre-wrap break-words font-sans">
                          {value}
                        </pre>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-white/50">
                        Bu candidate üçün text preview yoxdur.
                      </div>
                    )}

                    {s(item.review_reason) ? (
                      <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        {formatReason(item.review_reason)}
                      </div>
                    ) : null}

                    {evidence.length ? (
                      <div className="mt-4">
                        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/45">
                          Evidence
                        </div>

                        <div className="grid gap-2">
                          {evidence.map((ev, index) => {
                            const sourceUrl =
                              s(ev.url) || s(ev.source_url) || s(ev.link);
                            const snippet =
                              s(ev.snippet) ||
                              s(ev.text) ||
                              s(ev.summary) ||
                              s(ev.title);

                            return (
                              <div
                                key={`${id}-evidence-${index}`}
                                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75"
                              >
                                {snippet ? <div>{snippet}</div> : null}
                                {sourceUrl ? (
                                  <div className="mt-1 break-all text-xs text-white/45">
                                    {sourceUrl}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[220px]">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onApprove(item)}
                      className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
                    >
                      {busy ? "Processing..." : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onReject(item)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            No pending candidates
          </h2>

          <p className="mt-3 max-w-2xl text-white/70">
            Hazırda review gözləyən knowledge candidate görünmür. Əgər approved
            knowledge artıq varsa, növbəti setup mərhələsinə keçmək üçün refresh
            et.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadData({ silent: true })}
              className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black"
            >
              Refresh knowledge
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  setError("");
                  await syncAndRoute();
                } catch (e) {
                  setError(
                    String(e?.message || e || "Next setup step could not be opened.")
                  );
                }
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
            >
              Continue setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}