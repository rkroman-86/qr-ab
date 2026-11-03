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
const MODELES_IA = ['claude-sonnet-5-5', 'claude-haiku-5-5'];
// Le serveur choisit le modèle selon le travail : rédaction soignée → Sonnet, pictogrammes SVG → Haiku (le moins coûteux)
const MODELE_PAR_TYPE = { texte: 'claude-sonnet-5-5', picto: 'claude-haiku-5-5' };
const DUREE_EXPRESS = 30 * 60 * 1000;          // une création express payée reste utilisable 30 min (reprise après une erreur)

/* ---------- Offre et IA ----------
   gratuit : illimité (comptes offerts, démos)
   essai   : 2 textes + 2 pictos pour toute la durée de l'essai
   payant  : 10 textes + 5 pictos par année d'abonnement, puis crédit prépayé */
// Tarifs et quotas : réglables dans /gestion (config:tarifs) ; valeurs par défaut ci-dessous
const TARIFS_DEFAUT = { prixAnnuel: 1800, prixTexte: 40, prixPicto: 70, prixFond: 70, prixExpress: 150,
  essai: { texte: 2, picto: 2, fond: 1 }, payant: { texte: 10, picto: 5, fond: 2 } };
const TYPES_IA = ['texte', 'picto', 'fond'];      // fond = une génération de 2 images de fond
const MODELE_IMAGE = '@cf/black-forest-labs/flux-2-klein-9b';
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

async function lireTarifs(env) {
  let t = {};
  try { t = JSON.parse(await env.CLIENTS.get('config:tarifs') || '{}'); } catch (e) {}
  const D = TARIFS_DEFAUT;
  return {
    prixAnnuel: t.prixAnnuel ?? D.prixAnnuel, prixTexte: t.prixTexte ?? D.prixTexte, prixPicto: t.prixPicto ?? D.prixPicto, prixFond: t.prixFond ?? D.prixFond,
    prixExpress: t.prixExpress ?? D.prixExpress,
    essai: Object.assign({}, D.essai, t.essai), payant: Object.assign({}, D.payant, t.payant)
  };
}
async function chargerTarifs(env) {
  const t = await lireTarifs(env);
  PRIX_ANNUEL = t.prixAnnuel;
  PRIX_IA = { texte: t.prixTexte, picto: t.prixPicto, fond: t.prixFond };
  PRIX_EXPRESS = t.prixExpress;
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
  async fetch(request, env) {
    try {
      await chargerTarifs(env);
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
  if (p === '/api/mdp-oublie' && request.method === 'POST') return mdpOublie(request, env);
  if (p === '/api/mdp-reinit' && request.method === 'POST') return mdpReinit(request, env);
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
      await ajouterMedias(env, slug, [{ chemin, genre: genreImage(chemin), source: /^images\/logo-/.test(chemin) ? 'logo' : 'photo', le: new Date().toISOString() }]);
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
    const mode = modeFacturation(compte, type, request.headers.get('x-qrbc-express') === '1');   // lève 402 si rien n'est disponible
    const jour = new Date().toISOString().slice(0, 10);
    await limiter(env, 'ia:' + slug + ':' + jour, IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    const corps = {
      model: MODELE_PAR_TYPE[type] || MODELES_IA[0],
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
    return json({ paye: session.payment_status === 'paid', etat, compte: await resumeAvecOffre(env, frais) });
  }

  /* ---------- Images de fond par l'IA ---------- */
  /* ---------- Médiathèque : toutes les images du client (IA, photos, logos) ---------- */
  if ((route === 'medias' || route === 'fonds') && m === 'GET') {
    const medias = await lireMedias(env, slug);
    return json(route === 'fonds' ? { fonds: medias.filter(x => x.genre === 'fond') } : { medias });
  }
  if ((route === 'medias' || route === 'fonds') && m === 'DELETE') {
    const { chemin } = await corpsJSON(request);
    let medias = await lireMedias(env, slug);
    if (!medias.some(x => x.chemin === chemin)) throw new ErreurAPI(404, 'Image introuvable.');
    medias = medias.filter(x => x.chemin !== chemin);
    await env.CLIENTS.put('site:' + slug + ':medias', JSON.stringify(medias));
    // le fichier n'est effacé que si la page publiée ne l'utilise pas
    const cfg = await env.CLIENTS.get('site:' + slug + ':config.json') || '';
    if (!cfg.includes(chemin)) await env.CLIENTS.delete('img:' + slug + ':' + chemin.slice(7));
    return json(route === 'fonds' ? { fonds: medias.filter(x => x.genre === 'fond') } : { medias });
  }
  if (route === 'fond' && m === 'POST') {
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.'
      : 'Abonnement inactif : l’IA est désactivée.', compte.plan === 'essai' ? 'essai_termine' : 'abonnement_inactif');
    if (!env.AI) throw new ErreurAPI(503, 'La création d’images n’est pas encore activée sur le serveur.');
    const mode = modeFacturation(compte, 'fond', request.headers.get('x-qrbc-express') === '1');
    const jour = new Date().toISOString().slice(0, 10);
    await limiter(env, 'ia:' + slug + ':' + jour, IA_PAR_JOUR, 86400 * 2, 'Limite quotidienne de l’IA atteinte. Réessayez demain.');
    const dd = await corpsJSON(request);
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
    const description = await descriptionFond(env, cfg, ambiance, idee);

    // 2 images en parallèle, graines différentes ; on garde celles qui réussissent
    const base = Date.now();
    const essais = await Promise.allSettled([1, 2].map(i => genererImage(env, description, (base + i * 7919) % 2147483647)));
    const nouvelles = [];
    for (let i = 0; i < essais.length; i++) {
      if (essais[i].status !== 'fulfilled') { console.error('image', essais[i].reason && essais[i].reason.message); continue; }
      const octets = essais[i].value;
      const type = typeImage(octets);
      if (!type) continue;
      const chemin = 'images/fond-ia-' + base + '-' + (i + 1) + (type === 'image/png' ? '.png' : type === 'image/webp' ? '.webp' : '.jpg');
      await env.CLIENTS.put('img:' + slug + ':' + chemin.slice(7), octets, { metadata: { type } });
      nouvelles.push({ chemin, genre: 'fond', source: 'ia', le: new Date().toISOString(), ambiance, idee });
    }
    if (!nouvelles.length) throw new ErreurAPI(502, 'La création d’images a échoué. Réessayez dans un instant (rien n’a été décompté).');

    const medias = await ajouterMedias(env, slug, nouvelles);
    const fonds = medias.filter(x => x.genre === 'fond');

    const frais = (await lireCompte(env, slug)) || compte;
    facturer(frais, 'fond', mode);
    await ecrireCompte(env, frais);
    return json({ nouvelles, fonds, medias, compte: await resumeAvecOffre(env, frais) });
  }

  /* ---------- Création express : réserve d'un coup les créations IA (5 pancartes, 3 pictos, 2 images) ----------
     offert : gratuit · essai : la moitié des créations gratuites de l'essai · abonné : PRIX_EXPRESS sur le crédit IA.
     Les 3 étapes suivent (ia texte, ia picto, fond) avec l'en-tête x-qrbc-express : elles ne sont plus décomptées. */
  if (route === 'express' && m === 'POST') {
    if (!actif(compte)) throw new ErreurAPI(402, compte.plan === 'essai'
      ? 'Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.'
      : 'Abonnement inactif : l’IA est désactivée.', compte.plan === 'essai' ? 'essai_termine' : 'abonnement_inactif');
    if (!env.ANTHROPIC_KEY) throw new ErreurAPI(503, 'La rédaction IA n’est pas encore activée sur le serveur.');
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
    const restant = compte.plan === 'essai'
      ? { texte: cout.essai.texte ? 1 : 0, picto: cout.essai.picto ? 1 : 0, fond: cout.essai.fond && env.AI ? 1 : 0 }
      : { texte: 1, picto: 1, fond: env.AI ? 1 : 0 };
    compte.express = { jusqua: new Date(Date.now() + DUREE_EXPRESS).toISOString(), restant };
    await ecrireCompte(env, compte);
    return json({ express: compte.express, compte: await resumeAvecOffre(env, compte) });
  }

  if (route === 'demande' && m === 'POST') {
    const dd = await corpsJSON(request);
    const genre = dd.genre === 'recharge' ? 'recharge' : 'abonnement';
    const montant = genre === 'recharge' ? Math.round(Number(dd.montant) * 100) : prixRenouvellement(compte).aPayer;
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
  const cfg = await env.CLIENTS.get('site:' + slug + ':config.json') || '';
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
async function descriptionFond(env, cfg, ambiance, idee) {
  const style = AMBIANCES_FOND[ambiance];
  const activite = [cfg.titre, cfg.sousTitre, cfg.home && cfg.home.ia && cfg.home.ia.description, cfg.home && cfg.home.ia && cfg.home.ia.zone].filter(Boolean).join(' — ');
  const secours = (idee || activite || 'a welcoming local business') + '. ' + style + '. Vertical background image, no text, no letters, no logos, no watermark.';
  if (!env.ANTHROPIC_KEY) return secours;
  try {
    const r = await fetch(env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODELES_IA[0], max_tokens: 300,
        system: 'You write prompts for an image generation model. Output ONLY the prompt, in English, 40 to 80 words, no quotes. ' +
          'The image is a vertical (9:16) background for a small business mobile page, composed freely (any framing). ' +
          'Describe a concrete scene evoking the business (place, objects, atmosphere), ' +
          'never a close-up portrait of a person. Forbid any text: always end with "no text, no letters, no logos, no watermark".',
        messages: [{ role: 'user', content: 'Business: ' + (activite || '(not specified)') + '\nStyle: ' + style + (idee ? '\nClient idea: ' + idee : '') }]
      })
    });
    if (!r.ok) return secours;
    const j = await r.json();
    const texte = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join(' ').trim();
    return texte.length > 20 ? texte.slice(0, 1200) : secours;
  } catch (e) { return secours; }
}
/* FLUX.2 klein 9B sur Workers AI : entrée multipart, sortie image en base64 */
async function genererImage(env, prompt, graine) {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('width', String(FOND_L));
  form.append('height', String(FOND_H));
  form.append('seed', String(graine));
  const corps = new Response(form);                // FormData n'expose pas sa frontière : on la récupère ainsi
  const r = await env.AI.run(MODELE_IMAGE, { multipart: { body: corps.body, contentType: corps.headers.get('content-type') } });
  if (!r || !r.image) throw new Error('réponse sans image');
  return deb64(r.image);
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
    slug: o.slug, email: String(o.email || '').trim().toLowerCase(), plan: o.plan, version: 1, cree: new Date(maintenant).toISOString(),
    finEssai: o.plan === 'essai' ? new Date(maintenant + JOURS_ESSAI * 86400000).toISOString() : null,
    payeJusqua: null, note: o.note || ''
  }, await hacherMdp(o.mdp));
  await ecrireCompte(env, compte);
  await indexerEmail(env, compte.email, o.slug, true);
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
      for (const k of l.keys) {
        const c = await lireCompte(env, k.name.slice(7));
        if (!c) continue;
        let titre = '';
        try { titre = (JSON.parse(await env.CLIENTS.get('site:' + c.slug + ':config.json') || '{}').titre) || ''; } catch (e) {}
        comptes.push(Object.assign(resumeCompte(c), { paiements: c.paiements || [], titre, depenseIA: (c.ia && c.ia.depense) || 0 }));
      }
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
    const ancien = await lireCompte(env, slug);
    if (ancien) await indexerEmail(env, ancien.email, slug, false);
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
  else if (!erreurSlug(saisie)) slugs = [saisie];

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
  await ecrireCompte(env, compte);
  const session = await signerSession(env, { s: compte.slug, v: compte.version, e: Math.floor(Date.now() / 1000) + 30 * 86400 });
  return json({ ok: true, slug: compte.slug, jeton: session });
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
  if (!r.ok) throw new ErreurAPI(400, 'Resend refuse cette clé : ' + ((j && j.message) || r.status));
  const d = ((j && j.data) || []).find(x => String(x.name).toLowerCase() === domaine);
  if (!d) throw new ErreurAPI(400, 'Le domaine ' + domaine + ' n’est pas ajouté dans Resend (Domains → Add domain).');
  await env.CLIENTS.put('config:email', JSON.stringify({
    expediteur, domaine, statutDomaine: d.status, fin: cle.slice(-4), le: new Date().toISOString(), cle: await chiffrer(env, cle)
  }));
}
async function envoyerEmail(env, conf, a, sujet, html, texteBrut) {
  const r = await fetch((env.RESEND_API || RESEND_API) + '/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + conf.cle, 'content-type': 'application/json' },
    body: JSON.stringify({ from: conf.expediteur, to: [a], subject: sujet, html, text: texteBrut })
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new ErreurAPI(502, 'Envoi impossible : ' + ((j && j.message) || r.status));
  }
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
      texte: { utilises: ia.texte || 0, inclus: q ? Math.max(0, q.texte + ((ia.bonus && ia.bonus.texte) || 0)) : null },
      picto: { utilises: ia.picto || 0, inclus: q ? Math.max(0, q.picto + ((ia.bonus && ia.bonus.picto) || 0)) : null },
      fond: { utilises: ia.fond || 0, inclus: q ? Math.max(0, (q.fond || 0) + ((ia.bonus && ia.bonus.fond) || 0)) : null },
      credit: c.credit || 0,                       // centimes
      prix: PRIX_IA,
      express: Object.assign({ prix: PRIX_EXPRESS, enCours: expressEnCours(c) ? c.express : null }, coutExpress(c))
    },
    offre: { prixAnnuel: PRIX_ANNUEL, rechargeMin: RECHARGE_MIN, quotasPayant: QUOTAS_IA.payant, tva: TVA, renouvelerAvant: RENOUVELER_AVANT },
    renouvellement: prixRenouvellement(c),
    demande: c.demande || null
  };
}

/* Inclus dans le quota, débité du crédit, ou refus avec l'offre adaptée */
function modeFacturation(c, type, express) {
  if (express && expressEnCours(c) && c.express.restant[type] > 0) return 'express';
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
    if (c.express && c.express.restant) c.express.restant[type] = Math.max(0, (c.express.restant[type] || 0) - 1);
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
