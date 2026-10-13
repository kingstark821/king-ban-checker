# ♛ KING BAN CHECKER

> Vérificateur de ban **royal** : une page web mobile-first (thème sombre violet/bleu, couronne, étoiles) et un petit serveur Node.js **sans aucune dépendance**, prêts à être déployés sur **GitHub + Render**.

**Développé par KING STARK** · version `1.1.0` (V1)

---

## Sommaire

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Comment ça marche](#comment-ça-marche)
4. [Structure du dépôt](#structure-du-dépôt)
5. [Démarrage rapide (en local)](#démarrage-rapide-en-local)
6. [Configuration](#configuration)
7. [Format de réponse attendu du fournisseur](#format-de-réponse-attendu-du-fournisseur)
8. [API du serveur](#api-du-serveur)
9. [Déploiement sur GitHub + Render](#déploiement-sur-github--render)
10. [Personnalisation côté utilisateur](#personnalisation-côté-utilisateur)
11. [Sécurité et confidentialité](#sécurité-et-confidentialité)
12. [Limites à connaître](#limites-à-connaître)
13. [Dépannage](#dépannage)
14. [Liens et contact](#liens-et-contact)
15. [Licence](#licence)

---

## Présentation

**KING BAN CHECKER** permet à n'importe qui d'entrer un numéro (indicatif pays + numéro) et de voir immédiatement s'il est banni ou non :

- si le numéro **n'est pas banni** : une boîte verte avec le message `NUMBER IS NOT BANNED` ;
- si le numéro **est banni** : une boîte rouge avec le message `NUMBER IS BANNED`, suivie d'un tableau de détails (type de ban, violation, catégorie, appel, date…).

Un ban de **3 mois ou plus** est affiché `ban permanent` à la place du type habituel (par exemple `mod_ban`).

Le design s'inspire de l'application *BanChecker* (réglages avec thèmes, historique, menu ⋮, image de fond) et du style visuel de la page *KING-MD PAIR CODE*.

> ⚠️ **Important** : il n'existe pas d'API officielle pour savoir si un numéro est banni. Ce projet **ne contient aucune méthode de vérification intégrée** : le serveur interroge **le fournisseur de check que tu configures** (variable `CHECK_API_URL`). Sans fournisseur configuré, la page affiche une erreur claire et n'invente jamais de résultat. Voir [Limites à connaître](#limites-à-connaître).

---

## Fonctionnalités

### Recherche
- Champ **indicatif pays** (`+509` par défaut, mémorisé sur l'appareil) + champ **numéro**.
- Tu peux aussi coller un numéro **complet** commençant par `+` ou `00` : l'indicatif est alors ignoré.
- Validation : entre **7 et 15 chiffres** au total.
- Résultat **stylé** : boîte colorée, bouton **copier** (⧉), tableau de détails animé.
- Option **« Résultat en fenêtre »** : le résultat s'affiche dans une fenêtre au lieu d'être sous le bouton.

### Détails d'un ban (tableau)
| Ligne | Contenu |
|---|---|
| Phone | le numéro vérifié (`+…`) |
| Ban type | type de ban fourni, ou **`ban permanent`** si la durée atteint le seuil |
| Violation | violation indiquée par le fournisseur |
| Category | catégorie |
| Appeal | état de l'appel |
| EU | oui / non |
| Banned at | date du ban (formatée en français si elle est lisible) |
| Appeal filed | date de dépôt d'appel |

Une information absente de la réponse du fournisseur s'affiche **`–`** : rien n'est inventé.

### Historique
- Icône 🕘 : les **30 dernières** vérifications, gardées **uniquement sur l'appareil**.
- Un appui sur une ligne remet le numéro dans le champ. Bouton **Vider**.

### Réglages (menu ⋮ → Réglages)
- **12 thèmes** : Royal (par défaut), Ghost, Neon Purple, Ocean Blue, Matrix, Rose Gold, Crimson, Cyber, Sakura, Void, Sunset, Or royal.
- **Général** : position de la carte (haut / centre / bas), résultat en fenêtre.
- **Transparence** : opacité de la carte (**0 à 100 %**, transparente par défaut) et assombrissement du fond.
- **Couleurs** : fond, texte, accent.
- **Textes modifiables** : titre, description, **message numéro banni**, **message numéro non banni**, bouton de recherche, texte de présentation et les 4 boutons de liens.
- **Ma photo** : choisis une photo dans la galerie (aperçu, remplacer, supprimer) ; elle remplace la couronne.
- **Fond** : choisis une image de fond ; elle reste visible **même derrière la carte transparente**.
- **Réinitialiser** : remet thèmes, réglages et textes d'origine.

### Menu ⋮
Réglages · Choisir une image de fond · Partager (partage natif du téléphone, ou copie du lien).

### Ambiance
- Couronne ♛ qui pulse, étoiles scintillantes, carte avec un **léger mouvement haut-bas** (il se met en pause quand on écrit ou qu'on touche l'écran).
- Les animations sont **désactivées** pour les personnes qui ont réduit les animations dans leur téléphone.

### Pied de page
`DEV BY KING STARK`, 4 boutons de liens (WhatsApp, Chaîne, Telegram, KING GENERATOR) et la signature `𝘣𝒿 𝐊𝐈𝐍𝐆 𝑺𝑻𝑨𝑹𝑲`.

---

## Comment ça marche

```
 Téléphone (index.html)
        │  GET /api/check?number=50937000000
        ▼
 Serveur Node (server.js)
   ├─ valide le numéro (7 à 15 chiffres)
   ├─ limite : 10 recherches / minute / personne
   ├─ appelle ton fournisseur  (CHECK_API_URL, clé en variable d'environnement)
   └─ renvoie un JSON propre : { number, banned, permanent, details }
        ▼
 Page : boîte verte / rouge + tableau + historique local
```

- La **clé du fournisseur reste sur le serveur** (variables d'environnement) : elle n'est jamais envoyée au navigateur.
- Les **réglages, textes, photo, fond et historique** sont stockés dans le navigateur de chaque visiteur (`localStorage`), pas sur le serveur.

---

## Structure du dépôt

```
king-ban-checker/
├── index.html      # la page (HTML + CSS + JavaScript, tout en un)
├── server.js       # le serveur Node.js (aucune dépendance)
├── package.json    # scripts npm et version de Node
├── render.yaml     # blueprint de déploiement Render
├── .env.example    # modèle des variables d'environnement
├── .gitignore      # empêche d'envoyer .env et node_modules
└── README.md       # ce fichier
```

> 📌 Le fichier doit s'appeler **`index.html` en minuscules** : le serveur le cherche avec ce nom exact.

---

## Démarrage rapide (en local)

**Prérequis :** Node.js **18 ou plus**. Aucun `npm install` de paquet n'est nécessaire (zéro dépendance).

```bash
# 1. Récupérer le projet
git clone https://github.com/<ton-compte>/king-ban-checker.git
cd king-ban-checker

# 2. Lancer (Linux / macOS)
CHECK_API_URL="https://ton-fournisseur.example/api/check?number={number}" npm start

# Windows (PowerShell)
$env:CHECK_API_URL="https://ton-fournisseur.example/api/check?number={number}"; npm start
```

Ouvre ensuite `http://localhost:3000`.

Scripts disponibles :

| Commande | Rôle |
|---|---|
| `npm start` | lance le serveur |
| `npm run dev` | lance le serveur et le relance à chaque modification (Node 18.11 ou plus) |
| `npm run check` | vérifie la syntaxe de `server.js` |

Le port se règle avec la variable `PORT` (3000 par défaut ; Render la fournit automatiquement).

---

## Configuration

Toute la configuration passe par des **variables d'environnement** (sur Render : *Environment*). Le modèle complet est dans [`.env.example`](.env.example).

### Fournisseur de check

| Variable | Obligatoire | Défaut | Rôle |
|---|---|---|---|
| `CHECK_API_URL` | **oui** | — | URL du fournisseur. `{number}` est remplacé par le numéro (chiffres seulement). |
| `CHECK_API_KEY` | non | — | Clé du fournisseur. |
| `CHECK_API_KEY_HEADER` | non | `Authorization` | Nom de l'en-tête qui porte la clé. |

### Noms des champs de la réponse du fournisseur

| Variable | Défaut | Champ lu |
|---|---|---|
| `BANNED_FIELD` | `banned` | **obligatoire** — booléen : `true` = banni, `false` = pas banni |
| `TYPE_FIELD` | `ban_type` | type de ban |
| `VIOLATION_FIELD` | `violation` | violation |
| `CATEGORY_FIELD` | `category` | catégorie |
| `APPEAL_FIELD` | `appeal` | appel |
| `EU_FIELD` | `eu` | UE |
| `BANNED_AT_FIELD` | `banned_at` | date du ban |
| `APPEAL_FILED_FIELD` | `appeal_filed` | date de dépôt d'appel |
| `DURATION_HOURS_FIELD` | `duration_hours` | durée du ban, en heures |
| `BANNED_UNTIL_FIELD` | `banned_until` | date de fin du ban |

Les noms peuvent être des chemins avec des points, par exemple `data.status.banned`.

### Ban permanent

| Variable | Défaut | Rôle |
|---|---|---|
| `PERMANENT_AFTER_DAYS` | `80` | à partir de ce nombre de jours, le ban s'affiche **`ban permanent`** (3 mois ≈ 90 jours) |

La durée est déterminée ainsi :
1. si le fournisseur envoie un nombre d'heures (`DURATION_HOURS_FIELD`), il est utilisé ;
2. sinon, si le fournisseur envoie une date de début **et** une date de fin (`BANNED_AT_FIELD` et `BANNED_UNTIL_FIELD`), la durée est calculée entre les deux ;
3. sinon, **aucune durée n'est connue** : le type de ban est affiché tel quel (jamais de « permanent » inventé).

---

## Format de réponse attendu du fournisseur

Le fournisseur doit répondre en **JSON**. Exemple pour un numéro banni 24 h :

```json
{
  "banned": true,
  "ban_type": "mod_ban",
  "violation": "blocked",
  "category": "unknown",
  "appeal": "Not available",
  "eu": false,
  "banned_at": "2026-10-12T08:30:00Z",
  "duration_hours": 24
}
```

Exemple pour un numéro non banni :

```json
{ "banned": false }
```

Règles de lecture :
- `banned` **doit** être `true` ou `false` (booléen), sinon le serveur renvoie une erreur « réponse invalide ».
- Les booléens des autres champs sont affichés `Yes` / `No`.
- Les objets sont ignorés ; les textes sont coupés à 80 caractères.
- Pour un numéro non banni, aucun détail n'est envoyé à la page.

---

## API du serveur

### `GET /api/check?number=<chiffres>`

Exemple : `/api/check?number=50937000010`

**Numéro banni (200)**
```json
{
  "number": "50937000010",
  "banned": true,
  "permanent": false,
  "details": {
    "type": "mod_ban",
    "violation": "blocked",
    "category": "unknown",
    "appeal": "Not available",
    "eu": "No",
    "bannedAt": "2026-10-12T08:30:00Z",
    "appealFiled": null
  }
}
```

**Numéro non banni (200)**
```json
{ "number": "50937000011", "banned": false }
```

**Erreurs**

| Code | Quand | Message |
|---|---|---|
| `400` | numéro hors de 7 à 15 chiffres | « Entre un numero valide avec l'indicatif pays… » |
| `429` | plus de 10 recherches par minute | « Trop de recherches. Attends une minute. » |
| `503` | `CHECK_API_URL` non configurée | « Checker non configure… » |
| `502` | le fournisseur répond une erreur ou un JSON invalide | message détaillé |
| `500` | erreur inattendue | « Erreur serveur. Reessaie. » |

### `GET /health`
Renvoie `{ "ok": true }`. Utilisé par Render pour vérifier que le service est vivant.

### `GET /`
Sert la page `index.html`.

---

## Déploiement sur GitHub + Render

### 1. GitHub
1. Crée un dépôt nommé **`king-ban-checker`** (privé recommandé).
2. Ajoute les fichiers : `index.html`, `server.js`, `package.json`, `render.yaml`, `.env.example`, `.gitignore`, `README.md`.
3. **Ne mets jamais** de vraie clé ou de vrai fichier `.env` dans le dépôt.

> 💡 Sur téléphone, les fichiers qui commencent par un point (`.env.example`, `.gitignore`) sont souvent cachés : crée-les avec **Add file → Create new file** sur GitHub en tapant le nom exact.

### 2. Render (méthode Blueprint)
1. Sur Render : **New → Blueprint**, puis choisis ton dépôt GitHub.
2. Render lit `render.yaml` et crée le service `king-ban-checker` (plan gratuit, `npm install` puis `npm start`, contrôle de santé sur `/health`).
3. Render te demande les valeurs de `CHECK_API_URL` et `CHECK_API_KEY` : renseigne-les (elles restent privées).
4. Si tes champs de réponse ont d'autres noms, ajoute les variables correspondantes dans **Environment** (voir [Configuration](#configuration)).
5. Une fois déployé, ton site est disponible sur `https://king-ban-checker.onrender.com` (ou avec un suffixe si le nom est déjà pris).

### Mise à jour
Chaque `git push` sur la branche principale redéploie automatiquement le site.

> ⏱️ **Plan gratuit Render** : le service s'endort après un moment sans visite. La première ouverture peut alors prendre environ une trentaine de secondes.

---

## Personnalisation côté utilisateur

Tout se fait depuis **⋮ → Réglages**, sans toucher au code :

| Je veux… | Où |
|---|---|
| changer l'ambiance | Thèmes |
| que la photo de fond se voie derrière la carte | Transparence → baisse l'opacité de la carte |
| éclaircir ou assombrir la photo de fond | Transparence → assombrissement du fond |
| mettre mon visage / mon logo | Ma photo |
| mettre une image de fond | Fond (ou ⋮ → Choisir une image de fond) |
| changer « NUMBER IS BANNED » / « NUMBER IS NOT BANNED » | Textes |
| renommer le titre ou les boutons | Textes |
| tout remettre à zéro | Réinitialiser |

Ces choix sont enregistrés **sur l'appareil de chaque visiteur** : ils ne sont pas partagés entre appareils. Les photos sont réduites automatiquement (512 px pour la photo, 1280 px pour le fond) pour tenir dans la mémoire du navigateur.

---

## Sécurité et confidentialité

- **Aucun secret dans le code** : clés et URL du fournisseur passent uniquement par les variables d'environnement.
- `.gitignore` bloque l'envoi de `.env`, `node_modules/` et des fichiers `.log`.
- La **clé du fournisseur n'est jamais envoyée au navigateur** : seul le serveur l'utilise.
- **Limite de débit** : 10 recherches par minute et par personne (en mémoire, remise à zéro au redémarrage du serveur).
- Le serveur n'écrit **aucune donnée sur disque** et n'a **pas de base de données** : il ne garde pas les numéros recherchés.
- Les numéros saisis sont **envoyés au fournisseur de check** que tu as choisi : lis ses conditions d'utilisation et sa politique de confidentialité avant de le mettre en ligne.
- L'historique reste dans le navigateur du visiteur et peut être vidé à tout moment.
- Utilise l'outil de manière responsable : vérifie **ton propre numéro** ou celui de personnes qui sont d'accord.

---

## Limites à connaître

- **Pas de méthode de check incluse.** Il n'existe pas d'API officielle de statut de ban ; tu dois fournir un fournisseur (`CHECK_API_URL`). La qualité des résultats dépend entièrement de lui.
- **Les détails dépendent du fournisseur.** Si un champ n'est pas envoyé, la ligne affiche `–`.
- **« ban permanent » exige une durée.** Sans durée (ni heures, ni dates de début et de fin), le type est affiché tel quel.
- **Stockage navigateur limité** (environ 5 Mo) : une photo ou un fond trop lourd peut ne pas être gardé après fermeture (la page le signale).
- **Polices Google Fonts** : chargées depuis Internet ; sans connexion, des polices de secours sont utilisées.
- **Plan gratuit Render** : mise en veille après inactivité.
- La limite de 10 recherches par minute est **en mémoire** : elle repart de zéro quand le service redémarre.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| « Checker non configuré » | `CHECK_API_URL` absente | Ajoute-la dans Render → Environment, puis redéploie. |
| « Réponse du fournisseur invalide : le champ "banned"… » | le champ booléen n'a pas ce nom ou n'est pas `true`/`false` | Règle `BANNED_FIELD` (chemins à points acceptés). |
| « Le fournisseur a répondu avec une erreur (401/403) » | clé absente, fausse ou mauvais en-tête | Vérifie `CHECK_API_KEY` et `CHECK_API_KEY_HEADER`. |
| « Trop de recherches » | plus de 10 requêtes en une minute | Attends une minute. |
| Tableau rempli de `–` | le fournisseur n'envoie pas ces champs | Règle les variables `*_FIELD` sur les vrais noms. |
| Jamais « ban permanent » | aucune durée reçue | Renseigne `DURATION_HOURS_FIELD`, ou `BANNED_AT_FIELD` + `BANNED_UNTIL_FIELD`. |
| Page blanche ou erreur 500 sur `/` | le fichier n'est pas nommé `index.html` (minuscules) | Renomme-le exactement `index.html`. |
| Premier chargement très lent | service gratuit endormi | Patiente environ 30 secondes, puis ça va vite. |
| Mes anciens textes réapparaissent | textes enregistrés sur cet appareil | Réglages → Réinitialiser. |

---

## Liens et contact

- 🆘 **Contact en cas de problème** : https://t.me/king_stark821
- 📢 **Chaîne WhatsApp** : https://whatsapp.com/channel/0029VbCY0ob7YSd0Oc9d650O
- 💬 **Groupe WhatsApp** : https://chat.whatsapp.com/LD552OxNd8S66blj7Jgo8H
- 🤖👾 **KING GENERATOR** : https://king-generator-ai.lovable.app

---

## Licence

Projet **privé — tous droits réservés** (`UNLICENSED`). © KING STARK.

<p align="center">♛ <b>DEV BY KING STARK</b> ♛<br>𝘣𝒿 𝐊𝐈𝐍𝐆 𝑺𝑻𝑨𝑹𝑲</p>
