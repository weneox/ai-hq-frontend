import { useEffect, useState } from "react";
import Card from "../components/ui/Card.jsx";
import {
  askPermission,
  getNotificationPermission,
  subscribePush
} from "../lib/pushClient.js";

export default function Settings() {
  const [perm, setPerm] = useState("default");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getNotificationPermission().then(setPerm);
  }, []);

  const enableNotifications = async () => {
    setBusy(true);
    setMessage("");

    try {
      const p = await askPermission();
      setPerm(p);

      if (p !== "granted") {
        setMessage("Notification icazəsi verilmədi.");
        return;
      }

      const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      const res = await subscribePush({
        vapidPublicKey: vapid,
        recipient: "ceo"
      });

      if (!res.ok) {
        setMessage("Subscription uğursuz oldu.");
        return;
      }

      setMessage("✅ Push notifications aktiv edildi!");
    } catch (e) {
      setMessage(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const statusColor =
    perm === "granted"
      ? "text-emerald-500"
      : perm === "denied"
      ? "text-red-500"
      : "text-yellow-500";

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-lg font-semibold">Settings</div>

        <div className="text-sm text-slate-500 dark:text-slate-400">
          Integrations, branding və rol idarəsi gələcəkdə burada olacaq.
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <div className="text-md font-semibold">Mobile Notifications</div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">
              Status:
              <span className={`ml-2 font-semibold ${statusColor}`}>
                {perm}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-1">
              Real-time proposal və execution update-lər üçün.
            </div>
          </div>

          <button
            onClick={enableNotifications}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition text-white text-sm disabled:opacity-50"
          >
            {busy ? "Aktiv edilir..." : "Enable Notifications"}
          </button>
        </div>

        {message && (
          <div className="text-sm text-slate-400 border-t pt-3">
            {message}
          </div>
        )}
      </Card>
    </div>
  );
}