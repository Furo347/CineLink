# Frontend CineLink

Le frontend est une application React TypeScript construite avec Vite. Il consomme l'API backend via Axios et stocke la session utilisateur dans `localStorage`.

## Architecture

```text
cinelink-frontend/
├── src/
│   ├── app/
│   │   ├── AppShell.tsx       # Layout des routes connectees
│   │   ├── RequireAuth.tsx    # Protection par token
│   │   └── router.tsx         # Routes React
│   ├── components/ui/         # Composants UI reutilisables
│   ├── features/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── comments/
│   │   ├── favorites/
│   │   ├── feed/
│   │   ├── follow/
│   │   ├── movies/
│   │   ├── search/
│   │   └── users/
│   ├── lib/                   # Helpers JWT, erreurs API, avatars
│   ├── services/              # Client Axios et stockage auth
│   └── main.tsx
├── test/                      # Vitest et React Testing Library
├── vite.config.ts
├── eslint.config.js
└── vercel.json
```

## Demarrage

```bash
cd cinelink-frontend
npm ci
npm run dev
```

L'application est servie par Vite sur `http://localhost:5173`.

## Variable d'environnement

| Variable | Exemple | Role |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | URL de base de l'API backend. |

En production Vercel, cette variable doit pointer vers l'API Render.

## Routing

Routes publiques :

| Chemin | Page |
| --- | --- |
| `/` | Redirection vers `/login`. |
| `/login` | Connexion. |
| `/register` | Inscription. |

Routes protegees par `RequireAuth` :

| Chemin | Page |
| --- | --- |
| `/app/movies` | Catalogue de films. |
| `/app/movies/:id` | Detail d'un film et commentaires. |
| `/app/favorites` | Favoris. |
| `/app/search` | Recherche de films. |
| `/app/following` | Utilisateurs suivis. |
| `/app/users` | Liste et recherche utilisateurs. |
| `/app/users/:id` | Profil public. |
| `/app/me` | Profil courant. |
| `/app/feed` | Feed social. |
| `/app/admin` | Administration. |

La navigation admin est affichee uniquement si le role stocke vaut `ADMIN`. La securite reelle reste cote backend.

## Authentification et session

`auth.storage.ts` stocke :

- `cinelink_token` : token JWT.
- `cinelink_user` : utilisateur courant avec `id`, `email`, `name`, `avatar`, `role`.

Le client Axios ajoute automatiquement `Authorization: Bearer <token>` lorsque le token existe.

Si les donnees utilisateur stockees sont invalides ou si le role n'est pas `USER` ou `ADMIN`, le role retourne par defaut est `USER`.

## Pages et comportements principaux

- `LoginPage` et `RegisterPage` desactivent le bouton pendant la requete, changent le libelle et affichent un message discret si la reponse est lente.
- `MoviesPage` charge les films populaires.
- `MovieDetailsPage` charge le detail TMDB, les favoris et les commentaires.
- `CommentsSection` permet de publier au bouton ou avec `Entree`. Dans le champ multilignes, `Maj + Entree` ajoute une nouvelle ligne.
- `FeedPage` presente les activites sociales liees aux follows.
- `AdminPage` affiche les statistiques, liste les utilisateurs et permet la suppression admin d'un utilisateur autre que soi.

## Gestion des erreurs

Les appels API sont centralises autour du client Axios. Les messages utilisateur s'appuient sur les erreurs retournees par l'API lorsque c'est possible, avec des messages de secours professionnels.

## Administration frontend

`features/admin/admin.api.ts` expose :

- `getStats()`
- `removeComment(commentId)`
- `removeUser(userId)`

Le frontend masque les actions admin pour les utilisateurs standards, mais il ne constitue pas la source d'autorite. Les routes `/api/admin/*` restent protegees par JWT et `requireAdmin`.

## Tests

```bash
npm run lint
npm test
npm run test:coverage
npm run build
```

Les tests couvrent notamment :

- protection `RequireAuth` ;
- pages de films, detail film, feed, profil ;
- etats de chargement, erreurs et listes vides ;
- stockage JWT et gestion des erreurs API ;
- chargement login/register et prevention des doubles soumissions ;
- commentaires au clavier ;
- affichage et actions admin.

Le rapport LCOV est genere dans `cinelink-frontend/coverage/lcov.info`.

## Build et deploiement

`npm run build` execute `tsc -b` puis `vite build`.

Le projet est compatible Vercel. Les routes React doivent etre servies par fallback SPA, configure dans `vercel.json`.
