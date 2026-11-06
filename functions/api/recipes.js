import { isAdmin, json } from "./_auth.js";
export async function onRequestGet({env}) {
  const {results=[]} = await env.DB.prepare("SELECT payload FROM recipes ORDER BY created_at DESC").all();
  return json(results.map(row => { try { return JSON.parse(row.payload); } catch { return null; } }).filter(Boolean),200,{"Cache-Control":"no-store"});
}
export async function onRequestPost({request,env}) {
  if (!await isAdmin(request,env.AUTH_SECRET)) return json({error:"Unauthorized"},401);
  let recipe; try { recipe=await request.json(); } catch { return json({error:"Invalid JSON"},400); }
  if (!recipe || typeof recipe.name!=="string" || !recipe.name.trim()) return json({error:"Recipe name is required"},400);
  recipe.id = String(recipe.id || crypto.randomUUID());
  const payload=JSON.stringify(recipe);
  if (payload.length > 1_500_000) return json({error:"Receita muito grande. Reduza o tamanho das imagens."},413);
  await env.DB.prepare("INSERT INTO recipes (id,name,payload,created_at) VALUES (?1,?2,?3,datetime('now')) ON CONFLICT(id) DO UPDATE SET name=excluded.name,payload=excluded.payload")
    .bind(recipe.id,recipe.name.trim(),payload).run();
  return json(recipe,201);
}
