# Manuel de mise a jour

Ce manuel decrit une procedure simple de mise a jour pour CineLink. Il ne suppose pas de migration automatique non presente dans le code.

## Prerequis

- Acces au depot Git.
- Node.js 20 et npm.
- Docker si la base MongoDB locale est lancee avec Docker Compose.
- Acces aux tableaux de bord Render, Vercel, MongoDB Atlas et SonarQube Cloud si la mise a jour concerne la production.

## Verification avant mise a jour

```bash
git status --short
```

Verifier les changements applicatifs et documentaires, puis executer les controles adaptes :

Backend :

```bash
cd cinelink-backend
npm ci
npm test
npm run test:coverage
npm run typecheck
npm run typecheck:test
npm run lint
npm run build
```

Frontend :

```bash
cd cinelink-frontend
npm ci
npm run lint
npm test
npm run test:coverage
npm run build
```

## Mise a jour locale

1. Recuperer la derniere version du code.
2. Installer les dependances backend et frontend avec `npm ci`.
3. Verifier les fichiers `.env` locaux.
4. Lancer le backend puis le frontend.
5. Rejouer les scenarios du [cahier de recette](docs/RECETTE.md).

## Base de donnees

Aucun systeme de migration versionne n'est present actuellement.

Si une evolution de modele necessite une migration, elle doit etre traitee explicitement :

- decrire le changement de schema ;
- sauvegarder la base cible ;
- preparer un script de migration relu ;
- tester sur une base de copie ;
- documenter le rollback.

## Seed local

Depuis le backend :

```bash
npm run seed:dev
```

Avec MongoDB lance par Docker mais script execute depuis le poste hote :

```bash
MONGO_URI=mongodb://localhost:27017/cinelink npm run seed:dev
```

Sous PowerShell :

```powershell
$env:MONGO_URI="mongodb://localhost:27017/cinelink"
npm run seed:dev
```

Dans le conteneur API, l'URI Docker est :

```env
MONGO_URI=mongodb://mongo:27017/cinelink
```

## Promotion admin

```bash
cd cinelink-backend
npm run admin:promote -- user@example.com
```

Cette commande doit pointer vers la base cible via `MONGO_URI`. Verifier soigneusement l'environnement pour ne pas promouvoir le mauvais compte sur la mauvaise base.

## Deploiement production

Production actuelle :

- frontend : Vercel ;
- backend : Render ;
- base : MongoDB Atlas.

Les deploiements automatiques dependent de la configuration Render/Vercel et des branches connectees. La CI GitHub Actions reste la verification versionnee dans le depot.

## Validation post-deploiement

- Ouvrir le frontend.
- Creer ou connecter un utilisateur.
- Verifier catalogue, detail film, favori, commentaire, follow, feed et profil.
- Tester un compte `ADMIN` si la mise a jour touche l'administration.
- Verifier `GET /api/health`.
- Verifier SonarQube Cloud apres execution du workflow.

## Incident et rollback

En cas d'incident :

1. Identifier si le probleme vient du frontend, backend, MongoDB Atlas, TMDB ou des variables d'environnement.
2. Consulter les logs Render pour le backend.
3. Consulter les logs Vercel pour le frontend.
4. Restaurer la version precedente depuis la plateforme de deploiement si necessaire.
5. Ne jamais exposer les secrets dans un ticket ou un rapport d'incident.
