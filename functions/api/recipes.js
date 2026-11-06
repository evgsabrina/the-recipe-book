import { isAdmin, json } from "./_auth.js";
export async function onRequestGet({ env }) {
  const { results = [] } = await env.DB.prepare("SELECT payload FROM recipes ORDER BY created_at DESC").all();
  const recipes = results.map(row => { try { return JSON.parse(row.payload); } catch { return null; } }).filter(Boolean);
  return json(recipes, 200, { "Cache-Control": "no-store" });
}
export async function onRequestPost({ request, env }) {
  if (!await isAdmin(request, env.AUTH_SECRET)) return json({ error: "Sessão administrativa inválida ou expirada. Entre novamente." }, 401, { "Cache-Control": "no-store" });
  let recipe;
  try { recipe = await request.json(); } catch { return json({ error: "Os dados da receita estão inválidos." }, 400); }
  if (!recipe || typeof recipe.name !== "string" || !recipe.name.trim()) return json({ error: "Informe o nome da receita." }, 400);
  recipe.id = String(recipe.id || crypto.randomUUID());
  delete recipe.__deleted;
  const payload = JSON.stringify(recipe);
  if (payload.length > 1_500_000) return json({ error: "Receita muito grande. Reduza o tamanho das imagens." }, 413);
  try {
    await env.DB.prepare("INSERT INTO recipes (id,name,payload,created_at) VALUES (?1,?2,?3,datetime('now')) ON CONFLICT(id) DO UPDATE SET name=excluded.name,payload=excluded.payload")
      .bind(recipe.id, recipe.name.trim(), payload).run();
    return json(recipe, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: "O banco de dados não conseguiu salvar a receita. " + (error?.message || "Tente novamente.") }, 500);
  }
}
