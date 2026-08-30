# Monitoring CineLink Backend

## Perimetre surveille

La supervision configuree controle la disponibilite HTTP du backend CineLink via l'endpoint public de sante :

```http
GET https://cinelink-backend.onrender.com/api/health
```

Parametres reels du controle :

| Parametre | Valeur |
| --- | --- |
| URL surveillee | `https://cinelink-backend.onrender.com/api/health` |
| Endpoint applicatif | `/api/health` |
| Intervalle de controle | 3 minutes |
| Timeout | 30s |
| Condition de declenchement | `URL becomes unavailable` |
| Canal de notification | `flo.portets@free.fr` |

Le healthcheck expose les informations suivantes :

- disponibilite HTTP du backend ;
- etat applicatif de l'API ;
- etat de la connexion MongoDB ;
- environnement d'execution ;
- version applicative exposee par le backend.

Exemple de reponse lorsque le service et MongoDB sont disponibles :

```json
{
  "status": "UP",
  "database": "UP",
  "uptime": 12.34,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "rss": 123456,
    "heapTotal": 123456,
    "heapUsed": 123456
  }
}
```

Si MongoDB n'est pas connecte, `status` et `database` passent a `DOWN` et l'API repond avec un code HTTP `503`.

## Finalite des indicateurs

| Indicateur | Finalite | Source |
| --- | --- | --- |
| Statut HTTP | Verifier que l'URL surveillee repond avant le timeout configure de 30s. | Controle externe de `https://cinelink-backend.onrender.com/api/health` |
| Etat API `status` | Confirmer que le backend se declare operationnel (`UP`) ou indisponible (`DOWN`). | Corps JSON de `/api/health` |
| Etat base de donnees `database` | Confirmer que la connexion MongoDB est active (`UP`) ou indisponible (`DOWN`). | Corps JSON de `/api/health` |
| Environnement `environment` | Identifier l'environnement expose par le service au moment du controle. | Corps JSON de `/api/health` |
| Version `version` | Identifier la version exposee par le backend au moment du controle. | Corps JSON de `/api/health` |
| Temps de reponse | Le timeout configure est de 30s. Aucune autre valeur de seuil de latence n'est documentee comme configuree. | Parametre du controle |

## Deroulement d'un incident

1. Detection : le monitor controle l'URL toutes les 3 minutes et declenche une alerte si l'URL devient indisponible.
2. Reception de l'alerte : la notification est envoyee a `flo.portets@free.fr`.
3. Verification manuelle : appeler `https://cinelink-backend.onrender.com/api/health` et verifier le code HTTP et le corps JSON.
4. Consultation des logs : consulter les logs du backend sur la plateforme de deploiement.
5. Verification configuration : controler les variables d'environnement requises, notamment `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `TMDB_API_KEY`, `FRONTEND_URL` et `PORT` si utilise.
6. Verification MongoDB : verifier que MongoDB est accessible et que l'URI configuree pointe vers la base attendue.
7. Correction ou redeploiement : corriger la configuration, redemarrer ou redeployer le backend selon la cause identifiee.
8. Validation : rappeler `/api/health`, verifier que le statut HTTP redevient `200`, que `status` vaut `UP` et que `database` vaut `UP`.

## Logs

Le backend utilise Winston et Morgan. Le niveau peut etre ajuste avec `LOG_LEVEL`.

Logs utiles a consulter lors d'un incident :

- demarrage de l'API ;
- connexion MongoDB ;
- erreurs TMDB ;
- erreurs auth ;
- erreurs admin ;
- erreurs serveur `500`.

## Limites connues

- La supervision documentee controle la disponibilite HTTP de `/api/health`; elle ne constitue pas un test synthetique complet des parcours metier.
- Aucun test synthetique metier externe n'est documente comme configure.
- La centralisation complete des logs n'est pas documentee comme configuree.
- Aucun SLA contractuel n'est documente dans le depot.
- Aucun seuil de latence autre que le timeout de 30s n'est documente comme configure.
