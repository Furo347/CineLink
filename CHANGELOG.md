# Changelog

Toutes les évolutions notables de CineLink sont documentées dans ce fichier.

Le format suit les principes de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet s'appuie sur le versionnement sémantique.

## [Non publié]

### Ajouté

- Badges de statut du README pour la CI backend GitHub Actions et le Quality Gate SonarCloud.
- Runbook d'exploitation couvrant la supervision, les contrôles de santé, les incidents, le déploiement et le rollback.
- Reconstruction du backlog MCO à partir des preuves du dépôt et de l'historique Git.
- Script PowerShell idempotent pour créer les labels et issues du backlog MCO sur GitHub.
- Documentation de la supervision Better Stack dans le runbook d'exploitation.

### Modifié

- README principal recentré sur l'installation, l'architecture, la qualité, la sécurité et l'exploitation.
- Documentation de certification mise à jour pour clarifier les éléments vérifiés et supprimer les références obsolètes.
- Clarification des usages MongoDB local, Docker et MongoDB Atlas en production.

### Corrigé

- Correction du chemin de redirection après déconnexion vers `/login`.
- Correction d'une configuration TypeScript de test devenue dépréciée.
- Stabilisation de la configuration de tests frontend avec Vitest et jsdom.

### Documentation

- Documentation qualité et CI/CD avec GitHub Actions et SonarCloud.
- Documentation sécurité avec RBAC, JWT, rôles `USER` / `ADMIN` et correspondance OWASP Top 10 2021.
- Documentation accessibilité avec références RGAA et WCAG.
- Documentation du backend, du frontend, des routes API et des procédures de déploiement.

## [1.0.0]

### Ajouté

- Backend Express et TypeScript structuré autour de routes, contrôleurs, middlewares et modèles Mongoose.
- Authentification JWT avec inscription, connexion, hachage des mots de passe et protection des routes.
- Intégration MongoDB avec support local, Docker Compose et configuration MongoDB Atlas en production.
- Catalogue de films, recherche et détails via TMDB.
- Favoris, notation, commentaires, profils utilisateurs, follow / unfollow et feed social.
- Frontend React, Vite, TypeScript et Tailwind CSS.
- Administration minimale avec statistiques, suppression de commentaires, suppression d'utilisateurs et promotion admin.
- Tests automatisés backend avec Jest, Supertest et MongoDB Memory Server.
- Tests automatisés frontend avec Vitest, React Testing Library et jsdom.
- Dockerfile backend et environnement Docker Compose avec MongoDB local.
- Workflows GitHub Actions pour la CI backend, la CI frontend et l'analyse SonarCloud.
- Configuration SonarCloud via `sonar-project.properties`.
- Déploiements documentés pour le frontend Vercel et le backend Render.
