# Qualite, tests et CI/CD

Cette page resume les controles de qualite reels presents dans le monorepo.

## Outils

| Zone | Outils |
| --- | --- |
| Backend | Jest, Supertest, MongoDB Memory Server, ESLint, TypeScript |
| Frontend | Vitest, React Testing Library, jsdom, ESLint, TypeScript |
| Couverture | LCOV backend et frontend |
| Analyse statique | SonarQube Cloud |
| CI/CD | GitHub Actions |

## Commandes locales

Backend :

```bash
cd cinelink-backend
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
npm run lint
npm test
npm run test:coverage
npm run build
```

## Couverture

Les rapports attendus par SonarQube Cloud sont :

- `cinelink-backend/coverage/lcov.info`
- `cinelink-frontend/coverage/lcov.info`

Les dossiers `coverage` sont ignores par Git via `.gitignore` :

```gitignore
coverage
**/coverage/
```

Ils sont aussi exclus du lint frontend avec `**/coverage/**` et du lint backend avec `coverage/**`.

Les valeurs de couverture doivent etre relues au moment de l'evaluation, car elles dependent du dernier rapport genere localement et de la derniere analyse SonarQube Cloud. Derniere valeur communiquee pour SonarQube Cloud : environ 68,4 % global, 85,9 % backend et 55,1 % frontend.

## SonarQube Cloud

La configuration est dans `sonar-project.properties`.

Sources analysees :

- `cinelink-backend/src`
- `cinelink-frontend/src`

Tests identifies :

- `cinelink-backend/tests`
- `cinelink-frontend/test`

Exclusions principales :

- `node_modules`
- `dist`
- `coverage`
- fichiers de configuration
- `cinelink-frontend/public`

Exclusions de couverture :

- tests ;
- dossiers `test` et `tests` ;
- `cinelink-backend/src/server.ts` ;
- `cinelink-backend/src/scripts/**`.

## Workflows GitHub Actions

| Fichier | Role |
| --- | --- |
| `.github/workflows/backend-ci.yml` | CI backend sur changements backend : installation, tests, typecheck tests, build. |
| `.github/workflows/frontend-ci.yml` | CI frontend sur changements frontend : installation, lint, tests, build. |
| `.github/workflows/sonarcloud.yml` | Tests avec couverture backend et frontend, builds, analyse SonarQube Cloud. |

Le workflow SonarQube Cloud demarre un service MongoDB pour les tests backend et utilise `SONAR_TOKEN`.

## Secrets GitHub

Secret requis :

- `SONAR_TOKEN` : token genere dans SonarQube Cloud.

Les workflows de test utilisent des variables de test non sensibles (`JWT_SECRET=test_jwt_secret`, `TMDB_API_KEY=dummy`, etc.). Les secrets applicatifs de production restent dans Render, Vercel et MongoDB Atlas.

## Quality Gate

Le Quality Gate est gere cote SonarQube Cloud. La CI produit les rapports de couverture avant l'analyse. Les ecarts entre couverture locale et couverture Sonar peuvent venir :

- des exclusions Sonar ;
- des fichiers sources consideres par Sonar mais pas par le runner local ;
- d'un rapport LCOV obsolète ;
- d'une analyse Sonar realisee sur une branche differente.

## Verification avant livraison

Checklist recommandee :

- `npm run test:coverage` backend.
- `npm run typecheck` backend.
- `npm run build` backend.
- `npm run lint` frontend.
- `npm run test:coverage` frontend.
- `npm run build` frontend.
- `git status --short` pour verifier que `coverage` n'est pas versionne.
