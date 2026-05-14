# Historique des Versions

Tous les changements notables apportés au projet CineLink seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
et ce projet respecte [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation complète pour la certification Bloc 2
- Critères de qualité et performance
- Mesures d'accessibilité
- Cahier de recettes
- Plan de correction des bogues
- Manuel d'utilisation
- Manuel de mise à jour

## [1.0.0] - 2026-05-14

### Added
- **Architecture monorepo** : Backend Express.js + Frontend React en TypeScript
- **Authentification JWT** : Inscription, connexion, protection des routes
- **Gestion des films** : Recherche TMDB, détails, notation
- **Fonctionnalités sociales** :
  - Système de favoris
  - Commentaires sur les films
  - Suivi d'utilisateurs
  - Feed d'activité
- **Interface responsive** : Design avec Tailwind CSS
- **API REST complète** : CRUD pour tous les entités
- **Base de données MongoDB** : Modèles User, Movie, Comment, Favorite, Follow
- **Tests unitaires** : Jest (backend) + Vitest (frontend)
- **Containerisation Docker** : Multi-services avec Docker Compose
- **Déploiement** : Vercel (frontend) + Render (backend) + MongoDB Atlas

### Security
- Validation des entrées avec express-validator
- Sanitisation des données
- Protection CSRF implicite
- Audit logs d'activité
- Sécurité JWT (expiration, refresh tokens)

### Performance
- Cache des requêtes TMDB
- Optimisation des images
- Lazy loading des composants
- Bundle optimisé avec Vite

### Documentation
- README complet avec architecture, installation, déploiement
- API documentation inline
- Scripts de seeding pour démo

### DevOps
- Configuration ESLint + Prettier
- Scripts npm pour développement
- Variables d'environnement typées
- Gestion des erreurs centralisée

## [0.9.0] - 2026-04-15 [Pre-release]

### Added
- Structure de base monorepo
- Backend Express avec routes de base
- Frontend React avec routing
- Configuration TypeScript
- Tests de base

### Changed
- Migration vers architecture feature-driven

## [0.8.0] - 2026-03-20 [Pre-release]

### Added
- Authentification backend
- Modèles de base de données
- API endpoints de base
- Interface de connexion/inscription

## [0.7.0] - 2026-02-10 [Pre-release]

### Added
- Intégration TMDB API
- Recherche de films
- Affichage des détails de films

## [0.6.0] - 2026-01-25 [Pre-release]

### Added
- Structure frontend React
- Routing avec React Router
- Composants UI de base

## [0.5.0] - 2026-01-10 [Pre-release]

### Added
- Configuration Docker
- Base de données MongoDB
- Scripts de développement

## [0.4.0] - 2025-12-15 [Pre-release]

### Added
- Backend Express de base
- Structure des dossiers
- Configuration TypeScript

## [0.3.0] - 2025-11-20 [Pre-release]

### Added
- Setup du projet
- Configuration git
- README initial

## [0.2.0] - 2025-10-30 [Pre-release]

### Added
- Recherche et planification du projet
- Définition des spécifications fonctionnelles
- Choix des technologies

## [0.1.0] - 2025-10-01 [Pre-release]

### Added
- Initialisation du dépôt Git
- Structure de base du monorepo
- Fichiers de configuration initiaux
