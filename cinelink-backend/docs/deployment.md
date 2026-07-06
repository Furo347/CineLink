# Deploiement production CineLink Backend

## Prerequis

- Node.js 20.x
- Une base MongoDB Atlas accessible depuis l'environnement de production
- Les variables d'environnement configurees sur la plateforme de deploiement

## Variables d'environnement

Variables obligatoires :

| Variable | Exemple | Description |
| --- | --- | --- |
| `NODE_ENV` | `production` | Active le mode production. |
| `PORT` | `3000` | Port d'ecoute fourni par la plateforme. Le serveur utilise `process.env.PORT`. |
| `MONGO_URI` | `mongodb+srv://user:password@cluster.mongodb.net/cinelink?retryWrites=true&w=majority` | URI MongoDB Atlas en production. |
| `JWT_SECRET` | valeur longue et secrete | Cle de signature des tokens JWT. |
| `JWT_EXPIRES_IN` | `7d` | Duree de validite des tokens JWT. |
| `TMDB_API_KEY` | cle API TMDB | Cle d'acces a l'API The Movie Database. |
| `FRONTEND_URL` | `https://app.example.com` | Origine autorisee pour CORS. |

Variable optionnelle :

| Variable | Exemple | Description |
| --- | --- | --- |
| `LOG_LEVEL` | `info` | Niveau de logs Winston. |

Ne pas utiliser l'URI Docker locale `mongodb://mongo:27017/cinelink` en production. Elle est reservee au `docker-compose.yml` local. En production, `MONGO_URI` doit pointer vers MongoDB Atlas.

## Build

Installer les dependances et compiler TypeScript :

```bash
npm ci
npm run build
```

Le build genere le dossier `dist/`.

## Demarrage

Demarrer le backend compile :

```bash
npm start
```

La commande execute :

```bash
node dist/server.js
```

Le serveur Express ecoute sur `process.env.PORT` avec un fallback local sur `3000`.

## Verification post-deploiement

Apres deploiement, verifier le endpoint de sante :

```bash
curl https://<backend-production-url>/api/health
```

Reponse attendue lorsque l'API et MongoDB Atlas sont disponibles :

```json
{
  "status": "UP",
  "database": "UP",
  "uptime": 123.45,
  "timestamp": "2026-07-06T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "rss": 12345678,
    "heapTotal": 9876543,
    "heapUsed": 4567890
  }
}
```

Si MongoDB Atlas n'est pas joignable ou si la connexion Mongoose n'est pas prete, le endpoint retourne `status: "DOWN"`, `database: "DOWN"` et un code HTTP `503`.

## Verification locale avant deploiement

Depuis `cinelink-backend` :

```bash
npm run typecheck
npm run build
npm test -- --runInBand
```

Pour tester le mode production localement, definir les variables d'environnement puis lancer :

```bash
npm run build
NODE_ENV=production PORT=3000 npm start
```

Sous PowerShell :

```powershell
$env:NODE_ENV="production"
$env:PORT="3000"
npm start
```
