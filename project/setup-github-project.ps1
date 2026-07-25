param(
    [string]$Repository = "Furo347/CineLink",
    [string]$Assignee = "Furo347"
)

$ErrorActionPreference = "Stop"

function Assert-GhAuthenticated {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) n'est pas installé ou n'est pas disponible dans le PATH."
    }

    gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI n'est pas authentifié. Exécutez : gh auth login"
    }
}

function Ensure-Label {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Color,
        [Parameter(Mandatory = $true)][string]$Description
    )

    $existing = gh label list --repo $Repository --limit 200 --json name --jq '.[].name'
    if ($LASTEXITCODE -ne 0) {
        throw "Impossible de lire les labels du dépôt $Repository."
    }

    if ($existing -contains $Name) {
        Write-Host "Label existant : $Name"
        return
    }

    gh label create $Name --repo $Repository --color $Color --description $Description | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Échec lors de la création du label '$Name'."
    }

    Write-Host "Label créé : $Name"
}

function Ensure-Issue {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$Body,
        [Parameter(Mandatory = $true)][string[]]$Labels
    )

    # Lecture des issues du dépôt, puis comparaison exacte du titre
    # directement avec PowerShell.
    $issuesJson = gh issue list `
        --repo $Repository `
        --state all `
        --limit 200 `
        --json title,url

    if ($LASTEXITCODE -ne 0) {
        throw "Impossible de lire les issues du dépôt $Repository."
    }

    $existingIssue = $issuesJson |
        ConvertFrom-Json |
        Where-Object { $_.title -eq $Title } |
        Select-Object -First 1

    if ($null -ne $existingIssue) {
        Write-Host "Issue déjà existante : $Title"
        Write-Host "  $($existingIssue.url)"
        return
    }

    $labelArguments = @()

    foreach ($label in $Labels) {
        $labelArguments += "--label"
        $labelArguments += $label
    }

    $arguments = @(
        "issue", "create",
        "--repo", $Repository,
        "--title", $Title,
        "--body", $Body,
        "--assignee", $Assignee
    ) + $labelArguments

    $createdUrl = & gh @arguments

    if ($LASTEXITCODE -ne 0) {
        throw "Échec lors de la création de l'issue '$Title'."
    }

    Write-Host "Issue créée : $Title"
    Write-Host "  $createdUrl"
}

Assert-GhAuthenticated

Write-Host ""
Write-Host "Configuration du backlog MCO pour $Repository"
Write-Host "------------------------------------------------"

$labels = @(
    @{ Name = "mco"; Color = "0E8A16"; Description = "Maintien en condition opérationnelle" },
    @{ Name = "monitoring"; Color = "1D76DB"; Description = "Supervision, observabilité et alertes" },
    @{ Name = "documentation"; Color = "0075CA"; Description = "Documentation technique ou opérationnelle" },
    @{ Name = "incident"; Color = "D73A4A"; Description = "Incident de production ou retour d'expérience" },
    @{ Name = "testing"; Color = "5319E7"; Description = "Tests automatisés, stabilité et qualité" },
    @{ Name = "deployment"; Color = "FBCA04"; Description = "Déploiement, hébergement et environnement" },
    @{ Name = "maintenance"; Color = "C2E0C6"; Description = "Maintenance corrective ou préventive" },
    @{ Name = "priority: high"; Color = "B60205"; Description = "Priorité haute" },
    @{ Name = "priority: medium"; Color = "FBCA04"; Description = "Priorité moyenne" }
)

foreach ($label in $labels) {
    Ensure-Label -Name $label.Name -Color $label.Color -Description $label.Description
}

$issues = @(
    @{
        Title = "[MCO] Finaliser la supervision Better Stack"
        Labels = @("mco", "monitoring", "priority: high")
        Body = @"
## Contexte

L'API CineLink est déployée en production et expose un endpoint de santé. Une supervision Better Stack a été amorcée mais doit être vérifiée et formalisée afin de disposer d'une preuve exploitable pour le Bloc 4.

## Objectif

Finaliser la configuration de supervision de l'application et vérifier que les alertes sont réellement opérationnelles.

## Travaux à réaliser

- [ ] Vérifier le monitor HTTP du backend en production
- [ ] Vérifier l'URL et la fréquence de contrôle
- [ ] Configurer ou valider les notifications par e-mail
- [ ] Définir les seuils et conditions d'alerte
- [ ] Effectuer un test contrôlé d'indisponibilité ou de réponse invalide
- [ ] Capturer les écrans de configuration et le résultat du test
- [ ] Documenter brièvement la procédure de vérification

## Critères d'acceptation

- Le monitor Better Stack indique que le service est opérationnel
- Une alerte de test peut être reçue et démontrée
- Les paramètres essentiels sont documentés
- Les preuves sont conservées pour le rapport de certification

## Preuves attendues

- Capture du monitor
- Capture ou e-mail d'alerte
- URL supervisée
- Date du test
"@
    },
    @{
        Title = "[MCO] Ajouter les indicateurs de statut au README"
        Labels = @("mco", "documentation", "monitoring", "priority: medium")
        Body = @"
## Contexte

Le README doit présenter rapidement l'état opérationnel du projet et les principaux contrôles automatisés.

## Objectif

Ajouter des badges fiables et lisibles pour rendre visibles les mécanismes de qualité et de disponibilité.

## Travaux à réaliser

- [ ] Ajouter le badge de CI GitHub Actions
- [ ] Ajouter le badge SonarCloud si disponible
- [ ] Ajouter un indicateur de statut Better Stack si la plateforme le permet
- [ ] Vérifier les liens associés aux badges
- [ ] Vérifier le rendu sur GitHub
- [ ] Éviter les badges décoratifs ou non maintenus

## Critères d'acceptation

- Les badges correspondent à des services réellement configurés
- Chaque badge renvoie vers une page pertinente
- Le README reste lisible sur ordinateur et mobile
- Aucun secret ou identifiant sensible n'est exposé
"@
    },
    @{
        Title = "[MCO] Créer et maintenir le CHANGELOG"
        Labels = @("mco", "documentation", "maintenance", "priority: medium")
        Body = @"
## Contexte

Le projet possède un historique Git complet, mais ne dispose pas encore d'un document synthétique permettant d'identifier les évolutions fonctionnelles, techniques et correctives.

## Objectif

Créer un fichier CHANGELOG.md structuré et maintenable.

## Travaux à réaliser

- [ ] Utiliser une structure inspirée de Keep a Changelog
- [ ] Ajouter une section Unreleased
- [ ] Reconstituer les principales versions ou périodes du projet
- [ ] Distinguer Added, Changed, Fixed et Security
- [ ] Mentionner les évolutions MCO importantes
- [ ] Définir la règle de mise à jour du changelog

## Critères d'acceptation

- Le fichier CHANGELOG.md est présent à la racine
- Les entrées sont cohérentes avec l'historique Git
- Les corrections et opérations de maintenance sont identifiables
- La section Unreleased peut être utilisée pour les travaux futurs
"@
    },
    @{
        Title = "[INCIDENT] Documenter l'échec de déploiement Render"
        Labels = @("mco", "incident", "deployment", "documentation", "priority: high")
        Body = @"
## Contexte

Un déploiement du backend sur Render a démarré correctement, avec connexion à MongoDB et écoute sur le port fourni par la plateforme, mais le service a ensuite été considéré comme indisponible ou a expiré.

## Objectif

Formaliser cet événement sous la forme d'un retour d'expérience exploitable pour la maintenance et la certification.

## Travaux à réaliser

- [ ] Décrire la date et le contexte de l'incident
- [ ] Consigner les symptômes observés
- [ ] Ajouter les extraits de logs pertinents
- [ ] Identifier les hypothèses de cause
- [ ] Décrire les vérifications effectuées
- [ ] Documenter la résolution ou le contournement
- [ ] Définir des mesures préventives
- [ ] Ajouter les preuves disponibles

## Structure attendue

1. Résumé
2. Impact
3. Chronologie
4. Diagnostic
5. Cause racine ou cause probable
6. Résolution
7. Actions préventives
8. Enseignements

## Critères d'acceptation

- Le document ne prétend pas connaître une cause non démontrée
- Les faits et les hypothèses sont clairement séparés
- Au moins une action préventive est définie
- L'incident peut être présenté comme preuve MCO
"@
    },
    @{
        Title = "[MCO] Stabiliser les tests MongoMemoryServer"
        Labels = @("mco", "testing", "maintenance", "priority: high")
        Body = @"
## Contexte

La suite de tests backend peut rencontrer un démarrage lent ou un timeout de MongoMemoryServer, ce qui réduit la fiabilité de la CI et des tests locaux.

## Objectif

Identifier la cause des instabilités et rendre l'exécution des tests déterministe.

## Travaux à réaliser

- [ ] Reproduire le timeout localement ou dans la CI
- [ ] Examiner la configuration Jest et le setup MongoMemoryServer
- [ ] Vérifier le téléchargement ou le cache du binaire MongoDB
- [ ] Vérifier les hooks beforeAll, afterAll et la fermeture des connexions
- [ ] Ajuster les timeouts uniquement si cela est justifié
- [ ] Éviter les processus ou handles ouverts après les tests
- [ ] Exécuter plusieurs fois la suite complète
- [ ] Documenter la cause et la correction

## Critères d'acceptation

- La suite de tests réussit plusieurs fois consécutivement
- Aucun handle Jest ne reste ouvert
- La correction ne masque pas un défaut par un timeout excessif
- La CI reste verte
- Le diagnostic est consigné dans l'issue ou la Pull Request
"@
    },
    @{
        Title = "[MCO] Rédiger le runbook d'exploitation"
        Labels = @("mco", "documentation", "maintenance", "deployment", "priority: high")
        Body = @"
## Contexte

La maintenance opérationnelle de CineLink doit pouvoir être comprise et exécutée à partir d'une documentation centralisée.

## Objectif

Créer un runbook décrivant les opérations courantes, les contrôles et les procédures de dépannage.

## Contenu attendu

- [ ] Architecture et services de production
- [ ] Variables d'environnement nécessaires, sans valeurs sensibles
- [ ] Procédure de déploiement backend et frontend
- [ ] Vérification du endpoint de santé
- [ ] Vérification de la base MongoDB Atlas
- [ ] Supervision Better Stack
- [ ] Consultation des logs
- [ ] Procédure de rollback ou de redéploiement
- [ ] Gestion d'un incident
- [ ] Sauvegarde et restauration, ou limites actuelles
- [ ] Maintenance des dépendances avec Dependabot
- [ ] Contacts, responsabilités et fréquence des contrôles

## Critères d'acceptation

- Le runbook est versionné dans le dépôt
- Les commandes sont vérifiées
- Aucun secret n'est présent
- Un tiers peut comprendre comment contrôler l'état de l'application
- Les limites de l'infrastructure gratuite sont mentionnées
"@
    },
    @{
        Title = "[MCO] Réaliser l'audit de préparation à la production"
        Labels = @("mco", "maintenance", "deployment", "testing", "priority: high")
        Body = @"
## Contexte

Avant la finalisation du dossier Bloc 4, l'application doit faire l'objet d'un contrôle global de disponibilité, de sécurité, de qualité et de maintenabilité.

## Objectif

Établir une checklist de préparation à la production et traiter ou consigner les écarts.

## Vérifications

### Disponibilité
- [ ] Frontend accessible
- [ ] Backend accessible
- [ ] Endpoint de santé valide
- [ ] Connexion à MongoDB opérationnelle
- [ ] Supervision active

### Qualité
- [ ] CI verte
- [ ] Tests backend réussis
- [ ] Tests frontend réussis
- [ ] Analyse SonarCloud vérifiée
- [ ] Aucun avertissement bloquant non traité

### Sécurité
- [ ] Secrets absents du dépôt
- [ ] Variables de production correctement configurées
- [ ] Dépendances critiques examinées
- [ ] Helmet et protections HTTP vérifiés
- [ ] Authentification et autorisations vérifiées

### Exploitation
- [ ] Logs consultables
- [ ] Runbook disponible
- [ ] CHANGELOG disponible
- [ ] Incident connu documenté
- [ ] Procédure de rollback définie

## Critères d'acceptation

- Chaque point possède un statut vérifiable
- Les écarts restants sont transformés en issues
- Les preuves principales sont archivées pour le rapport
- Une conclusion de préparation à la production est rédigée
"@
    }
)

foreach ($issue in $issues) {
    Ensure-Issue -Title $issue.Title -Body $issue.Body -Labels $issue.Labels
}

Write-Host ""
Write-Host "Configuration terminée."
Write-Host "Consultez les issues : https://github.com/$Repository/issues"
