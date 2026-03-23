import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe2, PencilLine } from "lucide-react";

function s(v) {
  return String(v ?? "").trim();
}

const SOURCE_TYPES = [
  {
    key: "website",
    label: "Website",
    placeholder: "yourbusiness.com",
    hint: "Best first pass for services, contact details, and business summary.",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "@yourbrand",
    hint: "Useful for brand tone, social proof, and visual context.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "linkedin.com/company/yourbrand",
    hint: "Useful for company identity, trust, and positioning.",
  },
  {
    key: "google_maps",
    label: "Google Maps",
    placeholder: "Business name or maps link",
    hint: "Helpful when the business is location-first.",
  },
];

function SourcePill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm transition ${
        active
          ? "bg-slate-950 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function SectionCard({ icon: Icon, title, body, children }) {
  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-7">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </span>

        <div>
          <div className="text-[22px] font-semibold tracking-[-0.03em] text-slate-950">
            {title}
          </div>
          <div className="mt-2 text-sm leading-6 text-slate-600">{body}</div>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-[16px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, className = "" }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full resize-none rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-[15px] leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-300 ${className}`}
    />
  );
}

function PrimaryButton({ disabled, loading, children, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "Analyzing..." : children}
    </button>
  );
}

export default function SetupStudioEntryStage({
  importingWebsite = false,
  discoveryForm,
  businessForm,
  manualSections,
  onSetBusinessField,
  onSetManualSection,
  onSetDiscoveryField,
  onContinueFlow,
}) {
  const sourceType = s(discoveryForm?.sourceType || "website");
  const sourceValue = s(discoveryForm?.sourceValue || discoveryForm?.websiteUrl || "");
  const operatorNote = s(discoveryForm?.note || "");

  const activeSource =
    SOURCE_TYPES.find((item) => item.key === sourceType) || SOURCE_TYPES[0];

  const hasSource = !!sourceValue;
  const hasManualInput = useMemo(() => {
    return !!(
      s(businessForm?.companyName) ||
      s(businessForm?.description) ||
      s(businessForm?.primaryPhone) ||
      s(businessForm?.primaryEmail) ||
      s(businessForm?.primaryAddress) ||
      s(manualSections?.servicesText) ||
      s(manualSections?.faqsText) ||
      s(manualSections?.policiesText)
    );
  }, [businessForm, manualSections]);

  const canContinue = hasSource || hasManualInput;

  function handleSourceTypeChange(nextType) {
    onSetDiscoveryField?.("sourceType", nextType);

    if (nextType !== "website" && s(discoveryForm?.websiteUrl)) {
      onSetDiscoveryField?.("websiteUrl", "");
    }
  }

  function handleSourceValueChange(nextValue) {
    onSetDiscoveryField?.("sourceValue", nextValue);

    if (sourceType === "website") {
      onSetDiscoveryField?.("websiteUrl", nextValue);
    }
  }

  function handleContinue() {
    onContinueFlow?.();
  }

  return (
    <section className="w-full py-4 sm:py-6">
      <div className="max-w-[820px]">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Setup studio
        </div>

        <h1 className="mt-5 text-[36px] font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-[48px] lg:text-[56px]">
          Build the first business draft.
        </h1>

        <p className="mt-4 max-w-[700px] text-[15px] leading-7 text-slate-600 sm:text-[16px]">
          Add a source if you have one. Then write anything important the system
          should know. The final draft will be generated from both.
        </p>
      </div>

      <div className="mt-10 grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
        >
          <SectionCard
            icon={Globe2}
            title="1. Add a business source"
            body="Website is best, but Instagram, LinkedIn, or Google Maps can also help. This step is optional if the business has no source yet."
          >
            <div className="flex flex-wrap gap-2">
              {SOURCE_TYPES.map((item) => (
                <SourcePill
                  key={item.key}
                  active={item.key === sourceType}
                  onClick={() => handleSourceTypeChange(item.key)}
                >
                  {item.label}
                </SourcePill>
              ))}
            </div>

            <div className="mt-6">
              <Input
                value={sourceValue}
                onChange={(e) => handleSourceValueChange(e.target.value)}
                placeholder={activeSource.placeholder}
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {activeSource.hint}
            </p>

            <div className="mt-6">
              <Textarea
                value={operatorNote}
                onChange={(e) => onSetDiscoveryField?.("note", e.target.value)}
                placeholder="Optional note for extra context. Example: We mostly work with restaurant owners in Baku."
                rows={4}
              />
            </div>
          </SectionCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: 0.04 }}
        >
          <SectionCard
            icon={PencilLine}
            title="2. Add what the source may miss"
            body="Use this for business description, contact details, services, FAQs, or anything else you want the first draft to include."
          >
            <div className="grid gap-4">
              <Input
                value={s(businessForm?.companyName)}
                onChange={(e) =>
                  onSetBusinessField?.("companyName", e.target.value)
                }
                placeholder="Business name"
              />

              <Textarea
                value={s(businessForm?.description)}
                onChange={(e) =>
                  onSetBusinessField?.("description", e.target.value)
                }
                placeholder="Describe what the business does."
                rows={5}
                className="min-h-[150px]"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  value={s(businessForm?.primaryPhone)}
                  onChange={(e) =>
                    onSetBusinessField?.("primaryPhone", e.target.value)
                  }
                  placeholder="Phone"
                />

                <Input
                  value={s(businessForm?.primaryEmail)}
                  onChange={(e) =>
                    onSetBusinessField?.("primaryEmail", e.target.value)
                  }
                  placeholder="Email"
                  type="email"
                />
              </div>

              <Input
                value={s(businessForm?.primaryAddress)}
                onChange={(e) =>
                  onSetBusinessField?.("primaryAddress", e.target.value)
                }
                placeholder="Address"
              />

              <Textarea
                value={s(manualSections?.servicesText)}
                onChange={(e) =>
                  onSetManualSection?.("servicesText", e.target.value)
                }
                placeholder="Services or products. One per line or comma separated."
                rows={4}
              />

              <Textarea
                value={s(manualSections?.faqsText)}
                onChange={(e) =>
                  onSetManualSection?.("faqsText", e.target.value)
                }
                placeholder="FAQs. Example:&#10;Q: Do you offer delivery?&#10;A: Yes, across Baku."
                rows={4}
              />

              <Textarea
                value={s(manualSections?.policiesText)}
                onChange={(e) =>
                  onSetManualSection?.("policiesText", e.target.value)
                }
                placeholder="Policies, pricing notes, booking rules, working hours, or other important details."
                rows={4}
              />
            </div>
          </SectionCard>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, delay: 0.08 }}
        className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-slate-200 bg-white px-6 py-5"
      >
        <div className="text-sm leading-6 text-slate-600">
          {hasSource && hasManualInput
            ? "Source + manual context will be analyzed together."
            : hasSource
              ? "Only the source will be analyzed."
              : hasManualInput
                ? "Only your manual input will be analyzed."
                : "Add a source, manual details, or both."}
        </div>

        <PrimaryButton
          disabled={!canContinue}
          loading={importingWebsite}
          onClick={handleContinue}
        >
          Analyze business
          <ArrowRight className="h-4 w-4" />
        </PrimaryButton>
      </motion.div>
    </section>
  );
}