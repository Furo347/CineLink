# Changelog

## Unreleased

### Added

- Documentation technique de reference dans `docs/`.
- Documentation backend complete avec routes API.
- Documentation frontend complete avec routing, auth, stockage et admin.
- Documentation qualite/CI/CD et SonarQube Cloud.
- Documentation securite/RBAC/admin.
- Cahier de recette actualise.
- Administration minimale : statistiques, suppression de commentaires, suppression d'utilisateurs.
- Script `admin:promote` pour promouvoir un utilisateur existant en `ADMIN`.
- Feedback de chargement sur connexion et inscription.
- Publication de commentaire avec `Entree`; `Maj + Entree` conserve le saut de ligne.

### Changed

- Documentation racine recentree sur l'installation, les variables, les scripts et les liens vers les docs detaillees.
- Documentation de certification corrigee pour supprimer les references obsoletes ou non confirmees.
- Clarification de l'usage MongoDB local, Docker et production.
- Finalisation du cahier de recette apres la campagne manuelle du 23 juillet 2026.
- Explicitation du RGAA comme referentiel d'accessibilite retenu, en coherence avec les WCAG.

### Security

- Documentation du modele de roles `USER` / `ADMIN`.
- Documentation du fait que le backend recharge le role depuis MongoDB pour les routes admin.
- Clarification : aucun role admin ne peut etre choisi a l'inscription.
- Ajout d'une matrice de correspondance entre les mesures de securite de CineLink et l'OWASP Top 10 2021.

## 1.0.0

### Added

- Authentification JWT.
- Catalogue de films et details via TMDB.
- Favoris et notation.
- Commentaires.
- Follow / unfollow.
- Feed social.
- Profils utilisateurs.
- Tests backend et frontend.
- Docker backend et MongoDB local.
- Deploiement frontend Vercel et backend Render.
