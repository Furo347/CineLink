# Securite et administration

Cette documentation couvre les mecanismes reellement presents dans le code CineLink.

## Authentification

- L'authentification repose sur JWT.
- Le token est signe avec `JWT_SECRET`.
- La duree de validite est configuree avec `JWT_EXPIRES_IN`.
- Le frontend stocke le token dans `localStorage`.
- L'API attend `Authorization: Bearer <token>` sur les routes protegees.

Reponses principales :

- `401` si le token est absent.
- `401` si le token est invalide.
- `401` si l'utilisateur lie au token ne permet pas de continuer sur une route admin.

## Mots de passe

Les mots de passe sont hashes avec bcrypt avant enregistrement en base. Aucun mot de passe en clair ne doit etre journalise ni expose dans les reponses API.

## Validation

`express-validator` est utilise sur :

- inscription ;
- connexion ;
- mise a jour du profil ;
- mise a jour de l'avatar.

Exemples de controles :

- email valide ;
- mot de passe d'au moins 8 caracteres avec majuscule, minuscule, chiffre et caractere special ;
- nom entre 2 et 50 caracteres ;
- avatar dans la liste `avatar1` a `avatar5`.

## Roles

Le modele `User` contient :

```ts
role: "USER" | "ADMIN"
```

Valeur par defaut : `USER`.

Un utilisateur ne peut pas devenir administrateur a l'inscription. Le controleur cree le document sans reprendre un champ `role` fourni par le client.

## Source d'autorite

Le frontend peut masquer ou afficher des elements selon le role stocke, mais il n'est pas la source d'autorite.

La source d'autorite est le backend :

1. `authMiddleware` valide le JWT.
2. `requireAdmin` recharge l'utilisateur depuis MongoDB.
3. `requireAdmin` verifie que le role en base est `ADMIN`.

## Creation du premier administrateur

Creer un compte normalement, puis lancer :

```bash
cd cinelink-backend
npm run admin:promote -- user@example.com
```

Ou :

```bash
ADMIN_EMAIL=user@example.com npm run admin:promote
```

Sous PowerShell :

```powershell
$env:ADMIN_EMAIL="user@example.com"
npm run admin:promote
```

Le script doit etre execute avec un `MONGO_URI` pointant vers la bonne base. En Docker local, l'URI depuis le poste hote est generalement `mongodb://localhost:27017/cinelink`; dans le conteneur API, c'est `mongodb://mongo:27017/cinelink`.

## Routes admin

| Methode | Route | Role | Description |
| --- | --- | --- | --- |
| `GET` | `/api/admin/stats` | `ADMIN` | Compte utilisateurs, commentaires, favoris et follows. |
| `DELETE` | `/api/admin/comments/:commentId` | `ADMIN` | Supprime n'importe quel commentaire et l'activite commentaire associee si elle est retrouvee. |
| `DELETE` | `/api/admin/users/:userId` | `ADMIN` | Supprime un utilisateur autre que l'admin courant et nettoie ses donnees liees. |

## Suppression utilisateur

Donnees supprimees :

- utilisateur ;
- commentaires de l'utilisateur ;
- favoris de l'utilisateur ;
- relations follow entrantes et sortantes ;
- activites ou l'utilisateur est acteur ou cible.

Protection :

- un administrateur ne peut pas supprimer son propre compte via cette route.

Reponses :

- `400` si l'identifiant est invalide ou en cas d'auto-suppression.
- `401` si l'authentification echoue.
- `403` si l'utilisateur connecte n'est pas `ADMIN`.
- `404` si la ressource n'existe pas.
- `500` en cas d'erreur serveur.

## Protections HTTP

L'API utilise :

- `helmet` ;
- `cors` avec `FRONTEND_URL` ;
- `express-rate-limit` sur les routes d'authentification ;
- `express.json()`.

Le rate limit est desactive en environnement de test.

## Recommandations production

- Utiliser un `JWT_SECRET` long et non versionne.
- Configurer `FRONTEND_URL` avec l'origine exacte du frontend.
- Verifier que `MONGO_URI` pointe vers MongoDB Atlas en production.
- Restreindre l'acces aux variables d'environnement sur Render et Vercel.
- Conserver la promotion admin comme operation controlee, pas comme route publique.
- Surveiller les actions admin dans les logs applicatifs si l'application evolue vers une production plus large.

## Limites connues

- Il n'existe pas encore d'interface de restauration apres suppression admin.
- Il n'existe pas de journal d'audit admin dedie.
- L'administration est volontairement limitee aux besoins de moderation actuels.
