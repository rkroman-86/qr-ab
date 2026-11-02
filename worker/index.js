/* =========================================================
   qrbc — Worker unique pour tous les clients
   - nomclient.qrbc.app  → page publique, éditeur (/admin), API
   - qrbc.app            → accueil + inscription, gestion (Roman)

   Stockage KV (liaison CLIENTS) :
     compte:<slug>              → { slug, email, plan, finEssai, payeJusqua, hash, sel, version, cree }
     site:<slug>:config.json    → configuration de la page (JSON)
     site:<slug>:index.html     → page pré-rendue (générée par l'éditeur)
     site:<slug>:accueil.html   → page Home pré-rendue
     site:<slug>:sitemap.xml
     img:<slug>:<nom>           → image (binaire, type dans les métadonnées)

   Secrets (Paramètres → Variables et secrets) :
     SESSION_SECRET  → longue chaîne aléatoire (signature des sessions)
     ADMIN_TOKEN     → mot de passe de la page gestion de Roman
     ANTHROPIC_KEY   → clé API pour la rédaction IA et l'atelier logo
   ========================================================= */

const DOMAINE = 'qrbc.app';
const JOURS_ESSAI = 14;
const IA_PAR_JOUR = 30;                       // appels IA max par client et par jour
const MODELES_IA = ['claude-sonnet-5-5'];
const ITERATIONS = 100000;                    // maximum accepté par PBKDF2 dans les Workers
const RESERVES = new Set(['www', 'api', 'admin', 'app', 'mail', 'smtp', 'gestion', 'static', 'cdn', 'qrbc',
  'support', 'aide', 'help', 'blog', 'docs', 'status', 'billing', 'paiement', 'compte', 'login', 'inscription',
  'demo', 'dev', 'staging', 'test', 'ns1', 'ns2', 'ftp', 'webmail', 'contact']);
const FICHIERS_STATIQUES = new Set(['/admin.html', '/commun.js', '/i18n.js', '/qrcode.js']);
const FICHIERS_SITE = new Set(['config.json', 'index.html', 'accueil.html', 'sitemap.xml']);
const TAILLE_MAX = { 'config.json': 512 * 1024, html: 768 * 1024, image: 3 * 1024 * 1024 };

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const host = url.hostname.toLowerCase();
      if (host === DOMAINE || host === 'www.' + DOMAINE) return await racine(request, env, url);
      if (host.endsWith('.' + DOMAINE)) {
        const slug = host.slice(0, -(DOMAINE.length + 1));
        if (!/^[a-z0-9-]+$/.test(slug)) return texte('Adresse invalide', 404);
        return await siteClient(request, env, url, slug);
      }
      // adresse *.workers.dev : simple vérification que le Worker tourne
      return texte('qrbc-router OK');
    } catch (e) {
      console.error(e);
      if (e instanceof ErreurAPI) return json({ erreur: e.message }, e.status);
      return json({ erreur: 'Erreur interne' }, 500);
    }
  }
};

class ErreurAPI extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

/* ===================== Domaine principal ===================== */
async function racine(request, env, url) {
  const p = url.pathname;
  if (p === '/api/inscription' && request.method === 'POST') return inscription(request, env);
  if (p.startsWith('/api/gestion/')) return gestion(request, env, p.slice('/api/gestion/'.length));
  if (p === '/api/disponible') {
    const slug = (url.searchParams.get('nom') || '').toLowerCase();
    const err = erreurSlug(slug);
    if (err) return json({ disponible: false, raison: err });
    return json({ disponible: !(await env.CLIENTS.get('compte:' + slug)) });
  }
  if (p === '/' || p === '/index.html') return statique(env, request, '/qrbc.html');
  if (p === '/gestion' || p === '/gestion.html') return statique(env, request, '/gestion.html', true);
  if (FICHIERS_STATIQUES.has(p)) return statique(env, request, p);
  return texte('Page introuvable', 404);
}

/* ===================== Sous-domaine client ===================== */
async function siteClient(request, env, url, slug) {
  const p = url.pathname;

  if (p.startsWith('/api/')) return apiClient(request, env, slug, p.slice(5));
  if (p === '/admin' || p === '/admin/' || p === '/admin.html') return statique(env, request, '/admin.html', true);
  if (FICHIERS_STATIQUES.has(p)) return statique(env, request, p);
  if (p === '/robots.txt') return texte('User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://' + slug + '.' + DOMAINE + '/sitemap.xml\n');

  const compte = await lireCompte(env, slug);
  if (!compte) return pageInfo('Page introuvable', 'Cette adresse n’est pas encore utilisée.', 404);
  if (!actif(compte)) return pageInfo('Page en pause', 'Cette page est momentanément indisponible.', 200);

  if (p === '/contact') return Response.redirect(url.origin + '/#contact', 302);
  if (p === '/config.json') {
    const c = await env.CLIENTS.get('site:' + slug + ':config.json');
    return new Response(c || '{}', { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  }
  if (p.startsWith('/images/')) {
    const nom = p.slice('/images/'.length);
    if (!nomImageValide(nom)) return texte('Introuvable', 404);
    const { value, metadata } = await env.CLIENTS.getWithMetadata('img:' + slug + ':' + nom, { type: 'arrayBuffer' });
    if (!value) return texte('Introuvable', 404);
    return new Response(value, { headers: {
      'content-type': (metadata && metadata.type) || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable'   // noms d'image horodatés : jamais réécrits
    } });
  }
  const pages = { '/': 'index.html', '/index.html': 'index.html', '/accueil.html': 'accueil.html', '/sitemap.xml': 'sitemap.xml' };
  if (pages[p]) {
    const nom = pages[p];
    let corps = await env.CLIENTS.get('site:' + slug + ':' + nom);
    if (!corps && nom !== 'sitemap.xml') corps = await pageDemarrage(env, slug, nom === 'accueil.html' ? 'home' : '');
    if (!corps) return texte('Introuvable', 404);
    return new Response(corps, { headers: {
      'content-type': nom.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60'
    } });
  }
  return pageInfo('Page introuvable', 'Ce lien n’existe pas.', 404);
}

/* Page de secours tant que l'éditeur n'a pas encore généré index.html */
async function pageDemarrage(env, slug, vue) {
  let cfg = {};
  try { cfg = JSON.parse(await env.CLIENTS.get('site:' + slug + ':config.json') || '{}'); } catch (e) {}
  const seo = cfg.seo || {};
  const titre = seo.titre || cfg.titre || slug;
  const desc = seo.description || cfg.sousTitre || '';
  return '<!DOCTYPE html>\n<html lang="fr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<title>' + esc(titre) + '</title>' + (desc ? '<meta name="description" content="' + esc(desc) + '">' : '') +
    '<style>html,body{margin:0;height:100%}#page{min-height:100vh;min-height:100dvh;display:flex}' +
    '#page>.qp{min-height:100vh;min-height:100dvh}#page>.qh{height:100vh;height:100dvh}body.mode-home{overflow:hidden}</style>' +
    '</head><body><div id="page"></div><script src="/commun.js"></script>' +
    '<script>window.QP_VUE=' + JSON.stringify(vue) + ';(new Function(BOOT_SITE))();</script></body></html>';
}

/* ===================== API d'un client ===================== */
async function apiClient(request, env, slug, route) {
  const m = request.method;

  if (route === 'connexion' && m === 'POST') {
    await limiter(env, 'cx:' + slug + ':' + ip(request), 20, 3600, 'Trop d’essais. Réessayez dans une heure.');
    const { mdp, rester } = await corpsJSON(request);
    const compte = await lireCompte(env, slug);
    if (!compte || !(await verifierMdp(compte, String(mdp || '')))) throw new ErreurAPI(401, 'Mot de passe incorrect.');
    const duree = rester ? 30 * 86400 : 12 * 3600;
    const jeton = await signerSession(env, { s: slug, v: compte.version || 1, e: Math.floor(Date.now() / 1000) + duree });
    return json({ jeton, compte: resumeCompte(compte) });
  }

  // Tout le reste exige une session valide pour CE sous-domaine
  const compte = await exigerSession(request, env, slug);

  if (route === 'compte' && m === 'GET') return json({ compte: resumeCompte(compte) });

  if (route === 'fichier' && m === 'GET') {
    const chemin = new URL(request.url).searchParams.get('chemin') || '';
    const cle = cleFichier(slug, chemin);
    if (chemin.startsWith('images/')) {
      const v = await env.CLIENTS.get(cle, { type: 'arrayBuffer' });
      return json(v ? { sha: 'kv', texte: '' } : null);
    }
    const v = await env.CLIENTS.get(cle);
    return json(v === null ? null : { sha: 'kv', texte: v });
  }

  if (route === 'fichier' && m === 'PUT') {
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai gratuit est terminé. Activez l’abonnement pour publier à nouveau.'
      : 'Votre abonnement a expiré. Renouvelez-le pour publier à nouveau.');
    const { chemin, contenu } = await corpsJSON(request);
    const cle = cleFichier(slug, String(chemin || ''));
    const octets = base64VersOctets(String(contenu || ''));
    if (chemin.startsWith('images/')) {
      if (octets.length > TAILLE_MAX.image) throw new ErreurAPI(413, 'Image trop lourde (3 Mo maximum).');
      const type = typeImage(octets);
      if (!type) throw new ErreurAPI(415, 'Format d’image non accepté (JPEG, PNG ou WebP).');
      await env.CLIENTS.put(cle, octets, { metadata: { type } });
    } else {
      const max = chemin === 'config.json' ? TAILLE_MAX['config.json'] : TAILLE_MAX.html;
      if (octets.length > max) throw new ErreurAPI(413, 'Contenu trop volumineux.');
      const txt = new TextDecoder().decode(octets);
      if (chemin === 'config.json') { try { JSON.parse(txt); } catch (e) { throw new ErreurAPI(400, 'Configuration invalide.'); } }
      await env.CLIENTS.put(cle, txt);
    }
    return json({ sha: 'kv' });
  }

  if (route === 'mdp' && m === 'POST') {
    const { ancien, nouveau } = await corpsJSON(request);
    if (!(await verifierMdp(compte, String(ancien || '')))) throw new ErreurAPI(401, 'Ancien mot de passe incorrect.');
    verifierForceMdp(nouveau);
    Object.assign(compte, await hacherMdp(String(nouveau)), { version: (compte.version || 1) + 1 });
    await ecrireCompte(env, compte);
    return json({ ok: true });
  }

  if (route === 'ia' && m === 'POST') {
    if (!actif(compte)) throw new ErreurAPI(402, 'Abonnement inactif : la rédaction IA est désactivée.');
    if (!env.ANTHROPIC_KEY) throw new ErreurAPI(503, 'La rédaction IA n’est pas encore activée sur le serveur.');
    const jour = new Date().toISOString().slice(0, 10);
    await limiter(env, 'ia:' + slug + ':' + jour, IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    const d = await corpsJSON(request);
    if (!MODELES_IA.includes(d.model)) throw new ErreurAPI(400, 'Modèle non autorisé.');
    const corps = {
      model: d.model,
      max_tokens: Math.min(Number(d.max_tokens) || 1000, 8000),
      system: d.system, tools: d.tools, tool_choice: d.tool_choice, messages: d.messages
    };
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(corps)
    });
    const txt = await r.text();
    // Une clé refusée côté serveur ne doit pas ressembler à une session expirée pour le client
    const status = r.status === 401 || r.status === 403 ? 502 : r.status;
    return new Response(txt, { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
  }

  throw new ErreurAPI(404, 'Action inconnue.');
}

function cleFichier(slug, chemin) {
  if (FICHIERS_SITE.has(chemin)) return 'site:' + slug + ':' + chemin;
  if (chemin.startsWith('images/') && nomImageValide(chemin.slice(7))) return 'img:' + slug + ':' + chemin.slice(7);
  throw new ErreurAPI(400, 'Fichier non autorisé : ' + chemin);
}
function nomImageValide(nom) { return /^[a-z0-9][a-z0-9._-]{0,80}\.(png|jpe?g|webp)$/i.test(nom); }
function typeImage(o) {
  if (o[0] === 0xFF && o[1] === 0xD8) return 'image/jpeg';
  if (o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4E && o[3] === 0x47) return 'image/png';
  if (o[0] === 0x52 && o[1] === 0x49 && o[2] === 0x46 && o[3] === 0x46 && o[8] === 0x57 && o[9] === 0x45) return 'image/webp';
  return null;
}

/* ===================== Inscription (essai gratuit) ===================== */
async function inscription(request, env) {
  await limiter(env, 'insc:' + ip(request) + ':' + new Date().toISOString().slice(0, 10), 5, 86400 * 2,
    'Trop d’inscriptions depuis cette connexion aujourd’hui.');
  const d = await corpsJSON(request);
  const slug = String(d.nom || '').trim().toLowerCase();
  const email = String(d.email || '').trim().toLowerCase();
  const err = erreurSlug(slug);
  if (err) throw new ErreurAPI(400, err);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new ErreurAPI(400, 'Adresse e-mail invalide.');
  verifierForceMdp(d.mdp);
  if (d.cgu !== true) throw new ErreurAPI(400, 'Merci d’accepter les conditions d’utilisation.');
  const compte = await creerCompte(env, { slug, email, mdp: String(d.mdp), plan: 'essai', titre: String(d.titre || '').slice(0, 80) });
  return json({ ok: true, adresse: 'https://' + slug + '.' + DOMAINE + '/admin', compte: resumeCompte(compte) });
}

async function creerCompte(env, o) {
  if (await env.CLIENTS.get('compte:' + o.slug)) throw new ErreurAPI(409, 'Ce nom est déjà pris.');
  const maintenant = Date.now();
  const compte = Object.assign({
    slug: o.slug, email: o.email || '', plan: o.plan, version: 1, cree: new Date(maintenant).toISOString(),
    finEssai: o.plan === 'essai' ? new Date(maintenant + JOURS_ESSAI * 86400000).toISOString() : null,
    payeJusqua: null, note: o.note || ''
  }, await hacherMdp(o.mdp));
  await ecrireCompte(env, compte);
  if (!(await env.CLIENTS.get('site:' + o.slug + ':config.json'))) {
    await env.CLIENTS.put('site:' + o.slug + ':config.json', JSON.stringify({ titre: o.titre || '' }, null, 2));
  }
  return compte;
}

function erreurSlug(slug) {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(slug)) return 'Nom de 3 à 30 caractères : lettres minuscules, chiffres et tirets (pas au début ni à la fin).';
  if (slug.includes('--')) return 'Pas de double tiret.';
  if (RESERVES.has(slug)) return 'Ce nom est réservé.';
  return null;
}

/* ===================== Gestion (Roman) ===================== */
async function gestion(request, env, action) {
  const jeton = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || !(await egaliteSure(jeton, env.ADMIN_TOKEN))) {
    await new Promise(r => setTimeout(r, 800));
    throw new ErreurAPI(401, 'Accès refusé.');
  }
  const d = request.method === 'POST' ? await corpsJSON(request) : {};

  if (action === 'liste') {
    const comptes = [];
    let curseur;
    do {
      const l = await env.CLIENTS.list({ prefix: 'compte:', cursor: curseur });
      for (const k of l.keys) { const c = await lireCompte(env, k.name.slice(7)); if (c) comptes.push(resumeCompte(c)); }
      curseur = l.list_complete ? null : l.cursor;
    } while (curseur);
    comptes.sort((a, b) => String(b.cree).localeCompare(String(a.cree)));
    return json({ comptes });
  }

  if (action === 'creer') {
    const slug = String(d.nom || '').trim().toLowerCase();
    const err = erreurSlug(slug);
    if (err && !(d.forcer && RESERVES.has(slug))) throw new ErreurAPI(400, err);
    verifierForceMdp(d.mdp);
    const plan = ['gratuit', 'essai', 'payant'].includes(d.plan) ? d.plan : 'gratuit';
    const compte = await creerCompte(env, { slug, email: String(d.email || ''), mdp: String(d.mdp), plan, titre: d.titre, note: String(d.note || '') });
    let imp = null;
    if (d.importer) {
      try { imp = await importer(env, slug, String(d.importer)); }
      catch (e) { imp = { ok: false, erreur: e.message || 'Import impossible' }; }
    }
    return json({ ok: true, compte: resumeCompte(compte), import: imp });
  }

  if (action === 'modifier') {
    const compte = await lireCompte(env, String(d.nom || ''));
    if (!compte) throw new ErreurAPI(404, 'Compte introuvable.');
    if (d.plan && ['gratuit', 'essai', 'payant', 'suspendu'].includes(d.plan)) compte.plan = d.plan;
    if (d.prolongerEssai) compte.finEssai = new Date(Math.max(Date.now(), Date.parse(compte.finEssai || 0) || 0) + Number(d.prolongerEssai) * 86400000).toISOString();
    if (d.payeJusqua !== undefined) compte.payeJusqua = d.payeJusqua || null;
    if (d.note !== undefined) compte.note = String(d.note);
    if (d.mdp) { verifierForceMdp(d.mdp); Object.assign(compte, await hacherMdp(String(d.mdp)), { version: (compte.version || 1) + 1 }); }
    await ecrireCompte(env, compte);
    return json({ ok: true, compte: resumeCompte(compte) });
  }

  if (action === 'importer') {
    const slug = String(d.nom || '');
    if (!(await lireCompte(env, slug))) throw new ErreurAPI(404, 'Compte introuvable.');
    return json(await importer(env, slug, String(d.source || '')));
  }

  if (action === 'supprimer') {
    const slug = String(d.nom || '');
    if (d.confirmation !== slug) throw new ErreurAPI(400, 'Confirmation incorrecte.');
    for (const prefix of ['site:' + slug + ':', 'img:' + slug + ':']) {
      let curseur;
      do {
        const l = await env.CLIENTS.list({ prefix, cursor: curseur });
        for (const k of l.keys) await env.CLIENTS.delete(k.name);
        curseur = l.list_complete ? null : l.cursor;
      } while (curseur);
    }
    await env.CLIENTS.delete('compte:' + slug);
    return json({ ok: true });
  }

  throw new ErreurAPI(404, 'Action inconnue.');
}

/* Copie une page GitHub Pages existante (config + images) dans KV */
async function importer(env, slug, source) {
  if (!/^https:\/\/[a-z0-9-]+\.github\.io\//i.test(source)) throw new ErreurAPI(400, 'Source attendue : https://xxx.github.io/depot/');
  const base = source.replace(/\/?$/, '/');
  let texteCfg;
  try {
    const r = await fetch(base + 'config.json?t=' + Date.now(), { cf: { cacheTtl: 0 } });
    if (!r.ok) throw new Error();
    texteCfg = await r.text();
    JSON.parse(texteCfg);
  } catch (e) { throw new ErreurAPI(502, 'Impossible de lire config.json sur ' + base); }
  const images = [...new Set(texteCfg.match(/images\/[A-Za-z0-9._-]+\.(?:png|jpe?g|webp)/g) || [])];
  const copiees = [], ratees = [];
  for (const chemin of images) {
    let octets = null;
    try { const ri = await fetch(base + chemin); if (ri.ok) octets = new Uint8Array(await ri.arrayBuffer()); } catch (e) {}
    const type = octets && typeImage(octets);
    if (!type) { ratees.push(chemin); continue; }
    await env.CLIENTS.put('img:' + slug + ':' + chemin.slice(7), octets, { metadata: { type } });
    copiees.push(chemin);
  }
  // Les liens qui pointaient vers l'ancienne adresse GitHub pointent désormais vers le nouveau site
  const nouveau = texteCfg.split(base).join('https://' + slug + '.' + DOMAINE + '/');
  await env.CLIENTS.put('site:' + slug + ':config.json', nouveau);
  // Les pages pré-rendues seront régénérées au prochain « Enregistrer » ; d'ici là, page de démarrage
  for (const n of ['index.html', 'accueil.html', 'sitemap.xml']) await env.CLIENTS.delete('site:' + slug + ':' + n);
  return { ok: true, images: copiees, echecs: ratees };
}

/* ===================== Comptes ===================== */
async function lireCompte(env, slug) {
  if (!slug) return null;
  const t = await env.CLIENTS.get('compte:' + slug);
  return t ? JSON.parse(t) : null;
}
async function ecrireCompte(env, c) { await env.CLIENTS.put('compte:' + c.slug, JSON.stringify(c)); }

function actif(c) {
  if (c.plan === 'gratuit') return true;
  if (c.plan === 'suspendu') return false;
  if (c.plan === 'essai') return Date.parse(c.finEssai) > Date.now();
  if (c.plan === 'payant') return !c.payeJusqua || Date.parse(c.payeJusqua) > Date.now();
  return false;
}
function resumeCompte(c) {
  return { slug: c.slug, email: c.email, plan: c.plan, actif: actif(c), finEssai: c.finEssai, payeJusqua: c.payeJusqua, cree: c.cree, note: c.note || '' };
}

function verifierForceMdp(m) {
  if (typeof m !== 'string' || m.length < 10) throw new ErreurAPI(400, 'Mot de passe : 10 caractères minimum.');
  if (m.length > 200) throw new ErreurAPI(400, 'Mot de passe trop long.');
}

async function deriver(mdp, sel, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(mdp), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: sel, iterations, hash: 'SHA-256' }, base, 256);
  return new Uint8Array(bits);
}
async function hacherMdp(mdp) {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  return { sel: b64(sel), hash: b64(await deriver(mdp, sel, ITERATIONS)), iterations: ITERATIONS };
}
async function verifierMdp(c, mdp) {
  if (!c.hash || !c.sel) return false;
  const h = await deriver(mdp, deb64(c.sel), c.iterations || ITERATIONS);
  return egaliteSure(b64(h), c.hash);
}

/* ===================== Sessions signées ===================== */
async function cleHMAC(env) {
  if (!env.SESSION_SECRET) throw new ErreurAPI(503, 'Serveur non configuré (SESSION_SECRET manquant).');
  return crypto.subtle.importKey('raw', new TextEncoder().encode(env.SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
async function signerSession(env, charge) {
  const corps = b64url(new TextEncoder().encode(JSON.stringify(charge)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await cleHMAC(env), new TextEncoder().encode(corps)));
  return corps + '.' + b64url(sig);
}
async function exigerSession(request, env, slug) {
  const jeton = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const [corps, sig] = jeton.split('.');
  if (!corps || !sig) throw new ErreurAPI(401, 'Session expirée : reconnectez-vous.');
  const attendu = b64url(new Uint8Array(await crypto.subtle.sign('HMAC', await cleHMAC(env), new TextEncoder().encode(corps))));
  if (!(await egaliteSure(sig, attendu))) throw new ErreurAPI(401, 'Session expirée : reconnectez-vous.');
  let ch;
  try { ch = JSON.parse(new TextDecoder().decode(deb64(corps.replace(/-/g, '+').replace(/_/g, '/')))); } catch (e) { ch = null; }
  if (!ch || ch.s !== slug || ch.e < Date.now() / 1000) throw new ErreurAPI(401, 'Session expirée : reconnectez-vous.');
  const compte = await lireCompte(env, slug);
  if (!compte || (compte.version || 1) !== ch.v || compte.plan === 'suspendu') throw new ErreurAPI(401, 'Session expirée : reconnectez-vous.');
  return compte;
}

/* ===================== Outils ===================== */
async function limiter(env, cle, max, ttl, message) {
  const n = Number(await env.CLIENTS.get('rl:' + cle)) || 0;
  if (n >= max) throw new ErreurAPI(429, message);
  await env.CLIENTS.put('rl:' + cle, String(n + 1), { expirationTtl: Math.max(60, ttl) });
}
async function egaliteSure(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(String(a))), crypto.subtle.digest('SHA-256', enc.encode(String(b)))]);
  const x = new Uint8Array(ha), y = new Uint8Array(hb);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
function ip(request) { return request.headers.get('cf-connecting-ip') || 'inconnue'; }
async function corpsJSON(request) {
  try { return await request.json(); } catch (e) { throw new ErreurAPI(400, 'Requête invalide.'); }
}
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function deb64(s) { while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); }
function b64url(u8) { return b64(u8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function base64VersOctets(s) {
  try { return deb64(s.replace(/\s/g, '')); } catch (e) { throw new ErreurAPI(400, 'Contenu illisible.'); }
}
function esc(t) { return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function json(o, status) {
  return new Response(JSON.stringify(o), { status: status || 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function texte(t, status) { return new Response(t, { status: status || 200, headers: { 'content-type': 'text/plain; charset=utf-8' } }); }
function pageInfo(titre, msg, status) {
  return new Response('<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<meta name="robots" content="noindex"><title>' + esc(titre) + '</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;' +
    'font:16px/1.5 system-ui,sans-serif;background:#f4f4f6;color:#17171c;text-align:center;padding:24px}a{color:#1f6feb}</style></head><body><div><h1>' +
    esc(titre) + '</h1><p>' + esc(msg) + '</p><p><a href="https://' + DOMAINE + '">' + DOMAINE + '</a></p></div></body></html>',
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
async function statique(env, request, chemin, sansCache) {
  const u = new URL(request.url);
  u.pathname = chemin;
  const r = await env.ASSETS.fetch(new Request(u.toString(), request));
  if (!sansCache) return r;
  const h = new Headers(r.headers);
  h.set('cache-control', 'no-store');
  h.set('x-robots-tag', 'noindex');
  return new Response(r.body, { status: r.status, headers: h });
}
