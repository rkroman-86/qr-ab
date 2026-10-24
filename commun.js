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
const RESEAUX = {
  facebook:  { nom: 'Facebook',  coul: '#1877F2', aide: 'Nom de la page ou lien',     url: v => 'https://www.facebook.com/' + v },
  instagram: { nom: 'Instagram', coul: '#E4405F', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://www.instagram.com/' + v },
  x:         { nom: 'X',         coul: '#000000', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://x.com/' + v },
  snapchat:  { nom: 'Snapchat',  coul: '#FFFC00', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://www.snapchat.com/add/' + v },
  tiktok:    { nom: 'TikTok',    coul: '#000000', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://www.tiktok.com/@' + v },
  site:      { nom: 'Site web',  coul: '#4B5563', aide: 'Adresse du site',            url: v => 'https://' + v, icone: GLOBE_SVG },
  youtube:   { nom: 'YouTube',   coul: '#FF0000', aide: 'Nom de la chaîne ou lien',   url: v => 'https://www.youtube.com/@' + v },
  telegram:  { nom: 'Telegram',  coul: '#26A5E4', aide: 'Nom d’utilisateur ou lien',  url: v => 'https://t.me/' + v },
  tripadvisor:{ nom: 'Tripadvisor', coul: '#34E0A1', aide: 'Lien de la fiche',        url: v => 'https://' + v }
};
const RESEAUX_ACTIFS_DEFAUT = ['facebook', 'instagram', 'x', 'snapchat', 'tiktok', 'site'];

function iconeReseau(id) { return (RESEAUX[id] && RESEAUX[id].icone) || (ICONES_CDN + id + '.svg'); }

function lienReseau(id, valeur) {
  let v = String(valeur || '').trim();
  if (!v || !RESEAUX[id]) return '#';
  if (estURL(v)) return lienSur(v);
  if (/^(www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(v) && v.includes('.') && id !== 'site') return lienSur('https://' + v);
  if (id === 'site' || id === 'tripadvisor') return lienSur('https://' + v);
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
  return cfg;
}

const CONFIG_DEFAUT = {
  titre: 'Nom de l’établissement',
  sousTitre: 'Merci de votre visite !',
  logo: '',
  pied: '',
  design: {
    theme: 'sable', fond: '#f5f1ea', fond2: '#e9e0d2', texte: '#2b2620', accent: '#2b2620',
    imageFond: '', voile: 40, police: 'moderne', forme: 'arrondi', style: 'plein',
    ombre: true, carte: false, logoRond: false, nomsReseaux: false, reseauxTheme: false
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

/* ---------- Styles de la page (injectés une fois) ---------- */
const CSS_PAGE = `
.qp{--fond:#f5f1ea;--fond2:#e9e0d2;--texte:#2b2620;--accent:#2b2620;--police:system-ui;--rayon:14px;
  min-height:100%;width:100%;display:flex;align-items:center;justify-content:center;
  padding:40px 18px;box-sizing:border-box;font-family:var(--police);color:var(--texte);
  background:linear-gradient(165deg,var(--fond),var(--fond2));background-size:cover;background-position:center;position:relative}
.qp *{box-sizing:border-box}
.qp-voile{position:absolute;inset:0;pointer-events:none}
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
.qp-pied{margin-top:28px;font-size:.85rem;opacity:.65;line-height:1.5;white-space:pre-line}
.qp-vide{opacity:.55;font-size:.95rem;padding:20px 0}
`;

function injecterCSS(doc) {
  doc = doc || document;
  if (doc.getElementById('qp-css')) return;
  const s = doc.createElement('style');
  s.id = 'qp-css';
  s.textContent = CSS_PAGE;
  doc.head.appendChild(s);
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
  page.className = 'qp' + (d.carte ? ' qp-carte' : '') + (d.ombre ? ' qp-ombre' : '');
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

  if (cfg.logo) {
    const img = doc.createElement('img');
    img.className = 'qp-logo' + (d.logoRond ? ' qp-logo-rond' : '');
    img.src = res(cfg.logo);
    img.alt = cfg.titre || '';
    c.appendChild(img);
  }
  if (cfg.titre) {
    const h = doc.createElement('h1');
    h.className = 'qp-titre';
    h.textContent = cfg.titre;
    c.appendChild(h);
  }
  if (cfg.sousTitre) {
    const s = doc.createElement('p');
    s.className = 'qp-sous';
    s.textContent = cfg.sousTitre;
    c.appendChild(s);
  }

  const zone = doc.createElement('div');
  zone.className = 'qp-btns';
  normaliser(cfg);
  const visibles = (cfg.boutons || []).filter(b => b && !b.masque && (b.type === 'reseaux' || b.texte));
  let nbAffiches = 0;
  visibles.forEach(b => {
    if (b.type === 'reseaux') {
      const items = cfg.reseaux.filter(r => r.actif && (opts.apercu || String(r.valeur || '').trim()));
      if (!items.length) return;
      const grille = doc.createElement('div');
      grille.className = 'qp-rs';
      items.forEach(r => {
        const R = RESEAUX[r.id];
        const a = doc.createElement('a');
        a.className = 'qp-rs-item' + (String(r.valeur || '').trim() ? '' : ' vide');
        a.href = lienReseau(r.id, r.valeur);
        a.setAttribute('aria-label', R.nom);
        if (/^https?:/i.test(a.getAttribute('href'))) { a.target = '_blank'; a.rel = 'noopener'; }
        if (opts.apercu) a.addEventListener('click', e => e.preventDefault());
        const rond = doc.createElement('span');
        rond.className = 'qp-rs-rond';
        const fondRond = d.reseauxTheme ? d.accent : R.coul;
        rond.style.background = fondRond;
        const ico = doc.createElement('span');
        ico.className = 'qp-rs-ico';
        ico.style.setProperty('--ico', 'url("' + iconeReseau(r.id) + '")');
        ico.style.background = texteContraste(fondRond);
        rond.appendChild(ico);
        a.appendChild(rond);
        if (d.nomsReseaux) { const n = doc.createElement('span'); n.textContent = R.nom; a.appendChild(n); }
        grille.appendChild(a);
      });
      zone.appendChild(grille);
      nbAffiches++;
      return;
    }
    nbAffiches++;
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
  c.appendChild(zone);

  if (cfg.pied) {
    const f = doc.createElement('p');
    f.className = 'qp-pied';
    f.textContent = cfg.pied;
    c.appendChild(f);
  }

  page.appendChild(c);
  racine.appendChild(page);
  return cfg;
}

/* =========================================================
   GitHub + chiffrement (admin et setup uniquement)
   ========================================================= */

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

/* Redimensionne une image avant envoi (mobile = photos lourdes) */
function reduireImage(fichier, maxCote, typeSortie, qualite) {
  return new Promise((ok, ko) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxCote / Math.max(img.width, img.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k);
      cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      ok(cv.toDataURL(typeSortie, qualite));
    };
    img.onerror = () => { URL.revokeObjectURL(url); ko(new Error('Image illisible')); };
    img.src = url;
  });
}
