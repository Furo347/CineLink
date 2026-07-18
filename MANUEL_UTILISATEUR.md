# Manuel utilisateur CineLink

CineLink est une plateforme sociale pour decouvrir des films, conserver ses favoris, publier des commentaires et suivre l'activite d'autres utilisateurs.

## Creation de compte

1. Ouvrir la page d'inscription.
2. Renseigner un nom, un email, un mot de passe valide et, si souhaite, un avatar.
3. Soumettre le formulaire.

Pendant une reponse longue, le bouton est desactive et affiche un etat de chargement. Un message indique que le premier chargement peut prendre quelques instants lorsque les services redemarrent.

## Connexion

1. Ouvrir la page de connexion.
2. Renseigner email et mot de passe.
3. Soumettre.

En cas d'erreur, le message existant reste affiche et le formulaire redevient utilisable.

## Navigation

Apres connexion, l'utilisateur peut acceder a :

- Films ;
- Recherche ;
- Favoris ;
- Utilisateurs ;
- Feed ;
- Profil ;
- Administration, uniquement si le compte a le role `ADMIN`.

## Films

La page Films affiche les films populaires fournis par TMDB. Depuis une carte film, l'utilisateur peut ouvrir la page detail.

La page detail affiche les informations principales du film, les actions de favori et les commentaires.

## Favoris

Un utilisateur connecte peut ajouter un film a ses favoris, le retirer et lui associer une note lorsque l'interface le propose.

## Commentaires

Sur la page detail d'un film :

- le bouton de publication ajoute un commentaire valide ;
- `Entree` publie le commentaire ;
- `Maj + Entree` ajoute une nouvelle ligne dans le champ ;
- un commentaire vide ou compose uniquement d'espaces n'est pas publie ;
- pendant une requete en cours, une seconde soumission est bloquee.

Un utilisateur peut supprimer ses propres commentaires. Un administrateur peut supprimer un commentaire d'un autre utilisateur.

## Social

L'utilisateur peut consulter les profils publics, suivre ou ne plus suivre d'autres utilisateurs et consulter un feed d'activites.

## Profil

La page profil permet de consulter les informations du compte courant, ses favoris et ses commentaires. Les profils publics montrent les informations accessibles des autres utilisateurs.

## Administration

Les comptes `ADMIN` disposent d'une page d'administration avec :

- statistiques simples ;
- liste des utilisateurs ;
- suppression d'un utilisateur autre que soi ;
- moderation des commentaires depuis les pages film.

La creation d'un administrateur ne se fait pas depuis l'interface. Elle passe par le script backend documente dans [docs/SECURITY.md](docs/SECURITY.md).

## Depannage

| Probleme | Verification |
| --- | --- |
| Connexion impossible en local | Verifier que `VITE_API_URL` pointe vers l'API locale et que `FRONTEND_URL` autorise `http://localhost:5173`. |
| Erreur CORS | Verifier la variable backend `FRONTEND_URL`. |
| Seed local impossible avec `mongo` introuvable | Utiliser `mongodb://localhost:27017/cinelink` depuis le poste hote. |
| Films indisponibles | Verifier la cle `TMDB_API_KEY` et la disponibilite de TMDB. |
| Bouton admin absent | Se reconnecter apres promotion et verifier que le compte est promu sur la bonne base MongoDB. |

## Accessibilite

L'application utilise des formulaires semantiques, des boutons reels, des libelles de chargement et des messages avec `aria-live` lorsque pertinent. Voir [ACCESSIBILITE.md](ACCESSIBILITE.md).
