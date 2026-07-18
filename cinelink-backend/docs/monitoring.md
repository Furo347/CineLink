# Monitoring CineLink Backend

## Endpoint de sante

```http
GET /api/health
```

Reponse lorsque le service et MongoDB sont disponibles :

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

## Logs

Le backend utilise Winston et Morgan. Le niveau peut etre ajuste avec `LOG_LEVEL`.

Logs utiles a surveiller :

- demarrage de l'API ;
- connexion MongoDB ;
- erreurs TMDB ;
- erreurs auth ;
- erreurs admin ;
- erreurs serveur `500`.

## Alertes recommandees

- Indisponibilite de `/api/health`.
- Hausse des erreurs `500`.
- Latence anormale sur les routes TMDB.
- Echecs repetes de connexion.
- Actions admin sensibles, surtout suppression utilisateur.
