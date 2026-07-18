# Cahier de recette CineLink

Les statuts ci-dessous sont a renseigner pendant une campagne de recette. Lorsqu'un scenario n'a pas ete rejoue manuellement dans l'environnement cible, le statut reste `A verifier`.

| ID | Fonctionnalite | Prerequis | Etapes | Resultat attendu | Statut |
| --- | --- | --- | --- | --- | --- |
| REC-AUTH-001 | Inscription | API et frontend disponibles | Ouvrir `/register`, saisir nom, email, mot de passe valide et avatar, soumettre | Compte cree, token stocke, redirection vers l'application | A verifier |
| REC-AUTH-002 | Connexion | Compte existant | Ouvrir `/login`, saisir identifiants valides, soumettre | Connexion reussie, redirection vers `/app/movies` | A verifier |
| REC-AUTH-003 | Erreur login | Compte existant | Saisir un mauvais mot de passe | Message d'erreur conserve, formulaire reutilisable | A verifier |
| REC-AUTH-004 | Chargement prolonge | Backend lent ou requete simulee lente | Soumettre login/register | Bouton desactive, libelle de chargement, message d'attente discret | A verifier |
| REC-AUTH-005 | Refus 401 | Aucun token ou token invalide | Appeler une route protegee ou ouvrir une route app sans session | Acces refuse ou redirection vers login | A verifier |
| REC-MOV-001 | Catalogue | Utilisateur connecte | Ouvrir `/app/movies` | Films populaires affiches ou message d'erreur propre | A verifier |
| REC-MOV-002 | Detail film | Utilisateur connecte | Ouvrir un film depuis le catalogue | Detail, favoris et commentaires visibles | A verifier |
| REC-MOV-003 | Erreur 404 | Utilisateur connecte | Ouvrir un film inexistant ou ressource inexistante | Message d'erreur coherent | A verifier |
| REC-SEARCH-001 | Recherche films | Utilisateur connecte | Rechercher un titre dans `/app/search` | Resultats TMDB affiches ou liste vide explicite | A verifier |
| REC-FAV-001 | Ajouter favori | Utilisateur connecte | Depuis un film, ajouter aux favoris | Favori cree et visible dans `/app/favorites` | A verifier |
| REC-FAV-002 | Retirer favori | Film deja favori | Retirer le favori | Film retire de la liste | A verifier |
| REC-COM-001 | Commentaire bouton | Utilisateur connecte | Saisir un commentaire valide et cliquer publier | Commentaire ajoute a la liste | A verifier |
| REC-COM-002 | Commentaire avec Entree | Utilisateur connecte | Saisir un commentaire valide et appuyer sur `Entree` | Meme comportement que le bouton publier | A verifier |
| REC-COM-003 | Maj + Entree | Champ commentaire focus | Appuyer sur `Maj + Entree` | Saut de ligne ajoute, pas de publication | A verifier |
| REC-COM-004 | Commentaire vide | Utilisateur connecte | Soumettre un champ vide ou espaces | Aucune publication | A verifier |
| REC-SOC-001 | Follow | Deux comptes existants | Ouvrir le profil d'un autre utilisateur et suivre | Relation creee, bouton mis a jour | A verifier |
| REC-SOC-002 | Feed | Utilisateur suivant un autre compte | Ouvrir `/app/feed` apres activite de l'utilisateur suivi | Activites affichees | A verifier |
| REC-USR-001 | Profil personnel | Utilisateur connecte | Ouvrir `/app/me` | Informations, favoris et commentaires du compte visibles | A verifier |
| REC-USR-002 | Profil public | Utilisateur connecte | Ouvrir `/app/users/:id` | Profil public affiche ou `404` propre | A verifier |
| REC-ADMIN-001 | Utilisateur standard | Compte `USER` | Ouvrir `/app/admin` et/ou appeler `/api/admin/stats` | Acces refuse cote backend, interface non autorisee | A verifier |
| REC-ADMIN-002 | Administrateur | Compte `ADMIN` | Ouvrir `/app/admin` | Statistiques et liste utilisateurs visibles | A verifier |
| REC-ADMIN-003 | Suppression commentaire | Compte `ADMIN`, commentaire d'un autre utilisateur | Supprimer un commentaire depuis la page film | Commentaire supprime et activite associee retiree du feed | A verifier |
| REC-ADMIN-004 | Suppression utilisateur | Compte `ADMIN`, autre utilisateur existant | Supprimer l'utilisateur depuis `/app/admin` | Utilisateur retire, donnees liees nettoyees | A verifier |
| REC-ADMIN-005 | Refus 403 | Compte `USER` | Appeler une route `/api/admin/*` | Reponse `403 Acces administrateur requis` | A verifier |
| REC-RESP-001 | Affichage mobile | Smartphone ou responsive tools | Parcourir login, catalogue, detail, profil, admin | Contenu lisible, navigation utilisable | A verifier |
| REC-ROUTE-001 | Rafraichissement SPA | Application deployee | Rafraichir directement `/app/movies` ou `/app/feed` | Route servie correctement par le frontend | A verifier |

## Notes

- Les scenarios admin necessitent une promotion via `npm run admin:promote`.
- Les erreurs liees a TMDB doivent rester affichees proprement sans casser l'application.
- Les donnees de test doivent etre separees de la base de production.
