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

   Base D1 (liaison STATS, facultative) : statistiques de visites, totaux par jour (voir « Statistiques »)

   Secrets (Paramètres → Variables et secrets) :
     SESSION_SECRET  → longue chaîne aléatoire (signature des sessions)
     ADMIN_TOKEN     → mot de passe de la page gestion de Roman
     ANTHROPIC_KEY   → clé API IA de secours (la clé collée dans /gestion › Réglages est prioritaire)
   ========================================================= */

const DOMAINE = 'qrbc.app';
const JOURS_ESSAI = 14;
const IA_PAR_JOUR = 30;                       // garde-fou anti-abus, par client et par jour
const MODELES_IA = ['claude-sonnet-5-5', 'claude-haiku-5-5'];
// Le serveur choisit le modèle selon le travail : rédaction soignée → Sonnet, pictogrammes SVG → Haiku (le moins coûteux)
const MODELE_PAR_TYPE = { texte: 'claude-sonnet-5-5', picto: 'claude-haiku-5-5' };
const DUREE_EXPRESS = 30 * 60 * 1000;
const ESSAIS_EXPRESS = 2;                       // appels IA par étape d'une création express (1 + 1 reprise)          // une création express payée reste utilisable 30 min (reprise après une erreur)

/* ---------- Offre et IA ----------
   gratuit : illimité (comptes offerts, démos)
   essai   : 2 textes + 2 pictos pour toute la durée de l'essai
   payant  : 10 textes + 5 pictos par année d'abonnement, puis crédit prépayé */
// Tarifs et quotas : réglables dans /gestion (config:tarifs) ; valeurs par défaut ci-dessous
const TARIFS_DEFAUT = { prixAnnuel: 1800, prixTexte: 40, prixPicto: 70, prixFond: 70, prixExpress: 150, prixPage: 900, prixTraduction: 150,
  essai: { texte: 2, picto: 2, fond: 1 }, payant: { texte: 10, picto: 5, fond: 2 } };
const TYPES_IA = ['texte', 'picto', 'fond'];      // fond = une génération de 2 images de fond
const MODELE_IMAGE = '@cf/black-forest-labs/flux-2-dev';          // FLUX.2 [dev] : bien meilleure qualité (≈ 0,05 $ l'image)
const MODELE_IMAGE_SECOURS = '@cf/black-forest-labs/flux-2-klein-9b';   // rapide et peu coûteux, si le premier est indisponible
const ETAPES_IMAGE = 25;
const FOND_L = 864, FOND_H = 1536;               // portrait 9:16 (téléphone)
const MEDIAS_MAX = 40;                           // images gardées par genre (fond, logo, article) dans la médiathèque d'un client
let PRIX_ANNUEL = TARIFS_DEFAUT.prixAnnuel;     // centimes HT
const RECHARGE_MIN = 500;                       // centimes HT
const TVA = 20;                                 // %, ajoutée aux montants HT au moment du paiement
const RENOUVELER_AVANT = 30;                    // jours avant l'échéance où le renouvellement est proposé
const STRIPE_API = 'https://api.stripe.com/v1';
const RESEND_API = 'https://api.resend.com';
const DUREE_LIEN_MDP = 3600;                    // secondes de validité d'un lien « mot de passe oublié »
let QUOTAS_IA = { essai: TARIFS_DEFAUT.essai, payant: TARIFS_DEFAUT.payant };
let PRIX_IA = { texte: TARIFS_DEFAUT.prixTexte, picto: TARIFS_DEFAUT.prixPicto, fond: TARIFS_DEFAUT.prixFond };   // centimes HT, débités du crédit au-delà du quota
let PRIX_EXPRESS = TARIFS_DEFAUT.prixExpress;   // centimes HT, création express pour un abonné (débité du crédit)
let PRIX_PAGE = TARIFS_DEFAUT.prixPage;         // centimes HT par an, page supplémentaire (ou version traduite) d'un compte
let PRIX_TRADUCTION = TARIFS_DEFAUT.prixTraduction;   // centimes HT, nouvelle traduction d'une page (la 1re est offerte)
const PAGE_MIN = 50;                            // centimes HT : montant minimal d'un ajout au prorata (paiement par carte)
// Langues proposées pour traduire une page (code à 2 lettres = chemin /xx/ de la page)
const LANGUES_PAGE = ['fr', 'en', 'ru', 'es', 'de', 'it', 'pt', 'nl', 'uk', 'pl', 'ro', 'tr', 'zh', 'ja'];
const RE_PAGE = '[a-z0-9-]{3,30}(?:\\.[a-z]{2})?';      // nom d'une page ; « nom.en » = version anglaise de « nom »

async function lireTarifs(env) {
  let t = {};
  try { t = JSON.parse(await env.CLIENTS.get('config:tarifs') || '{}'); } catch (e) {}
  const D = TARIFS_DEFAUT;
  return {
    prixAnnuel: t.prixAnnuel ?? D.prixAnnuel, prixTexte: t.prixTexte ?? D.prixTexte, prixPicto: t.prixPicto ?? D.prixPicto, prixFond: t.prixFond ?? D.prixFond,
    prixExpress: t.prixExpress ?? D.prixExpress, prixPage: t.prixPage ?? D.prixPage, prixTraduction: t.prixTraduction ?? D.prixTraduction,
    essai: Object.assign({}, D.essai, t.essai), payant: Object.assign({}, D.payant, t.payant)
  };
}
async function chargerTarifs(env) {
  const t = await lireTarifs(env);
  PRIX_ANNUEL = t.prixAnnuel;
  PRIX_IA = { texte: t.prixTexte, picto: t.prixPicto, fond: t.prixFond };
  PRIX_EXPRESS = t.prixExpress;
  PRIX_PAGE = t.prixPage;
  PRIX_TRADUCTION = t.prixTraduction;
  QUOTAS_IA = { essai: t.essai, payant: t.payant };
  return t;
}
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
  // Tâche quotidienne (wrangler.jsonc › triggers.crons) : rappels d'échéance par e-mail
  async scheduled(event, env, ctx) {
    ctx.waitUntil(chargerTarifs(env).then(() => lancerRappels(env, {})).then(r => console.log('rappels', JSON.stringify(r.resume)))
      .catch(e => console.error('rappels', e.message)));
    ctx.waitUntil(purgerStats(env).catch(e => console.error('stats', e.message)));
  },
  async fetch(request, env, ctx) {
    TACHES = ctx;
    try {
      await chargerTarifs(env);
      const url = new URL(request.url);
      const host = url.hostname.toLowerCase();
      // Ancien navigateur arrivé en http:// (« Non sécurisé ») : on passe en https (sauf rappels Stripe en POST)
      if (/"scheme":"http"/.test(request.headers.get('cf-visitor') || '') && (request.method === 'GET' || request.method === 'HEAD')) {
        url.protocol = 'https:';
        return Response.redirect(url.toString(), 301);
      }
      // www.qrbc.app → qrbc.app (une seule adresse pour Google ; les rappels Stripe en POST ne sont pas redirigés)
      if (host === 'www.' + DOMAINE && (request.method === 'GET' || request.method === 'HEAD')) {
        url.hostname = DOMAINE;
        return Response.redirect(url.toString(), 301);
      }
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
      if (e instanceof ErreurAPI) return json(Object.assign({ erreur: e.message, code: e.code }, e.extra || {}), e.status);
      return json({ erreur: 'Erreur interne' }, 500);
    }
  }
};

class ErreurAPI extends Error {
  constructor(status, message, code, extra) { super(message); this.status = status; this.code = code; this.extra = extra; }
}

/* ===================== Domaine principal ===================== */
async function racine(request, env, url) {
  const p = url.pathname;
  if (p === '/api/moi') return marquerProprietaire();
  if (p === '/api/inscription' && request.method === 'POST') return inscription(request, env);
  if (p === '/api/promo' && request.method === 'GET') return verifierPromo(request, env);
  if (p === '/api/stripe/webhook' && request.method === 'POST') return webhookStripe(request, env);
  if (p.startsWith('/api/gestion/')) return gestion(request, env, p.slice('/api/gestion/'.length));
  if (p === '/api/mdp-oublie' && request.method === 'POST') return mdpOublie(request, env);
  if (p === '/api/mdp-reinit' && request.method === 'POST') return mdpReinit(request, env);
  if (p === '/api/verifier-email' && request.method === 'POST') return verifierEmail(request, env);
  if (p === '/api/disponible') {
    const slug = (url.searchParams.get('nom') || '').toLowerCase();
    const err = erreurSlug(slug);
    if (err) return json({ disponible: false, raison: err });
    return json({ disponible: !(await env.CLIENTS.get('compte:' + slug)) && !(await env.CLIENTS.get('reserve:' + slug)) });
  }
  if (p === '/' || p === '/index.html') return accueilLangue(env, request, url);
  // Référencement : robots.txt du site principal, plan du site global (toutes les pages clients actives)
  if (p === '/robots.txt') return texte('User-agent: *\nAllow: /\nDisallow: /gestion\nDisallow: /app/\nDisallow: /api/\n\nSitemap: https://' + DOMAINE + '/sitemap.xml\n');
  if (p === '/sitemap.xml') return planGlobal(env, url.searchParams.has('frais'));
  if (p === '/sitemap-site.xml') return xml(planSitePrincipal());
  if (p === '/gestion' || p === '/gestion.html') return statique(env, request, '/gestion.html', true);
  // Pages légales : français (seul faisant foi) + traductions anglaise et russe (?lang=en|ru)
  if (p === '/cgv' || p === '/cgv.html' || p === '/mentions-legales' || p === '/mentions-legales.html') {
    const base = p.replace(/\.html$/, ''), l = url.searchParams.get('lang');
    return statique(env, request, base + (l === 'en' || l === 'ru' ? '.' + l : '') + '.html');
  }
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
  const m = p.match(new RegExp('^/app/(' + RE_PAGE + ')(/.*)?$'));
  if (m) {
    const slug = m[1], reste = m[2] || '';
    if (!reste) return Response.redirect(url.origin + '/app/' + slug + '/', 301);
    if (reste.startsWith('/api/')) return apiClient(request, env, slug, reste.slice(5));
    if (reste === '/' || reste === '/admin.html') return statique(env, request, '/admin.html', true);
    if (FICHIERS_STATIQUES.has(reste)) return statique(env, request, reste);
    if (reste.startsWith('/images/')) return imageClient(env, slug, reste.slice('/images/'.length), await lireCompte(env, slug));
  }
  return texte('Page introuvable', 404);
}

/* ===================== Sous-domaine client ===================== */
async function siteClient(request, env, url, slug) {
  const p = url.pathname;

  if (p === '/api/moi') return marquerProprietaire();
  if (p === '/api/clic' && request.method === 'POST') return compterClic(request, env, slug);
  if (p.startsWith('/api/')) return apiClient(request, env, slug, p.slice(5));
  if (p === '/admin' || p === '/admin/' || p === '/admin.html') return statique(env, request, '/admin.html', true);
  if (FICHIERS_STATIQUES.has(p)) return statique(env, request, p);
  if (p === '/robots.txt') {
    const c = await lireCompte(env, slug);
    // page absente, en pause ou non référencée : pas de plan du site annoncé (les pages répondent « noindex »)
    if (!c || !actif(c) || c.emailAVerifier || c.noindex) return texte('User-agent: *\nAllow: /\nDisallow: /admin\n');
    const plans = ['/'];
    for (const l of c.traductions || []) { const tc = await lireCompte(env, slug + '.' + l); if (tc && actif(tc)) plans.push('/' + l + '/'); }
    return texte('User-agent: *\nAllow: /\nDisallow: /admin\n' + plans.map(x => 'Sitemap: https://' + slug + '.' + DOMAINE + x + 'sitemap.xml\n').join(''));
  }
  // Page installable comme une appli : service worker propre à la page, icônes qrbc par défaut
  if (p === '/sw.js') return new Response(SW_PAGE, { headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-cache' } });
  if (FICHIERS_PWA.has(p) && /\.png$/.test(p)) return statique(env, request, p);

  // Version traduite : nom.qrbc.app/xx/… (page « nom.xx »)
  const ml = p.match(/^\/([a-z]{2})(\/.*)?$/);
  if (ml && LANGUES_PAGE.includes(ml[1])) {
    const tc = await lireCompte(env, slug + '.' + ml[1]);
    if (tc && tc.traduction && tc.traduction.source === slug) {
      if (!ml[2]) return Response.redirect(url.origin + '/' + ml[1] + '/' + url.search, 301);
      return pageTraduite(request, env, url, slug, tc, ml[2]);
    }
  }

  const compte = await lireCompte(env, slug);
  if (!compte) return pageInfo('Page introuvable', 'Cette adresse n’est pas encore utilisée.', 404);
  if (!actif(compte)) return pageInfo('Page en pause', 'Cette page est momentanément indisponible.', 200);
  if (compte.emailAVerifier && p !== '/manifest.webmanifest' && !p.startsWith('/images/'))
    return pageInfo('Page bientôt en ligne', 'Cette page sera visible dès que son propriétaire aura confirmé son adresse e-mail.', 200);

  if (p === '/contact') return Response.redirect(url.origin + '/#contact', 302);
  if (p === '/manifest.webmanifest') return manifestePage(env, slug);
  if (p === '/config.json') {
    const c = await env.CLIENTS.get('site:' + slug + ':config.json');
    return new Response(c || '{}', { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  }
  if (p.startsWith('/images/')) return imageClient(env, slug, p.slice('/images/'.length), compte);
  const pages = { '/': 'index.html', '/index.html': 'index.html', '/accueil.html': 'accueil.html', '/sitemap.xml': 'sitemap.xml' };
  if (pages[p]) {
    const nom = pages[p];
    const langs = languesPage(compte);
    // Page traduite : arrivée dans la langue du téléphone du visiteur (ou celle qu'il a choisie), sauf choix explicite (?l=)
    if (langs.length && nom !== 'sitemap.xml' && !url.searchParams.get('l')) {
      const pref = cookieLangue(request) || langueNavigateur(request, langs.map(x => x.l));
      if (pref && pref !== langs[0].l && compte.traductions.includes(pref))
        return new Response(null, { status: 302, headers: { location: '/' + pref + '/' + (nom === 'accueil.html' ? 'accueil.html' : '') + url.search, 'cache-control': 'private, no-store', vary: 'Accept-Language, Cookie' } });
    }
    let corps = await env.CLIENTS.get('site:' + slug + ':' + nom);
    if (!corps && nom !== 'sitemap.xml') corps = await pageDemarrage(env, slug, nom === 'accueil.html' ? 'home' : '');
    if (!corps) return texte('Introuvable', 404);
    if (nom !== 'sitemap.xml') compterVisite(request, env, slug, url, (langs.length ? langs[0].l : null) || compte.langueSite || 'fr');
    return reponsePage(corps, nom, langs, langs.length ? langs[0].l : null, slug, url, !!compte.noindex);
  }
  return pageInfo('Page introuvable', 'Ce lien n’existe pas.', 404);
}

/* ---------- Pages traduites et sélecteur de langues ---------- */
async function pageTraduite(request, env, url, slug, tc, reste) {
  if (FICHIERS_STATIQUES.has(reste)) return statique(env, request, reste);
  const source = await lireCompte(env, slug);
  if (!source || !actif(tc)) return pageInfo('Page en pause', 'Cette page est momentanément indisponible.', 200);
  if (reste === '/manifest.webmanifest') return manifestePage(env, slug);
  if (reste === '/config.json') {
    const c = await env.CLIENTS.get('site:' + tc.slug + ':config.json');
    return new Response(c || '{}', { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  }
  if (reste.startsWith('/images/')) return imageClient(env, tc.slug, reste.slice('/images/'.length), tc);
  const pages = { '/': 'index.html', '/index.html': 'index.html', '/accueil.html': 'accueil.html', '/sitemap.xml': 'sitemap.xml' };
  const nom = pages[reste];
  if (!nom) return pageInfo('Page introuvable', 'Ce lien n’existe pas.', 404);
  let corps = await env.CLIENTS.get('site:' + tc.slug + ':' + nom);
  if (!corps && nom !== 'sitemap.xml') corps = await pageDemarrage(env, tc.slug, nom === 'accueil.html' ? 'home' : '');
  if (!corps) return texte('Introuvable', 404);
  if (nom !== 'sitemap.xml') compterVisite(request, env, slug, url, tc.traduction.langue);
  return reponsePage(corps, nom, languesPage(source), tc.traduction.langue, slug, url, !!(source.noindex || tc.noindex));
}
function cookieLangue(request) {
  const m = (request.headers.get('cookie') || '').match(/(?:^|;\s*)qrbc-l=([a-z]{2})/);
  return m ? m[1] : null;
}
function langueNavigateur(request, dispo) {
  const liste = (request.headers.get('accept-language') || '').split(',')
    .map(x => { const [l, q] = x.trim().split(';q='); return { l: l.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 }; })
    .filter(x => x.l).sort((a, b) => b.q - a.q);
  for (const x of liste) if (dispo.includes(x.l)) return x.l;
  return null;
}
/* Ajoute les versions linguistiques (Google + sélecteur) et retient le choix du visiteur */
/* Format téléphone sur ordinateur (copie de CSS_BUREAU de commun.js) : injecté dans le <head> dès le chargement,
   sinon la page s'affiche d'abord en pleine largeur puis « saute » quand commun.js l'applique. */
const CSS_BUREAU = `#qp-decor{display:none} @media (min-width:700px) and (min-aspect-ratio:1/1){   #page{justify-content:center;position:relative;z-index:1}   #page>.qp,#page>.qh{flex:none;width:min(480px,max(390px,50vh));box-shadow:0 0 0 1px rgba(255,255,255,.08),0 20px 80px rgba(0,0,0,.55)}   #qp-decor{display:block;position:fixed;inset:-60px;z-index:0;background-size:cover;background-position:center;filter:blur(30px) brightness(.5);pointer-events:none;transition:background-image .4s} }`;
function reponsePage(corps, nom, langs, actuelle, slug, url, exclue) {
  const h = { 'content-type': nom.endsWith('.xml') ? 'application/xml; charset=utf-8' : 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60' };
  if (/\.html$/.test(nom) && corps.indexOf('qp-css-bureau') < 0) corps = corps.replace('</head>', '<style id="qp-css-bureau">' + CSS_BUREAU + '</style>\n</head>');
  if (exclue) h['x-robots-tag'] = 'noindex';      // page exclue des moteurs de recherche (réglage dans /gestion)
  if (langs.length && nom !== 'sitemap.xml') {
    const base = 'https://' + slug + '.' + DOMAINE;
    const fin = nom === 'accueil.html' ? 'accueil.html' : '';
    const liens = langs.map(x => '<link rel="alternate" hreflang="' + x.l + '" href="' + base + x.u + fin + '">').join('\n') +
      '\n<link rel="alternate" hreflang="x-default" href="' + base + '/' + fin + '">';
    const donnees = '<script>window.QRBC_LANGUES=' + JSON.stringify({ a: actuelle, l: langs }) + ';</script>';
    corps = corps.replace(/<html lang="[a-zA-Z-]*"/, '<html lang="' + actuelle + '"').replace('</head>', liens + '\n' + donnees + '\n</head>');
    h['cache-control'] = 'private, no-cache';
    h.vary = 'Accept-Language, Cookie';
    const choix = url.searchParams.get('l');
    if (choix && langs.some(x => x.l === choix)) h['set-cookie'] = 'qrbc-l=' + choix + '; Path=/; Max-Age=31536000; SameSite=Lax; Secure';
  }
  return new Response(corps, { headers: h });
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
    '<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/apple-touch-icon.png">' +
    '</head><body><div id="page"></div><script src="/commun.js"></script>' +
    '<script>window.QP_VUE=' + JSON.stringify(vue) + ';(new Function(BOOT_SITE))();</script></body></html>';
}

/* Fiche de l'appli d'une page : nom, couleurs et icônes tirés de la configuration enregistrée */
async function manifestePage(env, slug) {
  let cfg = {};
  try { cfg = JSON.parse(await env.CLIENTS.get('site:' + slug + ':config.json') || '{}'); } catch (e) {}
  const d = cfg.design || {}, ic = cfg.appIcones || {};
  const couleur = /^#[0-9a-f]{3,8}$/i.test(d.fond || '') ? d.fond : '#f5f1ea';
  const nom = String(cfg.titre || slug).trim().slice(0, 45);
  const court = String(cfg.appNom || '').trim().slice(0, 15) || nomCourt(nom);
  const icones = ic.i192 && ic.i512 ? [
    { src: '/' + ic.i192, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/' + ic.i512, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/' + (ic.m512 || ic.i512), sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ] : [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ];
  const m = {
    id: '/', name: nom, short_name: court, description: String((cfg.seo && cfg.seo.description) || cfg.sousTitre || '').slice(0, 300),
    start_url: '/', scope: '/', display: 'standalone', orientation: 'portrait', lang: 'fr',
    background_color: couleur, theme_color: couleur, icons: icones
  };
  return new Response(JSON.stringify(m), { headers: { 'content-type': 'application/manifest+json; charset=utf-8', 'cache-control': 'no-cache' } });
}
function nomCourt(t) {
  if (t.length <= 12) return t;
  let n = '';
  for (const m of t.split(/[\s,–-]+/).filter(Boolean)) { if ((n + ' ' + m).trim().length > 12) break; n = (n + ' ' + m).trim(); }
  return (n.replace(/(\s+(à|a|au|aux|de|du|des|la|le|les|et|en|d’|d'|l’|l'|&))+$/i, '') || n || t.slice(0, 12)).trim();
}
/* Service worker d'une page client : réseau d'abord, dernière copie si pas de réseau (appels, WhatsApp… restent accessibles) */
const SW_PAGE = `const V = 'page-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || /^\\/admin/.test(u.pathname)) return;
  const cle = u.origin + (u.pathname === '/index.html' ? '/' : u.pathname);       // config.json?t=… → une seule copie
  e.respondWith(fetch(r).then(rep => {
    if (rep.ok && rep.type === 'basic') { const c = rep.clone(); caches.open(V).then(x => x.put(cle, c)); }
    return rep;
  }).catch(() => caches.match(cle).then(m => m || (r.mode === 'navigate' ? caches.match(u.origin + '/') : undefined))
    .then(m => m || new Response('Pas de connexion', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } }))));
});`;

/* ===================== API d'un client ===================== */
async function apiClient(request, env, slug, route) {
  const m = request.method;

  if (route === 'connexion' && m === 'POST') {
    await limiter(env, 'cx:' + slug + ':' + ip(request), 20, 3600, 'Trop d’essais. Réessayez dans une heure.');
    const { mdp, rester } = await corpsJSON(request);
    const compte = await lireCompte(env, slug);
    const tit = await titulaireDe(env, compte);                 // page rattachée : mot de passe commun du compte
    if (!compte || !(await verifierMdp(tit, String(mdp || '')))) throw new ErreurAPI(401, 'Mot de passe incorrect.');
    if (tit.emailAVerifier) throw new ErreurAPI(403, 'Confirmez d’abord votre adresse e-mail : cliquez sur le lien envoyé à ' + tit.email + ' (pensez aux indésirables).', 'email_non_confirme', { email: tit.email });
    const duree = rester ? 30 * 86400 : 12 * 3600;
    const jeton = await signerSession(env, { s: slug, v: tit.version || 1, e: Math.floor(Date.now() / 1000) + duree });
    return json({ jeton, compte: await resumeAvecOffre(env, compte) });
  }

  /* Lien de confirmation pas reçu : on le renvoie (mot de passe exigé), en corrigeant l'adresse si besoin */
  if (route === 'email/renvoyer' && m === 'POST') {
    await limiter(env, 'cx:' + slug + ':' + ip(request), 20, 3600, 'Trop d’essais. Réessayez dans une heure.');
    const dd = await corpsJSON(request);
    const compte = await titulaireDe(env, await lireCompte(env, slug));
    if (!compte || !(await verifierMdp(compte, String(dd.mdp || '')))) throw new ErreurAPI(401, 'Mot de passe incorrect.');
    if (!compte.emailAVerifier) return json({ ok: true, dejaConfirme: true });
    await limiter(env, 'verif:' + slug + ':' + new Date().toISOString().slice(0, 13), 3, 7200, 'Trop d’envois. Réessayez dans une heure.');
    const nouvelle = String(dd.email || '').trim().toLowerCase();
    if (nouvelle && nouvelle !== compte.email) {             // faute de frappe à l'inscription : on corrige l'adresse
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nouvelle) || nouvelle.length > 200) throw new ErreurAPI(400, 'Adresse e-mail invalide.');
      for (const s2 of (await slugsParEmail(env, nouvelle)).filter(x => x !== slug))
        if (await env.CLIENTS.get('compte:' + s2)) throw new ErreurAPI(409, 'Cette adresse e-mail est déjà utilisée par un autre compte.');
      await indexerEmail(env, compte.email, slug, false);
      compte.email = nouvelle;
      await indexerEmail(env, nouvelle, slug, true);
      await ecrireCompte(env, compte);
    }
    const conf = await lireEmail(env);
    if (!conf) throw new ErreurAPI(503, 'L’envoi d’e-mails n’est pas disponible pour le moment. Contactez le support.');
    await envoyerLienVerif(env, conf, compte);
    return json({ ok: true, email: compte.email });
  }

  // Tout le reste exige une session valide pour CE sous-domaine
  const compte = await exigerSession(request, env, slug);

  if (route === 'stats' && m === 'GET') {
    const jours = Math.min(366, Math.max(1, parseInt(new URL(request.url).searchParams.get('jours'), 10) || 30));
    return json(await lireStats(env, pageStats(compte), jours));
  }

  if (route === 'compte' && m === 'GET') {
    const l = request.headers.get('x-qrbc-langue');              // langue des e-mails = langue de l'éditeur
    if (LANGUES_MAIL.includes(l) && compte.langue !== l) { compte.langue = l; await ecrireCompte(env, compte); }
    return json({ compte: await resumeAvecOffre(env, compte) });
  }

  if (route === 'fichier' && m === 'GET') {
    const chemin = new URL(request.url).searchParams.get('chemin') || '';
    const cle = cleFichier(compte, chemin);
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
    const cle = cleFichier(compte, String(chemin || ''));
    const octets = base64VersOctets(String(contenu || ''));
    if (chemin.startsWith('images/')) {
      if (octets.length > TAILLE_MAX.image) throw new ErreurAPI(413, 'Image trop lourde (3 Mo maximum).');
      const type = typeImage(octets);
      if (!type) throw new ErreurAPI(415, 'Format d’image non accepté (JPEG, PNG ou WebP).');
      await env.CLIENTS.put(cle, octets, { metadata: { type } });
      if (/^images\/app-\d+-/.test(chemin)) {
        // icônes de l'appli (3 fichiers d'une même génération) : on efface les générations précédentes
        const gen = chemin.match(/^images\/(app-\d+-)/)[1];
        const l = await env.CLIENTS.list({ prefix: 'img:' + slug + ':app-' });
        for (const k of l.keys) if (!k.name.includes(':' + gen)) await env.CLIENTS.delete(k.name);
      } else if (/^images\/partage-/.test(chemin)) {
        // image d'aperçu des liens : hors « Mes images », une seule gardée (les précédentes sont effacées)
        const l = await env.CLIENTS.list({ prefix: 'img:' + slug + ':partage-' });
        for (const k of l.keys) if (k.name !== cle) await env.CLIENTS.delete(k.name);
      } else {
        await ajouterMedias(env, racineDe(compte), [{ chemin, genre: genreImage(chemin), source: /^images\/logo-/.test(chemin) ? 'logo' : 'photo', le: new Date().toISOString() }]);
      }
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
    const tit = await titulaireDe(env, compte);                 // un seul mot de passe pour toutes les pages du compte
    if (!(await verifierMdp(tit, String(ancien || '')))) throw new ErreurAPI(401, 'Ancien mot de passe incorrect.');
    verifierForceMdp(nouveau);
    Object.assign(tit, await hacherMdp(String(nouveau)), { version: (tit.version || 1) + 1 });
    await ecrireCompte(env, tit);
    return json({ ok: true });
  }

  if (route === 'ia' && m === 'POST') {
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.'
      : 'Abonnement inactif : l’IA est désactivée.', compte.plan === 'essai' ? 'essai_termine' : 'abonnement_inactif');
    const cleIA = await cleAnthropic(env);
    if (!cleIA) throw new ErreurAPI(503, 'La rédaction IA n’est pas encore activée sur le serveur.');
    const d = await corpsJSON(request);
    if (!MODELES_IA.includes(d.model)) throw new ErreurAPI(400, 'Modèle non autorisé.');
    const outils = Array.isArray(d.tools) ? d.tools : [];
    const type = outils.length === 1 ? OUTILS_IA[outils[0] && outils[0].name] : null;
    if (!type) throw new ErreurAPI(400, 'Demande IA non reconnue.');
    const mode = modeFacturation(compte, type, request.headers.get('x-qrbc-express') === '1');   // lève 402 si rien n'est disponible
    const jour = new Date().toISOString().slice(0, 10);
    await limiter(env, 'ia:' + slug + ':' + jour, IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    const corps = {
      model: MODELE_PAR_TYPE[type] || MODELES_IA[0],
      max_tokens: Math.min(Number(d.max_tokens) || 1000, 8000),
      system: d.system, tools: outils, tool_choice: d.tool_choice, messages: d.messages
    };
    const r = await fetch(env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': cleIA, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(corps)
    });
    const txt = await r.text();
    const h = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
    if (!r.ok) console.error('IA', type, slug, r.status, txt.slice(0, 400));   // visible dans Observabilité (Cloudflare)
    else if (/"stop_reason"\s*:\s*"max_tokens"/.test(txt)) console.error('IA', type, slug, 'réponse coupée (max_tokens)');
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
    const genre = dd.genre === 'recharge' ? 'recharge' : dd.genre === 'page' ? 'page' : 'abonnement';
    let montant, deduction = 0, libelle, extra = {};
    const tit = await titulaireDe(env, compte);
    if (genre === 'abonnement') {
      if (compte.parent) throw new ErreurAPI(400, 'L’abonnement de toutes vos pages se règle depuis votre page principale (' + compte.parent + '.' + DOMAINE + ').');
      if (compte.plan === 'gratuit') throw new ErreurAPI(400, 'Ce compte est offert : rien à payer.');
      if (compte.plan === 'payant' && actif(compte) && Date.parse(compte.payeJusqua) - Date.now() > RENOUVELER_AVANT * 86400000)
        throw new ErreurAPI(400, 'Le renouvellement sera possible ' + RENOUVELER_AVANT + ' jours avant l’échéance.');
      const r = await prixGroupe(env, compte);
      montant = r.aPayer; deduction = r.deduction;
      if (montant <= 0) {                                   // le crédit couvre toute l'année
        await appliquerAbonnementGroupe(env, compte, 0, deduction, 'payé avec le crédit');
        await ecrireCompte(env, compte);
        return json({ applique: true, compte: await resumeAvecOffre(env, compte) });
      }
      libelle = 'Abonnement qrbc 1 an — ' + slug + '.' + DOMAINE + (r.pages ? ' + ' + r.pages + (r.pages > 1 ? ' pages' : ' page') : '') +
        (deduction ? ' (crédit déduit : ' + (deduction / 100).toFixed(2).replace('.', ',') + ' € HT)' : '');
    } else if (genre === 'page') {
      const o = offreAjout(tit);
      if (!o.possible) throw new ErreurAPI(402, o.raison);
      if (o.gratuit) throw new ErreurAPI(400, 'Compte offert : la page est créée sans paiement.');
      const a = await preparerAjout(env, tit, compte, dd);
      if (a.type === 'page') await env.CLIENTS.put('reserve:' + a.cible, tit.slug, { expirationTtl: 3600 });   // le temps de payer
      montant = o.prix;
      libelle = (a.type === 'traduction' ? 'Version ' + a.langue.toUpperCase() + ' de ' + a.source + '.' + DOMAINE : 'Page ' + a.cible + '.' + DOMAINE) +
        (o.echeance ? ' — jusqu’au ' + new Date(o.echeance).toLocaleDateString('fr-FR') + ' (échéance commune)' : ' — 1 an');
      extra = { titulaire: tit.slug, cible: a.cible, type: a.type, source: a.source || '', langue: a.langue || '', langueSource: a.langueSource || '' };
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
      customer_email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tit.email || '') ? tit.email : undefined,
      line_items: [{ quantity: 1, tax_rates: [st.taxRate], price_data: { currency: 'eur', unit_amount: montant, product_data: { name: libelle } } }],
      metadata: Object.assign({ slug, genre, montant: String(montant), deduction: String(deduction) }, extra),
      payment_intent_data: { metadata: { slug, genre }, description: libelle },
      invoice_creation: { enabled: true },
      // Stripe active par défaut « Managed Payments » (Stripe vendeur, TVA mondiale, frais en plus) :
      // on facture nous-mêmes avec notre taux de TVA, donc désactivé pour nos sessions
      managed_payments: { enabled: false },
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
    const nouvelle = session.metadata.genre === 'page' && (etat === 'appliqué' || etat === 'déjà appliqué') ? session.metadata.cible : null;
    return json({ paye: session.payment_status === 'paid', etat, nouvellePage: nouvelle, compte: await resumeAvecOffre(env, frais) });
  }

  /* ---------- Images de fond par l'IA ---------- */
  /* ---------- Médiathèque : toutes les images du client (IA, photos, logos) ---------- */
  if ((route === 'medias' || route === 'fonds') && m === 'GET') {
    const medias = await lireMedias(env, racineDe(compte));
    return json(route === 'fonds' ? { fonds: medias.filter(x => x.genre === 'fond') } : { medias });
  }
  if ((route === 'medias' || route === 'fonds') && m === 'DELETE') {
    const { chemin } = await corpsJSON(request);
    const racine = racineDe(compte);
    let medias = await lireMedias(env, racine);
    if (!medias.some(x => x.chemin === chemin)) throw new ErreurAPI(404, 'Image introuvable.');
    medias = medias.filter(x => x.chemin !== chemin);
    await env.CLIENTS.put('site:' + racine + ':medias', JSON.stringify(medias));
    // le fichier n'est effacé que si aucune page publiée du compte ne l'utilise
    const cfg = await configsGroupe(env, racine);
    if (!cfg.includes(chemin)) await env.CLIENTS.delete('img:' + racine + ':' + chemin.slice(7));
    return json(route === 'fonds' ? { fonds: medias.filter(x => x.genre === 'fond') } : { medias });
  }
  if (route === 'fond' && m === 'POST') {
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.'
      : 'Abonnement inactif : l’IA est désactivée.', compte.plan === 'essai' ? 'essai_termine' : 'abonnement_inactif');
    if (!env.AI) throw new ErreurAPI(503, 'La création d’images n’est pas encore activée sur le serveur.');
    const dd = await corpsJSON(request);
    if (dd.pancarte && typeof dd.pancarte === 'object' && !String(dd.pancarte.titre || '').trim() && !String(dd.pancarte.texte || '').trim())
      throw new ErreurAPI(400, 'Écrivez d’abord le titre ou le texte de la pancarte : l’image s’en inspire.');
    const mode = modeFacturation(compte, 'fond', request.headers.get('x-qrbc-express') === '1');
    const jour = new Date().toISOString().slice(0, 10);
    await limiter(env, 'ia:' + slug + ':' + jour, IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    const ambiance = AMBIANCES_FOND[dd.ambiance] ? dd.ambiance : 'photo';
    const idee = String(dd.idee || '').slice(0, 300);
    let cfg = {};
    try { cfg = JSON.parse(await env.CLIENTS.get('site:' + slug + ':config.json') || '{}'); } catch (e) {}
    // L'éditeur envoie l'activité en cours de saisie (pas encore enregistrée) : elle prime sur la page publiée
    const act = dd.activite && typeof dd.activite === 'object' ? dd.activite : null;
    if (act) {
      const txt = (v, n) => String(v || '').slice(0, n).trim();
      cfg = Object.assign({}, cfg, { titre: txt(act.titre, 120) || cfg.titre, sousTitre: txt(act.sousTitre, 200) || cfg.sousTitre,
        home: { ia: { description: txt(act.description, 1500) || (cfg.home && cfg.home.ia && cfg.home.ia.description) || '', zone: txt(act.zone, 300) || (cfg.home && cfg.home.ia && cfg.home.ia.zone) || '' } } });
    }
    // Image d'une pancarte : le sujet vient du titre et du texte de la pancarte ; carrée pour « image au-dessus du texte »
    const pc = dd.pancarte && typeof dd.pancarte === 'object' ? {
      titre: String(dd.pancarte.titre || '').slice(0, 150).trim(), texte: String(dd.pancarte.texte || '').slice(0, 1200).trim(),
      carre: dd.pancarte.style === 'image' } : null;
    const description = await descriptionFond(env, cfg, ambiance, idee, pc);
    const [L, H] = pc && pc.carre ? [1024, 1024] : [FOND_L, FOND_H];

    // 2 images en parallèle, graines différentes ; on garde celles qui réussissent
    const base = Date.now();
    let essais = await Promise.allSettled([1, 2].map(i => genererImage(env, description, (base + i * 7919) % 2147483647, L, H)));
    const echecs = essais.filter(e => e.status !== 'fulfilled');
    if (echecs.length) {
      // une seule reprise pour les images ratées : description plus prudente si le filtre a refusé, nouvelle graine sinon
      const refus = echecs.some(e => /3030|flagged/i.test(String((e.reason && e.reason.message) || '')));
      const description2 = refus ? await descriptionFond(env, cfg, ambiance, idee, pc, true) : description;
      const reprises = await Promise.allSettled(essais.map((e, i) => e.status === 'fulfilled' ? Promise.resolve(e.value)
        : genererImage(env, description2, (base + (i + 1) * 104729) % 2147483647, L, H)));
      reprises.forEach((e, i) => { if (essais[i].status !== 'fulfilled') console.error('image (1re tentative)', essais[i].reason && essais[i].reason.message); });
      essais = reprises;
    }
    const nouvelles = [];
    for (let i = 0; i < essais.length; i++) {
      if (essais[i].status !== 'fulfilled') { console.error('image', essais[i].reason && essais[i].reason.message); continue; }
      const octets = essais[i].value;
      const type = typeImage(octets);
      if (!type) continue;
      const chemin = 'images/' + (pc ? 'article' : 'fond') + '-ia-' + base + '-' + (i + 1) + (type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.jpg');
      await env.CLIENTS.put('img:' + racineDe(compte) + ':' + chemin.slice(7), octets, { metadata: { type } });
      nouvelles.push({ chemin, genre: pc ? 'article' : 'fond', source: 'ia', le: new Date().toISOString(), ambiance, idee: pc ? pc.titre : idee });
    }
    if (!nouvelles.length) {
      // quota journalier de Cloudflare Workers AI épuisé (plan gratuit : ~3 créations de 2 images par jour) : message clair
      const raisons = essais.map(e => String((e.reason && e.reason.message) || '')).join(' ');
      if (/4006|daily free allocation|neurons/i.test(raisons)) {
        console.error('QUOTA WORKERS AI ÉPUISÉ', raisons.slice(0, 200));
        throw new ErreurAPI(503, 'La création d’images est momentanément indisponible (limite du jour atteinte). Réessayez plus tard : rien n’a été décompté.');
      }
      if (/3030|flagged/i.test(raisons))
        throw new ErreurAPI(422, 'Le service d’images a refusé cette image (marque, personnage ou personne célèbre dans le texte ?). Modifiez le texte ou choisissez une autre ambiance : rien n’a été décompté.');
      throw new ErreurAPI(502, 'La création d’images a échoué. Réessayez dans un instant (rien n’a été décompté).');
    }

    const medias = await ajouterMedias(env, racineDe(compte), nouvelles);
    const fonds = medias.filter(x => x.genre === 'fond');

    const frais = (await lireCompte(env, slug)) || compte;
    facturer(frais, 'fond', mode);
    await ecrireCompte(env, frais);
    return json({ nouvelles, fonds, medias, compte: await resumeAvecOffre(env, frais) });
  }

  /* ---------- Création express : réserve d'un coup les créations IA (5 pancartes, 3 pictos, 2 images) ----------
     offert : gratuit · essai : la moitié des créations gratuites de l'essai · abonné : PRIX_EXPRESS sur le crédit IA.
     Les 3 étapes suivent (ia texte, ia picto, fond) avec l'en-tête x-qrbc-express : elles ne sont plus décomptées. */
  if (route === 'express/fin' && m === 'POST') {          // l'éditeur a tout reçu : la réservation est close
    if (compte.express) { delete compte.express; await ecrireCompte(env, compte); }
    return json({ ok: true, compte: await resumeAvecOffre(env, compte) });
  }
  if (route === 'express' && m === 'POST') {
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.'
      : 'Abonnement inactif : l’IA est désactivée.', compte.plan === 'essai' ? 'essai_termine' : 'abonnement_inactif');
    if (!(await cleAnthropic(env))) throw new ErreurAPI(503, 'La rédaction IA n’est pas encore activée sur le serveur.');
    if (expressEnCours(compte)) return json({ express: compte.express, compte: await resumeAvecOffre(env, compte), reprise: true });
    const cout = coutExpress(compte);
    if (!cout.possible) throw new ErreurAPI(402, cout.message, cout.code);
    compte.ia = compte.ia || {};
    if (compte.plan === 'essai') for (const k of TYPES_IA) compte.ia[k] = (compte.ia[k] || 0) + (cout.essai[k] || 0);
    if (compte.plan === 'payant') {
      compte.credit = Math.max(0, (compte.credit || 0) - cout.prix);
      compte.ia.depense = (compte.ia.depense || 0) + cout.prix;
    }
    compte.ia.express = (compte.ia.express || 0) + 1;
    // restant = appels possibles par étape : 1 + 1 reprise (réponse IA reçue mais illisible, coupure réseau…)
    const n = ESSAIS_EXPRESS;
    const restant = compte.plan === 'essai'
      ? { texte: cout.essai.texte ? n : 0, picto: cout.essai.picto ? n : 0, fond: cout.essai.fond && env.AI ? n : 0 }
      : { texte: n, picto: n, fond: env.AI ? n : 0 };
    compte.express = { jusqua: new Date(Date.now() + DUREE_EXPRESS).toISOString(), restant, faits: {} };
    await ecrireCompte(env, compte);
    return json({ express: compte.express, compte: await resumeAvecOffre(env, compte) });
  }

  /* ---------- Comptes à plusieurs pages ---------- */
  if (route === 'pages' && m === 'GET') {
    const tit = await titulaireDe(env, compte);
    const membres = await membresGroupe(env, tit);
    const pages = [];
    for (const c of membres) {
      let titre = '';
      try { titre = (JSON.parse(await env.CLIENTS.get('site:' + c.slug + ':config.json') || '{}').titre) || ''; } catch (e) {}
      pages.push({ slug: c.slug, titre, principale: !c.parent, traduction: c.traduction || null, langueSite: c.langueSite || null,
        traductions: c.traductions || [], adresse: adressePage(c), actif: actif(c) });
    }
    const o = offreAjout(tit);
    return json({ pages, courant: slug, titulaire: tit.slug, ajout: o, prixTraduction: PRIX_TRADUCTION, prixPage: PRIX_PAGE,
      tva: TVA, langues: LANGUES_PAGE, credit: compte.credit || 0, creditTitulaire: tit.credit || 0 });
  }
  if (route === 'pages/disponible' && m === 'GET') {
    const nom = (new URL(request.url).searchParams.get('nom') || '').toLowerCase();
    const err = erreurSlug(nom);
    if (err) return json({ disponible: false, raison: err });
    const pris = (await env.CLIENTS.get('compte:' + nom)) || (await env.CLIENTS.get('reserve:' + nom));
    return json({ disponible: !pris });
  }
  if (route === 'pages/ajouter' && m === 'POST') {
    const tit = await titulaireDe(env, compte);
    const o = offreAjout(tit);
    if (!o.possible) throw new ErreurAPI(402, o.raison, 'ajout_impossible');
    if (!o.gratuit) throw new ErreurAPI(400, 'Paiement nécessaire.', 'paiement');
    const a = await preparerAjout(env, tit, compte, await corpsJSON(request));
    const page = await creerPageSup(env, tit, a);
    await ecrireCompte(env, tit);
    const session = await signerSession(env, { s: page.slug, v: tit.version || 1, e: Math.floor(Date.now() / 1000) + 30 * 86400 });
    return json({ ok: true, cree: page.slug, jeton: session });
  }
  if (route === 'basculer' && m === 'POST') {
    const { vers } = await corpsJSON(request);
    const tit = await titulaireDe(env, compte);
    if (vers !== tit.slug && !(tit.pages || []).includes(vers)) throw new ErreurAPI(403, 'Cette page n’appartient pas à votre compte.');
    const cible = await lireCompte(env, vers);
    if (!cible) throw new ErreurAPI(404, 'Page introuvable.');
    const session = await signerSession(env, { s: vers, v: tit.version || 1, e: Math.floor(Date.now() / 1000) + 30 * 86400 });
    return json({ ok: true, slug: vers, jeton: session });
  }
  /* Traduction IA d'une version traduite : la 1re (à la création) est offerte, les suivantes PRIX_TRADUCTION */
  if (route === 'traduire' && m === 'POST') {
    if (!compte.traduction) throw new ErreurAPI(400, 'Cette page n’est pas une version traduite.');
    if (!actif(compte)) throw new ErreurAPI(402, 'Abonnement inactif : renouvelez-le depuis votre page principale.', 'abonnement_inactif');
    const cleIA = await cleAnthropic(env);
    if (!cleIA) throw new ErreurAPI(503, 'La traduction IA n’est pas encore activée sur le serveur.');
    const tit = await titulaireDe(env, compte);
    const offerte = compte.aTraduire || compte.plan === 'gratuit';
    let payeur = null;
    if (!offerte) {
      payeur = (compte.credit || 0) >= PRIX_TRADUCTION ? compte : (tit.credit || 0) >= PRIX_TRADUCTION ? tit : null;
      if (!payeur) throw new ErreurAPI(402, 'Une nouvelle traduction coûte ' + euros(PRIX_TRADUCTION) + ' HT sur votre crédit IA (solde : ' + euros(compte.credit || 0) + '). Rechargez votre crédit (' + euros(RECHARGE_MIN) + ' HT minimum).', 'credit_insuffisant');
    }
    await limiter(env, 'ia:' + slug + ':' + new Date().toISOString().slice(0, 10), IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    let cfg = {};
    try { cfg = JSON.parse(await env.CLIENTS.get('site:' + compte.traduction.source + ':config.json') || '{}'); } catch (e) {}
    const source = await lireCompte(env, compte.traduction.source);
    const traduite = await traduireConfig(env, cleIA, cfg, (source && source.langueSite) || 'fr', compte.traduction.langue);
    delete traduite.partage; delete traduite.appIcones;
    traduite.langue = compte.traduction.langue;
    await env.CLIENTS.put('site:' + slug + ':config.json', JSON.stringify(traduite, null, 2));
    // la langue apparaît dans le sélecteur des pages dès la 1re traduction
    if (source && !(source.traductions || []).includes(compte.traduction.langue)) {
      source.traductions = (source.traductions || []).concat([compte.traduction.langue]);
      if (source.slug === tit.slug) tit.traductions = source.traductions;
      await ecrireCompte(env, source);
    }
    const frais = (await lireCompte(env, slug)) || compte;
    delete frais.aTraduire;
    if (payeur) {
      const qui = payeur.slug === frais.slug ? frais : (await lireCompte(env, payeur.slug));
      qui.credit = Math.max(0, (qui.credit || 0) - PRIX_TRADUCTION);
      qui.ia = qui.ia || {}; qui.ia.depense = (qui.ia.depense || 0) + PRIX_TRADUCTION;
      if (qui !== frais) await ecrireCompte(env, qui);
    }
    await ecrireCompte(env, frais);
    return json({ ok: true, offerte, compte: await resumeAvecOffre(env, frais) });
  }

  if (route === 'demande' && m === 'POST') {
    const dd = await corpsJSON(request);
    const genre = dd.genre === 'recharge' ? 'recharge' : 'abonnement';
    if (genre === 'abonnement' && compte.parent) throw new ErreurAPI(400, 'L’abonnement de toutes vos pages se règle depuis votre page principale.');
    const montant = genre === 'recharge' ? Math.round(Number(dd.montant) * 100) : (await prixGroupe(env, compte)).aPayer;
    if (genre === 'recharge') {
      if (compte.plan !== 'payant' || !actif(compte)) throw new ErreurAPI(400, 'La recharge est réservée aux abonnés.');
      if (!(montant >= RECHARGE_MIN) || montant > 50000) throw new ErreurAPI(400, 'Montant de recharge : 5 € HT minimum.');
    }
    compte.demande = { genre, montant, le: new Date().toISOString() };
    await ecrireCompte(env, compte);
    return json({ ok: true, compte: await resumeAvecOffre(env, compte) });
  }

  throw new ErreurAPI(404, 'Action inconnue.');
}

/* ===================== Images de fond ===================== */
const AMBIANCES_FOND = {
  photo: 'realistic professional photograph, natural light, shallow depth of field',
  lumineux: 'bright airy photograph, soft daylight, light pastel tones, clean and optimistic',
  nuit: 'cinematic night photograph, city lights, deep blues and warm highlights, elegant mood',
  minimal: 'minimalist composition, large calm empty areas, soft gradients, subtle texture',
  aquarelle: 'delicate watercolor illustration, soft washes of color, paper texture',
  luxe: 'luxury editorial photograph, refined materials, dark tones with golden accents'
};
function genreImage(chemin) {
  const n = String(chemin).slice(7);
  if (/^fond/.test(n)) return 'fond';
  if (/^logo/.test(n)) return 'logo';
  if (/^partage/.test(n)) return 'partage';
  if (/^app-\d+-/.test(n)) return 'appli';
  return 'article';
}
/* Médiathèque : liste des images d'un client, les plus récentes d'abord.
   À la première lecture, on reprend les images déjà stockées (avant cette fonction) et l'ancienne galerie des fonds IA. */
async function lireMedias(env, slug) {
  const t = await env.CLIENTS.get('site:' + slug + ':medias');
  if (t) { try { return JSON.parse(t); } catch (e) { return []; } }
  const vus = new Set(), liste = [];
  let anciens = [];
  try { anciens = JSON.parse(await env.CLIENTS.get('site:' + slug + ':fonds-ia') || '[]'); } catch (e) {}
  for (const f of anciens) { vus.add(f.chemin); liste.push(Object.assign({ genre: 'fond', source: 'ia' }, f)); }
  let curseur;
  do {
    const l = await env.CLIENTS.list({ prefix: 'img:' + slug + ':', cursor: curseur });
    for (const k of l.keys) {
      const chemin = 'images/' + k.name.slice(('img:' + slug + ':').length);
      if (vus.has(chemin)) continue;
      const horo = (chemin.match(/-(\d{13})/) || [])[1];
      liste.push({ chemin, genre: genreImage(chemin), source: /fond-ia-/.test(chemin) ? 'ia' : /^images\/logo-/.test(chemin) ? 'logo' : 'photo',
        le: horo ? new Date(Number(horo)).toISOString() : new Date(0).toISOString() });
    }
    curseur = l.list_complete ? null : l.cursor;
  } while (curseur);
  liste.sort((a, b) => String(b.le).localeCompare(String(a.le)));
  await env.CLIENTS.put('site:' + slug + ':medias', JSON.stringify(liste));
  await env.CLIENTS.delete('site:' + slug + ':fonds-ia');
  return liste;
}
/* Ajoute des images (sans doublon) ; au-delà de MEDIAS_MAX par genre, les plus anciennes non utilisées sont effacées */
async function ajouterMedias(env, slug, nouvelles) {
  const chemins = new Set(nouvelles.map(x => x.chemin));
  let medias = nouvelles.concat((await lireMedias(env, slug)).filter(x => !chemins.has(x.chemin)));
  const cfg = await configsGroupe(env, slug);
  const parGenre = {};
  const garder = [];
  for (const x of medias) {
    parGenre[x.genre] = (parGenre[x.genre] || 0) + 1;
    if (parGenre[x.genre] > MEDIAS_MAX && !cfg.includes(x.chemin)) { await env.CLIENTS.delete('img:' + slug + ':' + x.chemin.slice(7)); continue; }
    garder.push(x);
  }
  await env.CLIENTS.put('site:' + slug + ':medias', JSON.stringify(garder));
  return garder;
}
/* Claude rédige la description de l'image (en anglais, sans texte dans l'image) à partir de l'activité */
async function descriptionFond(env, cfg, ambiance, idee, pc, prudent) {
  const style = AMBIANCES_FOND[ambiance];
  const activite = [cfg.titre, cfg.sousTitre, cfg.home && cfg.home.ia && cfg.home.ia.description, cfg.home && cfg.home.ia && cfg.home.ia.zone].filter(Boolean).join(' — ');
  const format = pc ? (pc.carre ? 'Square image' : 'Vertical image') : 'Vertical background image';
  // secours sans IA : texte brut du client (si refusé par le filtre, scène générique)
  const secours = (prudent ? 'A welcoming, generic scene evoking a local service business, no recognizable place or brand'
    : pc ? [pc.titre, pc.texte.slice(0, 200)].filter(Boolean).join('. ') + (activite ? ' (' + activite.slice(0, 200) + ')' : '') : (idee || activite || 'a welcoming local business'))
    + '. ' + style + '. ' + format + ', no text, no letters, no logos, no watermark.';
  const cleIA = await cleAnthropic(env);
  if (!cleIA) return secours;
  try {
    const r = await fetch(env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': cleIA, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODELES_IA[0], max_tokens: 300,
        system: 'You write prompts for an image generation model. Output ONLY the prompt, in English, 40 to 80 words, no quotes. ' +
          (pc
            ? 'The image illustrates ONE section (a "card") of a small business mobile page; it is ' + (pc.carre ? 'square (1:1), shown above the text' : 'vertical (9:16), shown full screen behind the text') + '. ' +
              'Depict concretely what this section is about (its service, place, objects or result), consistent with the business. ' +
              'The section text may be in any language: understand it, but write the prompt in English. '
            : 'The image is a vertical (9:16) background for a small business mobile page, composed freely (any framing). ' +
              'Describe a concrete scene evoking the business (place, objects, atmosphere), ') +
          'never a close-up portrait of a person. ' +
          // visages et mains sont les points faibles des générateurs : on les garde petits ou absents
          'Prefer scenes of places, vehicles and objects. If people appear, keep them small, in the background or seen from behind: no faces in close-up, no hands holding objects in the foreground, no phones or screens. ' +
          'It must look like a real candid photograph, never an illustration: write it as a photo (e.g. "real photograph, shot on a full-frame camera, 35mm lens"), with natural colors (not oversaturated), soft natural light and realistic textures; add "not a cartoon, not an illustration, not a 3D render, not CGI". ' +
          // le générateur refuse les marques, lieux privés célèbres, personnages et personnes connues (« output flagged »)
          'Never name or depict brands, trademarks, theme parks or their attractions, mascots, cartoon or film characters, celebrities or real people: ' +
          'replace them with a generic equivalent (e.g. "a family day out at a large amusement park" becomes "a happy French family stepping out of a spacious van on a sunny day near Paris, France"). ' +
          // sans lieu précis, le générateur invente souvent un décor et des personnes d'Asie de l'Est
          'Always anchor the scene in the business\'s real region: name the country and region or city (from the place names in the texts or the business zone; if none, France), ' +
          'with matching local architecture, landscape, vegetation and road signs style, and describe any people as local residents of that country (e.g. "a French family", "European travellers"). ' +
          // ton toujours positif ; un véhicule « de luxe » noir devient vite un corbillard
          'Keep the mood bright, positive and inviting: never somber, funeral, ominous or dark imagery. ' +
          'Vehicles must clearly be modern, elegant passenger cars or vans for clients (e.g. a sleek dark-blue or silver sedan or minivan on a sunny road), never a hearse, ambulance or police car, and without any visible logo; show a single vehicle, whole and well separated from other objects (no overlapping or merged cars). ' +
          (prudent ? 'A previous prompt for this image was rejected by the safety filter: stay especially generic and neutral (objects, place, light), no people in the foreground. ' : '') +
          'Forbid any text: always end with "no text, no letters, no logos, no watermark".',
        messages: [{ role: 'user', content: 'Business: ' + (activite || '(not specified)') + '\nStyle: ' + style +
          (pc ? '\nSection title: ' + (pc.titre || '(none)') + '\nSection text: ' + (pc.texte || '(none)') : '') + (idee ? '\nClient idea: ' + idee : '') }]
      })
    });
    if (!r.ok) return secours;
    const j = await r.json();
    const texte = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join(' ').trim();
    return texte.length > 20 ? texte.slice(0, 1200) : secours;
  } catch (e) { return secours; }
}
/* FLUX.2 klein 9B sur Workers AI : entrée multipart, sortie image en base64 */
async function genererImage(env, prompt, graine, largeur = FOND_L, hauteur = FOND_H) {
  const appel = async (modele, etapes) => {
    const form = new FormData();
    form.append('prompt', prompt);
    form.append('width', String(largeur));
    form.append('height', String(hauteur));
    form.append('seed', String(graine));
    if (etapes) form.append('steps', String(etapes));
    const corps = new Response(form);              // FormData n'expose pas sa frontière : on la récupère ainsi
    const r = await env.AI.run(modele, { multipart: { body: corps.body, contentType: corps.headers.get('content-type') } });
    if (!r || !r.image) throw new Error('réponse sans image');
    return deb64(r.image);
  };
  try { return await appel(MODELE_IMAGE, ETAPES_IMAGE); }
  catch (e) {
    const msg = String((e && e.message) || e);
    if (/3030|flagged/i.test(msg)) throw e;        // image refusée par le filtre : le modèle de secours la refuserait aussi
    console.error('image ' + MODELE_IMAGE + ' indisponible, modèle de secours :', msg.slice(0, 160));
    return appel(MODELE_IMAGE_SECOURS, 0);
  }
}

async function imageClient(env, slug, nom, compte) {
  if (!nomImageValide(nom)) return texte('Introuvable', 404);
  // images communes rangées chez la page principale ; sinon (ancien emplacement) chez la page elle-même
  const racine = !imagePropre(nom) && compte ? racineDe(compte) : slug;
  let { value, metadata } = await env.CLIENTS.getWithMetadata('img:' + racine + ':' + nom, { type: 'arrayBuffer' });
  if (!value && racine !== slug) ({ value, metadata } = await env.CLIENTS.getWithMetadata('img:' + slug + ':' + nom, { type: 'arrayBuffer' }));
  if (!value) return texte('Introuvable', 404);
  return new Response(value, { headers: {
    'content-type': (metadata && metadata.type) || 'application/octet-stream',
    'cache-control': 'public, max-age=31536000, immutable'   // noms d'image horodatés : jamais réécrits
  } });
}

function cleFichier(compte, chemin) {
  const slug = compte.slug;
  if (FICHIERS_SITE.has(chemin)) return 'site:' + slug + ':' + chemin;
  if (chemin.startsWith('images/') && nomImageValide(chemin.slice(7)))
    return 'img:' + (imagePropre(chemin.slice(7)) ? slug : racineDe(compte)) + ':' + chemin.slice(7);
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
  let promo = null;
  if (String(d.promo || '').trim()) {
    promo = (await lirePromos(env)).find(x => x.code === normCode(d.promo) && x.actif);
    if (!promo) throw new ErreurAPI(400, 'Code promo inconnu ou expiré. Corrigez-le ou laissez le champ vide.');
  }
  // Adresse déjà inscrite : on propose de se connecter plutôt que de créer un doublon
  const existants = [];
  for (const s of (await slugsParEmail(env, email)).slice(0, 10)) if (await env.CLIENTS.get('compte:' + s)) existants.push(s);
  if (existants.length) throw new ErreurAPI(409, 'Un compte existe déjà avec cette adresse e-mail : connectez-vous avec votre mot de passe.', 'email_existe', { pages: existants });
  const conf = await lireEmail(env);                // sans service d'e-mail configuré, pas de validation possible : on n'en exige pas
  const compte = await creerCompte(env, { slug, email, mdp: String(d.mdp), plan: 'essai', titre: String(d.titre || '').slice(0, 80),
    langue: LANGUES_MAIL.includes(d.langue) ? d.langue : 'fr', emailAVerifier: !!conf,
    joursBonus: promo ? promo.jours : 0, promo: promo ? { code: promo.code, jours: promo.jours, le: new Date().toISOString() } : null });
  let envoye = false;
  if (conf) { try { await envoyerLienVerif(env, conf, compte); envoye = true; } catch (e) { console.error('e-mail de validation', e.message); } }
  return json({ ok: true, adresse: 'https://' + slug + '.' + DOMAINE + '/', editeur: '/app/' + slug + '/', verifier: !!conf, envoye, compte: resumeCompte(compte) });
}

/* Design de départ d'une nouvelle page : choisi d'après le nom de l'activité (mots-clés FR/EN/RU), sinon au hasard,
   pour que les nouveaux sites ne se ressemblent pas tous. Couleurs reprises de THEMES (commun.js). */
const THEMES_INIT = {
  sable:   ['#f5f1ea', '#e9e0d2', '#2b2620', '#2b2620'],
  nuit:    ['#0f1115', '#1d2230', '#f3f4f6', '#e6c07b'],
  riviera: ['#e8f4f8', '#bfe0ec', '#0d3b4f', '#0d6e8c'],
  olive:   ['#f2f2e6', '#dfe3c8', '#2f3a1f', '#5b6b2f'],
  corail:  ['#fff4ef', '#ffd9cc', '#4a1f14', '#e0603f'],
  luxe:    ['#111111', '#111111', '#f5efe0', '#c9a45c'],
  blanc:   ['#ffffff', '#ffffff', '#111111', '#111111']
};
const ACTIVITES_DESIGN = [
  { re: /vtc|chauffeur|taxi|limo|prestige|luxe|luxury|yacht|concierg|jet|drive|transfert|шофер|такси|водител|трансфер|люкс/, themes: ['luxe', 'nuit'], polices: ['elegant', 'classique'] },
  { re: /restau|caf[eé]|bar\b|pizz|bistro|brasser|traiteur|boulang|p[aâ]tiss|cuisine|food|burger|sushi|cr[eê]pe|glac|chocolat|ресторан|каф|пицц|кухн|пекар/, themes: ['corail', 'sable'], polices: ['classique', 'arrondi'] },
  { re: /spa|sauna|massag|beaut|coiff|esth[eé]ti|ongl|nail|yoga|bien[- ]?[eê]tre|wellness|barb|maquill|soin|салон|массаж|красот|сауна|баня|маникюр|парикмах/, themes: ['sable', 'olive'], polices: ['elegant', 'arrondi'] },
  { re: /plage|mer\b|nautiq|bateau|boat|voile|surf|plong|dive|kayak|villa|location|vacan|h[oô]tel|g[iî]te|riviera|azur|camping|море|яхт|отел|вилл|аренд/, themes: ['riviera', 'blanc'], polices: ['moderne', 'elegant'] },
  { re: /jardin|paysag|garden|bio\b|ferme|farm|vin\b|vins|cave|domaine|wine|fleur|flor|mara[iî]ch|olive|сад|ферм|вин|цвет/, themes: ['olive', 'sable'], polices: ['classique', 'elegant'] },
  { re: /informati|tech|web|digital|d[eé]pann|plomb|[eé]lectric|artisan|b[aâ]timent|r[eé]nov|ma[cç]on|menuis|serrur|garage|m[eé]cani|auto\b|clim|chauff|компьют|ремонт|сантех|электр|строит/, themes: ['blanc', 'nuit'], polices: ['moderne', 'mono'] },
  { re: /enfant|kids|cr[eè]che|nounou|anim(al|aux)|chien|chat\b|toilett|v[eé]t[eé]rin|f[eê]te|party|jouet|dessin|дет|собак|кош|праздн/, themes: ['corail', 'riviera'], polices: ['arrondi', 'moderne'] }
];
function designInitial(titre) {
  const hasard = l => l[Math.floor(Math.random() * l.length)];
  const t = String(titre || '').toLowerCase();
  const act = ACTIVITES_DESIGN.find(a => a.re.test(t));
  const theme = act ? hasard(act.themes) : hasard(Object.keys(THEMES_INIT));
  const [fond, fond2, texte, accent] = THEMES_INIT[theme];
  return {
    theme, fond, fond2, texte, accent,
    police: act ? hasard(act.polices) : hasard(['moderne', 'elegant', 'classique', 'arrondi']),
    forme: hasard(['arrondi', 'arrondi', 'pilule', 'carre']),
    style: hasard(['plein', 'plein', 'doux', 'contour']),
    disposition: hasard(['centre', 'centre', 'haut', 'bas', 'carte'])
  };
}

async function creerCompte(env, o) {
  if (await env.CLIENTS.get('compte:' + o.slug)) throw new ErreurAPI(409, 'Ce nom est déjà pris.');
  if (await env.CLIENTS.get('reserve:' + o.slug)) throw new ErreurAPI(409, 'Ce nom est déjà pris.');
  const maintenant = Date.now();
  const compte = Object.assign({
    slug: o.slug, email: String(o.email || '').trim().toLowerCase(), plan: o.plan, version: 1, cree: new Date(maintenant).toISOString(),
    langue: o.langue || 'fr',
    finEssai: o.plan === 'essai' ? new Date(maintenant + (JOURS_ESSAI + (o.joursBonus || 0)) * 86400000).toISOString() : null,
    payeJusqua: null, note: o.note || ''
  }, o.promo ? { promo: o.promo } : {}, o.emailAVerifier ? { emailAVerifier: true } : {}, await hacherMdp(o.mdp));
  await ecrireCompte(env, compte);
  await indexerEmail(env, compte.email, o.slug, true);
  if (!(await env.CLIENTS.get('site:' + o.slug + ':config.json'))) {
    await env.CLIENTS.put('site:' + o.slug + ':config.json', JSON.stringify({ titre: o.titre || '', design: designInitial(o.titre) }, null, 2));
  }
  return compte;
}

/* ===================== Codes promo =====================
   config:promos = [{ code, jours, actif, note, cree }] — jours offerts en plus des 14 jours d'essai.
   Le code utilisé reste noté sur le compte (suivi et commission des apporteurs). */
const normCode = c => String(c || '').trim().toLowerCase();
async function lirePromos(env) {
  try { const l = JSON.parse(await env.CLIENTS.get('config:promos') || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; }
}
async function verifierPromo(request, env) {
  await limiter(env, 'promo:' + ip(request) + ':' + new Date().toISOString().slice(0, 10), 40, 86400 * 2, 'Trop d’essais de code aujourd’hui.');
  const code = normCode(new URL(request.url).searchParams.get('code'));
  const x = code ? (await lirePromos(env)).find(p => p.code === code && p.actif) : null;
  return json(x ? { valide: true, jours: x.jours, essai: JOURS_ESSAI } : { valide: false });
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

  if (action === 'tarifs') {
    if (request.method === 'GET') return json({ tarifs: await lireTarifs(env), defaut: TARIFS_DEFAUT });
    const centimes = (v, nom) => {
      const n = Math.round(Number(String(v).replace(',', '.')) * 100);
      if (!Number.isFinite(n) || n < 0 || n > 100000) throw new ErreurAPI(400, nom + ' : montant entre 0 et 1 000 €.');
      return n;
    };
    const entier = (v, nom) => {
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 1000) throw new ErreurAPI(400, nom + ' : nombre entier entre 0 et 1 000.');
      return n;
    };
    const t = {
      prixAnnuel: centimes(d.prixAnnuel, 'Abonnement annuel'),
      prixTexte: centimes(d.prixTexte, 'Prix d’une rédaction'),
      prixPicto: centimes(d.prixPicto, 'Prix d’une création de motifs'),
      prixFond: centimes(d.prixFond, 'Prix d’une génération d’images de fond'),
      prixExpress: centimes(d.prixExpress ?? (TARIFS_DEFAUT.prixExpress / 100), 'Prix d’une création express'),
      prixPage: centimes(d.prixPage ?? (TARIFS_DEFAUT.prixPage / 100), 'Prix annuel d’une page supplémentaire'),
      prixTraduction: centimes(d.prixTraduction ?? (TARIFS_DEFAUT.prixTraduction / 100), 'Prix d’une traduction'),
      essai: { texte: entier(d.essaiTexte, 'Rédactions de l’essai'), picto: entier(d.essaiPicto, 'Motifs de l’essai'), fond: entier(d.essaiFond, 'Fonds de l’essai') },
      payant: { texte: entier(d.payantTexte, 'Rédactions de l’abonnement'), picto: entier(d.payantPicto, 'Motifs de l’abonnement'), fond: entier(d.payantFond, 'Fonds de l’abonnement') }
    };
    if (t.prixAnnuel < 100) throw new ErreurAPI(400, 'Abonnement annuel : 1 € minimum (paiement par carte).');
    t.le = new Date().toISOString();
    await env.CLIENTS.put('config:tarifs', JSON.stringify(t));
    await chargerTarifs(env);
    return json({ tarifs: await lireTarifs(env), defaut: TARIFS_DEFAUT });
  }

  if (action === 'email') {
    if (request.method === 'GET') return json(await etatEmail(env));
    if (d.deconnecter) { await env.CLIENTS.delete('config:email'); return json(await etatEmail(env)); }
    if (d.test) {
      const conf = await lireEmail(env);
      if (!conf) throw new ErreurAPI(400, 'Connectez d’abord le service d’e-mails.');
      await envoyerEmail(env, conf, String(d.test), 'Test d’envoi qrbc', '<p>Les e-mails de qrbc.app fonctionnent ✓</p>', 'Les e-mails de qrbc.app fonctionnent.');
      return json({ ok: true });
    }
    await connecterEmail(env, String(d.cle || '').trim(), String(d.expediteur || '').trim());
    return json(await etatEmail(env));
  }

  if (action === 'rappels') {
    if (request.method === 'GET') return json(await lancerRappels(env, { simuler: true }));
    return json(await lancerRappels(env, { simuler: !d.envoyer }));
  }

  if (action === 'anthropic') {
    if (request.method === 'GET') return json(await etatAnthropic(env));
    if (d.deconnecter) { await env.CLIENTS.delete('config:anthropic'); return json(await etatAnthropic(env)); }
    if (d.test) {
      const cle = await cleAnthropic(env);
      if (!cle) throw new ErreurAPI(400, 'Aucune clé enregistrée.');
      await verifierCleAnthropic(env, cle);
      return json(Object.assign(await etatAnthropic(env), { testOk: true }));
    }
    const cle = String(d.cle || '').trim();
    if (!/^sk-ant-[A-Za-z0-9_-]{20,}$/.test(cle)) throw new ErreurAPI(400, 'Clé attendue : sk-ant-… (Console Anthropic › API keys).');
    await verifierCleAnthropic(env, cle);
    await env.CLIENTS.put('config:anthropic', JSON.stringify({ cle: await chiffrer(env, cle), fin: cle.slice(-4), le: new Date().toISOString() }));
    return json(await etatAnthropic(env));
  }

  if (action === 'stripe') {
    if (request.method === 'GET') return json(await etatStripe(env));
    if (d.deconnecter) { await deconnecterStripe(env); return json(await etatStripe(env)); }
    await connecterStripe(env, String(d.cle || '').trim());
    return json(await etatStripe(env));
  }

  if (action === 'promos') {
    let promos = await lirePromos(env);
    if (request.method === 'POST') {
      const code = normCode(d.code);
      const existant = promos.find(x => x.code === code);
      if (d.op === 'supprimer') {
        if (!existant) throw new ErreurAPI(404, 'Code introuvable.');
        promos = promos.filter(x => x.code !== code);
      } else {
        if (!/^[a-z0-9][a-z0-9_-]{1,29}$/.test(code)) throw new ErreurAPI(400, 'Code : 2 à 30 caractères, lettres, chiffres, tiret ou souligné.');
        const jours = Number(d.jours);
        if (!Number.isInteger(jours) || jours < 0 || jours > 730) throw new ErreurAPI(400, 'Jours offerts : nombre entier entre 0 et 730.');
        const val = { code, jours, actif: d.actif !== false, note: String(d.note || '').slice(0, 200) };
        if (d.op === 'ajouter') {
          if (existant) throw new ErreurAPI(409, 'Ce code existe déjà.');
          promos.push(Object.assign(val, { cree: new Date().toISOString() }));
        } else {
          if (!existant) throw new ErreurAPI(404, 'Code introuvable.');
          Object.assign(existant, val);
        }
      }
      await env.CLIENTS.put('config:promos', JSON.stringify(promos));
    }
    return json({ promos, essai: JOURS_ESSAI });
  }

  if (action === 'liste') {
    const comptes = [];
    let curseur;
    do {
      const l = await env.CLIENTS.list({ prefix: 'compte:', cursor: curseur });
      for (const k of l.keys) {
        const c = await lireCompte(env, k.name.slice(7));
        if (!c) continue;
        let titre = '';
        try { titre = (JSON.parse(await env.CLIENTS.get('site:' + c.slug + ':config.json') || '{}').titre) || ''; } catch (e) {}
        const res = resumeCompte(c);
        if ((c.pages || []).length) res.renouvellement = await prixGroupe(env, c);   // abonnement + pages rattachées
        comptes.push(Object.assign(res, { paiements: c.paiements || [], titre, depenseIA: (c.ia && c.ia.depense) || 0, adresse: adressePage(c),
          rappels: c.rappels || {}, langue: c.langue || 'fr', aSupprimer: aSupprimer(c),
          finConservation: echeanceCompte(c) ? new Date(Date.parse(echeanceCompte(c)) + JOURS_CONSERVATION * 86400000).toISOString() : null }));
      }
      curseur = l.list_complete ? null : l.cursor;
    } while (curseur);
    comptes.sort((a, b) => String(b.cree).localeCompare(String(a.cree)));
    const st = await resumeStats(env, 30);
    for (const c of comptes) if (!c.traduction) c.stats30 = st.pages[c.slug] || { visites: 0, clics: 0 };
    return json({ comptes, stats30: st.total });
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
    // Exclure la page des moteurs de recherche (démo, test, choix du client) : hors du plan du site + en-tête noindex
    if (d.noindex !== undefined) { if (d.noindex) compte.noindex = true; else delete compte.noindex; }
    if (d.validerEmail) { delete compte.emailAVerifier; compte.emailVerifie = new Date().toISOString(); }   // validation à la main par Roman
    // IA gratuites restantes : on repart de zéro utilisation et on ajuste l'écart avec le quota de la formule
    for (const type of TYPES_IA) {
      const v = d['restant' + type[0].toUpperCase() + type.slice(1)];
      if (v === undefined) continue;
      const n = Number(v);
      if (!Number.isInteger(n) || n < 0 || n > 1000) throw new ErreurAPI(400, 'IA restantes : nombre entier entre 0 et 1 000.');
      const q = QUOTAS_IA[compte.plan];
      if (!q) throw new ErreurAPI(400, 'Ce compte n’a pas de quota (offert ou suspendu).');
      compte.ia = compte.ia || {};
      compte.ia.bonus = compte.ia.bonus || {};
      compte.ia[type] = 0;
      compte.ia.bonus[type] = n - q[type];
    }
    if (d.email !== undefined) {
      const nouvel = String(d.email).trim().toLowerCase();
      if (nouvel && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nouvel)) throw new ErreurAPI(400, 'Adresse e-mail invalide.');
      await indexerEmail(env, compte.email, compte.slug, false);
      compte.email = nouvel;
      await indexerEmail(env, nouvel, compte.slug, true);
    }
    if (d.mdp) { verifierForceMdp(d.mdp); Object.assign(compte, await hacherMdp(String(d.mdp)), { version: (compte.version || 1) + 1 }); }
    // Rattacher le client à un code après coup (apporteur oublié) ; ne change pas la date de fin d'essai
    if (d.promo !== undefined) {
      const code = normCode(d.promo);
      if (!code) delete compte.promo;
      else {
        const x = (await lirePromos(env)).find(p => p.code === code);
        if (!x) throw new ErreurAPI(404, 'Code promo introuvable.');
        compte.promo = { code, jours: 0, le: new Date().toISOString(), manuel: true };
      }
    }
    await ecrireCompte(env, compte);
    if ((compte.pages || []).length && (d.plan || d.prolongerEssai || d.payeJusqua !== undefined)) await synchroniserPages(env, compte, false);
    if (d.noindex !== undefined || d.plan) await env.CLIENTS.delete('cache:plan-global');   // plan du site recalculé à la prochaine lecture
    return json({ ok: true, compte: resumeCompte(compte) });
  }

  /* Paiement reçu (manuel en attendant Stripe) : abonnement ou recharge */
  if (action === 'abonner') {
    const compte = await lireCompte(env, String(d.nom || ''));
    if (!compte) throw new ErreurAPI(404, 'Compte introuvable.');
    if (compte.parent) throw new ErreurAPI(400, 'Page rattachée à ' + compte.parent + ' : enregistrez le paiement sur la page principale.');
    const r = await prixGroupe(env, compte);
    await appliquerAbonnementGroupe(env, compte, r.aPayer, r.deduction, 'manuel');
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
    const cible = await lireCompte(env, slug);
    if (cible && (cible.pages || []).length) throw new ErreurAPI(400, 'Ce compte a des pages rattachées (' + cible.pages.join(', ') + ') : supprimez-les d’abord.');
    if (cible && cible.traductions && cible.traductions.length) throw new ErreurAPI(400, 'Cette page a des versions traduites (' + cible.traductions.map(l => slug + '.' + l).join(', ') + ') : supprimez-les d’abord.');
    if (cible && cible.parent) {                     // page rattachée : on la retire de sa page principale (les images communes restent)
      const tit = await lireCompte(env, cible.parent);
      if (tit) { tit.pages = (tit.pages || []).filter(x => x !== slug); await ecrireCompte(env, tit); }
      if (cible.traduction) {
        const src = await lireCompte(env, cible.traduction.source);
        if (src) { src.traductions = (src.traductions || []).filter(l => l !== cible.traduction.langue); await ecrireCompte(env, src); }
      }
    }
    for (const prefix of ['site:' + slug + ':', 'img:' + slug + ':']) {
      let curseur;
      do {
        const l = await env.CLIENTS.list({ prefix, cursor: curseur });
        for (const k of l.keys) await env.CLIENTS.delete(k.name);
        curseur = l.list_complete ? null : l.cursor;
      } while (curseur);
    }
    const ancien = await lireCompte(env, slug);
    if (ancien) await indexerEmail(env, ancien.email, slug, false);
    if (env.STATS && !slug.includes('.')) await env.STATS.prepare('DELETE FROM stats WHERE page = ?').bind(slug).run().catch(() => {});
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
  await env.CLIENTS.delete('site:' + slug + ':medias');   // la médiathèque sera reconstruite avec les images importées
  // Les pages pré-rendues seront régénérées au prochain « Enregistrer » ; d'ici là, page de démarrage
  for (const n of ['index.html', 'accueil.html', 'sitemap.xml']) await env.CLIENTS.delete('site:' + slug + ':' + n);
  return { ok: true, images: copiees, echecs: ratees };
}

/* ===================== Mot de passe oublié ===================== */
/* Réponse identique que le compte existe ou non : on ne révèle jamais quelles pages ou adresses sont inscrites. */
const REPONSE_NEUTRE = { ok: true, message: 'Si une page correspond, un e-mail avec un lien de réinitialisation vient d’être envoyé à l’adresse enregistrée. Pensez à vérifier les indésirables.' };

async function mdpOublie(request, env) {
  await limiter(env, 'oubli:' + ip(request) + ':' + new Date().toISOString().slice(0, 13), 5, 7200, 'Trop de demandes. Réessayez dans une heure.');
  const d = await corpsJSON(request);
  const saisie = String(d.identifiant || '').trim().toLowerCase().replace(/\.qrbc\.app\/?$/, '').replace(/^https?:\/\//, '');
  if (!saisie) throw new ErreurAPI(400, 'Indiquez l’adresse de votre page ou votre e-mail.');
  const conf = await lireEmail(env);
  if (!conf) throw new ErreurAPI(503, 'La récupération par e-mail n’est pas encore disponible. Contactez le support.');

  let slugs = [];
  if (saisie.includes('@')) slugs = await slugsParEmail(env, saisie);
  else if (!erreurSlug(saisie)) { const c = await lireCompte(env, saisie); slugs = [c && c.parent ? c.parent : saisie]; }

  const liens = [];
  let email = null;
  for (const slug of slugs.slice(0, 10)) {
    const compte = await lireCompte(env, slug);
    if (!compte || !compte.email || compte.plan === 'suspendu') continue;
    const sien = compte.email.trim().toLowerCase();
    if (email && sien !== email) continue;
    email = sien;
    // pas plus de 3 liens par heure et par page, même si la limite par connexion est contournée
    try { await limiter(env, 'oubli-page:' + slug + ':' + new Date().toISOString().slice(0, 13), 3, 7200, ''); } catch (e) { continue; }
    const jeton = b64url(crypto.getRandomValues(new Uint8Array(32)));
    await env.CLIENTS.put('reinit:' + await empreinte(jeton), JSON.stringify({ slug, v: compte.version || 1 }), { expirationTtl: DUREE_LIEN_MDP });
    liens.push({ slug, url: 'https://' + DOMAINE + '/app?reinit=' + jeton });
  }
  if (email && liens.length) {
    const html = '<div style="font:16px/1.5 system-ui,sans-serif;color:#1b1a17;max-width:480px">' +
      '<p>Bonjour,</p><p>Vous avez demandé à changer le mot de passe de ' + (liens.length > 1 ? 'vos pages' : 'votre page') + ' qrbc.</p>' +
      liens.map(l => '<p style="margin:18px 0"><a href="' + l.url + '" style="display:inline-block;background:#d9572b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">' +
        'Nouveau mot de passe pour ' + esc(l.slug) + '.qrbc.app</a></p>').join('') +
      '<p style="color:#6a665d;font-size:14px">Ce lien est valable 1 heure et ne sert qu’une fois. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre mot de passe actuel reste valable.</p></div>';
    const texteBrut = 'Vous avez demandé à changer votre mot de passe qrbc.\n\n' + liens.map(l => l.slug + '.qrbc.app : ' + l.url).join('\n') +
      '\n\nLien valable 1 heure, à usage unique. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.';
    try { await envoyerEmail(env, conf, email, 'Nouveau mot de passe — qrbc', html, texteBrut); }
    catch (e) { console.error('envoi e-mail', e.message); }
  }
  return json(REPONSE_NEUTRE);
}

async function mdpReinit(request, env) {
  await limiter(env, 'reinit:' + ip(request) + ':' + new Date().toISOString().slice(0, 13), 10, 7200, 'Trop d’essais. Réessayez dans une heure.');
  const d = await corpsJSON(request);
  const jeton = String(d.jeton || '');
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(jeton)) throw new ErreurAPI(400, 'Lien invalide.');
  const cle = 'reinit:' + await empreinte(jeton);
  const t = await env.CLIENTS.get(cle);
  if (!t) throw new ErreurAPI(410, 'Ce lien a expiré ou a déjà servi. Refaites une demande.');
  const info = JSON.parse(t);
  if (d.verifier) return json({ ok: true, slug: info.slug });       // affichage du formulaire uniquement
  verifierForceMdp(d.mdp);
  const compte = await lireCompte(env, info.slug);
  if (!compte || (compte.version || 1) !== info.v) { await env.CLIENTS.delete(cle); throw new ErreurAPI(410, 'Ce lien n’est plus valable. Refaites une demande.'); }
  await env.CLIENTS.delete(cle);                                     // usage unique
  Object.assign(compte, await hacherMdp(String(d.mdp)), { version: (compte.version || 1) + 1 });   // déconnecte les autres appareils
  if (compte.emailAVerifier) { delete compte.emailAVerifier; compte.emailVerifie = new Date().toISOString(); }   // le lien reçu prouve l'adresse
  await ecrireCompte(env, compte);
  const session = await signerSession(env, { s: compte.slug, v: compte.version, e: Math.floor(Date.now() / 1000) + 30 * 86400 });
  return json({ ok: true, slug: compte.slug, jeton: session });
}

/* ===================== Validation de l'adresse e-mail =====================
   À l'inscription, le compte est créé mais reste fermé (pas de connexion, page publique « bientôt en ligne »)
   tant que le lien reçu par e-mail n'a pas été ouvert. Le clic ouvre directement l'éditeur. Lien valable 7 jours, renvoyable. */
const DUREE_LIEN_VERIF = 7 * 86400;
async function envoyerLienVerif(env, conf, compte) {
  const jeton = b64url(crypto.getRandomValues(new Uint8Array(32)));
  await env.CLIENTS.put('verif:' + await empreinte(jeton), JSON.stringify({ slug: compte.slug, email: compte.email }), { expirationTtl: DUREE_LIEN_VERIF });
  const L = LANGUES_MAIL.includes(compte.langue) ? compte.langue : 'fr';
  const url = 'https://' + DOMAINE + '/app?verif=' + jeton + (L !== 'fr' ? '&lang=' + L : '');
  const adr = compte.slug + '.' + DOMAINE;
  const T = {
    fr: { sujet: 'Confirmez votre adresse e-mail — qrbc', bonjour: 'Bonjour,', corps: 'Merci pour votre inscription ! Confirmez votre adresse e-mail pour accéder à votre page <b>' + esc(adr) + '</b> et commencer à la créer :',
      bouton: 'Confirmer et ouvrir ma page', fin: 'Ce lien est valable 7 jours. Si vous n’êtes pas à l’origine de cette inscription, ignorez simplement cet e-mail.' },
    en: { sujet: 'Confirm your email address — qrbc', bonjour: 'Hello,', corps: 'Thank you for signing up! Confirm your email address to access your page <b>' + esc(adr) + '</b> and start building it:',
      bouton: 'Confirm and open my page', fin: 'This link is valid for 7 days. If you did not sign up, simply ignore this email.' },
    ru: { sujet: 'Подтвердите адрес электронной почты — qrbc', bonjour: 'Здравствуйте!', corps: 'Спасибо за регистрацию! Подтвердите адрес электронной почты, чтобы открыть вашу страницу <b>' + esc(adr) + '</b> и начать её создавать:',
      bouton: 'Подтвердить и открыть страницу', fin: 'Ссылка действительна 7 дней. Если вы не регистрировались, просто проигнорируйте это письмо.' }
  }[L];
  const html = '<div style="font:16px/1.5 system-ui,sans-serif;color:#1b1a17;max-width:480px">' +
    '<p>' + T.bonjour + '</p><p>' + T.corps + '</p>' +
    '<p style="margin:22px 0"><a href="' + url + '" style="display:inline-block;background:#d9572b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">' + T.bouton + '</a></p>' +
    '<p style="color:#6a665d;font-size:14px">' + T.fin + '</p></div>';
  const brut = T.bonjour + '\n\n' + T.corps.replace(/<[^>]+>/g, '') + '\n' + url + '\n\n' + T.fin;
  await envoyerEmail(env, conf, compte.email, T.sujet, html, brut);
}
async function verifierEmail(request, env) {
  await limiter(env, 'verif-ip:' + ip(request) + ':' + new Date().toISOString().slice(0, 13), 20, 7200, 'Trop d’essais. Réessayez dans une heure.');
  const d = await corpsJSON(request);
  const jeton = String(d.jeton || '');
  if (!/^[A-Za-z0-9_-]{30,60}$/.test(jeton)) throw new ErreurAPI(400, 'Lien invalide.');
  const cle = 'verif:' + await empreinte(jeton);
  const t = await env.CLIENTS.get(cle);
  if (!t) throw new ErreurAPI(410, 'Ce lien a expiré ou a déjà servi. Ouvrez votre page dans l’appli pour recevoir un nouveau lien.');
  const info = JSON.parse(t);
  const compte = await lireCompte(env, info.slug);
  if (!compte) { await env.CLIENTS.delete(cle); throw new ErreurAPI(410, 'Ce compte n’existe plus.'); }
  if (compte.email !== info.email) { await env.CLIENTS.delete(cle); throw new ErreurAPI(410, 'L’adresse e-mail du compte a changé : utilisez le lien du dernier e-mail reçu.'); }
  await env.CLIENTS.delete(cle);
  if (compte.emailAVerifier) { delete compte.emailAVerifier; compte.emailVerifie = new Date().toISOString(); await ecrireCompte(env, compte); }
  const session = await signerSession(env, { s: compte.slug, v: compte.version || 1, e: Math.floor(Date.now() / 1000) + 30 * 86400 });
  return json({ ok: true, slug: compte.slug, jeton: session, adresse: 'https://' + compte.slug + '.' + DOMAINE + '/' });
}

async function empreinte(t) {
  return b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))));
}

/* Index e-mail → pages, pour retrouver ses pages à partir de l'adresse */
async function indexerEmail(env, email, slug, ajouter) {
  email = String(email || '').trim().toLowerCase();
  if (!email) return;
  const cle = 'email:' + email;
  let l = [];
  try { l = JSON.parse(await env.CLIENTS.get(cle) || '[]'); } catch (e) {}
  l = l.filter(x => x !== slug);
  if (ajouter) l.push(slug);
  if (l.length) await env.CLIENTS.put(cle, JSON.stringify(l)); else await env.CLIENTS.delete(cle);
}
async function slugsParEmail(env, email) {
  const t = await env.CLIENTS.get('email:' + email);
  if (t) return JSON.parse(t);
  // comptes créés avant l'index : on parcourt une fois, puis on mémorise
  if (await env.CLIENTS.get('index-email-fait')) return [];
  let curseur;
  do {
    const l = await env.CLIENTS.list({ prefix: 'compte:', cursor: curseur });
    for (const k of l.keys) { const c = await lireCompte(env, k.name.slice(7)); if (c && c.email) await indexerEmail(env, c.email, c.slug, true); }
    curseur = l.list_complete ? null : l.cursor;
  } while (curseur);
  await env.CLIENTS.put('index-email-fait', '1');
  const t2 = await env.CLIENTS.get('email:' + email);
  return t2 ? JSON.parse(t2) : [];
}

/* ===================== E-mails (Resend) ===================== */
async function lireEmail(env) {
  const t = await env.CLIENTS.get('config:email');
  if (!t) return null;
  const c = JSON.parse(t);
  return Object.assign({}, c, { cle: await dechiffrer(env, c.cle) });
}
async function etatEmail(env) {
  const t = await env.CLIENTS.get('config:email');
  if (!t) return { connecte: false };
  const c = JSON.parse(t);
  return { connecte: true, expediteur: c.expediteur, domaine: c.domaine, statutDomaine: c.statutDomaine, fin: c.fin, le: c.le };
}
async function connecterEmail(env, cle, expediteur) {
  if (!/^re_[A-Za-z0-9_]{10,}$/.test(cle)) throw new ErreurAPI(400, 'Clé Resend attendue : re_…');
  expediteur = expediteur || 'qrbc <noreply@' + DOMAINE + '>';
  const m = expediteur.match(/<?([^\s<>@]+@([^\s<>@]+))>?\s*$/);
  if (!m) throw new ErreurAPI(400, 'Expéditeur invalide. Exemple : qrbc <noreply@qrbc.app>');
  const domaine = m[2].toLowerCase();
  let r, j;
  try {
    r = await fetch((env.RESEND_API || RESEND_API) + '/domains', { headers: { authorization: 'Bearer ' + cle } });
    j = await r.json().catch(() => ({}));
  } catch (e) { throw new ErreurAPI(502, 'Resend injoignable.'); }
  // Clé « Sending access » (recommandée) : valide, mais n'a pas le droit de lister les domaines.
  const envoiSeul = !r.ok && /restricted to only send/i.test((j && j.message) || '');
  if (!r.ok && !envoiSeul) throw new ErreurAPI(400, 'Resend refuse cette clé : ' + ((j && j.message) || r.status));
  let statut = 'limitée à l’envoi';
  if (!envoiSeul) {
    const d = ((j && j.data) || []).find(x => String(x.name).toLowerCase() === domaine);
    if (!d) throw new ErreurAPI(400, 'Le domaine ' + domaine + ' n’est pas ajouté dans Resend (Domains → Add domain).');
    statut = d.status;
  }
  await env.CLIENTS.put('config:email', JSON.stringify({
    expediteur, domaine, statutDomaine: statut, fin: cle.slice(-4), le: new Date().toISOString(), cle: await chiffrer(env, cle)
  }));
}
async function envoyerEmail(env, conf, a, sujet, html, texteBrut) {
  const r = await fetch((env.RESEND_API || RESEND_API) + '/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + conf.cle, 'content-type': 'application/json' },
    body: JSON.stringify({ from: conf.expediteur, to: [a], reply_to: 'support@' + DOMAINE, subject: sujet, html, text: texteBrut })
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new ErreurAPI(502, 'Envoi impossible : ' + ((j && j.message) || r.status));
  }
}

/* ===================== Rappels d'échéance =====================
   Chaque jour (7 h UTC), pour chaque compte en essai ou abonné, on cherche l'étape atteinte la plus avancée
   (J-30 abonnés, J-7, J-1, J0 = page en pause, J+30, J+80) et on l'envoie si rien d'égal ou de plus avancé n'est
   déjà parti pour cette échéance : pas de doublon, et un jour manqué se rattrape sans avalanche.
   Au-delà de JOURS_CONSERVATION jours après l'échéance, le compte est signalé « à supprimer » dans /gestion
   (suppression manuelle). */
const LANGUES_MAIL = ['fr', 'en', 'ru'];
const JOURS_CONSERVATION = 90;
const ENVOIS_MAX = 40;                     // par passage (limite de requêtes d'une tâche Cloudflare) ; la suite part le lendemain
const ETAPES_RAPPEL = [
  { id: 'J-30', seuil: 30, plans: ['payant'] },
  { id: 'J-7', seuil: 7 },
  { id: 'J-1', seuil: 1 },
  { id: 'J0', seuil: 0, apres: true },
  { id: 'J+30', seuil: -30, apres: true },
  { id: 'J+80', seuil: -80, apres: true }
];
function echeanceCompte(c) { return c.plan === 'essai' ? c.finEssai : c.plan === 'payant' ? c.payeJusqua : null; }
function aSupprimer(c, maintenant) {
  const fin = echeanceCompte(c);
  return !!fin && !actif(c) && Date.parse(fin) + JOURS_CONSERVATION * 86400000 < (maintenant || Date.now());
}
function etapeDue(c, maintenant) {
  const fin = echeanceCompte(c);
  if (!fin || !c.email || c.plan === 'gratuit' || c.plan === 'suspendu') return null;
  if (aSupprimer(c, maintenant)) return null;                    // conservation dépassée : plus d'e-mail, suppression manuelle
  const restant = (Date.parse(fin) - maintenant) / 86400000;
  let due = -1;
  ETAPES_RAPPEL.forEach((e, i) => {
    if (e.plans && !e.plans.includes(c.plan)) return;
    if (e.apres ? restant <= e.seuil : Math.round(restant) <= e.seuil) due = i;
  });
  if (due < 0) return null;
  const jour = fin.slice(0, 10), r = c.rappels || {};
  if (ETAPES_RAPPEL.slice(due).some(e => r[jour + ':' + e.id])) return null;
  if (ETAPES_RAPPEL[due].apres && actif(c)) return null;
  return { etape: ETAPES_RAPPEL[due].id, fin, cle: jour + ':' + ETAPES_RAPPEL[due].id, jours: Math.ceil(restant) };
}
async function lancerRappels(env, o) {
  const maintenant = Date.now();
  const conf = o.simuler ? null : await lireEmail(env).catch(() => null);
  const prevus = [], envoyes = [], erreurs = [];
  let curseur, nbSupprimer = 0;
  do {
    const l = await env.CLIENTS.list({ prefix: 'compte:', cursor: curseur });
    for (const k of l.keys) {
      let c; try { c = JSON.parse(await env.CLIENTS.get(k.name) || 'null'); } catch (e) { c = null; }
      if (!c) continue;
      if (aSupprimer(c, maintenant)) nbSupprimer++;
      if (c.parent) continue;                        // pages rattachées : le rappel de la page principale couvre tout le compte
      const due = etapeDue(c, maintenant);
      if (!due) continue;
      const ligne = { slug: c.slug, email: c.email, plan: c.plan, etape: due.etape, fin: due.fin, langue: c.langue || 'fr' };
      if (o.simuler || !conf) { prevus.push(ligne); continue; }
      if (envoyes.length >= ENVOIS_MAX) { prevus.push(ligne); continue; }
      try {
        const m = mailRappel(c, due, (c.pages || []).length ? await prixGroupe(env, c) : null);
        await envoyerEmail(env, conf, c.email, m.sujet, m.html, m.texte);
        c.rappels = Object.assign({}, c.rappels, { [due.cle]: new Date().toISOString() });
        await ecrireCompte(env, c);
        envoyes.push(ligne);
      } catch (e) { erreurs.push(Object.assign(ligne, { erreur: e.message })); }
    }
    curseur = l.list_complete ? null : l.cursor;
  } while (curseur);
  return { simulation: !!o.simuler, emailConfigure: o.simuler ? !!(await env.CLIENTS.get('config:email')) : !!conf,
    envoyes, prevus, erreurs, resume: { envoyes: envoyes.length, enAttente: prevus.length, erreurs: erreurs.length, aSupprimer: nbSupprimer } };
}

/* Texte des rappels : français, anglais, russe (langue de l'éditeur du client) */
function mailRappel(c, due, groupe) {
  const L = LANGUES_MAIL.includes(c.langue) ? c.langue : 'fr';
  const site = c.slug + '.' + DOMAINE;
  const sep = L === 'ru' ? '.' : '/';
  const fmt = iso => { const d = new Date(iso); return String(d.getUTCDate()).padStart(2, '0') + sep + String(d.getUTCMonth() + 1).padStart(2, '0') + sep + d.getUTCFullYear(); };
  const dFin = fmt(due.fin), dSuppr = fmt(new Date(Date.parse(due.fin) + JOURS_CONSERVATION * 86400000).toISOString());
  const prix = groupe ? groupe.prix : PRIX_ANNUEL, ttc = Math.round(prix * (1 + TVA / 100));
  const credit = c.plan === 'payant' ? (groupe ? groupe.deduction : Math.min(c.credit || 0, prix)) : 0;
  const nbP = groupe ? groupe.pages + 1 : 1;         // page principale + pages rattachées (même échéance)
  const eur = v => L === 'en' ? '€' + (v / 100).toFixed(2) : (v / 100).toFixed(2).replace('.', ',') + ' €';
  const lien = 'https://' + DOMAINE + '/app/' + c.slug + '/?abonnement=1' + (L !== 'fr' ? '&lang=' + L : '');
  const essai = c.plan === 'essai', avant = !['J0', 'J+30', 'J+80'].includes(due.etape);
  const T = {
    fr: {
      salut: 'Bonjour,',
      sujet: avant ? (essai ? 'Votre essai qrbc se termine le ' + dFin : 'Votre abonnement qrbc arrive à échéance le ' + dFin)
        : due.etape === 'J+80' ? 'Dernier rappel : votre page ' + site + ' sera supprimée le ' + dSuppr
        : due.etape === 'J+30' ? 'Votre page ' + site + ' vous attend' : 'Votre page ' + site + ' est en pause',
      corps: avant
        ? (essai ? 'Votre essai gratuit de la page <b>' + site + '</b> se termine le <b>' + dFin + '</b>' + (due.jours > 1 ? ' (dans ' + due.jours + ' jours)' : '') + '. Pour qu’elle reste en ligne, avec votre QR code et vos cartes de visite, abonnez-vous dès maintenant.'
                 : 'L’abonnement de votre page <b>' + site + '</b> arrive à échéance le <b>' + dFin + '</b>' + (due.jours > 1 ? ' (dans ' + due.jours + ' jours)' : '') + '. Il n’est pas renouvelé automatiquement : renouvelez-le pour que votre page et votre QR code restent actifs.')
        : due.etape === 'J0' ? 'Votre page <b>' + site + '</b> est en pause depuis le ' + dFin + ' : elle n’est plus visible et votre QR code n’affiche plus vos coordonnées. Rien n’est perdu : un paiement la remet en ligne à l’identique.'
        : 'Votre page <b>' + site + '</b> est en pause depuis le ' + dFin + '. Nous gardons tout (textes, images, QR code) jusqu’au <b>' + dSuppr + '</b> ; après cette date, la page et ses données seront supprimées.',
      prix: 'Abonnement' + (nbP > 1 ? ' de vos ' + nbP + ' pages' : '') + ' : ' + eur(prix) + ' HT par an (' + eur(ttc) + ' TTC).' + (credit ? ' Votre crédit IA de ' + eur(credit) + ' HT sera déduit : il ne reste que ' + eur(prix - credit) + ' HT à payer.' : ''),
      bouton: avant ? (essai ? 'M’abonner' : 'Renouveler pour un an') : 'Réactiver ma page',
      voir: 'Voir ma page', voirTxt: 'Revoir votre page telle que vos clients la voient :',
      pied: 'Pas de renouvellement automatique : vous ne payez que si vous le décidez. Une question ? Répondez simplement à cet e-mail.',
      cgv: 'Conditions générales de vente'
    },
    en: {
      salut: 'Hello,',
      sujet: avant ? (essai ? 'Your qrbc trial ends on ' + dFin : 'Your qrbc subscription expires on ' + dFin)
        : due.etape === 'J+80' ? 'Last reminder: your page ' + site + ' will be deleted on ' + dSuppr
        : due.etape === 'J+30' ? 'Your page ' + site + ' is waiting for you' : 'Your page ' + site + ' is paused',
      corps: avant
        ? (essai ? 'The free trial of your page <b>' + site + '</b> ends on <b>' + dFin + '</b>' + (due.jours > 1 ? ' (in ' + due.jours + ' days)' : '') + '. To keep it online, with your QR code and business cards, subscribe now.'
                 : 'The subscription for your page <b>' + site + '</b> expires on <b>' + dFin + '</b>' + (due.jours > 1 ? ' (in ' + due.jours + ' days)' : '') + '. It does not renew automatically: renew it to keep your page and QR code active.')
        : due.etape === 'J0' ? 'Your page <b>' + site + '</b> has been paused since ' + dFin + ': it is no longer visible and your QR code no longer shows your details. Nothing is lost: a payment puts it back online exactly as it was.'
        : 'Your page <b>' + site + '</b> has been paused since ' + dFin + '. We keep everything (texts, images, QR code) until <b>' + dSuppr + '</b>; after that date, the page and its data will be deleted.',
      prix: 'Subscription' + (nbP > 1 ? ' for your ' + nbP + ' pages' : '') + ': ' + eur(prix) + ' excl. VAT per year (' + eur(ttc) + ' incl. VAT).' + (credit ? ' Your AI credit of ' + eur(credit) + ' excl. VAT will be deducted: only ' + eur(prix - credit) + ' excl. VAT left to pay.' : ''),
      bouton: avant ? (essai ? 'Subscribe' : 'Renew for one year') : 'Reactivate my page',
      voir: 'View my page', voirTxt: 'See your page as your customers see it:',
      pied: 'No automatic renewal: you only pay if you decide to. Any question? Just reply to this email.',
      cgv: 'Terms of sale'
    },
    ru: {
      salut: 'Здравствуйте!',
      sujet: avant ? (essai ? 'Пробный период qrbc заканчивается ' + dFin : 'Подписка qrbc заканчивается ' + dFin)
        : due.etape === 'J+80' ? 'Последнее напоминание: страница ' + site + ' будет удалена ' + dSuppr
        : due.etape === 'J+30' ? 'Ваша страница ' + site + ' ждёт вас' : 'Ваша страница ' + site + ' приостановлена',
      corps: avant
        ? (essai ? 'Бесплатный пробный период вашей страницы <b>' + site + '</b> заканчивается <b>' + dFin + '</b>' + (due.jours > 1 ? ' (через ' + due.jours + ' ' + plurielRu(due.jours, 'день', 'дня', 'дней') + ')' : '') + '. Чтобы страница, QR-код и визитки продолжали работать, оформите подписку.'
                 : 'Подписка на вашу страницу <b>' + site + '</b> заканчивается <b>' + dFin + '</b>' + (due.jours > 1 ? ' (через ' + due.jours + ' ' + plurielRu(due.jours, 'день', 'дня', 'дней') + ')' : '') + '. Она не продлевается автоматически: продлите её, чтобы страница и QR-код оставались активными.')
        : due.etape === 'J0' ? 'Ваша страница <b>' + site + '</b> приостановлена с ' + dFin + ': она больше не видна, а QR-код не показывает ваши контакты. Ничего не потеряно: после оплаты страница вернётся в прежнем виде.'
        : 'Ваша страница <b>' + site + '</b> приостановлена с ' + dFin + '. Мы храним всё (тексты, изображения, QR-код) до <b>' + dSuppr + '</b>; после этой даты страница и её данные будут удалены.',
      prix: 'Подписка' + (nbP > 1 ? ' на ' + nbP + ' ' + plurielRu(nbP, 'страницу', 'страницы', 'страниц') : '') + ': ' + eur(prix) + ' без НДС в год (' + eur(ttc) + ' с НДС).' + (credit ? ' Ваш кредит ИИ ' + eur(credit) + ' без НДС будет вычтен: к оплате останется ' + eur(prix - credit) + ' без НДС.' : ''),
      bouton: avant ? (essai ? 'Оформить подписку' : 'Продлить на год') : 'Восстановить страницу',
      voir: 'Открыть мою страницу', voirTxt: 'Посмотрите на свою страницу глазами клиентов:',
      pied: 'Без автоматического продления: вы платите, только если сами решите. Есть вопросы? Просто ответьте на это письмо.',
      cgv: 'Условия продажи'
    }
  }[L];
  const lienCgv = 'https://' + DOMAINE + '/cgv' + (L !== 'fr' ? '?lang=' + L : '');
  const html = '<div style="font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1b1a17;max-width:520px">' +
    '<p style="font-weight:800;font-size:20px;margin:0 0 18px">qrbc<span style="color:#d9572b">.</span></p>' +
    '<p>' + T.salut + '</p><p>' + T.corps + '</p>' +
    '<p style="color:#4a463f">' + esc(T.prix) + '</p>' +
    '<p style="margin:22px 0"><a href="' + lien + '" style="display:inline-block;background:#d9572b;color:#fff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700">' + esc(T.bouton) + '</a></p>' +
    (avant ? '<p style="margin:0 0 22px">' + esc(T.voirTxt) + ' <a href="https://' + site + '/" style="color:#d9572b;font-weight:700">' + esc(site) + '</a></p>' : '') +
    '<p style="color:#6a665d;font-size:13px;border-top:1px solid #e8e3d8;padding-top:14px">' + esc(T.pied) + '<br>' +
    'KPS · qrbc.app · <a href="mailto:support@' + DOMAINE + '" style="color:#6a665d">support@' + DOMAINE + '</a> · <a href="' + lienCgv + '" style="color:#6a665d">' + esc(T.cgv) + '</a></p></div>';
  const brut = s => s.replace(/<[^>]+>/g, '');
  const texte = T.salut + '\n\n' + brut(T.corps) + '\n\n' + T.prix + '\n\n' + T.bouton + ' : ' + lien +
    (avant ? '\n' + T.voir + ' : https://' + site + '/' : '') + '\n\n' + T.pied + '\nKPS · qrbc.app · support@' + DOMAINE;
  return { sujet: T.sujet, html, texte };
}
function plurielRu(n, un, peu, beaucoup) { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? un : a >= 2 && a <= 4 && (b < 12 || b > 14) ? peu : beaucoup; }

/* ===================== Clé API Anthropic (IA) =====================
   Collée dans /gestion, vérifiée, rangée chiffrée dans KV (config:anthropic) ; jamais renvoyée.
   Sans clé dans /gestion, on garde le secret Cloudflare ANTHROPIC_KEY comme secours. */
async function cleAnthropic(env) {
  try {
    const t = await env.CLIENTS.get('config:anthropic');
    if (t) { const c = JSON.parse(t); const cle = await dechiffrer(env, c.cle); if (cle) return cle; }
  } catch (e) {}
  return env.ANTHROPIC_KEY || '';
}
async function etatAnthropic(env) {
  const t = await env.CLIENTS.get('config:anthropic');
  if (t) { const c = JSON.parse(t); return { connecte: true, source: 'gestion', fin: c.fin, le: c.le, secours: !!env.ANTHROPIC_KEY }; }
  return env.ANTHROPIC_KEY ? { connecte: true, source: 'cloudflare', fin: String(env.ANTHROPIC_KEY).slice(-4) } : { connecte: false };
}
/* Vérification gratuite : la liste des modèles ne consomme aucun token */
async function verifierCleAnthropic(env, cle) {
  const url = (env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages').replace(/\/messages$/, '/models?limit=1');
  let r, j;
  try { r = await fetch(url, { headers: { 'x-api-key': cle, 'anthropic-version': '2023-06-01' } }); j = await r.json().catch(() => ({})); }
  catch (e) { throw new ErreurAPI(502, 'Anthropic injoignable. Réessayez dans un instant.'); }
  if (r.status === 401) throw new ErreurAPI(400, 'Anthropic refuse cette clé (invalide ou supprimée).');
  if (r.status === 403) throw new ErreurAPI(400, 'Cette clé n’a pas les droits nécessaires (vérifiez l’organisation dans la Console).');
  if (!r.ok) throw new ErreurAPI(400, 'Anthropic refuse cette clé : ' + ((j && j.error && j.error.message) || r.status));
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
  // Le nom peut changer dans Stripe : on le relit à chaque ouverture de /gestion
  try {
    const st = await lireStripe(env);
    const nom = nomCompteStripe(await stripe(env, st, 'GET', '/account'));
    if (nom && nom !== c.nomCompte) { c.nomCompte = nom; await env.CLIENTS.put('config:stripe', JSON.stringify(c)); }
  } catch (e) {}
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
  const nom = nomCompteStripe(compteStripe);
  await env.CLIENTS.put('config:stripe', JSON.stringify({
    mode: st.mode, nomCompte: nom, fin: cle.slice(-4), le: new Date().toISOString(),
    taxRate: taux.id, webhookId: wh.id, urlWebhook,
    cle: await chiffrer(env, cle), whsec: await chiffrer(env, wh.secret)
  }));
}
// Nom public (celui que voient les clients au paiement), sinon nom du compte
function nomCompteStripe(a) {
  return (a.business_profile && a.business_profile.name) ||
    (a.settings && a.settings.dashboard && a.settings.dashboard.display_name) || a.email || a.id;
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
  const compte = await lireCompte(env, md.genre === 'page' ? md.titulaire : md.slug);
  if (!compte) return 'compte introuvable';
  if ((compte.refsPayees || []).includes(session.id)) return 'déjà appliqué';
  const montant = Number(md.montant) || 0;
  const ttc = (session.amount_total / 100).toFixed(2) + ' € TTC';
  if (md.genre === 'abonnement') await appliquerAbonnementGroupe(env, compte, montant, Number(md.deduction) || 0, 'Stripe · ' + ttc, session.id);
  else if (md.genre === 'recharge') appliquerRecharge(compte, montant, 'Stripe · ' + ttc, session.id);
  else if (md.genre === 'page') {
    // payé : on crée la page (si le nom a été pris entre-temps, le paiement est noté pour remboursement)
    let note = 'Stripe · ' + ttc + ' · ' + md.cible;
    try { await creerPageSup(env, compte, { type: md.type, cible: md.cible, source: md.source, langue: md.langue, langueSource: md.langueSource }); }
    catch (e) {
      // webhook et retour du client presque en même temps : la page vient d'être créée par l'autre appel
      const deja = await lireCompte(env, md.cible);
      if (deja && deja.parent === compte.slug) return 'déjà appliqué';
      note += ' · ÉCHEC DE CRÉATION (' + e.message + ') : à rembourser'; console.error('page payée non créée', md.cible, e.message);
    }
    journaliser(compte, 'page', montant, note, session.id);
    await ecrireCompte(env, compte);
    return note.includes('ÉCHEC') ? 'échec' : 'appliqué';
  }
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
  r.offre.prixPage = PRIX_PAGE; r.offre.prixTraduction = PRIX_TRADUCTION;
  if (c.parent) r.renouvellement = null;                        // l'abonnement se règle depuis la page principale
  else if ((c.pages || []).length) r.renouvellement = await prixGroupe(env, c);
  return r;
}

/* ===================== Comptes ===================== */
async function lireCompte(env, slug) {
  if (!slug) return null;
  const t = await env.CLIENTS.get('compte:' + slug);
  return t ? JSON.parse(t) : null;
}
/* ===================== Comptes à plusieurs pages =====================
   La page « principale » (titulaire) porte l'e-mail, le mot de passe et l'abonnement ; elle liste ses pages
   rattachées dans `pages`. Une page rattachée a `parent` = page principale, pas de mot de passe ni d'e-mail,
   et copie l'échéance de la principale (synchroniserPages). Une version traduite s'appelle « nom.xx » et est
   servie sur nom.qrbc.app/xx/ (`traduction` = { source, langue }) ; la page traduite liste ses langues dans `traductions`.
   Un compte sans `parent` ni `pages` fonctionne exactement comme avant. */
async function titulaireDe(env, compte) {
  if (!compte || !compte.parent) return compte;
  return (await lireCompte(env, compte.parent)) || compte;
}
const racineDe = c => (c && c.parent) || (c && c.slug);
// Images propres à une page (icônes d'appli, aperçu des liens) ; toutes les autres sont communes au compte
const imagePropre = nom => /^(app-|partage-)/.test(String(nom));
async function membresGroupe(env, tit) {
  const l = [tit];
  for (const s of (tit && tit.pages) || []) { const c = await lireCompte(env, s); if (c && c.parent === tit.slug) l.push(c); }
  return l;
}
// Textes des configurations de toutes les pages du compte (une image n'est effacée que si aucune ne l'utilise)
async function configsGroupe(env, racine) {
  const tit = await lireCompte(env, racine);
  const slugs = tit ? [tit.slug].concat(tit.pages || []) : [racine];
  let t = '';
  for (const s of slugs) t += (await env.CLIENTS.get('site:' + s + ':config.json')) || '';
  return t;
}
/* Les pages rattachées suivent l'abonnement de la principale (une seule échéance) */
async function synchroniserPages(env, tit, nouvelleAnnee) {
  for (const s of tit.pages || []) {
    const c = await lireCompte(env, s);
    if (!c || c.parent !== tit.slug) continue;
    c.plan = tit.plan; c.payeJusqua = tit.payeJusqua; c.finEssai = tit.finEssai;
    if (nouvelleAnnee) c.ia = { texte: 0, picto: 0, depuis: new Date().toISOString() };
    await ecrireCompte(env, c);
  }
}
/* Prix du renouvellement de tout le compte : abonnement + pages rattachées, crédits IA de toutes les pages déduits */
async function prixGroupe(env, tit) {
  const membres = await membresGroupe(env, tit);
  const n = membres.length - 1;
  const prix = PRIX_ANNUEL + n * PRIX_PAGE;
  const credits = membres.reduce((a, c) => a + (c.credit || 0), 0);
  const deduction = Math.min(credits, prix);
  return { prix, deduction, aPayer: prix - deduction, pages: n, prixPage: PRIX_PAGE, prixAnnuel: PRIX_ANNUEL };
}
/* Renouvellement de tout le compte : la principale prend un an de plus, les pages suivent ; la déduction
   est prise sur le crédit de la principale puis sur celui des pages rattachées */
async function appliquerAbonnementGroupe(env, tit, montantHT, deduction, source, ref) {
  const d1 = Math.min(deduction || 0, tit.credit || 0);
  const nb = (tit.pages || []).length;
  appliquerAbonnement(tit, montantHT, d1, source + (nb ? ' · ' + (nb + 1) + ' pages' : ''), ref);
  let reste = (deduction || 0) - d1;
  for (const s of tit.pages || []) {
    if (reste <= 0) break;
    const c = await lireCompte(env, s);
    if (!c || c.parent !== tit.slug || !c.credit) continue;
    const dk = Math.min(reste, c.credit);
    c.credit -= dk; reste -= dk;
    journaliser(c, 'correction', -dk, 'crédit déduit du renouvellement de ' + tit.slug);
    await ecrireCompte(env, c);
  }
  await synchroniserPages(env, tit, true);
}
/* Ajout d'une page : possible pour un compte offert (gratuit) ou abonné actif ; prix au prorata jusqu'à l'échéance commune */
function offreAjout(tit) {
  if (tit.plan === 'gratuit') return { possible: true, gratuit: true, prix: 0 };
  if (tit.plan === 'payant' && actif(tit) && !tit.payeJusqua)          // abonné sans date de fin (compte réglé à la main)
    return { possible: true, gratuit: false, jours: 365, echeance: null, prixAnnuel: PRIX_PAGE, prix: PRIX_PAGE };
  if (tit.plan === 'payant' && actif(tit) && tit.payeJusqua) {
    const jours = Math.max(1, Math.ceil((Date.parse(tit.payeJusqua) - Date.now()) / 86400000));
    return { possible: true, gratuit: false, jours, echeance: tit.payeJusqua, prixAnnuel: PRIX_PAGE,
      prix: Math.max(PAGE_MIN, Math.round(PRIX_PAGE * Math.min(jours, 366) / 365)) };
  }
  return { possible: false, raison: tit.plan === 'essai'
    ? 'Les pages supplémentaires et les traductions sont disponibles avec l’abonnement. Abonnez-vous d’abord à votre page principale.'
    : 'Votre abonnement est inactif : renouvelez-le d’abord pour ajouter une page.' };
}
/* Vérifie une demande d'ajout et renvoie la page à créer : { type, cible, source?, langue?, langueSource? } */
async function preparerAjout(env, tit, courant, d) {
  if (d.type === 'traduction') {
    const source = courant.traduction ? null : courant;
    if (!source) throw new ErreurAPI(400, 'Ouvrez la page d’origine pour lui ajouter une langue.');
    const langue = String(d.langue || '').toLowerCase();
    const langueSource = source.langueSite || (LANGUES_PAGE.includes(d.langueSource) ? d.langueSource : 'fr');
    if (!LANGUES_PAGE.includes(langue)) throw new ErreurAPI(400, 'Langue non proposée.');
    if (langue === langueSource) throw new ErreurAPI(400, 'Cette page est déjà dans cette langue.');
    const cible = source.slug + '.' + langue;
    if (await env.CLIENTS.get('compte:' + cible)) throw new ErreurAPI(409, 'Cette langue existe déjà pour cette page.');
    return { type: 'traduction', cible, source: source.slug, langue, langueSource };
  }
  const cible = String(d.nom || '').trim().toLowerCase();
  const err = erreurSlug(cible);
  if (err) throw new ErreurAPI(400, err);
  if (await env.CLIENTS.get('compte:' + cible)) throw new ErreurAPI(409, 'Ce nom est déjà pris.');
  const resa = await env.CLIENTS.get('reserve:' + cible);
  if (resa && resa !== tit.slug) throw new ErreurAPI(409, 'Ce nom est en cours de réservation. Choisissez-en un autre.');
  return { type: 'page', cible };
}
/* Crée la page rattachée (après paiement, ou tout de suite pour un compte offert). tit est modifié : à écrire par l'appelant. */
async function creerPageSup(env, tit, a) {
  if (await env.CLIENTS.get('compte:' + a.cible)) throw new ErreurAPI(409, 'Cette page existe déjà.');
  const page = {
    slug: a.cible, parent: tit.slug, email: '', plan: tit.plan, version: 1, cree: new Date().toISOString(),
    langue: tit.langue || 'fr', finEssai: tit.finEssai || null, payeJusqua: tit.payeJusqua || null, note: '',
    ia: { texte: 0, picto: 0, depuis: new Date().toISOString() }
  };
  let cfg = { titre: '' };
  if (a.type === 'traduction') {
    page.traduction = { source: a.source, langue: a.langue };
    page.aTraduire = true;                                   // 1re traduction offerte, faite à la 1re ouverture de l'éditeur
    try { cfg = JSON.parse(await env.CLIENTS.get('site:' + a.source + ':config.json') || '{}'); } catch (e) { cfg = {}; }
    delete cfg.partage; delete cfg.appIcones;                // propres à chaque page : refaits à l'enregistrement
    cfg.langue = a.langue;
    const src = a.source === tit.slug ? tit : await lireCompte(env, a.source);
    if (src && !src.langueSite) {
      src.langueSite = a.langueSource || 'fr';
      if (src !== tit) await ecrireCompte(env, src);
    }
  }
  await ecrireCompte(env, page);
  await env.CLIENTS.put('site:' + a.cible + ':config.json', JSON.stringify(cfg, null, 2));
  tit.pages = (tit.pages || []).filter(x => x !== a.cible).concat([a.cible]);
  await env.CLIENTS.delete('reserve:' + a.cible);
  return page;
}
function adressePage(c) {
  return c.traduction ? 'https://' + c.traduction.source + '.' + DOMAINE + '/' + c.traduction.langue + '/' : 'https://' + c.slug + '.' + DOMAINE + '/';
}
/* Textes traduits d'une configuration : on n'envoie que les textes affichés (jamais liens, numéros, couleurs, images) */
const NOMS_LANGUES = { fr: 'French', en: 'English', ru: 'Russian', es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese', nl: 'Dutch',
  uk: 'Ukrainian', pl: 'Polish', ro: 'Romanian', tr: 'Turkish', zh: 'Simplified Chinese', ja: 'Japanese' };
function textesATraduire(cfg) {
  const t = {};
  const mettre = (cle, v) => { if (typeof v === 'string' && v.trim()) t[cle] = v; };
  ['titre', 'sousTitre', 'pied', 'appNom'].forEach(k => mettre(k, cfg[k]));
  (cfg.boutons || []).forEach((b, i) => { if (b) { mettre('boutons.' + i + '.texte', b.texte); mettre('boutons.' + i + '.message', b.message); } });
  const h = cfg.home || {};
  mettre('home.boutonContact', h.boutonContact); mettre('home.lienTexte', h.lienTexte);
  (h.articles || []).forEach((a, i) => { if (a) { mettre('home.articles.' + i + '.titre', a.titre); mettre('home.articles.' + i + '.texte', a.texte); mettre('home.articles.' + i + '.alt', a.alt); } });
  if (h.ia) mettre('home.ia.description', h.ia.description);
  const seo = cfg.seo || {};
  mettre('seo.titre', seo.titre); mettre('seo.description', seo.description); mettre('seo.motCle', seo.motCle);
  return t;
}
async function traduireConfig(env, cleIA, cfg, de, vers) {
  const copie = JSON.parse(JSON.stringify(cfg));
  // textes par défaut affichés sur la page (sinon ils resteraient en français)
  copie.home = copie.home || {};
  if (!copie.home.lienTexte) copie.home.lienTexte = 'Découvrir l’entreprise';
  if (!copie.home.boutonContact) copie.home.boutonContact = 'Contact';
  const textes = textesATraduire(copie);
  if (!Object.keys(textes).length) return copie;
  const r = await fetch(env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': cleIA, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODELE_PAR_TYPE.texte, max_tokens: 8000,
      system: 'You translate the texts of a small business mobile page from ' + (NOMS_LANGUES[de] || de) + ' to ' + (NOMS_LANGUES[vers] || vers) + '. ' +
        'Translate naturally for local customers, keeping the tone, meaning and approximate length. Keep brand names, person names, ' +
        'street addresses and place names unchanged (transliterate them only if the target script requires it). Keep emojis and line breaks. ' +
        'Output ONLY a JSON object with exactly the same keys as the input and the translated strings as values.',
      messages: [{ role: 'user', content: JSON.stringify(textes, null, 1) }]
    })
  });
  const txt = await r.text();
  if (!r.ok) { console.error('traduction', r.status, txt.slice(0, 300)); throw new ErreurAPI(502, 'La traduction a échoué. Réessayez dans un instant (rien n’a été décompté).'); }
  let sortie = null;
  try {
    const j = JSON.parse(txt);
    const brut = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    sortie = JSON.parse(brut.slice(brut.indexOf('{'), brut.lastIndexOf('}') + 1));
  } catch (e) { sortie = null; }
  if (!sortie || typeof sortie !== 'object') throw new ErreurAPI(502, 'La traduction a échoué. Réessayez dans un instant (rien n’a été décompté).');
  for (const cle of Object.keys(textes)) {
    const v = sortie[cle];
    if (typeof v !== 'string' || !v.trim()) continue;            // texte manquant : on garde l'original
    const chemin = cle.split('.');
    let o = copie;
    for (let i = 0; i < chemin.length - 1; i++) { o = o && o[/^\d+$/.test(chemin[i]) ? Number(chemin[i]) : chemin[i]]; }
    if (o && typeof o === 'object') o[chemin[chemin.length - 1]] = v.slice(0, 4000);
  }
  return copie;
}

/* Langues publiées d'une page (pour le sélecteur et Google) : [{ l, u }] — vide si pas de traduction */
function languesPage(source) {
  const tr = (source && source.traductions) || [];
  if (!tr.length) return [];
  return [{ l: source.langueSite || 'fr', u: '/' }].concat(tr.map(l => ({ l, u: '/' + l + '/' })));
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
    slug: c.slug, email: c.email, emailAVerifier: !!c.emailAVerifier, noindex: !!c.noindex, plan: c.plan, actif: actif(c), finEssai: c.finEssai, payeJusqua: c.payeJusqua, cree: c.cree, note: c.note || '', promo: c.promo || null,
    ia: {
      illimite: c.plan === 'gratuit',
      texte: { utilises: ia.texte || 0, inclus: q ? Math.max(0, q.texte + ((ia.bonus && ia.bonus.texte) || 0)) : null },
      picto: { utilises: ia.picto || 0, inclus: q ? Math.max(0, q.picto + ((ia.bonus && ia.bonus.picto) || 0)) : null },
      fond: { utilises: ia.fond || 0, inclus: q ? Math.max(0, (q.fond || 0) + ((ia.bonus && ia.bonus.fond) || 0)) : null },
      credit: c.credit || 0,                       // centimes
      prix: PRIX_IA,
      express: Object.assign({ prix: PRIX_EXPRESS, enCours: expressEnCours(c) ? c.express : null }, coutExpress(c))
    },
    offre: { prixAnnuel: PRIX_ANNUEL, rechargeMin: RECHARGE_MIN, quotasPayant: QUOTAS_IA.payant, tva: TVA, renouvelerAvant: RENOUVELER_AVANT },
    renouvellement: prixRenouvellement(c),
    demande: c.demande || null,
    // comptes à plusieurs pages
    parent: c.parent || null, pages: c.pages || [], traduction: c.traduction || null, aTraduire: !!c.aTraduire,
    langueSite: c.langueSite || null, traductions: c.traductions || []
  };
}

/* Inclus dans le quota, débité du crédit, ou refus avec l'offre adaptée */
function modeFacturation(c, type, express) {
  if (express) {
    // Une étape de création express ne touche jamais aux créations normales : déjà réglée, ou refusée
    if (expressEnCours(c) && c.express.restant[type] > 0) return 'express';
    throw new ErreurAPI(402, 'Les essais de cette étape de la création express sont épuisés. Rien n’a été décompté : écrivez-nous si le problème continue.', 'express_epuise');
  }
  if (c.plan === 'gratuit') return 'illimite';
  const q = QUOTAS_IA[c.plan];
  const utilises = (c.ia && c.ia[type]) || 0;
  const bonus = (c.ia && c.ia.bonus && c.ia.bonus[type]) || 0;
  if (q && utilises < (q[type] || 0) + bonus) return 'inclus';
  if (c.plan === 'payant' && (c.credit || 0) >= PRIX_IA[type]) return 'credit';
  const n = q ? (q[type] || 0) : 0, np = QUOTAS_IA.payant[type] || 0;
  const nom = k => type === 'texte' ? (k > 1 ? 'rédactions IA' : 'rédaction IA')
    : type === 'fond' ? (k > 1 ? 'créations d’images de fond' : 'création d’images de fond')
    : (k > 1 ? 'créations de motifs IA' : 'création de motifs IA');
  const unite = euros(PRIX_IA[type]) + ' HT ' + (type === 'texte' ? 'la rédaction' : type === 'fond' ? 'la création (2 images)' : 'la création de motifs');
  if (c.plan === 'essai') {
    const offre = np > 0 ? 'Abonnez-vous dès maintenant pour en obtenir ' + np + ' par an (' + euros(PRIX_ANNUEL) + ' HT/an).'
      : 'Abonnez-vous dès maintenant (' + euros(PRIX_ANNUEL) + ' HT/an), puis ' + unite + '.';
    throw new ErreurAPI(402, (n > 0 ? (n > 1 ? 'Vos ' + n + ' ' + nom(n) + ' d’essai sont utilisées. ' : 'Votre ' + nom(1) + ' d’essai est utilisée. ')
      : 'La ' + nom(1) + ' n’est pas incluse dans l’essai. ') + offre, 'essai_epuise');
  }
  throw new ErreurAPI(402, (n > 0 ? (n > 1 ? 'Vos ' + n + ' ' + nom(n) + ' de l’année sont utilisées. ' : 'Votre ' + nom(1) + ' de l’année est utilisée. ')
    : 'La ' + nom(1) + ' n’est pas incluse dans l’abonnement. ') + 'Rechargez votre crédit (' + euros(RECHARGE_MIN) + ' HT minimum, ' + unite + ').', 'credit_insuffisant');
}
function euros(c) { return ((c || 0) / 100).toFixed(2).replace('.', ',').replace(',00', '') + ' €'; }
function facturer(c, type, mode) {
  if (mode === 'express') {                      // déjà payé au lancement de la création express
    if (c.express && c.express.restant) {
      c.express.restant[type] = Math.max(0, (c.express.restant[type] || 0) - 1);
      c.express.faits = Object.assign({}, c.express.faits, { [type]: true });
    }
    return;
  }
  if (mode === 'illimite' || mode === 'inclus') { c.ia = c.ia || {}; c.ia[type] = (c.ia[type] || 0) + 1; }
  if (mode === 'illimite') return;
  if (mode === 'credit') c.credit = Math.max(0, (c.credit || 0) - PRIX_IA[type]);
  c.ia.depense = (c.ia.depense || 0) + (mode === 'credit' ? PRIX_IA[type] : 0);
}
function expressEnCours(c) {
  return !!(c.express && c.express.restant && Date.parse(c.express.jusqua) > Date.now() && TYPES_IA.some(k => c.express.restant[k] > 0));
}
/* Ce que coûte une création express pour ce compte, et si elle est possible maintenant */
function coutExpress(c) {
  if (c.plan === 'gratuit') return { possible: true, mode: 'offert' };
  if (c.plan === 'essai') {
    const q = QUOTAS_IA.essai, ia = c.ia || {}, bonus = ia.bonus || {};
    const essai = {}, manque = [];
    for (const k of TYPES_IA) {
      essai[k] = (q[k] || 0) > 0 ? Math.ceil(q[k] / 2) : 0;                // la moitié des créations gratuites de l'essai
      if ((q[k] || 0) + (bonus[k] || 0) - (ia[k] || 0) < essai[k]) manque.push(k);
    }
    if (!essai.texte || manque.length) return { possible: false, mode: 'essai', essai, code: 'essai_epuise',
      message: 'La création express utilise la moitié de vos créations IA d’essai, et il n’en reste plus assez. Abonnez-vous (' + euros(PRIX_ANNUEL) + ' HT/an) : la création express coûtera alors ' + euros(PRIX_EXPRESS) + ' HT.' };
    return { possible: true, mode: 'essai', essai };
  }
  const ok = (c.credit || 0) >= PRIX_EXPRESS;
  return { possible: ok, mode: 'credit', prix: PRIX_EXPRESS, code: ok ? undefined : 'credit_insuffisant',
    message: ok ? undefined : 'La création express coûte ' + euros(PRIX_EXPRESS) + ' HT sur votre crédit IA (solde : ' + euros(c.credit || 0) + '). Rechargez votre crédit (' + euros(RECHARGE_MIN) + ' HT minimum).' };
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
  const tit = await titulaireDe(env, compte);
  if (!compte || (tit.version || 1) !== ch.v || compte.plan === 'suspendu' || tit.plan === 'suspendu') throw new ErreurAPI(401, 'Session expirée : reconnectez-vous.');
  if (tit.emailAVerifier) throw new ErreurAPI(401, 'Confirmez d’abord votre adresse e-mail.');
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
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}
function xml(corps) {
  return new Response(corps, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

/* ===================== Statistiques de visites =====================
   Base D1 (liaison STATS) : une ligne par page × jour × type × clé, avec un compteur.
     type 'visite' (clé vide) · 'source' (qr, google, moteur, reseaux, site, direct) · 'pays' (FR, BE…)
     'langue' (fr, en…) · 'clic' (tel, whatsapp, avis…)
   Ni cookie de suivi ni adresse IP : seulement des totaux (mesure d'audience exemptée de consentement).
   Non comptés : robots, préchargements, navigation interne d'une page à l'autre, propriétaire de la page
   (cookie qrbc-moi posé quand il ouvre son éditeur). Une page = son sous-domaine (versions traduites comprises,
   distinguées par la langue). Lignes de plus de 400 jours effacées chaque jour. */
let TACHES = null;                  // contexte de la requête : écritures faites après l'envoi de la réponse
let TABLES_STATS = false;
const GARDER_STATS = 400;           // jours
const TYPES_CLIC = new Set(['tel', 'sms', 'email', 'whatsapp', 'avis', 'maps', 'telegram', 'instagram', 'facebook', 'tiktok',
  'youtube', 'linkedin', 'x', 'snapchat', 'pinterest', 'vk', 'lien']);
// Robots et outils (Googlebot, outil d'inspection Search Console, GoogleOther, aperçus de liens, audits SEO…)
const RE_ROBOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|^whatsapp|lighthouse|headless|curl|wget|python|http-client|okhttp|monitor|google-|googleother|inspectiontool|mediapartners|feedfetcher|apis-google|ahrefs|semrush|mj12|dataforseo|validator|pagespeed|gtmetrix|screaming|bingpreview|bytespider|scrapy|java\/|go-http|node-fetch|axios/i;

async function tablesStats(env) {
  if (TABLES_STATS || !env.STATS) return !!env.STATS;
  await env.STATS.batch([
    env.STATS.prepare("CREATE TABLE IF NOT EXISTS stats (page TEXT NOT NULL, jour TEXT NOT NULL, type TEXT NOT NULL, cle TEXT NOT NULL DEFAULT '', n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (page, jour, type, cle)) WITHOUT ROWID"),
    env.STATS.prepare('CREATE INDEX IF NOT EXISTS stats_jour ON stats (jour)')
  ]);
  return (TABLES_STATS = true);
}
// Jour à l'heure de Paris (AAAA-MM-JJ)
function jourParis(d) { return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' }).format(d || new Date()); }
function pageStats(compte) { return compte.traduction ? compte.traduction.source : compte.slug; }
function visiteurHumain(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!ua || RE_ROBOT.test(ua)) return false;
  if (/prefetch|prerender/i.test((request.headers.get('sec-purpose') || '') + (request.headers.get('purpose') || ''))) return false;
  return !/(?:^|;\s*)qrbc-moi=1/.test(request.headers.get('cookie') || '');
}
function enArrierePlan(promesse) {
  const p = promesse.catch(e => console.error('stats', e.message));
  if (TACHES) TACHES.waitUntil(p);
}
function ecrireStats(env, page, lignes) {
  if (!env.STATS) return;
  const jour = jourParis();
  enArrierePlan(tablesStats(env).then(() => env.STATS.batch(lignes.map(([type, cle]) =>
    env.STATS.prepare('INSERT INTO stats (page, jour, type, cle, n) VALUES (?, ?, ?, ?, 1) ON CONFLICT (page, jour, type, cle) DO UPDATE SET n = n + 1')
      .bind(page, jour, type, String(cle || '').slice(0, 40))))));
}
function sourceVisite(url, request, slug) {
  if (url.searchParams.get('s') === 'qr') return 'qr';
  let h = '';
  try { h = new URL(request.headers.get('referer') || '').hostname.toLowerCase(); } catch (e) {}
  if (!h) return 'direct';
  if (h === slug + '.' + DOMAINE) return null;                                     // navigation interne : déjà comptée
  if (/(^|\.)google\./.test(h)) return 'google';
  if (/(^|\.)(bing|duckduckgo|yandex|qwant|ecosia|yahoo|baidu|brave|startpage|ya|seznam)\./.test(h)) return 'moteur';
  if (/(^|\.)(facebook|fb|instagram|t|twitter|x|linkedin|lnkd|tiktok|pinterest|youtube|vk|ok|telegram|whatsapp|snapchat|threads|reddit|messenger)\.(com|co|me|ru|net|in)$/.test(h)) return 'reseaux';
  return 'site';
}
function compterVisite(request, env, slug, url, langue) {
  if (!env.STATS || (request.method !== 'GET' && request.method !== 'HEAD') || !visiteurHumain(request)) return;
  if (url.searchParams.has('moi')) return;                                       // lien « ouvrir » de l'éditeur
  const source = sourceVisite(url, request, slug);
  if (!source) return;
  const pays = (request.cf && request.cf.country) || 'XX';
  ecrireStats(env, slug, [['visite', ''], ['source', source], ['pays', /^[A-Z]{2}$/.test(pays) ? pays : 'XX'], ['langue', /^[a-z]{2}$/.test(langue || '') ? langue : 'fr']]);
}
async function compterClic(request, env, slug) {
  if (env.STATS && visiteurHumain(request) && /^[a-z0-9-]+$/.test(slug)) {
    let d = {};
    try { d = JSON.parse(await request.text() || '{}'); } catch (e) {}
    if (TYPES_CLIC.has(d.t) && await env.CLIENTS.get('compte:' + slug)) ecrireStats(env, slug, [['clic', d.t]]);
  }
  return new Response(null, { status: 204 });
}
// Le propriétaire (ou Roman) n'est pas compté : cookie posé pour tout qrbc.app à l'ouverture de l'éditeur
function marquerProprietaire() {
  return new Response(null, { status: 204, headers: {
    'set-cookie': 'qrbc-moi=1; Domain=' + DOMAINE + '; Path=/; Max-Age=31536000; SameSite=Lax; Secure', 'cache-control': 'no-store' } });
}
async function lireStats(env, page, jours) {
  const debut = jourParis(new Date(Date.now() - (jours - 1) * 86400000));
  const res = { actif: !!env.STATS, jours, debut, fin: jourParis(), parJour: {}, source: {}, pays: {}, langue: {}, clic: {}, visites: 0, clics: 0 };
  if (!(await tablesStats(env))) return res;
  const { results } = await env.STATS.prepare('SELECT jour, type, cle, SUM(n) AS n FROM stats WHERE page = ? AND jour >= ? GROUP BY jour, type, cle')
    .bind(page, debut).all();
  for (const r of results || []) {
    if (r.type === 'visite') { res.visites += r.n; res.parJour[r.jour] = (res.parJour[r.jour] || 0) + r.n; }
    else if (res[r.type]) {
      res[r.type][r.cle] = (res[r.type][r.cle] || 0) + r.n;
      if (r.type === 'clic') { res.clics += r.n; res.clicsParJour = res.clicsParJour || {}; res.clicsParJour[r.jour] = (res.clicsParJour[r.jour] || 0) + r.n; }
    }
  }
  return res;
}
async function resumeStats(env, jours) {
  const out = { pages: {}, total: { visites: 0, clics: 0, actif: !!env.STATS } };
  try {
    if (!(await tablesStats(env))) return out;
    const debut = jourParis(new Date(Date.now() - (jours - 1) * 86400000));
    const { results } = await env.STATS.prepare("SELECT page, type, SUM(n) AS n FROM stats WHERE jour >= ? AND type IN ('visite', 'clic') GROUP BY page, type").bind(debut).all();
    for (const r of results || []) {
      const k = r.type === 'visite' ? 'visites' : 'clics';
      (out.pages[r.page] = out.pages[r.page] || { visites: 0, clics: 0 })[k] += r.n;
      out.total[k] += r.n;
    }
  } catch (e) { console.error('stats', e.message); }
  return out;
}
async function purgerStats(env) {
  if (!(await tablesStats(env))) return;
  await env.STATS.prepare('DELETE FROM stats WHERE jour < ?').bind(jourParis(new Date(Date.now() - GARDER_STATS * 86400000))).run();
}

/* ===================== Référencement : plan du site global =====================
   https://qrbc.app/sitemap.xml = index des plans du site : celui du site principal + celui de chaque page client
   publiée et active (nom.qrbc.app/sitemap.xml, versions traduites nom.qrbc.app/xx/sitemap.xml).
   Exclues : pages en pause, e-mail non confirmé, jamais enregistrées, ou marquées « noindex ».
   Le résultat est gardé 6 h en KV (cache:plan-global) ; ?frais le recalcule tout de suite. */
const DUREE_CACHE_PLAN = 6 * 3600;
function planSitePrincipal() {
  const jour = new Date().toISOString().slice(0, 10);
  const adresses = ['/', '/?lang=en', '/?lang=ru', '/cgv', '/mentions-legales'];
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    adresses.map(a => '  <url><loc>' + esc('https://' + DOMAINE + a) + '</loc><lastmod>' + jour + '</lastmod></url>\n').join('') + '</urlset>\n';
}
async function planGlobal(env, frais) {
  if (!frais) {
    const enCache = await env.CLIENTS.get('cache:plan-global');
    if (enCache) return xml(enCache);
  }
  // 1. pages qui ont un plan du site publié (clé site:<page>:sitemap.xml, écrite à chaque enregistrement)
  const publiees = [];
  let curseur;
  do {
    const l = await env.CLIENTS.list({ prefix: 'site:', cursor: curseur });
    for (const k of l.keys) {
      const m = k.name.match(new RegExp('^site:(' + RE_PAGE + '):sitemap\\.xml$'));
      if (m) publiees.push(m[1]);
    }
    curseur = l.list_complete ? null : l.cursor;
  } while (curseur);
  // 2. on ne garde que les pages visibles
  const titulaires = new Map();
  const titulaire = async c => {
    if (!c.parent) return c;
    if (!titulaires.has(c.parent)) titulaires.set(c.parent, await lireCompte(env, c.parent));
    return titulaires.get(c.parent);
  };
  const plans = ['https://' + DOMAINE + '/sitemap-site.xml'];
  for (const nom of publiees.sort()) {
    const c = await lireCompte(env, nom);
    if (!c || !actif(c) || c.noindex) continue;
    let adresse;
    if (c.traduction) {
      const src = await lireCompte(env, c.traduction.source);
      if (!src || !actif(src) || src.noindex || !(src.traductions || []).includes(c.traduction.langue)) continue;
      const tit = await titulaire(src);
      if (!tit || tit.emailAVerifier) continue;
      adresse = 'https://' + c.traduction.source + '.' + DOMAINE + '/' + c.traduction.langue + '/sitemap.xml';
    } else {
      if (nom.includes('.')) continue;
      const tit = await titulaire(c);
      if (!tit || tit.emailAVerifier) continue;
      adresse = 'https://' + nom + '.' + DOMAINE + '/sitemap.xml';
    }
    plans.push(adresse);
  }
  const corps = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    plans.map(a => '  <sitemap><loc>' + esc(a) + '</loc></sitemap>\n').join('') + '</sitemapindex>\n';
  await env.CLIENTS.put('cache:plan-global', corps, { expirationTtl: DUREE_CACHE_PLAN });
  return xml(corps);
}
/* Page d'accueil dans la langue du lien (?lang=en|ru) : les robots d'aperçu (WhatsApp, Facebook…)
   et Google lisent le titre et la description sans exécuter le JavaScript */
const META_ACCUEIL = {
  en: { lang: 'en', locale: 'en_GB', titre: "QR Business Card in your customers’ language | qrbc",
        desc: "QR business card and mobile page for your business. Edit it anytime, translate it with a single QR code. 14 days free, then €18 excl. VAT/year." },
  ru: { lang: 'ru', locale: 'ru_RU', titre: "Визитка с QR-кодом на любом языке | qrbc – QR Business Card",
        desc: "Визитка с QR-кодом и мобильная страница для вашего дела. Меняйте её в любой момент, переводите — QR-код один. 14 дней бесплатно, затем 18 € без НДС в год." }
};
/* Dictionnaire de l'interface (i18n.js : 'français': ['English', 'Русский']) lu une fois par instance du Worker,
   pour envoyer l'accueil déjà traduit aux moteurs de recherche (sans attendre le JavaScript) */
let DICO = null;
async function dictionnaire(env, request) {
  if (DICO) return DICO;
  const u = new URL(request.url); u.pathname = '/i18n.js'; u.search = '';
  const r = await env.ASSETS.fetch(new Request(u.toString()));
  if (!r.ok) return new Map();
  const src = await r.text();
  const CH = String.raw`('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")`;
  const lire = x => x.slice(1, -1).replace(/\\(.)/g, (_, c) => c === 'n' ? '\n' : c);
  const d = new Map();
  for (const m of src.matchAll(new RegExp('^\\s*' + CH + '\\s*:\\s*\\[\\s*' + CH + '\\s*,\\s*' + CH + '\\s*\\]', 'gm')))
    d.set(lire(m[1]), [lire(m[2]), lire(m[3])]);
  return (DICO = d);
}
async function accueilLangue(env, request, url) {
  const r = await statique(env, request, '/qrbc.html');
  const m = META_ACCUEIL[url.searchParams.get('lang')];
  if (!m || !r.ok) return r;
  const dico = await dictionnaire(env, request), i = m.lang === 'en' ? 0 : 1;
  // nœuds de texte traduits en entier (le texte peut arriver en plusieurs morceaux)
  let tampon = '';
  const traduction = {
    text(t) {
      tampon += t.text;
      if (!t.lastInTextNode) { t.remove(); return; }
      const brut = tampon; tampon = '';
      const cle = brut.trim(), v = cle && dico.get(cle);
      if (!v || !v[i]) { t.replace(brut, { html: true }); return; }
      const debut = brut.indexOf(cle);
      t.replace(brut.slice(0, debut) + esc(v[i]) + brut.slice(debut + cle.length), { html: true });
    }
  };
  const adresse = 'https://' + DOMAINE + '/?lang=' + m.lang;
  const attr = (a, v) => ({ element(e) { e.setAttribute(a, v); } });
  const h = new Headers(r.headers); h.delete('content-length'); h.set('content-language', m.lang);
  return new HTMLRewriter()
    .on('html', { element(e) { e.setAttribute('lang', m.lang); e.setAttribute('data-pretraduit', ''); } })
    .on('meta[name="description"]', attr('content', m.desc))
    .on('meta[property="og:title"]', attr('content', m.titre))
    .on('meta[property="og:description"]', attr('content', m.desc))
    .on('meta[property="og:locale"]', attr('content', m.locale))
    .on('meta[property="og:url"]', attr('content', adresse))
    .on('link[rel="canonical"]', attr('href', adresse))
    .onDocument(traduction)
    .transform(new Response(r.body, { status: r.status, headers: h }));
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
