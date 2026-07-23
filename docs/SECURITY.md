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
- `401` si l'utilisateur associe au token est introuvable ou invalide.
- `403` si l'utilisateur authentifie ne possede pas le role `ADMIN` sur une route admin.

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

## Prise en compte de l'OWASP Top 10 2021

Cette correspondance recense les mesures de reduction du risque visibles dans le depot. Elle ne constitue pas un audit de securite externe.

| Categorie OWASP | Mesures presentes dans CineLink | Limites ou vigilance |
| --- | --- | --- |
| A01:2021 - Broken Access Control | Routes protegees par `authMiddleware`; routes `/api/admin/*` protegees par `requireAdmin`; roles `USER` et `ADMIN` portes par le modele `User`; role recharge depuis MongoDB avant les actions admin; tests automatises sur l'injection de role, les refus `401` et `403`, et les suppressions admin. | Le frontend masque certaines actions selon le role stocke, mais n'est pas la source d'autorite; absence de journal d'audit administrateur dedie; absence de restauration automatique apres suppression admin. |
| A02:2021 - Cryptographic Failures | Mots de passe hashes avec `bcryptjs`; JWT signe avec `JWT_SECRET`; duree de validite configuree par `JWT_EXPIRES_IN`; les secrets applicatifs sont attendus via variables d'environnement et non dans le code source. | Le token est conserve dans `localStorage` et non dans un cookie `HttpOnly`; la robustesse depend de secrets de production longs, non versionnes et correctement geres sur Render/Vercel. |
| A03:2021 - Injection | Validation des entrees d'authentification et de profil avec `express-validator`; acces aux donnees via Mongoose; controles d'identifiants MongoDB sur les routes admin avant certaines operations sensibles. | Tous les champs applicatifs ne sont pas couverts par une validation centralisee; aucun test d'intrusion ou audit externe n'est documente. |
| A04:2021 - Insecure Design | Separation backend/frontend des responsabilites; controle RBAC cote backend; inscription forcee en `USER`; script controle pour promouvoir un administrateur; tests de parcours critiques backend et frontend. | L'administration reste minimale; pas de mecanisme de restauration apres suppression; les choix de conception n'ont pas fait l'objet d'une revue de menace formelle documentee. |
| A05:2021 - Security Misconfiguration | `helmet`; CORS limite par `FRONTEND_URL`; `express-rate-limit` sur les routes d'authentification; configuration via variables d'environnement; workflows GitHub Actions distincts pour backend, frontend et SonarQube Cloud. | Le rate limit est cible sur l'authentification seulement; le monitoring de securite reste limite aux logs applicatifs; l'absence d'audit externe laisse des erreurs de configuration possibles. |
| A06:2021 - Vulnerable and Outdated Components | `package-lock.json` present pour backend et frontend; CI avec `npm ci`; Dependabot configure pour npm backend, npm frontend et GitHub Actions; analyse SonarQube Cloud configuree. | La reduction du risque depend de la revue et de l'application regulieres des mises a jour; aucune correction automatique de vulnerabilites n'est documentee. |
| A07:2021 - Identification and Authentication Failures | Authentification par JWT; verification de signature dans `authMiddleware`; comparaison des mots de passe hashes avec bcrypt; rate limit sur `/register` et `/login`; `401` pour absence de token, token invalide ou utilisateur associe introuvable. | Pas de MFA; pas de rotation automatique des tokens documentee; stockage du token en `localStorage`. |
| A08:2021 - Software and Data Integrity Failures | Installation reproductible via `package-lock.json` et `npm ci`; workflows GitHub Actions executant tests, typecheck/build et lint frontend; SonarQube Cloud avec rapports de couverture. | Pas de signature d'artefacts ni verification SCA avancee documentee; la protection depend de la securisation du depot, des secrets CI et des plateformes de deploiement. |
| A09:2021 - Security Logging and Monitoring Failures | Logs applicatifs via `winston`; logs HTTP via `morgan`; erreurs serveur et erreurs TMDB journalisees cote backend. | Pas de journal d'audit admin dedie; pas de supervision externe de securite configuree dans le depot; alerting et correlation d'evenements non documentes. |
| A10:2021 - Server-Side Request Forgery | Les appels serveur externes identifies ciblent l'API TMDB avec une base d'URL controlee par le code; les identifiants TMDB sont utilises comme parametres ou segments attendus, pas comme URL fournie par l'utilisateur. | Pas de filtrage reseau sortant documente; dependance a la disponibilite et au comportement de TMDB; vigilance a conserver si de nouvelles integrations externes acceptent des URL utilisateur. |

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
