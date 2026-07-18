# Criteres de qualite et de performance

Ce document synthetise les criteres suivis pour CineLink. La documentation technique detaillee est disponible dans [docs/QUALITY.md](docs/QUALITY.md).

## Qualite code

| Critere | Mise en oeuvre |
| --- | --- |
| TypeScript | Backend et frontend typés. |
| Tests backend | Jest, Supertest, MongoDB Memory Server. |
| Tests frontend | Vitest, React Testing Library, jsdom. |
| Couverture | Rapports LCOV generes par `npm run test:coverage`. |
| Lint | ESLint backend et frontend. |
| Build | `tsc` backend, `tsc -b && vite build` frontend. |
| Analyse statique | SonarQube Cloud via GitHub Actions. |

## Criteres d'acceptation

- Les parcours critiques doivent etre couverts : auth, films, favoris, commentaires, feed, profils, admin.
- Les erreurs `400`, `401`, `403`, `404` et les erreurs serveur importantes doivent etre testees cote backend.
- Les etats frontend importants doivent etre couverts : chargement, erreur, liste vide, redirection auth, actions echouees.
- Les fichiers generes (`coverage`, `dist`, `build`) ne doivent pas etre analyses comme code source.
- Les secrets ne doivent pas etre versionnes.

## Couverture

Les dernieres valeurs communiquees pour SonarQube Cloud etaient environ :

- global : 68,4 % ;
- backend : 85,9 % ;
- frontend : 55,1 %.

Ces chiffres doivent etre verifies dans SonarQube Cloud ou en regenerant les rapports au moment de l'evaluation. Ils ne sont pas presentes comme des seuils figes.

## Performance

Points suivis :

- temps de reponse de l'API ;
- disponibilite MongoDB via `/api/health` ;
- comportement en cas de latence TMDB ;
- temps de chargement du frontend ;
- UX de connexion/inscription lors d'une reponse backend lente.

## Securite

Voir [docs/SECURITY.md](docs/SECURITY.md).

Points principaux :

- JWT ;
- mots de passe hashes ;
- validation des entrees ;
- CORS configure par `FRONTEND_URL` ;
- rate limit sur l'authentification ;
- roles `USER` / `ADMIN` controles cote backend.

## Amelioration continue

Pistes realistes :

- journal d'audit admin dedie ;
- tests end-to-end sur les parcours principaux ;
- monitoring applicatif plus complet ;
- optimisation des appels TMDB et strategie de cache ;
- politique de restauration ou archivage avant suppression admin.
