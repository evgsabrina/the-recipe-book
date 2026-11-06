import { isAdmin, json } from "./_auth.js";
export async function onRequestGet({request,env}) { return json({admin:await isAdmin(request,env.AUTH_SECRET)}); }
