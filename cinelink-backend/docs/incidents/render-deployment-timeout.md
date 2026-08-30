# Incident de déploiement Render — Timeout

## Résumé

Un déploiement du backend CineLink sur Render a semblé démarrer correctement : la connexion MongoDB était établie et le serveur indiquait écouter sur le port `10000`, fourni par la plateforme.

Malgré ce démarrage apparent, le déploiement a ensuite été considéré comme échoué ou interrompu à cause d'un timeout. La cause racine n'a pas pu être confirmée avec certitude à partir des seules traces disponibles.

## Contexte

Le backend CineLink est une API Express et TypeScript exécutée en production sur Render. Le serveur utilise `process.env.PORT` lorsque la plateforme injecte un port, avec `3000` comme valeur locale de repli.

La production utilise MongoDB Atlas via la variable d'environnement `MONGO_URI`. La documentation de déploiement précise que l'URI Docker locale `mongodb://mongo:27017/cinelink` ne doit pas être utilisée en production.

Le dépôt contient également un endpoint de santé exposé sur `/api/health`. Cet endpoint retourne l'état de l'API, l'état MongoDB, l'uptime, l'environnement, la version et des informations mémoire.

## Chronologie

1. Lancement du déploiement backend sur Render.
2. Installation des dépendances et compilation de l'application.
3. Démarrage de la commande `npm start`, qui exécute `node dist/server.js`.
4. Connexion MongoDB réussie.
5. Démarrage du serveur sur le port Render `10000`.
6. Timeout signalé par la plateforme malgré le démarrage apparent.
7. Analyse du démarrage et vérification ou ajout des endpoints de disponibilité, dont `/api/health`.

Aucune heure précise n'est documentée dans le dépôt pour cet incident.

## Symptômes observés

Les traces disponibles dans la documentation de backlog indiquent les éléments suivants :

```text
==> Running 'npm start'
> cinelink-backend@1.0.0 start
> node dist/server.js
MongoDB connected
Server running on port 10000
==> Timed Out
```

Faits observés :

- la commande de démarrage a été lancée ;
- la connexion MongoDB a réussi ;
- le serveur Express a démarré sur le port `10000` ;
- la plateforme a ensuite signalé un timeout.

## Impact

Le backend n'a pas été considéré comme correctement disponible pendant ce déploiement. Même si le processus applicatif avait démarré, le déploiement n'a pas pu être validé comme opérationnel à ce moment-là.

L'impact fonctionnel exact côté utilisateurs n'est pas vérifiable à partir du dépôt seul.

## Diagnostic

Les éléments confirmés orientent le diagnostic vers un problème survenu après le démarrage applicatif apparent :

- MongoDB était connectée ;
- le serveur écoutait sur le port injecté par Render ;
- le timeout s'est produit après ces messages de démarrage ;
- une route racine publique et l'endpoint `/api/health` ont ensuite été ajoutés ou vérifiés pour améliorer la validation du démarrage ;
- Better Stack permet désormais de contrôler séparément la disponibilité de l'API après déploiement.

La cause racine n'a pas pu être confirmée avec certitude à partir des seules traces disponibles.

En cas de récidive, les étapes de diagnostic recommandées sont :

1. vérifier les logs de démarrage ;
2. vérifier le port injecté par Render ;
3. appeler `/api/health` ;
4. vérifier MongoDB Atlas ;
5. vérifier les variables d'environnement, notamment `PORT` et `MONGO_URI` ;
6. vérifier le statut du déploiement dans Render ;
7. effectuer un redéploiement contrôlé ;
8. comparer avec le dernier commit stable.

## Causes envisagées

Les causes suivantes sont des hypothèses raisonnables, non confirmées comme cause unique de l'incident :

- détection de disponibilité Render n'ayant pas validé le service à temps ;
- healthcheck ou route de disponibilité insuffisamment explicite au moment du déploiement ;
- temps de démarrage supérieur au délai attendu par la plateforme ;
- configuration Render incomplète ou incohérente ;
- problème transitoire côté plateforme ou réseau ;
- variable d'environnement de production à vérifier malgré le démarrage apparent.

Ces hypothèses ne constituent pas une accusation envers Render et ne remplacent pas un diagnostic plateforme complet.

## Actions réalisées

- Vérification du comportement de démarrage du backend avec `process.env.PORT` et repli local sur `3000`.
- Vérification de l'utilisation de `MONGO_URI` pour la connexion MongoDB de production.
- Ajout ou vérification d'une route racine publique retournant l'état de base de l'API.
- Ajout ou vérification de l'endpoint `/api/health` pour exposer l'état API et MongoDB.
- Documentation de l'endpoint de santé dans la documentation de déploiement et de monitoring.
- Mise en place d'une supervision Better Stack pour contrôler la disponibilité de l'API indépendamment du déploiement.

## Résultat

Le démarrage backend a été clarifié et la validation de disponibilité a été renforcée par l'endpoint `/api/health`.

La documentation de backlog indique qu'un déploiement Render ultérieur a réussi et que l'endpoint de santé de production a ensuite répondu avec un état applicatif et MongoDB `UP`.

La cause exacte du timeout initial reste non confirmée.

## Mesures préventives

- Maintenir l'endpoint `/api/health`.
- Conserver la supervision Better Stack sur l'API.
- Contrôler les variables d'environnement avant déploiement.
- Vérifier explicitement `PORT` et `MONGO_URI`.
- Consulter systématiquement les logs de démarrage et de déploiement.
- Valider les tests et le build dans GitHub Actions avant déploiement.
- Documenter toute récidive dans une issue GitHub.
- Conserver la dernière version stable pour faciliter un rollback.

## Statut de l'incident

Statut : résolu opérationnellement, cause racine non confirmée.

Les éléments vérifiables montrent que le backend a démarré et que MongoDB était connectée, puis qu'un timeout a été signalé par la plateforme. Les mesures de santé, de monitoring et de documentation réduisent le risque de récidive non diagnostiquée.
