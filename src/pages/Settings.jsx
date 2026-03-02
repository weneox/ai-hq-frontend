import { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card.jsx";
import { askPermission, getNotificationPermission, subscribePush } from "../lib/pushClient.js";

export default function Settings() {
  const [perm, setPerm] = useState("default");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Read env once (avoid surprises)
  const env = useMemo(() => {
    const VAPID = String(import.meta.env?.VITE_VAPID_PUBLIC_KEY || "").trim();
    const API_BASE = String(import.meta.env?.VITE_API_BASE || "").trim();
    const DEBUG_PUSH = String(import.meta.env?.VITE_DEBUG_PUSH || "").trim();
    return { VAPID, API_BASE, DEBUG_PUSH };
  }, []);

  useEffect(() => {
    getNotificationPermission().then(setPerm).catch(() => setPerm("default"));

    // Optional debug
    if (env.DEBUG_PUSH === "1") {
      // Do NOT log the full VAPID key (security hygiene)
      console.log("[push][env] VITE_API_BASE =", env.API_BASE || "(empty => prod same-origin / dev fallback)");
      console.log("[push][env] VITE_VAPID_PUBLIC_KEY present =", Boolean(env.VAPID));
      console.log("[push][env] VITE_VAPID_PUBLIC_KEY len =", env.VAPID ? env.VAPID.length : 0);
    }
  }, [env.API_BASE, env.DEBUG_PUSH, env.VAPID]);

  const enableNotifications = async () => {
    setBusy(true);
    setMessage("");

    try {
      const p = await askPermission();
      setPerm(p);

      if (p !== "granted") {
        setMessage("Notification icazəsi verilmədi (browser settings-dən icazə ver).");
        return;
      }

      // IMPORTANT: must come from Vite env (VITE_ prefix)
      if (!env.VAPID) {
        setMessage(
          "VITE_VAPID_PUBLIC_KEY yoxdur (.env.local). " +
            "Yoxla: fayl project root-da olsun və Vite tam restart edilsin (Ctrl+C → npm run dev)."
        );
        return;
      }

      const res = await subscribePush({ vapidPublicKey: env.VAPID, recipient: "ceo" });

      if (!res?.ok) {
        const err = res?.json?.error || res?.error || res?.status || "unknown";
        setMessage(`Subscription uğursuz oldu: ${err}`);
        return;
      }

      setMessage("✅ Push notifications aktiv edildi!");
    } catch (e) {
      setMessage(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const statusColor =
    perm === "granted" ? "text-emerald-500" : perm === "denied" ? "text-red-500" : "text-yellow-500";

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-lg font-semibold">Settings</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Integrations, branding və rol idarəsi gələcəkdə burada olacaq.
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="text-md font-semibold">Mobile Notifications</div>

        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm">
              Status:
              <span className={`ml-2 font-semibold ${statusColor}`}>{perm}</span>
            </div>

            <div className="text-xs text-slate-500 mt-1">
              Real-time proposal və execution update-lər üçün.
            </div>

            {/* Small hint for debugging (does not reveal secret) */}
            <div className="text-xs text-slate-400 mt-2">
              VAPID key: <span className="font-semibold">{env.VAPID ? "✅ set" : "❌ missing"}</span>
              {env.VAPID ? ` (len=${env.VAPID.length})` : ""}
            </div>
          </div>

          <button
            onClick={enableNotifications}
            disabled={busy}
            className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white text-sm disabled:opacity-50"
          >
            {busy ? "Aktiv edilir..." : "Enable Notifications"}
          </button>
        </div>

        {message && <div className="text-sm text-slate-500 border-t pt-3">{message}</div>}
      </Card>
    </div>
  );
}