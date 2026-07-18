# Deploiement production CineLink Backend

Ce document couvre le backend Express TypeScript de CineLink.

## Prerequis

- Node.js 20.
- MongoDB Atlas accessible depuis l'environnement Render.
- Cle TMDB.
- Variables d'environnement configurees sur Render.

## Variables d'environnement

| Variable | Exemple | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port utilise par le serveur si la plateforme ne le fournit pas. |
| `MONGO_URI` | `mongodb+srv://...` | URI MongoDB Atlas de production. |
| `JWT_SECRET` | valeur longue et secrete | Cle de signature JWT. |
| `JWT_EXPIRES_IN` | `1h` | Duree de validite des tokens. |
| `TMDB_API_KEY` | cle TMDB | Acces a The Movie Database. |
| `FRONTEND_URL` | URL Vercel | Origine autorisee par CORS. |
| `LOG_LEVEL` | `info` | Niveau des logs. |

Ne pas utiliser `mongodb://mongo:27017/cinelink` en production. Cette URI est reservee au reseau Docker Compose local.

## Build

```bash
npm ci
npm run build
```

## Demarrage

```bash
npm start
```

`npm start` execute `node dist/server.js`; le build doit donc etre effectue avant le demarrage.

## Verification

Endpoint de sante :

```http
GET /api/health
```

Lorsque l'API et MongoDB sont disponibles, la reponse contient `status: "UP"` et `database: "UP"`.

Si MongoDB n'est pas joignable, l'endpoint retourne un code `503`.

## Controle avant deploiement

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Le workflow SonarQube Cloud relance les tests avec couverture dans GitHub Actions.
