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
    [/^Afficher (.+)$/, (m, t) => ({ en: 'Show ' + t(m[1]), ru: 'Показать ' + t(m[1]) })]
  ];

  function pluriel(n, un, peu, beaucoup) {
    const d = n % 10, c = n % 100;
    if (d === 1 && c !== 11) return un;
    if (d >= 2 && d <= 4 && (c < 12 || c > 14)) return peu;
    return beaucoup;
  }

  function langueInitiale() {
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
    } finally { enCours = false; }
  });

  function appliquer() {
    document.documentElement.lang = langue;
    if (!document.body) return;
    enCours = true;
    try { parcourir(document.body); if (document.title) document.title = t(origTitre); } finally { enCours = false; }
  }
  let origTitre = document.title;

  function choisirLangue(l) {
    if (!LANGUES[l]) return;
    langue = l;
    try { localStorage.setItem(CLE, l); } catch (e) {}
    appliquer();
    document.querySelectorAll('select.choix-langue').forEach(s => { s.value = l; });
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
