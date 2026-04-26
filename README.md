# CineLink – Backend

## Présentation

CineLink est une API REST développée en Node.js permettant la gestion d'une plateforme orientée cinéma.  
Elle fournit des fonctionnalités d'authentification, de recherche de films, de gestion des favoris, de commentaires, de relations entre utilisateurs et d'un fil d'actualité personnalisé.

Le backend est conçu selon des bonnes pratiques professionnelles : séparation des responsabilités, tests automatisés, conteneurisation Docker et intégration continue.

---

## Stack technique

- **Runtime** : Node.js 20
- **Langage** : TypeScript
- **Framework HTTP** : Express
- **Base de données** : MongoDB (Mongoose)
- **Authentification** : JWT (JSON Web Token)
- **Validation** : express-validator
- **Tests** : Jest & Supertest
- **Conteneurisation** : Docker & Docker Compose
- **CI** : non présente dans ce dépôt

---

## Architecture du projet

```
cinelink-backend/
├─ src/
│  ├─ app.ts              # Configuration Express
│  ├─ server.ts           # Point d'entrée serveur
│  ├─ config/
│  │  └─ db.ts            # Connexion MongoDB
│  ├─ routes/             # Définition des routes API
│  ├─ controllers/        # Logique métier
│  ├─ models/             # Modèles Mongoose
│  ├─ middlewares/        # Middlewares (auth, etc.)
│  └─ utils/              # Fonctions utilitaires
├─ tests/                 # Tests automatisés
├─ Dockerfile
├─ docker-compose.yml
├─ tsconfig.json
├─ jest.config.ts
└─ package.json
```

---

## Installation locale

### Prérequis

- Node.js ≥ 20
- npm
- MongoDB (local ou via Docker)

### Installation

```bash
npm install
```

Créer un fichier `.env` à la racine du backend :

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/cinelink
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=http://localhost:5173
```

### Lancer le serveur en développement

```bash
npm run dev
```

L'API est accessible sur : `http://localhost:3000`

---

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage du serveur en mode développement |
| `npm run build` | Compilation TypeScript |
| `npm start` | Lancement du serveur compilé |
| `npm run typecheck:test` | Vérification TypeScript des tests |
| `npm test` | Exécution des tests automatisés |

---

## API Endpoints

Les routes protégées nécessitent un en-tête `Authorization: Bearer <token>`.

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription utilisateur (`name`, `email`, `password`, `avatar?`) | ❌ |
| POST | `/api/auth/login` | Connexion utilisateur (`email`, `password`) | ❌ |

### Films

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/movies/popular` | Liste des films populaires | ✅ |
| GET | `/api/movies/:id` | Détails d'un film | ✅ |

### Recherche

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/search?query=` | Recherche de films | ✅ |

### Favoris

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/favorites` | Ajouter un favori (body: `tmdbId`, `title?`) | ✅ |
| GET | `/api/favorites` | Liste des favoris | ✅ |
| DELETE | `/api/favorites/:id` | Supprimer un favori | ✅ |
| PUT | `/api/favorites/:id/rate` | Noter un favori (body: `rating` entre 0 et 10) | ✅ |

### Commentaires

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/comments` | Ajouter un commentaire (body: `movieId`, `content`) | ✅ |
| GET | `/api/comments/:movieId` | Liste des commentaires d'un film | ❌ |
| DELETE | `/api/comments/:id` | Supprimer un commentaire | ✅ |

### Relations (follow)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/follow/:id` | Suivre un utilisateur | ✅ |
| DELETE | `/api/follow/:id` | Ne plus suivre | ✅ |
| GET | `/api/follow` | Liste des abonnements | ✅ |

### Utilisateurs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/users/all` | Liste des utilisateurs (query `limit`, max 100) | ✅ |
| GET | `/api/users?query=` | Recherche d’utilisateurs (query `query`, `limit`) | ✅ |
| GET | `/api/users/:id` | Profil public d’un utilisateur | ✅ |
| GET | `/api/users/:id/favorites` | Favoris d’un utilisateur | ✅ |
| GET | `/api/users/:id/comments` | Commentaires d’un utilisateur | ✅ |
| PUT | `/api/users/me/avatar` | Mise à jour de l’avatar (body: `avatar`) | ✅ |
| PUT | `/api/users/me` | Mise à jour du profil (body: `name?`, `avatar?`) | ✅ |

### Fil d'actualité

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/feed` | Fil d'actualité personnalisé | ✅ |

---

## Tests automatisés

Les tests sont écrits avec Jest et Supertest.  
Ils couvrent notamment :

- les routes publiques et protégées
- les flux d'authentification (register / login)
- la recherche de films et d’utilisateurs
- les profils, favoris, commentaires, relations et fil d’actualité
- les réponses HTTP et structures JSON
- la validation des middlewares d'authentification

Lancer les tests :

```bash
npm test
```

---

## Docker

### Lancement avec Docker Compose

Le projet peut être lancé avec une base MongoDB locale via Docker.

```bash
docker compose up --build
```

Services exposés :

- **API** : `http://localhost:3000`
- **MongoDB** : `mongodb://localhost:27017`

Les données MongoDB sont persistées via un volume Docker.

---

## Intégration Continue (CI)

Aucune configuration GitHub Actions n’est présente dans ce dépôt au moment de cette vérification. Si une CI existe ailleurs, elle n’est pas versionnée dans le backend courant.

---

## Environnements

- **Développement / tests** : MongoDB local ou conteneurisé
- **Production** : MongoDB Atlas

Les secrets (JWT, URI MongoDB) ne sont jamais versionnés et sont injectés via les variables d'environnement de la plateforme de déploiement.

---

## Statut du projet

- ✅ Backend fonctionnel
- ✅ Tests automatisés en place
- ✅ Docker opérationnel
- ⚠️ CI non versionnée dans ce dépôt

---

## Remarque

Ce backend est conçu pour être utilisé avec le frontend CineLink, développé séparément dans le même mono-repo.

# CineLink – Frontend

## Presentation

CineLink Frontend est une application web React (Vite + TypeScript) pour explorer des films, gerer ses favoris, commenter, suivre des utilisateurs et consulter un fil d'actualite personnalise.

L'application consomme l'API backend CineLink via Axios avec authentification JWT.

---

## Stack technique

- **Runtime** : Node.js 20+
- **Framework UI** : React 19
- **Build tool** : Vite 7
- **Langage** : TypeScript (mode strict)
- **Routing** : React Router
- **Styling** : Tailwind CSS 4
- **HTTP client** : Axios
- **Forms/validation** : React Hook Form + Zod
- **Notifications** : Sonner
- **Qualite** : ESLint

---

## Architecture du projet

```text
cinelink-frontend/
├─ src/
│  ├─ app/                  # Shell, routes, guard auth
│  ├─ components/ui/        # UI primitives reutilisables
│  ├─ features/
│  │  ├─ auth/
│  │  ├─ movies/
│  │  ├─ search/
│  │  ├─ favorites/
│  │  ├─ comments/
│  │  ├─ follow/
│  │  ├─ users/
│  │  └─ feed/
│  ├─ lib/                  # Helpers (JWT, avatar, utils)
│  └─ services/             # Client API et stockage auth
├─ public/
├─ vite.config.ts
├─ eslint.config.js
├─ tsconfig.app.json
└─ package.json
```

---

## Installation locale

### Prerequis

- Node.js >= 20
- npm
- Backend CineLink accessible

### Installation

```bash
npm install
```

Creer un fichier `.env` a la racine du frontend :

```env
VITE_API_URL=http://localhost:3000
```

### Lancer en developpement

```bash
npm run dev
```

Application accessible sur `http://localhost:5173` (port Vite par defaut).

---

## Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur Vite en developpement |
| `npm run build` | Type-check puis build de production |
| `npm run lint` | Lance ESLint |
| `npm run preview` | Sert le build localement |

---

## Routage applicatif

### Routes publiques

| Route | Description |
|-------|-------------|
| `/` | Redirection vers `/login` |
| `/login` | Connexion |
| `/register` | Inscription |

### Routes protegees (JWT requis)

Toutes les routes `/app/*` sont protegees par `RequireAuth`.

| Route | Description |
|-------|-------------|
| `/app/feed` | Fil d'actualite |
| `/app/movies` | Catalogue de films populaires |
| `/app/movies/:id` | Detail d'un film + commentaires |
| `/app/search` | Recherche de films |
| `/app/favorites` | Gestion des favoris et notation |
| `/app/users` | Decouverte/recherche utilisateurs |
| `/app/users/:id` | Profil public d'un utilisateur |
| `/app/following` | Liste des abonnements |
| `/app/me` | Mon profil |

---

## Authentification et session

- Le token JWT est stocke dans `localStorage` sous la cle `cinelink_token`.
- Un interceptor Axios ajoute automatiquement `Authorization: Bearer <token>` sur les requetes.
- L'acces aux pages `/app/*` est bloque si le token est absent.

Fichiers cles :

- `src/services/auth.storage.ts`
- `src/services/api.ts`
- `src/app/RequireAuth.tsx`

---

## Contrat API consomme par le frontend

| Feature | Methodes frontend | Endpoints backend utilises |
|---------|-------------------|----------------------------|
| Auth | `register`, `login` | `POST /api/auth/register`, `POST /api/auth/login` |
| Movies | `getPopular`, `getById` | `GET /api/movies/popular`, `GET /api/movies/:id` |
| Search | `search` | `GET /api/search?query=` |
| Favorites | `add`, `list`, `remove`, `rate` | `POST /api/favorites`, `GET /api/favorites`, `DELETE /api/favorites/:id`, `PUT /api/favorites/:id/rate` |
| Comments | `listByMovie`, `add`, `remove` | `GET /api/comments/:movieId`, `POST /api/comments`, `DELETE /api/comments/:id` |
| Follow | `list`, `follow`, `unfollow` | `GET /api/follow`, `POST /api/follow/:id`, `DELETE /api/follow/:id` |
| Users | `search`, `getAll`, `getProfile`, `getFavorites`, `getComments`, `updateMyAvatar` | `GET /api/users`, `GET /api/users/all`, `GET /api/users/:id`, `GET /api/users/:id/favorites`, `GET /api/users/:id/comments`, `PUT /api/users/me/avatar` |
| Feed | `list` | `GET /api/feed` |

---

## UX/Pages principales

- **Catalogue** : liste des films populaires, acces rapide a la recherche.
- **Detail film** : synopsis, casting, trailer, ajout aux favoris, section commentaires.
- **Favoris** : suppression et notation des films (0 a 10).
- **Decouvrir** : recherche utilisateurs + actions follow/unfollow.
- **Abonnements** : liste des utilisateurs suivis.
- **Profil utilisateur** : stats sociales, favoris et commentaires.
- **Mon profil** : recap personnel et mise a jour de l'avatar.
- **Fil d'actualite** : activites des utilisateurs suivis (favori/note/commentaire).

---

## Qualite, build et tests

- TypeScript strict active (`strict: true` dans `tsconfig.app.json`).
- Lint via `eslint.config.js`.
- Aucun test frontend n'est versionne actuellement (`*.test.*` / `*.spec.*` non detectes).

Commandes utiles :

```bash
npm run lint
npm run build
```

---

## Deploiement

- Build de production :

```bash
npm run build
```

- Le dossier genere est `dist/`.
- Definir `VITE_API_URL` avec l'URL du backend cible (staging/prod).

---

## Remarque

Ce frontend est concu pour fonctionner avec le backend CineLink du meme mono-repo.

