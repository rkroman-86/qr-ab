/* =====================================================================
   Site principal qrbc.app construit dans qrbc.app/constructeur
   - brouillon (principal:brouillon) et version publiée (principal:publie), en KV
   - principal:actif = '1' : le site construit remplace l'accueil historique (qrbc.html)
   - pages : articles (sections), galerie (photos avec lien), blog (une adresse par article), contact (page d'un site client)
   - rendu par le Worker (HTML complet, lisible par Google sans JavaScript), mise en page large sur ordinateur
   - langues fr / en / ru : traduction IA par page (traductions[lang][idPage] = { page, source }), retouchable
   ===================================================================== */

const CLES = { brouillon: 'principal:brouillon', publie: 'principal:publie', actif: 'principal:actif' };
const PREFIXE_MEDIA = 'principal:media:';
export const LANGUES_SITE = ['fr', 'en', 'ru'];          // langues par défaut d'un nouveau site
// langues qu'on peut ajouter au site (bouton « + » du constructeur) ; fr = langue de base
export const LANGUES_DISPO = { en: 'English', ru: 'Русский', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português', nl: 'Nederlands',
  uk: 'Українська', pl: 'Polski', ro: 'Română', tr: 'Türkçe', zh: '中文', ja: '日本語' };
const LANGUES_TOUTES = ['fr'].concat(Object.keys(LANGUES_DISPO));
export const languesDe = cfg => ['fr'].concat(cfg && Array.isArray(cfg.langues) ? cfg.langues : ['en', 'ru']);
const PREFIXE_FIXES = 'principal:fixes:';                 // textes fixes (en-tête, formulaire, pied) traduits pour une langue ajoutée
const TYPES = ['articles', 'galerie', 'blog', 'contact'];
const GENRES = ['accroche', 'texte', 'cartes', 'etiquettes', 'faq', 'inscription', 'bouton', 'image', 'code'];
const MAX_CODE = 200000;   // section « Code HTML » : par langue
// adresses déjà prises sur qrbc.app : une page du site ne peut pas les utiliser
const RESERVES = new Set(['app', 'gestion', 'api', 'cgv', 'mentions-legales', 'generateur-qr', 'qr-code-gratuit', 'constructeur',
  'media', 'videos', 'images', 'impression', 'sitemap', 'robots', 'index', 'favicon', 'sw', 'manifest', 'commun', 'i18n', 'qrcode', 'inscription',
  'admin', 'icon-192', 'icon-512', 'apple-touch-icon', 'og-qrbc', 'www', 'qrbc']);
const MAX = { pages: 40, sections: 200, items: 60, photos: 300, articles: 500, texte: 20000, court: 300 };

/* ---------------- Outils ---------------- */
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ch = (v, n) => String(v == null ? '' : v).slice(0, n || MAX.court);
export function slugifier(t) {
  return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’]/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
const id6 = () => Math.random().toString(36).slice(2, 8);
// empreinte des textes à traduire d'une page (même calcul dans le constructeur : textes « à retraduire » si elle change)
export function empreinte(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
// clés dont la valeur (texte) se traduit ; tout le reste (images, liens, adresses…) est recopié tel quel
const CLES_TEXTE = new Set(['titre', 'texte', 'note', 'legende', 'alt', 'intro', 'description', 'nomMenu', 'sousTitre', 'libActivite', 'exemple', 'libEmail', 'libPromo', 'cgu', 'lienCgv', 'btn']);
const CLES_IGNOREES = new Set(['id', 'type', 'genre', 'chemin', 'src', 'mini', 'image', 'lien', 'slug', 'date', 'source', 'position', 'masque', 'menu', 'avecInscription', 'actif', 'fichiers', 'l', 'h']);
export function textesPage(page) {
  const out = {};
  const parcourir = (o, chemin) => {
    if (Array.isArray(o)) { o.forEach((x, i) => parcourir(x, chemin + i + '.')); return; }
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (CLES_IGNOREES.has(k)) continue;
      if (typeof v === 'string') { if (CLES_TEXTE.has(k) && v.trim()) out[chemin + k] = v; }
      else parcourir(v, chemin + k + '.');
    }
  };
  parcourir(page, '');
  return out;
}
/* Blog : la traduction d'un article suit son identifiant (pas sa place) — un article ajouté en tête ne décale plus les traductions.
   Article pas encore traduit : texte français. */
export function alignerArticles(page, tpage) {
  if (!page || page.type !== 'blog' || !tpage || typeof tpage !== 'object') return tpage;
  const anciens = Array.isArray(tpage.articles) ? tpage.articles : [];
  return Object.assign({}, tpage, { articles: (page.articles || []).map(a => {
    const x = anciens.find(y => y && y.id === a.id);
    return x ? x : JSON.parse(JSON.stringify(a));
  }) });
}
// empreintes d'une page de blog : textes hors articles, puis chaque article (par identifiant)
export function empreintesBlog(page) {
  const t = textesPage(page), hors = {};
  for (const k of Object.keys(t)) if (!/^articles\./.test(k)) hors[k] = t[k];
  const art = {};
  (page.articles || []).forEach(a => { if (a && a.id) art[a.id] = empreinte(JSON.stringify(textesPage(a))); });
  return { hors: empreinte(JSON.stringify(hors)), art };
}
function appliquerTextes(page, textes) {
  const copie = JSON.parse(JSON.stringify(page));
  for (const [cle, v] of Object.entries(textes)) {
    const p = cle.split('.');
    let o = copie;
    for (let i = 0; i < p.length - 1; i++) o = o && o[/^\d+$/.test(p[i]) ? Number(p[i]) : p[i]];
    if (o && typeof o === 'object' && typeof v === 'string') o[p[p.length - 1]] = v;
  }
  return copie;
}

/* ---------------- Validation de la configuration ---------------- */
function nettoyerLien(l) {
  l = ch(l, 500).trim();
  if (!l) return '';
  if (/^(page|article):[a-z0-9_-]+$/.test(l) || /^#[a-z0-9_-]+$/i.test(l)) return l;
  if (/^(https?:\/\/|mailto:|tel:)[^\s"<>]+$/i.test(l)) return l;
  if (/^\/[a-z0-9/_.?=&%-]*$/i.test(l)) return l;                                // adresse du site (ex. /generateur-qr-code)
  return '';
}
const media = v => { v = ch(v, 300); return /^\/media\/[a-z0-9._-]+$/i.test(v) || /^\/[a-z0-9/_.-]+\.(png|jpe?g|webp|svg|mp4)$/i.test(v) ? v : ''; };
function nettoyerItems(l) {
  return (Array.isArray(l) ? l : []).slice(0, MAX.items).map(x => ({ titre: ch(x && x.titre, 500), texte: ch(x && x.texte, 4000) }));
}
function nettoyerSection(s) {
  s = s && typeof s === 'object' ? s : {};
  return {
    id: /^[a-z0-9]{3,12}$/.test(s.id || '') ? s.id : id6(),
    genre: GENRES.includes(s.genre) ? s.genre : 'texte',
    masque: !!s.masque,
    titre: ch(s.titre, 500), texte: ch(s.texte, MAX.texte), note: ch(s.note, 1000),
    image: media(s.image), alt: ch(s.alt), position: ['droite', 'gauche', 'dessus'].includes(s.position) ? s.position : 'droite',
    bouton: { texte: ch(s.bouton && s.bouton.texte, 120), lien: nettoyerLien(s.bouton && s.bouton.lien) },
    items: nettoyerItems(s.items),
    encart: { titre: ch(s.encart && s.encart.titre, 300), texte: ch(s.encart && s.encart.texte, 1000), image: media(s.encart && s.encart.image) },
    avecInscription: !!s.avecInscription,
    // Code HTML libre (Roman seul y a accès) : une version par langue, le français sert par défaut
    code: s.genre === 'code' ? LANGUES_TOUTES.reduce((o, l) => { o[l] = typeof (s.code && s.code[l]) === 'string' ? s.code[l].slice(0, MAX_CODE) : ''; return o; }, {}) : undefined
  };
}
/* Pied de page commun à toutes les pages (la ligne CGV / mentions légales / support reste fixe) */
export const RESEAUX_PIED = {
  facebook: ['Facebook', '#1877F2'], instagram: ['Instagram', '#E4405F'], youtube: ['YouTube', '#FF0000'], tiktok: ['TikTok', '#000000'],
  linkedin: ['LinkedIn', '#0A66C2'], x: ['X', '#000000'], threads: ['Threads', '#000000'], pinterest: ['Pinterest', '#BD081C'],
  snapchat: ['Snapchat', '#FFFC00'], telegram: ['Telegram', '#26A5E4'], whatsapp: ['WhatsApp', '#25D366'], site: ['Site web', '#4B5563']
};
const PIED_DEFAUT = {
  note: 'Après l’essai : 1,99 € TTC par mois sans engagement, ou 19,99 € TTC par an.',
  texte: 'qrbc.app — sites web mobiles et cartes de visite QR',
  reseaux: [{ type: 'facebook', lien: 'https://www.facebook.com/61596401707316', titre: 'Suivez-nous sur Facebook' }],
  liens: [{ titre: 'Générateur de QR code gratuit', lien: '/generateur-qr-code' }]
};
/* En-tête du site : figé en haut (non par défaut), logo (image chargée ou texte qrbc), ordre logo / langue / menu */
const ORDRE_ENTETE = ['logo', 'langue', 'menu'];
function entete_(cfg) {
  const x = (cfg && cfg.entete) || {};
  const l = x.logo || {};
  const ordre = Array.isArray(x.ordre) ? x.ordre.filter(k => ORDRE_ENTETE.includes(k)) : [];
  return {
    fige: !!x.fige,
    ordre: [...new Set(ordre.concat(ORDRE_ENTETE))],
    logo: { image: media(l.image), taille: ['s', 'm', 'l'].includes(l.taille) ? l.taille : 'm', texte: !!l.texte, alt: ch(l.alt, 80) }
  };
}
/* Formulaire d'inscription (commun à tout le site) : textes modifiables ; valeurs par défaut = textes historiques de qrbc.html,
   traduits automatiquement (dictionnaire i18n.js / textes fixes) tant qu'ils ne sont pas changés */
export const FORM_DEFAUT = {
  titre: 'Votre site en 5 minutes',
  sousTitre: '1 mois gratuit sans carte bancaire, puis 1,99 € TTC/mois sans engagement, ou 19,99 € TTC/an.',
  libActivite: 'Nom de l’entreprise ou activité (facultatif)',
  exemple: 'Ex. Plomberie Martin, Nice',
  libEmail: 'Votre e-mail',
  libPromo: 'J’ai un code promo',
  cgu: 'J’accepte les conditions d’utilisation du service.',
  lienCgv: 'Lire les CGV',
  btn: 'Recevoir mon lien',
  note: 'Vous recevez un lien pour choisir l’adresse de votre site et votre mot de passe.'
};
function nettoyerFormulaire(x) {
  x = x && typeof x === 'object' ? x : {};
  const r = { id: 'formulaire', type: 'formulaire' };
  for (const k of Object.keys(FORM_DEFAUT)) { const v = ch(x[k], k === 'sousTitre' || k === 'note' ? 400 : 120); r[k] = v || FORM_DEFAUT[k]; }
  return r;
}
function formulaireHtml(cfg, ctx) {
  const fr = cfg.formulaire || nettoyerFormulaire(null);
  const t = ctx.lang !== 'fr' && cfg.traductions && cfg.traductions[ctx.lang] && cfg.traductions[ctx.lang].formulaire;
  const v = t && t.page ? t.page : fr;      // sans traduction : texte français (le texte d'origine reste traduit par le dictionnaire)
  let h = ctx.g.formulaire;
  for (const k of Object.keys(FORM_DEFAUT)) {
    if (v[k] === FORM_DEFAUT[k]) continue;
    const d = esc(FORM_DEFAUT[k]), n = esc(v[k]);
    h = k === 'exemple' ? h.split('placeholder="' + d + '"').join('placeholder="' + n + '"') : h.split('>' + FORM_DEFAUT[k] + '<').join('>' + n + '<').split('>' + d + '<').join('>' + n + '<');
  }
  // ligne des prix personnalisée (ou langue sans phrase toute faite) : le script ne la remplace plus selon le code promo
  if (v.sousTitre !== FORM_DEFAUT.sousTitre || !['fr', 'en', 'ru'].includes(ctx.lang)) h = h.replace('id="essai-sous"', 'id="essai-sous" data-perso');
  return h;
}
function nettoyerPied(x) {
  x = x && typeof x === 'object' ? x : PIED_DEFAUT;
  return {
    id: 'pied', type: 'pied', note: ch(x.note, 400), texte: ch(x.texte, 1000),
    reseaux: (Array.isArray(x.reseaux) ? x.reseaux : []).slice(0, 15).map(r => ({ type: RESEAUX_PIED[r && r.type] ? r.type : 'site', lien: nettoyerLien(r && r.lien), titre: ch(r && r.titre, 80) })).filter(r => r.lien),
    liens: (Array.isArray(x.liens) ? x.liens : []).slice(0, 15).map(l => ({ titre: ch(l && l.titre, 80), lien: nettoyerLien(l && l.lien) })).filter(l => l.titre && l.lien)
  };
}
function nettoyerPage(p, deja) {
  p = p && typeof p === 'object' ? p : {};
  const type = TYPES.includes(p.type) ? p.type : 'articles';
  const r = {
    id: /^[a-z0-9]{3,12}$/.test(p.id || '') && !deja.ids.has(p.id) ? p.id : id6(),
    type, titre: ch(p.titre, 120) || 'Page', nomMenu: ch(p.nomMenu, 60), menu: p.menu !== false,
    chemin: '', seo: { titre: ch(p.seo && p.seo.titre, 120), description: ch(p.seo && p.seo.description, 300) }
  };
  deja.ids.add(r.id);
  let c = p.chemin === '' && !deja.accueil ? '' : slugifier(p.chemin || p.titre) || r.id;
  if (c !== '') { if (RESERVES.has(c) || deja.chemins.has(c)) c = c + '-' + r.id.slice(0, 3); }
  else deja.accueil = true;
  r.chemin = c; deja.chemins.add(c);
  if (type === 'articles') {
    r.video = { actif: !!(p.video && p.video.actif), src: {} };
    for (const l of LANGUES_TOUTES) { const v = media(p.video && p.video.src && p.video.src[l]); if (v) r.video.src[l] = v; }
    r.sections = (Array.isArray(p.sections) ? p.sections : []).slice(0, MAX.sections).map(nettoyerSection);
  } else if (type === 'galerie') {
    r.intro = ch(p.intro, 4000);
    r.photos = (Array.isArray(p.photos) ? p.photos : []).slice(0, MAX.photos).map(x => ({ src: media(x && x.src), mini: media(x && x.mini), legende: ch(x && x.legende, 300), lien: nettoyerLien(x && x.lien), l: Number(x && x.l) || 0, h: Number(x && x.h) || 0 })).filter(x => x.src);
  } else if (type === 'blog') {
    r.intro = ch(p.intro, 4000);
    const slugs = new Set();
    r.articles = (Array.isArray(p.articles) ? p.articles : []).slice(0, MAX.articles).map(a => {
      a = a || {};
      let s = slugifier(a.slug || a.titre) || id6();
      while (slugs.has(s)) s += '-' + id6().slice(0, 2);
      slugs.add(s);
      return { id: /^[a-z0-9]{3,12}$/.test(a.id || '') ? a.id : id6(), slug: s, titre: ch(a.titre, 200), date: /^\d{4}-\d{2}-\d{2}$/.test(a.date || '') ? a.date : new Date().toISOString().slice(0, 10),
        image: media(a.image), mini: media(a.mini), texte: ch(a.texte, MAX.texte), description: ch(a.description, 300), masque: !!a.masque };
    });
  } else if (type === 'contact') {
    r.source = /^[a-z0-9-]{2,40}$/.test(p.source || '') ? p.source : '';
    r.intro = ch(p.intro, 2000);
  }
  return r;
}
export function nettoyerConfig(cfg) {
  cfg = cfg && typeof cfg === 'object' ? cfg : {};
  const deja = { ids: new Set(), chemins: new Set(), accueil: false };
  let pages = (Array.isArray(cfg.pages) ? cfg.pages : []).slice(0, MAX.pages);
  // l'accueil (chemin vide) en premier traité, pour qu'il garde son adresse
  const iA = pages.findIndex(p => p && p.chemin === '');
  const ordre = pages.map((p, i) => i);
  if (iA > 0) { ordre.splice(iA, 1); ordre.unshift(iA); }
  const nettoyees = [];
  ordre.forEach(i => { nettoyees[i] = nettoyerPage(pages[i], deja); });
  pages = nettoyees.filter(Boolean);
  if (!pages.length) pages = [nettoyerPage({ type: 'articles', titre: 'Accueil', chemin: '', sections: [] }, { ids: new Set(), chemins: new Set(), accueil: false })];
  if (!pages.some(p => p.chemin === '')) pages[0].chemin = '';
  const pied = nettoyerPied(cfg.pied);
  const formulaire = nettoyerFormulaire(cfg.formulaire);
  const langues = Array.isArray(cfg.langues) ? [...new Set(cfg.langues.filter(l => LANGUES_DISPO[l]))] : ['en', 'ru'];
  const trad = {};
  for (const l of langues) {
    trad[l] = {};
    const src = (cfg.traductions && cfg.traductions[l]) || {};
    for (const p of pages) {
      const t = src[p.id];
      if (!t || !t.page) continue;
      // la traduction garde la structure de la page française (mêmes ids, images, liens) ; seuls les textes viennent de la traduction
      const tpage = alignerArticles(p, t.page);
      trad[l][p.id] = { page: appliquerTextes(p, textesPage(nettoyerPage(Object.assign({}, tpage, { id: p.id, type: p.type, chemin: p.chemin }), { ids: new Set(), chemins: new Set(), accueil: true }))), source: ch(t.source, 20), le: ch(t.le, 30) };
      if (p.type === 'blog') {                     // traduction article par article : empreinte de chaque article traduit
        if (t.art && typeof t.art === 'object') {   // absent : ancienne traduction (page entière), état déduit par le constructeur
          const art = {};
          for (const a of p.articles || []) if (typeof t.art[a.id] === 'string') art[a.id] = ch(t.art[a.id], 20);
          trad[l][p.id].art = art;
        }
        if (typeof t.hors === 'string') trad[l][p.id].hors = ch(t.hors, 20);
      }
    }
    const tp = src.pied;
    if (tp && tp.page) trad[l].pied = { page: appliquerTextes(pied, textesPage(nettoyerPied(tp.page))), source: ch(tp.source, 20), le: ch(tp.le, 30) };
    const tf = src.formulaire;
    if (tf && tf.page) trad[l].formulaire = { page: appliquerTextes(formulaire, textesPage(nettoyerFormulaire(tf.page))), source: ch(tf.source, 20), le: ch(tf.le, 30) };
  }
  return { v: 1, pages, pied, formulaire, entete: entete_(cfg), langues, traductions: trad, maj: new Date().toISOString() };
}

/* ---------------- Lecture ---------------- */
async function lire(env, quoi) {
  const t = await env.CLIENTS.get(CLES[quoi]);
  try { return t ? JSON.parse(t) : null; } catch (e) { return null; }
}
let CACHE_ACTIF = null;                                     // relu au plus toutes les 30 s par instance
export async function siteActif(env) {
  if (CACHE_ACTIF && CACHE_ACTIF.t > Date.now()) return CACHE_ACTIF.v;
  const v = (await env.CLIENTS.get(CLES.actif)) === '1';
  CACHE_ACTIF = { t: Date.now() + 30000, v };
  return v;
}
let CACHE_PUBLIE = null;                                    // { maj, cfg } : relu au plus toutes les 30 s par instance
async function publie(env) {
  if (CACHE_PUBLIE && CACHE_PUBLIE.t > Date.now()) return CACHE_PUBLIE.cfg;
  const cfg = await lire(env, 'publie');
  CACHE_PUBLIE = { t: Date.now() + 30000, cfg };
  return cfg;
}

/* ---------------- Gabarit (styles, en-tête, pied et scripts de l'accueil historique) ---------------- */
let GABARIT = null;
async function gabarit(env, request) {
  if (GABARIT) return GABARIT;
  const u = new URL(request.url); u.pathname = '/qrbc.html'; u.search = '';
  const r = await env.ASSETS.fetch(new Request(u.toString()));
  const h = await r.text();
  const entre = (a, b, depuis) => { const i = h.indexOf(a, depuis || 0); if (i < 0) return ''; const j = h.indexOf(b, i + a.length); return j < 0 ? '' : h.slice(i, j + b.length); };
  GABARIT = {
    style: entre('<style>', '</style>'),
    jsonld: entre('<script type="application/ld+json">', '</script>'),
    entete: entre('<header>', '</header>'),
    video: entre('<div class="video-promo"', '</div>'),
    formulaire: entre('<div id="bloc-inscription">', '<div class="attente-mail" id="attente" hidden></div>\n    </div>'),
    pied: entre('<footer>', '</footer>'),
    scripts: h.slice(h.indexOf('<script src="/i18n.js"></script>'), h.lastIndexOf('</body>'))
  };
  return GABARIT;
}

/* ---------------- Rendu ---------------- */
function pageEnLangue(cfg, page, lang) {
  if (lang === 'fr') return page;
  const t = cfg.traductions && cfg.traductions[lang] && cfg.traductions[lang][page.id];
  return t && t.page ? t.page : page;
}
function adresse(page, lang, slug) {
  const base = '/' + (page.chemin ? page.chemin + (slug ? '/' + slug : '') : '');
  return base + (lang && lang !== 'fr' ? '?lang=' + lang : '');
}
// la page contient-elle le formulaire d'inscription (accroche avec formulaire ou section « Formulaire ») ?
const aFormulaire = p => p && p.type === 'articles' && (p.sections || []).some(s => !s.masque && ((s.genre === 'accroche' && s.avecInscription) || s.genre === 'inscription'));
function cibleLien(c, ctx) {
  if (!c) return '';
  // « Formulaire d'inscription » depuis une page qui ne l'a pas : vers la page qui l'a (l'accueil d'habitude)
  if (c === '#inscription' && ctx.page && !aFormulaire(ctx.page)) {
    const p = ctx.cfg.pages.find(x => x.chemin === '' && aFormulaire(x)) || ctx.cfg.pages.find(aFormulaire);
    return p ? adresse(p, ctx.lang) + '#inscription' : '/app' + (ctx.lang !== 'fr' ? '?lang=' + ctx.lang : '');
  }
  if (/^page:/.test(c)) { const p = ctx.cfg.pages.find(x => x.id === c.slice(5)); return p ? adresse(p, ctx.lang) : ''; }
  if (/^article:/.test(c)) {
    const id = c.slice(8);
    for (const p of ctx.cfg.pages) if (p.type === 'blog') { const a = (p.articles || []).find(x => x.id === id && !x.masque); if (a) return adresse(p, ctx.lang, a.slug); }
    return '';
  }
  if (/^\/[^/]/.test(c) && ctx.lang !== 'fr' && !/[?&]lang=/.test(c)) return c + (c.includes('?') ? '&' : '?') + 'lang=' + ctx.lang;
  return c;
}
function attrsLien(href) { return /^https?:/i.test(href) && !/^https?:\/\/(www\.)?qrbc\.app(\/|$)/i.test(href) ? ' target="_blank" rel="noopener"' : ''; }
// *mots* = mots en couleur d'accent ; [mots](cible) = lien ; lignes vides = paragraphes
const RE_LIEN = /\[([^\[\]\n]{1,200})\]\(((?:page|article):[a-z0-9_-]+|#[a-z0-9_-]+|\/[^\s)]*|https?:\/\/[^\s)]+|mailto:[^\s)]+|tel:[^\s)]+)\)/gi;
function enLigne(t, ctx) {
  let out = '', i = 0, m;
  const s = String(t || ''), re = new RegExp(RE_LIEN.source, 'gi');
  const accent = x => esc(x).replace(/\*([^*\n]{1,200})\*/g, '<em>$1</em>');
  while ((m = re.exec(s))) {
    out += accent(s.slice(i, m.index));
    const href = cibleLien(m[2], ctx);
    out += href ? '<a href="' + esc(href) + '"' + attrsLien(href) + '>' + accent(m[1]) + '</a>' : accent(m[1]);
    i = m.index + m[0].length;
  }
  return out + accent(s.slice(i));
}
function paragraphes(t, ctx, cls) {
  return String(t || '').split(/\n\s*\n/).map(x => x.trim()).filter(Boolean)
    .map(x => '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + enLigne(x, ctx).replace(/\n/g, '<br>') + '</p>').join('');
}
const sansMarques = t => String(t || '').replace(new RegExp(RE_LIEN.source, 'gi'), '$1').replace(/\*([^*\n]+)\*/g, '$1');
function bouton(b, ctx, cls) {
  if (!b || !b.texte) return '';
  const href = cibleLien(b.lien || '#inscription', ctx) || '#inscription';
  return '<a class="' + (cls || 'cta') + '" href="' + esc(href) + '"' + attrsLien(href) + '>' + esc(b.texte) + '</a>';
}
function image(src, alt, cls, paresseux) {
  return src ? '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(src) + '" alt="' + esc(alt || '') + '"' + (paresseux ? ' loading="lazy"' : '') + ' decoding="async">' : '';
}
function section(s, ctx) {
  const h2 = s.titre ? '<h2>' + enLigne(s.titre, ctx) + '</h2>' : '';
  const id = ' id="s-' + esc(s.id) + '"';
  switch (s.genre) {
    case 'accroche': {
      const gauche = '<section>' +
        (s.titre ? '<h1>' + enLigne(s.titre, ctx) + '</h1>' : '') +
        (s.bouton && s.bouton.texte ? '<p class="cta-haut">' + bouton(s.bouton, ctx) + '</p>' : '') +
        (s.texte ? paragraphes(s.texte, ctx, 'chapeau') : '') +
        (s.note ? '<p class="sigle-txt">' + enLigne(s.note, ctx) + '</p>' : '') +
        (s.items.length ? '<ul class="points">' + s.items.map((x, i) => '<li><div class="num">' + (i + 1) + '</div><div><b>' + enLigne(x.titre, ctx) + '</b><span>' + enLigne(x.texte, ctx) + '</span></div></li>').join('') + '</ul>' : '') +
        (s.encart && (s.encart.titre || s.encart.texte) ? '<div class="appli">' + image(s.encart.image || '/icon-192.png', '', '', false) + '<p><b>' + enLigne(s.encart.titre, ctx) + '</b> ' + enLigne(s.encart.texte, ctx) + '</p></div>' : '') +
        '</section>';
      if (s.avecInscription && !ctx.formulaireMis) { ctx.formulaireMis = true; return '<div class="grille"' + id + '>' + gauche + formulaireHtml(ctx.cfg, ctx) + '</div>'; }
      return '<div class="grille grille-seule"' + id + '>' + gauche + '</div>';
    }
    case 'inscription':
      if (ctx.formulaireMis) return '';
      ctx.formulaireMis = true;
      return '<section class="bloc-inscription-seul"' + id + '>' + h2 + (s.texte ? paragraphes(s.texte, ctx, 'intro') : '') + formulaireHtml(ctx.cfg, ctx) + '</section>';
    case 'cartes':
      return '<section' + id + '>' + h2 + (s.texte ? paragraphes(s.texte, ctx, 'intro') : '') + '<div class="atouts">' +
        s.items.map(x => '<article><h3>' + enLigne(x.titre, ctx) + '</h3>' + paragraphes(x.texte, ctx) + '</article>').join('') + '</div>' +
        (s.bouton.texte ? '<p class="s-bouton">' + bouton(s.bouton, ctx) + '</p>' : '') + '</section>';
    case 'etiquettes':
      return '<section' + id + '>' + h2 + (s.texte ? paragraphes(s.texte, ctx, 'intro') : '') + '<ul class="metiers">' + s.items.map(x => '<li>' + enLigne(x.titre, ctx) + '</li>').join('') + '</ul></section>';
    case 'faq':
      return '<section class="faq"' + id + '>' + h2 + s.items.map(x => '<details><summary>' + enLigne(x.titre, ctx) + '</summary>' + paragraphes(x.texte, ctx) + '</details>').join('') + '</section>';
    case 'code': {
      const c = s.code || {};
      const html = (c[ctx.lang] && c[ctx.lang].trim()) ? c[ctx.lang] : (c.fr || '');
      return html.trim() ? '<div class="s-code"' + id + ' data-no-i18n>' + html + '</div>' : '';
    }
    case 'bouton':
      return '<p class="s-bouton"' + id + '>' + bouton(s.bouton, ctx) + '</p>';
    case 'image':
      return s.image ? '<figure class="s-image"' + id + '>' + image(s.image, s.alt, '', true) + (s.texte ? '<figcaption>' + enLigne(s.texte, ctx) + '</figcaption>' : '') + '</figure>' : '';
    default: {                                                // texte (+ image facultative)
      const corps = h2 + paragraphes(s.texte, ctx) + (s.bouton.texte ? '<p class="s-bouton">' + bouton(s.bouton, ctx) + '</p>' : '');
      if (!s.image) return '<section class="s-texte"' + id + '>' + corps + '</section>';
      return '<section class="s-texte s-avec-image s-img-' + s.position + '"' + id + '><div class="s-corps">' + corps + '</div>' + image(s.image, s.alt, 's-photo', true) + '</section>';
    }
  }
}
function dateLisible(j, lang) {
  try { return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(j + 'T12:00:00Z')); } catch (e) { return j; }
}
const NOMS = { lire: { fr: 'Lire l’article', en: 'Read the article', ru: 'Читать статью' }, retour: { fr: '← Tous les articles', en: '← All articles', ru: '← Все статьи' },
  vide: { fr: 'Aucun article pour l’instant.', en: 'No articles yet.', ru: 'Пока нет статей.' }, menu: { fr: 'Menu', en: 'Menu', ru: 'Меню' },
  galerie: { fr: 'Photo', en: 'Photo', ru: 'Фото' } };
function contenuPage(cfg, page, lang, ctx, article) {
  if (page.type === 'articles') {
    const secs = (page.sections || []).filter(s => !s.masque);
    // les sections après l'accroche vont dans la zone « infos » (espacement de l'accueil historique)
    let html = '', infos = '';
    secs.forEach((s, i) => { const h = section(s, ctx); if (i === 0 && s.genre === 'accroche') html += h; else infos += h; });
    return html + (infos ? '<div class="infos">' + infos + '</div>' : '');
  }
  if (page.type === 'galerie') {
    return '<div class="infos infos-haut"><section><h1 class="titre-page">' + enLigne(page.titre, ctx) + '</h1>' + paragraphes(page.intro, ctx, 'intro') +
      '<div class="galerie-site">' + (page.photos || []).map((x, i) => {
        const href = cibleLien(x.lien, ctx);
        const img = image(x.mini || x.src, x.legende || page.titre + ' ' + (i + 1), '', i > 5);
        const leg = x.legende ? '<span class="leg">' + esc(x.legende) + '</span>' : '';
        return href ? '<a class="ph" href="' + esc(href) + '"' + attrsLien(href) + '>' + img + leg + '</a>'
          : '<button type="button" class="ph" data-grande="' + esc(x.src) + '" aria-label="' + esc(x.legende || nomF('galerie', lang, ctx.fx) + ' ' + (i + 1)) + '">' + img + leg + '</button>';
      }).join('') + '</div></section></div>';
  }
  if (page.type === 'blog') {
    const arts = (page.articles || []).filter(a => !a.masque).sort((a, b) => b.date.localeCompare(a.date));
    if (article) {
      return '<div class="infos infos-haut"><article class="blog-article"><p><a class="retour" href="' + esc(adresse(page, lang)) + '">' + nomF('retour', lang, ctx.fx) + '</a></p>' +
        '<p class="date"><time datetime="' + article.date + '">' + dateLisible(article.date, lang) + '</time></p><h1 class="titre-page">' + esc(article.titre) + '</h1>' +
        image(article.image, article.titre, 'photo-article', false) + paragraphes(article.texte, ctx) + '</article></div>';
    }
    return '<div class="infos infos-haut"><section><h1 class="titre-page">' + enLigne(page.titre, ctx) + '</h1>' + paragraphes(page.intro, ctx, 'intro') +
      (arts.length ? '<div class="blog-liste">' + arts.map((a, i) => '<a class="blog-carte" href="' + esc(adresse(page, lang, a.slug)) + '">' +
        image(a.mini || a.image, a.titre, '', i > 2) + '<div><p class="date">' + dateLisible(a.date, lang) + '</p><h2>' + esc(a.titre) + '</h2><p>' +
        esc((a.description || sansMarques(a.texte)).slice(0, 220)) + '</p><span class="lire">' + nomF('lire', lang, ctx.fx) + ' →</span></div></a>').join('') + '</div>'
        : '<p class="intro">' + nomF('vide', lang, ctx.fx) + '</p>') + '</section></div>';
  }
  if (page.type === 'contact') {
    return '<div class="infos infos-haut"><section><h1 class="titre-page">' + enLigne(page.titre, ctx) + '</h1>' + paragraphes(page.intro, ctx, 'intro') +
      '<div class="contact-client" id="contact-client"></div></section></div>';
  }
  return '';
}
async function configContact(env, page, lang) {
  if (!page.source) return null;
  let slug = page.source;
  if (lang !== 'fr' && await env.CLIENTS.get('compte:' + slug + '.' + lang)) slug = slug + '.' + lang;
  const t = await env.CLIENTS.get('site:' + slug + ':config.json');
  if (!t) return null;
  const sansPoint = page.source;                              // images : page d'origine (versions traduites : mêmes images)
  return { cfg: t, base: 'https://' + sansPoint + '.qrbc.app/' + (slug !== page.source ? lang + '/' : '') };
}

const CSS_SITE = `<style>
  header.hd{display:flex;align-items:center;gap:16px;position:relative}
  .hd-ligne{display:flex;align-items:center;gap:18px;flex:1 1 auto;min-width:0}
  .hd-ligne>:first-child{margin-right:auto}
  .hd-el{display:flex;align-items:center;min-width:0}
  a.hd-logo{color:inherit;text-decoration:none;gap:10px}
  .hd-logo-img{display:block;width:auto;max-width:220px;object-fit:contain}
  .hd-logo-img.t-s{height:32px}.hd-logo-img.t-m{height:44px}.hd-logo-img.t-l{height:60px}
  header.hd .hd-actions{display:flex;align-items:center;gap:14px;flex:none}
  header.hd-fige{position:sticky;top:0;z-index:30;background:var(--bg);margin:-20px -16px 40px;padding:12px 16px;border-bottom:1px solid transparent;transition:border-color .2s,box-shadow .2s}
  header.hd-fige.defile{border-bottom-color:var(--ligne);box-shadow:0 6px 18px rgba(0,0,0,.06)}
  .nav-site{display:flex;align-items:center;gap:18px}
  .nav-site>a{color:var(--txt);font-weight:600;font-size:.92rem;text-decoration:none;padding:4px 0;border-bottom:2px solid transparent}
  .nav-site>a.ici{border-bottom-color:var(--accent)}
  .nav-bouton{display:none;width:auto;min-height:0;padding:8px 12px;border-radius:10px;background:var(--panneau);color:var(--txt);border:1px solid var(--ligne);font-weight:700}
  header{gap:14px;flex-wrap:wrap;position:relative}
  @media (max-width:859px){
    .nav-bouton{display:inline-block}
    header.hd{flex-wrap:wrap;row-gap:2px}
    .hd-ligne{flex-basis:100%;gap:10px}
    header.hd .hd-actions{margin-left:auto;font-size:.9rem}
    .hd-logo-img.t-l{height:48px}
    .nav-site{display:none;position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:15;flex-direction:column;align-items:stretch;gap:0;padding:8px;background:var(--panneau);border:1px solid var(--ligne);border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,.18)}
    .nav-site.ouvert{display:flex}
    .nav-site>a{padding:12px 10px;border-bottom:1px solid var(--ligne)}
    .nav-site>a:last-child{border-bottom:0}
    .nav-site>a.ici{color:var(--accent);border-bottom-color:var(--ligne)}
    .nav-site>a.ici:last-child{border-bottom:0}
  }
  .page{position:relative}
  .grille-seule{grid-template-columns:1fr !important}
  .infos-haut{margin-top:8px}
  .titre-page{font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.1;letter-spacing:-.03em;margin:0 0 14px}
  .infos h2 em,.titre-page em{font-style:normal;color:var(--accent)}
  .infos p{max-width:46em}
  .infos a:not(.cta):not(.blog-carte):not(.ph):not(.retour){color:var(--accent)}
  .s-bouton{margin:18px 0 0}
  .s-avec-image{display:grid;gap:24px;align-items:center}
  @media (min-width:760px){.s-avec-image{grid-template-columns:1fr 1fr}.s-img-gauche .s-photo{order:-1}}
  .s-img-dessus .s-photo{order:-1}
  @media (min-width:760px){.s-img-dessus{grid-template-columns:1fr}}
  .s-photo,.s-image img{width:100%;border-radius:16px;display:block}
  .s-image{margin:0}
  .s-code{margin:0 0 28px}
  footer .reseaux{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
  .rs-pied{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-weight:600}
  .rs-ico{width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex:none}
  .rs-ico img.blanc{filter:invert(1)}
  .s-image figcaption{color:var(--doux);font-size:.9rem;margin-top:8px}
  .bloc-inscription-seul{max-width:520px}
  .galerie-site{display:grid;gap:8px;grid-template-columns:repeat(2,1fr)}
  @media (min-width:700px){.galerie-site{grid-template-columns:repeat(3,1fr)}}
  @media (min-width:1000px){.galerie-site{grid-template-columns:repeat(4,1fr)}}
  .galerie-site .ph{position:relative;display:block;width:100%;min-height:0;padding:0;border:0;border-radius:12px;overflow:hidden;background:var(--ligne);aspect-ratio:1;cursor:pointer}
  .galerie-site img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
  .galerie-site .ph:hover img{transform:scale(1.04)}
  .galerie-site .leg{position:absolute;left:0;right:0;bottom:0;padding:18px 10px 8px;background:linear-gradient(transparent,rgba(0,0,0,.65));color:#fff;font-size:.85rem;font-weight:600;text-align:left}
  .visionneuse{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center}
  .visionneuse img{max-width:94vw;max-height:88vh;border-radius:8px}
  .visionneuse button{position:absolute;width:44px;height:44px;min-height:0;padding:0;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:1.4rem}
  .visionneuse .vx{top:14px;right:14px}.visionneuse .vp{left:10px;top:50%}.visionneuse .vs{right:10px;top:50%}
  .blog-liste{display:grid;gap:16px}
  @media (min-width:760px){.blog-liste{grid-template-columns:1fr 1fr}}
  .blog-carte{display:block;border:1px solid var(--ligne);border-radius:16px;overflow:hidden;background:var(--panneau);color:inherit;text-decoration:none}
  .blog-carte img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
  .blog-carte>div{padding:14px 16px 16px}
  .blog-carte h2{font-size:1.15rem;margin:2px 0 6px;letter-spacing:-.01em}
  .blog-carte p{margin:0 0 8px;color:var(--doux);font-size:.93rem}
  .blog-carte .lire{color:var(--accent);font-weight:700;font-size:.9rem}
  .date{color:var(--doux);font-size:.85rem;margin:0}
  .blog-article{max-width:720px}
  .blog-article .photo-article{width:100%;border-radius:16px;margin:8px 0 18px}
  .blog-article p{font-size:1.05rem;line-height:1.7}
  .retour{color:var(--doux);text-decoration:none;font-weight:600}
  .contact-client{max-width:440px;min-height:640px;border-radius:24px;overflow:hidden;border:1px solid var(--ligne);margin-top:10px;display:flex}
  .contact-client>*{flex:1}
  .apercu-bandeau{position:sticky;top:0;z-index:50;background:#d9572b;color:#fff;text-align:center;font:600 13px system-ui;padding:6px}
</style>`;

const JS_SITE = `<script>
(function(){
  var hf=document.querySelector('header.hd-fige');
  if(hf){var df=function(){hf.classList.toggle('defile',(window.scrollY||0)>8);};window.addEventListener('scroll',df,{passive:true});df();}
  var b=document.querySelector('.nav-bouton'),n=document.querySelector('.nav-site');
  if(b&&n){b.addEventListener('click',function(e){e.stopPropagation();var o=n.classList.toggle('ouvert');b.setAttribute('aria-expanded',o);});
    document.addEventListener('click',function(e){if(!n.contains(e.target))n.classList.remove('ouvert');});}
  var ph=[].slice.call(document.querySelectorAll('.galerie-site button.ph'));
  if(ph.length){var k=0,v=null;
    function montrer(i){k=(i+ph.length)%ph.length;v.querySelector('img').src=ph[k].getAttribute('data-grande');}
    function fermer(){if(v){v.remove();v=null;}}
    ph.forEach(function(x,i){x.addEventListener('click',function(){v=document.createElement('div');v.className='visionneuse';
      v.innerHTML='<img alt=""><button type="button" class="vx" aria-label="×">×</button>'+(ph.length>1?'<button type="button" class="vp">‹</button><button type="button" class="vs">›</button>':'');
      document.body.appendChild(v);montrer(i);
      v.addEventListener('click',function(e){if(e.target.classList.contains('vp'))montrer(k-1);else if(e.target.classList.contains('vs'))montrer(k+1);else if(e.target.tagName!=='IMG')fermer();});
      var x0=null;v.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
      v.addEventListener('touchend',function(e){if(x0===null)return;var d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)montrer(k+(d<0?1:-1));x0=null;});});});
    document.addEventListener('keydown',function(e){if(!v)return;if(e.key==='Escape')fermer();if(e.key==='ArrowRight')montrer(k+1);if(e.key==='ArrowLeft')montrer(k-1);});}
})();
</script>`;

function piedHtml(cfg, ctx) {
  const v = pageEnLangue(cfg, cfg.pied || nettoyerPied(null), ctx.lang);
  const lien = (c, contenu, extra) => { const h = cibleLien(c, ctx); return h ? '<a href="' + esc(h) + '"' + attrsLien(h) + (extra || '') + '>' + contenu + '</a>' : contenu; };
  const reseaux = (v.reseaux || []).map(r => {
    const def = RESEAUX_PIED[r.type] || RESEAUX_PIED.site;
    const ico = r.type === 'site' ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
      : '<img src="https://cdn.jsdelivr.net/npm/simple-icons@16/icons/' + r.type + '.svg" alt="" width="16" height="16"' + (r.type === 'snapchat' ? '' : ' class="blanc"') + '>';
    const h = cibleLien(r.lien, ctx);
    return '<a class="rs-pied" href="' + esc(h) + '" target="_blank" rel="noopener me"' + (r.titre ? '' : ' aria-label="' + esc(def[0]) + '"') + '><span class="rs-ico" style="background:' + def[1] + '">' + ico + '</span>' + (r.titre ? '<span>' + esc(r.titre) + '</span>' : '') + '</a>';
  }).join('');
  const liens = (v.liens || []).map(l => lien(l.lien, esc(l.titre), l.lien === '/generateur-qr-code' ? ' id="lien-outil-qr"' : '')).join(' · ');
  // ligne obligatoire : CGV, mentions légales, support (reprise de l'accueil historique)
  const legal = (ctx.g.pied.match(/<p class="liens"><a href="\/cgv">[\s\S]*?<\/p>/) || [''])[0];
  return '<footer>' + (v.note ? '<p class="prix">' + enLigne(v.note, ctx) + '</p>' : '') + (v.texte ? '<p>' + enLigne(v.texte, ctx) + '</p>' : '') +
    (reseaux ? '<p class="reseaux">' + reseaux + '</p>' : '') + (liens ? '<p class="liens">' + liens + '</p>' : '') + legal + '</footer>';
}
/* Document HTML complet d'une page du site (ou d'un article du blog) */
/* Page française ouverte sans ?lang : on recharge dans la langue retenue ou celle du téléphone (comme l'ancien accueil),
   la page étant traduite par le serveur. Les robots gardent la version française. */
function redirectionLangue(langues) {
  return '<script>(function(){try{var L=' + JSON.stringify(langues) + ';var u=new URL(location.href);if(u.searchParams.has("lang")||/bot|crawl|spider|slurp|lighthouse|google|bing|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram/i.test(navigator.userAgent))return;' +
    'var l=null;try{l=localStorage.getItem("qp-langue");}catch(e){}if(L.indexOf(l)<0){var n=(navigator.language||"fr").slice(0,2).toLowerCase();l=L.indexOf(n)>=0?n:(L.indexOf("en")>=0?"en":"fr");}' +
    'if(l!=="fr"){u.searchParams.set("lang",l);location.replace(u.pathname+u.search+u.hash);}}catch(e){}})();</script>\n';
}
const nomF = (k, lang, fx) => NOMS[k][lang] || (fx && fx[NOMS[k].fr]) || NOMS[k].en;
export async function rendrePageSite(env, request, cfg, page, lang, opts) {
  opts = opts || {};
  const g = await gabarit(env, request);
  const vue = pageEnLangue(cfg, page, lang);
  const langues = languesDe(cfg);
  const fx = lang === 'fr' || lang === 'en' || lang === 'ru' ? null : await lireFixes(env, lang);
  const ctx = { cfg, lang, g, fx, page, formulaireMis: false };
  const article = opts.article ? (vue.articles || []).find(a => a.slug === opts.article && !a.masque) : null;
  if (opts.article && !article) return null;
  const titre = article ? article.titre + ' | qrbc' : (vue.seo && vue.seo.titre) || (vue.titre + ' | qrbc');
  const desc = article ? (article.description || sansMarques(article.texte).slice(0, 155)) : (vue.seo && vue.seo.description) || '';
  const chemin = article ? '/' + page.chemin + '/' + article.slug : '/' + page.chemin;
  const absolue = l => 'https://qrbc.app' + chemin + (l !== 'fr' ? '?lang=' + l : '');
  const locale = { fr: 'fr_FR', en: 'en_GB', ru: 'ru_RU', es: 'es_ES', de: 'de_DE', it: 'it_IT', pt: 'pt_PT', nl: 'nl_NL', uk: 'uk_UA', pl: 'pl_PL', ro: 'ro_RO', tr: 'tr_TR', zh: 'zh_CN', ja: 'ja_JP' }[lang] || lang;
  const ogImage = (article && article.image) ? 'https://qrbc.app' + article.image : 'https://qrbc.app/og-qrbc' + (lang === 'en' || lang === 'ru' ? '-' + lang : '') + '.jpg';
  let jsonld = page.chemin === '' && !article ? g.jsonld : '';
  if (article) jsonld = '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.titre,
    datePublished: article.date, inLanguage: lang, image: article.image ? 'https://qrbc.app' + article.image : undefined, description: desc || undefined,
    author: { '@type': 'Organization', name: 'qrbc', url: 'https://qrbc.app/' }, mainEntityOfPage: absolue(lang) }).replace(/</g, '\\u003c') + '</script>';
  // menu
  const dansMenu = cfg.pages.filter(p => p.menu !== false);
  const menu = dansMenu.length < 2 ? '' : dansMenu.map(p => {
    const v = pageEnLangue(cfg, p, lang);
    return '<a href="' + esc(adresse(p, lang)) + '"' + (p.id === page.id ? ' class="ici" aria-current="page"' : '') + '>' + esc(v.nomMenu || v.titre) + '</a>';
  }).join('');
  // en-tête (24/11) : logo (texte qrbc ou image), menu et choix de langue dans l'ordre réglé ; « Se connecter » à la fin
  // (dessous sur téléphone) ; option « figé en haut »
  const E = entete_(cfg);
  const marqueTpl = (g.entete.match(/<div class="marque">[\s\S]*?<\/small><\/div>/) || [''])[0];
  const actionsTpl = (g.entete.match(/<a href="\/app">[\s\S]*?<\/button>/) || [''])[0];
  const logo = E.logo.image ? '<img class="hd-logo-img t-' + E.logo.taille + '" src="' + esc(E.logo.image) + '" alt="' + esc(E.logo.alt || 'qrbc') + '">' + (E.logo.texte ? marqueTpl : '') : marqueTpl;
  const blocs = {
    logo: '<a class="hd-el hd-logo" href="' + esc(adresse(cfg.pages.find(p => p.chemin === '') || page, lang)) + '">' + logo + '</a>',
    menu: menu ? '<div class="hd-el hd-menu"><nav class="nav-site" aria-label="' + nomF('menu', lang, fx) + '">' + menu + '</nav>' +
      '<button type="button" class="nav-bouton" aria-label="' + nomF('menu', lang, fx) + '" aria-expanded="false">☰</button></div>' : '',
    langue: '<div class="hd-el hd-langue"><span class="langue" data-langue></span></div>'
  };
  const entete = '<header class="hd' + (E.fige ? ' hd-fige' : '') + '"><div class="hd-ligne">' + E.ordre.map(k => blocs[k]).join('') + '</div>' +
    '<div class="hd-actions">' + actionsTpl + '</div></header>';
  // vidéo de la page (articles) : vidéo choisie dans le constructeur, sinon la vidéo de présentation qrbc
  let video = '';
  if (page.type === 'articles' && page.video && page.video.actif && !article) {
    // vidéo de présentation qrbc : FR / EN / RU seulement (anglaise pour les autres langues)
    const src = page.video.src[lang] || page.video.src.fr || (lang === 'fr' || lang === 'en' || lang === 'ru' ? '' : '/videos/qrbc-en.mp4?v=3');
    video = g.video.replace('<div class="video-promo"', '<div class="video-promo"' + (src ? ' data-src="' + esc(src) + '"' : ''));
  }
  let corps = contenuPage(cfg, vue, lang, ctx, article);
  let fin = '';
  if (page.type === 'contact') {
    const cc = await configContact(env, page, lang);
    if (cc) fin = '<script src="/commun.js"></script><script>(function(){var base=' + JSON.stringify(cc.base) + ';var c=' + cc.cfg.replace(/</g, '\\u003c') +
      ';rendrePage(c,document.getElementById("contact-client"),{resoudre:function(x){return /^(https?:|data:)/.test(x)?x:base+x;},liens:{contact:base,home:base+"accueil.html",blog:base+"blog.html",perso:base+"page.html"}});})();</script>';
  }
  const alternates = langues.map(l => '<link rel="alternate" hreflang="' + l + '" href="' + esc(absolue(l)) + '">').join('\n') +
    '\n<link rel="alternate" hreflang="x-default" href="' + esc(absolue('fr')) + '">';
  const html = '<!DOCTYPE html>\n<html lang="' + lang + '" data-lien-langue data-pretraduit>\n<head>\n<meta charset="utf-8">\n' + (lang === 'fr' && !opts.apercu ? redirectionLangue(langues) : '') +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>' + esc(titre) + '</title>\n' +
    (desc ? '<meta name="description" content="' + esc(desc) + '">\n' : '') +
    '<link rel="canonical" href="' + esc(absolue(lang)) + '">\n<meta property="og:type" content="' + (article ? 'article' : 'website') + '">\n<meta property="og:site_name" content="qrbc">\n' +
    '<meta property="og:url" content="' + esc(absolue(lang)) + '">\n<meta property="og:title" content="' + esc(titre) + '">\n' + (desc ? '<meta property="og:description" content="' + esc(desc) + '">\n' : '') +
    '<meta property="og:locale" content="' + locale + '">\n<meta property="og:image" content="' + esc(ogImage) + '">\n<meta name="twitter:card" content="summary_large_image">\n' + alternates + '\n' +
    '<link rel="manifest" href="/manifest.webmanifest">\n<meta name="theme-color" content="#1b1a17">\n<link rel="icon" href="/favicon.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n' +
    '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="qrbc">\n' + jsonld + '\n' + g.style + '\n' + CSS_SITE + '\n</head>\n<body>\n' +
    (opts.apercu ? '<div class="apercu-bandeau">Aperçu — ' + esc(opts.apercu) + '</div>' : '') +
    '<div class="page">\n  ' + entete + '\n  ' + video + '\n' + corps + '\n  ' + piedHtml(cfg, ctx) + '\n</div>\n' +
    // langues du sélecteur (i18n.js) et textes fixes d'une langue ajoutée
    '<script>window.QRBC_LANGUES=' + JSON.stringify(Object.fromEntries(langues.map(l => [l, l.toUpperCase()]))) + (fx ? ';window.QRBC_DICO=' + JSON.stringify(fx).replace(/</g, '\\u003c') : '') + ';</script>\n' + g.scripts + JS_SITE + fin + '\n</body>\n</html>\n';
  return html;
}

/* Traduction des textes fixes (formulaire, pied de page…) restés en français, avec le dictionnaire de i18n.js */
function traduireFixes(html, lang, dico, fx) {
  if (lang === 'fr') return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  // EN / RU : dictionnaire de i18n.js ; autre langue : textes fixes traduits à l'ajout de la langue (sinon l'anglais)
  const base = lang === 'en' || lang === 'ru';
  const i = lang === 'ru' ? 1 : 0;
  const trouver = cle => { if (!base && fx && fx[cle]) return fx[cle]; const v = dico.get(cle); return v && v[i]; };
  let tampon = '', dansScript = false, dansCode = 0;
  return new HTMLRewriter()
    .on('script', { element(e) { dansScript = true; e.onEndTag(() => { dansScript = false; }); } })
    .on('div.s-code', { element(e) { dansCode++; e.onEndTag(() => { dansCode--; }); } })
    .onDocument({ text(t) {
      tampon += t.text;
      if (!t.lastInTextNode) { t.remove(); return; }
      const brut = tampon; tampon = '';
      const cle = brut.trim(), v = !dansScript && !dansCode && cle && trouver(cle);
      if (!v) { t.replace(brut, { html: true }); return; }
      const d = brut.indexOf(cle);
      t.replace(brut.slice(0, d) + esc(v) + brut.slice(d + cle.length), { html: true });
    } })
    .transform(new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-language': lang } }));
}

/* ---------------- Adresses publiques ---------------- */
export async function routeSite(request, env, url, O) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const p = url.pathname;
  const mm = p.match(/^\/media\/([a-z0-9._-]{3,80})$/i);
  if (mm) return servirMedia(env, request, mm[1]);
  if (!(await siteActif(env))) return null;
  const cfg = await publie(env);
  if (!cfg) return null;
  const segs = p.replace(/^\/+|\/+$/g, '').split('/');
  if (segs.length > 2 || (p !== '/' && p.endsWith('/'))) return null;
  const page = cfg.pages.find(x => x.chemin === (p === '/' || p === '/index.html' ? '' : segs[0]));
  if (!page) return null;
  if (segs.length === 2 && page.type !== 'blog') return null;
  const l = url.searchParams.get('lang');
  const lang = languesDe(cfg).includes(l) ? l : 'fr';
  // le générateur de QR (désormais une page du constructeur) garde sa ligne de statistiques « Générateur de QR code »
  const mesure = O.compterVisiteSite(request, env, url, page.chemin === '' ? 'accueil' : page.chemin === 'generateur-qr-code' ? 'generateur-qr' : page.chemin.slice(0, 30));
  const html = await rendrePageSite(env, request, cfg, page, lang, { article: segs.length === 2 ? segs[1] : '' });
  if (!html) return null;
  const r = traduireFixes(html, lang, await O.dictionnaire(env, request), await lireFixes(env, lang));
  const h = new Headers(r.headers); h.set('cache-control', 'public, max-age=60');
  return O.avecMesureSite(new Response(r.body, { status: 200, headers: h }), mesure);
}
async function servirMedia(env, request, nom) {
  const { value, metadata } = await env.CLIENTS.getWithMetadata(PREFIXE_MEDIA + nom, 'arrayBuffer');
  if (!value) return new Response('Introuvable', { status: 404 });
  const type = (metadata && metadata.type) || 'application/octet-stream', total = value.byteLength;
  const h = new Headers({ 'content-type': type, 'cache-control': 'public, max-age=31536000, immutable', 'accept-ranges': 'bytes' });
  const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') || '');
  if (!m) { h.set('content-length', String(total)); return new Response(request.method === 'HEAD' ? null : value, { headers: h }); }
  const debut = m[1] === '' ? Math.max(0, total - Number(m[2])) : Number(m[1]);
  const fin = m[1] !== '' && m[2] !== '' ? Math.min(Number(m[2]), total - 1) : total - 1;
  if (debut >= total || debut > fin) { h.set('content-range', 'bytes */' + total); return new Response(null, { status: 416, headers: h }); }
  h.set('content-range', 'bytes ' + debut + '-' + fin + '/' + total); h.set('content-length', String(fin - debut + 1));
  return new Response(request.method === 'HEAD' ? null : value.slice(debut, fin + 1), { status: 206, headers: h });
}
// ancienne adresse du générateur de QR (page statique archivée) : page du site construit qui porte le générateur
export async function adresseGenerateur(env) {
  if (!(await siteActif(env))) return '';
  const cfg = await publie(env);
  if (!cfg) return '';
  const p = cfg.pages.find(x => x.chemin === 'generateur-qr-code') ||
    cfg.pages.find(x => x.type === 'articles' && (x.sections || []).some(s => s.genre === 'code' && !s.masque && /qrcode\.js/.test((s.code && s.code.fr) || '')));
  return p ? '/' + p.chemin : '';
}
// adresses du site construit pour le plan du site (sitemap-site.xml)
export async function adressesSite(env) {
  if (!(await siteActif(env))) return null;
  const cfg = await publie(env);
  if (!cfg) return null;
  const out = [];
  for (const p of cfg.pages) {
    for (const l of languesDe(cfg)) out.push({ loc: adresse(p, l), lastmod: (cfg.maj || '').slice(0, 10) });
    if (p.type === 'blog') for (const a of p.articles || []) if (!a.masque) for (const l of languesDe(cfg)) out.push({ loc: adresse(p, l, a.slug), lastmod: a.date });
  }
  return out;
}

/* ---------------- API du constructeur (appelée depuis gestion(), clé de gestion déjà vérifiée) ---------------- */
export async function apiSite(request, env, action, d, O) {
  if (action === 'site' && request.method === 'GET') {
    const brouillon = (await lire(env, 'brouillon')) || await brouillonInitial(env, request, O);
    if (!brouillon.pied) brouillon.pied = nettoyerPied(null);            // brouillon d'avant le pied modifiable
    if (!brouillon.formulaire) brouillon.formulaire = nettoyerFormulaire(null);
    return O.json({ cfg: brouillon, publie: !!(await lire(env, 'publie')), actif: await siteActif(env), reserves: [...RESERVES], languesDispo: LANGUES_DISPO, reseauxPied: RESEAUX_PIED, formulaireDefaut: FORM_DEFAUT });
  }
  if (action === 'site' && request.method === 'POST') {
    const cfg = nettoyerConfig(d.cfg);
    await env.CLIENTS.put(CLES.brouillon, JSON.stringify(cfg));
    return O.json({ ok: true, cfg });
  }
  if (action === 'site-publier' && request.method === 'POST') {
    const cfg = nettoyerConfig(d.cfg);
    const txt = JSON.stringify(cfg);
    await env.CLIENTS.put(CLES.brouillon, txt);
    await env.CLIENTS.put(CLES.publie, txt);
    await env.CLIENTS.put(CLES.actif, '1');
    CACHE_PUBLIE = null; CACHE_ACTIF = null;
    await env.CLIENTS.delete('cache:plan-global').catch(() => {});
    await nettoyerMedias(env, txt);
    return O.json({ ok: true, cfg, actif: true });
  }
  if (action === 'site-retirer' && request.method === 'POST') {     // retour à l'accueil historique (qrbc.html)
    await env.CLIENTS.delete(CLES.actif);
    CACHE_PUBLIE = null; CACHE_ACTIF = null;
    return O.json({ ok: true, actif: false });
  }
  if (action === 'site-apercu' && request.method === 'POST') {
    const cfg = nettoyerConfig(d.cfg);
    const lang = languesDe(cfg).includes(d.lang) ? d.lang : 'fr';
    const page = cfg.pages.find(p => p.id === d.page) || cfg.pages[0];
    let html = await rendrePageSite(env, request, cfg, page, lang, { article: d.article || '', apercu: 'non publié, visible par vous seul' });
    if (!html) html = await rendrePageSite(env, request, cfg, page, lang, { apercu: 'article introuvable' });
    const r = traduireFixes(html, lang, await O.dictionnaire(env, request), await lireFixes(env, lang));
    // dans l'aperçu, les liens internes changent la page de l'aperçu (pas de navigation hors du constructeur)
    const pages = cfg.pages.map(p => ({ id: p.id, chemin: p.chemin }));
    const origine = new URL(request.url).origin;
    const script = '<base href="' + origine + '/"><script>window.QRBC_APERCU=' + JSON.stringify(pages).replace(/</g, '\\u003c') + ';document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("a");if(!a)return;var u;try{u=new URL(a.getAttribute("href"),' + JSON.stringify(origine + '/') + ');}catch(x){return;}if(u.origin!==' + JSON.stringify(origine) + ')return;if(a.getAttribute("href").charAt(0)==="#")return;e.preventDefault();var s=u.pathname.replace(/^\\/+|\\/+$/g,"").split("/");var p=window.QRBC_APERCU.find(function(x){return x.chemin===(s[0]||"");});parent.postMessage({qrbcApercu:1,page:p?p.id:null,article:s[1]||"",externe:p?"":u.href},"*");});</script>';
    return O.json({ html: (await r.text()).replace('<head>', '<head>' + script) });
  }
  if (action === 'site-media' && request.method === 'PUT') {
    const type = String(request.headers.get('content-type') || '').split(';')[0].trim();
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'video/mp4': 'mp4', 'image/svg+xml': 'svg' }[type];
    if (!ext) throw new O.ErreurAPI(400, 'Format non accepté (JPEG, PNG, WebP, SVG ou MP4).');
    const buf = await request.arrayBuffer();
    const limite = ext === 'mp4' ? 24 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!buf.byteLength) throw new O.ErreurAPI(400, 'Fichier vide.');
    if (buf.byteLength > limite) throw new O.ErreurAPI(413, ext === 'mp4' ? 'Vidéo trop lourde (24 Mo au plus).' : 'Image trop lourde (5 Mo au plus).');
    const nom = Date.now().toString(36) + '-' + id6() + '.' + ext;
    await env.CLIENTS.put(PREFIXE_MEDIA + nom, buf, { metadata: { type, taille: buf.byteLength } });
    return O.json({ ok: true, src: '/media/' + nom });
  }
  if (action === 'site-traduire' && request.method === 'POST') {
    const lang = LANGUES_DISPO[d.lang] ? d.lang : null;
    if (!lang) throw new O.ErreurAPI(400, 'Langue invalide.');
    const estPied = d.page && (d.page.type === 'pied' || d.page.type === 'formulaire');
    const page = d.page && d.page.type === 'formulaire' ? nettoyerFormulaire(d.page) : estPied ? nettoyerPied(d.page) : nettoyerPage(d.page, { ids: new Set(), chemins: new Set(), accueil: d.page && d.page.chemin === '' ? false : true });
    if (d.page && d.page.id && !estPied) page.id = d.page.id;
    const tous = textesPage(page);
    const source = empreinte(JSON.stringify(tous));
    // blog : seulement certaines parties (« hors » = titre, intro, Google… ; « a:<id> » = un article) — les autres traductions ne bougent pas
    const parties = Array.isArray(d.parties) && page.type === 'blog' ? new Set(d.parties.map(String)) : null;
    const partieDe = k => { const m = /^articles\.(\d+)\./.exec(k); return m ? 'a:' + ((page.articles[Number(m[1])] || {}).id || '') : 'hors'; };
    const textes = {};
    for (const k of Object.keys(tous)) if (!parties || parties.has(partieDe(k))) textes[k] = tous[k];
    // par paquets (gros blogs) : la réponse de l'IA reste courte
    const cles = Object.keys(textes), traduits = {};
    let paquet = {}, taille = 0;
    const envoyer = async () => { if (Object.keys(paquet).length) Object.assign(traduits, await O.traduireTextes(env, paquet, 'fr', lang)); paquet = {}; taille = 0; };
    for (const k of cles) { paquet[k] = textes[k]; taille += textes[k].length; if (taille > 9000) await envoyer(); }
    await envoyer();
    const rep = { ok: true, page: appliquerTextes(page, traduits), traduits, source, le: new Date().toISOString() };
    if (page.type === 'blog') {
      const e = empreintesBlog(page);
      rep.hors = !parties || parties.has('hors') ? e.hors : undefined;
      rep.art = {};
      for (const id of Object.keys(e.art)) if (!parties || parties.has('a:' + id)) rep.art[id] = e.art[id];
    }
    return O.json(rep);
  }
  if (action === 'site-langue' && request.method === 'POST') {       // langue ajoutée : traduire une fois les textes fixes du site
    const lang = LANGUES_DISPO[d.lang] ? d.lang : null;
    if (!lang) throw new O.ErreurAPI(400, 'Langue invalide.');
    if (lang === 'en' || lang === 'ru') return O.json({ ok: true, n: 0 });   // déjà dans le dictionnaire de i18n.js
    if (!d.refaire && await lireFixes(env, lang)) return O.json({ ok: true, deja: true });
    const fr = await textesFixes(env, request, O), entree = {};
    fr.forEach((x, k) => { entree[k] = x; });
    const sortie = {};
    let paquet = {}, taille = 0;
    const envoyer = async () => { if (Object.keys(paquet).length) Object.assign(sortie, await O.traduireTextes(env, paquet, 'fr', lang)); paquet = {}; taille = 0; };
    for (const k of Object.keys(entree)) { paquet[k] = entree[k]; taille += entree[k].length; if (taille > 6000) await envoyer(); }
    await envoyer();
    const fx = {};
    for (const k of Object.keys(sortie)) fx[entree[k]] = sortie[k];
    await env.CLIENTS.put(PREFIXE_FIXES + lang, JSON.stringify(fx));
    CACHE_FIXES.delete(lang);
    return O.json({ ok: true, n: Object.keys(fx).length });
  }
  throw new O.ErreurAPI(404, 'Action inconnue.');
}
/* Textes fixes du gabarit (en-tête, formulaire, pied, messages de l'inscription) : ceux que i18n.js sait traduire en EN / RU */
let TEXTES_FIXES = null;
async function textesFixes(env, request, O) {
  if (TEXTES_FIXES) return TEXTES_FIXES;
  const g = await gabarit(env, request);
  let source = g.entete + g.formulaire + g.pied + g.scripts;
  try { const u = new URL(request.url); u.pathname = '/inscription.js'; u.search = ''; source += await (await env.ASSETS.fetch(new Request(u.toString()))).text(); } catch (e) {}
  const dico = await O.dictionnaire(env, request), out = new Set(Object.values(NOMS).map(n => n.fr));
  for (const cle of dico.keys()) if (cle.length > 1 && source.includes(cle)) out.add(cle);
  TEXTES_FIXES = [...out];
  return TEXTES_FIXES;
}
const CACHE_FIXES = new Map();
async function lireFixes(env, lang) {
  if (!lang || lang === 'fr' || lang === 'en' || lang === 'ru') return null;
  const c = CACHE_FIXES.get(lang);
  if (c && c.t > Date.now()) return c.v;
  let v = null;
  try { v = JSON.parse(await env.CLIENTS.get(PREFIXE_FIXES + lang) || 'null'); } catch (e) {}
  CACHE_FIXES.set(lang, { t: Date.now() + 30000, v });
  return v;
}
async function nettoyerMedias(env, texteCfg) {
  const brouillon = (await env.CLIENTS.get(CLES.brouillon)) || '';
  let curseur;
  do {
    const l = await env.CLIENTS.list({ prefix: PREFIXE_MEDIA, cursor: curseur });
    for (const k of l.keys) {
      const nom = '/media/' + k.name.slice(PREFIXE_MEDIA.length);
      // médias de moins d'un jour gardés (chargés mais pas encore enregistrés dans le brouillon)
      const age = Date.now() - parseInt(k.name.slice(PREFIXE_MEDIA.length).split('-')[0], 36);
      if (!texteCfg.includes(nom) && !brouillon.includes(nom) && age > 86400000) await env.CLIENTS.delete(k.name);
    }
    curseur = l.list_complete ? null : l.cursor;
  } while (curseur);
}

/* ---------------- Premier brouillon : l'accueil historique recopié en sections (FR, EN, RU) ---------------- */
async function brouillonInitial(env, request, O) {
  const dico = await O.dictionnaire(env, request);
  const tr = (fr, i) => { const v = dico.get(fr); return v && v[i] ? v[i] : fr; };
  const it = (titre, texte) => ({ titre, texte: texte || '' });
  const accueil = {
    id: 'accueil', type: 'articles', titre: 'Accueil', nomMenu: '', chemin: '', menu: true,
    seo: { titre: 'Votre site web mobile en 5 minutes, 1,99 €/mois sans engagement | qrbc',
      description: 'Créez votre site web mobile depuis votre smartphone : appel, WhatsApp, avis Google, QR code et cartes de visite. 1 mois d’essai gratuit, sans carte bancaire.' },
    video: { actif: true, src: {} },
    sections: [
      { id: 'hero', genre: 'accroche', avecInscription: true, titre: 'Votre site web mobile en 5 minutes, *pour 1,99 €/mois.* Sans engagement.',
        bouton: { texte: 'Essayer 1 mois gratuitement', lien: '#inscription' },
        texte: 'Un site mobile à votre nom, que vos clients ouvrent d’un scan : réserver, appeler, écrire sur WhatsApp, laisser un avis Google, voir vos tarifs et vos photos. Vous le créez et le modifiez vous-même, entièrement depuis votre smartphone, sans ordinateur.',
        note: 'qrbc, c’est « QR Business Card » : la carte de visite qui ne se périme jamais.',
        items: [it('Décrivez votre activité', 'Vous recevez un lien par e-mail, l’adresse de votre site est proposée automatiquement'),
          it('Personnalisez votre site', 'Pages, boutons, couleurs, logo, photos, textes rédigés avec l’aide de l’IA'),
          it('Imprimez vos cartes', 'QR code et modèles de cartes de visite prêts à l’impression')],
        encart: { titre: 'Une appli sur votre écran d’accueil.', texte: 'Modifiez votre site et imprimez vos cartes depuis votre téléphone, sans passer par un navigateur.', image: '/icon-192.png' } },
      { id: 'pourqui', genre: 'etiquettes', titre: 'Pour qui ?', texte: 'Pour tous ceux qui reçoivent des clients et veulent être joints, réservés ou recommandés d’un simple scan.',
        items: ['Chauffeurs VTC et taxis', 'Restaurants, cafés et bars', 'Artisans et dépannage', 'Coiffeurs et instituts de beauté', 'Saunas, spas et bien-être',
          'Locations saisonnières et conciergeries', 'Coachs, guides et professeurs', 'Boutiques et commerces de proximité'].map(x => it(x)) },
      { id: 'atouts', genre: 'cartes', titre: 'Ce que votre site fait pour vous', items: [
        it('Plusieurs pages, un seul QR code', 'Contact, présentation, tarifs, blog et galerie photos, reliés par un menu. Activez seulement les pages dont vous avez besoin.'),
        it('Un QR code qui ne change jamais', 'Changez de numéro, d’horaires ou d’offres quand vous voulez : vos cartes et affiches déjà imprimées restent valables.'),
        it('Un site dans la langue de chaque client', 'Ajoutez des langues à votre site (14 au choix), traduites par l’IA. Le même QR code l’ouvre dans la langue du téléphone de chaque visiteur.'),
        it('Avis Google, WhatsApp, réservation', 'Des boutons pour appeler, écrire, réserver, suivre vos réseaux ou laisser un avis : vos clients agissent en un geste.'),
        it('Textes et images avec l’IA', 'Décrivez votre activité en quelques mots : l’IA propose les textes, les pictogrammes et les images de votre site.'),
        it('Visible sur Google', 'Titre, description et fiche « entreprise locale » sont créés automatiquement pour les moteurs de recherche.'),
        it('26 modèles de cartes de visite', 'Des cartes prêtes à imprimer avec votre QR code, chez vous ou chez l’imprimeur.')] },
      { id: 'tarif', genre: 'texte', titre: 'Un prix simple', texte: '1 mois d’essai gratuit, sans carte bancaire. Ensuite 1,99 € TTC par mois, sans engagement, ou 19,99 € TTC par an (2 mois offerts) : site, QR code, cartes de visite et crédits IA compris.\n\nRésiliable à tout moment, en un clic depuis votre téléphone. Pas de prix d’appel qui explose la deuxième année. Satisfait ou remboursé pendant 14 jours.' },
      { id: 'faq', genre: 'faq', titre: 'Questions fréquentes', items: [
        it('Faut-il savoir créer un site ?', 'Non. Vous choisissez une adresse, vous remplissez quelques champs et l’IA propose le reste. Tout se fait depuis votre téléphone.'),
        it('Et si je change de numéro ou d’horaires ?', 'Vous modifiez votre site en quelques secondes. Le QR code reste le même : inutile de réimprimer vos cartes.'),
        it('Comment fonctionnent les traductions ?', 'Vous ajoutez une langue (en option) et l’IA traduit votre site. Chaque visiteur le voit dans la langue de son téléphone et peut en changer en haut de chaque page.'),
        it('Mes clients doivent-ils installer une appli ?', 'Non. Il suffit de scanner le QR code avec l’appareil photo du téléphone pour ouvrir votre site.'),
        it('Puis-je arrêter quand je veux ?', 'Oui. La formule mensuelle est sans engagement : vous résiliez en un clic depuis votre espace, et votre site reste en ligne jusqu’à la fin du mois payé. La formule annuelle se résilie aussi à tout moment, avec effet à la fin de l’année payée.')] },
      { id: 'fin', genre: 'bouton', bouton: { texte: 'Créer mon site gratuitement', lien: '#inscription' } }
    ]
  };
  const cfg = nettoyerConfig({ pages: [accueil] });
  // traductions EN / RU reprises du dictionnaire de l'accueil (le titre en couleur est en 3 morceaux)
  const p = cfg.pages[0];
  for (const [l, i] of [['en', 0], ['ru', 1]]) {
    const textes = textesPage(p), out = {};
    for (const [k, v] of Object.entries(textes)) {
      if (k === 'sections.0.titre') { out[k] = tr('Votre site web mobile en 5 minutes,', i) + ' *' + tr('pour 1,99 €/mois.', i) + '* ' + tr('Sans engagement.', i); continue; }
      if (k === 'sections.3.texte') { out[k] = v.split('\n\n').map(x => tr(x, i)).join('\n\n'); continue; }
      if (k === 'titre') { out[k] = i === 0 ? 'Home' : 'Главная'; continue; }
      out[k] = tr(v, i);
    }
    cfg.traductions[l][p.id] = { page: appliquerTextes(p, out), source: empreinte(JSON.stringify(textes)), le: new Date().toISOString() };
  }
  // titres et descriptions Google EN / RU : ceux de l'accueil historique
  cfg.traductions.en.accueil.page.seo = { titre: 'Your mobile website in 5 minutes, €1.99/month, no commitment | qrbc', description: 'Create your mobile website from your smartphone: call, WhatsApp, Google reviews, QR code and business cards. 1-month free trial, no card needed.' };
  cfg.traductions.ru.accueil.page.seo = { titre: 'Мобильный сайт за 5 минут, 1,99 € в месяц без обязательств | qrbc', description: 'Создайте мобильный сайт со смартфона: звонок, WhatsApp, отзывы Google, QR-код и визитки. 1 месяц бесплатно, без карты.' };
  return cfg;
}
