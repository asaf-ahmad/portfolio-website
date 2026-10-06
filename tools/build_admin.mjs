#!/usr/bin/env node
/**
 * Encrypt the admin app (admin-src/app.html) into an unlisted, password-protected page.
 *
 *   ADMIN_USER=... ADMIN_PASS=... node tools/build_admin.mjs
 *
 * Output: <opaque>/index.html, where <opaque> is derived from the credentials and never
 * printed anywhere public. The page is pure ciphertext plus a small login form; the key is
 * derived in the browser with PBKDF2-SHA256 (600,000 rounds) and the body decrypted with
 * AES-256-GCM. Wrong credentials simply fail to decrypt.
 *
 * The chosen path is remembered in .admin-path (git-ignored) so rebuilds overwrite the same page.
 */
import { webcrypto as crypto } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const user = process.env.ADMIN_USER, pass = process.env.ADMIN_PASS;
if (!user || !pass) { console.error("Set ADMIN_USER and ADMIN_PASS in the environment."); process.exit(1); }

const enc = new TextEncoder();
const b64 = (u8) => Buffer.from(u8).toString("base64");
const ITER = 600000;

async function deriveKey(salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(`${user}:${pass}`), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
}

const src = readFileSync(join(ROOT, "admin-src", "app.html"), "utf8");
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const key = await deriveKey(salt);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(src)));
const payload = JSON.stringify({ v: 1, kdf: "PBKDF2-SHA256", iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) });

// opaque path: stable per credential pair, remembered locally so rotations can keep the URL
const pathFile = join(ROOT, ".admin-path");
let opaque = existsSync(pathFile) ? readFileSync(pathFile, "utf8").trim() : "";
if (!opaque) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(`${user}|${pass}|asafahmad.com|studio`)));
  opaque = "s-" + Buffer.from(h).toString("hex").slice(0, 20);
  writeFileSync(pathFile, opaque + "\n");
}

const shell = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="robots" content="noindex,nofollow,noarchive,nosnippet"/>
<meta name="referrer" content="no-referrer"/>
<title>·</title>
<style>
html,body{height:100%;margin:0}body{font-family:Poppins,'Segoe UI',system-ui,sans-serif;background:#0B0B10;color:#F2F2F6;display:flex;align-items:center;justify-content:center}
form{width:min(92vw,360px);background:#14141B;border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:30px 28px}
h1{font-size:18px;margin:0 0 4px}p{margin:0 0 20px;color:#8A8A98;font-size:13px}
label{display:block;font-size:12px;color:#C3C3CE;margin:12px 0 6px}
input{width:100%;box-sizing:border-box;background:#0E0E14;border:1.5px solid rgba(255,255,255,.2);border-radius:10px;color:#fff;padding:11px 12px;font:inherit;font-size:14px}
input:focus{outline:none;border-color:#BFFF3C;box-shadow:0 0 0 3px rgba(191,255,60,.12)}
button{margin-top:18px;width:100%;border:0;border-radius:100px;padding:12px;background:#BFFF3C;color:#0B0B10;font:inherit;font-weight:600;font-size:14px;cursor:pointer}
button:disabled{opacity:.5}
.err{color:#FF5CA8;font-size:12.5px;margin-top:12px;min-height:16px}
</style>
</head>
<body>
<form id="f" autocomplete="off">
  <h1>Studio</h1><p>Private workspace.</p>
  <label>Username</label><input id="u" type="text" autocapitalize="none" spellcheck="false" required/>
  <label>Password</label><input id="p" type="password" required/>
  <button id="b" type="submit">Open</button>
  <div class="err" id="e"></div>
</form>
<script id="payload" type="application/json">${payload}</script>
<script>
(function(){
  var P = JSON.parse(document.getElementById('payload').textContent), fails = 0;
  function b64d(s){var b=atob(s),o=new Uint8Array(b.length);for(var i=0;i<b.length;i++)o[i]=b.charCodeAt(i);return o;}
  document.getElementById('f').onsubmit = async function(ev){
    ev.preventDefault();
    var u=document.getElementById('u').value.trim(), p=document.getElementById('p').value, btn=document.getElementById('b'), err=document.getElementById('e');
    btn.disabled=true; err.textContent='';
    try{
      var base=await crypto.subtle.importKey('raw',new TextEncoder().encode(u+':'+p),'PBKDF2',false,['deriveKey']);
      var key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64d(P.salt),iterations:P.iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
      var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64d(P.iv)},key,b64d(P.ct));
      var html=new TextDecoder().decode(pt);
      window.__ADMIN={key:key,src:html,user:u,path:location.pathname.replace(/\\/[^\\/]*$/,'')};
      document.open(); document.write(html); document.close();
    }catch(x){
      fails++; var wait=Math.min(30,Math.pow(2,fails))*1000;
      err.textContent='Could not open. Try again in '+(wait/1000)+'s.';
      setTimeout(function(){btn.disabled=false;},wait);
    }
  };
})();
</script>
</body>
</html>
`;
mkdirSync(join(ROOT, opaque), { recursive: true });
writeFileSync(join(ROOT, opaque, "index.html"), shell);
console.log(`built ${opaque}/index.html (${(ct.length / 1024).toFixed(0)} KB ciphertext)`);
