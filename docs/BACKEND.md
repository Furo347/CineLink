# Backend CineLink

Le backend est une API Express ecrite en TypeScript. Elle expose les fonctionnalites d'authentification, films, favoris, commentaires, relations sociales, feed et administration.

## Architecture

```text
cinelink-backend/
├── src/
│   ├── app.ts                 # Configuration Express et montage des routes
│   ├── server.ts              # Connexion MongoDB puis listen
│   ├── config/
│   │   ├── db.ts              # Connexion Mongoose
│   │   └── logger.ts          # Winston
│   ├── controllers/           # Logique des routes
│   ├── middlewares/
│   │   ├── authMiddleware.ts  # Verification JWT
│   │   └── requireAdmin.ts    # Controle du role ADMIN
│   ├── models/                # Schemas Mongoose
│   ├── routes/                # Definition des endpoints
│   └── scripts/
│       ├── seed.ts
│       └── promoteAdmin.ts
├── tests/                     # Jest, Supertest, MongoDB Memory Server
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Demarrage

```bash
cd cinelink-backend
npm ci
npm run dev
```

L'API ecoute par defaut sur `http://localhost:3000`.

Avec Docker Compose :

```bash
cd cinelink-backend
docker compose up -d --build
```

Le compose demarre :

- `api` sur le port `3000`.
- `mongo` sur le port `27017`.

## Variables d'environnement

| Variable | Obligatoire | Exemple | Role |
| --- | --- | --- | --- |
| `PORT` | Non | `3000` | Port HTTP. |
| `MONGO_URI` | Oui | `mongodb://localhost:27017/cinelink` | Connexion MongoDB hors Docker. |
| `JWT_SECRET` | Oui | `change_me` | Signature des tokens JWT. |
| `JWT_EXPIRES_IN` | Oui | `1h` | Duree de validite du token. |
| `TMDB_API_KEY` | Oui | `tmdb_key` | Cle API TMDB. |
| `FRONTEND_URL` | Non | `http://localhost:5173` | Origine autorisee par CORS. |
| `NODE_ENV` | Non | `development` | Environnement d'execution. |
| `LOG_LEVEL` | Non | `info` | Niveau du logger Winston. |

Dans Docker Compose, l'API peut utiliser `mongodb://mongo:27017/cinelink`. Depuis le poste hote, utilisez `mongodb://localhost:27017/cinelink`.

## Modeles

| Modele | Role principal |
| --- | --- |
| `User` | Compte utilisateur, email, mot de passe hash, avatar, role `USER` ou `ADMIN`. |
| `Favorite` | Film favori d'un utilisateur, identifiant TMDB, titre et note optionnelle. |
| `Comment` | Commentaire associe a un film TMDB et a un utilisateur. |
| `Follow` | Relation follower / following entre deux utilisateurs. |
| `Activity` | Activite sociale affichee dans le feed. |

## Authentification

Les routes protegees attendent un header :

```http
Authorization: Bearer <token>
```

`authMiddleware` extrait le token, verifie sa signature et expose l'identifiant utilisateur a la requete. Un token absent ou invalide retourne `401`.

Les routes admin utilisent ensuite `requireAdmin`, qui recharge l'utilisateur depuis MongoDB et verifie que son role est `ADMIN`.

## Routes

| Methode | Chemin | Auth | Role | Parametres | Reponse principale | Erreurs courantes |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/` | Non | - | - | `{ name, status }` | - |
| `GET` | `/api/health` | Non | - | - | Statut API, MongoDB, uptime, version, memoire | `503` si MongoDB est indisponible |
| `POST` | `/api/auth/register` | Non | - | `name`, `email`, `password`, `avatar?` | `201` avec `token` et `user` | `400`, `429`, `500` |
| `POST` | `/api/auth/login` | Non | - | `email`, `password` | `200` avec `token` et `user` | `400`, `429`, `500` |
| `GET` | `/api/movies/popular` | Oui | `USER` ou `ADMIN` | - | Liste de films populaires TMDB | `401`, `500` |
| `GET` | `/api/movies/:id` | Oui | `USER` ou `ADMIN` | `id` TMDB | Detail film TMDB | `401`, `404`, `500` |
| `GET` | `/api/search?q=...` | Oui | `USER` ou `ADMIN` | query `q` | Resultats films TMDB | `400`, `401`, `500` |
| `GET` | `/api/favorites` | Oui | `USER` ou `ADMIN` | - | Favoris de l'utilisateur connecte | `401`, `500` |
| `POST` | `/api/favorites` | Oui | `USER` ou `ADMIN` | `tmdbId` | Favori cree ou existant | `400`, `401`, `500` |
| `DELETE` | `/api/favorites/:id` | Oui | `USER` ou `ADMIN` | `id` favori | Suppression du favori | `401`, `404`, `500` |
| `PUT` | `/api/favorites/:id/rate` | Oui | `USER` ou `ADMIN` | `rating` | Favori note | `400`, `401`, `404`, `500` |
| `GET` | `/api/comments/:movieId` | Non | - | `movieId` TMDB | Commentaires du film | `500` |
| `POST` | `/api/comments` | Oui | `USER` ou `ADMIN` | `movieId`, `content` | Commentaire cree | `400`, `401`, `500` |
| `DELETE` | `/api/comments/:id` | Oui | Auteur | `id` commentaire | Commentaire supprime | `401`, `403`, `404`, `500` |
| `POST` | `/api/follow/:id` | Oui | `USER` ou `ADMIN` | `id` utilisateur cible | Relation creee | `400`, `401`, `404`, `500` |
| `DELETE` | `/api/follow/:id` | Oui | `USER` ou `ADMIN` | `id` utilisateur cible | Relation supprimee | `401`, `404`, `500` |
| `GET` | `/api/follow` | Oui | `USER` ou `ADMIN` | - | Utilisateurs suivis | `401`, `500` |
| `GET` | `/api/feed` | Oui | `USER` ou `ADMIN` | - | Activites sociales | `401`, `500` |
| `GET` | `/api/users/all` | Oui | `USER` ou `ADMIN` | - | Tous les utilisateurs publics | `401`, `500` |
| `GET` | `/api/users?q=...` | Oui | `USER` ou `ADMIN` | query `q` optionnelle | Recherche utilisateurs | `401`, `500` |
| `PUT` | `/api/users/me` | Oui | `USER` ou `ADMIN` | `name?`, `avatar?` | Profil mis a jour | `400`, `401`, `500` |
| `PUT` | `/api/users/me/avatar` | Oui | `USER` ou `ADMIN` | `avatar` | Avatar mis a jour | `400`, `401`, `500` |
| `GET` | `/api/users/:id` | Oui | `USER` ou `ADMIN` | `id` utilisateur | Profil public | `401`, `404`, `500` |
| `GET` | `/api/users/:id/favorites` | Oui | `USER` ou `ADMIN` | `id` utilisateur | Favoris publics | `401`, `404`, `500` |
| `GET` | `/api/users/:id/comments` | Oui | `USER` ou `ADMIN` | `id` utilisateur | Commentaires publics | `401`, `404`, `500` |
| `GET` | `/api/admin/stats` | Oui | `ADMIN` | - | `{ users, comments, favorites, follows }` | `401`, `403`, `500` |
| `DELETE` | `/api/admin/comments/:commentId` | Oui | `ADMIN` | `commentId` | `204 No Content` | `400`, `401`, `403`, `404`, `500` |
| `DELETE` | `/api/admin/users/:userId` | Oui | `ADMIN` | `userId` | Message et details de nettoyage | `400`, `401`, `403`, `404`, `500` |

## Administration

Un premier administrateur se cree a partir d'un utilisateur existant :

```bash
cd cinelink-backend
npm run admin:promote -- user@example.com
```

Le script accepte aussi `ADMIN_EMAIL`. Il refuse de s'executer sans email et retourne une erreur si l'utilisateur n'existe pas.

La suppression admin d'un commentaire supprime aussi l'activite `COMMENT_MOVIE` associee lorsque le payload permet de la retrouver.

La suppression admin d'un utilisateur supprime :

- ses commentaires ;
- ses favoris ;
- ses relations follow entrantes et sortantes ;
- les activites ou il est acteur ou cible.

L'auto-suppression de l'administrateur courant est interdite.

## Tests et qualite

```bash
npm test
npm run test:coverage
npm run typecheck
npm run typecheck:test
npm run lint
npm run build
```

Les tests backend couvrent les controles d'authentification, les erreurs `400`, `401`, `403`, `404`, les branches des controleurs et les regles d'autorisation.

Le rapport LCOV est genere dans `cinelink-backend/coverage/lcov.info`.

## Docker

Le `Dockerfile` compile le projet TypeScript puis lance `node dist/server.js`.

Le `docker-compose.yml` local fournit l'API et MongoDB. Il ne doit pas etre confondu avec MongoDB Atlas utilise en production.

## CI et SonarQube Cloud

- `.github/workflows/backend-ci.yml` installe les dependances, lance les tests, typecheck les tests et build le backend.
- `.github/workflows/sonarcloud.yml` relance les tests avec couverture, build le backend puis transmet le LCOV a SonarQube Cloud.
- `sonar-project.properties` exclut notamment `coverage`, `node_modules`, `dist` et les scripts backend de la couverture.
