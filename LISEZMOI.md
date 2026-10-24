# Page QR — installation (faisable entièrement au téléphone)

## Les 3 liens

| Lien | Pour qui | Rôle |
|---|---|---|
| `https://rkroman-86.github.io/NOM-DU-DEPOT/` | Les clients (QR code) | La page avec les boutons |
| `https://rkroman-86.github.io/NOM-DU-DEPOT/admin.html` | Alex | Éditeur protégé par mot de passe |
| `https://rkroman-86.github.io/NOM-DU-DEPOT/setup.html` | Roman | Installation et changement du mot de passe |

## 1. Créer le dépôt

1. github.com → **+** → **New repository**.
2. Nom : par exemple `chez-alex` (il apparaîtra dans l'adresse). Choisir **Public**, puis **Create repository**.
3. Sur la page du dépôt, choisir **Add file → Upload files**, sélectionner les 5 fichiers `index.html`, `admin.html`, `setup.html`, `commun.js` et `config.json`, puis **Commit changes**.

## 2. Activer la page

Dans le dépôt, aller dans **Settings → Pages**. Pour *Source*, choisir **Deploy from a branch**, puis la branche **main**, dossier **/ (root)**, et **Save**.
Au bout d'1 à 2 minutes, la page est en ligne.

## 3. Créer le jeton d'accès (limité à ce dépôt)

1. Photo de profil → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. *Token name* : « Éditeur page QR ». *Expiration* : la plus longue proposée.
3. *Repository access* : **Only select repositories**, puis choisir le dépôt.
4. *Permissions → Repository permissions → Contents* : **Read and write**.
5. **Generate token**, puis copier le jeton, qui commence par `github_pat_`.

## 4. Choisir le mot de passe d'Alex

Ouvrir `…/setup.html`, coller le jeton, choisir le mot de passe (10 caractères minimum, une phrase de préférence) et valider.
Le jeton est **chiffré avec le mot de passe** et enregistré dans le dépôt (`auth.json`).

## 5. Donner à Alex

Il suffit de lui envoyer le lien `…/admin.html` et le mot de passe. Il modifie la page, clique sur **Enregistrer**, et la page publique est à jour en 1 à 2 minutes.

## Bon à savoir

- **Changer le mot de passe** : relancer `setup.html` (un nouveau jeton est nécessaire, ou le même s'il est encore valide).
- **Couper l'accès d'Alex** : supprimer le jeton dans GitHub (Fine-grained tokens → Delete).
- **Jeton expiré** : Alex verra « Accès refusé ». Il faut alors créer un nouveau jeton et relancer `setup.html`.
- **Historique** : chaque enregistrement crée une version dans GitHub (onglet *Commits*), ce qui permet de revenir en arrière.
- **Sécurité** : le fichier chiffré est public, d'où l'importance d'un mot de passe solide. Le jeton ne donne accès qu'à ce dépôt.
