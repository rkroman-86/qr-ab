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
- Le formulaire est fait de sections repliables : Textes, Boutons et réseaux, Disposition, Logo, Design, Image de fond, Page Home, QR code et carte de visite, Référencement Google.
- En bas, une barre fixe : à gauche le message d'état (« Modifications non enregistrées », « Publié… ») et le bouton « ❓ » de l'assistant ; à droite le bouton « Enregistrer ».
- IMPORTANT : rien n'est publié tant qu'on n'a pas appuyé sur « Enregistrer ». Après l'enregistrement, la page en ligne est à jour en moins d'une minute (recharger la page si besoin).
- L'aperçu se met à jour en direct pendant la saisie. Quand on modifie la section Page Home, l'aperçu montre la Home ; sinon la page contact.

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
- Vocabulaire : les clients appellent parfois les pancartes « cartes », « cards », « carduri », « карточки » ou « slides ». Ne pas confondre avec les cartes de visite (section QR code et carte de visite) : en cas de doute, demander de quoi il s'agit.
- « Activer la page Home » : une suite de pancartes plein écran, on passe de l'une à l'autre en glissant. Un lien « Découvrir l'entreprise » (texte modifiable) y mène depuis la page contact.
- Chaque pancarte a un titre, un texte et un style : Photo plein écran, Image + texte, ou Texte seul. Les flèches changent l'ordre ; on peut masquer ou supprimer une pancarte (10 au maximum).
- « ✨ Image IA » sur chaque pancarte : crée 2 images inspirées du titre et du texte de la pancarte. Une pancarte « Texte seul » passe automatiquement en « Photo plein écran » quand on lui ajoute une image.
- « ✨ Texte IA » sur chaque pancarte : rédige ou améliore cette pancarte seulement, sans toucher aux autres (décompté comme un texte IA). Écrire d'abord un titre ou une idée pour choisir le sujet ; laisser vide pour que l'IA propose un sujet non traité ailleurs. « ↩ Annuler » revient au texte précédent. Pratique pour ajouter une pancarte sans tout réécrire.
- Rédaction IA de toutes les pancartes d'un coup : décrire l'activité avec un maximum de détails (et la zone) ; l'IA rédige les pancartes, vous relisez, corrigez et validez. L'IA n'invente rien : elle n'utilise que ce que vous écrivez.

## QR code et carte de visite
- « ⬇ QR code (PNG) » : le QR code de la page, à imprimer ou afficher. Le QR mène toujours à nom.qrbc.app : il reste valable même si la page change.
- « Le QR code ouvre » (dans Page Home si elle est activée, sinon sous le QR code) : Page contact, Page Home ou **Lien personnel**. Avec « Lien personnel », on indique une adresse (ex. https://monsite.fr, « https:// » ajouté si oublié) : le scan du QR code ouvre ce lien, alors que la page qrbc reste visible à son adresse habituelle. Le QR imprimé ne change pas (il passe toujours par nom.qrbc.app) : on peut changer de lien à tout moment sans réimprimer, et les scans restent comptés dans les statistiques. Penser à enregistrer.
- Cartes de visite : 22 modèles, créés à partir de la page telle qu'elle est affichée (fond, logo, nom, coordonnées des boutons et QR code). Choisir un modèle puis « ⬇ Télécharger » (JPEG prêt à imprimer).
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
- Le bandeau « Mes pages » / « Une autre activité ou une autre langue ? » permet d'ajouter une nouvelle page (autre activité : nouveau nom, nouvelle adresse, nouveau QR code) ou une version traduite de la page (14 langues, même adresse et même QR code, le visiteur la voit dans la langue de son téléphone, avec un choix de langue en haut à droite).
- Tout reste sur le même compte : un seul mot de passe, une seule échéance, images partagées, et une réserve IA commune (créations incluses et crédit IA utilisables sur n'importe quelle page ; chaque page ajoutée apporte les créations d'un abonnement). On passe d'une page à l'autre sans retaper le mot de passe.
- Prix (tarifs actuels) : moitié prix de l'abonnement, par mois ou par an selon la formule ; la page s'ajoute comme une ligne de l'abonnement (« Ajouter à mon abonnement ») et seul le prorata jusqu'à la prochaine échéance est prélevé tout de suite sur la carte enregistrée ; crédits IA d'un abonnement inclus. Réservé aux abonnés (pas pendant l'essai, ni pendant la période gratuite qui suit un abonnement souscrit avant la fin de l'essai). Une page supprimée sort de l'abonnement à l'échéance suivante. La première traduction est offerte ; « Retraduire depuis la page d'origine » est payant (tarifs actuels ; après avoir modifié la page d'origine). La version traduite peut aussi être corrigée à la main.

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
- Connexion avec le nom de la page (ou de n'importe quelle page du compte) et le mot de passe. « Mot de passe oublié ? » envoie un lien de réinitialisation à l'adresse e-mail du compte.
- Inscription en deux temps : sur l'accueil ou l'appli, le client indique son activité et son e-mail, puis reçoit un lien « Créer ma page » (valable 7 jours ; vérifier les indésirables ; « Renvoyer le lien » et « Corriger l'adresse » sur l'écran d'attente). Le lien ouvre « Finalisez votre page » : l'adresse de la page est proposée automatiquement d'après l'activité (modifiable, disponibilité vérifiée en direct), le nom de l'activité est prérempli, un seul champ mot de passe (bouton 👁 pour l'afficher). « Créer ma page » crée le compte, lance l'essai gratuit d'un mois et ouvre l'éditeur. Lien expiré : la page propose d'en recevoir un nouveau. Lien déjà utilisé : se connecter avec son mot de passe.
- Comptes créés avant le 19/11/2026 : l'adresse e-mail doit être confirmée par le lien reçu à l'inscription (le lien peut être renvoyé depuis l'écran de connexion).
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
