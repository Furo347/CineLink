# Plan de correction des bogues

## Objectif

Organiser la detection, la priorisation, la correction et la verification des bogues de CineLink sans exposer de secrets ni modifier inutilement le comportement metier.

## Sources de detection

- Echecs GitHub Actions.
- Alertes SonarQube Cloud.
- Tests locaux backend/frontend.
- Retours utilisateur.
- Logs Render pour le backend.
- Logs Vercel pour le frontend.

## Classification

| Severite | Description | Exemple |
| --- | --- | --- |
| Critique | Fonction principale indisponible ou faille de securite | Connexion impossible, route admin accessible a un `USER`. |
| Majeure | Parcours important degrade | Suppression admin ne rafraichit pas le feed. |
| Mineure | Gene limitee ou comportement non bloquant | Message d'erreur peu explicite. |

## Workflow de correction

1. Reproduire le probleme.
2. Identifier la zone impactee.
3. Ajouter ou adapter un test pertinent si possible.
4. Corriger de maniere ciblee.
5. Executer les commandes de verification concernees.
6. Documenter l'impact si la correction change un comportement visible.

## Bogues resolus ou surveilles

| ID | Sujet | Etat |
| --- | --- | --- |
| BUG-AUTH-001 | Feedback de chargement login/register pour les reponses lentes | Corrige |
| BUG-COM-001 | Publication commentaire au clavier et prevention des doubles soumissions | Corrige |
| BUG-ADMIN-001 | Suppression admin d'un commentaire visible dans le feed | Corrige par nettoyage de l'activite associee |
| BUG-ENV-001 | Confusion entre URI Mongo Docker `mongo` et hote `localhost` | Documente |

## Points de vigilance

- Ne pas pointer un environnement local vers la base de production par erreur.
- Verifier `FRONTEND_URL` pour eviter les erreurs CORS en local.
- Conserver `coverage` hors Git.
- Verifier les routes admin avec un compte `USER` et un compte `ADMIN`.

## Verifications recommandees

Backend :

```bash
cd cinelink-backend
npm test
npm run typecheck
npm run build
```

Frontend :

```bash
cd cinelink-frontend
npm run lint
npm test
npm run build
```
