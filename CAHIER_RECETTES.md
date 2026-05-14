# Cahier de Recettes

## Vue d'ensemble
Ce document présente le cahier de recettes pour l'application CineLink, plateforme sociale de cinéma. Il détaille les scénarios de tests fonctionnels et les résultats attendus pour valider le bon fonctionnement de l'application.

## Méthodologie de Test

### Environnements
- **Développement** : Tests unitaires et d'intégration
- **Staging** : Tests de recette complets
- **Production** : Tests de fumée post-déploiement

### Outils
- **Tests unitaires** : Jest (backend), Vitest (frontend)
- **Tests d'intégration** : Supertest pour API
- **Tests E2E** : Playwright (préparé)
- **Tests de performance** : Lighthouse, Artillery

## Scénarios de Tests

### Module Authentification

#### RT-AUTH-001 : Inscription utilisateur
**Prérequis** : Aucun compte existant avec l'email test@example.com

**Étapes** :
1. Accéder à la page d'inscription
2. Remplir le formulaire :
   - Email : test@example.com
   - Mot de passe : Test123!
   - Confirmation : Test123!
3. Cliquer sur "S'inscrire"

**Résultat attendu** :
- ✅ Redirection vers la page de connexion
- ✅ Message de succès affiché
- ✅ Email de confirmation envoyé (si implémenté)

**Critères de succès** :
- Code HTTP 201
- Utilisateur créé en base
- Mot de passe hashé

#### RT-AUTH-002 : Connexion réussie
**Prérequis** : Compte utilisateur existant

**Étapes** :
1. Accéder à la page de connexion
2. Saisir credentials valides
3. Cliquer sur "Se connecter"

**Résultat attendu** :
- ✅ Redirection vers le feed
- ✅ Token JWT stocké dans localStorage
- ✅ Menu utilisateur affiché

#### RT-AUTH-003 : Connexion échouée - Mot de passe incorrect
**Prérequis** : Compte utilisateur existant

**Étapes** :
1. Saisir email valide, mot de passe incorrect
2. Cliquer sur "Se connecter"

**Résultat attendu** :
- ✅ Message d'erreur affiché
- ✅ Pas de redirection
- ✅ Formulaire reste accessible

### Module Films

#### RT-MOVIES-001 : Recherche de films
**Prérequis** : Connexion utilisateur

**Étapes** :
1. Accéder à la page de recherche
2. Saisir "Inception" dans la barre de recherche
3. Cliquer sur "Rechercher"

**Résultat attendu** :
- ✅ Liste de films affichée
- ✅ Informations complètes (titre, année, affiche)
- ✅ Pagination fonctionnelle

#### RT-MOVIES-002 : Consultation détails film
**Prérequis** : Film existant dans les résultats

**Étapes** :
1. Cliquer sur un film dans les résultats
2. Consulter la page de détails

**Résultat attendu** :
- ✅ Synopsis, casting, notes affichés
- ✅ Bouton "Ajouter aux favoris" visible
- ✅ Section commentaires présente

### Module Favoris

#### RT-FAV-001 : Ajout aux favoris
**Prérequis** : Film non favori, utilisateur connecté

**Étapes** :
1. Sur la page d'un film
2. Cliquer sur "Ajouter aux favoris"

**Résultat attendu** :
- ✅ Bouton devient "Retirer des favoris"
- ✅ Film ajouté en base de données
- ✅ Confirmation visuelle (icône remplie)

#### RT-FAV-002 : Suppression des favoris
**Prérequis** : Film en favoris

**Étapes** :
1. Cliquer sur "Retirer des favoris"

**Résultat attendu** :
- ✅ Film retiré des favoris
- ✅ Bouton redevient "Ajouter aux favoris"

### Module Commentaires

#### RT-COM-001 : Ajout de commentaire
**Prérequis** : Utilisateur connecté, page film

**Étapes** :
1. Saisir un commentaire dans le champ
2. Cliquer sur "Publier"

**Résultat attendu** :
- ✅ Commentaire affiché dans la liste
- ✅ Auteur et date corrects
- ✅ Bouton de suppression visible (pour l'auteur)

#### RT-COM-002 : Suppression de commentaire
**Prérequis** : Commentaire de l'utilisateur connecté

**Étapes** :
1. Cliquer sur l'icône de suppression

**Résultat attendu** :
- ✅ Commentaire supprimé
- ✅ Liste mise à jour
- ✅ Confirmation demandée (si implémentée)

### Module Social

#### RT-SOCIAL-001 : Suivre un utilisateur
**Prérequis** : Profil d'un autre utilisateur

**Étapes** :
1. Visiter le profil d'un utilisateur
2. Cliquer sur "Suivre"

**Résultat attendu** :
- ✅ Relation de suivi créée
- ✅ Bouton devient "Ne plus suivre"
- ✅ Compteur de followers mis à jour

#### RT-SOCIAL-002 : Feed d'activité
**Prérequis** : Utilisateur avec abonnements

**Étapes** :
1. Accéder au feed principal

**Résultat attendu** :
- ✅ Activités des utilisateurs suivis affichées
- ✅ Tri chronologique (plus récent en haut)
- ✅ Liens vers les films/commentaires

### Module Recherche Utilisateurs

#### RT-SEARCH-001 : Recherche d'utilisateurs
**Prérequis** : Utilisateurs existants

**Étapes** :
1. Accéder à la recherche utilisateurs
2. Saisir un nom partiel

**Résultat attendu** :
- ✅ Liste d'utilisateurs correspondants
- ✅ Avatars et noms affichés
- ✅ Liens vers profils

## Tests de Non-Régression

### TR-SEC-001 : Tentative d'accès non autorisé
**Étapes** : Tenter d'accéder à une route protégée sans token

**Résultat attendu** : Code 401 Unauthorized

### TR-PERF-001 : Performance recherche
**Étapes** : Effectuer 100 recherches consécutives

**Résultat attendu** : Temps de réponse moyen < 500ms

### TR-UI-001 : Responsive design
**Étapes** : Tester sur différentes tailles d'écran

**Résultat attendu** : Interface adaptée et fonctionnelle

## Matrice de Traçabilité

| Fonctionnalité | Tests associés | Couverture |
|---------------|----------------|------------|
| Authentification | RT-AUTH-001/002/003 | 100% |
| Gestion films | RT-MOVIES-001/002 | 100% |
| Favoris | RT-FAV-001/002 | 100% |
| Commentaires | RT-COM-001/002 | 100% |
| Réseau social | RT-SOCIAL-001/002 | 100% |
| Recherche | RT-SEARCH-001 | 100% |

## Rapport de Tests

### Métriques
- **Nombre total de tests** : 15 scénarios
- **Taux de succès cible** : 100%
- **Fréquence d'exécution** : Avant chaque release
- **Responsable** : Équipe de développement

### Environnement de test
- **Base de données** : MongoDB de test
- **API externes** : Mocks pour TMDB
- **Navigateurs** : Chrome, Firefox, Safari
- **Appareils** : Desktop, mobile (via responsive)
