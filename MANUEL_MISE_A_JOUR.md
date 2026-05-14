# Manuel de Mise à Jour - CineLink

## Vue d'ensemble
Ce document décrit les procédures de mise à jour pour l'application CineLink, incluant les migrations de base de données, changements de configuration et déploiements.

## Prérequis

### Compétences requises
- Connaissance de Docker et Docker Compose
- Familiarité avec MongoDB
- Compréhension des commandes Git
- Accès aux environnements de déploiement

### Environnements
- **Développement** : Tests des mises à jour
- **Staging** : Validation avant production
- **Production** : Environnement utilisateur final

## Types de Mises à Jour

### 1. Mise à jour mineure (patch)
- Corrections de bogues
- Améliorations mineures
- Pas de changements cassants

### 2. Mise à jour majeure (minor)
- Nouvelles fonctionnalités
- Changements d'API backward-compatible
- Migrations de base de données

### 3. Mise à jour breaking (major)
- Changements d'API incompatibles
- Refonte d'architecture
- Migrations complexes

## Procédure Générale de Mise à Jour

### Phase 1 : Préparation
1. **Sauvegarde** : Backup complet de la base de données
2. **Review du changelog** : Identifier les changements
3. **Tests locaux** : Validation sur environnement de développement
4. **Plan de rollback** : Préparer la procédure de retour arrière

### Phase 2 : Déploiement
1. **Arrêt des services** : Graceful shutdown
2. **Mise à jour du code** : Pull des nouvelles images/conteneurs
3. **Migration base de données** : Exécution des scripts de migration
4. **Mise à jour configuration** : Variables d'environnement
5. **Redémarrage des services** : Vérification du démarrage

### Phase 3 : Validation
1. **Tests de santé** : Health checks automatisés
2. **Tests fonctionnels** : Scénarios critiques
3. **Monitoring** : Surveillance des métriques
4. **Communication** : Notification aux utilisateurs si nécessaire

## Migrations de Base de Données

### Outil de migration
```bash
# Depuis le répertoire backend
npm run migrate:up    # Appliquer les migrations
npm run migrate:down  # Rollback
npm run migrate:status # Voir le status
```

### Exemples de migrations

#### Migration 1.1.0 : Ajout champ bio utilisateurs
```javascript
// Migration script
{
  version: '1.1.0',
  description: 'Add bio field to users',
  up: async (db) => {
    await db.collection('users').updateMany(
      {},
      { $set: { bio: '' } }
    );
  },
  down: async (db) => {
    await db.collection('users').updateMany(
      {},
      { $unset: { bio: '' } }
    );
  }
}
```

#### Migration 1.2.0 : Index pour performance
```javascript
{
  version: '1.2.0',
  description: 'Add indexes for search performance',
  up: async (db) => {
    await db.collection('movies').createIndex({ title: 'text' });
    await db.collection('users').createIndex({ username: 'text' });
  },
  down: async (db) => {
    await db.collection('movies').dropIndex('title_text');
    await db.collection('users').dropIndex('username_text');
  }
}
```

## Mises à Jour par Version

### Version 1.1.0 (Mineure)
**Date** : 2024-06-01
**Type** : Feature release

#### Changements
- ✅ Ajout du champ bio dans les profils utilisateur
- ✅ Amélioration de la recherche avec index texte
- ✅ Nouveau système de notifications

#### Migration requise
```bash
# Exécuter la migration
npm run migrate:up -- --version 1.1.0

# Vérifier
npm run migrate:status
```

#### Rollback
```bash
npm run migrate:down -- --version 1.1.0
```

### Version 1.0.1 (Patch)
**Date** : 2024-05-20
**Type** : Bug fixes

#### Corrections
- ✅ Fix bouton suppression commentaires
- ✅ Correction types TypeScript
- ✅ Amélioration performance recherche

#### Migration
Aucune migration de base requise.

### Version 1.0.0 (Majeure)
**Date** : 2024-05-14
**Type** : Release initiale

#### Fonctionnalités
- ✅ Authentification complète
- ✅ Gestion films et favoris
- ✅ Système de commentaires
- ✅ Réseau social

#### Configuration initiale
```bash
# Cloner le repository
git clone https://github.com/votre-repo/cinelink.git

# Configuration environnement
cp .env.example .env
# Éditer les variables selon l'environnement

# Installation
npm install
npm run seed  # Pour données de démo
```

## Déploiement Docker

### Mise à jour avec Docker Compose
```bash
# Arrêt des services
docker-compose down

# Pull des nouvelles images
docker-compose pull

# Redémarrage
docker-compose up -d

# Vérification
docker-compose ps
docker-compose logs
```

### Rollback Docker
```bash
# Retour à la version précédente
docker-compose down
docker tag cinelink-backend:latest cinelink-backend:rollback
docker tag cinelink-frontend:latest cinelink-frontend:rollback

# Redéployer l'ancienne version
docker-compose up -d
```

## Déploiement Cloud

### Vercel (Frontend)
```bash
# Via CLI
vercel --prod

# Ou via dashboard : déclenchement automatique sur push main
```

### Railway (Backend)
```bash
# Via CLI
railway up

# Ou via dashboard : déploiement automatique
```

## Variables d'Environnement

### Changements par version

#### v1.1.0 : Nouvelles variables
```env
# Notifications
NOTIFICATION_EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Recherche avancée
SEARCH_INDEX_ENABLED=true
ELASTICSEARCH_URL=http://localhost:9200
```

#### Migration des variables
```bash
# Script de migration des variables
node scripts/migrate-env.js
```

## Tests Post-Mise à Jour

### Tests automatisés
```bash
# Backend
npm test
npm run test:e2e

# Frontend
npm test
npm run test:e2e
```

### Tests manuels critiques
1. ✅ Connexion utilisateur
2. ✅ Recherche de films
3. ✅ Ajout/suppression favoris
4. ✅ Publication commentaires
5. ✅ Navigation feed

### Monitoring post-déploiement
- Response time < 500ms
- Error rate < 1%
- Uptime > 99.9%

## Gestion des Incidents

### Signes de problème
- Erreurs 5xx en augmentation
- Temps de réponse > 2s
- Utilisateurs ne peuvent pas se connecter

### Procédure d'urgence
1. **Arrêt immédiat** : `docker-compose down`
2. **Rollback** : Déployer version précédente
3. **Investigation** : Analyser les logs
4. **Communication** : Informer les utilisateurs
5. **Fix** : Corriger et re-déployer

## Communication

### Pré-déploiement
- [ ] Notification équipe technique
- [ ] Préparation email utilisateurs (si impact)
- [ ] Mise à jour documentation

### Post-déploiement
- [ ] Confirmation déploiement réussi
- [ ] Monitoring 24h
- [ ] Feedback utilisateurs

## Historique des Mises à Jour

| Version | Date | Type | Migration | Statut |
|---------|------|------|-----------|--------|
| 1.1.0 | 2024-06-01 | Mineure | Oui | Planifiée |
| 1.0.1 | 2024-05-20 | Patch | Non | Déployée |
| 1.0.0 | 2024-05-14 | Majeure | Non | Déployée |

## Contacts

### Support technique
- **Lead Dev** : dev@cinelink.com
- **DevOps** : ops@cinelink.com
- **Urgences** : +33 1 23 45 67 89

### Documentation
- [CHANGELOG.md](./CHANGELOG.md) - Historique détaillé
- [README.md](./README.md) - Guide d'installation
- [CAHIER_RECETTES.md](./CAHIER_RECETTES.md) - Tests de validation

---

*Ce manuel est mis à jour à chaque release. Dernière révision : Mai 2024*
