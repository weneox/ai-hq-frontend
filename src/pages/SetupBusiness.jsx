import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppBootstrap } from "../api/app.js";
import { saveBusinessProfile } from "../api/setup.js";

function firstLanguage(profile) {
  if (profile?.language) return String(profile.language);
  if (Array.isArray(profile?.languages) && profile.languages[0]) {
    return String(profile.languages[0]);
  }
  return "az";
}

export default function SetupBusiness() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState({
    readinessScore: 0,
    missingSteps: [],
    nextRoute: "/setup/business",
  });

  const [form, setForm] = useState({
    companyName: "",
    description: "",
    timezone: "Asia/Baku",
    language: "az",
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setError("");

        const boot = await getAppBootstrap();
        if (!alive) return;

        const workspace = boot?.workspace || {};
        const profile = boot?.setup?.businessProfile || {};

        setMeta({
          readinessScore: Number(workspace.readinessScore || 0),
          missingSteps: Array.isArray(workspace.missingSteps)
            ? workspace.missingSteps
            : [],
          nextRoute:
            workspace.nextSetupRoute ||
            workspace.initialRoute ||
            "/setup/business",
        });

        setForm({
          companyName: profile.companyName || "",
          description: profile.description || "",
          timezone: profile.timezone || "Asia/Baku",
          language: firstLanguage(profile),
        });

        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(String(e?.message || e || "Setup data could not be loaded."));
        setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  function setField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await saveBusinessProfile({
        companyName: form.companyName,
        description: form.description,
        timezone: form.timezone,
        language: form.language,
        languages: form.language ? [form.language] : [],
      });

      const boot = await getAppBootstrap();
      const workspace = boot?.workspace || {};

      const target = workspace.setupCompleted
        ? "/"
        : workspace.nextSetupRoute ||
          workspace.initialRoute ||
          "/setup/business";

      navigate(target, { replace: true });
    } catch (e) {
      setError(String(e?.message || e || "Business profile could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-white">
        Setup yüklənir...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-white">
      <div className="mb-8">
        <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70">
          Setup
        </div>

        <h1 className="text-4xl font-semibold tracking-tight">
          Business profile
        </h1>

        <p className="mt-3 max-w-2xl text-base text-white/70">
          Workspace hələ tam hazır deyil. İlk olaraq business məlumatlarını daxil
          edək ki sistem düzgün setup flow ilə davam etsin.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/45">
            Readiness
          </div>
          <div className="mt-3 text-3xl font-semibold">
            {meta.readinessScore}%
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:col-span-2">
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
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-[28px] border border-white/10 bg-white/5 p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <div className="mb-2 text-sm text-white/70">Company name</div>
            <input
              value={form.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="Weneox"
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm text-white/70">Timezone</div>
            <input
              value={form.timezone}
              onChange={(e) => setField("timezone", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="Asia/Baku"
            />
          </label>

          <label className="block md:col-span-2">
            <div className="mb-2 text-sm text-white/70">Description</div>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              placeholder="Business, xidmətlər və AI sistemin nə üçün istifadə olunacağını qısa yaz."
            />
          </label>

          <label className="block">
            <div className="mb-2 text-sm text-white/70">Primary language</div>
            <select
              value={form.language}
              onChange={(e) => setField("language", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            >
              <option value="az">Azerbaijani</option>
              <option value="en">English</option>
              <option value="tr">Turkish</option>
              <option value="ru">Russian</option>
            </select>
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-sm text-white/45">
            Save etdikdən sonra sistem növbəti setup mərhələsinə keçəcək.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl border border-white/10 bg-white text-black px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </div>
      </form>
    </div>
  );
}