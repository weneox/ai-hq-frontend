// src/components/settings/ChannelsPanel.jsx
// PREMIUM v3.0 — editorial channels control surface

import {
  Link2,
  Loader2,
  Radio,
  ShieldAlert,
  Sparkles,
  Waypoints,
} from "lucide-react";

import Card from "../ui/Card.jsx";
import Badge from "../ui/Badge.jsx";
import SettingsSection from "./SettingsSection.jsx";
import ChannelEditorCard from "./ChannelEditorCard.jsx";

function StatTile({ label, value, hint, tone = "neutral" }) {
  return (
    <Card
      variant="subtle"
      padded="md"
      tone={tone}
      className="rounded-[24px]"
    >
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

function statusTone(status) {
  const x = String(status || "").toLowerCase();
  if (x === "connected" || x === "active" || x === "healthy") return "success";
  if (x === "pending" || x === "warning") return "warn";
  if (x === "disconnected" || x === "error" || x === "failed") return "danger";
  return "neutral";
}

export default function ChannelsPanel({
  channels = [],
  loading = false,
  canManage = true,
  onSaveChannel,
}) {
  const connectedCount = channels.filter((x) => {
    const s = String(x?.status || "").toLowerCase();
    return s === "connected" || s === "active" || s === "healthy";
  }).length;

  const primaryCount = channels.filter((x) => !!x?.is_primary).length;

  async function handleSave(channel) {
    if (!canManage) return;
    await onSaveChannel(channel.channel_type, channel);
  }

  return (
    <SettingsSection
      eyebrow="Channels"
      title="Channels"
      subtitle="Instagram, WhatsApp, Messenger və digər tenant-level channel konfiqləri burada idarə olunur."
      tone="default"
    >
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <Card variant="surface" padded="lg" className="rounded-[28px]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="inline-flex flex-wrap items-center gap-2">
                  <Badge tone="info" variant="subtle" dot>
                    Channel Layer
                  </Badge>
                  <Badge
                    tone={connectedCount > 0 ? "success" : "neutral"}
                    variant="subtle"
                    dot={connectedCount > 0}
                  >
                    {connectedCount} connected
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[26px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    Tenant Channel Topology
                  </div>
                  <div className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Provider config, external IDs, primary routing və connection
                    state bu hissədən idarə olunur.
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px]">
                <StatTile
                  label="Channels"
                  value={channels.length}
                  hint="Configured endpoints"
                  tone="info"
                />
                <StatTile
                  label="Connected"
                  value={connectedCount}
                  hint="Live integrations"
                  tone={connectedCount > 0 ? "success" : "neutral"}
                />
                <StatTile
                  label="Primary"
                  value={primaryCount}
                  hint="Primary routes"
                  tone={primaryCount > 0 ? "warn" : "neutral"}
                />
              </div>
            </div>
          </Card>

          <Card variant="subtle" padded="lg" className="rounded-[28px]">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  Access State
                </div>
                <div className="text-lg font-semibold tracking-[-0.02em] text-slate-950 dark:text-white">
                  Management Access
                </div>
                <div className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Channel konfiqləri yalnız icazəli istifadəçilər tərəfindən
                  dəyişdirilməlidir.
                </div>
              </div>

              {canManage ? (
                <div className="rounded-[24px] border border-emerald-200/80 bg-emerald-50/90 px-4 py-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                  Owner/Admin icazəsi aktivdir. Channel dəyişiklikləri saxlana bilər.
                </div>
              ) : (
                <div className="rounded-[24px] border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                  Read-only görünüşdür. Channel dəyişiklikləri yalnız owner/admin
                  üçündür.
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <StatTile
                  label="Permission"
                  value={canManage ? "Write" : "Read Only"}
                  hint="Current operator mode"
                  tone={canManage ? "success" : "warn"}
                />
                <StatTile
                  label="Providers"
                  value={
                    [...new Set(channels.map((x) => x?.provider).filter(Boolean))].length
                  }
                  hint="Unique integrations"
                  tone="info"
                />
                <StatTile
                  label="Topology"
                  value={channels.length ? "Configured" : "Empty"}
                  hint="Current channel surface"
                  tone={channels.length ? "neutral" : "warn"}
                />
              </div>
            </div>
          </Card>
        </div>

        {loading ? (
          <Card variant="subtle" padded="lg" className="rounded-[28px]">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Channels yüklənir...
            </div>
          </Card>
        ) : channels.length === 0 ? (
          <Card variant="subtle" padded="lg" className="rounded-[28px]">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-200/80 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                <Waypoints className="h-5 w-5" strokeWidth={1.9} />
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Channel tapılmadı
                </div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Bu tenant üçün hələ heç bir channel konfiqurasiyası mövcud deyil.
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5">
            {channels.map((channel) => {
              const key =
                channel?.id || `${channel?.channel_type}-${channel?.provider}`;

              return (
                <ChannelEditorCard
                  key={key}
                  channel={channel}
                  readOnly={!canManage}
                  onSave={handleSave}
                />
              );
            })}
          </div>
        )}
      </div>
    </SettingsSection>
  );
}