import { isAdmin, json } from "./_auth.js";

export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = ?1").bind("covers").first();
  let covers = {};
  if (row?.value) {
    try { covers = JSON.parse(row.value); } catch { covers = {}; }
  }
  return json({ covers, configured: !!row?.value }, 200, { "Cache-Control": "no-store" });
}

export async function onRequestPut({ request, env }) {
  if (!await isAdmin(request, env.AUTH_SECRET)) return json({ error: "Unauthorized" }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body || !body.covers || typeof body.covers !== "object" || Array.isArray(body.covers)) {
    return json({ error: "Invalid covers data" }, 400);
  }
  const value = JSON.stringify(body.covers);
  if (value.length > 1_850_000) return json({ error: "As imagens ainda estão muito grandes para o banco de dados. Reduza o tamanho das fotos e tente novamente." }, 413);
  await env.DB.prepare("INSERT INTO site_settings (key, value, updated_at) VALUES (?1, ?2, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .bind("covers", value).run();
  return json({ success: true }, 200, { "Cache-Control": "no-store" });
}
