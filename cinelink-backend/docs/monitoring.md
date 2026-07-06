# Monitoring CineLink Backend

## Endpoint de santé

Le backend expose un endpoint de supervision :

```http
GET /api/health
```

Réponse lorsque le service et MongoDB sont disponibles :

```json
{
  "status": "UP",
  "database": "UP",
  "uptime": 123.45,
  "timestamp": "2026-07-06T12:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "memory": {
    "rss": 12345678,
    "heapTotal": 9876543,
    "heapUsed": 4567890
  }
}
```

`database` est calculé à partir de `mongoose.connection.readyState`.
Si MongoDB n'est pas connecté, `status` et `database` passent à `DOWN` et l'API répond avec un code HTTP `503`.

## Logs applicatifs

Les logs sont centralisés avec Winston :

- `logs/app.log` : logs applicatifs et requêtes HTTP.
- `logs/error.log` : erreurs applicatives.
- Console : activée uniquement lorsque `NODE_ENV=development`.

Les requêtes HTTP Express sont journalisées avec Morgan au format `combined` et transmises au logger Winston.
