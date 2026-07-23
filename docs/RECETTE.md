# Cahier de recette CineLink

## Campagne de recette finale

- Date d'execution : 23 juillet 2026
- Environnement : production
- Frontend : https://cine-link-lemon.vercel.app
- Backend : https://cinelink-backend.onrender.com
- Type de campagne : recette fonctionnelle manuelle
- Resultat global : conforme
- Executant : porteur du projet CineLink

Cette campagne manuelle complete les tests automatises backend et frontend presents dans le depot. Elle vise a verifier les parcours fonctionnels principaux dans l'environnement de production, sans pretendre que les scenarios ci-dessous sont executes automatiquement.

| ID | Fonctionnalite | Prerequis | Etapes | Resultat attendu | Statut |
| --- | --- | --- | --- | --- | --- |
| REC-AUTH-001 | Inscription | API et frontend disponibles | Ouvrir `/register`, saisir nom, email, mot de passe valide et avatar, soumettre | Compte cree, token stocke, redirection vers l'application | Conforme |
| REC-AUTH-002 | Connexion | Compte existant | Ouvrir `/login`, saisir identifiants valides, soumettre | Connexion reussie, redirection vers `/app/movies` | Conforme |
| REC-AUTH-003 | Erreur login | Compte existant | Saisir un mauvais mot de passe | Message d'erreur conserve, formulaire reutilisable | Conforme |
| REC-AUTH-004 | Chargement prolonge | Backend lent ou requete simulee lente | Soumettre login/register | Bouton desactive, libelle de chargement, message d'attente discret | Conforme |
| REC-AUTH-005 | Refus 401 | Aucun token ou token invalide | Appeler une route protegee ou ouvrir une route app sans session | Acces refuse ou redirection vers login | Conforme |
| REC-MOV-001 | Catalogue | Utilisateur connecte | Ouvrir `/app/movies` | Films populaires affiches ou message d'erreur propre | Conforme |
| REC-MOV-002 | Detail film | Utilisateur connecte | Ouvrir un film depuis le catalogue | Detail, favoris et commentaires visibles | Conforme |
| REC-MOV-003 | Erreur 404 | Utilisateur connecte | Ouvrir un film inexistant ou ressource inexistante | Message d'erreur coherent | Conforme |
| REC-SEARCH-001 | Recherche films | Utilisateur connecte | Rechercher un titre dans `/app/search` | Resultats TMDB affiches ou liste vide explicite | Conforme |
| REC-FAV-001 | Ajouter favori | Utilisateur connecte | Depuis un film, ajouter aux favoris | Favori cree et visible dans `/app/favorites` | Conforme |
| REC-FAV-002 | Retirer favori | Film deja favori | Retirer le favori | Film retire de la liste | Conforme |
| REC-COM-001 | Commentaire bouton | Utilisateur connecte | Saisir un commentaire valide et cliquer publier | Commentaire ajoute a la liste | Conforme |
| REC-COM-002 | Commentaire avec Entree | Utilisateur connecte | Saisir un commentaire valide et appuyer sur `Entree` | Meme comportement que le bouton publier | Conforme |
| REC-COM-003 | Maj + Entree | Champ commentaire focus | Appuyer sur `Maj + Entree` | Saut de ligne ajoute, pas de publication | Conforme |
| REC-COM-004 | Commentaire vide | Utilisateur connecte | Soumettre un champ vide ou espaces | Aucune publication | Conforme |
| REC-SOC-001 | Follow | Deux comptes existants | Ouvrir le profil d'un autre utilisateur et suivre | Relation creee, bouton mis a jour | Conforme |
| REC-SOC-002 | Feed | Utilisateur suivant un autre compte | Ouvrir `/app/feed` apres activite de l'utilisateur suivi | Activites affichees | Conforme |
| REC-USR-001 | Profil personnel | Utilisateur connecte | Ouvrir `/app/me` | Informations, favoris et commentaires du compte visibles | Conforme |
| REC-USR-002 | Profil public | Utilisateur connecte | Ouvrir `/app/users/:id` | Profil public affiche ou `404` propre | Conforme |
| REC-ADMIN-001 | Utilisateur standard | Compte `USER` | Ouvrir `/app/admin` et/ou appeler `/api/admin/stats` | Acces refuse cote backend, interface non autorisee | Conforme |
| REC-ADMIN-002 | Administrateur | Compte `ADMIN` | Ouvrir `/app/admin` | Statistiques et liste utilisateurs visibles | Conforme |
| REC-ADMIN-003 | Suppression commentaire | Compte `ADMIN`, commentaire d'un autre utilisateur | Supprimer un commentaire depuis la page film | Commentaire supprime et activite associee retiree du feed | Conforme |
| REC-ADMIN-004 | Suppression utilisateur | Compte `ADMIN`, autre utilisateur existant | Supprimer l'utilisateur depuis `/app/admin` | Utilisateur retire, donnees liees nettoyees | Conforme |
| REC-ADMIN-005 | Refus 403 | Compte `USER` | Appeler une route `/api/admin/*` | Reponse `403 Acces administrateur requis` | Conforme |
| REC-RESP-001 | Affichage mobile | Smartphone ou responsive tools | Parcourir login, catalogue, detail, profil, admin | Contenu lisible, navigation utilisable | Conforme |
| REC-ROUTE-001 | Rafraichissement SPA | Application deployee | Rafraichir directement `/app/movies` ou `/app/feed` | Route servie correctement par le frontend | Conforme |

## Notes

- Les scenarios admin necessitent une promotion via `npm run admin:promote`.
- Les erreurs liees a TMDB doivent rester affichees proprement sans casser l'application.
- Les donnees de test doivent etre separees de la base de production.
