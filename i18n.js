/* =========================================================
   i18n.js — langue de l'interface du constructeur (FR / EN / RU)
   Le français sert de clé. Seule l'interface est traduite :
   le contenu saisi par le client et la page publique ne changent pas.
   ========================================================= */
(function () {
  'use strict';

  const LANGUES = { fr: 'FR', en: 'EN', ru: 'RU' };
  const CLE = 'qp-langue';

  // 'texte français': ['English', 'Русский']
  const D = {
    /* --- Appli : écran de démarrage (connexion, inscription, mot de passe) --- */
    'Créer ma page': ['Create my page', 'Создать страницу'],
    'Bon retour': ['Welcome back', 'С возвращением'],
    'Connectez-vous pour modifier votre page.': ['Sign in to edit your page.', 'Войдите, чтобы редактировать свою страницу.'],
    'Mes pages': ['My pages', 'Мои страницы'],
    'ou une autre page': ['or another page', 'или другая страница'],
    'Adresse de la page': ['Page address', 'Адрес страницы'],
    'Mot de passe oublié ?': ['Forgot your password?', 'Забыли пароль?'],
    'Pas encore de page ?': ['No page yet?', 'Ещё нет страницы?'],
    'Créer ma page →': ['Create my page →', 'Создать страницу →'],
    'Mot de passe oublié': ['Forgotten password', 'Восстановление пароля'],
    'Indiquez l’adresse de votre page ou votre e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.': ['Enter your page address or your email: we will send you a link to choose a new password.', 'Укажите адрес страницы или e-mail: мы пришлём ссылку для выбора нового пароля.'],
    'Adresse de la page ou e-mail': ['Page address or email', 'Адрес страницы или e-mail'],
    'votre-nom ou vous@exemple.fr': ['your-name or you@example.com', 'ваше-имя или вы@пример.ru'],
    'votre-nom': ['your-name', 'ваше-имя'],
    'Recevoir le lien': ['Send me the link', 'Получить ссылку'],
    '← Retour à la connexion': ['← Back to sign in', '← Назад ко входу'],
    'Votre page en 3 minutes': ['Your page in 3 minutes', 'Ваша страница за 3 минуты'],
    '14 jours gratuits, sans carte bancaire.': ['14 days free, no credit card.', '14 дней бесплатно, без банковской карты.'],
    'Une page mobile à votre nom, avec QR code': ['A mobile page in your name, with a QR code', 'Мобильная страница на ваше имя с QR-кодом'],
    'Cartes de visite prêtes à imprimer': ['Print-ready business cards', 'Визитки, готовые к печати'],
    'Textes et logo avec l’aide de l’IA': ['Texts and logo with AI help', 'Тексты и логотип с помощью ИИ'],
    'Adresse de votre page': ['Your page address', 'Адрес вашей страницы'],
    'Nom de votre activité': ['Your business name', 'Название вашего дела'],
    'Ex. Chauffeur Privé Paris': ['E.g. Paris Private Driver', 'Напр. Частный водитель Париж'],
    'Mot de passe (10 caractères minimum)': ['Password (at least 10 characters)', 'Пароль (не менее 10 символов)'],
    'Confirmez le mot de passe': ['Confirm the password', 'Повторите пароль'],
    'J’accepte les conditions d’utilisation du service.': ['I accept the terms of use of the service.', 'Я принимаю условия использования сервиса.'],
    'Déjà une page ?': ['Already have a page?', 'Уже есть страница?'],
    '← Se connecter': ['← Sign in', '← Войти'],
    'Nouveau mot de passe': ['New password', 'Новый пароль'],
    'Vérification du lien…': ['Checking the link…', 'Проверка ссылки…'],
    'Nouveau mot de passe (10 caractères minimum)': ['New password (at least 10 characters)', 'Новый пароль (не менее 10 символов)'],
    'Enregistrer et ouvrir ma page': ['Save and open my page', 'Сохранить и открыть страницу'],
    'Refaire une demande': ['Request a new link', 'Запросить новую ссылку'],
    'Retirer de la liste': ['Remove from the list', 'Убрать из списка'],
    'Pancartes': ['Panels', 'Панели'],
    'Connexion…': ['Signing in…', 'Вход…'],
    'Adresse trop courte.': ['Address too short.', 'Слишком короткий адрес.'],
    'Aucune page à cette adresse.': ['No page at this address.', 'По этому адресу нет страницы.'],
    'Pas de connexion internet.': ['No internet connection.', 'Нет подключения к интернету.'],
    'Connexion impossible.': ['Cannot connect.', 'Не удалось подключиться.'],
    'Envoi…': ['Sending…', 'Отправка…'],
    'Erreur': ['Error', 'Ошибка'],
    'Création de votre page…': ['Creating your page…', 'Создаём вашу страницу…'],
    'Identiques, mais 10 caractères minimum': ['Identical, but at least 10 characters', 'Совпадают, но нужно не менее 10 символов'],
    'Les deux mots de passe sont identiques': ['Both passwords match', 'Пароли совпадают'],
    'Les deux mots de passe ne sont pas identiques': ['The two passwords do not match', 'Пароли не совпадают'],
    '← Autre page': ['← Another page', '← Другая страница'],
    /* messages du serveur affichés sur ces écrans */
    'Les deux mots de passe ne sont pas identiques.': ['The two passwords do not match.', 'Пароли не совпадают.'],
    'Mot de passe : 10 caractères minimum.': ['Password: at least 10 characters.', 'Пароль: не менее 10 символов.'],
    'Mot de passe trop long.': ['Password too long.', 'Слишком длинный пароль.'],
    'Merci d’accepter les conditions d’utilisation.': ['Please accept the terms of use.', 'Пожалуйста, примите условия использования.'],
    // --- abonnement, création express, images IA, appli installable (novembre 2026) ---
    "Essai gratuit": ["Free trial", "Пробный период"],
    "Essai terminé": ["Trial ended", "Пробный период закончился"],
    "Essai terminé.": ["Trial ended.", "Пробный период закончился."],
    "Abonnement inactif": ["Subscription inactive", "Подписка неактивна"],
    "Abonnement inactif.": ["Subscription inactive.", "Подписка неактивна."],
    "Abonnement actif": ["Active subscription", "Подписка активна"],
    "Abonnement expiré": ["Subscription expired", "Подписка истекла"],
    "Compte offert": ["Complimentary account", "Бесплатный аккаунт"],
    "Compte suspendu": ["Account suspended", "Аккаунт приостановлен"],
    "Mon abonnement": ["My subscription", "Моя подписка"],
    "Toutes les fonctions sont incluses.": ["All features are included.", "Все функции включены."],
    "Votre page est en pause. Abonnez-vous pour la remettre en ligne.": ["Your page is paused. Subscribe to put it back online.", "Ваша страница приостановлена. Оформите подписку, чтобы снова её опубликовать."],
    "Rédactions IA restantes": ["AI writings left", "Осталось генераций текста"],
    "Créations de motifs restantes": ["Symbol creations left", "Осталось генераций символов"],
    "Créations d’images de fond restantes": ["Background image creations left", "Осталось генераций фона"],
    "Crédit IA": ["AI credit", "Кредит ИИ"],
    "IA illimitée (compte offert)": ["Unlimited AI (complimentary account)", "ИИ без ограничений (бесплатный аккаунт)"],
    "Quota de l’année utilisé.": ["This year’s quota is used up.", "Годовой лимит исчерпан."],
    "S’abonner": ["Subscribe", "Подписаться"],
    "S’abonner sans attendre la fin de l’essai": ["Subscribe without waiting for the end of the trial", "Подписаться, не дожидаясь конца пробного периода"],
    "Renouveler": ["Renew", "Продлить"],
    "Renouveler pour un an": ["Renew for one year", "Продлить на год"],
    "Renouveler avec mon crédit": ["Renew with my credit", "Продлить за счёт кредита"],
    "Recharger": ["Top up", "Пополнить"],
    "Recharger le crédit IA (montant HT)": ["Top up AI credit (amount excl. VAT)", "Пополнить кредит ИИ (сумма без НДС)"],
    "€ HT": ["€ excl. VAT", "€ без НДС"],
    "Votre page, votre QR code et vos cartes de visite": ["Your page, your QR code and your business cards", "Ваша страница, QR-код и визитки"],
    "🔒 Paiement sécurisé par Stripe : carte, Apple Pay, Google Pay. Facture envoyée par e-mail.": ["🔒 Secure payment by Stripe: card, Apple Pay, Google Pay. Invoice sent by email.", "🔒 Безопасная оплата через Stripe: карта, Apple Pay, Google Pay. Счёт придёт на e-mail."],
    "Ouverture du paiement sécurisé…": ["Opening secure payment…", "Открываем безопасную оплату…"],
    "Des modifications ne sont pas enregistrées. Continuer vers le paiement ?": ["Some changes are not saved. Continue to payment?", "Есть несохранённые изменения. Перейти к оплате?"],
    "Paiement annulé : rien n’a été débité.": ["Payment cancelled: nothing was charged.", "Оплата отменена: деньги не списаны."],
    "✓ Paiement reçu, merci ! Votre compte est à jour.": ["✓ Payment received, thank you! Your account is up to date.", "✓ Оплата получена, спасибо! Ваш аккаунт обновлён."],
    "✓ Abonnement renouvelé grâce à votre crédit.": ["✓ Subscription renewed with your credit.", "✓ Подписка продлена за счёт вашего кредита."],
    "Paiement en cours de confirmation par votre banque. Votre compte se mettra à jour automatiquement.": ["Your bank is confirming the payment. Your account will update automatically.", "Банк подтверждает оплату. Аккаунт обновится автоматически."],
    "⚡ Création express": ["⚡ Express creation", "⚡ Быстрое создание"],
    "Créer mon site": ["Create my site", "Создать мой сайт"],
    "Pressé ? Décrivez votre activité : l’IA prépare tout votre site en une minute.": ["In a hurry? Describe your business: the AI prepares your whole site in a minute.", "Торопитесь? Опишите свою деятельность: ИИ подготовит весь сайт за минуту."],
    "Un formulaire va s’ouvrir pour créer votre site à partir de la description de votre activité et de votre zone d’action.": ["A form will open to create your site from the description of your business and your service area.", "Откроется форма: сайт будет создан по описанию вашей деятельности и зоне работы."],
    "L’IA rédige 5 pancartes sur votre activité pour la page Home, ainsi que le référencement Google.": ["The AI writes 5 slides about your business for the Home page, plus the Google SEO.", "ИИ напишет 5 слайдов о вашей деятельности для главной страницы, а также тексты для Google."],
    "Elle dessine 3 pictogrammes pour votre logo.": ["It draws 3 symbols for your logo.", "Нарисует 3 символа для логотипа."],
    "Elle crée 2 images de fond.": ["It creates 2 background images.", "Создаст 2 фоновых изображения."],
    "Si vous indiquez un téléphone, les boutons Appeler et WhatsApp sont ajoutés.": ["If you enter a phone number, the Call and WhatsApp buttons are added.", "Если указать телефон, добавятся кнопки «Позвонить» и WhatsApp."],
    "Les pancartes de la page Home, l’accroche, le logo et le fond sont remplacés par les nouveaux (avec des couleurs lisibles sur la photo). Vos anciennes images et anciens pictogrammes restent disponibles pour les réutiliser.": ["The Home page slides, the tagline, the logo and the background are replaced by the new ones (with colours readable over the photo). Your previous images and symbols remain available for reuse.", "Слайды главной страницы, подзаголовок, логотип и фон будут заменены новыми (с цветами, читаемыми на фото). Прежние изображения и символы останутся доступны."],
    "Rien n’est publié tant que vous n’appuyez pas sur Enregistrer.": ["Nothing is published until you press Save.", "Ничего не публикуется, пока вы не нажмёте «Сохранить»."],
    "Inclus dans votre compte offert.": ["Included in your complimentary account.", "Входит в ваш бесплатный аккаунт."],
    "Accepter": ["Accept", "Принять"],
    "Confirmer": ["Confirm", "Подтвердить"],
    "⚡ Votre activité": ["⚡ Your business", "⚡ Ваша деятельность"],
    "Quelques mots suffisent : l’IA s’occupe du reste.": ["A few words are enough: the AI does the rest.", "Достаточно нескольких слов: остальное сделает ИИ."],
    "Nom de l’entreprise": ["Business name", "Название компании"],
    "Votre activité": ["Your business", "Ваша деятельность"],
    "Zone d’action": ["Service area", "Зона работы"],
    "Téléphone (Appeler et WhatsApp)": ["Phone (Call and WhatsApp)", "Телефон (звонок и WhatsApp)"],
    "Ton des textes": ["Tone of the texts", "Тон текстов"],
    "Ex. : 06 12 34 56 78 (facultatif)": ["E.g. 06 12 34 56 78 (optional)", "Напр. 06 12 34 56 78 (необязательно)"],
    "Ex. : Alex VTC": ["E.g. Alex VTC", "Напр. Alex VTC"],
    "Ex. : Nice, Monaco, Cannes et toute la Côte d’Azur": ["E.g. Nice, Monaco, Cannes and the whole French Riviera", "Напр. Ницца, Монако, Канны и всё Лазурное побережье"],
    "Indiquez le nom de votre entreprise.": ["Enter your business name.", "Укажите название компании."],
    "Numéro de téléphone incomplet.": ["Incomplete phone number.", "Неполный номер телефона."],
    "⚡ Création en cours…": ["⚡ Creating…", "⚡ Создаём…"],
    "Environ une minute. Gardez cette fenêtre ouverte.": ["About a minute. Keep this window open.", "Около минуты. Не закрывайте это окно."],
    "Réservation de la création express": ["Booking the express creation", "Бронирование быстрого создания"],
    "Création express déjà réglée : reprise sans frais": ["Express creation already paid: resumed at no cost", "Быстрое создание уже оплачено: продолжаем бесплатно"],
    "5 pancartes et référencement Google": ["5 slides and Google SEO", "5 слайдов и тексты для Google"],
    "3 pictogrammes pour le logo": ["3 symbols for the logo", "3 символа для логотипа"],
    "2 images de fond": ["2 background images", "2 фоновых изображения"],
    "Création express impossible": ["Express creation unavailable", "Быстрое создание недоступно"],
    "✓ Votre site est prêt": ["✓ Your site is ready", "✓ Ваш сайт готов"],
    "Vérifiez tout : textes, boutons, logo et images (l’aperçu est à jour). Puis appuyez sur « Enregistrer » en bas de l’écran pour publier.": ["Check everything: texts, buttons, logo and images (the preview is up to date). Then press “Save” at the bottom of the screen to publish.", "Проверьте всё: тексты, кнопки, логотип и изображения (предпросмотр обновлён). Затем нажмите «Сохранить» внизу экрана, чтобы опубликовать."],
    "Vérifier mon site": ["Check my site", "Проверить сайт"],
    "Presque terminé": ["Almost done", "Почти готово"],
    "Une étape n’a pas abouti. Elle est déjà réglée : vous pouvez la relancer sans frais pendant 30 minutes.": ["One step failed. It is already paid: you can retry it at no cost for 30 minutes.", "Один шаг не удался. Он уже оплачен: его можно повторить бесплатно в течение 30 минут."],
    "Réessayer": ["Retry", "Повторить"],
    "Mon abonnement": ["My subscription", "Моя подписка"],
    "Site créé : vérifiez puis cliquez sur Enregistrer": ["Site created: check it, then click Save", "Сайт создан: проверьте и нажмите «Сохранить»"],
    "La création express n’est pas disponible.": ["Express creation is not available.", "Быстрое создание недоступно."],
    "Votre essai est terminé : abonnez-vous pour utiliser la création express.": ["Your trial has ended: subscribe to use express creation.", "Пробный период закончился: оформите подписку для быстрого создания."],
    "Abonnement inactif : la création express est désactivée.": ["Subscription inactive: express creation is disabled.", "Подписка неактивна: быстрое создание отключено."],
    "Les essais de cette étape de la création express sont épuisés. Rien n’a été décompté : écrivez-nous si le problème continue.": ["The attempts for this express creation step are used up. Nothing was charged: contact us if the problem continues.", "Попытки для этого шага исчерпаны. Ничего не списано: напишите нам, если проблема повторится."],
    "Réponse de l’IA coupée (trop longue). Réessayez.": ["The AI response was cut off (too long). Try again.", "Ответ ИИ оборвался (слишком длинный). Попробуйте ещё раз."],
    "✨ Créer un fond avec l’IA": ["✨ Create a background with AI", "✨ Создать фон с помощью ИИ"],
    "L’IA crée 2 images à partir de votre activité. Elles s’ajoutent à « Mes images » : choisissez-en une maintenant ou plus tard.": ["The AI creates 2 images based on your business. They are added to “My images”: pick one now or later.", "ИИ создаст 2 изображения по вашей деятельности. Они появятся в «Моих изображениях»: выберите сейчас или позже."],
    "✨ Créer 2 images": ["✨ Create 2 images", "✨ Создать 2 изображения"],
    "L’IA peint vos images…": ["The AI is painting your images…", "ИИ рисует изображения…"],
    "L’IA peint vos images… (≈ 20 s)": ["The AI is painting your images… (≈ 20 s)", "ИИ рисует изображения… (≈ 20 с)"],
    "Ex. : van noir devant la tour Eiffel au coucher du soleil": ["E.g. black van in front of the Eiffel Tower at sunset", "Напр. чёрный минивэн у Эйфелевой башни на закате"],
    "Ambiance": ["Mood", "Атмосфера"],
    "Photo réaliste": ["Realistic photo", "Реалистичное фото"],
    "Lumineux": ["Bright", "Светлый"],
    "Ambiance nuit": ["Night mood", "Ночная атмосфера"],
    "Minimaliste": ["Minimalist", "Минимализм"],
    "Aquarelle": ["Watercolour", "Акварель"],
    "Mes images": ["My images", "Мои изображения"],
    "Vos images (photos, galerie, IA) apparaîtront ici pour être réutilisées.": ["Your images (photos, gallery, AI) will appear here to be reused.", "Ваши изображения (фото, галерея, ИИ) появятся здесь для повторного использования."],
    "Chargement de vos images…": ["Loading your images…", "Загружаем изображения…"],
    "Utiliser cette image": ["Use this image", "Использовать это изображение"],
    "Image utilisée": ["Image in use", "Используется"],
    "Supprimer de mes images": ["Remove from my images", "Удалить из моих изображений"],
    "Supprimer définitivement cette image ?": ["Delete this image permanently?", "Удалить это изображение навсегда?"],
    "Cette image est utilisée sur votre page. La retirer de « Mes images » ? (elle reste affichée tant que vous ne la changez pas)": ["This image is used on your page. Remove it from “My images”? (it stays displayed until you change it)", "Это изображение используется на странице. Убрать его из «Моих изображений»? (оно останется на странице, пока вы его не замените)"],
    "IA": ["AI", "ИИ"],
    "Supprimer ce picto": ["Delete this symbol", "Удалить этот символ"],
    "Supprimer ce pictogramme ? (le logo déjà enregistré ne change pas)": ["Delete this symbol? (the logo already saved does not change)", "Удалить этот символ? (сохранённый логотип не изменится)"],
    "✨ Créer 3 motifs": ["✨ Create 3 symbols", "✨ Создать 3 символа"],
    "Bouton « Installer l’appli » en haut de la page": ["“Install the app” button at the top of the page", "Кнопка «Установить приложение» вверху страницы"],
    "Nom sous l’icône de l’appli (15 caractères max.)": ["Name under the app icon (15 characters max.)", "Название под значком приложения (до 15 символов)"],
    "Nouveau : votre page s’installe comme une appli. Cliquez sur Enregistrer pour l’activer.": ["New: your page can be installed as an app. Click Save to turn it on.", "Новое: вашу страницу можно установить как приложение. Нажмите «Сохранить», чтобы включить."],
    "Nouvelle image d’aperçu des liens (WhatsApp…) : cliquez sur Enregistrer": ["New link preview image (WhatsApp…): click Save", "Новое изображение для превью ссылок (WhatsApp…): нажмите «Сохранить»"],
    "✓ Publié. Visible sur la page d’ici une minute.": ["✓ Published. Live on the page within a minute.", "✓ Опубликовано. Изменения появятся на странице в течение минуты."],
    "Installer l’appli": ["Install the app", "Установить приложение"],
    "Installer l’appli sur votre téléphone": ["Install the app on your phone", "Установить приложение на телефон"],
    "Installer": ["Install", "Установить"],
    "Ticket": ["Ticket", "Билет"],
    "QR géant": ["Giant QR", "Крупный QR"],
    "Vague": ["Wave", "Волна"],
    "Pastille": ["Badge", "Круг"],
    "Monogramme": ["Monogram", "Монограмма"],
    "Viseur": ["Viewfinder", "Видоискатель"],
    "Kraft": ["Kraft", "Крафт"],
    "Vertical épuré": ["Clean vertical", "Вертикальный минимализм"],
    "Verso couleur": ["Colour back", "Цветной оборот"],
    "Format 85 × 55 mm": ["85 × 55 mm format", "Формат 85 × 55 мм"],
    "Format 55 × 85 mm (vertical)": ["55 × 85 mm format (portrait)", "Формат 55 × 85 мм (вертикальный)"],
    "Votre essai est terminé : abonnez-vous pour continuer à utiliser l’IA.": ["Your trial has ended: subscribe to keep using the AI.", "Пробный период закончился: оформите подписку, чтобы продолжить пользоваться ИИ."],
    "Abonnement inactif : l’IA est désactivée.": ["Subscription inactive: the AI is disabled.", "Подписка неактивна: ИИ отключён."],
    "Votre essai gratuit est terminé. Activez l’abonnement pour publier à nouveau.": ["Your free trial has ended. Subscribe to publish again.", "Бесплатный пробный период закончился. Оформите подписку, чтобы снова публиковать."],
    "Votre abonnement a expiré. Renouvelez-le pour publier à nouveau.": ["Your subscription has expired. Renew it to publish again.", "Подписка истекла. Продлите её, чтобы снова публиковать."],
    "La rédaction IA n’est pas encore activée sur le serveur.": ["AI writing is not enabled on the server yet.", "Генерация текстов ИИ на сервере ещё не включена."],
    "La création d’images n’est pas encore activée sur le serveur.": ["Image creation is not enabled on the server yet.", "Создание изображений на сервере ещё не включено."],
    "Limite quotidienne de l’IA atteinte. Réessayez demain.": ["Daily AI limit reached. Try again tomorrow.", "Дневной лимит ИИ исчерпан. Попробуйте завтра."],
    "La création d’images a échoué. Réessayez dans un instant (rien n’a été décompté).": ["Image creation failed. Try again in a moment (nothing was charged).", "Не удалось создать изображения. Попробуйте чуть позже (ничего не списано)."],
    "La recharge est réservée aux abonnés.": ["Top-ups are for subscribers only.", "Пополнение доступно только подписчикам."],
    "Le paiement en ligne n’est pas encore ouvert.": ["Online payment is not open yet.", "Онлайн-оплата пока недоступна."],
    "Ce compte est offert : rien à payer.": ["This account is complimentary: nothing to pay.", "Этот аккаунт бесплатный: платить не нужно."],
    'Nom d’utilisateur, lien ou numéro': ['Username, link or phone number', 'Имя пользователя, ссылка или номер'],
    // --- éditeur : conseils sur le titre Google ---
    "Retirez « qrbc » : c’est le nom de l’outil, pas celui de votre entreprise.": ["Remove “qrbc”: it is the name of the tool, not of your business.", "Уберите «qrbc»: это название сервиса, а не вашей компании."],
    "Titre trop long : Google le coupera après environ 60 caractères.": ["Title too long: Google will cut it after about 60 characters.", "Заголовок слишком длинный: Google обрежет его примерно после 60 символов."],
    "Titre un peu court : ajoutez votre activité et votre ville.": ["Title a bit short: add your business type and your city.", "Заголовок коротковат: добавьте вид деятельности и город."],
    "Ajoutez le nom de votre entreprise à la fin du titre :": ["Add your business name at the end of the title:", "Добавьте название компании в конец заголовка:"],
    "Le titre se répète, Google risque de le réécrire :": ["The title repeats itself, Google may rewrite it:", "В заголовке есть повтор, Google может его переписать:"],
    // --- éditeur : onglet Statistiques ---
    "Statistiques": ["Statistics", "Статистика"],
    "Rien pour l’instant.": ["Nothing yet.", "Пока ничего нет."],
    "Autres": ["Others", "Другие"],
    "Inconnu": ["Unknown", "Неизвестно"],
    "Visites par jour": ["Visits per day", "Посещения по дням"],
    "Visites": ["Visits", "Посещения"],
    "jours": ["days", "дней"],
    "Chargement…": ["Loading…", "Загрузка…"],
    "Les statistiques ne sont disponibles qu’avec qrbc.app.": ["Statistics are only available with qrbc.app.", "Статистика доступна только на qrbc.app."],
    "Statistiques indisponibles pour le moment.": ["Statistics are unavailable for the moment.", "Статистика пока недоступна."],
    "Les statistiques seront bientôt disponibles.": ["Statistics will be available soon.", "Статистика скоро появится."],
    "Clics sur les boutons": ["Button clicks", "Нажатия на кнопки"],
    "Provenance": ["Traffic sources", "Источники"],
    "Boutons touchés": ["Buttons tapped", "Нажатые кнопки"],
    "Pays": ["Countries", "Страны"],
    "Langues": ["Languages", "Языки"],
    "QR code": ["QR code", "QR-код"],
    "Autres moteurs": ["Other search engines", "Другие поисковики"],
    "Autre site": ["Other website", "Другой сайт"],
    "Lien direct ou inconnu": ["Direct link or unknown", "Прямая ссылка или неизвестно"],
    "Visites comptées sans cookie ni donnée personnelle, hors robots et hors vos propres visites.": ["Visits are counted without cookies or personal data, excluding bots and your own visits.", "Посещения считаются без cookie и персональных данных, без роботов и ваших собственных визитов."],
    "Les scans sont reconnus sur les QR codes créés depuis le 12 novembre 2026. Les cartes imprimées avant comptent en « Lien direct ou inconnu ».": ["Scans are recognised on QR codes created since 12 November 2026. Cards printed earlier count as “Direct link or unknown”.", "Сканирования распознаются для QR-кодов, созданных с 12 ноября 2026 года. Визитки, напечатанные раньше, учитываются как «Прямая ссылка или неизвестно»."],
    // --- page d'accueil qrbc.app ---
    "Votre page QR, vos cartes de visite,": ["Your QR page, your business cards,", "Ваша QR-страница и визитки —"],
    "dans la langue de chaque client.": ["in each customer’s language.", "на языке каждого клиента."],
    "Pour qui ?": ["Who is it for?", "Для кого?"],
    "Pour tous ceux qui reçoivent des clients et veulent être joints, réservés ou recommandés d’un simple scan.": ["For anyone who welcomes customers and wants to be contacted, booked or recommended with a simple scan.", "Для всех, кто принимает клиентов и хочет, чтобы с ним связывались, записывались и рекомендовали его одним сканированием."],
    "Chauffeurs VTC et taxis": ["Private drivers and taxis", "Водители такси и VTC"],
    "Restaurants, cafés et bars": ["Restaurants, cafés and bars", "Рестораны, кафе и бары"],
    "Artisans et dépannage": ["Tradespeople and repairs", "Мастера и ремонт"],
    "Coiffeurs et instituts de beauté": ["Hairdressers and beauty salons", "Парикмахерские и салоны красоты"],
    "Saunas, spas et bien-être": ["Saunas, spas and wellness", "Сауны, спа и велнес"],
    "Locations saisonnières et conciergeries": ["Holiday rentals and concierge services", "Посуточная аренда и консьерж-сервис"],
    "Coachs, guides et professeurs": ["Coaches, guides and teachers", "Тренеры, гиды и преподаватели"],
    "Boutiques et commerces de proximité": ["Shops and local businesses", "Магазины и местный бизнес"],
    "Ce que votre page fait pour vous": ["What your page does for you", "Что даёт ваша страница"],
    "Un QR code qui ne change jamais": ["A QR code that never changes", "QR-код, который не меняется"],
    "Changez de numéro, d’horaires ou d’offres quand vous voulez : vos cartes et affiches déjà imprimées restent valables.": ["Change your number, opening hours or offers whenever you like: the cards and posters you have already printed still work.", "Меняйте номер, часы работы или предложения когда угодно: уже напечатанные визитки и афиши продолжают работать."],
    "Une page dans la langue de chaque client": ["A page in each customer’s language", "Страница на языке каждого клиента"],
    "Ajoutez des langues à votre page (14 au choix), traduites par l’IA. Le même QR code l’ouvre dans la langue du téléphone de chaque visiteur.": ["Add languages to your page (14 to choose from), translated by AI. The same QR code opens it in the language of each visitor’s phone.", "Добавьте языки (14 на выбор) — ИИ переведёт страницу. Один и тот же QR-код откроет её на языке телефона каждого посетителя."],
    "Avis Google, WhatsApp, réservation": ["Google reviews, WhatsApp, booking", "Отзывы Google, WhatsApp, запись"],
    "Des boutons pour appeler, écrire, réserver, suivre vos réseaux ou laisser un avis : vos clients agissent en un geste.": ["Buttons to call, message, book, follow your social media or leave a review: your customers act in one tap.", "Кнопки, чтобы позвонить, написать, записаться, подписаться на соцсети или оставить отзыв: клиенту хватит одного касания."],
    "Textes et images avec l’IA": ["Texts and images with AI", "Тексты и изображения с ИИ"],
    "Décrivez votre activité en quelques mots : l’IA propose les textes, les pictogrammes et les images de votre page.": ["Describe your business in a few words: AI suggests the texts, icons and images for your page.", "Опишите своё дело в нескольких словах: ИИ предложит тексты, значки и изображения для страницы."],
    "Visible sur Google": ["Visible on Google", "Видна в Google"],
    "Titre, description et fiche « entreprise locale » sont créés automatiquement pour les moteurs de recherche.": ["Title, description and local business details are created automatically for search engines.", "Заголовок, описание и карточка местной компании создаются для поисковиков автоматически."],
    "22 modèles de cartes de visite": ["22 business card templates", "22 шаблона визиток"],
    "Des cartes prêtes à imprimer avec votre QR code, chez vous ou chez l’imprimeur.": ["Print-ready cards with your QR code, at home or at a print shop.", "Готовые к печати визитки с вашим QR-кодом — дома или в типографии."],
    "Un prix simple": ["Simple pricing", "Простая цена"],
    "14 jours d’essai gratuit, sans carte bancaire. Ensuite 18 € HT par an (21,60 € TTC) : page, QR code, cartes de visite et crédits IA compris.": ["14-day free trial, no credit card. Then €18 excl. VAT per year (€21.60 incl. VAT): page, QR code, business cards and AI credits included.", "14 дней бесплатно, без банковской карты. Затем 18 € без НДС в год (21,60 € с НДС): страница, QR-код, визитки и кредиты ИИ включены."],
    "Pas de renouvellement automatique, pas d’engagement. Satisfait ou remboursé pendant 14 jours.": ["No automatic renewal, no commitment. 14-day money-back guarantee.", "Без автоматического продления и обязательств. Возврат денег в течение 14 дней."],
    "Questions fréquentes": ["Frequently asked questions", "Частые вопросы"],
    "Faut-il savoir créer un site ?": ["Do I need to know how to build a website?", "Нужно ли уметь делать сайты?"],
    "Non. Vous choisissez une adresse, vous remplissez quelques champs et l’IA propose le reste. Tout se fait depuis votre téléphone.": ["No. You choose an address, fill in a few fields and AI suggests the rest. Everything is done from your phone.", "Нет. Вы выбираете адрес, заполняете несколько полей, а остальное предложит ИИ. Всё делается с телефона."],
    "Et si je change de numéro ou d’horaires ?": ["What if I change my number or opening hours?", "А если я сменю номер или часы работы?"],
    "Vous modifiez votre page en quelques secondes. Le QR code reste le même : inutile de réimprimer vos cartes.": ["You update your page in seconds. The QR code stays the same: no need to reprint your cards.", "Вы меняете страницу за несколько секунд. QR-код остаётся прежним: визитки перепечатывать не нужно."],
    "Comment fonctionnent les traductions ?": ["How do translations work?", "Как работают переводы?"],
    "Vous ajoutez une langue (en option) et l’IA traduit votre page. Chaque visiteur la voit dans la langue de son téléphone et peut en changer en haut de la page.": ["You add a language (optional extra) and AI translates your page. Each visitor sees it in their phone’s language and can switch at the top of the page.", "Вы добавляете язык (платная опция), и ИИ переводит страницу. Каждый посетитель видит её на языке своего телефона и может сменить язык вверху страницы."],
    "Mes clients doivent-ils installer une appli ?": ["Do my customers need to install an app?", "Нужно ли клиентам устанавливать приложение?"],
    "Non. Il suffit de scanner le QR code avec l’appareil photo du téléphone pour ouvrir votre page.": ["No. Scanning the QR code with their phone’s camera is enough to open your page.", "Нет. Достаточно навести камеру телефона на QR-код, чтобы открыть вашу страницу."],
    "L’abonnement se renouvelle-t-il tout seul ?": ["Does the subscription renew automatically?", "Подписка продлевается автоматически?"],
    "Non. Nous vous prévenons par e-mail avant l’échéance et vous renouvelez si vous le souhaitez. Sans paiement, la page est mise en pause.": ["No. We remind you by email before it ends and you renew if you wish. Without payment, the page is paused.", "Нет. Мы напомним по e-mail до окончания срока, и вы продлите, если захотите. Без оплаты страница приостанавливается."],
    "Créer ma page gratuitement": ["Create my page for free", "Создать страницу бесплатно"],
    "Page QR code et cartes de visite pour indépendants et commerces | qrbc": ["QR code page and business cards for small businesses | qrbc", "QR-страница и визитки для вашего дела | qrbc"],
    "qrbc — votre page QR et vos cartes de visite": ["qrbc — your QR page and business cards", "qrbc — ваша QR-страница и визитки"],
    "Votre page, votre QR code,": ["Your page, your QR code,", "Ваша страница, ваш QR-код,"],
    "vos cartes de visite.": ["your business cards.", "ваши визитки."],
    "Une page mobile à votre nom, que vos clients ouvrent d’un scan : réserver, appeler, écrire sur WhatsApp, laisser un avis Google. Vous la modifiez vous-même, depuis votre téléphone.": ["A mobile page in your name that your customers open with one scan: book, call, message you on WhatsApp, leave a Google review. You edit it yourself, from your phone.", "Мобильная страница на ваше имя, которую клиенты открывают одним сканированием: записаться, позвонить, написать в WhatsApp, оставить отзыв в Google. Вы сами меняете её с телефона."],
    "Choisissez votre adresse": ["Choose your address", "Выберите адрес"],
    "Par exemple votre-nom.qrbc.app": ["For example your-name.qrbc.app", "Например ваше-имя.qrbc.app"],
    "Personnalisez votre page": ["Customise your page", "Настройте страницу"],
    "Boutons, couleurs, logo, photos, textes rédigés avec l’aide de l’IA": ["Buttons, colours, logo, photos, texts written with AI help", "Кнопки, цвета, логотип, фото, тексты с помощью ИИ"],
    "Imprimez vos cartes": ["Print your cards", "Печатайте визитки"],
    "QR code et modèles de cartes de visite prêts à l’impression": ["QR code and print-ready business card templates", "QR-код и шаблоны визиток, готовые к печати"],
    "Une appli sur votre écran d’accueil.": ["An app on your home screen.", "Приложение на главном экране."],
    "Modifiez votre page et imprimez vos cartes depuis votre téléphone, sans passer par un navigateur.": ["Edit your page and print your cards from your phone, without a browser.", "Меняйте страницу и печатайте визитки с телефона, без браузера."],
    "Essai gratuit de 14 jours": ["14-day free trial", "Бесплатный пробный период 14 дней"],
    "Sans carte bancaire. Votre page est en ligne immédiatement.": ["No credit card. Your page is online immediately.", "Без банковской карты. Страница сразу появляется в сети."],
    "Votre page est prête 🎉": ["Your page is ready 🎉", "Ваша страница готова 🎉"],
    "Adresse :": ["Address:", "Адрес:"],
    "Connectez-vous avec votre mot de passe pour la personnaliser.": ["Sign in with your password to customise it.", "Войдите с паролем, чтобы настроить её."],
    "Personnaliser ma page": ["Customise my page", "Настроить страницу"],
    "Astuce : installez l’appli qrbc pour retrouver votre page en un geste.": ["Tip: install the qrbc app to get to your page in one tap.", "Совет: установите приложение qrbc, чтобы открывать страницу одним касанием."],
    "qrbc.app — pages QR et cartes de visite": ["qrbc.app — QR pages and business cards", "qrbc.app — QR-страницы и визитки"],
    "Lire les CGV": ["Read the terms of sale", "Условия продажи"],
    "Après l’essai : 18 € HT par an (21,60 € TTC), sans renouvellement automatique.": ["After the trial: €18 excl. VAT per year (€21.60 incl. VAT), no automatic renewal.", "После пробного периода: 18 € без НДС в год (21,60 € с НДС), без автоматического продления."],
    "Conditions générales de vente": ["Terms of sale", "Условия продажи"],
    "Mentions légales et confidentialité": ["Legal notice and privacy", "Правовая информация и конфиденциальность"],
    "Installer qrbc sur iPhone": ["Install qrbc on iPhone", "Установить qrbc на iPhone"],
    "Dans Safari, touchez Partager (le carré avec une flèche), puis « Sur l’écran d’accueil ».": ["In Safari, tap Share (the square with an arrow), then “Add to Home Screen”.", "В Safari нажмите «Поделиться» (квадрат со стрелкой), затем «На экран «Домой»»."],
    "Compris": ["Got it", "Понятно"],
    'Texte du bouton (vide = icône ronde)': ['Button text (empty = round icon)', 'Текст кнопки (пусто = круглая иконка)'],
    "✂ Recadrer": ["✂ Crop", "✂ Кадрировать"],
    "✂ Recadrer et zoomer": ["✂ Crop and zoom", "✂ Кадрирование и масштаб"],
    "Faites glisser l’image, pincez ou utilisez le curseur pour zoomer. Le cadre montre ce qui sera visible sur un téléphone.": ["Drag the image, pinch or use the slider to zoom. The frame shows what will be visible on a phone.", "Перетащите изображение, сведите пальцы или используйте ползунок для масштаба. Рамка показывает, что будет видно на телефоне."],
    "Recentrer": ["Re-centre", "По центру"],
    "Assombrir": ["Darken", "Затемнить"],
    "Couleur": ["Colour", "Цвет"],
    "Autre couleur": ["Other colour", "Другой цвет"],
    "Appliquer": ["Apply", "Применить"],
    "Annuler": ["Cancel", "Отмена"],
    "Zoom": ["Zoom", "Масштаб"],
    "Choisissez d’abord une image.": ["Choose an image first.", "Сначала выберите изображение."],
    "Zoom important : l’image risque de paraître floue sur le téléphone.": ["Strong zoom: the image may look blurry on a phone.", "Сильное увеличение: на телефоне изображение может выглядеть размытым."],
    "✨ Image IA": ["✨ AI image", "✨ Картинка ИИ"],
    "L’IA peint… (≈ 20 s)": ["The AI is painting… (≈ 20 s)", "ИИ рисует… (≈ 20 с)"],
    "L’IA crée 2 images à partir du texte de cette pancarte…": ["The AI is creating 2 images from this card’s text…", "ИИ создаёт 2 изображения по тексту этой карточки…"],
    "Touchez l’image que vous préférez (l’autre reste dans « Mes images ») :": ["Tap the image you prefer (the other one stays in “My images”):", "Выберите понравившееся изображение (второе останется в «Мои изображения»):"],
    "Image créée et appliquée.": ["Image created and applied.", "Изображение создано и применено."],
    "Écrivez d’abord le titre ou le texte de la pancarte : l’image s’en inspire.": ["First write the card’s title or text: the image is based on it.", "Сначала напишите заголовок или текст карточки: изображение создаётся по нему."],
    "Renvoyer l’e-mail": ["Resend the email", "Отправить письмо ещё раз"],
    "Adresse déjà confirmée : connectez-vous.": ["Address already confirmed: please sign in.", "Адрес уже подтверждён: войдите."],
    "Nouveau lien envoyé à": ["New link sent to", "Новая ссылка отправлена на"],
    "Vérifiez vos e-mails": ["Check your email", "Проверьте почту"],
    "Nous avons envoyé un lien de confirmation à": ["We have sent a confirmation link to", "Мы отправили ссылку для подтверждения на"],
    "L’e-mail de confirmation n’a pas pu partir. Vérifiez l’adresse et renvoyez-le.": ["The confirmation email could not be sent. Check the address and resend it.", "Не удалось отправить письмо для подтверждения. Проверьте адрес и отправьте его ещё раз."],
    "Cliquez sur le lien dans cet e-mail pour ouvrir votre page et commencer. Pensez à regarder dans les indésirables.": ["Click the link in this email to open your page and get started. Check your spam folder too.", "Перейдите по ссылке в письме, чтобы открыть страницу и начать работу. Проверьте также папку «Спам»."],
    "Corriger mon adresse e-mail": ["Correct my email address", "Исправить адрес электронной почты"],
    "Votre adresse e-mail :": ["Your email address:", "Ваш адрес электронной почты:"],
    "Confirmation de votre adresse": ["Confirming your address", "Подтверждение адреса"],
    "Aller à la connexion": ["Go to sign in", "Перейти ко входу"],
    "Adresse confirmée ✓": ["Address confirmed ✓", "Адрес подтверждён ✓"],
    "Ouverture de votre page…": ["Opening your page…", "Открываем вашу страницу…"],
    "Se connecter →": ["Sign in →", "Войти →"],
    "Votre page est créée 🎉": ["Your page has been created 🎉", "Ваша страница создана 🎉"],
    "Un compte existe déjà avec cette adresse e-mail : connectez-vous avec votre mot de passe.": ["An account already exists with this email address: sign in with your password.", "Аккаунт с этим адресом уже существует: войдите со своим паролем."],
    "Cette adresse e-mail est déjà utilisée par un autre compte.": ["This email address is already used by another account.", "Этот адрес уже используется другим аккаунтом."],
    "Trop d’envois. Réessayez dans une heure.": ["Too many emails sent. Try again in an hour.", "Слишком много отправок. Попробуйте через час."],
    "L’envoi d’e-mails n’est pas disponible pour le moment. Contactez le support.": ["Sending emails is not available at the moment. Please contact support.", "Отправка писем сейчас недоступна. Обратитесь в поддержку."],
    "Ce lien a expiré ou a déjà servi. Ouvrez votre page dans l’appli pour recevoir un nouveau lien.": ["This link has expired or has already been used. Sign in to your page in the app to receive a new link.", "Ссылка устарела или уже использована. Войдите на свою страницу в приложении, чтобы получить новую ссылку."],
    "Ce compte n’existe plus.": ["This account no longer exists.", "Этого аккаунта больше нет."],
    "L’adresse e-mail du compte a changé : utilisez le lien du dernier e-mail reçu.": ["The account’s email address has changed: use the link in the latest email.", "Адрес аккаунта изменился: используйте ссылку из последнего письма."],
    "Confirmez d’abord votre adresse e-mail.": ["Please confirm your email address first.", "Сначала подтвердите адрес электронной почты."],
    "version traduite": ["translated version", "переведённая версия"],
    "Traduction de": ["Translation of", "Перевод страницы"],
    "Vous pouvez la modifier librement : elle est indépendante de la page d’origine.": ["You can edit it freely: it is independent from the original page.", "Её можно свободно редактировать: она не зависит от исходной страницы."],
    "🔄 Retraduire depuis la page d’origine": ["🔄 Translate again from the original page", "🔄 Перевести заново с исходной страницы"],
    "offert": ["free", "бесплатно"],
    "Une autre activité ou une autre langue ?": ["Another business or another language?", "Другой бизнес или другой язык?"],
    "Ajouter une page ou une langue": ["Add a page or a language", "Добавить страницу или язык"],
    "Des modifications ne sont pas enregistrées. Changer de page quand même ?": ["Some changes are not saved. Switch page anyway?", "Есть несохранённые изменения. Всё равно перейти на другую страницу?"],
    "Voir l’abonnement": ["View subscription", "Посмотреть подписку"],
    "Tout reste sur le même compte : un seul mot de passe, une seule échéance, et vos images partagées entre toutes les pages.": ["Everything stays on the same account: one password, one renewal date, and your images shared across all pages.", "Всё остаётся в одном аккаунте: один пароль, одна дата продления и общие изображения для всех страниц."],
    "Une nouvelle page": ["A new page", "Новая страница"],
    "Pour une autre activité : nouveau nom, nouvelle adresse, nouveau QR code.": ["For another business: new name, new address, new QR code.", "Для другого бизнеса: новое имя, новый адрес, новый QR-код."],
    "Une traduction de cette page": ["A translation of this page", "Перевод этой страницы"],
    "Même adresse et même QR code : la page s’ouvre dans la langue du téléphone du visiteur. Traduction automatique offerte.": ["Same address and same QR code: the page opens in the language of the visitor’s phone. Automatic translation included.", "Тот же адрес и тот же QR-код: страница открывается на языке телефона посетителя. Автоматический перевод в подарок."],
    "Ouvrez la page d’origine pour lui ajouter une langue.": ["Open the original page to add a language to it.", "Откройте исходную страницу, чтобы добавить ей язык."],
    "nom-de-la-page": ["page-name", "imya-stranicy"],
    "est disponible": ["is available", "свободен"],
    "Adresse de la nouvelle page": ["Address of the new page", "Адрес новой страницы"],
    "Langue actuelle de cette page": ["Current language of this page", "Текущий язык этой страницы"],
    "Traduire en": ["Translate into", "Перевести на"],
    "Offert avec votre compte.": ["Included free with your account.", "Бесплатно для вашего аккаунта."],
    "aujourd’hui": ["today", "сегодня"],
    "Prix réduit au prorata jusqu’à votre échéance commune du": ["Price reduced pro rata until your common renewal date of", "Цена пропорционально уменьшена до общей даты продления"],
    "Ensuite": ["Then", "Далее"],
    "par an (moitié prix), renouvelée avec votre abonnement. Crédits IA d’un abonnement inclus.": ["per year (half price), renewed with your subscription. AI credits of a subscription included.", "в год (полцены), продлевается вместе с подпиской. Включены кредиты ИИ подписки."],
    "Créer": ["Create", "Создать"],
    "Payer et créer": ["Pay and create", "Оплатить и создать"],
    "Choisissez une adresse disponible.": ["Choose an available address.", "Выберите свободный адрес."],
    "Toutes les langues proposées existent déjà pour cette page.": ["All the available languages already exist for this page.", "Все предлагаемые языки уже есть у этой страницы."],
    "Des modifications ne sont pas enregistrées. Continuer quand même ?": ["Some changes are not saved. Continue anyway?", "Есть несохранённые изменения. Всё равно продолжить?"],
    "Un instant…": ["One moment…", "Минуту…"],
    "Paiement sécurisé par Stripe. Facture envoyée par e-mail.": ["Secure payment by Stripe. Invoice sent by email.", "Безопасная оплата через Stripe. Счёт придёт по электронной почте."],
    "offerte": ["free", "бесплатно"],
    "sur votre crédit IA": ["from your AI credit", "с вашего кредита ИИ"],
    "Retraduire remplace tout le contenu de cette version par une nouvelle traduction de la page d’origine (textes, boutons, pancartes, design). Les modifications faites ici seront perdues.": ["Translating again replaces all the content of this version with a new translation of the original page (texts, buttons, cards, design). Changes made here will be lost.", "Повторный перевод заменит всё содержимое этой версии новым переводом исходной страницы (тексты, кнопки, карточки, дизайн). Изменения, сделанные здесь, будут потеряны."],
    "Prix :": ["Price:", "Цена:"],
    "Traduction en cours": ["Translating", "Идёт перевод"],
    "L’IA traduit votre page en": ["The AI is translating your page into", "ИИ переводит вашу страницу на"],
    "Traduction impossible": ["Translation failed", "Перевод не удался"],
    "Paiement reçu, merci !": ["Payment received, thank you!", "Оплата получена, спасибо!"],
    "Ouverture de votre nouvelle page…": ["Opening your new page…", "Открываем новую страницу…"],
    "Paiement reçu, mais la page n’a pas pu être créée (nom pris entre-temps). Nous vous remboursons : écrivez-nous à support@qrbc.app.": ["Payment received, but the page could not be created (name taken in the meantime). We will refund you: write to support@qrbc.app.", "Оплата получена, но страницу не удалось создать (имя заняли тем временем). Мы вернём деньги: напишите на support@qrbc.app."],
    "Cette page est rattachée à": ["This page belongs to", "Эта страница привязана к"],
    "Son abonnement est compris dans celui de votre page principale (une seule échéance) : le renouvellement se fait depuis la page principale.": ["Its subscription is included in that of your main page (one renewal date): renew from the main page.", "Её подписка входит в подписку основной страницы (одна дата продления): продление делается с основной страницы."],
    "Votre page principale": ["Your main page", "Ваша основная страница"],
    "(pages rattachées), une seule échéance.": ["(linked pages), one renewal date.", "(привязанные страницы), одна дата продления."],
    "Les pages supplémentaires et les traductions sont disponibles avec l’abonnement. Abonnez-vous d’abord à votre page principale.": ["Extra pages and translations are available with the subscription. Subscribe your main page first.", "Дополнительные страницы и переводы доступны с подпиской. Сначала оформите подписку на основную страницу."],
    "Votre abonnement est inactif : renouvelez-le d’abord pour ajouter une page.": ["Your subscription is inactive: renew it first to add a page.", "Ваша подписка неактивна: сначала продлите её, чтобы добавить страницу."],
    "Langue non proposée.": ["Language not available.", "Язык недоступен."],
    "Cette page est déjà dans cette langue.": ["This page is already in this language.", "Эта страница уже на этом языке."],
    "Cette langue existe déjà pour cette page.": ["This language already exists for this page.", "Этот язык уже есть у этой страницы."],
    "Ce nom est en cours de réservation. Choisissez-en un autre.": ["This name is being reserved. Choose another one.", "Это имя сейчас бронируется. Выберите другое."],
    "Cette page existe déjà.": ["This page already exists.", "Эта страница уже существует."],
    "Cette page n’appartient pas à votre compte.": ["This page does not belong to your account.", "Эта страница не принадлежит вашему аккаунту."],
    "Cette page n’est pas une version traduite.": ["This page is not a translated version.", "Эта страница не является переводом."],
    "Abonnement inactif : renouvelez-le depuis votre page principale.": ["Inactive subscription: renew it from your main page.", "Подписка неактивна: продлите её с основной страницы."],
    "La traduction IA n’est pas encore activée sur le serveur.": ["AI translation is not yet enabled on the server.", "Перевод ИИ ещё не включён на сервере."],
    "La traduction a échoué. Réessayez dans un instant (rien n’a été décompté).": ["The translation failed. Try again in a moment (nothing was charged).", "Перевод не удался. Попробуйте ещё раз через минуту (ничего не списано)."],
    "L’abonnement de toutes vos pages se règle depuis votre page principale.": ["The subscription for all your pages is paid from your main page.", "Подписка на все ваши страницы оплачивается с основной страницы."],
    "HT": ["excl. VAT", "без НДС"],
    "TTC": ["incl. VAT", "с НДС"],
    "Retraduire depuis la page d’origine": ["Translate again from the original page", "Перевести заново с исходной страницы"],
    "La création d’images est momentanément indisponible (limite du jour atteinte). Réessayez plus tard : rien n’a été décompté.": ["Image creation is temporarily unavailable (daily limit reached). Try again later: nothing was charged.", "Создание изображений временно недоступно (достигнут дневной лимит). Попробуйте позже: ничего не списано."],
    "Le service d’images a refusé cette image (marque, personnage ou personne célèbre dans le texte ?). Modifiez le texte ou choisissez une autre ambiance : rien n’a été décompté.": ["The image service refused this image (brand, character or famous person in the text?). Change the text or choose another style: nothing was charged.", "Сервис изображений отклонил эту картинку (марка, персонаж или известный человек в тексте?). Измените текст или выберите другой стиль: ничего не списано."],
    'Code promo (facultatif)': ['Promo code (optional)', 'Промокод (необязательно)'],
    'Code inconnu ou expiré': ['Unknown or expired code', 'Неизвестный или просроченный код'],
    'Code promo inconnu ou expiré. Corrigez-le ou laissez le champ vide.': ['Unknown or expired promo code. Fix it or leave the field empty.', 'Неизвестный или просроченный промокод. Исправьте его или оставьте поле пустым.'],
    'Trop d’essais de code aujourd’hui.': ['Too many code attempts today.', 'Слишком много попыток ввода кода сегодня.'],
    'Trop d’essais. Réessayez dans une heure.': ['Too many attempts. Try again in an hour.', 'Слишком много попыток. Повторите через час.'],
    'Trop de demandes. Réessayez dans une heure.': ['Too many requests. Try again in an hour.', 'Слишком много запросов. Повторите через час.'],
    'Trop d’inscriptions depuis cette connexion aujourd’hui.': ['Too many sign-ups from this connection today.', 'Слишком много регистраций с этого подключения сегодня.'],
    'Nom de 3 à 30 caractères : lettres minuscules, chiffres et tirets (pas au début ni à la fin).': ['Name of 3 to 30 characters: lowercase letters, digits and hyphens (not at the start or end).', 'Имя от 3 до 30 символов: строчные латинские буквы, цифры и дефисы (не в начале и не в конце).'],
    'Pas de double tiret.': ['No double hyphen.', 'Без двойного дефиса.'],
    'Ce nom est réservé.': ['This name is reserved.', 'Это имя зарезервировано.'],
    'Ce nom est déjà pris.': ['This name is already taken.', 'Это имя уже занято.'],
    'Adresse e-mail invalide.': ['Invalid email address.', 'Неверный адрес e-mail.'],
    'Indiquez l’adresse de votre page ou votre e-mail.': ['Enter your page address or your email.', 'Укажите адрес страницы или e-mail.'],
    'La récupération par e-mail n’est pas encore disponible. Contactez le support.': ['Email recovery is not available yet. Please contact support.', 'Восстановление по e-mail пока недоступно. Обратитесь в поддержку.'],
    'Si une page correspond, un e-mail avec un lien de réinitialisation vient d’être envoyé à l’adresse enregistrée. Pensez à vérifier les indésirables.': ['If a page matches, an email with a reset link has just been sent to the registered address. Remember to check your spam folder.', 'Если страница найдена, на указанный адрес отправлено письмо со ссылкой для сброса пароля. Проверьте папку «Спам».'],
    'Lien invalide.': ['Invalid link.', 'Недействительная ссылка.'],
    'Ce lien a expiré ou a déjà servi. Refaites une demande.': ['This link has expired or was already used. Please request a new one.', 'Срок действия ссылки истёк или она уже использована. Запросите новую.'],
    'Ce lien n’est plus valable. Refaites une demande.': ['This link is no longer valid. Please request a new one.', 'Ссылка больше не действительна. Запросите новую.'],
    'Session expirée : reconnectez-vous.': ['Session expired: please sign in again.', 'Сеанс истёк: войдите снова.'],
    'Requête invalide.': ['Invalid request.', 'Неверный запрос.'],
    'Erreur interne': ['Internal error', 'Внутренняя ошибка'],
    'Cette image ne peut pas être lue sur cet appareil. Essayez une autre image (JPEG ou PNG de moins de 3 Mo).': ['This image cannot be read on this device. Try another image (JPEG or PNG under 3 MB).', 'Это изображение не читается на этом устройстве. Попробуйте другое (JPEG или PNG до 3 МБ).'],
    'Image illisible': ['Unreadable image', 'Изображение не читается'],

    /* --- Connexion / barre --- */
    'Éditeur de la page': ['Page editor', 'Редактор страницы'],
    'Modifier la page': ['Edit the page', 'Редактирование страницы'],
    "Entrez le mot de passe pour accéder à l'éditeur.": ['Enter the password to open the editor.', 'Введите пароль, чтобы открыть редактор.'],
    'Mot de passe': ['Password', 'Пароль'],
    'Rester connecté sur cet appareil': ['Stay signed in on this device', 'Оставаться в системе на этом устройстве'],
    'Se connecter': ['Sign in', 'Войти'],
    'Vérification…': ['Checking…', 'Проверка…'],
    'Mot de passe incorrect.': ['Wrong password.', 'Неверный пароль.'],
    "Installation non terminée : ouvrez d'abord setup.html.": ['Setup not finished: open setup.html first.', 'Установка не завершена: сначала откройте setup.html.'],
    'Accès refusé : le jeton GitHub a expiré ou a été révoqué.': ['Access denied: the GitHub token has expired or was revoked.', 'Доступ запрещён: токен GitHub истёк или был отозван.'],
    'Éditeur': ['Editor', 'Редактор'],
    'Modifier': ['Edit', 'Изменить'],
    'Aperçu': ['Preview', 'Просмотр'],
    'Quitter': ['Sign out', 'Выйти'],
    'Page contact': ['Contact page', 'Страница контактов'],
    'Page Home': ['Home page', 'Главная страница'],
    'Aucune modification': ['No changes', 'Нет изменений'],
    'Enregistrer': ['Save', 'Сохранить'],
    'Modifications non enregistrées': ['Unsaved changes', 'Есть несохранённые изменения'],
    'Enregistrement…': ['Saving…', 'Сохранение…'],
    'Envoi de l’image…': ['Uploading image…', 'Загрузка изображения…'],
    'Publication…': ['Publishing…', 'Публикация…'],
    'Mise à jour du référencement…': ['Updating SEO…', 'Обновление SEO…'],
    '✓ Publié. Visible sur la page d’ici 1 à 2 minutes.': ['✓ Published. Live on the page within 1–2 minutes.', '✓ Опубликовано. Изменения появятся на странице через 1–2 минуты.'],
    'Accès refusé : jeton expiré. Prévenez Roman.': ['Access denied: token expired. Contact your administrator.', 'Доступ запрещён: токен истёк. Свяжитесь с администратором.'],
    'Des modifications ne sont pas enregistrées. Se déconnecter quand même ?': ['You have unsaved changes. Sign out anyway?', 'Есть несохранённые изменения. Всё равно выйти?'],
    'Page publique :': ['Public page:', 'Публичная страница:'],
    'ouvrir ↗': ['open ↗', 'открыть ↗'],
    'Langue': ['Language', 'Язык'],

    /* --- Sections --- */
    'Textes': ['Texts', 'Тексты'],
    'Disposition': ['Layout', 'Расположение'],
    'Boutons et réseaux': ['Buttons & social', 'Кнопки и соцсети'],
    'Design': ['Design', 'Дизайн'],
    'Image de fond': ['Background image', 'Фоновое изображение'],
    'Logo': ['Logo', 'Логотип'],
    'Référencement Google': ['Google SEO', 'Продвижение в Google'],
    'QR code et carte de visite': ['QR code & business card', 'QR-код и визитка'],

    /* --- Textes --- */
    'Titre': ['Title', 'Заголовок'],
    'Sous-titre': ['Subtitle', 'Подзаголовок'],
    'Texte en bas de page': ['Footer text', 'Текст внизу страницы'],
    'Nom de l’établissement': ['Business name', 'Название компании'],
    'Merci de votre visite !': ['Thank you for visiting!', 'Спасибо за визит!'],
    'Adresse, horaires…': ['Address, opening hours…', 'Адрес, часы работы…'],

    /* --- Disposition --- */
    'Centré': ['Centered', 'По центру'],
    'Boutons en haut': ['Buttons on top', 'Кнопки сверху'],
    'Boutons en bas': ['Buttons at bottom', 'Кнопки снизу'],
    'Barre à gauche': ['Left bar', 'Панель слева'],
    'Barre à droite': ['Right bar', 'Панель справа'],
    'Carte de visite': ['Business card', 'Визитка'],
    'Affiche': ['Poster', 'Афиша'],
    'Haut + bas': ['Top + bottom', 'Верх + низ'],
    'Gauche + droite': ['Left + right', 'Слева + справа'],
    'Les barres et les modèles « Haut + bas » et « Gauche + droite » utilisent toujours les icônes rondes. Pour ces deux derniers, la première moitié des boutons va en haut (ou à gauche), la seconde en bas (ou à droite) : l’ordre se règle avec les flèches.':
      ['Side bars and the “Top + bottom” and “Left + right” layouts always use round icons. For the last two, the first half of the buttons goes on top (or left) and the second half at the bottom (or right): set the order with the arrows.',
       'Боковые панели и макеты «Верх + низ» и «Слева + справа» всегда используют круглые иконки. В двух последних первая половина кнопок располагается сверху (или слева), вторая — снизу (или справа): порядок задаётся стрелками.'],

    /* --- Boutons et réseaux --- */
    'Action': ['Action', 'Действие'],
    'Valeur': ['Value', 'Значение'],
    'Texte du bouton': ['Button text', 'Текст кнопки'],
    'Message pré-rempli': ['Prefilled message', 'Готовое сообщение'],
    'Message pré-rempli (facultatif)': ['Prefilled message (optional)', 'Готовое сообщение (необязательно)'],
    'Couleur du thème': ['Theme colour', 'Цвет темы'],
    'Afficher': ['Show', 'Показать'],
    '🗑 Supprimer': ['🗑 Delete', '🗑 Удалить'],
    'Ajouter un bouton…': ['Add a button…', 'Добавить кнопку…'],
    'Bouton vide': ['Empty button', 'Пустая кнопка'],
    'Nouveau bouton': ['New button', 'Новая кнопка'],
    'Laisser un avis Google': ['Leave a Google review', 'Оставить отзыв в Google'],
    'Réserver sur WhatsApp': ['Book on WhatsApp', 'Забронировать в WhatsApp'],
    'Appeler': ['Call', 'Позвонить'],
    'Notre site': ['Our website', 'Наш сайт'],
    'Itinéraire': ['Directions', 'Маршрут'],
    'Nous écrire': ['Email us', 'Написать нам'],
    'Voir la carte': ['See the menu', 'Посмотреть меню'],
    'Bonjour, je souhaite réserver': ['Hello, I would like to book', 'Здравствуйте, хочу забронировать'],
    'Avis Google': ['Google review', 'Отзыв в Google'],
    'WhatsApp': ['WhatsApp', 'WhatsApp'],
    'Téléphone': ['Phone', 'Телефон'],
    'SMS': ['SMS', 'SMS'],
    'E-mail': ['Email', 'E-mail'],
    'Lien web': ['Web link', 'Ссылка'],
    'Lien « Demander des avis » de la fiche Google, ou son Place ID': ['“Ask for reviews” link from the Google profile, or its Place ID', 'Ссылка «Попросить отзывы» из профиля Google или его Place ID'],
    'Numéro, ex. 06 12 34 56 78 ou +33 6 12 34 56 78': ['Number, e.g. +33 6 12 34 56 78', 'Номер, напр. +33 6 12 34 56 78'],
    'Numéro, ex. 04 93 00 00 00': ['Number, e.g. +33 4 93 00 00 00', 'Номер, напр. +33 4 93 00 00 00'],
    'Numéro mobile': ['Mobile number', 'Номер мобильного'],
    'Adresse e-mail': ['Email address', 'Адрес e-mail'],
    'Adresse ou lien Maps': ['Address or Maps link', 'Адрес или ссылка на карты'],
    'Adresse du site, Instagram, menu…': ['Website address, Instagram, menu…', 'Адрес сайта, Instagram, меню…'],
    'Réseaux sociaux': ['Social networks', 'Социальные сети'],
    'icônes rondes, 3 par ligne': ['round icons, 3 per row', 'круглые иконки, 3 в ряд'],
    'Cochez les réseaux à afficher. Seuls ceux qui ont un lien apparaissent sur la page.': ['Tick the networks to show. Only those with a link appear on the page.', 'Отметьте нужные соцсети. На странице появятся только те, у которых указана ссылка.'],
    'Site web': ['Website', 'Сайт'],
    'Nom de la page ou lien': ['Page name or link', 'Название страницы или ссылка'],
    'Nom d’utilisateur ou lien': ['Username or link', 'Имя пользователя или ссылка'],
    'Adresse du site': ['Website address', 'Адрес сайта'],
    'Nom de la chaîne ou lien': ['Channel name or link', 'Название канала или ссылка'],
    'Lien de la fiche': ['Listing link', 'Ссылка на страницу'],
    '↑ Bloc': ['↑ Block', '↑ Блок'],
    '↓ Bloc': ['↓ Block', '↓ Блок'],
    'sans titre': ['untitled', 'без названия'],

    /* --- Design --- */
    'Thème': ['Theme', 'Тема'],
    'Couleurs': ['Colours', 'Цвета'],
    'Fond': ['Background', 'Фон'],
    'Fond (dégradé)': ['Background (gradient)', 'Фон (градиент)'],
    'Texte': ['Text', 'Текст'],
    'Boutons': ['Buttons', 'Кнопки'],
    'Police': ['Font', 'Шрифт'],
    'Forme des boutons': ['Button shape', 'Форма кнопок'],
    'Carré': ['Square', 'Квадрат'],
    'Arrondi': ['Rounded', 'Скруглённая'],
    'Pilule': ['Pill', 'Овал'],
    'Style des boutons': ['Button style', 'Стиль кнопок'],
    'Plein': ['Filled', 'Заливка'],
    'Contour': ['Outline', 'Контур'],
    'Doux': ['Soft', 'Мягкий'],
    'Ombre sous les boutons': ['Shadow under buttons', 'Тень под кнопками'],
    'Encadrer le contenu (carte)': ['Frame the content (card)', 'Обрамить содержимое (карточка)'],
    'Tous les boutons en icônes rondes': ['All buttons as round icons', 'Все кнопки — круглые иконки'],
    'Noms sous les icônes': ['Names under icons', 'Подписи под иконками'],
    'Icônes aux couleurs du thème': ['Icons in theme colours', 'Иконки в цветах темы'],
    'Sable': ['Sand', 'Песок'], 'Nuit': ['Night', 'Ночь'], 'Riviera': ['Riviera', 'Ривьера'], 'Olive': ['Olive', 'Олива'],
    'Corail': ['Coral', 'Коралл'], 'Luxe': ['Luxury', 'Люкс'], 'Blanc': ['White', 'Белый'],
    'Moderne': ['Modern', 'Современный'], 'Élégante': ['Elegant', 'Элегантный'], 'Classique': ['Classic', 'Классический'],
    'Arrondie': ['Rounded', 'Округлый'], 'Technique': ['Technical', 'Технический'],

    /* --- Image de fond --- */
    'Photo affichée derrière la page contact. Elle sert aussi aux cartes de visite, à l’atelier logo et à l’aperçu de partage. Astuce : photo en format portrait, sujet bien éclairé.':
      ['Photo shown behind the contact page. It is also used for business cards, the logo workshop and the share preview. Tip: portrait photo, well-lit subject.',
       'Фото на фоне страницы контактов. Оно также используется для визиток, мастерской логотипов и превью при отправке ссылки. Совет: вертикальное фото, хорошо освещённый объект.'],
    'Photo': ['Photo', 'Фото'],
    '📷 Prendre une photo': ['📷 Take a photo', '📷 Сделать фото'],
    '🖼 Galerie…': ['🖼 Gallery…', '🖼 Галерея…'],
    'Choisir…': ['Choose…', 'Выбрать…'],
    'Retirer': ['Remove', 'Убрать'],
    'Aucune': ['None', 'Нет'],
    'Assombrir l’image (meilleure lisibilité du texte)': ['Darken the image (better text readability)', 'Затемнить изображение (текст читается лучше)'],

    /* --- Logo / atelier --- */
    'Image du logo': ['Logo image', 'Изображение логотипа'],
    'Logo rond (photo)': ['Round logo (photo)', 'Круглый логотип (фото)'],
    '✨ Atelier logo (IA)': ['✨ Logo workshop (AI)', '✨ Мастерская логотипа (ИИ)'],
    '✨ Atelier logo': ['✨ Logo workshop', '✨ Мастерская логотипа'],
    'Fermer': ['Close', 'Закрыть'],
    'Aperçu du logo': ['Logo preview', 'Предпросмотр логотипа'],
    '✓ Utiliser ce logo': ['✓ Use this logo', '✓ Использовать этот логотип'],
    '1. Motif': ['1. Symbol', '1. Символ'],
    'Monogramme': ['Monogram', 'Монограмма'],
    'Motifs IA': ['AI symbols', 'Символы ИИ'],
    '2. Habillage : tous ces réglages s’appliquent en direct, sans IA ni coût.': ['2. Styling: all these settings apply live, with no AI and no cost.', '2. Оформление: все настройки применяются сразу, без ИИ и бесплатно.'],
    'Forme': ['Shape', 'Форма'],
    'Rond': ['Round', 'Круг'],
    'Carré arrondi': ['Rounded square', 'Скруглённый квадрат'],
    'Blason': ['Shield', 'Щит'],
    'Hexagone': ['Hexagon', 'Шестиугольник'],
    'Sans forme': ['No shape', 'Без формы'],
    'Transparent': ['Transparent', 'Прозрачный'],
    'Bordure': ['Border', 'Рамка'],
    'Fine': ['Thin', 'Тонкая'],
    'Épaisse': ['Thick', 'Толстая'],
    'Rendu': ['Finish', 'Эффект'],
    'Mat': ['Matte', 'Матовый'],
    'Brillant': ['Glossy', 'Глянцевый'],
    'Métallique': ['Metallic', 'Металлик'],
    'Néon': ['Neon', 'Неон'],
    'Ombre': ['Shadow', 'Тень'],
    'Couleurs du site': ['Site colours', 'Цвета сайта'],
    'Or & noir': ['Gold & black', 'Золото и чёрный'],
    'Argent & bleu nuit': ['Silver & midnight blue', 'Серебро и тёмно-синий'],
    'Noir & blanc': ['Black & white', 'Чёрный и белый'],
    'Blanc & noir': ['White & black', 'Белый и чёрный'],
    'Personnalisées': ['Custom', 'Свои'],
    'Motif': ['Symbol', 'Символ'],
    'Garder les couleurs de la photo': ['Keep the photo colours', 'Сохранить цвета фото'],
    'Nom': ['Name', 'Название'],
    'Initiales': ['Initials', 'Инициалы'],
    'Aucun': ['None', 'Нет'],
    'Position du texte': ['Text position', 'Положение текста'],
    'Dessous': ['Below', 'Снизу'],
    'En arc': ['Arched', 'Дугой'],
    'Taille du motif': ['Symbol size', 'Размер символа'],
    'Zoom de la photo': ['Photo zoom', 'Масштаб фото'],
    'IA non activée': ['AI not enabled', 'ИИ не подключён'],
    'Ajoutez la clé API dans la section Page Home pour créer des motifs dessinés. Le monogramme et la photo restent disponibles.': ['Add the API key in the Home page section to create drawn symbols. The monogram and photo remain available.', 'Добавьте API-ключ в разделе «Главная страница», чтобы создавать рисованные символы. Монограмма и фото доступны всегда.'],
    '✨ Nouveaux motifs dessinés par l’IA': ['✨ New AI-drawn symbols', '✨ Новые символы от ИИ'],
    'Un seul appel : vous gardez les motifs et changez ensuite forme, couleurs et effets gratuitement.': ['A single request: you keep the symbols and change shape, colours and effects for free afterwards.', 'Один запрос: символы сохраняются, а форму, цвета и эффекты потом можно менять бесплатно.'],
    'Inspiration': ['Inspiration', 'Источник'],
    'Ma description': ['My description', 'Моё описание'],
    'Mon image de fond': ['My background image', 'Моё фоновое изображение'],
    'Aucune image de fond pour l’instant.': ['No background image yet.', 'Фонового изображения пока нет.'],
    'Ajoutez d’abord une photo dans la section « Image de fond » (galerie ou appareil photo).': ['First add a photo in the “Background image” section (gallery or camera).', 'Сначала добавьте фото в разделе «Фоновое изображение» (галерея или камера).'],
    'Aller à Image de fond': ['Go to Background image', 'Перейти к фоновому изображению'],
    'Votre idée (facultatif)': ['Your idea (optional)', 'Ваша идея (необязательно)'],
    'Ex. : un van vu de face, élégant': ['E.g. an elegant van seen from the front', 'Напр.: элегантный минивэн спереди'],
    'Style du motif': ['Symbol style', 'Стиль символа'],
    'Silhouette pleine': ['Solid silhouette', 'Сплошной силуэт'],
    'Trait fin': ['Thin line', 'Тонкая линия'],
    'Géométrique': ['Geometric', 'Геометрический'],
    '✨ Créer 3 motifs (quelques centimes)': ['✨ Create 3 symbols (a few cents)', '✨ Создать 3 символа (несколько центов)'],
    'L’IA dessine…': ['The AI is drawing…', 'ИИ рисует…'],
    'Aucun motif exploitable dans la réponse. Réessayez.': ['No usable symbol in the response. Try again.', 'В ответе нет подходящих символов. Попробуйте ещё раз.'],
    'Image de fond introuvable': ['Background image not found', 'Фоновое изображение не найдено'],
    'Logo illisible': ['Unreadable logo', 'Логотип не читается'],
    'Nouveau logo : cliquez sur Enregistrer pour publier': ['New logo: click Save to publish', 'Новый логотип: нажмите «Сохранить», чтобы опубликовать'],

    /* --- Page Home --- */
    'Activer la page Home': ['Enable the Home page', 'Включить главную страницу'],
    'Le QR code ouvre': ['The QR code opens', 'QR-код открывает'],
    'Bouton de la barre du haut': ['Top bar button', 'Кнопка в верхней панели'],
    'Lien vers la Home (page contact)': ['Link to Home (contact page)', 'Ссылка на главную (на странице контактов)'],
    'Contact': ['Contact', 'Контакты'],
    'Découvrir l’entreprise': ['Discover the company', 'О компании'],
    'Articles — une pancarte plein écran chacun, on passe de l’une à l’autre en glissant': ['Articles — one full-screen slide each, swipe to move between them', 'Статьи — по одному полноэкранному слайду, переход свайпом'],
    'Mise en page': ['Layout', 'Макет'],
    'Photo plein écran': ['Full-screen photo', 'Фото на весь экран'],
    'Image + texte': ['Image + text', 'Изображение + текст'],
    'Texte seul': ['Text only', 'Только текст'],
    'Image': ['Image', 'Изображение'],
    'Votre texte…': ['Your text…', 'Ваш текст…'],
    'Qui sommes-nous ?': ['About us', 'О нас'],
    'Nouvel article': ['New article', 'Новая статья'],
    '✨ Rédaction par l’IA': ['✨ AI writing', '✨ Тексты от ИИ'],
    'Décrivez votre activité : l’IA rédige les pancartes, vous relisez, corrigez si besoin et validez.': ['Describe your business: the AI writes the slides, you review, edit if needed and approve.', 'Опишите свою деятельность: ИИ напишет слайды, вы прочитаете, исправите при необходимости и подтвердите.'],
    '1. Votre activité en quelques mots': ['1. Your business in a few words', '1. Ваша деятельность в двух словах'],
    '2. Zone d’action': ['2. Service area', '2. Зона работы'],
    '3. Nombre de pancartes': ['3. Number of slides', '3. Количество слайдов'],
    'Ton': ['Tone', 'Тон'],
    'Professionnel': ['Professional', 'Деловой'],
    'Chaleureux': ['Warm', 'Тёплый'],
    'Haut de gamme': ['Premium', 'Премиальный'],
    'Dynamique': ['Dynamic', 'Энергичный'],
    'Simple et direct': ['Simple and direct', 'Простой и прямой'],
    'Ex. : chauffeur privé avec van 7 places, transferts aéroports, excursions, mise à disposition': ['E.g. private driver with a 7-seat van, airport transfers, excursions, hourly hire', 'Напр.: личный водитель, минивэн на 7 мест, трансферы в аэропорт, экскурсии, почасовая аренда'],
    'Ex. : Paris et Île-de-France, Normandie': ['E.g. Paris and Île-de-France, Normandy', 'Напр.: Париж и Иль-де-Франс, Нормандия'],
    '✨ Rédiger les articles': ['✨ Write the articles', '✨ Написать статьи'],
    'Rédiger une nouvelle version': ['Write a new version', 'Написать новый вариант'],
    'Rédaction en cours…': ['Writing…', 'Пишем…'],
    'Décrivez l’activité en quelques mots (10 caractères minimum).': ['Describe the business in a few words (10 characters minimum).', 'Опишите деятельность в нескольких словах (минимум 10 символов).'],
    'Relisez et corrigez directement ci-dessus : l’aperçu se met à jour. Les photos des pancartes actuelles sont conservées.': ['Review and edit directly above: the preview updates. Photos of the current slides are kept.', 'Проверьте и исправьте прямо выше — просмотр обновляется. Фото текущих слайдов сохраняются.'],
    '＋ Ajouter à la suite': ['＋ Add after', '＋ Добавить в конец'],
    '✕ Abandonner': ['✕ Discard', '✕ Отменить'],
    'Pas assez de place (10 maximum)': ['Not enough room (10 maximum)', 'Недостаточно места (максимум 10)'],
    'Articles validés : cliquez sur Enregistrer pour publier': ['Articles approved: click Save to publish', 'Статьи подтверждены: нажмите «Сохранить», чтобы опубликовать'],
    'Référencement Google': ['Google SEO', 'Продвижение в Google'],
    'Pour l’activer, ajoutez une clé API Anthropic (console.anthropic.com). Elle est chiffrée avec le mot de passe de l’éditeur.': ['To enable it, add an Anthropic API key (console.anthropic.com). It is encrypted with the editor password.', 'Чтобы включить, добавьте API-ключ Anthropic (console.anthropic.com). Он шифруется паролем редактора.'],
    'Clé API': ['API key', 'API-ключ'],
    'Mot de passe de l’éditeur': ['Editor password', 'Пароль редактора'],
    'Activer': ['Enable', 'Включить'],
    'Renseignez la clé et le mot de passe.': ['Enter the key and the password.', 'Укажите ключ и пароль.'],
    'Clé API refusée. Vérifiez-la ou remplacez-la.': ['API key rejected. Check or replace it.', 'API-ключ отклонён. Проверьте или замените его.'],
    'Clé API refusée.': ['API key rejected.', 'API-ключ отклонён.'],
    'Trop de demandes. Réessayez dans une minute.': ['Too many requests. Try again in a minute.', 'Слишком много запросов. Повторите через минуту.'],
    'Le service IA est surchargé. Réessayez dans un instant.': ['The AI service is overloaded. Try again shortly.', 'Сервис ИИ перегружен. Повторите чуть позже.'],
    'Crédit API épuisé : rechargez le compte sur console.anthropic.com.': ['API credit exhausted: top up the account on console.anthropic.com.', 'Баланс API исчерпан: пополните счёт на console.anthropic.com.'],
    'Réponse vide de l’IA. Réessayez.': ['Empty AI response. Try again.', 'Пустой ответ ИИ. Попробуйте ещё раз.'],
    'Connexion impossible au service IA.': ['Cannot reach the AI service.', 'Нет связи с сервисом ИИ.'],

    /* --- Référencement --- */
    'À chaque enregistrement, le site publie aussi des pages HTML lisibles directement par Google, la fiche « entreprise locale », et le plan du site (sitemap.xml). La rédaction IA remplit ces champs automatiquement.':
      ['On every save, the site also publishes HTML pages that Google can read directly, the “local business” listing and the sitemap (sitemap.xml). AI writing fills these fields automatically.',
       'При каждом сохранении сайт также публикует HTML-страницы, которые Google читает напрямую, карточку «местной компании» и карту сайта (sitemap.xml). ИИ заполняет эти поля автоматически.'],
    'Aperçu dans Google': ['Google preview', 'Как это выглядит в Google'],
    'Titre dans Google': ['Title in Google', 'Заголовок в Google'],
    'Description dans Google': ['Description in Google', 'Описание в Google'],
    'Zone desservie (villes séparées par des virgules)': ['Service area (cities separated by commas)', 'Зона обслуживания (города через запятую)'],
    'Chauffeur privé Paris – Aéroports, Disneyland | Votre nom': ['Private driver Paris – Airports, Disneyland | Your name', 'Личный водитель Париж – аэропорты, Диснейленд | Ваше название'],
    'Une ou deux phrases : service, zone, incitation à contacter': ['One or two sentences: service, area, call to contact', 'Одно-два предложения: услуга, зона, призыв связаться'],
    'Paris, Île-de-France, Normandie': ['Paris, Île-de-France, Normandy', 'Париж, Иль-де-Франс, Нормандия'],
    'Référencement Google ': ['Google SEO', 'Продвижение в Google'],

    /* --- QR / carte --- */
    '⬇ QR code (PNG)': ['⬇ QR code (PNG)', '⬇ QR-код (PNG)'],
    'Copier le lien': ['Copy link', 'Скопировать ссылку'],
    '✓ Copié': ['✓ Copied', '✓ Скопировано'],
    'Lien de la page :': ['Page link:', 'Ссылка на страницу:'],
    'Créée à partir de la page telle qu’elle est affichée : fond, logo, nom, coordonnées des boutons et QR code.': ['Built from the page as displayed: background, logo, name, button contact details and QR code.', 'Создаётся по текущей странице: фон, логотип, название, контакты из кнопок и QR-код.'],
    'Voir les modèles de carte': ['See card templates', 'Показать шаблоны визиток'],
    'Préparation des modèles…': ['Preparing templates…', 'Готовим шаблоны…'],
    'Actualiser les modèles': ['Refresh templates', 'Обновить шаблоны'],
    'Épuré': ['Clean', 'Минимализм'], 'Bandeau': ['Side band', 'Полоса'], 'Couleur': ['Colour', 'Цвет'], 'Diagonale': ['Diagonal', 'Диагональ'],
    'Cadre': ['Frame', 'Рамка'], 'Photo en haut': ['Photo on top', 'Фото сверху'], 'Minimal': ['Minimal', 'Минимум'], 'Vertical': ['Vertical', 'Вертикальная'],
    'Verso QR': ['QR back side', 'Оборот с QR'],

    /* --- Installation (setup.html) --- */
    'Installation': ['Setup', 'Установка'],
    "Installation de l'éditeur": ['Editor setup', 'Установка редактора'],
    'À faire une seule fois (ou pour changer le mot de passe). Le jeton GitHub est chiffré avec le mot de passe, puis enregistré dans le dépôt.':
      ['Do this once (or to change the password). The GitHub token is encrypted with the password, then saved in the repository.',
       'Выполняется один раз (или для смены пароля). Токен GitHub шифруется паролем и сохраняется в репозитории.'],
    'Compte GitHub': ['GitHub account', 'Аккаунт GitHub'],
    'Dépôt': ['Repository', 'Репозиторий'],
    'Jeton GitHub (fine-grained)': ['GitHub token (fine-grained)', 'Токен GitHub (fine-grained)'],
    'Clé API Anthropic (facultatif, pour la rédaction IA)': ['Anthropic API key (optional, for AI writing)', 'API-ключ Anthropic (необязательно, для текстов ИИ)'],
    "Se crée sur console.anthropic.com. Peut aussi être ajoutée plus tard depuis l'éditeur.": ['Created on console.anthropic.com. Can also be added later from the editor.', 'Создаётся на console.anthropic.com. Можно добавить позже из редактора.'],
    'Mot de passe de l’éditeur (pour le client)': ['Editor password (for the client)', 'Пароль редактора (для клиента)'],
    '10 caractères minimum. Préférez une phrase : « soleil-terrasse-2026 ».': ['10 characters minimum. Prefer a phrase: “sunny-terrace-2026”.', 'Минимум 10 символов. Лучше фраза: «solnce-terrasa-2026».'],
    'Confirmer le mot de passe': ['Confirm password', 'Повторите пароль'],
    'Chiffrer et enregistrer': ['Encrypt and save', 'Зашифровать и сохранить'],
    'Les mots de passe ne correspondent pas.': ['Passwords do not match.', 'Пароли не совпадают.'],
    'Vérification du jeton…': ['Checking the token…', 'Проверка токена…'],
    'Chiffrement…': ['Encrypting…', 'Шифрование…'],
    'Enregistrement dans le dépôt…': ['Saving to the repository…', 'Сохранение в репозиторий…'],
    "✓ Terminé. Dans 1 à 2 minutes, l'éditeur sera prêt :": ['✓ Done. The editor will be ready in 1–2 minutes:', '✓ Готово. Редактор будет доступен через 1–2 минуты:'],
    'Jeton invalide ou expiré.': ['Invalid or expired token.', 'Токен недействителен или истёк.'],
    "Ce jeton n'a pas le droit d'écriture (Contents : Read and write).": ['This token has no write access (Contents: Read and write).', 'У токена нет права записи (Contents: Read and write).'],

    /* --- Divers --- */
    'Afficher ': ['Show', 'Показать'],
    'Lien de la page': ['Page link', 'Ссылка на страницу']
  };

  // Formes dynamiques : [regex sur le français, (m, L, t) => texte]
  const MOTIFS = [
    [/^Une nouvelle traduction coûte (.+) HT sur votre crédit IA \(solde : ([^()]+)\)\. Rechargez votre crédit \((.+) HT minimum\)\.$/, m => ({
      en: 'A new translation costs ' + m[1] + ' excl. VAT from your AI credit (balance: ' + m[2] + '). Top up your credit (' + m[3] + ' excl. VAT minimum).',
      ru: 'Новый перевод стоит ' + m[1] + ' без НДС с кредита ИИ (баланс: ' + m[2] + '). Пополните кредит (минимум ' + m[3] + ' без НДС).' })],
    [/^L’abonnement de toutes vos pages se règle depuis votre page principale \((.+)\)\.$/, m => ({
      en: 'The subscription for all your pages is paid from your main page (' + m[1] + ').',
      ru: 'Подписка на все ваши страницы оплачивается с основной страницы (' + m[1] + ').' })],
    [/^Confirmez d’abord votre adresse e-mail : cliquez sur le lien envoyé à (\S+) \(pensez aux indésirables\)\.$/, m => ({
      en: 'Please confirm your email address first: click the link sent to ' + m[1] + ' (check your spam folder).',
      ru: 'Сначала подтвердите адрес электронной почты: перейдите по ссылке, отправленной на ' + m[1] + ' (проверьте папку «Спам»).' })],
    // --- compteurs, abonnement, création express ---
    [/^Essai gratuit : (\d+) jours?$/, m => ({ en: 'Free trial: ' + m[1] + (m[1] === '1' ? ' day' : ' days'), ru: 'Пробный период: ' + m[1] + ' ' + pluriel(+m[1], 'день', 'дня', 'дней') })],
    [/^Abonné · (.+)$/, m => ({ en: 'Subscribed · ' + m[1], ru: 'Подписка · ' + m[1] })],
    [/^Abonné$/, () => ({ en: 'Subscribed', ru: 'Подписка' })],
    [/^(Essai|Cette année) : (\d+) (rédactions?|créations? de motifs|créations? d’images) sur (\d+) restantes?$/, m => {
      const k = /rédaction/.test(m[3]) ? 0 : /motifs/.test(m[3]) ? 1 : 2, n = +m[2], tot = +m[4];
      const en = [['AI writing', 'AI writings'], ['symbol creation', 'symbol creations'], ['image creation', 'image creations']][k];
      const ru = ['генерации текста', 'генерации символов', 'генерации фона'][k], ruP = ['генераций текста', 'генераций символов', 'генераций фона'][k];
      return { en: (m[1] === 'Essai' ? 'Trial' : 'This year') + ': ' + n + ' of ' + tot + ' ' + en[tot > 1 ? 1 : 0] + ' left',
               ru: (m[1] === 'Essai' ? 'Пробный период' : 'В этом году') + ': осталось ' + n + ' из ' + tot + ' ' + pluriel(tot, ru, ruP, ruP) };
    }],
    [/^Quota utilisé · (.+) par (rédaction|création de motifs|création d’images) sur votre crédit \((.+)\)$/, m => {
      const k = m[2] === 'rédaction' ? 0 : m[2] === 'création de motifs' ? 1 : 2;
      return { en: 'Quota used · ' + m[1] + ' per ' + ['AI writing', 'symbol creation', 'image creation'][k] + ' from your credit (' + m[3] + ')',
               ru: 'Лимит исчерпан · ' + m[1] + ' за ' + ['генерацию текста', 'генерацию символов', 'генерацию фона'][k] + ' из кредита (' + m[3] + ')' };
    }],
    [/^Vos (rédactions|créations de motifs|créations d’images) d’essai sont utilisées\.$/, m => {
      const k = m[1] === 'rédactions' ? 0 : m[1] === 'créations de motifs' ? 1 : 2;
      return { en: 'Your trial ' + ['AI writings', 'symbol creations', 'image creations'][k] + ' are used up.', ru: 'Пробные ' + ['генерации текста', 'генерации символов', 'генерации фона'][k] + ' израсходованы.' };
    }],
    [/^Jusqu’au (\S+)\. Votre page reste en ligne pendant tout l’essai\.$/, m => ({ en: 'Until ' + m[1] + '. Your page stays online for the whole trial.', ru: 'До ' + m[1] + '. Страница остаётся в сети весь пробный период.' })],
    [/^Jusqu’au (\S+)\.$/, m => ({ en: 'Until ' + m[1] + '.', ru: 'До ' + m[1] + '.' })],
    [/^Terminé le (\S+)\.$/, m => ({ en: 'Ended on ' + m[1] + '.', ru: 'Закончилась ' + m[1] + '.' })],
    [/^(.+) HT \/ an$/, m => ({ en: m[1] + ' excl. VAT / year', ru: m[1] + ' без НДС / год' })],
    [/^(.+) TTC \(TVA (\d+) %\)\. Soit (.+) HT par mois, le prix d’un café\.$/, m => ({ en: m[1] + ' incl. VAT (' + m[2] + ' %). That’s ' + m[3] + ' excl. VAT a month, the price of a coffee.', ru: m[1] + ' с НДС (' + m[2] + ' %). То есть ' + m[3] + ' без НДС в месяц — цена чашки кофе.' })],
    [/^(.+) incluses par an$/, m => {
      const tr = x => x.replace(/(\d+) rédactions? IA/, (a, n) => ({ en: n + (n === '1' ? ' AI writing' : ' AI writings'), ru: n + ' ' + pluriel(+n, 'генерация текста', 'генерации текста', 'генераций текста') })[L])
        .replace(/(\d+) créations? de motifs/, (a, n) => ({ en: n + (n === '1' ? ' symbol creation' : ' symbol creations'), ru: n + ' ' + pluriel(+n, 'генерация символов', 'генерации символов', 'генераций символов') })[L])
        .replace(/(\d+) créations? d’images de fond/, (a, n) => ({ en: n + (n === '1' ? ' background image creation' : ' background image creations'), ru: n + ' ' + pluriel(+n, 'генерация фона', 'генерации фона', 'генераций фона') })[L])
        .replace(/ et /, L === 'en' ? ' and ' : ' и ');
      let L = 'en'; const en = tr(m[1]) + ' included per year'; L = 'ru'; const ru = tr(m[1]) + ' в год включено';
      return { en, ru };
    }],
    [/^(Au-delà|IA à la demande) : (.+) HT la rédaction, (.+) HT la création de motifs(?:, (.+) HT la création d’images de fond \(2 images\))?$/, m => ({
      en: (m[1] === 'Au-delà' ? 'Beyond that: ' : 'AI on demand: ') + m[2] + ' excl. VAT per writing, ' + m[3] + ' excl. VAT per symbol creation' + (m[4] ? ', ' + m[4] + ' excl. VAT per background creation (2 images)' : ''),
      ru: (m[1] === 'Au-delà' ? 'Сверх лимита: ' : 'ИИ по запросу: ') + m[2] + ' без НДС за текст, ' + m[3] + ' без НДС за символы' + (m[4] ? ', ' + m[4] + ' без НДС за фон (2 изображения)' : '') })],
    [/^(.+) HT la rédaction, (.+) HT la création de motifs\. Le crédit non utilisé est déduit de votre prochain renouvellement(?: \(prochain paiement : (.+) HT au lieu de (.+)\))?\.$/, m => ({
      en: m[1] + ' excl. VAT per writing, ' + m[2] + ' excl. VAT per symbol creation. Unused credit is deducted from your next renewal' + (m[3] ? ' (next payment: ' + m[3] + ' excl. VAT instead of ' + m[4] + ')' : '') + '.',
      ru: m[1] + ' без НДС за текст, ' + m[2] + ' без НДС за символы. Неиспользованный кредит вычитается из следующего продления' + (m[3] ? ' (следующий платёж: ' + m[3] + ' без НДС вместо ' + m[4] + ')' : '') + '.' })],
    [/^TVA (\d+) % ajoutée au paiement \((.+) HT = (.+) TTC\)\.$/, m => ({ en: m[1] + ' % VAT added at payment (' + m[2] + ' excl. VAT = ' + m[3] + ' incl. VAT).', ru: 'НДС ' + m[1] + ' % добавляется при оплате (' + m[2] + ' без НДС = ' + m[3] + ' с НДС).' })],
    [/^Crédit déduit : −(.+) HT → à payer (.+) HT \((.+) TTC\)$/, m => ({ en: 'Credit deducted: −' + m[1] + ' excl. VAT → to pay ' + m[2] + ' excl. VAT (' + m[3] + ' incl. VAT)', ru: 'Вычтено из кредита: −' + m[1] + ' без НДС → к оплате ' + m[2] + ' без НДС (' + m[3] + ' с НДС)' })],
    [/^Coût : ([^()]+) HT, débités de votre crédit IA \(solde : ([^()]+)\)\.$/, m => ({ en: 'Cost: ' + m[1] + ' excl. VAT, taken from your AI credit (balance: ' + m[2] + ').', ru: 'Стоимость: ' + m[1] + ' без НДС, списывается с кредита ИИ (баланс: ' + m[2] + ').' })],
    [/^Coût : la moitié de vos créations IA gratuites de l’essai \((.+)\)\.$/, m => {
      const tr = (x, L) => x.replace(/(\d+) rédactions?/g, (a, n) => L === 'en' ? n + (n === '1' ? ' writing' : ' writings') : n + ' ' + pluriel(+n, 'текст', 'текста', 'текстов'))
        .replace(/(\d+) créations? de motifs/g, (a, n) => L === 'en' ? n + ' symbol creation' + (n === '1' ? '' : 's') : n + ' ' + pluriel(+n, 'генерация символов', 'генерации символов', 'генераций символов'))
        .replace(/(\d+) créations? d’images/g, (a, n) => L === 'en' ? n + ' image creation' + (n === '1' ? '' : 's') : n + ' ' + pluriel(+n, 'генерация фона', 'генерации фона', 'генераций фона'));
      return { en: 'Cost: half of your free trial AI creations (' + tr(m[1], 'en') + ').', ru: 'Стоимость: половина бесплатных генераций ИИ пробного периода (' + tr(m[1], 'ru') + ').' };
    }],
    [/^E-mail de contact : celui de votre inscription(?: \((.+)\))?\.$/, m => ({ en: 'Contact email: the one you signed up with' + (m[1] ? ' (' + m[1] + ')' : '') + '.', ru: 'Контактный e-mail: тот, что указан при регистрации' + (m[1] ? ' (' + m[1] + ')' : '') + '.' })],
    [/^Une création express déjà réglée est en cours : vous pouvez la reprendre sans frais jusqu’à (.+)\.$/, m => ({ en: 'An express creation already paid for is in progress: you can resume it at no cost until ' + m[1] + '.', ru: 'Быстрое создание уже оплачено и не завершено: его можно продолжить бесплатно до ' + m[1] + '.' })],
    [/^La création express coûte ([^()]+) HT sur votre crédit IA \(solde : ([^()]+)\)\.$/, m => ({ en: 'Express creation costs ' + m[1] + ' excl. VAT from your AI credit (balance: ' + m[2] + ').', ru: 'Быстрое создание стоит ' + m[1] + ' без НДС из кредита ИИ (баланс: ' + m[2] + ').' })],
    [/^Rechargez votre crédit \(([^(),]+) HT minimum(?:, ([^()]+?) HT la (rédaction|création de motifs|création \(2 images\)))?\)\.$/, m => {
      const k = m[3] === 'rédaction' ? 0 : m[3] === 'création de motifs' ? 1 : 2;
      return { en: 'Top up your credit (' + m[1] + ' excl. VAT minimum' + (m[2] ? ', ' + m[2] + ' excl. VAT per ' + ['writing', 'symbol creation', 'background creation (2 images)'][k] : '') + ').',
               ru: 'Пополните кредит (минимум ' + m[1] + ' без НДС' + (m[2] ? ', ' + m[2] + ' без НДС за ' + ['текст', 'символы', 'фон (2 изображения)'][k] : '') + ').' };
    }],
    [/^La création express utilise la moitié de vos créations IA d’essai, et il n’en reste plus assez\.$/, () => ({ en: 'Express creation uses half of your trial AI creations, and there are not enough left.', ru: 'Быстрое создание расходует половину пробных генераций ИИ, а их осталось недостаточно.' })],
    [/^Abonnez-vous \((.+) HT\/an\) : la création express coûtera alors (.+) HT\.$/, m => ({ en: 'Subscribe (' + m[1] + ' excl. VAT/year): express creation will then cost ' + m[2] + ' excl. VAT.', ru: 'Оформите подписку (' + m[1] + ' без НДС/год): тогда быстрое создание будет стоить ' + m[2] + ' без НДС.' })],
    [/^Abonnez-vous dès maintenant pour en obtenir (\d+) par an \((.+) HT\/an\)\.$/, m => ({ en: 'Subscribe now to get ' + m[1] + ' a year (' + m[2] + ' excl. VAT/year).', ru: 'Оформите подписку сейчас и получайте ' + m[1] + ' в год (' + m[2] + ' без НДС/год).' })],
    [/^(?:Vos (\d+)|Votre) (rédactions? IA|créations? de motifs IA|créations? d’images de fond) (d’essai|de l’année) (?:sont utilisées|est utilisée)\.$/, m => {
      const k = /rédaction/.test(m[2]) ? 0 : /motifs/.test(m[2]) ? 1 : 2, essai = m[3] === 'd’essai';
      const en = ['AI writing', 'AI symbol creation', 'background image creation'][k], ru = ['генерации текста', 'генерации символов', 'генерации фона'][k];
      return { en: 'Your ' + (m[1] ? m[1] + ' ' : '') + (essai ? 'trial ' : 'yearly ') + en + (m[1] ? 's are' : ' is') + ' used up.',
               ru: (essai ? 'Пробные ' : 'Годовые ') + ru + (m[1] ? ' (' + m[1] + ')' : '') + ' израсходованы.' };
    }],
    [/^✓ (\d+) nouvelles? images? ajoutées? dans « Mes images » ci-dessus : touchez-en une pour l’utiliser\.$/, m => ({ en: '✓ ' + m[1] + ' new image' + (m[1] === '1' ? '' : 's') + ' added to “My images” above: tap one to use it.', ru: '✓ ' + m[1] + ' ' + pluriel(+m[1], 'новое изображение добавлено', 'новых изображения добавлены', 'новых изображений добавлено') + ' в «Мои изображения» выше: нажмите, чтобы использовать.' })],
    [/^⏳ Demande (de recharge de|d’abonnement :) (.+) HT envoyée le (\S+)\. (.+)$/, (m, t) => ({ en: '⏳ ' + (m[1] === 'de recharge de' ? 'Top-up request of ' : 'Subscription request: ') + m[2] + ' excl. VAT sent on ' + m[3] + '. ' + t(m[4]), ru: '⏳ ' + (m[1] === 'de recharge de' ? 'Запрос на пополнение ' : 'Запрос на подписку: ') + m[2] + ' без НДС отправлен ' + m[3] + '. ' + t(m[4]) })],

    [/^✓ (\d+) jours \+ (\d+) jours offerts$/, m => ({ en: '✓ ' + m[1] + ' days + ' + m[2] + ' free days', ru: '✓ ' + m[1] + ' дней + ' + m[2] + ' дней в подарок' })],
    [/^Pancarte (\d+) \/ (\d+)$/, m => ({ en: 'Slide ' + m[1] + ' / ' + m[2], ru: 'Слайд ' + m[1] + ' / ' + m[2] })],
    [/^Pancarte (\d+)$/, m => ({ en: 'Slide ' + m[1], ru: 'Слайд ' + m[1] })],
    [/^＋ Ajouter un article \((\d+)\/(\d+)\)$/, m => ({ en: '＋ Add an article (' + m[1] + '/' + m[2] + ')', ru: '＋ Добавить статью (' + m[1] + '/' + m[2] + ')' })],
    [/^Maximum atteint \((\d+) articles\)$/, m => ({ en: 'Maximum reached (' + m[1] + ' articles)', ru: 'Достигнут максимум (' + m[1] + ' статей)' })],
    [/^✓ Valider et remplacer les (\d+) articles actuels$/, m => ({ en: '✓ Approve and replace the ' + m[1] + ' current articles', ru: '✓ Подтвердить и заменить текущие статьи (' + m[1] + ')' })],
    [/^L’IA écrit vos (\d+) pancartes?, quelques secondes…$/, m => ({ en: 'The AI is writing your ' + m[1] + ' slide' + (m[1] === '1' ? '' : 's') + ', a few seconds…', ru: 'ИИ пишет слайды (' + m[1] + '), несколько секунд…' })],
    [/^(\d+) pancartes?$/, m => ({ en: m[1] + (m[1] === '1' ? ' slide' : ' slides'), ru: m[1] + ' ' + pluriel(+m[1], 'слайд', 'слайда', 'слайдов') })],
    [/^(\d+) caractères \(idéal (\d+)–(\d+)\)$/, m => ({ en: m[1] + ' characters (ideal ' + m[2] + '–' + m[3] + ')', ru: m[1] + ' симв. (оптимально ' + m[2] + '–' + m[3] + ')' })],
    [/^(\d+) caractères$/, m => ({ en: m[1] + ' characters', ru: m[1] + ' симв.' })],
    [/^⬇ Télécharger « (.+) » \(JPEG\)$/, (m, t) => ({ en: '⬇ Download “' + t(m[1]) + '” (JPEG)', ru: '⬇ Скачать «' + t(m[1]) + '» (JPEG)' })],
    [/^Format 55 × 85 mm \(vertical\), 600 dpi, prêt pour l’imprimeur\. Astuce : « Verso QR » fait un beau dos de carte\.$/, () => ({ en: '55 × 85 mm format (vertical), 600 dpi, print-ready. Tip: “QR back side” makes a nice card back.', ru: 'Формат 55 × 85 мм (вертикальный), 600 dpi, готово к печати. Совет: «Оборот с QR» — красивая обратная сторона.' })],
    [/^Format 85 × 55 mm, 600 dpi, prêt pour l’imprimeur\. Astuce : « Verso QR » fait un beau dos de carte\.$/, () => ({ en: '85 × 55 mm format, 600 dpi, print-ready. Tip: “QR back side” makes a nice card back.', ru: 'Формат 85 × 55 мм, 600 dpi, готово к печати. Совет: «Оборот с QR» — красивая обратная сторона.' })],
    [/^Motif IA (\d+)$/, m => ({ en: 'AI symbol ' + m[1], ru: 'Символ ИИ ' + m[1] })],
    [/^Supprimer la pancarte « (.*) » \?$/s, m => ({ en: 'Delete the slide “' + m[1] + '”?', ru: 'Удалить слайд «' + m[1] + '»?' })],
    [/^Supprimer le bouton « (.*) » \?$/s, m => ({ en: 'Delete the button “' + m[1] + '”?', ru: 'Удалить кнопку «' + m[1] + '»?' })],
    [/^Échec : (.*)$/s, (m, t) => ({ en: 'Failed: ' + t(m[1]), ru: 'Ошибка: ' + t(m[1]) })],
    [/^Impossible de créer la carte : (.*)$/s, (m, t) => ({ en: 'Could not create the card: ' + t(m[1]), ru: 'Не удалось создать визитку: ' + t(m[1]) })],
    [/^Impossible de créer l’image : (.*)$/s, (m, t) => ({ en: 'Could not create the image: ' + t(m[1]), ru: 'Не удалось создать изображение: ' + t(m[1]) })],
    [/^Mot-clé principal : (.*?)(?: · secondaires : (.*))?$/s, m => ({
      en: 'Main keyword: ' + m[1] + (m[2] ? ' · secondary: ' + m[2] : ''),
      ru: 'Основной ключ: ' + m[1] + (m[2] ? ' · дополнительные: ' + m[2] : '') })],
    [/^Dépôt introuvable ou jeton sans accès à (.+)$/, m => ({ en: 'Repository not found or token has no access to ' + m[1], ru: 'Репозиторий не найден или у токена нет доступа к ' + m[1] })],
    [/^Afficher (.+)$/, (m, t) => ({ en: 'Show ' + t(m[1]), ru: 'Показать ' + t(m[1]) })],
    [/^(✓ )?(\S+\.qrbc\.app) est disponible$/, m => ({ en: (m[1] || '') + m[2] + ' is available', ru: (m[1] || '') + m[2] + ' свободен' })],
    [/^Pour la page (\S+)$/, m => ({ en: 'For the page ' + m[1], ru: 'Для страницы ' + m[1] })],
    [/^Page (\S+) — entrez votre mot de passe\.$/, m => ({ en: 'Page ' + m[1] + ' — enter your password.', ru: 'Страница ' + m[1] + ' — введите пароль.' })]
  ];

  function pluriel(n, un, peu, beaucoup) {
    const d = n % 10, c = n % 100;
    if (d === 1 && c !== 11) return un;
    if (d >= 2 && d <= 4 && (c < 12 || c > 14)) return peu;
    return beaucoup;
  }

  function langueInitiale() {
    // ?lang=ru dans l'adresse (lien partagé) : prioritaire, et retenu
    try {
      const u = new URLSearchParams(location.search).get('lang');
      if (LANGUES[u]) { try { localStorage.setItem(CLE, u); } catch (e) {} return u; }
    } catch (e) {}
    // robots des moteurs (Google, Bing…) : on garde la langue annoncée par la page publique,
    // sinon l'accueil français serait indexé en anglais (le navigateur du robot est réglé en anglais)
    try {
      const lp = document.documentElement.getAttribute('lang');
      if (document.documentElement.hasAttribute('data-lien-langue') && LANGUES[lp] &&
          /bot|crawl|spider|slurp|lighthouse|google|bing|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram/i.test(navigator.userAgent)) return lp;
    } catch (e) {}
    try { const l = localStorage.getItem(CLE); if (LANGUES[l]) return l; } catch (e) {}
    const n = (navigator.language || 'fr').slice(0, 2).toLowerCase();
    return LANGUES[n] ? n : 'en';
  }
  let langue = langueInitiale();

  /* Traduction d'un texte français */
  function t(s, lng) {
    lng = lng || langue;
    if (lng === 'fr' || s == null) return s;
    const brut = String(s);
    const cle = brut.trim();
    if (!cle) return brut;
    const i = lng === 'en' ? 0 : 1;
    const avant = brut.slice(0, brut.indexOf(cle)), apres = brut.slice(brut.indexOf(cle) + cle.length);
    let r = null;
    if (D[cle]) r = D[cle][i];
    if (r == null) for (const [re, f] of MOTIFS) {
      const m = cle.match(re);
      if (m) { r = f(m, x => t(x, lng))[lng]; break; }
    }
    if (r == null && /[.!?»)] \S/.test(cle)) {
      // message de plusieurs phrases (souvent assemblé par le serveur) : chaque phrase se traduit à part
      // (sans « lookbehind » : Safari ne le comprend qu'à partir d'iOS 16.4, et tout le fichier s'arrêterait)
      const morceaux = cle.split(/([.!?»)])\s+(?=[A-ZÀ-ÖØ-ÞÉ«⏳✓])/u), parts = [];
      for (let k = 0; k < morceaux.length; k += 2) parts.push(morceaux[k] + (morceaux[k + 1] || ''));
      if (parts.length > 1) {
        const tr = parts.map(x => t(x, lng));
        if (tr.some((x, k) => x !== parts[k])) r = tr.join(' ');
      }
    }
    if (r == null) {
      // préfixe de symboles (emoji, flèches…) + texte connu
      const m = cle.match(/^([^\p{L}\p{N}«“"(]+)(.+)$/u);
      if (m && D[m[2]]) r = m[1] + D[m[2]][i];
    }
    return r == null ? brut : avant + r + apres;
  }

  /* --- Traduction automatique du DOM (interface seulement) --- */
  const EXCLU = '#apercu, [data-no-i18n], .g-apercu, .qr-url, .logo-scene .damier, script, style';
  const origTexte = new WeakMap();      // nœud texte → français
  const origAttr = new WeakMap();       // élément → { attr: français }
  const ATTRS = ['placeholder', 'title', 'aria-label'];

  function exclu(el) { return el && el.closest && el.closest(EXCLU); }
  // Le texte affiché est-il une version (fr/en/ru) de l'original connu ?
  const estVersion = (cur, fr) => fr !== undefined && (cur === fr || Object.keys(LANGUES).some(l => t(fr, l) === cur));

  function traduireTexte(n) {
    const p = n.parentElement;
    if (!p || exclu(p)) return;
    let fr = origTexte.get(n);
    if (!estVersion(n.data, fr)) { fr = n.data; origTexte.set(n, fr); }
    const v = t(fr);
    if (n.data !== v) n.data = v;
  }
  function traduireAttrs(el) {
    if (exclu(el)) return;
    let o = origAttr.get(el);
    if (!o) { o = {}; origAttr.set(el, o); }
    ATTRS.forEach(a => {
      if (!el.hasAttribute(a)) return;
      const cur = el.getAttribute(a);
      if (!estVersion(cur, o[a])) o[a] = cur;
      const v = t(o[a]);
      if (cur !== v) el.setAttribute(a, v);
    });
  }
  function parcourir(racine) {
    if (!racine) return;
    if (racine.nodeType === 3) return traduireTexte(racine);
    if (racine.nodeType !== 1 || exclu(racine)) return;
    traduireAttrs(racine);
    const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: n => (n.nodeType === 1 && exclu(n)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (/\p{L}/u.test(n.data)) traduireTexte(n); }
      else traduireAttrs(n);
    }
  }

  let enCours = false;
  const obs = new MutationObserver(muts => {
    if (enCours) return;
    enCours = true;
    try {
      for (const m of muts) {
        if (m.type === 'characterData') traduireTexte(m.target);
        else if (m.type === 'attributes') traduireAttrs(m.target);
        else m.addedNodes.forEach(parcourir);
      }
      if (muts.some(m => m.addedNodes.length)) liensLegaux();   // fenêtres ajoutées plus tard (abonnement…)
    } finally { enCours = false; }
  });

  function appliquer() {
    document.documentElement.lang = langue;
    if (!document.body) return;
    enCours = true;
    try { parcourir(document.body); if (document.title) document.title = t(origTitre); liensLegaux(); } finally { enCours = false; }
  }
  /* Liens CGV / mentions légales : vers la version de la langue choisie */
  function liensLegaux() {
    document.querySelectorAll('a[href*="/cgv"], a[href*="/mentions-legales"]').forEach(a => {
      try {
        const u = new URL(a.getAttribute('href'), location.href);
        if (!/^\/(cgv|mentions-legales)(\.html)?$/.test(u.pathname)) return;
        if (langue === 'fr') u.searchParams.delete('lang'); else u.searchParams.set('lang', langue);
        a.setAttribute('href', (u.origin === location.origin ? '' : u.origin) + u.pathname + u.search + u.hash);
      } catch (e) {}
    });
  }
  let origTitre = document.title;

  function choisirLangue(l) {
    if (!LANGUES[l]) return;
    // page déjà traduite par le serveur (accueil ?lang=en|ru) : on recharge dans la langue choisie
    if (document.documentElement.hasAttribute('data-pretraduit') && l !== langue) {
      try { localStorage.setItem(CLE, l); } catch (e) {}
      const u = new URL(location.href);
      if (l === 'fr') u.searchParams.delete('lang'); else u.searchParams.set('lang', l);
      location.replace(u.pathname + u.search + u.hash);
      return;
    }
    langue = l;
    try { localStorage.setItem(CLE, l); } catch (e) {}
    langueDansAdresse(l);
    appliquer();
    document.querySelectorAll('select.choix-langue').forEach(s => { s.value = l; });
  }

  /* Pages publiques de qrbc.app : la langue choisie va dans l'adresse, pour qu'un lien copié
     (WhatsApp, SMS…) s'ouvre et s'affiche en aperçu dans cette langue */
  function langueDansAdresse(l) {
    try {
      if (!document.documentElement.hasAttribute('data-lien-langue')) return;
      const u = new URL(location.href);
      if (u.searchParams.get('lang') === l) return;
      u.searchParams.set('lang', l);
      history.replaceState(history.state, '', u.pathname + u.search + u.hash);
    } catch (e) {}
  }

  /* Petit sélecteur à insérer dans la page */
  function selecteurLangue() {
    const s = document.createElement('select');
    s.className = 'choix-langue';
    s.setAttribute('data-no-i18n', '');
    s.setAttribute('aria-label', 'Langue / Language / Язык');
    Object.keys(LANGUES).forEach(k => {
      const o = document.createElement('option');
      o.value = k; o.textContent = LANGUES[k];
      if (k === langue) o.selected = true;
      s.appendChild(o);
    });
    s.addEventListener('change', () => choisirLangue(s.value));
    return s;
  }

  function demarrer() {
    origTitre = document.title;
    document.querySelectorAll('[data-langue]').forEach(z => z.appendChild(selecteurLangue()));
    appliquer();
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();

  window.t = t;
  window.langueInterface = () => langue;
  window.choisirLangue = choisirLangue;
})();
