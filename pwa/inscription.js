/* =========================================================
   inscription.js — étape 1 de l'inscription (accueil et appli)
   Activité + e-mail + CGV → lien par e-mail (POST /api/inscription/lien), puis écran « Vérifiez votre boîte mail ».
   Code promo du lien (?promo=) : pas de champ, seulement la ligne « ✓ … jours offerts ».
   Anti-robots Cloudflare Turnstile (invisible), chargé seulement quand le formulaire sert.
   Pas de lookbehind ni d'opérateur ?? (anciens Safari).
   ========================================================= */
(function () {
  'use strict';
  const tr = x => (window.t ? window.t(x) : x);
  const lireLS = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const ecrireLS = (k, v) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} };
  const lang = () => String(document.documentElement.lang || 'fr').slice(0, 2);

  /* Étapes d'inscription (compteurs anonymes, sans cookie, une fois par visite) */
  let provenanceEtape = () => '';      // code promo, sinon « via:NOM » (filtre de l'entonnoir dans /gestion)
  function etape(e) {
    try { if (sessionStorage.getItem('qrbc-etape-' + e)) return; sessionStorage.setItem('qrbc-etape-' + e, '1'); } catch (x) {}
    const p = provenanceEtape();
    try { fetch('/api/etape?e=' + e + (p ? '&p=' + encodeURIComponent(p) : ''), { method: 'POST', keepalive: true }).catch(() => {}); } catch (x) {}
  }

  /* ---------- Turnstile ---------- */
  let confPromesse = null;
  const config = () => confPromesse || (confPromesse = fetch('/api/inscription/config').then(r => r.json()).catch(() => ({})));
  let scriptPromesse = null;
  function chargerScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (scriptPromesse) return scriptPromesse;
    scriptPromesse = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => {
        let n = 0;
        const attendre = () => { if (window.turnstile) ok(window.turnstile); else if (n++ > 50) ko(new Error('turnstile')); else setTimeout(attendre, 100); };
        attendre();
      };
      s.onerror = () => ko(new Error('turnstile'));
      document.head.appendChild(s);
    });
    return scriptPromesse;
  }
  function antiRobot(zone) {
    let id = null, jeton = null, actif = false, pret = null;
    function demarrer() {
      if (pret) return pret;
      pret = config().then(c => {
        if (!c || !c.turnstile || !zone) return;
        actif = true;
        return chargerScript().then(ts => {
          id = ts.render(zone, {
            sitekey: c.turnstile, appearance: 'interaction-only', language: lang(),
            callback: x => { jeton = x; }, 'expired-callback': () => { jeton = null; }, 'error-callback': () => { jeton = null; }
          });
        });
      }).catch(() => {});
      return pret;
    }
    // jeton disponible (attend la vérification invisible, 10 s au plus)
    async function obtenir() {
      await demarrer();
      if (!actif) return null;
      for (let i = 0; i < 100 && !jeton; i++) await new Promise(r => setTimeout(r, 100));
      return jeton;
    }
    function renouveler() { jeton = null; try { if (id !== null && window.turnstile) window.turnstile.reset(id); } catch (e) {} }
    return { demarrer, obtenir, renouveler };
  }

  /* ---------- Code promo et provenance ---------- */
  /* Code d'un lien d'apporteur : gardé 30 jours sur l'appareil (le visiteur peut revenir plus tard sans le lien).
     ?promo= vide l'oublie. Ancien format (texte seul) : daté d'aujourd'hui. */
  const DUREE_PROMO = 30 * 86400000;
  function oublierPromo() { ecrireLS('qrbc-promo', ''); }
  function lirePromo() {
    let code = '';
    try {
      const p = new URLSearchParams(location.search);
      if (p.has('promo')) {
        code = String(p.get('promo') || '').trim().toLowerCase().replace(/\s/g, '');
        if (code) ecrireLS('qrbc-promo', JSON.stringify({ c: code, t: Date.now() })); else oublierPromo();
        return code;
      }
      const brut = lireLS('qrbc-promo');
      if (!brut) return '';
      let o = null;
      try { o = JSON.parse(brut); } catch (e) {}
      if (!o || typeof o !== 'object') { o = { c: brut, t: Date.now() }; ecrireLS('qrbc-promo', JSON.stringify(o)); }
      if (!o.c || !(Date.now() - (o.t || 0) < DUREE_PROMO)) { oublierPromo(); return ''; }
      code = String(o.c).trim().toLowerCase().replace(/\s/g, '');
    } catch (e) {}
    return code;
  }
  function lireDepuis() {
    let d = '';
    try {
      const p = new URLSearchParams(location.search);       // ?gclid seul (Google Ads) = « google-ads »
      d = (p.get('depuis') || (p.get('gclid') ? 'google-ads' : '') || lireLS('qrbc-depuis')).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 25);
    } catch (e) {}
    if (d) ecrireLS('qrbc-depuis', d);
    return d;
  }

  /* o : { form, activite, email, cgu, bouton, msg, promoLigne, promoLien, promoChamp, promoEtat, robot,
           attente (conteneur de l'écran « Vérifiez votre boîte mail »), cacher (éléments masqués pendant l'attente),
           onPromo(joursEssai), onExiste(reponse) } */
  window.qrbcInscription = function (o) {
    const robot = antiRobot(o.robot);
    let promo = lirePromo(), promoValide = false;
    const depuis = lireDepuis();
    provenanceEtape = () => (promo ? String(promo).trim().toLowerCase() : depuis ? 'via:' + depuis : '');

    // Code promo : ligne « ✓ … » s'il vient du lien, sinon petit lien « J'ai un code promo » qui ouvre le champ
    async function verifierPromo(code, depuisLien) {
      promoValide = false;
      if (o.promoEtat) { o.promoEtat.className = 'dispo'; o.promoEtat.textContent = ''; }
      if (!code) { if (o.onPromo) o.onPromo(30); return; }
      try {
        const j = await (await fetch('/api/promo?code=' + encodeURIComponent(code))).json();
        promoValide = !!j.valide;
        const ligne = '✓ ' + j.essai + ' jours + ' + j.jours + ' jours offerts';
        if (depuisLien && j.valide) {
          o.promoLigne.textContent = ligne + ' ';
          const x = document.createElement('button');
          x.type = 'button'; x.className = 'lien'; x.textContent = 'Retirer';
          x.onclick = () => {                                   // le visiteur ne veut pas de ce code : on l'oublie
            oublierPromo(); promo = ''; promoValide = false;
            o.promoLigne.hidden = true; o.promoChamp.value = '';
            if (o.promoLien) o.promoLien.hidden = false;
            if (o.onPromo) o.onPromo(30);
          };
          o.promoLigne.appendChild(x); o.promoLigne.hidden = false;
          o.promoLien.hidden = true; o.promoChamp.parentNode.hidden = true;
        } else if (o.promoEtat) {
          o.promoEtat.className = 'dispo ' + (j.valide ? 'ok' : 'ko');
          o.promoEtat.textContent = j.valide ? ligne : (j.erreur || 'Code inconnu ou expiré');
        }
        if (o.onPromo) o.onPromo(j.valide ? (j.essai || 30) + (j.jours || 0) : 30);
      } catch (e) {}
    }
    if (o.promoLien) o.promoLien.addEventListener('click', () => {
      o.promoLien.hidden = true; o.promoChamp.parentNode.hidden = false; o.promoChamp.focus();
    });
    if (o.promoChamp) {
      let minu;
      o.promoChamp.addEventListener('input', () => {
        o.promoChamp.value = o.promoChamp.value.toLowerCase().replace(/\s/g, '');
        promo = o.promoChamp.value; clearTimeout(minu); minu = setTimeout(() => verifierPromo(promo, false), 400);
      });
    }
    if (promo) {
      if (o.promoChamp) o.promoChamp.value = promo;
      verifierPromo(promo, true).then(() => {
        if (!promoValide && o.promoLien) { o.promoLien.hidden = true; o.promoChamp.parentNode.hidden = false; }   // code du lien refusé : on le montre
      });
    }

    // Compteurs et anti-robots : démarrés quand le formulaire sert vraiment
    if ('IntersectionObserver' in window) {
      const vu = new IntersectionObserver(l => { if (l.some(x => x.isIntersecting)) { etape('form'); robot.demarrer(); vu.disconnect(); } }, { threshold: 0.3 });
      vu.observe(o.activite);
    } else robot.demarrer();
    o.form.addEventListener('focusin', () => robot.demarrer());
    o.activite.addEventListener('input', () => etape('saisie'));

    function erreur(texte, champ) {
      o.msg.className = 'msg err'; o.msg.textContent = texte;
      if (champ) champ.focus();
    }

    /* ---------- Écran « Vérifiez votre boîte mail » ---------- */
    function attente(email) {
      const z = o.attente;
      z.innerHTML = '';
      const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
      const p1 = el('p', 't1');
      p1.append(document.createTextNode(tr('Nous avons envoyé un lien à')), ' ');
      const b = el('b', '', email); b.setAttribute('data-no-i18n', ''); p1.append(b);
      const zone = el('div', 'msg');
      const renvoyer = el('button', 'lien', 'Renvoyer le lien'); renvoyer.type = 'button';
      const corriger = el('button', 'lien', 'Corriger l’adresse'); corriger.type = 'button';
      z.append(el('div', 'grand', '✉️'), el('h2', '', 'Vérifiez votre boîte mail'), p1,
        el('p', 'sous', 'Ouvrez cet e-mail et touchez « Créer mon site » pour choisir l’adresse de votre site et votre mot de passe.'),
        el('p', 'sous', 'Rien reçu ? Regardez dans les indésirables (spam).'), el('div', 'actions'), zone);
      z.querySelector('.actions').append(renvoyer, corriger);
      renvoyer.onclick = async () => {
        renvoyer.disabled = true; zone.className = 'msg'; zone.textContent = 'Envoi…';
        try {
          const r = await fetch('/api/inscription/renvoyer', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(j.erreur || 'Erreur');
          if (j.direct) { location.href = j.direct; return; }
          zone.className = 'msg ok'; zone.textContent = '✓ ' + tr('Nouveau lien envoyé.');
        } catch (e) { zone.className = 'msg err'; zone.textContent = e.message === 'Failed to fetch' ? 'Pas de connexion internet.' : e.message; }
        setTimeout(() => { renvoyer.disabled = false; }, 4000);
      };
      corriger.onclick = () => {
        z.hidden = true;
        (o.cacher || []).forEach(n => { n.hidden = false; });
        o.form.hidden = false; o.msg.textContent = '';
        o.email.focus(); o.email.select();
      };
      (o.cacher || []).forEach(n => { n.hidden = true; });
      o.form.hidden = true; z.hidden = false;
      try { z.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    }

    o.form.addEventListener('submit', async e => {
      e.preventDefault();
      o.msg.className = 'msg'; o.msg.textContent = '';
      const activite = o.activite.value.replace(/\s+/g, ' ').trim(), email = o.email.value.trim();
      if (activite.length < 2) return erreur('Décrivez votre activité en quelques mots.', o.activite);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return erreur('Adresse e-mail invalide.', o.email);
      if (!o.cgu.checked) return erreur('Merci d’accepter les conditions d’utilisation.');
      const texteBouton = o.bouton.textContent;
      o.bouton.disabled = true; o.msg.textContent = 'Envoi du lien…';
      try {
        const jeton = await robot.obtenir();
        const r = await fetch('/api/inscription/lien', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ activite, email, cgu: true, promo: promo || '', depuis, langue: lang(), turnstile: jeton || '' })
        });
        const j = await r.json().catch(() => ({}));
        robot.renouveler();
        if (r.status === 409 && j.code === 'email_existe') { o.msg.textContent = ''; if (o.onExiste) o.onExiste(j); else erreur(j.erreur); return; }
        if (!r.ok) throw new Error(j.erreur || 'Erreur');
        oublierPromo(); ecrireLS('qrbc-depuis', '');
        if (j.direct) { location.href = j.direct; return; }          // pas de service d'e-mail (banc d'essai)
        o.msg.textContent = '';
        attente(email);
      } catch (err) {
        erreur(err.message === 'Failed to fetch' ? 'Pas de connexion internet.' : err.message);
      } finally {
        o.bouton.disabled = false; o.bouton.textContent = texteBouton;
      }
    });
    return { etape };
  };
})();
