/* Mode d'emploi du constructeur qrbc.app : sert de référence à l'assistant « ❓ Aide » de l'éditeur.
   À tenir à jour à chaque nouvelle fonction (texte en français ; l'assistant répond dans la langue du client).
   Pas d'accent grave (backtick) dans ce texte. */
export const GUIDE = `# Mode d'emploi de l'éditeur qrbc.app

Les montants et quotas à jour sont donnés à part (« Tarifs ACTUELS ») : toujours utiliser ceux-là.

qrbc.app (QR-BC, édité par KPS) permet de créer en quelques minutes, depuis un téléphone, une page mobile pour une activité (commerce, artisan, VTC, restaurant, location…), avec son QR code, des cartes de visite à imprimer et une petite appli installable. L'adresse de la page est nom.qrbc.app.

## L'écran de l'éditeur
- En haut : les onglets « Modifier » (le formulaire), « Aperçu » (la page telle que les visiteurs la verront) et « 📊 » (statistiques), le choix de la langue de l'éditeur (FR, EN, RU), le bouton « 👤 » (Mon compte) et « Quitter » (sur petit écran, « Quitter » est remplacé par « Se déconnecter » dans Mon compte).
- « 👤 Mon compte » : e-mail du compte ; informations de facturation (nom de l'entreprise ou nom, adresse, code postal, ville, pays, n° de TVA intracommunautaire facultatif), qui apparaissent sur les factures suivantes (pas sur celles déjà émises) ; « Mes factures » pour télécharger la facture PDF de chaque paiement (abonnement, recharge, page ajoutée) ; changement du mot de passe (un seul pour toutes les pages du compte, 10 caractères minimum ; les autres appareils sont déconnectés). La facture et le reçu sont aussi envoyés par e-mail après chaque paiement.
- Sous les onglets : un bandeau qui indique l'état du compte (essai et jours restants, abonnement et date d'échéance, compte offert). Le toucher ouvre la fenêtre d'abonnement et de crédit IA.
- Menu « Pages » en haut du formulaire : une ligne qui montre la rubrique en cours de modification ; la toucher déplie la liste. Dans l'ordre : « 🎨 Style » (thème, couleurs, police, forme des boutons : section Design), « 🖼️ Logo », puis les pages du site (Contact, Page Home, page personnalisée, Blog, Galerie) dans l'ordre du menu ☰, puis « 📇 QR code et cartes de visite ». Toucher une ligne l'ouvre et replie la liste.
- Sur chaque page de la liste : une case (cochée = page affichée sur le site, décochée = masquée aux visiteurs sans rien effacer) et les flèches ↑ ↓ qui règlent l'ordre du menu ☰ des visiteurs. La page Contact est la page principale : toujours affichée.
- Rubrique Contact : sections repliables Textes, Boutons et réseaux, Disposition, Image de fond, Référencement Google. Les autres rubriques s'affichent directement.
- Une page masquée reste modifiable (un bandeau rappelle qu'elle est masquée) et l'aperçu la montre quand elle est ouverte dans l'éditeur.
- Nom et picto de chaque page : en haut de chaque page ouverte dans le menu « Pages », carte « Nom et picto dans le menu du site ». Le nom est celui affiché aux visiteurs dans le menu ☰ (ou en haut à droite s'il n'y a que 2 pages) ; toucher le picto ouvre une grille de pictos standards (« Par défaut » remet celui d'origine : ✉️ Contact, 🏠 Home, 📄 page personnalisée, 📰 Blog, 📷 Galerie). Exemple : un restaurant qui montre sa carte en photos dans la galerie la renomme « Tarifs » avec le picto 💰. Dans la liste de l'éditeur, le type d'origine reste écrit en petit à côté d'un nom changé (ex. « Tarifs — Galerie photos »). Le nom de la page Contact est celui du bouton de retour vers le contact ; celui de la Home est le lien « Découvrir l'entreprise ».
- En bas, une barre fixe : à gauche le message d'état (« Modifications non enregistrées », « Publié… ») et le bouton « ❓ » de l'assistant ; à droite le bouton « Enregistrer ».
- IMPORTANT : rien n'est publié tant qu'on n'a pas appuyé sur « Enregistrer ». Après l'enregistrement, la page en ligne est à jour en moins d'une minute (recharger la page si besoin).
- L'aperçu se met à jour en direct pendant la saisie. L'aperçu montre la page ouverte dans le menu « Pages » (Home, page personnalisée, blog) ; sinon la page contact.

## Création express (⚡ « Créer mon site »)
- Pour aller vite : on décrit son activité (avec un maximum de détails : services, lieux desservis, horaires, langues parlées, ce qui vous distingue), sa zone et son téléphone. L'IA prépare tout en une minute environ : textes, pancartes de la page Home, accroche, logo, image de fond et référencement Google.
- Elle remplace les pancartes, l'accroche, le logo et le fond actuels ; les anciennes images restent dans « Mes images ».
- Ensuite : tout vérifier dans l'aperçu, corriger si besoin, puis « Enregistrer » pour publier.
- Si une étape échoue, elle peut être relancée sans frais pendant 30 minutes (« Réessayer »).
- Coût : pendant l'essai, une partie des créations gratuites ; pour un abonné, le prix de la création express (tarifs actuels) ; gratuit pour un compte offert. Pas disponible sur une version traduite.

## Textes
- Nom de l'établissement (titre), sous-titre (accroche) et texte en bas de page (adresse, horaires…).
- Sur une image de fond, la lisibilité se règle dans Design (voir plus bas).

## Boutons et réseaux
- Depuis le 25/11, tout ce qui est connu est un **picto** (icône), dans le bloc « Pictos » : Téléphone, WhatsApp, SMS, Avis Google, Itinéraire, Facebook, Instagram, X, Snapchat, TikTok, site web, YouTube, Telegram (nom, lien ou numéro), Tripadvisor, LinkedIn, E-mail. Cocher ceux à afficher et les remplir : seuls ceux qui sont remplis apparaissent sur la page. Valeurs :
  - Téléphone, SMS : le numéro ; WhatsApp : le numéro (06 12 34 56 78 ou +33 6 12 34 56 78) ; WhatsApp, SMS et E-mail ont un message pré-rempli facultatif ;
  - Avis Google : le lien « Demander des avis » de la fiche Google Business (ou son Place ID) ;
  - Itinéraire : l'adresse ou un lien Google Maps ;
  - réseaux : le nom d'utilisateur ou le lien.
- « Forme des pictos » : Rond ou Carré arrondi (vaut pour tous les pictos de la page). Dessous, deux curseurs : « Opacité du fond » (100 % = fond plein, 0 % = sans fond : le picto prend alors sa couleur) et « Opacité de la bordure » (0 % = sans bordure, 100 % = contour plein). Ex. fond 0 % + bordure 100 % = pictos en contour. « Couleurs des pictos » : Par défaut (couleur de chaque marque), Couleurs du site (couleur des boutons du design) ou Couleurs du logo (couleurs principales du logo, une par picto à tour de rôle ; il faut un logo). Les pictos de la liste de l'éditeur montrent le résultat en direct. Flèches ↑ ↓ : ordre des pictos. Le bloc entier peut être monté ou descendu (« ↑ Bloc », « ↓ Bloc »).
- Les anciens boutons Appeler / SMS / WhatsApp / E-mail / Avis / Itinéraire ont été transformés automatiquement en pictos.
- « Ajouter un bouton personnalisé… » : grand bouton avec texte, pour un lien (Payer en ligne, Réserver en ligne, Notre site, Voir la carte) ou pour mettre une action en avant (Laisser un avis Google, Réserver sur WhatsApp avec message pré-rempli, Appeler, Itinéraire, Nous écrire), ou « Bouton vide ». Action « Lien web » : n'importe quelle adresse (lien de paiement SumUp, Stripe, PayPal, réservation en ligne, menu…).
- Texte du bouton : s'il est vide, le bouton devient un picto. Couleur : celle du thème ou une couleur propre au bouton.
- Les flèches ↑ ↓ changent l'ordre ; « 🗑 Supprimer » retire le bouton. On peut aussi masquer un bouton sans le supprimer.

## Disposition
- Modèles : Centré, Boutons en haut, Boutons en bas, Barre à gauche, Barre à droite, Carte de visite, Affiche, Haut + bas, Gauche + droite.
- Les barres et les modèles « Haut + bas » et « Gauche + droite » utilisent toujours des icônes rondes. Pour ces deux derniers, la première moitié des boutons va en haut (ou à gauche), la seconde en bas (ou à droite) : l'ordre se règle avec les flèches.

## Logo
- Importer une image (logo ou photo) ou créer un logo avec « ✨ Atelier logo (IA) » (pictogrammes dessinés par l'IA, police, couleurs). Dans l'atelier, « 📷 Ma photo » prend une photo du téléphone (galerie ou appareil photo) : elle sert de motif (cadrée dans la forme, zoom, couleurs d'origine ou bichromie, nom dessous) ou d'inspiration pour les motifs IA (« Inspiration : Ma photo »). La vignette « Image de fond » utilise la photo de fond de la page.
- « Logo rond (photo) » pour afficher une photo dans un cercle.

## Design
- Thème : Sable, Nuit, Riviera, Olive, Corail, Luxe, Blanc, Lavande, Menthe, Terracotta, Océan, Ardoise, Bordeaux, Forêt, Rose poudré, Soleil, Glacier, Chocolat, Nuit étoilée (applique d'un coup les 4 couleurs). À la création, le design de départ est tiré au hasard (thème adapté à l'activité, couleur des boutons variée), pour que les sites ne se ressemblent pas. Les couleurs peuvent ensuite être changées une par une : Fond, Fond (dégradé), Texte, Boutons.
- Police : Moderne, Élégante, Classique, Arrondie, Technique. Dans la liste, chaque nom est écrit dans sa police ; Élégante, Classique et Arrondie utilisent des polices hébergées par qrbc (rendu identique sur Android, iPhone et ordinateur).
- Texte sur l'image de fond : Auto (un texte foncé passe en blanc sur la photo), Blanc, ou Couleur choisie.
- Effet pour lire le texte sur l'image : Ombre légère (conseillé), Aucun, Ombre forte, Contour, Bandeau derrière le texte. Si le titre se lit mal sur la photo : essayer « Blanc » + « Bandeau », ou assombrir l'image (voir Recadrage).
- Forme des boutons (Carré, Arrondi, Pilule), style (Plein, Contour, Doux), ombre sous les boutons, encadrer le contenu (carte), tous les boutons en pictos, noms sous les icônes (les couleurs des pictos se règlent dans le bloc Pictos).
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
- Toutes les images importées ou créées par l'IA sont gardées dans « Mes images » et réutilisables partout : la même liste apparaît sous l'image de fond de la page contact et sous chaque pancarte de la page Home et de la page personnalisée (avec aussi les photos de la galerie et du blog), sur toutes les pages du compte. Les logos ont leur propre liste. Une image peut être supprimée ; si elle est utilisée sur la page, elle reste affichée tant qu'on ne la change pas.

## Page Home (mini-site à pancartes)
- Vocabulaire : les clients appellent parfois les pancartes « cartes », « cards », « carduri », « карточки » ou « slides ». Ne pas confondre avec les cartes de visite (section QR code et carte de visite) : en cas de doute, demander de quoi il s'agit.
- Page Home (cocher sa case dans le menu « Pages » pour l'afficher) : une suite de pancartes plein écran, on passe de l'une à l'autre en glissant. Un lien « Découvrir l'entreprise » (texte modifiable), en haut à droite de la page contact, y mène.
- Dans le constructeur, les pancartes s'affichent une par une : glisser à gauche ou à droite, ou utiliser les boutons ◀ ▶ sous la pancarte (« Pancarte 2 / 5 » entre les deux). Chaque pancarte a un titre, un texte et un style : Photo plein écran, Image + texte, ou Texte seul. Les flèches ← → à côté de « 🗑 Supprimer » changent sa place dans l'ordre ; on peut masquer ou supprimer une pancarte (30 au maximum, utile par exemple pour les pages d'un menu de restaurant : une photo de page par pancarte). « ＋ Ajouter un article » affiche directement la nouvelle pancarte.
- « ✨ Image IA » sur chaque pancarte : crée 2 images inspirées du titre et du texte de la pancarte. Une pancarte « Texte seul » passe automatiquement en « Photo plein écran » quand on lui ajoute une image.
- « ✨ Texte IA » sur chaque pancarte : rédige ou améliore cette pancarte seulement, sans toucher aux autres (décompté comme un texte IA). Écrire d'abord un titre ou une idée pour choisir le sujet ; laisser vide pour que l'IA propose un sujet non traité ailleurs. « ↩ Annuler » revient au texte précédent. Pratique pour ajouter une pancarte sans tout réécrire.
- Rédaction IA de toutes les pancartes d'un coup : décrire l'activité avec un maximum de détails (et la zone) ; l'IA rédige les pancartes (10 au plus d'un coup), vous relisez, corrigez et validez. L'IA n'invente rien : elle n'utilise que ce que vous écrivez.

## Galerie photos
- Rubrique « Galerie » du menu « Pages ». Masquée par défaut : cocher sa case dans le menu pour l'afficher.
- « 📷 Ajouter des photos » : on peut en choisir plusieurs d'un coup, jusqu'à 100 photos par page. Elles sont réduites automatiquement (1280 px au plus, avec une petite vignette pour la grille) : chargement rapide et peu de place. Une photo illisible est ignorée, avec un message.
- Sur chaque vignette : ✕ retire la photo, ← → changent sa place dans l'ordre. Nom de la galerie : carte « Nom et picto » en haut de la rubrique (vide = « Galerie », traduit selon la langue de la page). Penser à enregistrer : les photos sont envoyées à ce moment-là (compteur « Envoi des images 3 / 20… »), et les photos retirées sont effacées du serveur.
- Sur la page, la galerie s'ouvre depuis le coin en haut à droite (voir « Passer d'une page à l'autre »). Elle montre une grille de vignettes ; toucher une photo l'affiche en grand, glisser à gauche/droite pour la suivante, vers le bas ou « × » pour revenir à la grille ; le bouton retour du téléphone ferme la photo puis la galerie. Sur ordinateur : flèches ‹ › et clavier (← → Échap).
- Décocher la case de la galerie dans le menu « Pages » cache le bouton sans effacer les photos. Les versions traduites de la page montrent les mêmes photos (le titre du bouton est traduit).

## Police, style, taille et couleur d'un texte
- Bouton « Aa » sous chaque titre et texte modifiable (nom, sous-titre et bas de la page contact ; titre et texte des pancartes de la Home et de la page personnalisée ; titre et texte des articles du blog) et à droite du texte de chaque bouton de la page contact.
- Il ouvre quatre choix : police (« Police du design » ou Moderne, Élégante, Classique, Arrondie, Technique), style (par défaut, normal, gras, italique, gras italique), taille (très petit, petit, normale, grand, très grand — par rapport à la taille prévue par la mise en page) et couleur du texte (décocher « Couleur du design » puis choisir la couleur dans le carré).
- Les liens placés dans un texte prennent la même couleur (ils restent soulignés).
- « Par défaut » remet le texte comme avant. Le bouton « Aa » est en couleur quand un réglage est actif.
- La police générale de la page reste réglée dans « Design » ; « Aa » ne change que le texte choisi.

## Liens dans les textes
- Sous chaque texte modifiable (sous-titre et bas de la page contact, textes des pancartes de la Home et de la page personnalisée, articles du blog) : bouton « 🔗 Lien ».
- Sélectionner des mots du texte (sur téléphone : appui long sur un mot puis étirer la sélection), puis « 🔗 Lien » : choisir une page du site (Contact, Home, page personnalisée, Blog, Galerie), un article du blog, ou une adresse externe (site, e-mail ou numéro de téléphone).
- Dans le champ, le lien s'écrit [mots](cible) : ne pas effacer les crochets ni la partie entre parenthèses. Pour le modifier ou le retirer : placer le curseur dans le lien puis « 🔗 Lien » (« Retirer le lien »).
- Sur la page, les mots apparaissent soulignés et cliquables (adresse externe : nouvel onglet). Un lien vers une page désactivée s'affiche comme du texte simple.
- « ✨ Texte IA » garde les liens ; s'il en retire, un message prévient (↩ Annuler). Les traductions gardent aussi les liens.
- Pas de lien dans les titres ni dans les boutons (les boutons ont déjà leur propre lien).

## Page personnalisée (ex. Tarifs)
- Rubrique « Page personnalisée » du menu « Pages ». Masquée par défaut : cocher sa case dans le menu pour l'afficher (le nom « Tarifs » et une première pancarte sont alors proposés).
- Nom affiché aux visiteurs : carte « Nom et picto » en haut de la rubrique (proposé : « Tarifs » ; ex. Prestations, Menu, Horaires).
- Même fonctionnement que la page Home : 1 à 30 pancartes plein écran (titre, texte, mise en page, image, ✨ Texte IA, ✨ Image IA), glisser ou ◀ ▶ pour passer de l'une à l'autre, ← → pour l'ordre.
- Pour le visiteur : page à part (nom.qrbc.app/page.html), ouverte depuis le coin en haut à droite des autres pages (nom de la page ou menu ☰). Sa place dans le menu se règle avec les flèches ↑ ↓ du menu « Pages » de l'éditeur.
- L'IA n'invente pas de prix : écrire les tarifs soi-même (ou les donner dans le texte) avant « ✨ Texte IA ».

## Page Blog
- Rubrique « Blog » du menu « Pages ». Masqué par défaut : cocher sa case dans le menu pour l'afficher. Nom du blog : carte « Nom et picto » en haut de la rubrique (vide = « Blog »).
- « ＋ Nouvel article » ajoute un article en tête (le plus récent en premier), daté du jour. Jusqu'à 50 articles.
- Les articles s'affichent un par un : glisser à gauche/droite ou boutons ◀ « Article 2 / 5 » ▶. Sur chaque article : titre, date (modifiable), photo (facultative, réduite automatiquement), texte, case « Afficher » pour le cacher sans le supprimer, ← → pour changer l'ordre, 🗑 Supprimer.
- « ✨ Texte IA » rédige ou améliore l'article affiché (décompté comme un texte IA), avec « ↩ Annuler ». Écrire d'abord un titre ou quelques idées pour choisir le sujet.
- L'aperçu (bouton « Blog » au-dessus) montre la liste ou l'article en cours.
- Pour le visiteur : page à part (nom.qrbc.app/blog.html) avec la liste des articles (photo, date, titre, début du texte) ; toucher un article l'ouvre en entier, « ← Blog » ou le retour du téléphone revient à la liste. Les versions traduites traduisent aussi les articles (bouton « Retraduire » après une modification).

## Passer d'une page à l'autre (visiteurs)
- Les pages possibles : Contact, Home, page personnalisée (ex. Tarifs), Blog, Galerie (chacune si activée).
- 2 pages en tout : le nom de l'autre page s'affiche en haut à droite (ex. « Découvrir l'entreprise » sur la page contact, « Contact » dans la barre de la Home ou du blog, « 📷 Galerie »).
- À partir de 3 : un picto ☰ en haut à droite ouvre la liste des pages pour choisir (la page en cours est marquée).
- Ordre des pages dans ce menu : flèches ↑ ↓ du menu « Pages » de l'éditeur. Les pages masquées y restent (en grisé) pour garder leur place.
- « Installer » et le choix de langue sont en haut à gauche de la page contact.

## QR code et carte de visite
- « ⬇ QR code (PNG) » : le QR code de la page, à imprimer ou afficher. Le QR mène toujours à nom.qrbc.app : il reste valable même si la page change.
- « Le QR code ouvre » (section QR code et carte de visite, sous le QR code) : Page contact (par défaut), Page Home (proposé seulement si la page Home est activée) ou **Lien personnel**. Avec « Lien personnel », on indique une adresse (ex. https://monsite.fr, « https:// » ajouté si oublié) : le scan du QR code ouvre ce lien, alors que la page qrbc reste visible à son adresse habituelle. Le QR imprimé ne change pas (il passe toujours par nom.qrbc.app) : on peut changer de lien à tout moment sans réimprimer, et les scans restent comptés dans les statistiques. Penser à enregistrer.
- Cartes de visite : 22 modèles, créés à partir de la page telle qu'elle est affichée (fond, logo et QR code). Choisir un modèle puis « ⬇ Télécharger » (JPEG prêt à imprimer).
- « Informations sur la carte » (juste au-dessus de « Voir les modèles de carte ») : cocher les informations à imprimer parmi Nom de l'entreprise, Slogan, Téléphone, E-mail, Site web. Elles sont reprises de la page (titre, accroche, boutons ; site = lien « Site » ou l'adresse nom.qrbc.app) et modifiables ici pour imprimer un autre numéro ou un autre e-mail sans changer la page ; « ↺ Reprendre la page » remet la valeur de la page. Penser à enregistrer ; les modèles affichés se mettent à jour.
- « Logo sur la carte » (sous « QR code sur la carte ») : deux cases « Au recto » et « Au verso » ; décochées, le logo n'est pas imprimé sur cette face (la page garde son logo) ; grisées s'il n'y a pas de logo. Le logo ne compte pas dans les 5 informations. Ordre : ↑ ↓ ; téléphone, e-mail et site restent sous le slogan, mais un champ perso peut monter entre le nom et le slogan, ou au-dessus du nom (ex. « Artisan depuis 1990 » au-dessus du nom).
- « QR code sur la carte » (en tête de « Informations sur la carte », avant le logo) : deux cases, « Au recto » et « Au verso » (cochées par défaut). Une face sans QR garde la même composition, la place du QR (et « Scannez-moi ») restant vide. Si recto et verso ont le même réglage (QR et logo), chaque modèle est montré une fois ; s'ils diffèrent (QR ou logo sur une seule face), chaque modèle est montré deux fois, « · Recto » et « · Verso » (même modèle, seuls le QR et le logo changent), et chaque face se télécharge à part. « Verso QR » et « Verso couleur » restent proposés comme recto ou verso. La commande de cartes imprimées suit ce réglage : quand recto et verso diffèrent, le verso est coché d'office et reprend le même modèle que le recto. L'appli « Ma carte sur l'écran d'accueil » montre toujours les cartes avec QR.
- Champs perso de la carte : « ＋ Ajouter un champ » sous la liste (5 champs perso au plus) → type (Téléphone, E-mail, Site web, Texte), étiquette facultative (ex. « Portable », « Bureau » ; sinon Tél., E-mail, Web) et valeur ; 🗑 pour le retirer. Exemple : 3 numéros de téléphone. Au total 5 informations cochées au plus sur la carte (décocher une ligne pour en cocher une autre). Un champ coché mais laissé vide n'est pas ignoré : il fait un espace (une ligne vide) sur la carte, pratique pour aérer ou séparer des groupes d'informations. Flèches ↑ ↓ sur chaque coordonnée (téléphone, e-mail, site, champs perso) pour changer l'ordre ; le nom et le slogan restent en haut de la carte.
- Bouton « Aa » sous chaque information de la carte (nom, slogan, téléphone, e-mail, site) : police, style (gras, italique…), taille (très petit à très grand) et couleur du texte sur la carte, pour les 22 modèles. Indépendant des « Aa » de la page : la page ne change pas. Sur les modèles où la place manque, un texte agrandi reste réduit pour tenir dans la carte. « Par défaut » remet le texte du modèle.
- « 📲 Ma carte sur l'écran d'accueil » (entre les modèles et la commande) : installe sur le téléphone une appli séparée nommée « QR-nom de la page », en plus de l'appli de la page (les deux restent sur l'écran d'accueil) qui affiche la carte de visite en plein écran, en paysage, pour la faire scanner ou photographier sans l'imprimer ; elle marche aussi sans réseau et garde l'écran allumé. Toucher jusqu'à 6 cartes dans l'ordre (numéros sur les vignettes) puis « Installer l'appli » : la page est enregistrée, puis la page de l'appli (nom--carte.qrbc.app) s'ouvre toute seule avec la fenêtre d'installation ; Android/Chrome → toucher « Installer » ; iPhone/Safari → Partager puis « Sur l'écran d'accueil ». Si l'installation n'est pas proposée (appli qrbc ouverte depuis l'écran d'accueil), ouvrir le lien affiché dans Chrome ou Safari. Dans l'appli, la 1re carte s'affiche par défaut, ensuite la dernière regardée ; toucher ou glisser la carte passe à la suivante. Bouton « ⤴ Partager » en bas à droite : ouvre le menu de partage du téléphone (WhatsApp, Telegram, SMS, e-mail, copier…) avec l'image de la carte affichée et un message « Voici ma carte de visite : nom + lien de la page » ; si l'appli choisie refuse les images, le lien seul est envoyé ; sur ordinateur, le lien est copié. L'appli et le message de partage sont dans la langue de la page (pas celle du téléphone). Téléphone tenu droit : la carte est tournée pour être lue en paysage. Les cartes de l'appli se mettent à jour toutes seules à chaque enregistrement de la page.
- « 🛒 Commander mes cartes imprimées » (quand le service l'a ouvert) : choisir le recto en faisant glisser les modèles, activer si besoin un verso, choisir la quantité (50, 100 ou 250) ; le prix affiché = cartes + livraison, TTC. Puis adresses de facturation (reprise de « Mon compte ») et de livraison (la même par défaut, ou une autre), mémorisées pour la fois suivante ; puis vérification des cartes et paiement par carte bancaire. Papier mat 300 g, 85 × 55 mm, livraison suivie, en général sous 1 à 2 semaines (2 à 5 jours ouvrés d'impression, puis 2 à 6 jours de transport ; le transporteur envoie le numéro de suivi par e-mail). Les cartes verticales sont imprimées tournées dans le format paysage. Produit personnalisé : pas de droit de rétractation ; en cas de défaut d'impression, écrire à support@qrbc.app. Facture dans « Mon compte ».
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
- Le bandeau « Mes sites » / « Une autre activité ou une autre langue ? » permet d'ajouter un nouveau site (autre activité : nouveau nom, nouvelle adresse, nouveau QR code) ou une version traduite de la page (14 langues, même adresse et même QR code, le visiteur la voit dans la langue de son téléphone, avec un choix de langue en haut à droite).
- Tout reste sur le même compte : un seul mot de passe, une seule échéance, images partagées, et une réserve IA commune (créations incluses et crédit IA utilisables sur n'importe quelle page ; chaque page ajoutée apporte les créations d'un abonnement). On passe d'une page à l'autre sans retaper le mot de passe.
- Prix (tarifs actuels) : moitié prix de l'abonnement, par mois ou par an selon la formule ; la page s'ajoute comme une ligne de l'abonnement (« Ajouter à mon abonnement ») et seul le prorata jusqu'à la prochaine échéance est prélevé tout de suite sur la carte enregistrée ; crédits IA d'un abonnement inclus. Réservé aux abonnés (pas pendant l'essai, ni pendant la période gratuite qui suit un abonnement souscrit avant la fin de l'essai). Une page supprimée sort de l'abonnement à l'échéance suivante. La première traduction est offerte ; « Retraduire depuis la page d'origine » est payant (tarifs actuels ; après avoir modifié la page d'origine). La version traduite peut aussi être corrigée à la main. Sur la version traduite, « 🎨 Reprendre images et style de la page d'origine (gratuit) » recopie depuis la page d'origine le design et les couleurs, le logo, l'image de fond, les numéros et liens des boutons, les pages affichées et leur ordre, les pictos des pages, les images des pancartes et le nombre de pancartes, en gardant tous les textes traduits et les cartes de visite. Une fenêtre prévient si le nombre de pancartes, de boutons ou d'articles du blog diffère : les pancartes en plus arrivent avec le texte de la page d'origine (à traduire), celles en trop sont retirées en fin de liste. Ensuite « Enregistrer » pour publier.

## Essai, abonnement et crédits IA
- Essai gratuit d'un mois (30 jours) sans carte bancaire, pour tout le monde ; un code promo peut ajouter des jours. Rappels par e-mail 7 jours et 1 jour avant la fin de l'essai.
- Deux formules d'abonnement (prix dans les tarifs actuels), choisies dans « Mon abonnement » (bandeau en haut de l'éditeur) :
  - mensuelle : prélevée chaque mois, sans engagement, résiliable à tout moment (effet à la fin du mois payé) ;
  - annuelle : prélevée chaque année, « 2 mois offerts » par rapport au mensuel, engagement d'un an, résiliable à tout moment avec effet à la fin de l'année payée (pas de remboursement au prorata). Un e-mail prévient entre 35 et 30 jours avant chaque reconduction.
- S'abonner avant la fin de l'essai ne fait rien perdre : le premier prélèvement a lieu à la fin de l'essai. Les anciens abonnés (paiement annuel unique) choisissent une formule avant leur échéance ; le premier prélèvement a lieu à la fin de leur période déjà payée.
- Reconduction automatique par carte (Stripe). Dans « Mon abonnement » : formule, prochain prélèvement, « Carte bancaire et factures » (changer de carte, télécharger les factures), « Passer à l'annuel » (tout de suite, le mois en cours est déduit, quotas annuels immédiats), « Passer au mensuel à l'échéance », « Résilier mon abonnement » (écran de confirmation puis e-mail de confirmation ; la page reste en ligne jusqu'à la fin de la période payée), « Reprendre mon abonnement » tant que la période n'est pas finie.
- Carte refusée : un e-mail prévient, Stripe réessaie automatiquement ; mettre à jour la carte dans « Carte bancaire et factures ». La page reste en ligne quelques jours.
- Abonnement terminé (résilié ou impayé) : la page est mise en pause, données gardées 90 jours ; se réabonner la remet en ligne à l'identique.
- Quotas IA inclus : pendant l'essai ; par mois avec la formule mensuelle ; par an avec la formule annuelle (voir les tarifs actuels). Ils repartent à zéro à chaque prélèvement. Une création d'images = 2 images (fond ou pancarte). Quota mensuel épuisé : recharger le crédit IA ou passer à l'annuel.
- Au-delà : crédit prépayé, « Recharger le crédit IA » (montant minimum et prix unitaires dans les tarifs actuels). Le crédit reste utilisable tant que le compte est actif.
- Chaque génération IA consomme le quota ou le crédit même si le résultat ne plaît pas (voir CGV). Les questions à l'assistant « ❓ » sont gratuites (50 par jour).
- Paiement par carte via Stripe ; factures envoyées par e-mail et téléchargeables dans « Mon compte ». Garantie satisfait ou remboursé 14 jours, et droit de rétractation de 14 jours pour les particuliers.

## Compte et connexion
- Connexion avec le nom de la page (ou de n'importe quelle page du compte) ou l'adresse e-mail du compte, et le mot de passe. « Mot de passe oublié ? » envoie un lien de réinitialisation à l'adresse e-mail du compte.
- Inscription en deux temps : sur l'accueil ou l'appli, le client indique le nom de son entreprise ou son activité (facultatif) et son e-mail, puis reçoit un lien « Créer mon site » (valable 7 jours ; vérifier les indésirables ; « Renvoyer le lien » et « Corriger l'adresse » sur l'écran d'attente). Le lien ouvre « Finalisez votre site » : en haut le nom de l'entreprise ou de l'activité (facultatif, repris s'il avait été saisi), puis l'adresse du site, vide : le client la tape ou choisit une idée dans la liste qui s'affiche sous le champ (idées tirées du nom de l'activité, disponibilité vérifiée en direct), puis un seul champ mot de passe (bouton 👁 pour l'afficher). « Créer mon site » crée le compte, lance l'essai gratuit d'un mois et ouvre l'éditeur. Lien expiré : la page propose d'en recevoir un nouveau. Lien déjà utilisé : se connecter avec son mot de passe.
- Comptes créés avant le 19/11/2026 : l'adresse e-mail doit être confirmée par le lien reçu à l'inscription (le lien peut être renvoyé depuis l'écran de connexion).
- Changer l'adresse du site (nom.qrbc.app) : 👤 Mon compte → « Adresse du site » → « Changer l'adresse du site… » : nouvelle adresse (idées proposées d'après le nom de l'activité, disponibilité vérifiée), mot de passe, case « J'ai compris ». Le site, les images, les statistiques, l'abonnement et les versions traduites suivent ; le mot de passe ne change pas ; ensuite connexion avec la nouvelle adresse ou l'e-mail ; un e-mail récapitulatif est envoyé. ⚠️ L'ancienne adresse cesse de fonctionner et peut être prise par quelqu'un d'autre : les QR codes, cartes et liens déjà partagés qui la contiennent ne mènent plus au site (retélécharger le QR et les cartes). Trois changements par jour au plus. Une version traduite suit l'adresse de sa page d'origine.
- Support humain : support@qrbc.app.

## Problèmes fréquents
- La page en ligne n'a pas changé : avez-vous appuyé sur « Enregistrer » ? Attendre une minute et recharger la page (tirer vers le bas sur téléphone).
- Le texte est illisible sur la photo : Design → Texte sur l'image « Blanc » et Effet « Bandeau » ou « Ombre forte » ; ou augmenter le voile ; ou Recadrer → Assombrir.
- L'image IA ne plaît pas : relancer une création (consomme une création), changer d'ambiance ou d'idée, recadrer et assombrir, ou utiliser une vraie photo.
- Image IA refusée : éviter les marques, parcs d'attractions et personnages connus dans le texte de la pancarte.
- Le bouton avis ne marche pas : utiliser le lien « Demander des avis » de la fiche Google Business Profile.
- Quota IA épuisé : recharger le crédit IA dans la fenêtre d'abonnement (bandeau en haut).
`;
