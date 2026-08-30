# Changelog

Toutes les évolutions notables de CineLink sont documentées dans ce fichier.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

CineLink utilisait auparavant un déploiement continu sans tags Git ni GitHub Releases formelles. La version `1.0.0` constitue la première version officiellement matérialisée dans le dépôt. Les éléments listés dans cette version correspondent à l'état stable actuellement livré et vérifiable dans `main`.

## [Unreleased]

Cette section est réservée aux futures évolutions non encore intégrées à une version officielle.

## [1.0.0] - 2026-08-12

Première release officielle de CineLink.

### Added

- Backend : API Express / TypeScript structurée avec routes, contrôleurs, middlewares, modèles Mongoose et configuration dédiée.
- Backend : authentification JWT avec inscription, connexion, hachage bcrypt des mots de passe et protection des routes.
- Backend : fonctionnalités utilisateurs, profils, favoris, notation, commentaires, follow / unfollow, feed social, recherche et détails de films via TMDB.
- Backend : administration minimale avec statistiques, suppression de commentaires, suppression d'utilisateurs et script `admin:promote`.
- Frontend : application React / Vite / TypeScript avec authentification, routes protégées, catalogue, détails film, favoris, notation, commentaires, profils, utilisateurs, follow et feed.
- Frontend : configuration Vercel avec fallback SPA via `cinelink-frontend/vercel.json`.
- Exploitation : Dockerfile backend et environnement Docker Compose local avec MongoDB.
- Exploitation : configuration Dependabot pour npm backend, npm frontend et GitHub Actions.

### Fixed

- Frontend : correction du remplissage visuel des étoiles de notation sur la page Favoris via le commit `653f4c7`.
- Frontend : préservation des données enrichies d'un favori après notation, afin d'éviter le remplacement de la carte par une réponse partielle, via le commit `653f4c7`.
- Frontend : correction de l'affichage responsive de la notation sur la page Favoris, avec retour à la ligne des étoiles et boutons non rétrécis, via la PR #55, le commit `8f36071` et le merge `16229e4`.
- Frontend : correction de la redirection après déconnexion vers `/login`.
- Backend : correction de configuration `ts-jest` en remplaçant l'usage déprécié de `globals` par `transform`, via le commit `b6bf23e`.

### Tests

- Backend : tests automatisés avec Jest, Supertest et MongoDB Memory Server.
- Backend : tests couvrant notamment l'authentification, les utilisateurs, la recherche, les commentaires, les favoris, les follows, le feed, l'administration et `/api/health`.
- Frontend : tests automatisés avec Vitest, React Testing Library et jsdom.
- Frontend : tests couvrant des pages critiques, l'authentification, l'administration, les formulaires et des interactions utilisateur.
- CI : workflows GitHub Actions pour le backend, le frontend et l'analyse SonarCloud.
- CI : mise à jour de `actions/setup-node` vers `v7` via la PR #1.

### Operations

- Backend : endpoint `/api/health` exposant l'état API, l'état MongoDB, l'uptime, l'environnement, la version et la mémoire.
- Backend : réponse `503` du healthcheck lorsque MongoDB est indisponible.
- Backend : journalisation applicative et HTTP avec Winston et Morgan.
- Exploitation : supervision documentée de `https://cinelink-backend.onrender.com/api/health` avec contrôle toutes les 3 minutes, timeout de 30s, condition `URL becomes unavailable` et notification à `flo.portets@free.fr`.
- Exploitation : déploiements documentés pour le backend Render et le frontend Vercel.
- Exploitation : incident Render de timeout documenté avec diagnostic et mesures de prévention.
- Qualité : intégration SonarCloud et configuration `sonar-project.properties`.

### Documentation

- Documentation : README principal avec architecture, installation, scripts, variables, qualité, sécurité et déploiement.
- Documentation technique : `docs/BACKEND.md`, `docs/FRONTEND.md`, `docs/SECURITY.md`, `docs/QUALITY.md` et `docs/RECETTE.md`.
- Documentation MCO : runbook d'exploitation dans `docs/runbook.md`.
- Documentation MCO : documentation de supervision dans `cinelink-backend/docs/monitoring.md`.
- Documentation MCO : audit de préparation à la production dans `docs/production-readiness-audit.md`.
- Documentation MCO : incident Render documenté dans `cinelink-backend/docs/incidents/render-deployment-timeout.md`.
