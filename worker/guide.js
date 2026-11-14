/* Mode d'emploi du constructeur qrbc.app : sert de référence à l'assistant « ❓ Aide » de l'éditeur.
   À tenir à jour à chaque nouvelle fonction (texte en français ; l'assistant répond dans la langue du client).
   Pas d'accent grave (backtick) dans ce texte. */
export const GUIDE = `# Mode d'emploi de l'éditeur qrbc.app

qrbc.app (QR-BC, édité par KPS) permet de créer en quelques minutes, depuis un téléphone, une page mobile pour une activité (commerce, artisan, VTC, restaurant, location…), avec son QR code, des cartes de visite à imprimer et une petite appli installable. L'adresse de la page est nom.qrbc.app.

## L'écran de l'éditeur
- En haut : les onglets « Modifier » (le formulaire), « Aperçu » (la page telle que les visiteurs la verront) et « 📊 » (statistiques), le choix de la langue de l'éditeur (FR, EN, RU) et « Quitter ».
- Sous les onglets : un bandeau qui indique l'état du compte (essai et jours restants, abonnement et date d'échéance, compte offert). Le toucher ouvre la fenêtre d'abonnement et de crédit IA.
- Le formulaire est fait de sections repliables : Textes, Boutons et réseaux, Disposition, Logo, Design, Image de fond, Page Home, QR code et carte de visite, Référencement Google.
- En bas, une barre fixe : à gauche le message d'état (« Modifications non enregistrées », « Publié… ») et le bouton « ❓ » de l'assistant ; à droite le bouton « Enregistrer ».
- IMPORTANT : rien n'est publié tant qu'on n'a pas appuyé sur « Enregistrer ». Après l'enregistrement, la page en ligne est à jour en moins d'une minute (recharger la page si besoin).
- L'aperçu se met à jour en direct pendant la saisie. Quand on modifie la section Page Home, l'aperçu montre la Home ; sinon la page contact.

## Création express (⚡ « Créer mon site »)
- Pour aller vite : on décrit son activité (avec un maximum de détails : services, lieux desservis, horaires, langues parlées, ce qui vous distingue), sa zone et son téléphone. L'IA prépare tout en une minute environ : textes, pancartes de la page Home, accroche, logo, image de fond et référencement Google.
- Elle remplace les pancartes, l'accroche, le logo et le fond actuels ; les anciennes images restent dans « Mes images ».
- Ensuite : tout vérifier dans l'aperçu, corriger si besoin, puis « Enregistrer » pour publier.
- Si une étape échoue, elle peut être relancée sans frais pendant 30 minutes (« Réessayer »).
- Coût : pendant l'essai, une partie des créations gratuites ; pour un abonné, 1,50 € HT ; gratuit pour un compte offert. Pas disponible sur une version traduite.

## Textes
- Nom de l'établissement (titre), sous-titre (accroche) et texte en bas de page (adresse, horaires…).
- Sur une image de fond, la lisibilité se règle dans Design (voir plus bas).

## Boutons et réseaux
- « Ajouter un bouton… » propose des modèles : Laisser un avis Google, Réserver sur WhatsApp, Appeler, Notre site, Itinéraire, Nous écrire, Voir la carte, ou « Bouton vide ».
- Chaque bouton a une action et une valeur :
  - Avis Google : le lien « Demander des avis » de la fiche Google Business (ou son Place ID) ;
  - WhatsApp : le numéro (06 12 34 56 78 ou +33 6 12 34 56 78), avec un message pré-rempli facultatif ;
  - Téléphone, SMS : le numéro ;
  - E-mail : l'adresse ;
  - Itinéraire : l'adresse ou un lien Google Maps ;
  - Lien web : n'importe quelle adresse (site, menu, réservation en ligne, lien de paiement SumUp, Stripe, PayPal…).
- Texte du bouton : s'il est vide, le bouton devient une icône ronde.
- Couleur : celle du thème ou une couleur propre au bouton.
- Les flèches ↑ ↓ changent l'ordre ; « 🗑 Supprimer » retire le bouton. On peut aussi masquer un bouton sans le supprimer.
- Réseaux sociaux (icônes rondes, 3 par ligne) : Facebook, Instagram, X, Snapchat, TikTok, site web, YouTube, Telegram (nom, lien ou numéro), Tripadvisor, e-mail. Cocher ceux à afficher et saisir le nom d'utilisateur ou le lien : seuls ceux qui ont un lien apparaissent. Le bloc des réseaux peut être monté ou descendu (« ↑ Bloc », « ↓ Bloc »).

## Disposition
- Modèles : Centré, Boutons en haut, Boutons en bas, Barre à gauche, Barre à droite, Carte de visite, Affiche, Haut + bas, Gauche + droite.
- Les barres et les modèles « Haut + bas » et « Gauche + droite » utilisent toujours des icônes rondes. Pour ces deux derniers, la première moitié des boutons va en haut (ou à gauche), la seconde en bas (ou à droite) : l'ordre se règle avec les flèches.

## Logo
- Importer une image (logo ou photo) ou créer un logo avec « ✨ Atelier logo (IA) » (pictogrammes dessinés par l'IA, police, couleurs).
- « Logo rond (photo) » pour afficher une photo dans un cercle.

## Design
- Thème : Sable, Nuit, Riviera, Olive, Corail, Luxe, Blanc (applique d'un coup les 4 couleurs). Les couleurs peuvent ensuite être changées une par une : Fond, Fond (dégradé), Texte, Boutons.
- Police : Moderne, Élégante, Classique, Arrondie, Technique.
- Texte sur l'image de fond : Auto (un texte foncé passe en blanc sur la photo), Blanc, ou Couleur choisie.
- Effet pour lire le texte sur l'image : Ombre légère (conseillé), Aucun, Ombre forte, Contour, Bandeau derrière le texte. Si le titre se lit mal sur la photo : essayer « Blanc » + « Bandeau », ou assombrir l'image (voir Recadrage).
- Forme des boutons (Carré, Arrondi, Pilule), style (Plein, Contour, Doux), ombre sous les boutons, encadrer le contenu (carte), tous les boutons en icônes rondes, noms sous les icônes, icônes aux couleurs du thème.
- Bouton « Installer l'appli » en haut de la page (activé par défaut) et nom affiché sous l'icône de l'appli (15 caractères maximum).

## Image de fond
- Photo affichée derrière la page contact. Elle sert aussi aux cartes de visite, à l'atelier logo et à l'aperçu de partage (WhatsApp…). Conseil : photo en format portrait, sujet bien éclairé.
- Sources : prendre ou choisir une photo, « Mes images », ou créer avec l'IA (2 images à partir de l'activité et d'une ambiance ; touchez celle que vous préférez, l'autre reste dans « Mes images »).
- Voile : curseur qui assombrit la photo pour faire ressortir le texte (40 % par défaut).
- Une vraie photo de l'activité (véhicule, local, produits) donne toujours un résultat plus fidèle qu'une image IA.

## Recadrer et zoomer (« ✂ Recadrer »)
- Faire glisser l'image, pincer ou utiliser le curseur pour zoomer. Le cadre montre ce qui sera visible sur un téléphone. « Recentrer » remet au centre.
- Assombrir : voile de couleur incrusté dans l'image, de 0 à 80 % (20 % par défaut), noir par défaut ou blanc, bleu nuit, brun ou une couleur au choix. Pratique pour masquer les défauts d'une image IA et faire ressortir le texte. Pour l'image de fond, la page ajoute déjà son propre voile : 0 à 20 % suffisent en général.
- L'image d'origine n'est jamais abîmée : « Recadrer » repart toujours de l'originale (avec les derniers réglages), on peut donc dézoomer ou éclaircir plus tard.

## Mes images
- Toutes les images importées ou créées par l'IA sont gardées dans « Mes images » et réutilisables partout (fond, pancartes), sur toutes les pages du compte. Une image peut être supprimée ; si elle est utilisée sur la page, elle reste affichée tant qu'on ne la change pas.

## Page Home (mini-site à pancartes)
- « Activer la page Home » : une suite de pancartes plein écran, on passe de l'une à l'autre en glissant. Un lien « Découvrir l'entreprise » (texte modifiable) y mène depuis la page contact.
- Chaque pancarte a un titre, un texte et un style : Photo plein écran, Image + texte, ou Texte seul. Les flèches changent l'ordre ; on peut masquer ou supprimer une pancarte (10 au maximum).
- « ✨ Image IA » sur chaque pancarte : crée 2 images inspirées du titre et du texte de la pancarte. Une pancarte « Texte seul » passe automatiquement en « Photo plein écran » quand on lui ajoute une image.
- Rédaction IA des pancartes : décrire l'activité avec un maximum de détails (et la zone) ; l'IA rédige les pancartes, vous relisez, corrigez et validez. L'IA n'invente rien : elle n'utilise que ce que vous écrivez.

## QR code et carte de visite
- « ⬇ QR code (PNG) » : le QR code de la page, à imprimer ou afficher. Le QR mène toujours à nom.qrbc.app : il reste valable même si la page change.
- Cartes de visite : 22 modèles, créés à partir de la page telle qu'elle est affichée (fond, logo, nom, coordonnées des boutons et QR code). Choisir un modèle puis « ⬇ Télécharger » (JPEG prêt à imprimer).
- Les scans sont comptés dans les statistiques seulement pour les QR codes créés ou téléchargés depuis le 12 novembre 2026 : retélécharger son QR et réimprimer ses cartes pour en profiter.

## Référencement Google
- Titre et description pour Google, mots-clés, informations de la fiche « entreprise locale » ; un aperçu montre le résultat dans Google. La rédaction IA remplit ces champs automatiquement.
- À chaque enregistrement, le site publie aussi des pages lisibles par Google et le plan du site (sitemap.xml). Le référencement prend de quelques jours à quelques semaines ; il dépend aussi des détails fournis (services précis, lieux desservis).

## Appli installable
- Chaque page peut s'installer comme une appli sur téléphone, tablette ou ordinateur (bouton « Installer » en haut de la page). Sur iPhone : bouton Partager de Safari puis « Sur l'écran d'accueil ».

## Statistiques (onglet 📊)
- Sur 7, 30 ou 90 jours : visites, clics sur les boutons, visites par jour, provenance (QR code, Google, autres moteurs, réseaux sociaux, autre site, lien direct), pays, langues.
- Anonymes, sans cookie de suivi. Les visites du propriétaire (navigateur qui a ouvert l'éditeur) ne sont pas comptées : tester depuis un autre téléphone.

## Plusieurs pages et traductions (« Mes pages »)
- Le bandeau « Mes pages » / « Une autre activité ou une autre langue ? » permet d'ajouter une nouvelle page (autre activité : nouveau nom, nouvelle adresse, nouveau QR code) ou une version traduite de la page (14 langues, même adresse et même QR code, le visiteur la voit dans la langue de son téléphone, avec un choix de langue en haut à droite).
- Tout reste sur le même compte : un seul mot de passe, une seule échéance, images partagées. On passe d'une page à l'autre sans retaper le mot de passe.
- Prix : 9 € HT par an et par page ou langue, payé au prorata jusqu'à l'échéance commune, avec les crédits IA d'un abonnement. Réservé aux abonnés (pas pendant l'essai). La première traduction est offerte ; « Retraduire depuis la page d'origine » coûte 1,50 € HT (après avoir modifié la page d'origine). La version traduite peut aussi être corrigée à la main.

## Essai, abonnement et crédits IA
- Essai gratuit de 14 jours sans carte bancaire. Abonnement : 18 € HT par an (21,60 € TTC), sans renouvellement automatique : un e-mail prévient avant l'échéance (J-30, J-7, J-1) avec un bouton de paiement.
- Sans paiement à l'échéance, la page est mise en pause (données gardées 90 jours). Payer la remet en ligne.
- Inclus : essai 2 textes IA, 2 pictos, 2 créations d'images ; abonnement 10 textes, 5 pictos, 2 créations d'images par an. Une création = 2 images (fond ou pancarte).
- Au-delà : crédit prépayé, « Recharger le crédit IA » (5 € HT minimum) : 0,40 € HT le texte, 0,70 € HT le picto, 0,70 € HT la création de 2 images. Le crédit non utilisé est déduit du renouvellement.
- Chaque génération IA consomme le quota ou le crédit même si le résultat ne plaît pas (voir CGV). Les questions à l'assistant « ❓ » sont gratuites (50 par jour).
- Paiement par carte via Stripe ; facture envoyée par e-mail. Garantie satisfait ou remboursé 14 jours.

## Compte et connexion
- Connexion avec le nom de la page (ou de n'importe quelle page du compte) et le mot de passe. « Mot de passe oublié ? » envoie un lien de réinitialisation à l'adresse e-mail du compte.
- L'adresse e-mail doit être confirmée par le lien reçu à l'inscription (vérifier les indésirables ; le lien peut être renvoyé).
- Le nom de la page (l'adresse nom.qrbc.app) ne se change pas ; pour un autre nom, ajouter une nouvelle page.
- Support humain : support@qrbc.app.

## Problèmes fréquents
- La page en ligne n'a pas changé : avez-vous appuyé sur « Enregistrer » ? Attendre une minute et recharger la page (tirer vers le bas sur téléphone).
- Le texte est illisible sur la photo : Design → Texte sur l'image « Blanc » et Effet « Bandeau » ou « Ombre forte » ; ou augmenter le voile ; ou Recadrer → Assombrir.
- L'image IA ne plaît pas : relancer une création (consomme une création), changer d'ambiance ou d'idée, recadrer et assombrir, ou utiliser une vraie photo.
- Image IA refusée : éviter les marques, parcs d'attractions et personnages connus dans le texte de la pancarte.
- Le bouton avis ne marche pas : utiliser le lien « Demander des avis » de la fiche Google Business Profile.
- Quota IA épuisé : recharger le crédit IA dans la fenêtre d'abonnement (bandeau en haut).
`;
