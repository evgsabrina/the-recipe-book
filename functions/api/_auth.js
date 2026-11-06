const enc = new TextEncoder();
function b64(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
async function sign(value, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}
export async function makeCookie(secret) {
  const exp = String(Date.now() + 7*24*60*60*1000);
  return `${exp}.${await sign(exp, secret)}`;
}
export async function isAdmin(request, secret) {
  const raw = request.headers.get("Cookie") || "";
  const token = raw.split(";").map(x=>x.trim()).find(x=>x.startsWith("recipe_admin="))?.slice("recipe_admin=".length);
  if (!token || !secret) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return sig === await sign(exp, secret);
}
export const cookieHeaders = (value) => ({
  "Set-Cookie": value ? `recipe_admin=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800` : "recipe_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
  "Cache-Control":"no-store"
});
export const json = (data, status=200, headers={}) => new Response(JSON.stringify(data), {status,headers:{"Content-Type":"application/json; charset=utf-8",...headers}});
