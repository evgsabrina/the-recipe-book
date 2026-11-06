import { isAdmin, json } from "../_auth.js";
export async function onRequestDelete({ request, env, params }) {
  if (!await isAdmin(request, env.AUTH_SECRET)) return json({ error: "Sessão administrativa inválida ou expirada. Entre novamente." }, 401, { "Cache-Control": "no-store" });
  let body = {};
  try { body = await request.json(); } catch {}
  const id = String(params.id || "");
  if (!id) return json({ error: "Receita não identificada." }, 400);
  try {
    if (body.isBuiltin === true) {
      const payload = JSON.stringify({ id, __deleted: true });
      await env.DB.prepare("INSERT INTO recipes (id,name,payload,created_at) VALUES (?1,'',?2,datetime('now')) ON CONFLICT(id) DO UPDATE SET name='',payload=excluded.payload")
        .bind(id, payload).run();
    } else {
      await env.DB.prepare("DELETE FROM recipes WHERE id=?1").bind(id).run();
    }
    return json({ ok: true }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: "Não foi possível excluir a receita. " + (error?.message || "Tente novamente.") }, 500);
  }
}
