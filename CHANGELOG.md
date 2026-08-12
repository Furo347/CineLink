# Changelog

Toutes les évolutions notables de CineLink sont documentées dans ce fichier.

Le format suit les principes de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les versions et dates ci-dessous ne sont conservées que lorsqu'elles sont vérifiables par le dépôt Git, les `package.json` ou les deployments GitHub.

## État des preuves de version

- Tags Git locaux : aucun tag trouvé.
- Tags Git distants : aucun tag trouvé sur `origin`.
- Releases GitHub : aucune release publiée sur `Furo347/CineLink`.
- Version backend déclarée : `1.0.0` dans `cinelink-backend/package.json`.
- Version frontend déclarée : `0.0.0` dans `cinelink-frontend/package.json`.
- Premier deployment Production vérifiable via GitHub Deployments : `2026-04-29T12:29:56Z`, commit `eaaf3cd`.
- Dernier deployment Production vérifiable au moment de l'analyse : `2026-08-12T11:16:24Z`, commit `342b3ed`.

En conséquence, ce changelog conserve une seule version applicative vérifiable : `1.0.0`. Les anciens jalons de travail ne sont pas présentés comme des versions de production lorsqu'ils ne correspondent pas à un tag, une release ou une version déclarée.

## [Unreleased]

Ces éléments sont présents dans le dépôt local ou en cours de préparation, mais ne correspondent pas encore à une version taguée ou release GitHub.

### Documentation

- Exploitation : enrichissement de `cinelink-backend/docs/monitoring.md` avec l'URL surveillée `https://cinelink-backend.onrender.com/api/health`, l'intervalle de contrôle de 3 minutes, le timeout de 30s, la condition `URL becomes unavailable` et le canal `flo.portets@free.fr`.
- Exploitation : mise à jour de `docs/runbook.md` avec le déroulement opérationnel d'un incident : détection, alerte, vérification manuelle, logs, variables d'environnement, MongoDB, correction ou redéploiement, validation.
- Exploitation : enrichissement de `docs/production-readiness-audit.md` avec une matrice de recommandations C4.3.1 distinguant MCO et produit, effort estimé, coût direct estimé, priorité, indicateurs et risques.
- Documentation : reconstruction du présent changelog pour distinguer les versions déployées, les changements non déployés et les incohérences de versionnement.

### Operations

- Préparation d'une future version corrective `1.0.1` après confirmation explicite du prochain déploiement et de sa date réelle.

## [1.0.0] - 2026-08-12

Version applicative conservée car `cinelink-backend/package.json` déclare `1.0.0`. Le frontend reste déclaré en `0.0.0`, ce qui est documenté comme incohérence ci-dessous.

Déploiements Production vérifiables pour cette version déclarée :

- `2026-04-29T12:29:56Z` : premier deployment Production vérifiable, commit `eaaf3cd`.
- `2026-07-06T16:01:57Z` : deployment Production du commit `eda5139`, ajout MCO initial healthcheck/logging/documentation.
- `2026-07-06T16:27:27Z` : deployment Production du commit `db1cacc`, amélioration du healthcheck et test associé.
- `2026-07-18T09:59:21Z` : deployment Production du commit `a4aacb8`, intégration SonarCloud.
- `2026-07-20T11:45:50Z` : deployment Production du commit `a9853f4`, ajout Dependabot.
- `2026-07-25T12:59:52Z` : deployment Production du merge `abd20ed`, PR #24, ajout du runbook et des scripts/backlog MCO.
- `2026-07-25T13:22:48Z` : deployment Production du merge `32c3f6d`, PR #25, badges CI et documentation README.
- `2026-07-26T17:03:19Z` : deployment Production du merge `182e3fc`, PR #53, documentation MCO et audit readiness.
- `2026-07-26T17:20:09Z` : deployment Production du merge `16229e4`, PR #55, correctif responsive Favoris.
- `2026-08-02T19:04:08Z` : deployment Production du merge `69f0c95`, PR #1, mise à jour `actions/setup-node`.
- `2026-08-12T11:16:24Z` : dernier deployment Production vérifiable, commit `342b3ed`, documentation de supervision et runbook.

### Added

- Backend : API Express / TypeScript structurée autour de routes, contrôleurs, middlewares, modèles Mongoose et configuration séparée.
- Backend : authentification JWT, hachage bcrypt des mots de passe, routes protégées et contrôles d'autorisation.
- Backend : routes utilisateurs, profils, favoris, notation, commentaires, follow / unfollow, feed social, recherche et détails de films via TMDB.
- Backend : administration minimale avec statistiques, suppression de commentaires, suppression d'utilisateurs et script `admin:promote`.
- Frontend : application React / Vite / TypeScript avec authentification, garde de routes, catalogue, détails film, favoris, notation, commentaires, profils, utilisateurs, follow et feed.
- Frontend : configuration Vercel avec fallback SPA via `cinelink-frontend/vercel.json`.
- Operations : Dockerfile backend et Docker Compose local avec MongoDB.
- Operations : configuration Dependabot pour npm backend, npm frontend et GitHub Actions, commit `a9853f4`.

### Changed

- Frontend : amélioration progressive de l'interface d'authentification, du catalogue, des détails film, des profils, du feed et de l'administration.
- Backend : renforcement de la structure des scripts npm avec `build`, `typecheck`, `typecheck:test`, `lint`, `test:coverage`, `seed` et `admin:promote`.
- Operations : clarification de l'usage séparé entre MongoDB local, Docker Compose et MongoDB Atlas documenté pour la production.
- CI : mise à jour de `actions/setup-node` de `v4` vers `v7`, PR #1, merge `69f0c95`.

### Fixed

- Frontend : correction du remplissage visuel des étoiles de notation sur la page Favoris avec `fill-primary`, commit `653f4c7`.
- Frontend : préservation des données enrichies d'un favori après notation au lieu de remplacer toute la carte par une réponse partielle, commit `653f4c7`.
- Frontend : passage cohérent de la notation Favoris à 10 étoiles et affichage `/10`, commit `653f4c7`.
- Frontend : correctif responsive des boutons d'étoiles de la page Favoris avec retour à la ligne et boutons non rétrécis, PR #55, commit `8f36071`, merge `16229e4`.
- Frontend : correction de la redirection après déconnexion vers `/login`, commit `a62de7f`.
- Backend : correction de configuration TypeScript/Jest devenue dépréciée et stabilisation de `ts-jest` via `transform`, commit `b6bf23e`.

### Security

- Backend : mots de passe hashés avec bcrypt avant stockage.
- Backend : vérification de `JWT_SECRET` et `JWT_EXPIRES_IN` pour les flux d'authentification.
- Backend : activation de `helmet` pour les en-têtes de sécurité.
- Backend : contrôle RBAC admin avec rechargement du rôle depuis MongoDB.
- Documentation : formalisation des rôles `USER` / `ADMIN`, des règles de secret et des recommandations OWASP/RGAA dans les documents sécurité et accessibilité.

### Tests

- Backend : ajout de la configuration Jest, Supertest et MongoDB Memory Server, commits `fed4e3a`, `63a1371`, `a96f518`.
- Backend : ajout de tests d'intégration sur authentification, utilisateurs, recherche, commentaires, favoris, follows, feed, admin et healthcheck.
- Backend : ajout et vérification automatisée de `/api/health`, commits `eda5139` et `db1cacc`.
- Backend : correction de configuration `ts-jest`, commit `b6bf23e`.
- Frontend : ajout de Vitest, React Testing Library et jsdom, commits `cc58acc`, `b6cd356`, `31acfe8`.
- Frontend : tests des pages critiques, auth, admin, formulaires et interactions utilisateur.

### Operations

- Backend : ajout du healthcheck `/api/health` exposant `status`, `database`, `uptime`, `timestamp`, `environment`, `version` et `memory`, avec code `503` si MongoDB est indisponible, commits `eda5139` et `db1cacc`.
- Backend : ajout de Winston et Morgan pour la journalisation applicative et HTTP, commits `eda5139` et `db1cacc`.
- CI : ajout du workflow Backend CI, commits `12f64c7`, `caaa86e`, `0274696`.
- CI : ajout du workflow Frontend CI, commit `d5e85c2`.
- CI : intégration SonarCloud avec `sonar-project.properties` et workflow dédié, commit `a4aacb8`.
- CI : adaptation SonarCloud pour ignorer le scan sur les PR Dependabot, commit `817f68b`.
- Operations : documentation du déploiement backend Render et du frontend Vercel.
- Operations : documentation d'un incident Render de timeout et des mesures de diagnostic, commit `6bb6880`.

### Documentation

- Documentation : README principal mis à jour avec architecture, installation, scripts, variables et déploiement.
- Documentation : `docs/BACKEND.md`, `docs/FRONTEND.md`, `docs/SECURITY.md`, `docs/QUALITY.md`, `docs/RECETTE.md` et documents d'accessibilité enrichis.
- Documentation MCO : ajout du runbook d'exploitation, PR #24, commit `0ade8f1`, merge `abd20ed`.
- Documentation MCO : ajout de l'audit de préparation à la production, commit `31fbb23`.
- Documentation MCO : reconstruction du backlog projet à partir de l'historique, PR #15, #16, #24, #25 et #53.
- Documentation : badges README pour la CI backend et SonarCloud, PR #25, merge `32c3f6d`.

## Incohérences et informations manquantes

- Aucun tag Git et aucune release GitHub ne matérialisent `1.0.0`.
- Le backend déclare `1.0.0`, mais le frontend déclare toujours `0.0.0`.
- Les deployments GitHub disponibles sont créés par `vercel[bot]`; ils prouvent les déploiements Vercel, mais ne prouvent pas à eux seuls l'état réel du backend Render.
- Les anciennes versions `0.1` à `0.8` ne sont pas présentes dans le changelog actuel comme versions de production et aucun tag/release correspondant n'a été trouvé.
- La future version corrective `1.0.1` ne doit pas être créée tant qu'un tag, une release ou un deployment daté correspondant n'est pas confirmé.
