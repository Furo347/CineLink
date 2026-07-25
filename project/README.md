# Initialisation du backlog GitHub MCO

Ce dossier contient un script PowerShell qui crée les labels et les premières issues réelles du Bloc 4 MCO.

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

## Comportement

Le script est idempotent : il ne recrée pas les labels et recherche une issue de même titre avant toute création.
