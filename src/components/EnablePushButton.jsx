import { useEffect, useState } from "react";
import { askPermission, getNotificationPermission, subscribePush } from "../lib/pushClient.js";

export default function EnablePushButton() {
  const [perm, setPerm] = useState("default");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getNotificationPermission().then(setPerm).catch(() => setPerm("default"));
  }, []);

  const enable = async () => {
    setBusy(true);
    setMsg("");
    try {
      const p = await askPermission();
      setPerm(p);

      if (p !== "granted") {
        setMsg("Permission denied. Browser settings-dən icazə ver.");
        return;
      }

      // VAPID public key-ni backend-dən ala bilərik, amma indi ən sadə yol:
      // VITE_VAPID_PUBLIC_KEY env (frontend) və ya bir /api endpoint əlavə edərik.
      const vapid = (import.meta?.env?.VITE_VAPID_PUBLIC_KEY || "").trim();
      if (!vapid) {
        setMsg("VITE_VAPID_PUBLIC_KEY yoxdur (frontend env).");
        return;
      }

      const r = await subscribePush({ vapidPublicKey: vapid, recipient: "ceo" });
      if (!r.ok) {
        setMsg(`Subscribe failed: ${r.json?.error || r.error || r.status}`);
        return;
      }
      setMsg("✅ Notifications enabled!");
    } catch (e) {
      setMsg(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <div style={{ fontSize: 14, opacity: 0.8 }}>
        Status: <b>{perm}</b>
      </div>

      <button
        onClick={enable}
        disabled={busy}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(255,255,255,.06)",
          color: "inherit",
          cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Enabling..." : "Enable Notifications"}
      </button>

      {msg ? <div style={{ fontSize: 13, opacity: 0.9 }}>{msg}</div> : null}
    </div>
  );
}