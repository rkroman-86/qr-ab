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
const IA_PAR_JOUR = 30;                       // garde-fou anti-abus, par client et par jour
const MODELES_IA = ['claude-sonnet-5-5'];

/* ---------- Offre et IA ----------
   gratuit : illimité (comptes offerts, démos)
   essai   : 2 textes + 2 pictos pour toute la durée de l'essai
   payant  : 10 textes + 5 pictos par année d'abonnement, puis crédit prépayé */
const PRIX_ANNUEL = 1800;                       // centimes HT
const RECHARGE_MIN = 500;                       // centimes HT
const TVA = 20;                                 // %, ajoutée aux montants HT au moment du paiement
const RENOUVELER_AVANT = 30;                    // jours avant l'échéance où le renouvellement est proposé
const STRIPE_API = 'https://api.stripe.com/v1';
const QUOTAS_IA = { essai: { texte: 2, picto: 2 }, payant: { texte: 10, picto: 5 } };
const PRIX_IA = { texte: 40, picto: 70 };       // centimes, débités du crédit au-delà du quota
// Le type d'appel est décidé par le serveur d'après l'outil demandé, jamais par le client
const OUTILS_IA = { proposer_articles: 'texte', proposer_motifs: 'picto' };
const ITERATIONS = 100000;                    // maximum accepté par PBKDF2 dans les Workers
const RESERVES = new Set(['www', 'api', 'admin', 'app', 'mail', 'smtp', 'gestion', 'static', 'cdn', 'qrbc',
  'support', 'aide', 'help', 'blog', 'docs', 'status', 'billing', 'paiement', 'compte', 'login', 'inscription',
  'demo', 'dev', 'staging', 'test', 'ns1', 'ns2', 'ftp', 'webmail', 'contact']);
const FICHIERS_STATIQUES = new Set(['/admin.html', '/commun.js', '/i18n.js', '/qrcode.js']);
// Appli installable (PWA) servie depuis qrbc.app
const FICHIERS_PWA = new Set(['/manifest.webmanifest', '/sw.js', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png', '/favicon.png']);
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
      if (e instanceof ErreurAPI) return json({ erreur: e.message, code: e.code }, e.status);
      return json({ erreur: 'Erreur interne' }, 500);
    }
  }
};

class ErreurAPI extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}

/* ===================== Domaine principal ===================== */
async function racine(request, env, url) {
  const p = url.pathname;
  if (p === '/api/inscription' && request.method === 'POST') return inscription(request, env);
  if (p === '/api/stripe/webhook' && request.method === 'POST') return webhookStripe(request, env);
  if (p.startsWith('/api/gestion/')) return gestion(request, env, p.slice('/api/gestion/'.length));
  if (p === '/api/disponible') {
    const slug = (url.searchParams.get('nom') || '').toLowerCase();
    const err = erreurSlug(slug);
    if (err) return json({ disponible: false, raison: err });
    return json({ disponible: !(await env.CLIENTS.get('compte:' + slug)) });
  }
  if (p === '/' || p === '/index.html') return statique(env, request, '/qrbc.html');
  if (p === '/gestion' || p === '/gestion.html') return statique(env, request, '/gestion.html', true);
  if (p === '/app' || p === '/app/') return statique(env, request, '/app.html', true);
  if (p === '/favicon.ico') return statique(env, request, '/favicon.png');
  if (p === '/sw.js') {
    // le service worker doit toujours être relu, sinon les mises à jour de l'appli tardent
    const r = await statique(env, request, '/sw.js');
    const h = new Headers(r.headers); h.set('cache-control', 'no-cache');
    return new Response(r.body, { status: r.status, headers: h });
  }
  if (FICHIERS_PWA.has(p) || FICHIERS_STATIQUES.has(p)) return statique(env, request, p);

  // Éditeur dans l'appli : /app/<page>/…  (même origine que l'appli installée)
  const m = p.match(/^\/app\/([a-z0-9-]{3,30})(\/.*)?$/);
  if (m) {
    const slug = m[1], reste = m[2] || '';
    if (!reste) return Response.redirect(url.origin + '/app/' + slug + '/', 301);
    if (reste.startsWith('/api/')) return apiClient(request, env, slug, reste.slice(5));
    if (reste === '/' || reste === '/admin.html') return statique(env, request, '/admin.html', true);
    if (FICHIERS_STATIQUES.has(reste)) return statique(env, request, reste);
    if (reste.startsWith('/images/')) return imageClient(env, slug, reste.slice('/images/'.length));
  }
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
  if (p.startsWith('/images/')) return imageClient(env, slug, p.slice('/images/'.length));
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
    return json({ jeton, compte: await resumeAvecOffre(env, compte) });
  }

  // Tout le reste exige une session valide pour CE sous-domaine
  const compte = await exigerSession(request, env, slug);

  if (route === 'compte' && m === 'GET') return json({ compte: await resumeAvecOffre(env, compte) });

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
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.'
      : 'Abonnement inactif : l’IA est désactivée.', compte.plan === 'essai' ? 'essai_termine' : 'abonnement_inactif');
    if (!env.ANTHROPIC_KEY) throw new ErreurAPI(503, 'La rédaction IA n’est pas encore activée sur le serveur.');
    const d = await corpsJSON(request);
    if (!MODELES_IA.includes(d.model)) throw new ErreurAPI(400, 'Modèle non autorisé.');
    const outils = Array.isArray(d.tools) ? d.tools : [];
    const type = outils.length === 1 ? OUTILS_IA[outils[0] && outils[0].name] : null;
    if (!type) throw new ErreurAPI(400, 'Demande IA non reconnue.');
    const mode = modeFacturation(compte, type);          // lève 402 si rien n'est disponible
    const jour = new Date().toISOString().slice(0, 10);
    await limiter(env, 'ia:' + slug + ':' + jour, IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    const corps = {
      model: d.model,
      max_tokens: Math.min(Number(d.max_tokens) || 1000, type === 'picto' ? 8000 : 4000),
      system: d.system, tools: outils, tool_choice: d.tool_choice, messages: d.messages
    };
    const r = await fetch(env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(corps)
    });
    const txt = await r.text();
    const h = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    if (r.ok) {
      // On ne compte qu'une réponse réussie ; on relit le compte pour ne pas écraser une écriture concurrente
      const frais = (await lireCompte(env, slug)) || compte;
      facturer(frais, type, mode);
      await ecrireCompte(env, frais);
      h['x-qrbc-compte'] = encodeURIComponent(JSON.stringify(await resumeAvecOffre(env, frais)));
    }
    // Une clé refusée côté serveur ne doit pas ressembler à une session expirée pour le client
    const status = r.status === 401 || r.status === 403 ? 502 : r.status;
    return new Response(txt, { status, headers: h });
  }

  /* ---------- Paiement en ligne (Stripe Checkout) ---------- */
  if (route === 'paiement' && m === 'POST') {
    const dd = await corpsJSON(request);
    const genre = dd.genre === 'recharge' ? 'recharge' : 'abonnement';
    let montant, deduction = 0, libelle;
    if (genre === 'abonnement') {
      if (compte.plan === 'gratuit') throw new ErreurAPI(400, 'Ce compte est offert : rien à payer.');
      if (compte.plan === 'payant' && actif(compte) && Date.parse(compte.payeJusqua) - Date.now() > RENOUVELER_AVANT * 86400000)
        throw new ErreurAPI(400, 'Le renouvellement sera possible ' + RENOUVELER_AVANT + ' jours avant l’échéance.');
      const r = prixRenouvellement(compte);
      montant = r.aPayer; deduction = r.deduction;
      if (montant <= 0) {                                   // le crédit couvre toute l'année
        appliquerAbonnement(compte, 0, deduction, 'payé avec le crédit');
        await ecrireCompte(env, compte);
        return json({ applique: true, compte: await resumeAvecOffre(env, compte) });
      }
      libelle = 'Abonnement qrbc 1 an — ' + slug + '.' + DOMAINE + (deduction ? ' (crédit déduit : ' + (deduction / 100).toFixed(2).replace('.', ',') + ' € HT)' : '');
    } else {
      if (compte.plan !== 'payant' || !actif(compte)) throw new ErreurAPI(400, 'La recharge est réservée aux abonnés.');
      montant = Math.round(Number(dd.montant) * 100);
      if (!(montant >= RECHARGE_MIN) || montant > 50000) throw new ErreurAPI(400, 'Montant de recharge : 5 € HT minimum.');
      libelle = 'Crédit IA qrbc — ' + slug + '.' + DOMAINE;
    }
    const st = await lireStripe(env);
    if (!st) throw new ErreurAPI(503, 'Le paiement en ligne n’est pas encore ouvert.');
    const retour = retourSur(dd.retour, slug);
    const session = await stripe(env, st, 'POST', '/checkout/sessions', {
      mode: 'payment',
      client_reference_id: slug,
      customer_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compte.email || '') ? compte.email : undefined,
      line_items: [{ quantity: 1, tax_rates: [st.taxRate], price_data: { currency: 'eur', unit_amount: montant, product_data: { name: libelle } } }],
      metadata: { slug, genre, montant: String(montant), deduction: String(deduction) },
      payment_intent_data: { metadata: { slug, genre }, description: libelle },
      invoice_creation: { enabled: true },
      success_url: retour + (retour.includes('?') ? '&' : '?') + 'paiement=ok&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: retour + (retour.includes('?') ? '&' : '?') + 'paiement=annule'
    });
    return json({ url: session.url });
  }
  if (route === 'paiement/verifier' && m === 'GET') {
    const id = new URL(request.url).searchParams.get('session') || '';
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) throw new ErreurAPI(400, 'Session de paiement invalide.');
    const st = await lireStripe(env);
    if (!st) throw new ErreurAPI(503, 'Le paiement en ligne n’est pas configuré.');
    const session = await stripe(env, st, 'GET', '/checkout/sessions/' + id);
    if (!session.metadata || session.metadata.slug !== slug) throw new ErreurAPI(403, 'Ce paiement concerne une autre page.');
    const etat = await encaisserSession(env, session);
    const frais = await lireCompte(env, slug);
    return json({ paye: session.payment_status === 'paid', etat, compte: await resumeAvecOffre(env, frais) });
  }

  if (route === 'demande' && m === 'POST') {
    const dd = await corpsJSON(request);
    const genre = dd.genre === 'recharge' ? 'recharge' : 'abonnement';
    const montant = genre === 'recharge' ? Math.round(Number(dd.montant) * 100) : prixRenouvellement(compte).aPayer;
    if (genre === 'recharge') {
      if (compte.plan !== 'payant' || !actif(compte)) throw new ErreurAPI(400, 'La recharge est réservée aux abonnés.');
      if (!(montant >= RECHARGE_MIN) || montant > 50000) throw new ErreurAPI(400, 'Montant de recharge : 5 € minimum.');
    }
    compte.demande = { genre, montant, le: new Date().toISOString() };
    await ecrireCompte(env, compte);
    return json({ ok: true, compte: await resumeAvecOffre(env, compte) });
  }

  throw new ErreurAPI(404, 'Action inconnue.');
}

async function imageClient(env, slug, nom) {
  if (!nomImageValide(nom)) return texte('Introuvable', 404);
  const { value, metadata } = await env.CLIENTS.getWithMetadata('img:' + slug + ':' + nom, { type: 'arrayBuffer' });
  if (!value) return texte('Introuvable', 404);
  return new Response(value, { headers: {
    'content-type': (metadata && metadata.type) || 'application/octet-stream',
    'cache-control': 'public, max-age=31536000, immutable'   // noms d'image horodatés : jamais réécrits
  } });
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
  return json({ ok: true, adresse: 'https://' + slug + '.' + DOMAINE + '/', editeur: '/app/' + slug + '/', compte: resumeCompte(compte) });
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

  if (action === 'stripe') {
    if (request.method === 'GET') return json(await etatStripe(env));
    if (d.deconnecter) { await deconnecterStripe(env); return json(await etatStripe(env)); }
    await connecterStripe(env, String(d.cle || '').trim());
    return json(await etatStripe(env));
  }

  if (action === 'liste') {
    const comptes = [];
    let curseur;
    do {
      const l = await env.CLIENTS.list({ prefix: 'compte:', cursor: curseur });
      for (const k of l.keys) { const c = await lireCompte(env, k.name.slice(7)); if (c) comptes.push(Object.assign(resumeCompte(c), { paiements: c.paiements || [] })); }
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

  /* Paiement reçu (manuel en attendant Stripe) : abonnement ou recharge */
  if (action === 'abonner') {
    const compte = await lireCompte(env, String(d.nom || ''));
    if (!compte) throw new ErreurAPI(404, 'Compte introuvable.');
    const r = prixRenouvellement(compte);
    appliquerAbonnement(compte, r.aPayer, r.deduction, 'manuel');
    await ecrireCompte(env, compte);
    return json({ ok: true, encaisse: r.aPayer, deduction: r.deduction, compte: resumeCompte(compte) });
  }
  if (action === 'crediter') {
    const compte = await lireCompte(env, String(d.nom || ''));
    if (!compte) throw new ErreurAPI(404, 'Compte introuvable.');
    const montant = Math.round(Number(d.euros) * 100);
    if (!Number.isFinite(montant) || montant === 0 || Math.abs(montant) > 100000) throw new ErreurAPI(400, 'Montant invalide.');
    compte.credit = Math.max(0, (compte.credit || 0) + montant);
    if (montant > 0 && compte.demande && compte.demande.genre === 'recharge') compte.demande = null;
    journaliser(compte, montant > 0 ? 'recharge' : 'correction', montant, 'manuel');
    await ecrireCompte(env, compte);
    return json({ ok: true, compte: resumeCompte(compte) });
  }
  if (action === 'annuler-demande') {
    const compte = await lireCompte(env, String(d.nom || ''));
    if (!compte) throw new ErreurAPI(404, 'Compte introuvable.');
    compte.demande = null;
    await ecrireCompte(env, compte);
    return json({ ok: true });
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

/* ===================== Stripe ===================== */
/* La clé est collée une fois dans /gestion : on la vérifie, on crée le taux de TVA et le webhook,
   puis tout est rangé chiffré dans KV (config:stripe). La clé n'est jamais renvoyée. */
async function lireStripe(env) {
  const t = await env.CLIENTS.get('config:stripe');
  if (!t) return null;
  const c = JSON.parse(t);
  return Object.assign({}, c, { cle: await dechiffrer(env, c.cle), whsec: await dechiffrer(env, c.whsec) });
}
async function etatStripe(env) {
  const t = await env.CLIENTS.get('config:stripe');
  if (!t) return { connecte: false, webhook: 'https://' + DOMAINE + '/api/stripe/webhook' };
  const c = JSON.parse(t);
  return { connecte: true, mode: c.mode, compte: c.nomCompte, fin: c.fin, le: c.le, tva: TVA, webhook: c.urlWebhook, dernierWebhook: c.dernierWebhook || null };
}
async function connecterStripe(env, cle) {
  if (!/^(sk|rk)_(test|live)_[A-Za-z0-9]{10,}$/.test(cle)) throw new ErreurAPI(400, 'Clé attendue : sk_test_… (essais) ou sk_live_… (paiements réels).');
  const st = { cle, mode: cle.includes('_live_') ? 'live' : 'test' };
  let compteStripe;
  try { compteStripe = await stripe(env, st, 'GET', '/account'); }
  catch (e) { throw new ErreurAPI(400, 'Stripe refuse cette clé : ' + e.message); }
  await deconnecterStripe(env);                               // remplace proprement une ancienne connexion
  const taux = await stripe(env, st, 'POST', '/tax_rates', {
    display_name: 'TVA', percentage: String(TVA), inclusive: 'false', country: 'FR', jurisdiction: 'FR', description: 'TVA France ' + TVA + ' %'
  });
  const urlWebhook = 'https://' + DOMAINE + '/api/stripe/webhook';
  const wh = await stripe(env, st, 'POST', '/webhook_endpoints', {
    url: urlWebhook, enabled_events: ['checkout.session.completed', 'checkout.session.async_payment_succeeded'],
    description: 'qrbc : activation des abonnements et recharges'
  });
  const nom = (compteStripe.settings && compteStripe.settings.dashboard && compteStripe.settings.dashboard.display_name) ||
    (compteStripe.business_profile && compteStripe.business_profile.name) || compteStripe.email || compteStripe.id;
  await env.CLIENTS.put('config:stripe', JSON.stringify({
    mode: st.mode, nomCompte: nom, fin: cle.slice(-4), le: new Date().toISOString(),
    taxRate: taux.id, webhookId: wh.id, urlWebhook,
    cle: await chiffrer(env, cle), whsec: await chiffrer(env, wh.secret)
  }));
}
async function deconnecterStripe(env) {
  const st = await lireStripe(env).catch(() => null);
  if (st && st.webhookId) { try { await stripe(env, st, 'DELETE', '/webhook_endpoints/' + st.webhookId); } catch (e) {} }
  await env.CLIENTS.delete('config:stripe');
}

/* Appel à l'API Stripe (corps en x-www-form-urlencoded, notation à crochets) */
async function stripe(env, st, methode, chemin, params) {
  const corps = params ? formulaire(params) : null;
  const r = await fetch((env.STRIPE_API || STRIPE_API) + chemin + (methode === 'GET' && corps ? '?' + corps : ''), {
    method: methode,
    headers: { authorization: 'Bearer ' + st.cle, 'content-type': 'application/x-www-form-urlencoded', 'stripe-version': '2024-06-20' },
    body: methode === 'GET' ? undefined : corps
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new ErreurAPI(502, (j.error && j.error.message) || ('Stripe ' + r.status));
  return j;
}
function formulaire(o, prefixe, sortie) {
  sortie = sortie || [];
  for (const k of Object.keys(o)) {
    const v = o[k], cle = prefixe ? prefixe + '[' + k + ']' : k;
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') formulaire(v, cle, sortie);
    else sortie.push(encodeURIComponent(cle) + '=' + encodeURIComponent(String(v)));
  }
  return sortie.join('&');
}

/* Notification signée de Stripe : on vérifie la signature avant de toucher à quoi que ce soit */
async function webhookStripe(request, env) {
  const brut = await request.text();
  const st = await lireStripe(env);
  if (!st) return json({ erreur: 'non configuré' }, 400);
  const entete = request.headers.get('stripe-signature') || '';
  const parts = {};
  entete.split(',').forEach(x => { const i = x.indexOf('='); if (i > 0) (parts[x.slice(0, i)] = parts[x.slice(0, i)] || []).push(x.slice(i + 1)); });
  const t = Number((parts.t || [])[0]);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return json({ erreur: 'horodatage invalide' }, 400);
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(st.whsec), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(t + '.' + brut)));
  const attendu = [...sig].map(b => b.toString(16).padStart(2, '0')).join('');
  let ok = false;
  for (const v of parts.v1 || []) if (await egaliteSure(v, attendu)) ok = true;
  if (!ok) return json({ erreur: 'signature invalide' }, 400);

  const evt = JSON.parse(brut);
  if (evt.type === 'checkout.session.completed' || evt.type === 'checkout.session.async_payment_succeeded') {
    await encaisserSession(env, evt.data.object);
  }
  try {
    const conf = JSON.parse(await env.CLIENTS.get('config:stripe'));
    conf.dernierWebhook = { le: new Date().toISOString(), type: evt.type };
    await env.CLIENTS.put('config:stripe', JSON.stringify(conf));
  } catch (e) {}
  return json({ recu: true });
}

/* Applique un paiement Checkout réussi, une seule fois (webhook et retour du client peuvent arriver tous les deux) */
async function encaisserSession(env, session) {
  if (!session || session.payment_status !== 'paid') return 'non payé';
  const md = session.metadata || {};
  const compte = await lireCompte(env, md.slug);
  if (!compte) return 'compte introuvable';
  if ((compte.refsPayees || []).includes(session.id)) return 'déjà appliqué';
  const montant = Number(md.montant) || 0;
  const ttc = (session.amount_total / 100).toFixed(2) + ' € TTC';
  if (md.genre === 'abonnement') appliquerAbonnement(compte, montant, Number(md.deduction) || 0, 'Stripe · ' + ttc, session.id);
  else if (md.genre === 'recharge') appliquerRecharge(compte, montant, 'Stripe · ' + ttc, session.id);
  else return 'genre inconnu';
  await ecrireCompte(env, compte);
  return 'appliqué';
}

/* Retour après paiement : seulement vers nos propres adresses (pas de redirection ouverte) */
function retourSur(demande, slug) {
  const defaut = 'https://' + DOMAINE + '/app/' + slug + '/';
  try {
    const u = new URL(String(demande || ''));
    const ok = u.protocol === 'https:' && (u.hostname === DOMAINE || u.hostname === slug + '.' + DOMAINE);
    return ok ? u.origin + u.pathname : defaut;
  } catch (e) { return defaut; }
}

/* Chiffrement des secrets rangés dans KV (clé dérivée de SESSION_SECRET) */
async function cleCoffre(env) {
  if (!env.SESSION_SECRET) throw new ErreurAPI(503, 'SESSION_SECRET manquant.');
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('coffre:' + env.SESSION_SECRET));
  return crypto.subtle.importKey('raw', h, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
async function chiffrer(env, texte) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cleCoffre(env), new TextEncoder().encode(texte)));
  return b64(iv) + '.' + b64(ct);
}
async function dechiffrer(env, valeur) {
  const [iv, ct] = String(valeur).split('.');
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deb64(iv) }, await cleCoffre(env), deb64(ct)));
}

async function resumeAvecOffre(env, c) {
  const r = resumeCompte(c);
  r.offre.enLigne = !!(await env.CLIENTS.get('config:stripe'));
  return r;
}

/* ===================== Comptes ===================== */
async function lireCompte(env, slug) {
  if (!slug) return null;
  const t = await env.CLIENTS.get('compte:' + slug);
  return t ? JSON.parse(t) : null;
}
/* Une année d'abonnement de plus ; le crédit utilisé en déduction est retiré */
function appliquerAbonnement(compte, montantHT, deduction, source, ref) {
  const base = compte.plan === 'payant' && actif(compte) && compte.payeJusqua ? Date.parse(compte.payeJusqua) : Date.now();
  const fin = new Date(base); fin.setFullYear(fin.getFullYear() + 1);
  const deduit = Math.min(deduction || 0, compte.credit || 0);
  compte.credit = (compte.credit || 0) - deduit;
  compte.plan = 'payant';
  compte.payeJusqua = fin.toISOString();
  compte.ia = { texte: 0, picto: 0, depuis: new Date().toISOString() };   // nouvelle année : quotas remis à zéro
  if (compte.demande && compte.demande.genre === 'abonnement') compte.demande = null;
  journaliser(compte, 'abonnement', montantHT, [source, deduit ? 'crédit déduit ' + (deduit / 100).toFixed(2) + ' €' : ''].filter(Boolean).join(' · '), ref);
}
function appliquerRecharge(compte, montantHT, source, ref) {
  compte.credit = (compte.credit || 0) + montantHT;
  if (compte.demande && compte.demande.genre === 'recharge') compte.demande = null;
  journaliser(compte, 'recharge', montantHT, source, ref);
}

/* Historique des encaissements (50 derniers), utile pour la comptabilité */
function journaliser(c, genre, montant, note, ref) {
  const ligne = { le: new Date().toISOString(), genre, montant, note };
  if (ref) ligne.ref = ref;
  c.paiements = (c.paiements || []).concat([ligne]).slice(-50);
  if (ref) c.refsPayees = (c.refsPayees || []).concat([ref]).slice(-200);   // anti-double application
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
  const q = QUOTAS_IA[c.plan];
  const ia = c.ia || {};
  return {
    slug: c.slug, email: c.email, plan: c.plan, actif: actif(c), finEssai: c.finEssai, payeJusqua: c.payeJusqua, cree: c.cree, note: c.note || '',
    ia: {
      illimite: c.plan === 'gratuit',
      texte: { utilises: ia.texte || 0, inclus: q ? q.texte : null },
      picto: { utilises: ia.picto || 0, inclus: q ? q.picto : null },
      credit: c.credit || 0,                       // centimes
      prix: PRIX_IA
    },
    offre: { prixAnnuel: PRIX_ANNUEL, rechargeMin: RECHARGE_MIN, quotasPayant: QUOTAS_IA.payant, tva: TVA, renouvelerAvant: RENOUVELER_AVANT },
    renouvellement: prixRenouvellement(c),
    demande: c.demande || null
  };
}

/* Inclus dans le quota, débité du crédit, ou refus avec l'offre adaptée */
function modeFacturation(c, type) {
  if (c.plan === 'gratuit') return 'illimite';
  const q = QUOTAS_IA[c.plan];
  const utilises = (c.ia && c.ia[type]) || 0;
  if (q && utilises < q[type]) return 'inclus';
  const nom = type === 'texte' ? 'textes IA' : 'pictogrammes IA';
  if (c.plan === 'essai') throw new ErreurAPI(402,
    'Vos ' + q[type] + ' ' + nom + ' d’essai sont utilisés. Abonnez-vous dès maintenant pour en obtenir ' + QUOTAS_IA.payant[type] + ' par an.', 'essai_epuise');
  if (c.plan === 'payant' && (c.credit || 0) >= PRIX_IA[type]) return 'credit';
  throw new ErreurAPI(402, 'Vos ' + q[type] + ' ' + nom + ' de l’année sont utilisés. Rechargez votre crédit (5 € minimum) pour continuer.', 'credit_insuffisant');
}
function facturer(c, type, mode) {
  if (mode === 'illimite' || mode === 'inclus') { c.ia = c.ia || {}; c.ia[type] = (c.ia[type] || 0) + 1; }
  if (mode === 'illimite') return;
  if (mode === 'credit') c.credit = Math.max(0, (c.credit || 0) - PRIX_IA[type]);
  c.ia.depense = (c.ia.depense || 0) + (mode === 'credit' ? PRIX_IA[type] : 0);
}
/* Le crédit non consommé est déduit du paiement annuel suivant */
function prixRenouvellement(c) {
  const deduction = Math.min(c.credit || 0, PRIX_ANNUEL);
  return { prix: PRIX_ANNUEL, deduction, aPayer: PRIX_ANNUEL - deduction };
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
