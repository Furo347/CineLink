# Accessibilite CineLink

Ce document liste les mesures d'accessibilite presentes ou recommandees pour CineLink.

## Referentiel retenu

Le RGAA est le referentiel principal retenu pour guider la demarche d'accessibilite de CineLink. Cette demarche s'inscrit egalement dans les principes internationaux des WCAG, le choix du RGAA etant coherent avec le contexte francais du projet.

Les verifications portent notamment sur la navigation au clavier, l'ordre et la visibilite du focus, les contrastes, les formulaires et leurs libelles, les messages d'erreur, les etats de chargement, l'utilisation de `aria-live` et `aria-busy`, ainsi que les parcours de navigation et les actions realisables au clavier.

Cette demarche constitue une auto-evaluation. Elle ne vaut pas audit RGAA officiel, ne constitue pas une declaration de conformite complete et certains controles restent manuels. Aucun niveau de conformite RGAA ou WCAG chiffre n'est annonce, faute de mesure officielle complete.

## Mesures en place

- Formulaires d'authentification avec libelles et boutons explicites.
- Etats de chargement sur connexion et inscription.
- Message d'attente annonce via `aria-live`.
- Utilisation de `aria-busy` pendant les soumissions longues.
- Bouton de soumission desactive pendant les requetes pour eviter les doubles actions.
- Navigation principale basee sur des liens React Router.
- Actions importantes exposees par des boutons reels.
- Publication de commentaire possible au clavier avec `Entree`.
- Conservation de `Maj + Entree` pour creer une nouvelle ligne dans le champ commentaire.

## Points a verifier manuellement

- Navigation complete au clavier sur mobile et desktop.
- Ordre de focus dans les pages principales.
- Contraste des textes sur les fonds sombres.
- Lisibilite des messages d'erreur et de chargement.
- Comportement lecteur d'ecran sur les pages auth, film detail, feed et admin.

## Outils recommandes

- Lighthouse.
- Tests clavier manuels.
- Lecteur d'ecran systeme.
- Eventuellement axe-core si une etape automatisee d'accessibilite est ajoutee plus tard.

## Limites connues

Il n'existe pas actuellement de workflow axe-core dedie dans la CI. Les verifications d'accessibilite restent donc principalement manuelles et completees par les tests de composants existants.
