# Runbook d’exploitation — CineLink

## 1. Objet du document

Ce runbook décrit les procédures d’exploitation, de supervision et de diagnostic du backend CineLink.

Il a pour objectifs de permettre :

* la vérification rapide de l’état du service ;
* l’identification d’un incident ;
* le diagnostic des causes les plus fréquentes ;
* la remise en service de l’application ;
* la traçabilité des actions de maintenance.

Ce document concerne principalement :

* l’API Node.js, Express et TypeScript ;
* la base de données MongoDB Atlas ;
* le déploiement de production ;
* la supervision Better Stack ;
* la chaîne d’intégration continue GitHub Actions.

---

## 2. Architecture exploitée

Le projet CineLink repose sur les composants suivants :

| Composant            | Technologie                  | Rôle                                                          |
| -------------------- | ---------------------------- | ------------------------------------------------------------- |
| Backend              | Node.js, Express, TypeScript | Exposition de l’API REST                                      |
| Base de données      | MongoDB Atlas                | Stockage des utilisateurs, favoris, commentaires et relations |
| API externe          | TMDB                         | Récupération des données cinématographiques                   |
| Conteneurisation     | Docker                       | Exécution reproductible du backend                            |
| Intégration continue | GitHub Actions               | Exécution des tests et compilation                            |
| Supervision          | Better Stack                 | Contrôle de disponibilité de l’API                            |
| Dépôt source         | GitHub                       | Versionnement et gestion du projet                            |

---

## 3. Prérequis d’exploitation

Avant toute intervention, vérifier la disponibilité des éléments suivants :

* accès au dépôt GitHub CineLink ;
* accès à la plateforme de déploiement ;
* accès au projet MongoDB Atlas ;
* accès au monitor Better Stack ;
* accès aux variables d’environnement de production ;
* Node.js version 20 pour une exécution locale ;
* Docker et Docker Compose pour une exécution conteneurisée.

Les secrets ne doivent jamais être enregistrés directement dans le dépôt Git.

---

## 4. Variables d’environnement requises

Le backend nécessite les variables suivantes :

```env
PORT=3000
MONGO_URI=<URI_MONGODB>
JWT_SECRET=<SECRET_JWT>
JWT_EXPIRES_IN=<DUREE_VALIDITE>
TMDB_API_KEY=<CLE_API_TMDB>
NODE_ENV=production
```

### Règles de sécurité

* ne jamais committer un fichier `.env` contenant de vraies valeurs ;
* ne jamais publier `MONGO_URI`, `JWT_SECRET` ou `TMDB_API_KEY` ;
* utiliser les variables sécurisées de la plateforme de déploiement ;
* renouveler immédiatement un secret exposé ;
* limiter les accès MongoDB Atlas aux adresses IP autorisées lorsque cela est possible.

---

## 5. Vérification rapide de l’état du service

### 5.1 Endpoint de santé

Le premier contrôle consiste à appeler l’endpoint :

```http
GET /api/health
```

Exemple :

```text
https://cinelink-backend.onrender.com/api/health
```

La réponse attendue est un code HTTP `200` avec un corps similaire à celui-ci :

```json
{
  "status": "UP",
  "database": "UP",
  "environment": "production",
  "version": "1.0.0"
}
```

### 5.2 Interprétation

| Résultat                   | Signification                     | Action                        |
| -------------------------- | --------------------------------- | ----------------------------- |
| HTTP 200, API et base `UP` | Service opérationnel              | Aucune action                 |
| HTTP 500                   | Erreur interne                    | Consulter les logs            |
| HTTP 404                   | Route ou URL incorrecte           | Vérifier l’URL                |
| Timeout                    | Service indisponible ou bloqué    | Vérifier le déploiement       |
| Base `DOWN`                | Connexion MongoDB indisponible    | Vérifier Atlas et `MONGO_URI` |
| Réponse absente            | Serveur arrêté ou problème réseau | Vérifier la plateforme        |

---

## 6. Contrôle Better Stack

Better Stack surveille l’endpoint de santé du backend de production.

### Procédure

1. Se connecter à Better Stack.
2. Ouvrir la section des monitors.
3. Sélectionner le monitor du backend CineLink.
4. Vérifier :

   * le statut du monitor ;
   * la date du dernier contrôle ;
   * le temps de réponse ;
   * l’historique des incidents ;
   * le contenu de la dernière réponse HTTP.

### États possibles

| État                  | Interprétation                                         |
| --------------------- | ------------------------------------------------------ |
| `Up` ou `Operational` | Le service répond correctement                         |
| `Down`                | Le service ne répond pas selon les critères configurés |
| `Paused`              | La surveillance est volontairement suspendue           |
| Incident ouvert       | Une indisponibilité a été détectée                     |
| Incident résolu       | Le service a de nouveau répondu correctement           |

Un monitor temporaire sur un endpoint invalide a été utilisé afin de vérifier le fonctionnement de la détection d’incident et des alertes par e-mail.

---

## 7. Démarrage local du backend

### 7.1 Installation des dépendances

Depuis le répertoire du backend :

```bash
npm ci
```

Pour un environnement de développement ne nécessitant pas une installation strictement reproductible :

```bash
npm install
```

### 7.2 Démarrage en développement

```bash
npm run dev
```

Le serveur doit afficher un message confirmant :

* la connexion à MongoDB ;
* le démarrage du serveur ;
* le port utilisé.

### 7.3 Compilation TypeScript

```bash
npm run build
```

Cette commande doit terminer sans erreur TypeScript.

### 7.4 Démarrage de la version compilée

```bash
npm start
```

---

## 8. Démarrage avec Docker

Depuis le répertoire contenant le fichier `docker-compose.yml` :

```bash
docker compose up --build
```

Pour lancer les services en arrière-plan :

```bash
docker compose up --build -d
```

### Vérifier les conteneurs

```bash
docker compose ps
```

### Consulter les logs

```bash
docker compose logs
```

Logs du backend uniquement :

```bash
docker compose logs api
```

Suivi en temps réel :

```bash
docker compose logs -f api
```

### Arrêter les services

```bash
docker compose down
```

Pour supprimer également les volumes locaux :

```bash
docker compose down -v
```

Cette dernière commande supprime les données MongoDB locales. Elle ne doit être utilisée que lorsque cette suppression est volontaire.

---

## 9. Vérification de MongoDB Atlas

En cas d’erreur de connexion à la base de données :

1. se connecter à MongoDB Atlas ;
2. vérifier que le cluster est actif ;
3. contrôler les alertes du projet ;
4. vérifier la liste des adresses IP autorisées ;
5. vérifier que l’utilisateur MongoDB existe toujours ;
6. contrôler les droits de cet utilisateur ;
7. vérifier la valeur de `MONGO_URI` sur la plateforme de déploiement ;
8. consulter les logs du backend.

### Erreurs fréquentes

#### `MongooseServerSelectionError`

Causes possibles :

* adresse IP non autorisée ;
* cluster indisponible ;
* URI incorrecte ;
* mot de passe erroné ;
* erreur DNS ;
* problème réseau.

#### Authentification MongoDB refusée

Actions :

* vérifier le nom d’utilisateur ;
* vérifier le mot de passe ;
* contrôler l’encodage des caractères spéciaux dans l’URI ;
* vérifier les permissions attribuées à l’utilisateur.

---

## 10. Vérification de l’API TMDB

Certaines routes CineLink dépendent de l’API externe TMDB.

En cas d’échec sur les films populaires, les recherches ou les détails de films :

1. vérifier que `TMDB_API_KEY` est définie ;
2. vérifier que la clé est encore valide ;
3. consulter les logs du backend ;
4. tester la disponibilité de TMDB ;
5. vérifier si une limite de requêtes a été atteinte ;
6. distinguer une panne CineLink d’une panne du fournisseur externe.

Une indisponibilité TMDB peut affecter les fonctionnalités cinématographiques sans nécessairement interrompre l’authentification ou l’accès à MongoDB.

---

## 11. Exécution des tests

### Tests automatisés

```bash
npm test
```

Les tests doivent couvrir au minimum :

* le healthcheck ;
* le parcours d’inscription et de connexion ;
* une route protégée nécessitant un token.

### Compilation

```bash
npm run build
```

Avant tout déploiement, les deux commandes suivantes doivent réussir :

```bash
npm test
npm run build
```

---

## 12. Vérification de GitHub Actions

Lorsqu’un changement est poussé ou qu’une pull request est créée :

1. ouvrir l’onglet `Actions` du dépôt GitHub ;
2. sélectionner la dernière exécution ;
3. vérifier chaque étape :

   * récupération du code ;
   * installation de Node.js ;
   * installation des dépendances ;
   * exécution des tests ;
   * compilation TypeScript.

### En cas d’échec

1. ouvrir l’étape en erreur ;
2. lire le premier message d’erreur pertinent ;
3. reproduire l’échec localement ;
4. corriger sur une branche dédiée ;
5. relancer les tests ;
6. créer ou mettre à jour la pull request ;
7. vérifier que le workflow redevient vert.

Un déploiement ne doit pas être considéré comme validé si les tests ou la compilation échouent.

---

## 13. Procédure de déploiement

### Avant le déploiement

Vérifier :

* que la branche à déployer est à jour ;
* que les tests passent ;
* que la compilation réussit ;
* que les variables d’environnement sont présentes ;
* que MongoDB Atlas est accessible ;
* que la clé TMDB est valide ;
* qu’aucun secret n’a été ajouté au dépôt.

Commandes locales :

```bash
npm ci
npm test
npm run build
```

### Après le déploiement

1. consulter les logs de démarrage ;
2. vérifier la connexion MongoDB ;
3. appeler `/api/health` ;
4. vérifier Better Stack ;
5. tester une fonctionnalité nécessitant MongoDB ;
6. tester une fonctionnalité dépendant de TMDB ;
7. surveiller les erreurs pendant les premières minutes.

---

## 14. Procédure de redéploiement

Un redéploiement peut être nécessaire après :

* une correction urgente ;
* une erreur temporaire de plateforme ;
* une modification des variables d’environnement ;
* un échec de démarrage ;
* une mise à jour des dépendances.

### Étapes

1. identifier la dernière version stable ;
2. vérifier les tests de cette version ;
3. ouvrir la plateforme de déploiement ;
4. sélectionner le service backend ;
5. relancer le déploiement ;
6. surveiller les logs ;
7. contrôler `/api/health` ;
8. vérifier le retour du monitor Better Stack à l’état opérationnel ;
9. documenter l’action dans l’issue d’incident.

---

## 15. Procédure de retour arrière

Un retour arrière doit être envisagé lorsqu’une nouvelle version entraîne :

* une indisponibilité du service ;
* une erreur bloquante ;
* une corruption ou une incompatibilité de données ;
* une régression de sécurité ;
* l’échec de fonctions critiques.

### Étapes

1. identifier le dernier commit stable ;
2. confirmer que cette version était opérationnelle ;
3. redéployer le commit ou le déploiement précédent ;
4. vérifier les variables d’environnement ;
5. contrôler les logs ;
6. tester `/api/health` ;
7. contrôler les principales routes ;
8. vérifier Better Stack ;
9. créer ou compléter une issue d’incident ;
10. ne réintroduire la version défaillante qu’après correction et validation.

---

## 16. Diagnostic des incidents courants

### 16.1 Le backend ne démarre pas

Contrôles :

```bash
npm ci
npm run build
npm start
```

Vérifier :

* la version de Node.js ;
* les variables d’environnement ;
* les erreurs TypeScript ;
* le port utilisé ;
* la connexion MongoDB ;
* les dépendances manquantes.

### 16.2 Le port est déjà utilisé

Erreur possible :

```text
EADDRINUSE
```

Actions :

* identifier le processus utilisant le port ;
* arrêter l’ancien processus ;
* modifier temporairement la variable `PORT` ;
* vérifier qu’aucune autre instance du backend n’est active.

### 16.3 L’API retourne `401 Unauthorized`

Vérifier :

* la présence du token JWT ;
* le format de l’en-tête :

```http
Authorization: Bearer <TOKEN>
```

* la validité du token ;
* la valeur de `JWT_SECRET` ;
* l’expiration du token ;
* la présence du middleware d’authentification sur la route.

### 16.4 L’API retourne `500 Internal Server Error`

Actions :

1. consulter les logs ;
2. identifier la route concernée ;
3. vérifier MongoDB ;
4. vérifier TMDB si la route en dépend ;
5. reproduire localement ;
6. créer une issue si l’erreur nécessite une correction applicative.

### 16.5 La recherche de films ne fonctionne plus

Vérifier :

* la clé TMDB ;
* la requête envoyée ;
* le code HTTP retourné par TMDB ;
* les limites d’utilisation ;
* les logs du contrôleur de recherche.

### 16.6 Better Stack signale une panne mais le service semble accessible

Vérifier :

* l’URL exacte configurée ;
* le protocole HTTPS ;
* le code HTTP renvoyé ;
* la durée de réponse ;
* une éventuelle indisponibilité transitoire ;
* l’historique des contrôles Better Stack ;
* les logs de la plateforme au moment précis de l’incident.

---

## 17. Gestion d’un incident

Lorsqu’un incident est détecté :

### 17.1 Qualification

Déterminer :

* l’heure de début ;
* le composant affecté ;
* l’impact utilisateur ;
* le niveau de gravité ;
* le caractère interne ou externe de la cause.

### 17.2 Diagnostic

Consulter :

* Better Stack ;
* l’endpoint `/api/health` ;
* les logs de déploiement ;
* MongoDB Atlas ;
* GitHub Actions ;
* les dernières modifications du dépôt ;
* l’état de TMDB si nécessaire.

### 17.3 Correction

Selon la cause :

* redémarrer ou redéployer le service ;
* corriger une variable d’environnement ;
* rétablir l’accès MongoDB ;
* revenir à une version stable ;
* corriger le code sur une branche dédiée ;
* attendre le rétablissement d’un fournisseur externe.

### 17.4 Validation

Après correction :

* vérifier `/api/health` ;
* tester les routes critiques ;
* confirmer le retour à l’état `Up` dans Better Stack ;
* vérifier la résolution de l’incident ;
* surveiller le service après le rétablissement.

### 17.5 Traçabilité

Créer ou compléter une issue GitHub avec :

* la date et l’heure ;
* les symptômes ;
* l’impact ;
* la cause identifiée ;
* les actions réalisées ;
* la durée de l’incident ;
* les mesures préventives proposées.

---

## 18. Niveaux de gravité

| Niveau   | Description                      | Exemple                               | Priorité  |
| -------- | -------------------------------- | ------------------------------------- | --------- |
| Faible   | Anomalie sans impact majeur      | Message de log incorrect              | Basse     |
| Modéré   | Fonction secondaire indisponible | Recherche TMDB défaillante            | Moyenne   |
| Élevé    | Fonction importante indisponible | Connexion utilisateur impossible      | Haute     |
| Critique | Service totalement indisponible  | API inaccessible ou base indisponible | Immédiate |

Dans le cadre du projet CineLink, les alertes et incidents sont suivis à travers Better Stack, GitHub Issues et le GitHub Project.

---

## 19. Maintenance préventive

Les actions suivantes doivent être réalisées régulièrement :

* vérifier les alertes Dependabot ;
* mettre à jour les dépendances après validation ;
* contrôler l’état de GitHub Actions ;
* vérifier Better Stack ;
* consulter les alertes MongoDB Atlas ;
* contrôler les secrets et leurs dates de renouvellement ;
* exécuter les tests ;
* vérifier la compilation ;
* mettre à jour le changelog ;
* archiver les preuves nécessaires au dossier de certification.

---

## 20. Checklist d’exploitation

### Contrôle courant

```text
[ ] Endpoint /api/health accessible
[ ] Backend déclaré UP
[ ] Base MongoDB déclarée UP
[ ] Monitor Better Stack opérationnel
[ ] Aucun incident actif
[ ] Dernier workflow GitHub Actions réussi
[ ] Aucun déploiement en échec
[ ] Aucune alerte MongoDB critique
```

### Avant livraison

```text
[ ] Dépendances installées avec npm ci
[ ] Tests automatisés réussis
[ ] Compilation TypeScript réussie
[ ] Variables d’environnement vérifiées
[ ] Aucun secret présent dans le dépôt
[ ] Déploiement réussi
[ ] Healthcheck validé
[ ] Fonctionnalités critiques testées
[ ] Better Stack opérationnel
[ ] Documentation mise à jour
```

---

## 21. Historique des interventions

Les interventions d’exploitation doivent être enregistrées dans GitHub à travers :

* les issues de maintenance ;
* les issues d’incident ;
* les pull requests ;
* les commentaires de résolution ;
* le changelog du projet.

Format conseillé :

```text
Date :
Intervenant :
Composant :
Symptôme :
Cause :
Action réalisée :
Résultat :
Mesure préventive :
```

---

## 22. Limites actuelles

Les limites identifiées sont les suivantes :

* l’offre gratuite Better Stack limite certaines fonctions avancées de politique d’escalade ;
* les notifications mobiles nécessitent l’application Better Stack ;
* la supervision actuelle contrôle principalement la disponibilité HTTP ;
* la centralisation avancée des logs n’est pas encore mise en place ;
* aucun mécanisme automatisé complet de rollback n’est actuellement configuré ;
* la disponibilité de certaines fonctionnalités dépend de l’API externe TMDB.

Ces limites sont connues et peuvent faire l’objet d’améliorations futures.
