param(
    [string]$Repository = "Furo347/CineLink",
    [string]$Assignee = "Furo347",
    [string]$ProjectTitle = "",
    [switch]$DryRun,
    [switch]$HistoricalOnly
)

$ErrorActionPreference = "Stop"

$HistoricalIssuesPath = Join-Path $PSScriptRoot "historical-issues.json"

$Summary = [ordered]@{
    TicketsAnalyzed       = 0
    TicketsCreated        = 0
    TicketsExisting       = 0
    ProjectCardsAdded     = 0
    ProjectCardsExisting  = 0
    StatusesSetDone       = 0
    Errors                = 0
}

$LabelCatalog = @{
    "mco"              = @{ Color = "0E8A16"; Description = "Maintien en condition opérationnelle" }
    "monitoring"       = @{ Color = "1D76DB"; Description = "Supervision, observabilité et alertes" }
    "documentation"    = @{ Color = "0075CA"; Description = "Documentation technique ou opérationnelle" }
    "incident"         = @{ Color = "D73A4A"; Description = "Incident de production ou retour d'expérience" }
    "testing"          = @{ Color = "fbca04"; Description = "Tests automatisés, stabilité et qualité" }
    "deployment"       = @{ Color = "d93f0b"; Description = "Déploiement, hébergement et environnement" }
    "maintenance"      = @{ Color = "C2E0C6"; Description = "Maintenance corrective ou préventive" }
    "priority: high"   = @{ Color = "B60205"; Description = "Priorité haute" }
    "priority: medium" = @{ Color = "FBCA04"; Description = "Priorité moyenne" }
    "historical"       = @{ Color = "6f42c1"; Description = "Ticket historique reconstitué à partir des preuves du dépôt" }
    "backend"          = @{ Color = "1d76db"; Description = "Backend API et services" }
    "frontend"         = @{ Color = "0e8a16"; Description = "Frontend et interface utilisateur" }
    "feature"          = @{ Color = "a2eeef"; Description = "Fonctionnalité applicative" }
    "authentication"   = @{ Color = "5319e7"; Description = "Authentification et autorisations" }
    "database"         = @{ Color = "006b75"; Description = "Base de données et persistance" }
    "devops"           = @{ Color = "0052cc"; Description = "Automatisation et exploitation" }
    "ci-cd"            = @{ Color = "0366d6"; Description = "Intégration et déploiement continus" }
    "quality"          = @{ Color = "c5def5"; Description = "Qualité logicielle et analyse statique" }
    "security"         = @{ Color = "b60205"; Description = "Sécurité applicative" }
}

function Write-Step {
    param(
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Message
    )

    Write-Host "[$Kind] $Message"
}

function Invoke-Gh {
    param(
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $output = & gh @Arguments 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Commande gh échouée : gh $($Arguments -join ' ')`n$($output -join "`n")"
    }

    return ($output -join "`n")
}

function ConvertFrom-JsonText {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Json
    )

    if ([string]::IsNullOrWhiteSpace($Json)) {
        return @()
    }

    return $Json | ConvertFrom-Json
}

function Assert-Prerequisites {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "Git n'est pas installé ou n'est pas disponible dans le PATH."
    }

    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) n'est pas installé ou n'est pas disponible dans le PATH."
    }

    Invoke-Gh -Arguments @("auth", "status") | Out-Null
}

function Get-RepositoryParts {
    $parts = $Repository.Split("/")
    if ($parts.Count -ne 2 -or [string]::IsNullOrWhiteSpace($parts[0]) -or [string]::IsNullOrWhiteSpace($parts[1])) {
        throw "Le dépôt doit être au format propriétaire/nom. Valeur reçue : $Repository"
    }

    return @{
        Owner = $parts[0]
        Name  = $parts[1]
    }
}

function Get-ExistingLabels {
    $labelsJson = Invoke-Gh -Arguments @("label", "list", "--repo", $Repository, "--limit", "200", "--json", "name")
    $labels = @(ConvertFrom-JsonText -Json $labelsJson)
    $lookup = @{}

    foreach ($label in $labels) {
        $lookup[$label.name] = $true
    }

    return $lookup
}

function Ensure-Label {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][hashtable]$ExistingLabels
    )

    if (-not $LabelCatalog.ContainsKey($Name)) {
        throw "Label non référencé dans le catalogue local : $Name"
    }

    if ($ExistingLabels.ContainsKey($Name)) {
        Write-Step -Kind "LABEL" -Message "Déjà présent : $Name"
        return
    }

    $definition = $LabelCatalog[$Name]
    if ($DryRun) {
        Write-Step -Kind "LABEL" -Message "Création simulée : $Name"
        return
    }

    Invoke-Gh -Arguments @(
        "label", "create", $Name,
        "--repo", $Repository,
        "--color", $definition.Color,
        "--description", $definition.Description
    ) | Out-Null

    $ExistingLabels[$Name] = $true
    Write-Step -Kind "LABEL" -Message "Créé : $Name"
}

function Get-ExistingIssues {
    $issuesJson = Invoke-Gh -Arguments @(
        "issue", "list",
        "--repo", $Repository,
        "--state", "all",
        "--limit", "1000",
        "--json", "id,title,url"
    )

    $issues = @(ConvertFrom-JsonText -Json $issuesJson)
    $lookup = @{}

    foreach ($issue in $issues) {
        if (-not $lookup.ContainsKey($issue.title)) {
            $lookup[$issue.title] = $issue
        }
    }

    return $lookup
}

function Ensure-Issue {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [Parameter(Mandatory = $true)][string]$Body,
        [Parameter(Mandatory = $true)][string[]]$Labels,
        [Parameter(Mandatory = $true)][hashtable]$ExistingIssues
    )

    if ($ExistingIssues.ContainsKey($Title)) {
        $Summary.TicketsExisting++
        Write-Step -Kind "ISSUE" -Message "Déjà existante : $Title"
        return $ExistingIssues[$Title]
    }

    if ($DryRun) {
        Write-Step -Kind "ISSUE" -Message "Création simulée : $Title"
        return [pscustomobject]@{
            id          = $null
            title       = $Title
            url         = $null
            WouldCreate = $true
        }
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

    $createdUrl = Invoke-Gh -Arguments $arguments
    $createdIssueJson = Invoke-Gh -Arguments @(
        "issue", "view", $createdUrl.Trim(),
        "--repo", $Repository,
        "--json", "id,title,url"
    )

    $createdIssue = ConvertFrom-JsonText -Json $createdIssueJson
    $ExistingIssues[$Title] = $createdIssue
    $Summary.TicketsCreated++
    Write-Step -Kind "ISSUE" -Message "Créée : $Title"
    return $createdIssue
}

function Get-ProjectContext {
    $repositoryParts = Get-RepositoryParts
    $projectsQuery = @'
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    projectsV2(first: 20) {
      nodes {
        id
        number
        title
      }
    }
  }
}
'@

    $projectsJson = Invoke-Gh -Arguments @(
        "api", "graphql",
        "-f", "query=$projectsQuery",
        "-F", "owner=$($repositoryParts.Owner)",
        "-F", "name=$($repositoryParts.Name)"
    )

    $projects = @((ConvertFrom-JsonText -Json $projectsJson).data.repository.projectsV2.nodes)
    if ($projects.Count -eq 0) {
        throw "Aucun GitHub Project v2 n'est associé au dépôt $Repository."
    }

    if (-not [string]::IsNullOrWhiteSpace($ProjectTitle)) {
        $project = $projects | Where-Object { $_.title -eq $ProjectTitle } | Select-Object -First 1
        if ($null -eq $project) {
            throw "Aucun GitHub Project v2 nommé '$ProjectTitle' n'est associé au dépôt $Repository."
        }
    }
    elseif ($projects.Count -eq 1) {
        $project = $projects[0]
    }
    else {
        $availableProjects = ($projects | ForEach-Object { $_.title }) -join "', '"
        throw "Plusieurs GitHub Projects v2 sont associés au dépôt. Relancez avec -ProjectTitle. Projets disponibles : '$availableProjects'"
    }

    $fieldsQuery = @'
query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      fields(first: 100) {
        nodes {
          ... on ProjectV2FieldCommon {
            id
            name
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}
'@

    $fieldsJson = Invoke-Gh -Arguments @(
        "api", "graphql",
        "-f", "query=$fieldsQuery",
        "-F", "projectId=$($project.id)"
    )

    $fields = @((ConvertFrom-JsonText -Json $fieldsJson).data.node.fields.nodes)
    $statusField = $fields | Where-Object { $_.name -eq "Status" -and $null -ne $_.options } | Select-Object -First 1
    if ($null -eq $statusField) {
        throw "Le champ Project 'Status' est introuvable ou n'est pas un champ à sélection unique."
    }

    $doneOption = $statusField.options | Where-Object { $_.name -eq "Done" } | Select-Object -First 1
    if ($null -eq $doneOption) {
        throw "L'option 'Done' est introuvable dans le champ Project 'Status'."
    }

    Write-Step -Kind "PROJECT" -Message "Projet utilisé : $($project.title)"
    return @{
        Id            = $project.id
        Title         = $project.title
        StatusFieldId = $statusField.id
        DoneOptionId  = $doneOption.id
    }
}

function Get-ProjectItems {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Project
    )

    $itemsByIssueId = @{}
    $cursor = $null
    $hasNextPage = $true

    while ($hasNextPage) {
        $itemsQuery = @'
query($projectId: ID!, $after: String) {
  node(id: $projectId) {
    ... on ProjectV2 {
      items(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          content {
            ... on Issue {
              id
              title
              url
            }
          }
        }
      }
    }
  }
}
'@

        $arguments = @(
            "api", "graphql",
            "-f", "query=$itemsQuery",
            "-F", "projectId=$($Project.Id)"
        )

        if ($null -ne $cursor) {
            $arguments += "-F"
            $arguments += "after=$cursor"
        }

        $itemsJson = Invoke-Gh -Arguments $arguments
        $itemsPage = (ConvertFrom-JsonText -Json $itemsJson).data.node.items

        foreach ($item in @($itemsPage.nodes)) {
            if ($null -ne $item.content -and $null -ne $item.content.id -and -not $itemsByIssueId.ContainsKey($item.content.id)) {
                $itemsByIssueId[$item.content.id] = $item
            }
        }

        $hasNextPage = [bool]$itemsPage.pageInfo.hasNextPage
        $cursor = $itemsPage.pageInfo.endCursor
    }

    return $itemsByIssueId
}

function Ensure-ProjectItem {
    param(
        [Parameter(Mandatory = $true)]$Issue,
        [Parameter(Mandatory = $true)][hashtable]$Project,
        [Parameter(Mandatory = $true)][hashtable]$ProjectItems
    )

    if ($null -eq $Issue.id) {
        $Summary.ProjectCardsAdded++
        Write-Step -Kind "PROJECT" -Message "Ajout simulé après création de l'issue : $($Issue.title)"
        return [pscustomobject]@{
            id    = $null
            title = $Issue.title
        }
    }

    if ($ProjectItems.ContainsKey($Issue.id)) {
        $Summary.ProjectCardsExisting++
        Write-Step -Kind "PROJECT" -Message "Carte déjà présente : $($Issue.title)"
        return $ProjectItems[$Issue.id]
    }

    if ($DryRun) {
        $Summary.ProjectCardsAdded++
        Write-Step -Kind "PROJECT" -Message "Ajout au projet simulé : $($Issue.title)"
        return [pscustomobject]@{
            id    = $null
            title = $Issue.title
        }
    }

    $mutation = @'
mutation($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
    item {
      id
    }
  }
}
'@

    $itemJson = Invoke-Gh -Arguments @(
        "api", "graphql",
        "-f", "query=$mutation",
        "-F", "projectId=$($Project.Id)",
        "-F", "contentId=$($Issue.id)"
    )

    $item = (ConvertFrom-JsonText -Json $itemJson).data.addProjectV2ItemById.item
    $ProjectItems[$Issue.id] = $item
    $Summary.ProjectCardsAdded++
    Write-Step -Kind "PROJECT" -Message "Carte ajoutée : $($Issue.title)"
    return $item
}

function Set-ProjectItemDone {
    param(
        [Parameter(Mandatory = $true)]$Item,
        [Parameter(Mandatory = $true)]$Issue,
        [Parameter(Mandatory = $true)][hashtable]$Project
    )

    if ($DryRun -or $null -eq $Item.id) {
        $Summary.StatusesSetDone++
        Write-Step -Kind "STATUS" -Message "Positionnement sur Done simulé : $($Issue.title)"
        return
    }

    $mutation = @'
mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: $projectId
      itemId: $itemId
      fieldId: $fieldId
      value: {
        singleSelectOptionId: $optionId
      }
    }
  ) {
    projectV2Item {
      id
    }
  }
}
'@

    Invoke-Gh -Arguments @(
        "api", "graphql",
        "-f", "query=$mutation",
        "-F", "projectId=$($Project.Id)",
        "-F", "itemId=$($Item.id)",
        "-F", "fieldId=$($Project.StatusFieldId)",
        "-f", "optionId=$($Project.DoneOptionId)"
    ) | Out-Null

    $Summary.StatusesSetDone++
    Write-Step -Kind "STATUS" -Message "Positionné sur Done : $($Issue.title)"
}

function Assert-HistoricalIssues {
    param(
        [Parameter(Mandatory = $true)]$Issues
    )

    $requiredProperties = @("title", "body", "labels", "status", "category", "evidence")
    $authorizedLabels = @(
        "historical",
        "backend",
        "frontend",
        "feature",
        "authentication",
        "database",
        "testing",
        "devops",
        "ci-cd",
        "quality",
        "security",
        "deployment",
        "documentation"
    )
    $titles = @{}

    foreach ($issue in $Issues) {
        foreach ($property in $requiredProperties) {
            if (-not ($issue.PSObject.Properties.Name -contains $property)) {
                throw "Ticket historique invalide : propriété manquante '$property'."
            }
        }

        if ([string]::IsNullOrWhiteSpace($issue.title)) {
            throw "Ticket historique invalide : titre vide."
        }

        if ($titles.ContainsKey($issue.title)) {
            throw "Ticket historique dupliqué dans le fichier JSON : $($issue.title)"
        }
        $titles[$issue.title] = $true

        if ($issue.status -ne "Done") {
            throw "Ticket historique invalide : le statut attendu est 'Done' pour '$($issue.title)'."
        }

        $labels = @($issue.labels)
        if ($labels.Count -eq 0) {
            throw "Ticket historique invalide : aucun label pour '$($issue.title)'."
        }

        if ($labels -notcontains "historical") {
            throw "Ticket historique invalide : le label 'historical' est requis pour '$($issue.title)'."
        }

        foreach ($label in $labels) {
            if ($authorizedLabels -notcontains $label) {
                throw "Ticket historique invalide : label non autorisé '$label' pour '$($issue.title)'."
            }
        }
    }
}

function Get-HistoricalIssues {
    if (-not (Test-Path -Path $HistoricalIssuesPath)) {
        throw "Fichier historique introuvable : $HistoricalIssuesPath"
    }

    $json = Get-Content -Path $HistoricalIssuesPath -Raw -Encoding UTF8
    $issues = @(ConvertFrom-JsonText -Json $json)
    Assert-HistoricalIssues -Issues $issues

    return $issues
}

function Process-McoIssues {
    param(
        [Parameter(Mandatory = $true)][hashtable]$ExistingLabels,
        [Parameter(Mandatory = $true)][hashtable]$ExistingIssues
    )

    $labels = @(
        "mco",
        "monitoring",
        "documentation",
        "incident",
        "testing",
        "deployment",
        "maintenance",
        "priority: high",
        "priority: medium"
    )

    foreach ($label in $labels) {
        Ensure-Label -Name $label -ExistingLabels $ExistingLabels
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
        $Summary.TicketsAnalyzed++
        Ensure-Issue -Title $issue.Title -Body $issue.Body -Labels $issue.Labels -ExistingIssues $ExistingIssues | Out-Null
    }
}

function Process-HistoricalIssues {
    param(
        [Parameter(Mandatory = $true)][hashtable]$ExistingLabels,
        [Parameter(Mandatory = $true)][hashtable]$ExistingIssues
    )

    $historicalIssues = Get-HistoricalIssues
    Write-Step -Kind "VALIDATION" -Message "$($historicalIssues.Count) tickets historiques valides dans project/historical-issues.json"

    $historicalLabels = @($historicalIssues | ForEach-Object { $_.labels } | Sort-Object -Unique)
    foreach ($label in $historicalLabels) {
        Ensure-Label -Name $label -ExistingLabels $ExistingLabels
    }

    $project = Get-ProjectContext
    $projectItems = Get-ProjectItems -Project $project

    foreach ($historicalIssue in $historicalIssues) {
        $Summary.TicketsAnalyzed++
        $issue = Ensure-Issue `
            -Title $historicalIssue.title `
            -Body $historicalIssue.body `
            -Labels @($historicalIssue.labels) `
            -ExistingIssues $ExistingIssues

        $projectItem = Ensure-ProjectItem -Issue $issue -Project $project -ProjectItems $projectItems
        Set-ProjectItemDone -Item $projectItem -Issue $issue -Project $project
    }
}

try {
    Assert-Prerequisites

    Write-Host ""
    Write-Host "Configuration du backlog GitHub MCO pour $Repository"
    Write-Host "------------------------------------------------"

    if ($DryRun) {
        Write-Step -Kind "MODE" -Message "Dry run actif : aucune écriture GitHub ne sera effectuée."
    }

    if ($HistoricalOnly) {
        Write-Step -Kind "MODE" -Message "Import historique uniquement."
    }

    $existingLabels = Get-ExistingLabels
    $existingIssues = Get-ExistingIssues

    if (-not $HistoricalOnly) {
        Process-McoIssues -ExistingLabels $existingLabels -ExistingIssues $existingIssues
    }

    Process-HistoricalIssues -ExistingLabels $existingLabels -ExistingIssues $existingIssues
}
catch {
    $Summary.Errors++
    Write-Error $_
    exit 1
}
finally {
    Write-Host ""
    Write-Host "Bilan"
    Write-Host "-----"
    Write-Host "Tickets analysés : $($Summary.TicketsAnalyzed)"
    Write-Host "Tickets créés : $($Summary.TicketsCreated)"
    Write-Host "Tickets déjà existants : $($Summary.TicketsExisting)"
    Write-Host "Cartes ajoutées au projet : $($Summary.ProjectCardsAdded)"
    Write-Host "Cartes déjà présentes : $($Summary.ProjectCardsExisting)"
    Write-Host "Statuts positionnés sur Done : $($Summary.StatusesSetDone)"
    Write-Host "Erreurs : $($Summary.Errors)"
    Write-Host ""
    Write-Host "Consultez les issues : https://github.com/$Repository/issues"
}
