/* =========================================================
   commun.js — rendu de la page + outils GitHub / chiffrement
   Utilisé par index.html (public), admin.html (Alex), setup.html
   ========================================================= */

/* ---------- Thèmes prêts à l'emploi ---------- */
const THEMES = {
  sable:   { nom: 'Sable',    fond: '#f5f1ea', fond2: '#e9e0d2', texte: '#2b2620', accent: '#2b2620' },
  nuit:    { nom: 'Nuit',     fond: '#0f1115', fond2: '#1d2230', texte: '#f3f4f6', accent: '#e6c07b' },
  riviera: { nom: 'Riviera',  fond: '#e8f4f8', fond2: '#bfe0ec', texte: '#0d3b4f', accent: '#0d6e8c' },
  olive:   { nom: 'Olive',    fond: '#f2f2e6', fond2: '#dfe3c8', texte: '#2f3a1f', accent: '#5b6b2f' },
  corail:  { nom: 'Corail',   fond: '#fff4ef', fond2: '#ffd9cc', texte: '#4a1f14', accent: '#e0603f' },
  luxe:    { nom: 'Luxe',     fond: '#111111', fond2: '#111111', texte: '#f5efe0', accent: '#c9a45c' },
  blanc:   { nom: 'Blanc',    fond: '#ffffff', fond2: '#ffffff', texte: '#111111', accent: '#111111' }
};

const FONTS = {
  moderne: { nom: 'Moderne',  css: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  elegant: { nom: 'Élégante', css: '"Didot", "Bodoni MT", "Playfair Display", Georgia, "Times New Roman", serif' },
  classique:{ nom: 'Classique', css: 'Georgia, "Iowan Old Style", "Palatino Linotype", serif' },
  arrondi: { nom: 'Arrondie', css: 'ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", system-ui, sans-serif' },
  mono:    { nom: 'Technique', css: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' }
};

const TYPES = {
  avis:     { nom: 'Avis Google',  aide: 'Lien « Demander des avis » de la fiche Google, ou son Place ID' },
  whatsapp: { nom: 'WhatsApp',     aide: 'Numéro, ex. 06 12 34 56 78 ou +33 6 12 34 56 78' },
  tel:      { nom: 'Téléphone',    aide: 'Numéro, ex. 04 93 00 00 00' },
  sms:      { nom: 'SMS',          aide: 'Numéro mobile' },
  email:    { nom: 'E-mail',       aide: 'Adresse e-mail' },
  maps:     { nom: 'Itinéraire',   aide: 'Adresse ou lien Maps' },
  lien:     { nom: 'Lien web',     aide: 'Adresse du site, Instagram, menu…' }
};

/* Réseaux sociaux : icônes rondes (bibliothèque libre Simple Icons, chargée depuis jsDelivr) */
const ICONES_CDN = 'https://cdn.jsdelivr.net/npm/simple-icons@16/icons/';
const GLOBE_SVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.8 3 2.8 16 0 19M12 2.5c-2.8 3-2.8 16 0 19"/></svg>');
function svgIcone(corps) {
  return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + corps + '</svg>');
}
const ICONES_ACTIONS = {
  tel:   svgIcone('<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" fill="#000"/>'),
  sms:   svgIcone('<path d="M4 4h16v12H8l-4 4z" fill="#000"/>'),
  email: svgIcone('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  lien:  svgIcone('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>')
};
const COULEURS_ACTIONS = { whatsapp: '#25D366', avis: '#4285F4', maps: '#34A853', tel: '#0A84FF', sms: '#34C759', email: '#EA4335', lien: '#4B5563' };
function iconeAction(type) {
  if (type === 'whatsapp') return ICONES_CDN + 'whatsapp.svg';
  if (type === 'avis') return ICONES_CDN + 'google.svg';
  if (type === 'maps') return ICONES_CDN + 'googlemaps.svg';
  return ICONES_ACTIONS[type] || ICONES_ACTIONS.lien;
}

const RESEAUX = {
  facebook:  { nom: 'Facebook',  coul: '#1877F2', aide: 'Nom de la page ou lien',     url: v => 'https://www.facebook.com/' + v },
  instagram: { nom: 'Instagram', coul: '#E4405F', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://www.instagram.com/' + v },
  x:         { nom: 'X',         coul: '#000000', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://x.com/' + v },
  snapchat:  { nom: 'Snapchat',  coul: '#FFFC00', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://www.snapchat.com/add/' + v },
  tiktok:    { nom: 'TikTok',    coul: '#000000', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://www.tiktok.com/@' + v },
  site:      { nom: 'Site web',  coul: '#4B5563', aide: 'Adresse du site',            url: v => 'https://' + v, icone: GLOBE_SVG },
  youtube:   { nom: 'YouTube',   coul: '#FF0000', aide: 'Nom de la chaîne ou lien',   url: v => 'https://www.youtube.com/@' + v },
  telegram:  { nom: 'Telegram',  coul: '#26A5E4', aide: 'Nom d’utilisateur, lien ou numéro',  url: v => 'https://t.me/' + v },
  tripadvisor:{ nom: 'Tripadvisor', coul: '#34E0A1', aide: 'Lien de la fiche',        url: v => 'https://' + v },
  email:     { nom: 'E-mail',    coul: '#EA4335', aide: 'Adresse e-mail',             url: v => 'mailto:' + v, icone: ICONES_ACTIONS.email }
};
const RESEAUX_ACTIFS_DEFAUT = ['facebook', 'instagram', 'x', 'snapchat', 'tiktok', 'site'];

function iconeReseau(id) { return (RESEAUX[id] && RESEAUX[id].icone) || (ICONES_CDN + id + '.svg'); }

function lienReseau(id, valeur) {
  let v = String(valeur || '').trim();
  if (!v || !RESEAUX[id]) return '#';
  if (id === 'email') return lienSur('mailto:' + v.replace(/^mailto:/i, ''));
  if (estURL(v)) return lienSur(v);
  if (/^(www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(v) && v.includes('.') && id !== 'site') return lienSur('https://' + v);
  if (id === 'site' || id === 'tripadvisor') return lienSur('https://' + v);
  // Telegram par numéro de téléphone : t.me/+33…  (06… est compris comme un numéro français)
  if (id === 'telegram' && /^\+?[\d\s.()-]{8,}$/.test(v)) {
    let n = v.replace(/\D/g, '');
    if (!v.trim().startsWith('+') && /^0\d{9}$/.test(n)) n = '33' + n.slice(1);
    return lienSur('https://t.me/+' + n);
  }
  v = v.replace(/^@/, '').replace(/[^\w.\-]/g, '');
  return lienSur(RESEAUX[id].url(v));
}

/* Complète une configuration ancienne : liste des réseaux + bloc d'icônes dans les boutons */
function normaliser(cfg) {
  const liste = Array.isArray(cfg.reseaux) ? cfg.reseaux.filter(r => r && RESEAUX[r.id]) : [];
  Object.keys(RESEAUX).forEach(id => {
    if (!liste.some(r => r.id === id)) liste.push({ id, actif: RESEAUX_ACTIFS_DEFAUT.includes(id), valeur: '' });
  });
  cfg.reseaux = liste;
  if (!Array.isArray(cfg.boutons)) cfg.boutons = [];
  if (!cfg.boutons.some(b => b && b.type === 'reseaux')) cfg.boutons.push({ type: 'reseaux' });
  const h = cfg.home && typeof cfg.home === 'object' ? cfg.home : {};
  cfg.home = Object.assign({ actif: false, arrivee: 'contact', boutonContact: 'Contact', lienTexte: 'Découvrir l’entreprise' }, h);
  if (!Array.isArray(cfg.home.articles) || !cfg.home.articles.length)
    cfg.home.articles = [{ titre: 'Qui sommes-nous ?', texte: 'Présentez votre entreprise en quelques lignes.', image: '', style: 'photo' }];
  cfg.home.articles = cfg.home.articles.slice(0, HOME_MAX_ARTICLES);
  return cfg;
}

const HOME_MAX_ARTICLES = 10;
const HOME_STYLES = { photo: 'Photo plein écran', image: 'Image + texte', texte: 'Texte seul' };

function homeVisible(cfg) {
  return !!(cfg.home && cfg.home.actif && (cfg.home.articles || []).some(a => a && !a.masque && (a.titre || a.texte)));
}

/* Modèles de disposition */
const DISPOSITIONS = {
  centre:  { nom: 'Centré' },
  haut:    { nom: 'Boutons en haut' },
  bas:     { nom: 'Boutons en bas' },
  gauche:  { nom: 'Barre à gauche', ronds: true },
  droite:  { nom: 'Barre à droite', ronds: true },
  carte:   { nom: 'Carte de visite' },
  affiche: { nom: 'Affiche' },
  hautbas: { nom: 'Haut + bas', ronds: true, scinde: true },
  cotes:   { nom: 'Gauche + droite', ronds: true, scinde: true }
};

const CONFIG_DEFAUT = {
  titre: 'Nom de l’établissement',
  sousTitre: 'Merci de votre visite !',
  logo: '',
  pied: '',
  design: {
    theme: 'sable', fond: '#f5f1ea', fond2: '#e9e0d2', texte: '#2b2620', accent: '#2b2620',
    imageFond: '', voile: 40, police: 'moderne', forme: 'arrondi', style: 'plein',
    ombre: true, carte: false, logoRond: false, nomsReseaux: false, reseauxTheme: false, tousRonds: false, disposition: 'centre',
    installer: true
  },
  boutons: []
};

/* ---------- Utilitaires ---------- */
function fusion(base, extra) {
  const out = JSON.parse(JSON.stringify(base));
  if (!extra || typeof extra !== 'object') return out;
  for (const k of Object.keys(extra)) {
    if (extra[k] && typeof extra[k] === 'object' && !Array.isArray(extra[k]) && out[k] && typeof out[k] === 'object') {
      out[k] = Object.assign({}, out[k], extra[k]);
    } else out[k] = extra[k];
  }
  return out;
}

function chiffres(s) { return String(s || '').replace(/[^\d+]/g, ''); }

function numeroInternational(s) {
  let n = chiffres(s);
  if (n.startsWith('+')) return n.slice(1);
  if (n.startsWith('00')) return n.slice(2);
  if (n.startsWith('0') && n.length === 10) return '33' + n.slice(1); // numéro français
  return n;
}

function estURL(s) { return /^https?:\/\//i.test(String(s || '').trim()); }

function lienSur(url) {
  return /^(https?:|tel:|mailto:|sms:)/i.test(url) ? url : '#';
}

/* Construit le lien réel d'un bouton à partir de son type */
function construireLien(b) {
  const v = String(b.valeur || '').trim();
  const msg = String(b.message || '').trim();
  if (!v) return '#';
  let url;
  switch (b.type) {
    case 'avis':
      url = estURL(v) ? v : 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(v);
      break;
    case 'whatsapp':
      url = 'https://wa.me/' + numeroInternational(v) + (msg ? '?text=' + encodeURIComponent(msg) : '');
      break;
    case 'tel':
      url = 'tel:' + (chiffres(v).startsWith('+') ? chiffres(v) : '+' + numeroInternational(v));
      break;
    case 'sms':
      url = 'sms:' + (chiffres(v).startsWith('+') ? chiffres(v) : '+' + numeroInternational(v)) + (msg ? '?body=' + encodeURIComponent(msg) : '');
      break;
    case 'email':
      url = 'mailto:' + v + (msg ? '?body=' + encodeURIComponent(msg) : '');
      break;
    case 'maps':
      url = estURL(v) ? v : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v);
      break;
    default:
      url = estURL(v) ? v : 'https://' + v;
  }
  return lienSur(url);
}

function hexVersRgb(h) {
  const m = String(h || '').replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16));
}

/* Texte blanc ou noir selon la couleur de fond du bouton */
function texteContraste(hex) {
  const rgb = hexVersRgb(hex);
  if (!rgb) return '#ffffff';
  const [r, g, b] = rgb.map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.45 ? '#111111' : '#ffffff';
}

/* Icône blanche sur les couleurs de marque, noire seulement sur fond très clair (Snapchat, blanc) */
function couleurIcone(hex) {
  const rgb = hexVersRgb(hex);
  if (!rgb) return '#ffffff';
  const [r, g, b] = rgb.map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 0.7 ? '#111111' : '#ffffff';
}

/* ---------- Styles de la page (injectés une fois) ---------- */
const CSS_PAGE = `
.qp{--fond:#f5f1ea;--fond2:#e9e0d2;--texte:#2b2620;--accent:#2b2620;--police:system-ui;--rayon:14px;
  min-height:100%;width:100%;display:flex;align-items:center;justify-content:center;
  padding:40px 18px;box-sizing:border-box;font-family:var(--police);color:var(--texte);
  background:linear-gradient(165deg,var(--fond),var(--fond2));background-size:cover;background-position:center;position:relative}
.qp *{box-sizing:border-box}
.qp-voile{position:absolute;inset:0;pointer-events:none}
.qp-credit{position:absolute;left:50%;transform:translateX(-50%);bottom:calc(6px + env(safe-area-inset-bottom));z-index:3;
  font:500 .62rem/1.2 system-ui,-apple-system,sans-serif;letter-spacing:.02em;color:inherit;opacity:.42;text-decoration:none;white-space:nowrap}
.qp-credit:hover,.qp-credit:focus-visible{opacity:.8;text-decoration:underline}
.qp-haut-droite{position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;z-index:5;display:flex;gap:8px;align-items:center}
.qp .qp-haut-droite .qp-appli{position:static}
.qp-appli.qp-appli-court{padding:9px 11px}
.qp-avec-langues .qp-lien-home{max-width:calc(100% - 172px);overflow:hidden;text-overflow:ellipsis}
.qp-langsel{position:relative;flex:none;font:600 .88rem/1.2 system-ui,-apple-system,sans-serif}
.qp-langsel>button{display:inline-flex;align-items:center;gap:5px;margin:0;padding:9px 12px;border:0;border-radius:999px;cursor:pointer;
  background:rgba(0,0,0,.38);color:#fff;font:inherit;letter-spacing:.03em;white-space:nowrap;
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 14px rgba(0,0,0,.18)}
.qp-langsel>button svg{width:15px;height:15px;flex:none}
.qp-langsel>button .fl{font-size:.7em;opacity:.8;margin-left:1px}
.qh-barre .qp-langsel>button{background:color-mix(in srgb,currentColor 13%,transparent);color:inherit;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;padding:8px 10px}
.qp-langsel ul{position:absolute;right:0;top:calc(100% + 6px);min-width:160px;margin:0;padding:6px;list-style:none;background:#fff;color:#1b1b1b;
  border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25);display:none;z-index:30}
.qp-langsel.ouvert ul{display:block}
.qp-langsel li a{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:10px;color:inherit;text-decoration:none;font-weight:500}
.qp-langsel li a:hover,.qp-langsel li a:focus-visible{background:#f1f1f1}
.qp-langsel li a.actif{font-weight:700}
.qp-langsel li a small{opacity:.55;font-weight:600}
.qp-contenu{position:relative;width:100%;max-width:420px;text-align:center}
.qp-carte .qp-contenu{background:color-mix(in srgb,var(--fond) 88%,transparent);padding:32px 22px 24px;border-radius:24px;
  box-shadow:0 10px 40px rgba(0,0,0,.18);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.qp-logo{display:block;margin:0 auto 18px;max-width:140px;max-height:140px;object-fit:contain}
.qp-logo-rond{width:110px;height:110px;max-width:none;border-radius:50%;object-fit:cover;box-shadow:0 4px 18px rgba(0,0,0,.15)}
.qp-titre{font-size:1.75rem;line-height:1.2;margin:0 0 8px;font-weight:700;letter-spacing:-.01em}
.qp-sous{margin:0 0 30px;opacity:.78;font-size:1.02rem;line-height:1.45}
.qp-btns{display:flex;flex-direction:column;gap:14px}
.qp-btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:58px;padding:16px 20px;
  border-radius:var(--rayon);text-decoration:none;font-size:1.06rem;font-weight:600;font-family:inherit;
  transition:transform .12s ease, box-shadow .12s ease;-webkit-tap-highlight-color:transparent;border:2px solid transparent}
.qp-btn:active{transform:scale(.97)}
.qp-ombre .qp-btn{box-shadow:0 6px 16px rgba(0,0,0,.14)}
.qp-ico{font-size:1.2em;line-height:1}
.qp-rs{display:grid;grid-template-columns:repeat(3,1fr);gap:16px 10px;justify-items:center;padding:8px 0}
.qp-rs-item{display:flex;flex-direction:column;align-items:center;gap:6px;text-decoration:none;color:inherit;
  font-size:.78rem;font-weight:600;-webkit-tap-highlight-color:transparent;transition:transform .12s}
.qp-rs-item:active{transform:scale(.92)}
.qp-rs-rond{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.qp-ombre .qp-rs-rond{box-shadow:0 6px 16px rgba(0,0,0,.18)}
.qp-rs-ico{width:28px;height:28px;-webkit-mask:var(--ico) center/contain no-repeat;mask:var(--ico) center/contain no-repeat}
.qp-rs-item.vide{opacity:.4}
.qp-entete-txt{min-width:0}
/* --- Dispositions --- */
.qp-dispo-haut,.qp-dispo-bas,.qp-dispo-gauche,.qp-dispo-droite{align-items:stretch}
.qp-dispo-haut .qp-contenu,.qp-dispo-bas .qp-contenu{display:flex;flex-direction:column}
.qp-dispo-haut .qp-btns{order:-1;margin-bottom:24px}
.qp-dispo-haut .qp-entete{margin:auto 0}
.qp-dispo-bas .qp-entete{margin:auto 0 30px}
.qp-dispo-hautbas{align-items:stretch}
.qp-dispo-hautbas .qp-contenu{display:flex;flex-direction:column}
.qp-dispo-hautbas .qp-zone-a{order:-1}
.qp-dispo-hautbas .qp-entete{margin:auto 0}
.qp-dispo-hautbas .qp-rs{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 22px}
.qp .qp-rs-libre{display:flex;flex-wrap:wrap;justify-content:center;gap:14px 22px}
.qp-dispo-hautbas .qp-zone-b{margin-top:24px}
.qp-dispo-cotes{align-items:stretch}
.qp-dispo-cotes .qp-contenu{display:grid;grid-template-columns:66px 1fr 66px;grid-template-areas:"a entete b" "a pied b";
  grid-template-rows:1fr auto;column-gap:10px;max-width:560px}
.qp-dispo-cotes .qp-zone-a{grid-area:a;align-self:center}
.qp-dispo-cotes .qp-zone-b{grid-area:b;align-self:center}
.qp-dispo-cotes .qp-entete{grid-area:entete;align-self:center}
.qp-lien-home{position:absolute;top:calc(14px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:4;
  padding:9px 18px;border-radius:999px;background:rgba(0,0,0,.38);color:#fff;font-weight:600;font-size:.88rem;text-decoration:none;
  white-space:nowrap;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 14px rgba(0,0,0,.18)}
.qp-avec-home{padding-top:76px}
.qp-avec-appli{padding-top:76px}
.qp .qp-appli{position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;left:auto;bottom:auto;z-index:4;
  display:inline-flex;align-items:center;gap:6px;width:auto;height:auto;margin:0;padding:9px 14px;border:0;border-radius:999px;cursor:pointer;
  background:rgba(0,0,0,.38);color:#fff;font:600 .88rem/1.2 var(--police);white-space:nowrap;
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 4px 14px rgba(0,0,0,.18)}
.qp .qp-appli svg{width:16px;height:16px;flex:none}
.qp-avec-appli .qp-lien-home{left:14px;transform:none}
.qp-aide-appli{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center;font-family:system-ui,sans-serif}
.qp-aide-appli>div{background:#fff;color:#1b1b1b;width:min(100%,420px);border-radius:20px 20px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom));box-sizing:border-box}
.qp-aide-appli b{display:block;font-size:1.1rem;margin-bottom:8px}
.qp-aide-appli p{margin:0 0 10px;line-height:1.5}
.qp-aide-appli button{margin-top:6px;width:100%;padding:12px;border:0;border-radius:12px;background:#1b1b1b;color:#fff;font:600 1rem system-ui,sans-serif}
/* ---------- Page Home : pancartes plein écran ---------- */
.qh{position:relative;width:100%;height:100%;overflow:hidden;font-family:var(--police);color:var(--texte);background:var(--fond)}
.qh *{box-sizing:border-box}
.qh-barre{position:absolute;top:0;left:0;right:0;z-index:5;display:flex;align-items:center;gap:10px;
  padding:10px 14px;padding-top:calc(10px + env(safe-area-inset-top));
  background:color-mix(in srgb,var(--fond) 76%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
  border-bottom:1px solid color-mix(in srgb,var(--texte) 12%,transparent)}
.qh-logo{width:38px;height:38px;object-fit:contain;flex-shrink:0}
.qh-logo.rond{border-radius:50%;object-fit:cover;background:#fff}
.qh-nom{flex:1;min-width:0;font-weight:700;font-size:1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.qh-contact{flex-shrink:0;padding:9px 16px;border-radius:999px;font-weight:700;font-size:.9rem;text-decoration:none}
.qh-defile{height:100%;overflow-y:auto;scroll-snap-type:y mandatory;overscroll-behavior-y:contain;scrollbar-width:none;outline:none}
.qh-defile::-webkit-scrollbar{display:none}
.qh-panneau{position:relative;height:100%;min-height:100%;scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden;
  display:flex;flex-direction:column;justify-content:flex-end;padding:88px 30px 70px 26px}
.qh-p-photo{color:#fff;background:#111 center/cover no-repeat}
.qh-photo-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.qh-img img{display:block;width:100%;height:100%;object-fit:cover}
.qh-p-photo::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.05) 35%,rgba(0,0,0,.78) 100%)}
.qh-p-texte{justify-content:center;background:linear-gradient(165deg,var(--fond),var(--fond2))}
.qh-p-image{padding:0;justify-content:flex-start;background:var(--fond)}
.qh-p-image .qh-img{height:46%;flex-shrink:0;background:#111 center/cover no-repeat;margin-top:58px}
.qh-p-image .qh-corps{padding:28px 30px 60px 26px;flex:1;display:flex;flex-direction:column;justify-content:center}
.qh-corps{position:relative;z-index:1;max-width:620px}
.qh-num{font-size:.78rem;letter-spacing:.18em;font-weight:700;opacity:.7;margin-bottom:12px}
.qh-trait{width:46px;height:4px;border-radius:2px;background:var(--accent);margin-bottom:18px}
.qh-titre{font-size:2.15rem;line-height:1.08;margin:0 0 14px;font-weight:800;letter-spacing:-.01em}
.qh-p-texte .qh-titre{font-size:2.5rem}
.qh-texte{font-size:1.04rem;line-height:1.58;margin:0;opacity:.92;white-space:pre-line}
.qh-points{position:absolute;right:9px;top:50%;transform:translateY(-50%);z-index:5;display:flex;flex-direction:column;align-items:center;gap:8px}
.qh-point{width:7px;height:7px;border-radius:4px;border:0;padding:0;cursor:pointer;background:#fff;opacity:.5;
  box-shadow:0 0 0 1px rgba(0,0,0,.25);transition:height .25s,opacity .25s}
.qh-point.actif{height:22px;opacity:1}
.qh-indice{position:absolute;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2;
  display:flex;flex-direction:column;align-items:center;font-size:.75rem;font-weight:600;letter-spacing:.08em;opacity:.8;animation:qh-rebond 1.8s ease-in-out infinite}
.qh-indice::after{content:"";width:12px;height:12px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);margin-top:2px}
@keyframes qh-rebond{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,6px)}}
@media (prefers-reduced-motion:reduce){.qh-indice{animation:none}}
.qp-dispo-cotes .qp-pied{grid-area:pied}
.qp-dispo-cotes .qp-rs{grid-template-columns:1fr;gap:14px}
.qp-dispo-cotes .qp-rs-rond{width:54px;height:54px}
.qp-dispo-cotes .qp-titre{font-size:1.35rem}
.qp-dispo-cotes .qp-logo-rond{width:90px;height:90px}
.qp-dispo-bas .qp-pied{margin-top:18px}
.qp-dispo-gauche .qp-contenu,.qp-dispo-droite .qp-contenu{display:grid;grid-template-columns:78px 1fr;
  grid-template-areas:"zone entete" "zone pied";grid-template-rows:1fr auto;column-gap:14px;max-width:560px}
.qp-dispo-droite .qp-contenu{grid-template-columns:1fr 78px;grid-template-areas:"entete zone" "pied zone"}
.qp-dispo-gauche .qp-btns,.qp-dispo-droite .qp-btns{grid-area:zone;align-self:center}
.qp-dispo-gauche .qp-entete,.qp-dispo-droite .qp-entete{grid-area:entete;align-self:center}
.qp-dispo-gauche .qp-pied,.qp-dispo-droite .qp-pied{grid-area:pied}
.qp-dispo-gauche .qp-rs,.qp-dispo-droite .qp-rs{grid-template-columns:1fr;gap:14px}
.qp-dispo-gauche .qp-rs-rond,.qp-dispo-droite .qp-rs-rond{width:56px;height:56px}
.qp-dispo-gauche .qp-titre,.qp-dispo-droite .qp-titre{font-size:1.5rem}
.qp-dispo-carte .qp-contenu{text-align:left}
.qp-dispo-carte .qp-entete{display:flex;align-items:center;gap:16px;margin-bottom:26px}
.qp-dispo-carte .qp-logo{margin:0;max-width:86px;max-height:86px;flex-shrink:0}
.qp-dispo-carte .qp-logo-rond{width:86px;height:86px}
.qp-dispo-carte .qp-titre{font-size:1.4rem;margin-bottom:4px}
.qp-dispo-carte .qp-sous{margin:0;font-size:.95rem}
.qp-dispo-carte .qp-rs{grid-template-columns:repeat(4,1fr)}
.qp-dispo-carte .qp-rs-rond{width:56px;height:56px}
.qp-dispo-affiche{align-items:flex-end}
.qp-dispo-affiche .qp-contenu{text-align:left;padding-bottom:12px}
.qp-dispo-affiche .qp-logo{margin:0 0 16px;max-width:90px;max-height:90px}
.qp-dispo-affiche .qp-logo-rond{width:80px;height:80px}
.qp-dispo-affiche .qp-titre{font-size:2.4rem;line-height:1.05;margin-bottom:10px}
.qp-dispo-affiche .qp-rs{grid-template-columns:repeat(4,56px);justify-content:start;gap:14px}
.qp-dispo-affiche .qp-rs-rond{width:56px;height:56px}
.qp-pied{margin-top:28px;font-size:.85rem;opacity:.65;line-height:1.5;white-space:pre-line}
.qp-vide{opacity:.55;font-size:.95rem;padding:20px 0}
`;

function injecterCSS(doc) {
  doc = doc || document;
  const ancien = doc.getElementById('qp-css');
  // Une page enregistrée avant une mise à jour garde l'ancienne feuille de style : on la remplace
  if (ancien) { if (ancien.textContent !== CSS_PAGE) ancien.textContent = CSS_PAGE; return; }
  const s = doc.createElement('style');
  s.id = 'qp-css';
  s.textContent = CSS_PAGE;
  doc.head.appendChild(s);
}

function creerRond(doc, o) {
  const a = doc.createElement('a');
  a.className = 'qp-rs-item' + (o.vide ? ' vide' : '');
  a.href = o.href;
  a.setAttribute('aria-label', o.nom);
  if (/^https?:/i.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; }
  if (o.apercu) a.addEventListener('click', e => e.preventDefault());
  const rond = doc.createElement('span');
  rond.className = 'qp-rs-rond';
  rond.style.background = o.fond;
  const ico = doc.createElement('span');
  ico.className = 'qp-rs-ico';
  ico.style.setProperty('--ico', 'url("' + o.icone + '")');
  ico.style.background = couleurIcone(o.fond);
  rond.appendChild(ico);
  a.appendChild(rond);
  if (o.nomVisible) { const n = doc.createElement('span'); n.textContent = o.nom; a.appendChild(n); }
  return a;
}

/* ---------- Rendu de la page ----------
   cfg     : configuration
   racine  : élément conteneur
   opts.resoudre(chemin) : renvoie l'URL d'une image (aperçu local)
-------------------------------------- */
function rendrePage(cfgBrut, racine, opts) {
  opts = opts || {};
  const cfg = fusion(CONFIG_DEFAUT, cfgBrut);
  const d = cfg.design;
  const res = opts.resoudre || (x => x);
  const doc = racine.ownerDocument;
  injecterCSS(doc);

  racine.innerHTML = '';
  const page = doc.createElement('div');
  const dispo = DISPOSITIONS[d.disposition] ? d.disposition : 'centre';
  const ronds = d.tousRonds || !!DISPOSITIONS[dispo].ronds;
  page.className = 'qp qp-dispo-' + dispo + (d.carte ? ' qp-carte' : '') + (d.ombre ? ' qp-ombre' : '');
  const p = page.style;
  p.setProperty('--fond', d.fond);
  p.setProperty('--fond2', d.fond2 || d.fond);
  p.setProperty('--texte', d.texte);
  p.setProperty('--accent', d.accent);
  p.setProperty('--police', (FONTS[d.police] || FONTS.moderne).css);
  p.setProperty('--rayon', { carre: '6px', arrondi: '14px', pilule: '999px' }[d.forme] || '14px');

  if (d.imageFond) {
    page.style.backgroundImage = 'url("' + res(d.imageFond).replace(/"/g, '%22') + '")';
    const voile = doc.createElement('div');
    voile.className = 'qp-voile';
    const a = Math.max(0, Math.min(90, Number(d.voile) || 0)) / 100;
    voile.style.background = 'rgba(0,0,0,' + a + ')';
    page.appendChild(voile);
  }

  const c = doc.createElement('div');
  c.className = 'qp-contenu';

  const entete = doc.createElement('div');
  entete.className = 'qp-entete';
  const texteEntete = doc.createElement('div');
  texteEntete.className = 'qp-entete-txt';
  if (cfg.logo) {
    const img = doc.createElement('img');
    img.className = 'qp-logo' + (d.logoRond ? ' qp-logo-rond' : '');
    img.src = res(cfg.logo);
    img.alt = cfg.titre || '';
    entete.appendChild(img);
  }
  if (cfg.titre) {
    const h = doc.createElement('h1');
    h.className = 'qp-titre';
    h.textContent = cfg.titre;
    texteEntete.appendChild(h);
  }
  if (cfg.sousTitre) {
    const s = doc.createElement('p');
    s.className = 'qp-sous';
    s.textContent = cfg.sousTitre;
    texteEntete.appendChild(s);
  }

  entete.appendChild(texteEntete);
  c.appendChild(entete);

  const zone = doc.createElement('div');
  zone.className = 'qp-btns';
  normaliser(cfg);
  // Un bouton sans texte reste affiché : il devient une icône ronde (même dans les dispositions pleine largeur)
  const visibles = (cfg.boutons || []).filter(b => b && !b.masque);
  let nbAffiches = 0;
  let grille = null; // grille d'icônes rondes en cours
  const nouvelleGrille = () => { grille = doc.createElement('div'); grille.className = 'qp-rs'; zone.appendChild(grille); };

  visibles.forEach(b => {
    if (b.type === 'reseaux') {
      const items = cfg.reseaux.filter(r => r.actif && (opts.apercu || String(r.valeur || '').trim()));
      if (!items.length) return;
      if (!ronds || !grille) nouvelleGrille();
      items.forEach(r => {
        const R = RESEAUX[r.id];
        grille.appendChild(creerRond(doc, {
          href: lienReseau(r.id, r.valeur), nom: R.nom, icone: iconeReseau(r.id),
          fond: d.reseauxTheme ? d.accent : R.coul, vide: !String(r.valeur || '').trim(),
          nomVisible: d.nomsReseaux, apercu: opts.apercu
        }));
      });
      if (!ronds) grille = null;
      nbAffiches++;
      return;
    }
    const sansTexte = !String(b.texte || '').trim();
    if (ronds || sansTexte) {
      if (!opts.apercu && !String(b.valeur || '').trim()) return; // pas de lien : pas d'icône
      nbAffiches++;
      if (!grille) { nouvelleGrille(); if (!ronds) grille.classList.add('qp-rs-libre'); }
      grille.appendChild(creerRond(doc, {
        href: construireLien(b), nom: b.texte || (TYPES[b.type] || TYPES.lien).nom, icone: iconeAction(b.type),
        fond: b.couleur || (d.reseauxTheme ? d.accent : (COULEURS_ACTIONS[b.type] || d.accent)),
        vide: !String(b.valeur || '').trim(), nomVisible: d.nomsReseaux, apercu: opts.apercu
      }));
      return;
    }
    nbAffiches++;
    grille = null;                                  // un bouton pleine largeur coupe la rangée d'icônes

    const a = doc.createElement('a');
    a.className = 'qp-btn';
    a.href = construireLien(b);
    if (/^https?:/i.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; }
    const coul = b.couleur || d.accent;
    if (d.style === 'contour') {
      a.style.background = 'transparent';
      a.style.borderColor = coul;
      a.style.color = d.imageFond ? '#ffffff' : coul;
    } else if (d.style === 'doux') {
      a.style.background = 'color-mix(in srgb,' + coul + ' 16%, transparent)';
      a.style.color = d.imageFond ? '#ffffff' : coul;
    } else {
      a.style.background = coul;
      a.style.color = texteContraste(coul);
    }
    if (b.icone) {
      const i = doc.createElement('span');
      i.className = 'qp-ico';
      i.textContent = b.icone;
      a.appendChild(i);
    }
    const t = doc.createElement('span');
    t.textContent = b.texte;
    a.appendChild(t);
    if (opts.apercu) a.addEventListener('click', e => e.preventDefault());
    zone.appendChild(a);
  });
  if (!nbAffiches && opts.apercu) {
    const v = doc.createElement('div');
    v.className = 'qp-vide';
    v.textContent = 'Aucun bouton pour l’instant';
    zone.appendChild(v);
  }
  if (DISPOSITIONS[dispo].scinde) {
    // Répartit les icônes en deux groupes : première moitié / seconde moitié (ordre des flèches)
    const items = [...zone.querySelectorAll('.qp-rs-item')];
    const moitie = Math.ceil(items.length / 2);
    zone.innerHTML = '';
    zone.classList.add('qp-zone-a');
    const zoneB = doc.createElement('div');
    zoneB.className = 'qp-btns qp-zone-b';
    [[zone, items.slice(0, moitie)], [zoneB, items.slice(moitie)]].forEach(([z, lot]) => {
      const g = doc.createElement('div');
      g.className = 'qp-rs';
      lot.forEach(it => g.appendChild(it));
      z.appendChild(g);
    });
    if (!items.length && opts.apercu) zone.appendChild(Object.assign(doc.createElement('div'), { className: 'qp-vide', textContent: 'Aucun bouton pour l’instant' }));
    c.appendChild(zone);
    c.appendChild(zoneB);
  } else c.appendChild(zone);

  if (cfg.pied) {
    const f = doc.createElement('p');
    f.className = 'qp-pied';
    f.textContent = cfg.pied;
    c.appendChild(f);
  }

  page.appendChild(c);
  if (opts.lienHome) {
    const l = doc.createElement('a');
    l.className = 'qp-lien-home';
    l.href = opts.hrefHome || '#accueil';
    l.textContent = cfg.home.lienTexte || 'Découvrir l’entreprise';
    if (opts.surHome) l.addEventListener('click', e => { e.preventDefault(); opts.surHome(); });
    page.appendChild(l);
    page.classList.add('qp-avec-home');
  }
  // En haut à droite : « Installer l'appli » (pages qrbc, pas une fois installée) puis le choix de la langue
  const langues = opts.apercu ? null : selecteurLangues(doc, false);
  const hautDroite = doc.createElement('div');
  hautDroite.className = 'qp-haut-droite';
  if (d.installer !== false && (opts.apercu || (pageInstallable() && !appliInstallee()))) {
    const b = doc.createElement('button');
    b.type = 'button';
    b.className = 'qp-appli';
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 7v7M9 11l3 3 3-3"/></svg>';
    const TA = textesAppli(doc);
    if (langues) b.classList.add('qp-appli-court');      // avec le choix de langue : icône seule, pour la place
    else b.appendChild(doc.createTextNode(TA.bouton));
    b.title = TA.titre;
    b.setAttribute('aria-label', TA.titre);
    if (!opts.apercu) b.addEventListener('click', () => installerAppli(doc));
    hautDroite.appendChild(b);
    page.classList.add('qp-avec-appli');
  }
  if (langues) { hautDroite.appendChild(langues); page.classList.add('qp-avec-appli', 'qp-avec-langues'); }
  if (hautDroite.childNodes.length) page.appendChild(hautDroite);
  page.appendChild(creditQrbc(doc, opts.apercu));
  racine.appendChild(page);
  return cfg;
}

/* ---------- Page installable comme une appli (PWA) ---------- */
let QP_INVITE_INSTALL = null;
function pageInstallable() { return typeof location !== 'undefined' && /\.qrbc\.app$/i.test(location.hostname) && !/^\/(admin|app)\b/.test(location.pathname); }
function appliInstallee() {
  try { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; }
}
if (typeof window !== 'undefined' && pageInstallable()) {
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); QP_INVITE_INSTALL = e; });
  window.addEventListener('appinstalled', () => { document.querySelectorAll('.qp-appli').forEach(b => b.remove()); });
}
/* Textes de l'installation, dans la langue de la page (version traduite : langue de la traduction) */
function textesAppli(doc) {
  const b = t => '<b style="display:inline">' + t + '</b>';
  const T = {
    fr: { bouton: 'Installer', titre: 'Installer l’appli',
      ios: ['Touchez le bouton ' + b('Partager') + ' (le carré avec une flèche vers le haut) dans la barre de Safari.', 'Puis choisissez ' + b('« Sur l’écran d’accueil »') + ' et touchez Ajouter.'],
      mobile: ['Ouvrez le menu ' + b('⋮') + ' du navigateur.', 'Puis choisissez ' + b('« Installer l’application »') + ' ou ' + b('« Ajouter à l’écran d’accueil »') + '.'],
      ordi: ['Cliquez sur l’icône d’installation à droite de la barre d’adresse,', 'ou ouvrez le menu du navigateur et choisissez ' + b('« Installer »') + '.'],
      apres: 'L’icône apparaît ensuite avec vos applis : la page s’ouvre en plein écran, même sans réseau.', ok: 'J’ai compris' },
    en: { bouton: 'Install', titre: 'Install the app',
      ios: ['Tap the ' + b('Share') + ' button (the square with an arrow pointing up) in the Safari toolbar.', 'Then choose ' + b('“Add to Home Screen”') + ' and tap Add.'],
      mobile: ['Open the browser menu ' + b('⋮') + '.', 'Then choose ' + b('“Install app”') + ' or ' + b('“Add to Home screen”') + '.'],
      ordi: ['Click the install icon on the right of the address bar,', 'or open the browser menu and choose ' + b('“Install”') + '.'],
      apres: 'The icon then appears with your apps: the page opens full screen, even offline.', ok: 'Got it' },
    ru: { bouton: 'Установить', titre: 'Установить приложение',
      ios: ['Нажмите кнопку ' + b('«Поделиться»') + ' (квадрат со стрелкой вверх) на панели Safari.', 'Затем выберите ' + b('«На экран «Домой»»') + ' и нажмите «Добавить».'],
      mobile: ['Откройте меню браузера ' + b('⋮') + '.', 'Затем выберите ' + b('«Установить приложение»') + ' или ' + b('«Добавить на главный экран»') + '.'],
      ordi: ['Нажмите значок установки справа от адресной строки', 'или откройте меню браузера и выберите ' + b('«Установить»') + '.'],
      apres: 'Значок появится среди ваших приложений: страница откроется на весь экран, даже без сети.', ok: 'Понятно' }
  };
  const l = String((doc.documentElement && doc.documentElement.lang) || 'fr').slice(0, 2).toLowerCase();
  return T[l] || (l === 'fr' ? T.fr : T.en);
}

async function installerAppli(doc) {
  if (QP_INVITE_INSTALL) {                       // Android / Chrome / Edge : fenêtre d'installation native
    const ev = QP_INVITE_INSTALL; QP_INVITE_INSTALL = null;
    try { ev.prompt(); const r = await ev.userChoice; if (r && r.outcome === 'accepted') doc.querySelectorAll('.qp-appli').forEach(b => b.remove()); } catch (e) {}
    return;
  }
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const mobile = ios || /Android|Mobi/i.test(ua);
  const TA = textesAppli(doc);
  const txt = ios ? TA.ios : mobile ? TA.mobile : TA.ordi;
  const fond = doc.createElement('div');
  fond.className = 'qp-aide-appli';
  fond.innerHTML = '<div><b>' + TA.titre + '</b><p>' + txt[0] + '</p><p>' + txt[1] + '</p><p style="opacity:.7;font-size:.9rem">' + TA.apres + '</p><button type="button">' + TA.ok + '</button></div>';
  fond.addEventListener('click', e => { if (e.target === fond || e.target.tagName === 'BUTTON') fond.remove(); });
  doc.body.appendChild(fond);
}

/* =========================================================
   GitHub + chiffrement (admin et setup uniquement)
   ========================================================= */

/* Dossier du site, quelle que soit la façon d'ouvrir l'éditeur :
   …/qr-ab/admin.html, …/qr-ab/admin, …/qr-ab/admin/ → …/qr-ab/ */
function dossierSite() {
  const app = pageApp();
  if (app) {
    const [nom, langue] = app.split('.');                 // version traduite : nom.qrbc.app/xx/
    return 'https://' + nom + '.' + location.hostname.replace(/^www\./, '') + '/' + (langue ? langue + '/' : '');
  }
  let p = location.pathname.replace(/\/(admin|setup|index|accueil)(\.html)?\/?$/i, '/');
  if (!p.endsWith('/')) p = p.replace(/[^/]*$/, '');
  return location.origin + p;
}

function depotDepuisURL() {
  const host = location.hostname;              // rkroman-86.github.io
  const owner = host.endsWith('.github.io') ? host.split('.')[0] : '';
  const seg = location.pathname.split('/').filter(Boolean);
  let repo = seg.length && !/\.html?$/i.test(seg[0]) ? seg[0] : (owner ? owner + '.github.io' : '');
  return { owner, repo, branche: 'main' };
}

const b64 = {
  depuisTexte(s) {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  },
  versTexte(b) {
    const bin = atob(String(b).replace(/\s/g, ''));
    return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
  },
  depuisOctets(u8) {
    let bin = '';
    for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    return btoa(bin);
  },
  versOctets(b) { return Uint8Array.from(atob(b), c => c.charCodeAt(0)); }
};

const ITERATIONS = 600000;

async function cleDepuisMotDePasse(mdp, sel, iterations) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(mdp), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sel, iterations: iterations || ITERATIONS, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function chiffrerJeton(jeton, mdp) {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cle = await cleDepuisMotDePasse(mdp, sel, ITERATIONS);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cle, new TextEncoder().encode(jeton));
  return { v: 1, iterations: ITERATIONS, sel: b64.depuisOctets(sel), iv: b64.depuisOctets(iv), donnees: b64.depuisOctets(new Uint8Array(ct)) };
}

async function dechiffrerJeton(auth, mdp) {
  const cle = await cleDepuisMotDePasse(mdp, b64.versOctets(auth.sel), auth.iterations);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.versOctets(auth.iv) }, cle, b64.versOctets(auth.donnees));
  return new TextDecoder().decode(pt);
}

/* Secret chiffré : JSON {github, anthropic} (ancien format : jeton GitHub seul) */
function lireSecret(texte) {
  try {
    const o = JSON.parse(texte);
    if (o && typeof o === 'object' && o.github) return { github: o.github, anthropic: o.anthropic || '' };
  } catch (e) {}
  return { github: String(texte || ''), anthropic: '' };
}

/* Petit client pour l'API GitHub « contents » */
function clientGitHub(jeton, depot) {
  const base = 'https://api.github.com/repos/' + depot.owner + '/' + depot.repo;
  const entetes = { 'Authorization': 'Bearer ' + jeton, 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };

  async function appel(url, init) {
    const r = await fetch(url, Object.assign({ headers: entetes, cache: 'no-store' }, init || {}));
    if (!r.ok && r.status !== 404) {
      let msg = r.status + ' ' + r.statusText;
      try { const j = await r.json(); if (j.message) msg = j.message + ' (' + r.status + ')'; } catch (e) {}
      const err = new Error(msg); err.status = r.status; throw err;
    }
    return r;
  }

  return {
    async verifier() {
      const r = await appel(base);
      if (r.status === 404) throw new Error('Dépôt introuvable ou jeton sans accès à ' + depot.owner + '/' + depot.repo);
      return r.json();
    },
    async lire(chemin) {
      const r = await appel(base + '/contents/' + chemin + '?ref=' + depot.branche + '&t=' + Date.now());
      if (r.status === 404) return null;
      const j = await r.json();
      return { sha: j.sha, texte: j.content ? b64.versTexte(j.content) : '' };
    },
    async sha(chemin) {
      const r = await appel(base + '/contents/' + chemin + '?ref=' + depot.branche + '&t=' + Date.now());
      if (r.status === 404) return null;
      return (await r.json()).sha;
    },
    async ecrire(chemin, contenuB64, message, sha) {
      if (sha === undefined) sha = await this.sha(chemin);
      const corps = { message, content: contenuB64, branch: depot.branche };
      if (sha) corps.sha = sha;
      const r = await appel(base + '/contents/' + chemin, { method: 'PUT', body: JSON.stringify(corps) });
      return (await r.json()).content.sha;
    }
  };
}

/* =========================================================
   Mode Cloudflare (nomclient.qrbc.app) : le Worker stocke tout
   ========================================================= */
/* Dans l'appli installée, l'éditeur est servi depuis qrbc.app/app/<page>/ */
function pageApp() {
  const m = location.pathname.match(/^\/app\/([a-z0-9-]{3,30}(?:\.[a-z]{2})?)\//);
  return m ? m[1] : null;
}
function baseAPI() { const a = pageApp(); return a ? '/app/' + a + '/api/' : '/api/'; }

function modeCloudflare() { return !location.hostname.endsWith('.github.io') && location.protocol !== 'file:'; }

async function appelAPI(chemin, jeton, init) {
  init = init || {};
  const entetes = { 'content-type': 'application/json' };
  if (jeton) entetes.authorization = 'Bearer ' + jeton;
  try { const l = localStorage.getItem('qp-langue'); if (l) entetes['x-qrbc-langue'] = l; } catch (e) {}
  Object.assign(entetes, init.headers || {});
  const r = await fetch(baseAPI() + chemin, Object.assign({ cache: 'no-store' }, init, { headers: entetes }));
  if (!r.ok) {
    let msg = r.status + ' ' + r.statusText;
    let j = null;
    try { j = await r.json(); if (j.erreur) msg = j.erreur; } catch (e) {}
    const err = new Error(msg); err.status = r.status; err.code = j && j.code; err.donnees = j; throw err;
  }
  return r;
}

/* Même interface que clientGitHub : l'enregistrement de l'éditeur ne change pas */
function clientCloudflare(jeton) {
  return {
    async verifier() { return (await appelAPI('compte', jeton)).json(); },
    async lire(chemin) { return (await appelAPI('fichier?chemin=' + encodeURIComponent(chemin), jeton)).json(); },
    async sha(chemin) { const f = await this.lire(chemin); return f ? f.sha : null; },
    async ecrire(chemin, contenuB64) {
      const r = await appelAPI('fichier', jeton, { method: 'PUT', body: JSON.stringify({ chemin, contenu: contenuB64 }) });
      return (await r.json()).sha;
    }
  };
}

function imageUniforme(cv) {
  const p = document.createElement('canvas'); p.width = 96; p.height = 96;
  const x = p.getContext('2d'); x.drawImage(cv, 0, 0, 96, 96);
  const d = x.getImageData(0, 0, 96, 96).data;
  let min = 765, max = 0;
  for (let i = 0; i < d.length; i += 4) { const v = d[i] + d[i + 1] + d[i + 2]; if (v < min) min = v; if (v > max) max = v; }
  return max - min < 3;
}

/* Redimensionne une image avant envoi (mobile = photos lourdes).
   Certains téléphones Android rendent un canvas vide (noir) pour de grandes images ou des captures d'écran :
   on essaie donc plusieurs méthodes, et en dernier recours on garde le fichier d'origine tel quel. */
async function reduireImage(fichier, maxCote, typeSortie, qualite) {
  const dessiner = (source, l, h) => {
    const k = Math.min(1, maxCote / Math.max(l, h));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(l * k));
    cv.height = Math.max(1, Math.round(h * k));
    const ctx = cv.getContext('2d');
    // Le JPEG n'a pas de transparence : sans fond, les zones transparentes deviendraient noires
    if (typeSortie !== 'image/png') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cv.width, cv.height); }
    ctx.drawImage(source, 0, 0, cv.width, cv.height);
    return cv;
  };
  // 1. Décodage complet par le navigateur (plus fiable sur mobile), orientation de l'appareil photo respectée
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
      const cv = dessiner(bmp, bmp.width, bmp.height);
      if (bmp.close) bmp.close();
      if (!imageUniforme(cv)) return cv.toDataURL(typeSortie, qualite);
    } catch (e) { /* méthode suivante */ }
  }
  // 2. Méthode classique, en attendant la fin du décodage avant de dessiner
  const url = URL.createObjectURL(fichier);
  try {
    const img = new Image();
    img.src = url;
    if (img.decode) await img.decode();
    else await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; });
    const cv = dessiner(img, img.naturalWidth || img.width, img.naturalHeight || img.height);
    if (!imageUniforme(cv)) return cv.toDataURL(typeSortie, qualite);
  } catch (e) { /* méthode suivante */ }
  finally { URL.revokeObjectURL(url); }
  // 3. Dernier recours : le fichier d'origine, sans conversion (formats acceptés par le serveur, 3 Mo maximum)
  if (/^image\/(jpeg|png|webp)$/.test(fichier.type) && fichier.size <= 3 * 1024 * 1024) {
    return await new Promise((ok, ko) => {
      const r = new FileReader();
      r.onload = () => ok(r.result);
      r.onerror = () => ko(new Error('Image illisible'));
      r.readAsDataURL(fichier);
    });
  }
  throw new Error('Cette image ne peut pas être lue sur cet appareil. Essayez une autre image (JPEG ou PNG de moins de 3 Mo).');
}


/* =========================================================
   Page Home : pancartes plein écran à défilement aimanté
   opts.resoudre(chemin), opts.apercu, opts.surContact()
   ========================================================= */
/* Sélecteur de langues d'une page traduite : liste déroulante en haut à droite (rien sans traduction, ni dans l'aperçu) */
const NOMS_LANGUES_PAGE = { fr: 'Français', en: 'English', ru: 'Русский', es: 'Español', de: 'Deutsch', it: 'Italiano', pt: 'Português',
  nl: 'Nederlands', uk: 'Українська', pl: 'Polski', ro: 'Română', tr: 'Türkçe', zh: '中文', ja: '日本語' };
function selecteurLangues(doc, versHome) {
  const L = typeof window !== 'undefined' && window.QRBC_LANGUES;
  if (!L || !Array.isArray(L.l) || L.l.length < 2) return null;
  const box = doc.createElement('div');
  box.className = 'qp-langsel notranslate';
  box.setAttribute('translate', 'no');
  const b = doc.createElement('button');
  b.type = 'button';
  b.setAttribute('aria-haspopup', 'listbox');
  b.setAttribute('aria-expanded', 'false');
  b.setAttribute('aria-label', 'Language / Langue');
  b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/></svg>';
  b.appendChild(doc.createTextNode(String(L.a || L.l[0].l).toUpperCase()));
  const fl = doc.createElement('span'); fl.className = 'fl'; fl.textContent = '▼'; b.appendChild(fl);
  const ul = doc.createElement('ul');
  ul.setAttribute('role', 'listbox');
  L.l.forEach(x => {
    const li = doc.createElement('li');
    const a = doc.createElement('a');
    a.href = x.u + (versHome ? 'accueil.html' : '') + '?l=' + x.l;
    a.hreflang = x.l; a.lang = x.l;
    a.setAttribute('role', 'option');
    a.appendChild(doc.createTextNode((x.l === L.a ? '✓ ' : '') + (NOMS_LANGUES_PAGE[x.l] || x.l.toUpperCase())));
    const sm = doc.createElement('small'); sm.textContent = x.l.toUpperCase(); a.appendChild(sm);
    if (x.l === L.a) { a.className = 'actif'; a.setAttribute('aria-selected', 'true'); }
    li.appendChild(a); ul.appendChild(li);
  });
  const basculer = ouvrir => { box.classList.toggle('ouvert', ouvrir); b.setAttribute('aria-expanded', ouvrir ? 'true' : 'false'); };
  b.addEventListener('click', e => { e.stopPropagation(); basculer(!box.classList.contains('ouvert')); });
  doc.addEventListener('click', e => { if (!box.contains(e.target)) basculer(false); });
  doc.addEventListener('keydown', e => { if (e.key === 'Escape') basculer(false); });
  box.append(b, ul);
  return box;
}

/* Mention « Made with qrbc.app » : minuscule, tout en bas, la même partout */
function creditQrbc(doc, apercu) {
  const a = doc.createElement('a');
  a.className = 'qp-credit notranslate';
  a.setAttribute('translate', 'no');           // jamais traduite (ni par le navigateur)
  a.href = 'https://qrbc.app/';
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = 'Made with qrbc.app';
  if (apercu) a.addEventListener('click', e => e.preventDefault());
  return a;
}

function rendreHome(cfgBrut, racine, opts) {
  opts = opts || {};
  const cfg = normaliser(fusion(CONFIG_DEFAUT, cfgBrut));
  const d = cfg.design;
  const res = opts.resoudre || (x => x);
  const doc = racine.ownerDocument;
  injecterCSS(doc);
  racine.innerHTML = '';

  const home = doc.createElement('div');
  home.className = 'qh';
  const st = home.style;
  st.setProperty('--fond', d.fond);
  st.setProperty('--fond2', d.fond2 || d.fond);
  st.setProperty('--texte', d.texte);
  st.setProperty('--accent', d.accent);
  st.setProperty('--police', (FONTS[d.police] || FONTS.moderne).css);

  /* Barre du haut, fixe */
  const barre = doc.createElement('div');
  barre.className = 'qh-barre';
  if (cfg.logo) {
    const img = doc.createElement('img');
    img.className = 'qh-logo' + (d.logoRond ? ' rond' : '');
    img.src = res(cfg.logo); img.alt = '';
    barre.appendChild(img);
  }
  const nom = doc.createElement('div');
  nom.className = 'qh-nom';
  nom.textContent = cfg.titre || '';
  barre.appendChild(nom);
  const contact = doc.createElement('a');
  contact.className = 'qh-contact';
  contact.href = opts.hrefContact || '#contact';
  contact.textContent = cfg.home.boutonContact || 'Contact';
  contact.style.background = d.accent;
  contact.style.color = texteContraste(d.accent);
  if (opts.surContact) contact.addEventListener('click', e => { e.preventDefault(); opts.surContact(); });
  barre.appendChild(contact);
  const languesH = opts.apercu ? null : selecteurLangues(doc, true);
  if (languesH) barre.appendChild(languesH);          // tout à droite de la barre

  /* Pancartes */
  const defile = doc.createElement('div');
  defile.className = 'qh-defile';
  defile.tabIndex = 0;
  const articles = cfg.home.articles.filter(a => a && !a.masque && (a.titre || a.texte));
  const total = articles.length;
  const points = doc.createElement('div');
  points.className = 'qh-points';

  articles.forEach((a, i) => {
    const style = (a.style === 'photo' || a.style === 'image') && !a.image ? 'texte' : (HOME_STYLES[a.style] ? a.style : 'texte');
    const p = doc.createElement('section');
    p.className = 'qh-panneau qh-p-' + style;
    // Vraie image <img> (et non un fond CSS) : lisible par Google Images et par les lecteurs d'écran.
    // Texte de remplacement : celui saisi par le client, sinon « titre de la pancarte – nom de l'entreprise ».
    const image = () => {
      const im = doc.createElement('img');
      im.src = res(a.image);
      im.alt = String(a.alt || '').trim() || [a.titre, cfg.titre].filter(Boolean).join(' – ');
      im.setAttribute('decoding', 'async');
      if (i > 0) im.setAttribute('loading', 'lazy');
      return im;
    };
    if (style === 'photo') { const im = image(); im.className = 'qh-photo-img'; p.appendChild(im); }
    if (style === 'image') {
      const cadre = doc.createElement('div');
      cadre.className = 'qh-img';
      cadre.appendChild(image());
      p.appendChild(cadre);
    }
    const corps = doc.createElement('div');
    corps.className = 'qh-corps';
    const trait = doc.createElement('div');
    trait.className = 'qh-trait';
    corps.appendChild(trait);
    if (a.titre) {
      const h = doc.createElement('h2');
      h.className = 'qh-titre';
      h.textContent = a.titre;
      corps.appendChild(h);
    }
    if (a.texte) {
      const t = doc.createElement('p');
      t.className = 'qh-texte';
      t.textContent = a.texte;
      corps.appendChild(t);
    }
    p.appendChild(corps);
    if (i === 0 && total > 1) {
      const ind = doc.createElement('div');
      ind.className = 'qh-indice';
      const lg = String((doc.documentElement && doc.documentElement.lang) || 'fr').slice(0, 2);
      ind.textContent = ({ fr: 'GLISSEZ', en: 'SWIPE', ru: 'ЛИСТАЙТЕ', es: 'DESLIZA', de: 'WISCHEN', it: 'SCORRI', pt: 'DESLIZE', nl: 'SWIPE', uk: 'ГОРТАЙТЕ',
        pl: 'PRZESUŃ', ro: 'GLISEAZĂ', tr: 'KAYDIR', zh: '滑动', ja: 'スワイプ' })[lg] || 'SWIPE';
      if (style !== 'photo') ind.style.color = 'var(--texte)';
      p.appendChild(ind);
    }
    defile.appendChild(p);

    if (total > 1) {
      const pt = doc.createElement('button');
      pt.type = 'button';
      pt.className = 'qh-point' + (i === 0 ? ' actif' : '');
      pt.setAttribute('aria-label', 'Article ' + (i + 1));
      pt.addEventListener('click', () => defile.scrollTo({ top: p.offsetTop, behavior: 'smooth' }));
      points.appendChild(pt);
    }
  });

  if (!total) {
    const p = doc.createElement('section');
    p.className = 'qh-panneau qh-p-texte';
    p.innerHTML = '<div class="qh-corps"><p class="qh-texte">Aucun article pour l’instant</p></div>';
    defile.appendChild(p);
  }

  if (defile.lastElementChild) defile.lastElementChild.appendChild(creditQrbc(doc, opts.apercu));   // sous la dernière pancarte
  home.append(defile, barre, points);
  racine.appendChild(home);

  /* Point actif selon la pancarte visible */
  if (total > 1 && 'IntersectionObserver' in window) {
    const panneaux = [...defile.children];
    const io = new IntersectionObserver(entrees => {
      entrees.forEach(e => {
        if (!e.isIntersecting) return;
        const k = panneaux.indexOf(e.target);
        [...points.children].forEach((x, j) => x.classList.toggle('actif', j === k));
      });
    }, { root: defile, threshold: 0.55 });
    panneaux.forEach(x => io.observe(x));
  }
  if (opts.position) defile.scrollTop = opts.position;
  home.defile = defile;
  return cfg;
}


/* =========================================================
   Pages HTML fixes pour Google (générées par l'éditeur)
   index.html, accueil.html, sitemap.xml
   ========================================================= */
function echapperHTML(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlAbsolue(base, p) {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  return base.replace(/\/?$/, '/') + String(p).replace(/^\.?\//, '');
}

/* Nom sous l'icône de l'appli : court (les téléphones coupent vers 12 caractères) */
function nomCourtAppli(titre) {
  const t = String(titre || '').trim() || 'Ma page';
  if (t.length <= 12) return t;
  const mots = t.split(/[\s,–-]+/).filter(Boolean);
  let n = '';
  for (const m of mots) { if ((n + ' ' + m).trim().length > 12) break; n = (n + ' ' + m).trim(); }
  return (n.replace(/(\s+(à|a|au|aux|de|du|des|la|le|les|et|en|d’|d'|l’|l'|&))+$/i, '') || n || t.slice(0, 12)).trim();
}

function couper(t, max) {
  t = String(t || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

/* Fiche « entreprise locale » (schema.org) */
function donneesStructurees(cfg, base) {
  const seo = cfg.seo || {};
  const btn = t => cfg.boutons.find(b => b && !b.masque && b.type === t && String(b.valeur || '').trim());
  const numero = btn('tel') || btn('whatsapp') || btn('sms');
  const mailBtn = btn('email');
  const mailRs = cfg.reseaux.find(r => r.id === 'email' && r.actif && String(r.valeur || '').trim());
  const sameAs = cfg.reseaux
    .filter(r => r.actif && String(r.valeur || '').trim() && !['email', 'site'].includes(r.id))
    .map(r => lienReseau(r.id, r.valeur)).filter(u => /^https?:/i.test(u));
  const zones = String(seo.zone || (cfg.home && cfg.home.ia && cfg.home.ia.zone) || '')
    .split(/[,;\/]| et /).map(z => z.trim()).filter(Boolean);
  const o = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cfg.titre || '',
    description: seo.description || cfg.sousTitre || '',
    url: base,
    image: urlAbsolue(base, cfg.design.imageFond || cfg.logo) || undefined,
    logo: urlAbsolue(base, cfg.logo) || undefined,
    telephone: numero ? '+' + numeroInternational(numero.valeur) : undefined,
    email: mailBtn ? mailBtn.valeur.trim() : (mailRs ? String(mailRs.valeur).trim().replace(/^mailto:/i, '') : undefined),
    areaServed: zones.length ? zones.map(z => ({ '@type': 'Place', name: z })) : undefined,
    sameAs: sameAs.length ? sameAs : undefined
  };
  Object.keys(o).forEach(k => o[k] === undefined && delete o[k]);
  // Nom du site pour Google (« site name ») : celui de l'entreprise, sinon Google prend celui du domaine parent (qrbc)
  let racine = base;
  try { racine = new URL('/', base).href; } catch (e) {}
  const site = cfg.titre ? { '@type': 'WebSite', name: cfg.titre, url: racine } : null;
  if (site && cfg.appNom && String(cfg.appNom).trim() !== cfg.titre) site.alternateName = String(cfg.appNom).trim();
  const sortie = site ? { '@context': 'https://schema.org', '@graph': [Object.assign({}, o, { '@context': undefined }), site] } : o;
  if (site) delete sortie['@graph'][0]['@context'];
  return JSON.stringify(sortie, null, 2).replace(/</g, '\\u003c');
}

const CSS_BASE_SITE = `html,body{margin:0;height:100%}
#page{min-height:100vh;min-height:100dvh;display:flex}
#page>.qp{min-height:100vh;min-height:100dvh}
#page>.qh{height:100vh;height:100dvh}
body.mode-home{overflow:hidden}`;

/* Script de démarrage commun aux pages générées */
const BOOT_SITE = `(function(){
  var vueFixe = window.QP_VUE || '';
  var cfg = null;
  function afficher() {
    var racine = document.getElementById('page');
    var ancre = location.hash;
    var c = normaliser(fusion(CONFIG_DEFAUT, cfg));
    var avecHome = homeVisible(c);
    if (vueFixe === 'home' && !avecHome) { location.replace('./'); return; }
    var montrerHome = avecHome && (vueFixe === 'home' || ancre === '#accueil' || (ancre !== '#contact' && c.home.arrivee === 'home'));
    document.body.classList.toggle('mode-home', montrerHome);
    if (montrerHome) rendreHome(cfg, racine, { hrefContact: vueFixe === 'home' ? './#contact' : '#contact' });
    else rendrePage(cfg, racine, { lienHome: avecHome, hrefHome: c.home.arrivee === 'home' ? '#accueil' : 'accueil.html' });
    document.body.style.background = c.design.fond;
  }
  if ('serviceWorker' in navigator && /\.qrbc\.app$/i.test(location.hostname)) navigator.serviceWorker.register('/sw.js').catch(function () {});
  fetch('config.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .then(function (c) { cfg = c; afficher(); window.addEventListener('hashchange', afficher); })
    .catch(function () {});
})();`;

function pageHTML(o) {
  const meta = (n, v, attr) => v ? '<meta ' + (attr || 'name') + '="' + n + '" content="' + echapperHTML(v) + '">\n' : '';
  const L = /^[a-z]{2}$/.test(o.langue || '') ? o.langue : 'fr';
  const LOCALES = { fr: 'fr_FR', en: 'en_GB', ru: 'ru_RU', es: 'es_ES', de: 'de_DE', it: 'it_IT', pt: 'pt_PT', nl: 'nl_NL', uk: 'uk_UA', pl: 'pl_PL', ro: 'ro_RO', tr: 'tr_TR', zh: 'zh_CN', ja: 'ja_JP' };
  return '<!DOCTYPE html>\n<html lang="' + L + '">\n<head>\n' +
    '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<title>' + echapperHTML(o.titre) + '</title>\n' +
    meta('description', o.description) +
    '<link rel="canonical" href="' + echapperHTML(o.canonique) + '">\n' +
    meta('robots', 'index, follow') +
    meta('og:type', 'website', 'property') + meta('og:locale', LOCALES[L] || 'fr_FR', 'property') +
    meta('og:site_name', o.nom, 'property') + meta('og:title', o.titre, 'property') +
    meta('og:description', o.description, 'property') + meta('og:url', o.canonique, 'property') +
    meta('og:image', o.image, 'property') +
    (o.imageTaille ? meta('og:image:type', 'image/jpeg', 'property') + meta('og:image:width', String(o.imageTaille[0]), 'property') +
      meta('og:image:height', String(o.imageTaille[1]), 'property') + meta('og:image:alt', o.nom, 'property') : '') +
    meta('twitter:card', o.image ? 'summary_large_image' : 'summary') + meta('twitter:image', o.image) +
    meta('theme-color', o.couleur) +
    (o.appli ? '<link rel="manifest" href="/manifest.webmanifest">\n' + meta('mobile-web-app-capable', 'yes') + meta('apple-mobile-web-app-capable', 'yes') +
      meta('apple-mobile-web-app-title', o.appli.nom) + meta('apple-mobile-web-app-status-bar-style', 'black-translucent') +
      '<link rel="apple-touch-icon" href="' + echapperHTML(o.appli.icone) + '">\n' : '') +
    // Icône des résultats Google : carrée et multiple de 48 px → l'icône d'appli 192×192 si elle existe, sinon le logo
    (o.appli && /^images\//.test(o.appli.icone || '') ? '<link rel="icon" type="image/png" sizes="192x192" href="' + echapperHTML(o.appli.icone) + '">\n' : '') +
    (o.icone ? '<link rel="icon" href="' + echapperHTML(o.icone) + '">\n' : '') +
    '<script type="application/ld+json">\n' + o.jsonld + '\n</script>\n' +
    '<style>' + CSS_BASE_SITE + '</style>\n<style id="qp-css">' + CSS_PAGE + '</style>\n' +
    '</head>\n<body' + (o.modeHome ? ' class="mode-home"' : '') + ' style="background:' + echapperHTML(o.couleur) + '">\n' +
    '<div id="page">' + o.contenu + '</div>\n' +
    '<script src="commun.js"></script>\n<script>window.QP_VUE=' + JSON.stringify(o.vue || '') + ';\n' + BOOT_SITE + '</script>\n' +
    '</body>\n</html>\n';
}

/* Construit tous les fichiers ; doc sert au pré-rendu */
function genererFichiersSite(cfgBrut, base, doc) {
  const cfg = normaliser(fusion(CONFIG_DEFAUT, cfgBrut));
  const d = cfg.design, seo = cfg.seo || {};
  base = base.replace(/\/?$/, '/');
  const avecHome = homeVisible(cfg);
  const arriveeHome = avecHome && cfg.home.arrivee === 'home';
  const jsonld = donneesStructurees(cfg, base);
  const partage = cfg.partage && cfg.partage.chemin ? cfg.partage : null;     // image d'aperçu 1200×630 (voir l'éditeur)
  const image = urlAbsolue(base, partage ? partage.chemin : (d.imageFond || cfg.logo));
  const imageTaille = partage ? [partage.l || 1200, partage.h || 630] : null;
  // Pages hébergées sur qrbc.app : installables comme une appli (manifeste servi par le serveur)
  const appli = /\.qrbc\.app\/([a-z]{2}\/)?$/i.test(base) ? { nom: String(cfg.appNom || '').trim().slice(0, 15) || nomCourtAppli(cfg.titre), icone: (cfg.appIcones && cfg.appIcones.i192) || '/apple-touch-icon.png' } : null;
  const icone = cfg.logo || '';
  const titreSite = seo.titre || [cfg.titre, cfg.sousTitre].filter(Boolean).join(' – ') || 'Bienvenue';
  const descSite = seo.description || couper([cfg.sousTitre, cfg.pied].filter(Boolean).join('. '), 155);

  const preRendu = (vue) => {
    const tmp = doc.createElement('div');
    if (vue === 'home') rendreHome(cfgBrut, tmp, { hrefContact: arriveeHome ? '#contact' : './#contact' });
    else rendrePage(cfgBrut, tmp, { lienHome: avecHome, hrefHome: arriveeHome ? '#accueil' : 'accueil.html' });
    return tmp.innerHTML;
  };

  const fichiers = {};
  fichiers['index.html'] = pageHTML({
    titre: titreSite, description: descSite, canonique: base, nom: cfg.titre, image, imageTaille, icone, couleur: d.fond, jsonld, appli, langue: cfg.langue,
    contenu: preRendu(arriveeHome ? 'home' : 'contact'), modeHome: arriveeHome, vue: ''
  });

  const urls = [base];
  if (avecHome) {
    const art = cfg.home.articles.find(a => a && !a.masque && (a.titre || a.texte)) || {};
    const arts = cfg.home.articles.filter(a => a && !a.masque && a.titre);
    const nom = cfg.titre || '';
    const doublon = t => nom && String(t || '').toLowerCase().includes(nom.toLowerCase());
    const sujet = (arts.find(a => !doublon(a.titre)) || {}).titre || cfg.sousTitre || 'Nos services';
    const titreHome = arriveeHome ? titreSite : couper(nom ? sujet + ' – ' + nom : sujet, 65);
    const descHome = arriveeHome ? descSite : couper(art.texte || descSite, 155);
    fichiers['accueil.html'] = pageHTML({
      titre: titreHome, description: descHome, canonique: arriveeHome ? base : base + 'accueil.html', nom: cfg.titre,
      image, imageTaille, icone, couleur: d.fond, jsonld, appli, langue: cfg.langue, contenu: preRendu('home'), modeHome: true, vue: 'home'
    });
    if (!arriveeHome) urls.push(base + 'accueil.html');
  } else {
    fichiers['accueil.html'] = '<!DOCTYPE html>\n<html lang="' + (/^[a-z]{2}$/.test(cfg.langue || '') ? cfg.langue : 'fr') + '"><head><meta charset="utf-8"><title>' + echapperHTML(cfg.titre) +
      '</title><link rel="canonical" href="' + echapperHTML(base) + '"><meta http-equiv="refresh" content="0; url=./"></head><body></body></html>\n';
  }

  const jour = new Date().toISOString().slice(0, 10);
  fichiers['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u => '  <url><loc>' + echapperHTML(u) + '</loc><lastmod>' + jour + '</lastmod></url>\n').join('') + '</urlset>\n';
  return fichiers;
}

/* =========================================================
   Statistiques (pages publiques seulement) : un signal anonyme quand un bouton est touché
   (type de lien seulement : téléphone, WhatsApp, avis…), et ?s=qr retiré de la barre d'adresse.
   ========================================================= */
function typeClic(href) {
  const h = String(href || '').trim().toLowerCase();
  if (h.startsWith('tel:')) return 'tel';
  if (h.startsWith('sms:')) return 'sms';
  if (h.startsWith('mailto:')) return 'email';
  if (!/^https?:/.test(h)) return null;
  let u;
  try { u = new URL(h); } catch (e) { return null; }
  const d = u.hostname.replace(/^(www|m|mobile)\./, ''), p = u.pathname;
  if (d === location.hostname) return null;                               // navigation interne (Home, contact)
  if (/(^|\.)(wa\.me|whatsapp\.com)$/.test(d)) return 'whatsapp';
  if (/writereview|\/local\/review|g\.page\/r\//.test(h) || (/^g\.page$/.test(d) && /\/review/.test(p))) return 'avis';
  if (/(^|\.)(maps\.app\.goo\.gl|maps\.apple\.com|waze\.com)$/.test(d) || /(^|\.)google\.[a-z.]+$/.test(d) && /^\/maps/.test(p) || /^maps\.google\./.test(d) || (d === 'goo.gl' && /^\/maps/.test(p))) return 'maps';
  const R = { 't.me': 'telegram', 'telegram.me': 'telegram', 'instagram.com': 'instagram', 'facebook.com': 'facebook', 'fb.com': 'facebook', 'fb.me': 'facebook',
    'tiktok.com': 'tiktok', 'youtube.com': 'youtube', 'youtu.be': 'youtube', 'linkedin.com': 'linkedin', 'x.com': 'x', 'twitter.com': 'x',
    'snapchat.com': 'snapchat', 'pinterest.com': 'pinterest', 'pinterest.fr': 'pinterest', 'vk.com': 'vk' };
  return R[d] || 'lien';
}
(function () {
  if (typeof document === 'undefined' || typeof pageInstallable !== 'function' || !pageInstallable()) return;
  try {
    const u = new URL(location.href);
    if (u.searchParams.has('s') || u.searchParams.has('moi')) {
      if (u.searchParams.has('moi')) fetch('/api/moi', { credentials: 'include' }).catch(function () {});
      u.searchParams.delete('s'); u.searchParams.delete('moi');
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    }
  } catch (e) {}
  document.addEventListener('click', function (e) {
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const t = typeClic(a.getAttribute('href'));
    if (!t) return;
    const corps = JSON.stringify({ t: t });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/api/clic', new Blob([corps], { type: 'application/json' }));
      else fetch('/api/clic', { method: 'POST', body: corps, keepalive: true }).catch(function () {});
    } catch (err) {}
  }, true);
})();
