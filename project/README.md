# Initialisation du backlog GitHub MCO

Ce dossier contient un script PowerShell qui crée les labels, les premières issues réelles du Bloc 4 MCO et les issues historiques reconstituées à partir du dépôt.

## Prérequis

- GitHub CLI installé
- Authentification effectuée avec `gh auth login`
- Droits d'écriture sur le dépôt

Vérification :

```powershell
gh auth status
```

## Exécution

Depuis la racine du dépôt :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\project\setup-github-project.ps1
```

Le dépôt par défaut est `Furo347/CineLink`.

Pour vérifier l'import historique sans créer ni modifier de ressource GitHub :

```powershell
.\project\setup-github-project.ps1 -HistoricalOnly -DryRun
```

Pour importer uniquement les issues historiques :

```powershell
.\project\setup-github-project.ps1 -HistoricalOnly
```

Si plusieurs GitHub Projects v2 sont associés au dépôt, préciser le projet cible :

```powershell
.\project\setup-github-project.ps1 -HistoricalOnly -ProjectTitle "Nom du projet"
```

## Comportement

Le script est idempotent : il ne recrée pas les labels et recherche une issue ouverte ou fermée de même titre exact avant toute création.

Les issues historiques sont lues depuis `project/historical-issues.json`. Elles doivent porter le label `historical`, sont ajoutées au GitHub Project existant si elles n'y sont pas déjà présentes, puis leur champ `Status` est positionné sur `Done`.

Le mode `-DryRun` effectue les contrôles et les lectures GitHub nécessaires, mais ne crée pas de label, ne crée pas d'issue, n'ajoute pas de carte Project et ne modifie pas de statut.
