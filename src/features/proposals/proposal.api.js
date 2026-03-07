export async function fetchLatestDraft(apiBase, proposalId) {
  if (!apiBase || !proposalId) return null;

  const url = `${String(apiBase).replace(/\/+$/, "")}/api/content?proposalId=${encodeURIComponent(
    String(proposalId)
  )}`;

  const r = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!r.ok) return null;

  const j = await r.json().catch(() => null);

  const item =
    j?.content ||
    j?.item ||
    j?.draft ||
    (Array.isArray(j?.items) ? j.items[0] : null) ||
    (Array.isArray(j?.contentItems) ? j.contentItems[0] : null) ||
    null;

  return item || null;
}