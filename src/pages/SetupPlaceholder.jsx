import { Link, useLocation } from "react-router-dom";

const META = {
  "/setup/channels": {
    title: "Channels and sources",
    text: "Burda source/channel bağlantıları qurulacaq. Hazırda route placeholder kimi açılır ki setup flow qırılmasın.",
  },
  "/setup/knowledge": {
    title: "Knowledge base",
    text: "Burda knowledge candidate review və approved knowledge mərhələsi qurulacaq. Hazırda flow-un davam etməsi üçün placeholder göstərilir.",
  },
  "/setup/services": {
    title: "Service catalog",
    text: "Burda service catalog idarəsi qurulacaq. Hazırda setup flow fallback etməsin deyə placeholder açılır.",
  },
  "/setup/playbooks": {
    title: "Response playbooks",
    text: "Burda playbook quruluşu gələcək. Hazırda route düzgün işləsin deyə placeholder səhifəsidir.",
  },
  "/setup/runtime": {
    title: "Runtime preferences",
    text: "Burda tone, language və runtime policy hissəsi qurulacaq. Hazırda placeholder göstərilir.",
  },
};

export default function SetupPlaceholder() {
  const location = useLocation();
  const meta = META[location.pathname] || {
    title: "Setup",
    text: "Bu mərhələ hələ tam yığılmayıb.",
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-white">
      <div className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/70">
        Setup
      </div>

      <h1 className="text-4xl font-semibold tracking-tight">{meta.title}</h1>

      <p className="mt-3 max-w-2xl text-base text-white/70">{meta.text}</p>

      <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-6">
        <div className="text-sm text-white/55">
          Növbəti addım kimi bu mərhələnin real UI-sini quracağıq.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/setup/business"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white"
          >
            Back to business profile
          </Link>

          <Link
            to="/"
            className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}