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
- **CI** : GitHub Actions

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
│  ├─ middleware/         # Middlewares (auth, etc.)
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
| `npm test` | Exécution des tests automatisés |

---

## API Endpoints

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription utilisateur | ❌ |
| POST | `/api/auth/login` | Connexion utilisateur | ❌ |

### Films

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/movies` | Liste des films | ✅ |
| GET | `/api/movies/:id` | Détails d'un film | ✅ |

### Recherche

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/search?q=` | Recherche de films | ✅ |

### Favoris

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/favorites/:movieId` | Ajouter un favori | ✅ |
| DELETE | `/api/favorites/:movieId` | Supprimer un favori | ✅ |
| GET | `/api/favorites` | Liste des favoris | ✅ |

### Commentaires

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/comments/:movieId` | Ajouter un commentaire | ✅ |
| GET | `/api/comments/:movieId` | Liste des commentaires d'un film | ❌ |

### Relations (follow)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/follow/:userId` | Suivre un utilisateur | ✅ |
| DELETE | `/api/follow/:userId` | Ne plus suivre | ✅ |

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

Une pipeline GitHub Actions est configurée pour le backend.  
À chaque push ou pull request, la CI exécute :

- Installation des dépendances
- Exécution des tests automatisés
- Build TypeScript

Cela garantit la stabilité du code avant toute intégration ou déploiement.

---

## Environnements

- **Développement / CI** : MongoDB local ou conteneurisé
- **Production** : MongoDB Atlas

Les secrets (JWT, URI MongoDB) ne sont jamais versionnés et sont injectés via les variables d'environnement de la plateforme de déploiement.

---

## Statut du projet

- ✅ Backend fonctionnel
- ✅ Tests automatisés en place
- ✅ Docker opérationnel
- ✅ CI validée

---

## Remarque

Ce backend est conçu pour être utilisé avec le frontend CineLink, développé séparément dans le même mono-repo.
