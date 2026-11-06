import { makeCookie, cookieHeaders, json } from "./_auth.js";
export async function onRequestPost({request, env}) {
  if (!env.ADMIN_PASSWORD || !env.AUTH_SECRET) return json({error:"Admin secrets are not configured."},503);
  let body; try { body = await request.json(); } catch { return json({error:"Invalid JSON"},400); }
  if (typeof body.password !== "string" || body.password !== env.ADMIN_PASSWORD) return json({error:"Unauthorized"},401);
  return json({ok:true},200,cookieHeaders(await makeCookie(env.AUTH_SECRET)));
}
