import { isAdmin, json } from "../_auth.js";
export async function onRequestDelete({request,env,params}) {
  if (!await isAdmin(request,env.AUTH_SECRET)) return json({error:"Unauthorized"},401);
  await env.DB.prepare("DELETE FROM recipes WHERE id=?1").bind(params.id).run();
  return json({ok:true});
}
