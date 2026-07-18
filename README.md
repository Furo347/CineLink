# CineLink

CineLink est une application sociale autour du cinema. Elle permet a un utilisateur de creer un compte, parcourir des films via TMDB, gerer ses favoris, publier des commentaires, suivre d'autres utilisateurs et consulter un feed d'activite. Le projet contient aussi une administration minimale pour moderer les commentaires et supprimer des utilisateurs.

La documentation de reference est regroupee dans le dossier [docs](docs) :

- [Backend](docs/BACKEND.md)
- [Frontend](docs/FRONTEND.md)
- [Qualite et CI/CD](docs/QUALITY.md)
- [Securite et administration](docs/SECURITY.md)
- [Cahier de recette](docs/RECETTE.md)

## Fonctionnalites

- Inscription et connexion avec JWT.
- Catalogue de films populaires et detail d'un film via TMDB.
- Recherche de films.
- Favoris avec notation.
- Commentaires sur les films.
- Publication d'un commentaire avec `Entree`; `Maj + Entree` garde le saut de ligne dans le champ de commentaire.
- Recherche et consultation de profils utilisateurs.
- Follow / unfollow et feed social.
- Roles `USER` et `ADMIN`.
- Administration : statistiques simples, suppression de commentaires, suppression d'utilisateurs.
- Feedback de chargement sur la connexion et l'inscription lorsque l'API met du temps a repondre.

## Architecture

```text
CineLink/
├── .github/workflows/          # CI backend, CI frontend, analyse SonarQube Cloud
├── cinelink-backend/           # API Express TypeScript
│   ├── src/
│   │   ├── config/             # Connexion MongoDB, logger
│   │   ├── controllers/        # Logique HTTP
│   │   ├── middlewares/        # JWT, controle admin
│   │   ├── models/             # Modeles Mongoose
│   │   ├── routes/             # Routes Express
│   │   └── scripts/            # Seed et promotion admin
│   ├── tests/                  # Jest, Supertest, MongoDB Memory Server
│   ├── Dockerfile
│   └── docker-compose.yml
├── cinelink-frontend/          # React, Vite, TypeScript, Tailwind CSS
│   ├── src/
│   │   ├── app/                # Router, layout, protection des routes
│   │   ├── components/
│   │   ├── features/           # Auth, movies, comments, feed, admin...
│   │   ├── lib/
│   │   └── services/
│   └── test/                   # Vitest et React Testing Library
├── docs/                       # Documentation technique a jour
├── sonar-project.properties
└── docker-compose.monitoring.yml
```

## Stack

Backend :

- Node.js 20, Express 5, TypeScript.
- MongoDB avec Mongoose.
- Authentification JWT, mots de passe hashes avec bcrypt.
- TMDB via Axios.
- Jest, Supertest et MongoDB Memory Server.
- Docker et Docker Compose.
- Render en production.

Frontend :

- React 19, Vite, TypeScript.
- Tailwind CSS.
- Axios.
- React Router.
- Vitest, React Testing Library et jsdom.
- Vercel en production.

Qualite et CI/CD :

- GitHub Actions.
- SonarQube Cloud.
- Rapports LCOV backend et frontend.
- ESLint et TypeScript.

## Prerequis

- Node.js 20.
- npm.
- Docker, optionnel mais utile pour MongoDB local et l'API backend.
- Une base MongoDB locale, Docker ou MongoDB Atlas.
- Une cle TMDB.

## Installation locale

```bash
git clone <url-du-depot>
cd CineLink
```

Installer le backend :

```bash
cd cinelink-backend
npm ci
```

Installer le frontend :

```bash
cd ../cinelink-frontend
npm ci
```

## Variables d'environnement

Ne versionnez jamais de secret reel. Les fichiers `.env` sont ignores par Git.

Backend, dans `cinelink-backend/.env` :

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/cinelink
JWT_SECRET=change_me_with_a_long_secret
JWT_EXPIRES_IN=1h
TMDB_API_KEY=your_tmdb_api_key
FRONTEND_URL=http://localhost:5173
```

Avec Docker Compose depuis le dossier backend, le service API peut utiliser :

```env
MONGO_URI=mongodb://mongo:27017/cinelink
```

Depuis le poste hote, par exemple pour lancer le seed contre le Mongo expose par Docker, utilisez plutot :

```bash
MONGO_URI=mongodb://localhost:27017/cinelink npm run seed:dev
```

Sous PowerShell :

```powershell
$env:MONGO_URI="mongodb://localhost:27017/cinelink"
npm run seed:dev
```

Frontend, dans `cinelink-frontend/.env` :

```env
VITE_API_URL=http://localhost:3000
```

En production, `FRONTEND_URL` doit correspondre a l'origine Vercel autorisee par CORS et `VITE_API_URL` doit pointer vers l'API Render.

## Lancement

Backend en local :

```bash
cd cinelink-backend
npm run dev
```

Frontend en local :

```bash
cd cinelink-frontend
npm run dev
```

API backend : `http://localhost:3000`

Frontend Vite : `http://localhost:5173`

Docker backend + MongoDB :

```bash
cd cinelink-backend
docker compose up -d --build
```

Seed de demonstration :

```bash
cd cinelink-backend
npm run seed:dev
```

Promotion d'un utilisateur en administrateur :

```bash
cd cinelink-backend
npm run admin:promote -- user@example.com
```

Alternative :

```bash
ADMIN_EMAIL=user@example.com npm run admin:promote
```

Sous PowerShell :

```powershell
$env:ADMIN_EMAIL="user@example.com"
npm run admin:promote
```

## Scripts

Backend :

| Script | Role |
| --- | --- |
| `npm run dev` | Demarre l'API en developpement avec `ts-node-dev`. |
| `npm run build` | Compile TypeScript vers `dist`. |
| `npm start` | Lance l'API compilee. |
| `npm test` | Execute les tests Jest. |
| `npm run test:coverage` | Execute les tests backend avec couverture. |
| `npm run lint` | Lance ESLint sur `src`. |
| `npm run typecheck` | Verifie TypeScript sans emission. |
| `npm run typecheck:test` | Verifie la configuration TypeScript des tests. |
| `npm run seed:dev` | Lance le seed TypeScript. |
| `npm run seed` | Lance le seed compile depuis `dist`. |
| `npm run admin:promote` | Promeut un utilisateur existant en `ADMIN`. |

Frontend :

| Script | Role |
| --- | --- |
| `npm run dev` | Demarre Vite. |
| `npm run build` | Typecheck puis build Vite. |
| `npm run lint` | Lance ESLint. |
| `npm test` | Execute Vitest en mode run. |
| `npm run test:coverage` | Execute Vitest avec couverture LCOV. |
| `npm run test:watch` | Execute Vitest en mode watch. |
| `npm run preview` | Sert le build Vite localement. |

## Tests et qualite

Commandes principales :

```bash
cd cinelink-backend
npm test
npm run test:coverage
npm run typecheck
npm run build

cd ../cinelink-frontend
npm run lint
npm test
npm run test:coverage
npm run build
```

SonarQube Cloud lit les rapports :

- `cinelink-backend/coverage/lcov.info`
- `cinelink-frontend/coverage/lcov.info`

Les pourcentages de couverture evoluent avec les tests. Les dernieres mesures communiquees etaient environ 68,4 % global, 85,9 % backend et 55,1 % frontend cote SonarQube Cloud, a verifier dans l'interface SonarQube Cloud ou dans les rapports generes au moment de l'evaluation.

## API

Toutes les routes applicatives sont prefixees par `/api`, sauf `GET /` qui retourne le statut simple de l'API.

Les routes principales sont documentees dans [docs/BACKEND.md](docs/BACKEND.md). Les routes d'administration sont protegees par JWT et par le role `ADMIN`.

## Securite

- Le role utilisateur est stocke en base avec les valeurs `USER` ou `ADMIN`.
- L'inscription cree toujours un utilisateur `USER`; le backend ignore toute tentative de role envoye par le client.
- `authMiddleware` valide le token JWT.
- `requireAdmin` recharge l'utilisateur depuis MongoDB et verifie son role cote backend.
- Les mots de passe sont hashes avec bcrypt.
- `helmet`, `cors` et un rate limit sur les routes d'authentification sont presents dans l'API.

Details : [docs/SECURITY.md](docs/SECURITY.md).

## Deploiement

Production actuelle :

| Partie | Plateforme |
| --- | --- |
| Frontend | Vercel |
| Backend | Render |
| Base de donnees | MongoDB Atlas |
| API externe | TMDB |
| Qualite | GitHub Actions et SonarQube Cloud |

Le backend peut mettre quelques secondes a repondre apres une periode d'inactivite. Le frontend affiche un message discret pendant les connexions ou inscriptions longues : "Le premier chargement peut prendre quelques instants lorsque les services redemarrent."

## Secrets CI/CD

Secrets GitHub requis pour l'analyse SonarQube Cloud :

- `SONAR_TOKEN`

Variables applicatives a configurer dans les plateformes de deploiement :

- Backend Render : `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `TMDB_API_KEY`, `FRONTEND_URL`, `PORT` si necessaire.
- Frontend Vercel : `VITE_API_URL`.

## Limites connues

- L'application depend de la disponibilite de TMDB pour les films.
- Le cold start du backend peut rallonger la premiere requete.
- L'administration reste volontairement minimale : moderation de commentaires, suppression d'utilisateurs et statistiques simples.
- La suppression admin d'un utilisateur nettoie ses commentaires, favoris, relations follow et activites liees; elle ne remplace pas une console d'administration complete.

## Documentation de certification

Les documents historiques de certification restent disponibles :

- [Accessibilite](ACCESSIBILITE.md)
- [Cahier de recettes historique](CAHIER_RECETTES.md)
- [Criteres qualite](CRITERES_QUALITE.md)
- [Manuel utilisateur](MANUEL_UTILISATEUR.md)
- [Manuel de mise a jour](MANUEL_MISE_A_JOUR.md)
- [Plan de correction des bogues](PLAN_CORRECTION_BUGS.md)
- [Changelog](CHANGELOG.md)
