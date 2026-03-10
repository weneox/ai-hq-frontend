// src/pages/Settings.jsx
// PREMIUM v4.0 — final editorial settings assembly

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Bot,
  Building2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Waypoints,
} from "lucide-react";

import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Badge from "../components/ui/Badge.jsx";

import SettingsShell from "../components/settings/SettingsShell.jsx";
import WorkspaceGeneralForm from "../components/settings/WorkspaceGeneralForm.jsx";
import BrandProfileForm from "../components/settings/BrandProfileForm.jsx";
import AiPolicyForm from "../components/settings/AiPolicyForm.jsx";
import SettingsSection from "../components/settings/SettingsSection.jsx";
import ChannelsPanel from "../components/settings/ChannelsPanel.jsx";
import AgentsPanel from "../components/settings/AgentsPanel.jsx";
import TeamPanel from "../components/settings/TeamPanel.jsx";
import SettingsSaveBar from "../components/settings/SettingsSaveBar.jsx";

import {
  askPermission,
  getNotificationPermission,
  subscribePush,
} from "../lib/pushClient.js";
import {
  getWorkspaceSettings,
  saveWorkspaceSettings,
  getWorkspaceChannels,
  saveWorkspaceChannel,
  getWorkspaceAgents,
  saveWorkspaceAgent,
} from "../api/settings.js";
import { isSettingsDirty, buildSettingsDirtyMap } from "../lib/settingsState.js";
import { cx } from "../lib/cx.js";

function pad2(n) {
  return String(Number(n || 0)).padStart(2, "0");
}

function clampHour(v, fallback = 10) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(23, n));
}

function clampMinute(v, fallback = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(59, n));
}

function normalizeTimeString(v, fallback = "10:00") {
  const raw = String(v || "").trim();
  const m = /^(\d{1,2}):(\d{1,2})$/.exec(raw);
  if (!m) return fallback;
  return `${pad2(clampHour(m[1]))}:${pad2(clampMinute(m[2]))}`;
}

function normalizeAutomationMode(v, fallback = "manual") {
  const x = String(v || fallback).trim().toLowerCase();
  return x === "full_auto" ? "full_auto" : "manual";
}

function Select({ className = "", children, ...props }) {
  return (
    <div
      className={cx(
        "relative w-full min-w-0 overflow-hidden rounded-[22px] border",
        "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_32px_rgba(15,23,42,0.06)]",
        "transition-[border-color,box-shadow,background-color] duration-200",
        "focus-within:border-sky-300/90 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_0_0_4px_rgba(56,189,248,0.08),0_16px_38px_rgba(15,23,42,0.08)]",
        "dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.72),rgba(2,6,23,0.80))]",
        "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_44px_rgba(0,0,0,0.46)]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[22px] bg-[linear-gradient(180deg,rgba(255,255,255,0.20),transparent_44%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10"
      />
      <select
        {...props}
        className="relative z-10 h-12 w-full appearance-none bg-transparent px-4 text-[14px] text-slate-900 outline-none dark:text-slate-100"
      >
        {children}
      </select>
    </div>
  );
}

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all duration-200",
        checked
          ? "border-sky-400/40 bg-[linear-gradient(180deg,rgba(14,165,233,0.92),rgba(37,99,235,0.92))] shadow-[0_10px_24px_rgba(37,99,235,0.24)]"
          : "border-slate-300/80 bg-slate-200/85 dark:border-white/10 dark:bg-white/[0.08]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      <span
        className={cx(
          "inline-block h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(15,23,42,0.18)] transition-all duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block space-y-2.5">
      <div className="space-y-1">
        <div className="text-[13px] font-semibold tracking-[-0.01em] text-slate-800 dark:text-slate-100">
          {label}
        </div>
        {hint ? (
          <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {hint}
          </div>
        ) : null}
      </div>
      {children}
    </label>
  );
}

function StatTile({ label, value, hint, tone = "neutral" }) {
  return (
    <Card variant="subtle" padded="md" tone={tone} className="rounded-[24px]">
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          {label}
        </div>
        <div className="text-[20px] font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
          {value}
        </div>
        {hint ? (
          <div className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {hint}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function FeatureToggleCard({
  title,
  subtitle,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <Card
      variant="subtle"
      padded="md"
      className="rounded-[24px]"
      tone={checked ? "info" : "neutral"}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {title}
            </div>
            <Badge
              tone={checked ? "success" : "neutral"}
              variant="subtle"
              size="sm"
              dot={checked}
            >
              {checked ? "On" : "Off"}
            </Badge>
          </div>

          <div className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {subtitle}
          </div>
        </div>

        <Toggle checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </Card>
  );
}

function AutoContentPanel({ aiPolicy, patchAi, canManage }) {
  const publishPolicy =
    aiPolicy && typeof aiPolicy.publish_policy === "object" && !Array.isArray(aiPolicy.publish_policy)
      ? aiPolicy.publish_policy
      : {};

  const schedule =
    publishPolicy && typeof publishPolicy.schedule === "object" && !Array.isArray(publishPolicy.schedule)
      ? publishPolicy.schedule
      : { enabled: false, time: "10:00", timezone: "Asia/Baku" };

  const automation =
    publishPolicy && typeof publishPolicy.automation === "object" && !Array.isArray(publishPolicy.automation)
      ? publishPolicy.automation
      : { enabled: false, mode: "manual" };

  function patchPublishPolicy(next) {
    if (!canManage) return;

    patchAi("publish_policy", {
      ...publishPolicy,
      ...next,
      schedule: {
        ...(publishPolicy.schedule || {}),
        ...(next.schedule || {}),
      },
      automation: {
        ...(publishPolicy.automation || {}),
        ...(next.automation || {}),
      },
    });
  }

  function onScheduleEnabledChange(checked) {
    patchPublishPolicy({
      schedule: {
        ...schedule,
        enabled: !!checked,
      },
    });
  }

  function onTimeChange(value) {
    patchPublishPolicy({
      schedule: {
        ...schedule,
        time: normalizeTimeString(value, "10:00"),
      },
    });
  }

  function onTimezoneChange(value) {
    patchPublishPolicy({
      schedule: {
        ...schedule,
        timezone: String(value || "Asia/Baku").trim() || "Asia/Baku",
      },
    });
  }

  function onAutomationEnabledChange(checked) {
    const enabled = !!checked;
    patchPublishPolicy({
      automation: {
        enabled,
        mode: enabled ? "full_auto" : "manual",
      },
    });
  }

  function onModeChange(value) {
    const mode = normalizeAutomationMode(value, "manual");
    patchPublishPolicy({
      automation: {
        enabled: mode === "full_auto",
        mode,
      },
    });
  }

  const fullAuto = !!automation.enabled || automation.mode === "full_auto";

  return (
    <SettingsSection
      eyebrow="Automation"
      title="Auto Content"
      subtitle="Daily scheduled draft creation və istəyə görə tam avtomatik publish davranışı."
      tone="default"
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card variant="surface" padded="lg" className="rounded-[28px]">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Badge tone="info" variant="subtle" dot>
                    Content Scheduler
                  </Badge>
                  <Badge
                    tone={schedule.enabled ? "success" : "neutral"}
                    variant="subtle"
                    dot={schedule.enabled}
                  >
                    {schedule.enabled ? "Scheduled" : "Disabled"}
                  </Badge>
                </div>

                <div className="text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Scheduled Draft Flow
                </div>
                <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Hər gün müəyyən vaxtda content flow başlasın və draft yaradılsın.
                </div>
              </div>

              <FeatureToggleCard
                title="Scheduled Content"
                subtitle="Cron vaxtında content flow avtomatik başlasın."
                checked={!!schedule.enabled}
                onChange={onScheduleEnabledChange}
                disabled={!canManage}
              />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="Run Time" hint="HH:MM formatında gündəlik işə düşmə vaxtı.">
                  <Input
                    type="time"
                    value={normalizeTimeString(schedule.time, "10:00")}
                    disabled={!canManage}
                    onChange={(e) => onTimeChange(e.target.value)}
                  />
                </Field>

                <Field label="Timezone" hint="Execution üçün əsas timezone.">
                  <Input
                    type="text"
                    value={schedule.timezone || "Asia/Baku"}
                    disabled={!canManage}
                    onChange={(e) => onTimezoneChange(e.target.value)}
                    placeholder="Asia/Baku"
                  />
                </Field>

                <StatTile
                  label="Next Mode"
                  value={schedule.enabled ? "Active" : "Idle"}
                  hint="Scheduler runtime state"
                  tone={schedule.enabled ? "success" : "neutral"}
                />
              </div>
            </div>
          </Card>

          <Card variant="surface" padded="lg" className="rounded-[28px]">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Badge
                    tone={fullAuto ? "warn" : "neutral"}
                    variant="subtle"
                    dot={fullAuto}
                  >
                    {fullAuto ? "Full Auto" : "Manual Gate"}
                  </Badge>
                </div>

                <div className="text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Publish Automation
                </div>
                <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Draft approval olmadan asset və publish mərhələsinə keçid davranışı.
                </div>
              </div>

              <FeatureToggleCard
                title="Full Auto Publish"
                subtitle="Risklidir. Manual təsdiq olmadan publish mərhələsinə keçə bilər."
                checked={fullAuto}
                onChange={onAutomationEnabledChange}
                disabled={!canManage}
              />

              <Field label="Publish Mode" hint="Manual approval və ya tam avtomatik rejim.">
                <Select
                  value={normalizeAutomationMode(automation.mode, "manual")}
                  disabled={!canManage}
                  onChange={(e) => onModeChange(e.target.value)}
                >
                  <option value="manual">Manual approval</option>
                  <option value="full_auto">Full auto publish</option>
                </Select>
              </Field>

              <div className="rounded-[24px] border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                Full auto publish aktiv olanda sistem cron vaxtında draft yarada,
                asset/video generasiya edə və publish mərhələsinə manual təsdiq olmadan
                keçə bilər.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SettingsSection>
  );
}

function NotificationsPanel({
  perm,
  pushBusy,
  pushMessage,
  env,
  enableNotifications,
}) {
  const permissionTone =
    perm === "granted" ? "success" : perm === "denied" ? "danger" : "warn";

  return (
    <SettingsSection
      eyebrow="Notifications"
      title="Mobile Notifications"
      subtitle="Push subscription status və browser notification icazələri."
      tone="default"
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <Card variant="surface" padded="lg" className="rounded-[28px]">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Badge tone="info" variant="subtle" dot>
                    Push Delivery
                  </Badge>
                  <Badge tone={permissionTone} variant="subtle" dot>
                    {perm}
                  </Badge>
                </div>

                <div className="text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Browser Permission State
                </div>
                <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Real-time proposal və execution update-ləri üçün browser notification icazəsi.
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile
                  label="Permission"
                  value={perm}
                  hint="Browser notification state"
                  tone={permissionTone}
                />
                <StatTile
                  label="VAPID"
                  value={env.VAPID ? "Configured" : "Missing"}
                  hint={env.VAPID ? `len=${env.VAPID.length}` : "VITE_VAPID_PUBLIC_KEY"}
                  tone={env.VAPID ? "success" : "danger"}
                />
                <StatTile
                  label="API Base"
                  value={env.API_BASE ? "Configured" : "Default"}
                  hint={env.API_BASE || "Using default"}
                  tone="info"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={enableNotifications} disabled={pushBusy} leftIcon={<BellRing className="h-4 w-4" />}>
                  {pushBusy ? "Aktiv edilir..." : "Enable Notifications"}
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="subtle" padded="lg" className="rounded-[28px]">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  Delivery Notes
                </div>
                <div className="text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Push Status
                </div>
                <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Subscription, permission və environment readiness burada görünür.
                </div>
              </div>

              {pushMessage ? (
                <div className="rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                  {pushMessage}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200/80 bg-white/60 px-4 py-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                  Hələ push əməliyyatı yoxdur.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </SettingsSection>
  );
}

function normalizeWorkspace(raw) {
  const tenant = raw?.tenant || {};
  const profile = raw?.profile || {};
  const ai = raw?.aiPolicy || {};
  const publishPolicy =
    ai && typeof ai.publish_policy === "object" && !Array.isArray(ai.publish_policy)
      ? ai.publish_policy
      : {};

  const oldDraftSchedule =
    publishPolicy &&
    typeof publishPolicy.draftSchedule === "object" &&
    !Array.isArray(publishPolicy.draftSchedule)
      ? publishPolicy.draftSchedule
      : {};

  const schedule =
    publishPolicy &&
    typeof publishPolicy.schedule === "object" &&
    !Array.isArray(publishPolicy.schedule)
      ? publishPolicy.schedule
      : {};

  const automation =
    publishPolicy &&
    typeof publishPolicy.automation === "object" &&
    !Array.isArray(publishPolicy.automation)
      ? publishPolicy.automation
      : {};

  const scheduleTime =
    typeof schedule.time === "string" && schedule.time.trim()
      ? normalizeTimeString(schedule.time, "10:00")
      : `${pad2(clampHour(oldDraftSchedule?.hour, 10))}:${pad2(
          clampMinute(oldDraftSchedule?.minute, 0)
        )}`;

  const scheduleTimezone =
    schedule.timezone || oldDraftSchedule?.timezone || tenant?.timezone || "Asia/Baku";

  const automationEnabled =
    typeof automation.enabled === "boolean"
      ? automation.enabled
      : normalizeAutomationMode(automation.mode, "manual") === "full_auto";

  const automationMode = normalizeAutomationMode(
    automation.mode,
    automationEnabled ? "full_auto" : "manual"
  );

  return {
    tenantKey: tenant?.tenant_key || "neox",
    viewerRole: String(raw?.viewerRole || raw?.role || "owner").trim().toLowerCase(),

    tenant: {
      company_name: tenant?.company_name || "",
      legal_name: tenant?.legal_name || "",
      industry_key: tenant?.industry_key || "generic_business",
      country_code: tenant?.country_code || "AZ",
      timezone: tenant?.timezone || "Asia/Baku",
      default_language: tenant?.default_language || "az",
      enabled_languages: Array.isArray(tenant?.enabled_languages)
        ? tenant.enabled_languages
        : ["az"],
      market_region: tenant?.market_region || "",
      plan_key: tenant?.plan_key || "starter",
      status: tenant?.status || "active",
      active: typeof tenant?.active === "boolean" ? tenant.active : true,
    },

    profile: {
      brand_name: profile?.brand_name || "",
      website_url: profile?.website_url || "",
      public_email: profile?.public_email || "",
      public_phone: profile?.public_phone || "",
      audience_summary: profile?.audience_summary || "",
      services_summary: profile?.services_summary || "",
      value_proposition: profile?.value_proposition || "",
      brand_summary: profile?.brand_summary || "",
      tone_of_voice: profile?.tone_of_voice || "professional",
      preferred_cta: profile?.preferred_cta || "",
      banned_phrases: Array.isArray(profile?.banned_phrases) ? profile.banned_phrases : [],
      communication_rules:
        profile &&
        typeof profile.communication_rules === "object" &&
        !Array.isArray(profile.communication_rules)
          ? profile.communication_rules
          : {},
      visual_style:
        profile &&
        typeof profile.visual_style === "object" &&
        !Array.isArray(profile.visual_style)
          ? profile.visual_style
          : {},
      extra_context:
        profile &&
        typeof profile.extra_context === "object" &&
        !Array.isArray(profile.extra_context)
          ? profile.extra_context
          : {},
    },

    aiPolicy: {
      auto_reply_enabled:
        typeof ai?.auto_reply_enabled === "boolean" ? ai.auto_reply_enabled : true,
      suppress_ai_during_handoff:
        typeof ai?.suppress_ai_during_handoff === "boolean"
          ? ai.suppress_ai_during_handoff
          : true,
      mark_seen_enabled:
        typeof ai?.mark_seen_enabled === "boolean" ? ai.mark_seen_enabled : true,
      typing_indicator_enabled:
        typeof ai?.typing_indicator_enabled === "boolean"
          ? ai.typing_indicator_enabled
          : true,
      create_lead_enabled:
        typeof ai?.create_lead_enabled === "boolean" ? ai.create_lead_enabled : true,
      approval_required_content:
        typeof ai?.approval_required_content === "boolean"
          ? ai.approval_required_content
          : true,
      approval_required_publish:
        typeof ai?.approval_required_publish === "boolean"
          ? ai.approval_required_publish
          : true,
      quiet_hours_enabled:
        typeof ai?.quiet_hours_enabled === "boolean" ? ai.quiet_hours_enabled : false,
      quiet_hours:
        ai &&
        typeof ai.quiet_hours === "object" &&
        !Array.isArray(ai.quiet_hours)
          ? ai.quiet_hours
          : { startHour: 0, endHour: 0 },
      inbox_policy:
        ai &&
        typeof ai.inbox_policy === "object" &&
        !Array.isArray(ai.inbox_policy)
          ? ai.inbox_policy
          : {},
      comment_policy:
        ai &&
        typeof ai.comment_policy === "object" &&
        !Array.isArray(ai.comment_policy)
          ? ai.comment_policy
          : {},
      content_policy:
        ai &&
        typeof ai.content_policy === "object" &&
        !Array.isArray(ai.content_policy)
          ? ai.content_policy
          : {},
      escalation_rules:
        ai &&
        typeof ai.escalation_rules === "object" &&
        !Array.isArray(ai.escalation_rules)
          ? ai.escalation_rules
          : {},
      risk_rules:
        ai &&
        typeof ai.risk_rules === "object" &&
        !Array.isArray(ai.risk_rules)
          ? ai.risk_rules
          : {},
      lead_scoring_rules:
        ai &&
        typeof ai.lead_scoring_rules === "object" &&
        !Array.isArray(ai.lead_scoring_rules)
          ? ai.lead_scoring_rules
          : {},
      publish_policy: {
        ...(publishPolicy || {}),
        schedule: {
          enabled:
            typeof schedule?.enabled === "boolean"
              ? schedule.enabled
              : typeof oldDraftSchedule?.enabled === "boolean"
              ? oldDraftSchedule.enabled
              : false,
          time: scheduleTime,
          timezone: scheduleTimezone,
        },
        automation: {
          enabled: automationEnabled,
          mode: automationMode,
        },
        draftSchedule: {
          enabled:
            typeof schedule?.enabled === "boolean"
              ? schedule.enabled
              : typeof oldDraftSchedule?.enabled === "boolean"
              ? oldDraftSchedule.enabled
              : false,
          hour: clampHour(oldDraftSchedule?.hour, Number(scheduleTime.split(":")[0])),
          minute: clampMinute(oldDraftSchedule?.minute, Number(scheduleTime.split(":")[1])),
          timezone: scheduleTimezone,
          format: oldDraftSchedule?.format || "image",
        },
      },
    },
  };
}

function buildSafeWorkspaceSavePayload(workspace) {
  const publishPolicy =
    workspace?.aiPolicy &&
    typeof workspace.aiPolicy.publish_policy === "object" &&
    !Array.isArray(workspace.aiPolicy.publish_policy)
      ? workspace.aiPolicy.publish_policy
      : {};

  const schedule =
    publishPolicy && typeof publishPolicy.schedule === "object" && !Array.isArray(publishPolicy.schedule)
      ? publishPolicy.schedule
      : {};

  const automation =
    publishPolicy &&
    typeof publishPolicy.automation === "object" &&
    !Array.isArray(publishPolicy.automation)
      ? publishPolicy.automation
      : {};

  const safeTime = normalizeTimeString(schedule.time, "10:00");
  const safeMode = normalizeAutomationMode(
    automation.mode,
    automation.enabled ? "full_auto" : "manual"
  );
  const safeAutomationEnabled =
    typeof automation.enabled === "boolean" ? automation.enabled : safeMode === "full_auto";

  return {
    tenant: {
      company_name: workspace?.tenant?.company_name || "",
      legal_name: workspace?.tenant?.legal_name || "",
      industry_key: workspace?.tenant?.industry_key || "generic_business",
      country_code: workspace?.tenant?.country_code || "AZ",
      timezone: workspace?.tenant?.timezone || "Asia/Baku",
      default_language: workspace?.tenant?.default_language || "az",
      enabled_languages: Array.isArray(workspace?.tenant?.enabled_languages)
        ? workspace.tenant.enabled_languages
        : ["az"],
      market_region: workspace?.tenant?.market_region || "",
    },

    profile: {
      brand_name: workspace?.profile?.brand_name || "",
      website_url: workspace?.profile?.website_url || "",
      public_email: workspace?.profile?.public_email || "",
      public_phone: workspace?.profile?.public_phone || "",
      audience_summary: workspace?.profile?.audience_summary || "",
      services_summary: workspace?.profile?.services_summary || "",
      value_proposition: workspace?.profile?.value_proposition || "",
      brand_summary: workspace?.profile?.brand_summary || "",
      tone_of_voice: workspace?.profile?.tone_of_voice || "professional",
      preferred_cta: workspace?.profile?.preferred_cta || "",
      banned_phrases: Array.isArray(workspace?.profile?.banned_phrases)
        ? workspace.profile.banned_phrases
        : [],
      communication_rules:
        workspace?.profile &&
        typeof workspace.profile.communication_rules === "object" &&
        !Array.isArray(workspace.profile.communication_rules)
          ? workspace.profile.communication_rules
          : {},
      visual_style:
        workspace?.profile &&
        typeof workspace.profile.visual_style === "object" &&
        !Array.isArray(workspace.profile.visual_style)
          ? workspace.profile.visual_style
          : {},
      extra_context:
        workspace?.profile &&
        typeof workspace.profile.extra_context === "object" &&
        !Array.isArray(workspace.profile.extra_context)
          ? workspace.profile.extra_context
          : {},
    },

    aiPolicy: {
      auto_reply_enabled: !!workspace?.aiPolicy?.auto_reply_enabled,
      suppress_ai_during_handoff: !!workspace?.aiPolicy?.suppress_ai_during_handoff,
      mark_seen_enabled: !!workspace?.aiPolicy?.mark_seen_enabled,
      typing_indicator_enabled: !!workspace?.aiPolicy?.typing_indicator_enabled,
      create_lead_enabled: !!workspace?.aiPolicy?.create_lead_enabled,
      approval_required_content: !!workspace?.aiPolicy?.approval_required_content,
      approval_required_publish: !!workspace?.aiPolicy?.approval_required_publish,
      quiet_hours_enabled: !!workspace?.aiPolicy?.quiet_hours_enabled,
      quiet_hours:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.quiet_hours === "object" &&
        !Array.isArray(workspace.aiPolicy.quiet_hours)
          ? workspace.aiPolicy.quiet_hours
          : { startHour: 0, endHour: 0 },
      inbox_policy:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.inbox_policy === "object" &&
        !Array.isArray(workspace.aiPolicy.inbox_policy)
          ? workspace.aiPolicy.inbox_policy
          : {},
      comment_policy:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.comment_policy === "object" &&
        !Array.isArray(workspace.aiPolicy.comment_policy)
          ? workspace.aiPolicy.comment_policy
          : {},
      content_policy:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.content_policy === "object" &&
        !Array.isArray(workspace.aiPolicy.content_policy)
          ? workspace.aiPolicy.content_policy
          : {},
      escalation_rules:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.escalation_rules === "object" &&
        !Array.isArray(workspace.aiPolicy.escalation_rules)
          ? workspace.aiPolicy.escalation_rules
          : {},
      risk_rules:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.risk_rules === "object" &&
        !Array.isArray(workspace.aiPolicy.risk_rules)
          ? workspace.aiPolicy.risk_rules
          : {},
      lead_scoring_rules:
        workspace?.aiPolicy &&
        typeof workspace.aiPolicy.lead_scoring_rules === "object" &&
        !Array.isArray(workspace.aiPolicy.lead_scoring_rules)
          ? workspace.aiPolicy.lead_scoring_rules
          : {},
      publish_policy: {
        ...publishPolicy,
        schedule: {
          enabled: !!schedule.enabled,
          time: safeTime,
          timezone:
            String(schedule.timezone || workspace?.tenant?.timezone || "Asia/Baku").trim() ||
            "Asia/Baku",
        },
        automation: {
          enabled: !!safeAutomationEnabled,
          mode: safeMode,
        },
        draftSchedule: {
          enabled: !!schedule.enabled,
          hour: Number(safeTime.split(":")[0]),
          minute: Number(safeTime.split(":")[1]),
          timezone:
            String(schedule.timezone || workspace?.tenant?.timezone || "Asia/Baku").trim() ||
            "Asia/Baku",
          format:
            publishPolicy &&
            typeof publishPolicy.draftSchedule === "object" &&
            !Array.isArray(publishPolicy.draftSchedule)
              ? publishPolicy.draftSchedule.format || "image"
              : "image",
        },
      },
    },
  };
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [workspace, setWorkspace] = useState(() =>
    normalizeWorkspace({
      tenant: { tenant_key: "neox" },
      profile: {},
      aiPolicy: {},
      viewerRole: "owner",
    })
  );
  const [initialWorkspace, setInitialWorkspace] = useState(() =>
    normalizeWorkspace({
      tenant: { tenant_key: "neox" },
      profile: {},
      aiPolicy: {},
      viewerRole: "owner",
    })
  );

  const [channels, setChannels] = useState([]);
  const [agents, setAgents] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);

  const [perm, setPerm] = useState("default");
  const [pushBusy, setPushBusy] = useState(false);

  const [message, setMessage] = useState("");
  const [pushMessage, setPushMessage] = useState("");

  const env = useMemo(() => {
    const VAPID = String(import.meta.env?.VITE_VAPID_PUBLIC_KEY || "").trim();
    const API_BASE = String(import.meta.env?.VITE_API_BASE || "").trim();
    const DEBUG_PUSH = String(import.meta.env?.VITE_DEBUG_PUSH || "").trim();
    return { VAPID, API_BASE, DEBUG_PUSH };
  }, []);

  const dirty = useMemo(() => {
    return isSettingsDirty(workspace, initialWorkspace);
  }, [workspace, initialWorkspace]);

  const dirtyMap = useMemo(() => {
    return buildSettingsDirtyMap(workspace, initialWorkspace);
  }, [workspace, initialWorkspace]);

  const viewerRole = String(workspace?.viewerRole || "owner").toLowerCase();
  const canManageSettings = viewerRole === "owner" || viewerRole === "admin";

  const navItems = useMemo(
    () => [
      {
        key: "general",
        label: "General",
        description: "Workspace identity, region, language",
        dirty: dirtyMap.general,
        icon: Building2,
      },
      {
        key: "brand",
        label: "Brand",
        description: "Voice, audience, services, CTA",
        dirty: dirtyMap.brand,
        icon: Sparkles,
      },
      {
        key: "ai_policy",
        label: "AI Policy",
        description: "Auto reply, approvals, quiet hours",
        dirty: dirtyMap.ai_policy,
        icon: ShieldCheck,
      },
      {
        key: "channels",
        label: "Channels",
        description: "Instagram, WhatsApp, Messenger",
        dirty: dirtyMap.channels,
        icon: Waypoints,
      },
      {
        key: "agents",
        label: "Agents",
        description: "Agent status, model, enable/disable",
        dirty: dirtyMap.agents,
        icon: Bot,
      },
      {
        key: "team",
        label: "Team",
        description: "Workspace users, roles, access",
        dirty: false,
        icon: Users,
      },
      {
        key: "notifications",
        label: "Notifications",
        description: "Push subscription and browser status",
        dirty: dirtyMap.notifications,
        icon: BellRing,
      },
    ],
    [dirtyMap]
  );

  useEffect(() => {
    getNotificationPermission().then(setPerm).catch(() => setPerm("default"));

    if (env.DEBUG_PUSH === "1") {
      console.log("[push][env] VITE_API_BASE =", env.API_BASE || "(empty)");
      console.log("[push][env] VITE_VAPID_PUBLIC_KEY present =", Boolean(env.VAPID));
      console.log("[push][env] VITE_VAPID_PUBLIC_KEY len =", env.VAPID ? env.VAPID.length : 0);
    }
  }, [env.API_BASE, env.DEBUG_PUSH, env.VAPID]);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setChannelsLoading(true);
      setAgentsLoading(true);
      setMessage("");

      try {
        const [settings, ch, ag] = await Promise.all([
          getWorkspaceSettings(),
          getWorkspaceChannels().catch(() => []),
          getWorkspaceAgents().catch(() => []),
        ]);

        if (!mounted) return;

        const normalized = normalizeWorkspace(settings);
        setWorkspace(normalized);
        setInitialWorkspace(normalized);
        setChannels(Array.isArray(ch) ? ch : []);
        setAgents(Array.isArray(ag) ? ag : []);
      } catch (e) {
        if (!mounted) return;
        setMessage(String(e?.message || e));
      } finally {
        if (!mounted) return;
        setLoading(false);
        setChannelsLoading(false);
        setAgentsLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  function patchTenant(key, value) {
    if (!canManageSettings) return;
    setWorkspace((prev) => ({
      ...prev,
      tenant: { ...prev.tenant, [key]: value },
    }));
  }

  function patchProfile(key, value) {
    if (!canManageSettings) return;
    setWorkspace((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: value },
    }));
  }

  function patchAi(key, value) {
    if (!canManageSettings) return;
    setWorkspace((prev) => ({
      ...prev,
      aiPolicy: { ...prev.aiPolicy, [key]: value },
    }));
  }

  async function onSaveWorkspace() {
    if (!canManageSettings) {
      setMessage("Bu hissəni yalnız owner/admin dəyişə bilər.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = buildSafeWorkspaceSavePayload(workspace);
      const res = await saveWorkspaceSettings(payload);
      const normalized = normalizeWorkspace(res);

      setWorkspace(normalized);
      setInitialWorkspace(normalized);
      setMessage("✅ Workspace settings yadda saxlanıldı.");
    } catch (e) {
      setMessage(String(e?.message || e));
    } finally {
      setSaving(false);
    }
  }

  function onResetWorkspace() {
    setWorkspace(initialWorkspace);
    setMessage("↩️ Dəyişikliklər geri qaytarıldı.");
  }

  async function saveChannel(channelType, existing = {}) {
    if (!canManageSettings) {
      setMessage("Channel dəyişiklikləri yalnız owner/admin üçündür.");
      return;
    }

    try {
      const payload = {
        provider: existing.provider || "meta",
        display_name: existing.display_name || "",
        external_account_id: existing.external_account_id || null,
        external_page_id: existing.external_page_id || null,
        external_user_id: existing.external_user_id || null,
        external_username: existing.external_username || null,
        status: existing.status || "disconnected",
        is_primary: !!existing.is_primary,
        config: existing.config || {},
        secrets_ref: existing.secrets_ref || null,
        health: existing.health || {},
        last_sync_at: existing.last_sync_at || null,
      };

      await saveWorkspaceChannel(channelType, payload);
      const ch = await getWorkspaceChannels();
      setChannels(Array.isArray(ch) ? ch : []);
      setMessage(`✅ ${channelType} channel yeniləndi.`);
    } catch (e) {
      setMessage(String(e?.message || e));
    }
  }

  async function saveAgent(agentKey, payload) {
    if (!canManageSettings) {
      setMessage("Agent dəyişiklikləri yalnız owner/admin üçündür.");
      return;
    }

    try {
      await saveWorkspaceAgent(agentKey, {
        display_name: payload.display_name,
        role_summary: payload.role_summary,
        enabled: payload.enabled,
        model: payload.model,
        temperature: payload.temperature,
        prompt_overrides: payload.prompt_overrides || {},
        tool_access: payload.tool_access || {},
        limits: payload.limits || {},
      });

      const ag = await getWorkspaceAgents();
      setAgents(Array.isArray(ag) ? ag : []);
      setMessage(`✅ ${agentKey} agent yeniləndi.`);
    } catch (e) {
      setMessage(String(e?.message || e));
    }
  }

  async function enableNotifications() {
    setPushBusy(true);
    setPushMessage("");

    try {
      const p = await askPermission();
      setPerm(p);

      if (p !== "granted") {
        setPushMessage("Notification icazəsi verilmədi. Browser settings-dən icazə ver.");
        return;
      }

      if (!env.VAPID) {
        setPushMessage("VITE_VAPID_PUBLIC_KEY yoxdur. .env.local yoxla və Vite restart et.");
        return;
      }

      const res = await subscribePush({
        vapidPublicKey: env.VAPID,
        recipient: "ceo",
      });

      if (!res?.ok) {
        const err = res?.json?.error || res?.error || res?.status || "unknown";
        setPushMessage(`Subscription uğursuz oldu: ${err}`);
        return;
      }

      setPushMessage("✅ Push notifications aktiv edildi.");
    } catch (e) {
      setPushMessage(String(e?.message || e));
    } finally {
      setPushBusy(false);
    }
  }

  function renderSection() {
    switch (activeSection) {
      case "general":
        return (
          <WorkspaceGeneralForm
            tenantKey={workspace.tenantKey}
            tenant={workspace.tenant}
            patchTenant={patchTenant}
          />
        );

      case "brand":
        return (
          <BrandProfileForm
            profile={workspace.profile}
            patchProfile={patchProfile}
          />
        );

      case "ai_policy":
        return (
          <div className="space-y-6">
            <AiPolicyForm aiPolicy={workspace.aiPolicy} patchAi={patchAi} />
            <AutoContentPanel
              aiPolicy={workspace.aiPolicy}
              patchAi={patchAi}
              canManage={canManageSettings}
            />
          </div>
        );

      case "channels":
        return (
          <ChannelsPanel
            channels={channels}
            loading={channelsLoading}
            canManage={canManageSettings}
            onSaveChannel={saveChannel}
          />
        );

      case "agents":
        return (
          <AgentsPanel
            agents={agents}
            loading={agentsLoading}
            canManage={canManageSettings}
            onSaveAgent={saveAgent}
          />
        );

      case "team":
        return <TeamPanel canManage={canManageSettings} />;

      case "notifications":
        return (
          <NotificationsPanel
            perm={perm}
            pushBusy={pushBusy}
            pushMessage={pushMessage}
            env={env}
            enableNotifications={enableNotifications}
          />
        );

      default:
        return null;
    }
  }

  return (
    <SettingsShell
      title="Settings"
      subtitle="Workspace, brand, AI policy, team və integrations idarəsi."
      items={navItems}
      activeKey={activeSection}
      onChange={setActiveSection}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={canManageSettings ? "success" : "warn"}
              variant="subtle"
              dot={canManageSettings}
            >
              {canManageSettings ? "Owner / Admin Access" : "Read Only Access"}
            </Badge>

            <Badge tone={dirty ? "info" : "neutral"} variant="subtle" dot={dirty}>
              {dirty ? "Unsaved Workspace Edits" : "Workspace Synced"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>

            {!dirty ? (
              <Button
                onClick={onSaveWorkspace}
                disabled={loading || saving || !canManageSettings}
              >
                {saving ? "Saving..." : "Save Workspace"}
              </Button>
            ) : null}
          </div>
        </div>

        {!canManageSettings ? (
          <div className="rounded-[24px] border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
            Bu workspace-də settings dəyişmək səlahiyyəti yalnız owner/admin üçündür.
          </div>
        ) : null}

        {message ? (
          <div className="rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-4 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {message}
          </div>
        ) : null}

        {renderSection()}

        <SettingsSaveBar
          dirty={dirty && canManageSettings}
          saving={saving}
          message={message}
          onReset={onResetWorkspace}
          onSave={onSaveWorkspace}
        />
      </div>
    </SettingsShell>
  );
}