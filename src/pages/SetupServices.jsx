import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../api/app.js";
import {
  createSetupService,
  deleteSetupService,
  getSetupServices,
  updateSetupService,
} from "../api/services.js";

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
    payload.services,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

function formatMoney(value, currency = "AZN") {
  if (value == null || value === "") return "Custom quote";
  const n = Number(value);
  if (!Number.isFinite(n)) return "Custom quote";
  return `${n} ${currency}`;
}

function blankForm() {
  return {
    title: "",
    description: "",
    category: "general",
    priceFrom: "",
    currency: "AZN",
    pricingModel: "custom_quote",
    durationMinutes: "",
    sortOrder: 0,
    highlightsText: "",
    isActive: true,
  };
}

function normalizeForForm(item = {}) {
  return {
    title: s(item.title),
    description: s(item.description),
    category: s(item.category || "general"),
    priceFrom:
      item.priceFrom == null || item.priceFrom === "" ? "" : String(item.priceFrom),
    currency: s(item.currency || "AZN"),
    pricingModel: s(item.pricingModel || "custom_quote"),
    durationMinutes:
      item.durationMinutes == null || item.durationMinutes === ""
        ? ""
        : String(item.durationMinutes),
    sortOrder: Number(item.sortOrder || 0),
    highlightsText: arr(item.highlights).join("\n"),
    isActive: item.isActive !== false,
  };
}

function payloadFromForm(form) {
  return {
    title: s(form.title),
    description: s(form.description),
    category: s(form.category || "general"),
    priceFrom: s(form.priceFrom),
    currency: s(form.currency || "AZN"),
    pricingModel: s(form.pricingModel || "custom_quote"),
    durationMinutes: s(form.durationMinutes),
    sortOrder: Number(form.sortOrder || 0),
    highlightsText: s(form.highlightsText),
    isActive: !!form.isActive,
  };
}

export default function SetupServices() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(blankForm());
  const [meta, setMeta] = useState({
    readinessScore: 0,
    missingSteps: [],
    serviceCount: 0,
    playbookCount: 0,
    nextSetupRoute: "/setup/services",
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

      const [boot, servicesPayload] = await Promise.all([
        getAppBootstrap(),
        getSetupServices(),
      ]);

      const workspace = obj(boot.workspace);
      const setup = obj(boot.setup);
      const catalog = obj(setup.catalog);

      const items = extractItems(servicesPayload);

      setMeta({
        readinessScore: Number(workspace.readinessScore || 0),
        missingSteps: Array.isArray(workspace.missingSteps)
          ? workspace.missingSteps
          : [],
        serviceCount: Number(catalog.serviceCount || items.length || 0),
        playbookCount: Number(catalog.playbookCount || 0),
        nextSetupRoute:
          s(workspace.nextSetupRoute) || s(workspace.initialRoute) || "/setup/services",
        setupCompleted: !!workspace.setupCompleted,
      });

      setServices(items);
    } catch (e) {
      setError(String(e?.message || e || "Services setup could not be loaded."));
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
        key: "services",
        label: "Services",
        value: String(meta.serviceCount),
      },
      {
        key: "playbooks",
        label: "Playbooks",
        value: String(meta.playbookCount),
      },
    ];
  }, [meta]);

  function setField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetForm() {
    setEditingId("");
    setForm(blankForm());
  }

  function onEdit(item) {
    setEditingId(s(item.id));
    setForm(normalizeForForm(item));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function routeAfterSave() {
    const boot = await getAppBootstrap();
    const workspace = obj(boot.workspace);

    if (workspace.setupCompleted) {
      navigate("/", { replace: true });
      return;
    }

    const next = s(workspace.nextSetupRoute || workspace.initialRoute);

    if (next && next !== "/setup/services") {
      navigate(next, { replace: true });
      return;
    }

    await loadData({ silent: true });
  }

  async function onSubmit(e, { continueAfterSave = false } = {}) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = payloadFromForm(form);

      if (editingId) {
        await updateSetupService(editingId, payload);
      } else {
        await createSetupService(payload);
      }

      if (continueAfterSave) {
        await routeAfterSave();
        return;
      }

      await loadData({ silent: true });
      resetForm();
    } catch (e2) {
      setError(String(e2?.message || e2 || "Service could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(item) {
    const id = s(item.id);
    if (!id) return;

    try {
      setDeletingId(id);
      setError("");

      await deleteSetupService(id);

      if (editingId === id) {
        resetForm();
      }

      await loadData({ silent: true });
    } catch (e) {
      setError(String(e?.message || e || "Service could not be deleted."));
    } finally {
      setDeletingId("");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-white">
        Services setup yüklənir...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 text-white">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70">
          Setup
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">Service catalog</h1>

        <p className="mt-3 max-w-3xl text-base text-white/70">
          Burda xidmətlərini əlavə edirik ki runtime və sales flow sistemin nə
          satdığını dəqiq bilsin. İlk service daxil olan kimi setup növbəti
          mərhələyə keçə bilər.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={(e) => onSubmit(e, { continueAfterSave: false })}
          className="rounded-[28px] border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {editingId ? "Edit service" : "Add service"}
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Title və qısa description kifayətdir. Qalan hissələri sonra da
                təkmilləşdirə bilərik.
              </p>
            </div>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
              >
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <div className="mb-2 text-sm text-white/70">Service title</div>
              <input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="Instagram DM automation"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-sm text-white/70">Description</div>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="min-h-[130px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="Service nə edir, kim üçündür, hansı nəticəni verir."
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Category</div>
              <input
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="automation"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Pricing model</div>
              <select
                value={form.pricingModel}
                onChange={(e) => setField("pricingModel", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option value="custom_quote">Custom quote</option>
                <option value="fixed">Fixed</option>
                <option value="starting_from">Starting from</option>
                <option value="hourly">Hourly</option>
                <option value="package">Package</option>
                <option value="free">Free</option>
                <option value="contact">Contact</option>
              </select>
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Price from</div>
              <input
                value={form.priceFrom}
                onChange={(e) => setField("priceFrom", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="500"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Currency</div>
              <input
                value={form.currency}
                onChange={(e) => setField("currency", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="AZN"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Duration (minutes)</div>
              <input
                value={form.durationMinutes}
                onChange={(e) => setField("durationMinutes", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="60"
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm text-white/70">Sort order</div>
              <input
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder="0"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="mb-2 text-sm text-white/70">
                Highlights (one per line)
              </div>
              <textarea
                value={form.highlightsText}
                onChange={(e) => setField("highlightsText", e.target.value)}
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                placeholder={"Fast setup\nLead capture\nHuman handoff"}
              />
            </label>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={!!form.isActive}
                onChange={(e) => setField("isActive", e.target.checked)}
              />
              <span className="text-sm text-white/75">Service is active</span>
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Update service" : "Save service"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={(e) => onSubmit(e, { continueAfterSave: true })}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white disabled:opacity-60"
            >
              Save and continue
            </button>

            <button
              type="button"
              onClick={() => loadData({ silent: true })}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </form>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-tight">Current services</h2>
            <p className="mt-2 text-sm text-white/55">
              Mövcud service-lər burada görünür. Edit və delete edə bilərsən.
            </p>
          </div>

          {services.length ? (
            <div className="grid gap-4">
              {services.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      {s(item.category || "general")}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      {s(item.pricingModel || "custom_quote")}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      {item.isActive ? "active" : "inactive"}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold">{s(item.title)}</h3>

                  {s(item.description) ? (
                    <p className="mt-2 text-sm text-white/70">{s(item.description)}</p>
                  ) : null}

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/55">
                    <span>{formatMoney(item.priceFrom, item.currency)}</span>
                    {item.durationMinutes != null ? (
                      <span>• {item.durationMinutes} min</span>
                    ) : null}
                  </div>

                  {arr(item.highlights).length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {arr(item.highlights).map((hl, idx) => (
                        <span
                          key={`${item.id}-hl-${idx}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75"
                        >
                          {s(hl)}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => onDelete(item)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white disabled:opacity-60"
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
              Hələ service əlavə olunmayıb.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}