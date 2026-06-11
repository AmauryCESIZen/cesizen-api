# Guide de contribution — CESIZen

Ce document décrit les règles de gestion des sources et de versioning du projet CESIZen.

## Stratégie de branches (GitFlow simplifié)

| Branche | Rôle |
|---|---|
| `main` | Production. Code stable et testé uniquement. Chaque livraison est marquée par un tag de version. |
| `develop` | Intégration. Branche de travail principale où les fonctionnalités sont assemblées. |
| `feature/*` | Développement d'une nouvelle fonctionnalité (ex. `feature/tracker-emotions`). |
| `fix/*` | Correction d'un bug non urgent (ex. `fix/login-validation`). |
| `hotfix/*` | Correction urgente appliquée directement depuis `main`. |

### Flux de travail standard

1. Se placer sur `develop` et la mettre à jour : `git checkout develop && git pull`
2. Créer une branche de fonctionnalité : `git checkout -b feature/ma-fonctionnalite`
3. Développer et committer en suivant les conventions ci-dessous.
4. Pousser la branche : `git push -u origin feature/ma-fonctionnalite`
5. Ouvrir une Pull Request vers `develop`.
6. Attendre que l'intégration continue (CI) passe au vert.
7. Merger la Pull Request, puis supprimer la branche.

### Mise en production

Quand `develop` est stable et validé :

1. Ouvrir une Pull Request de `develop` vers `main`.
2. Merger après validation de la CI.
3. Créer un tag de version : `git tag -a v1.1.0 -m "Version 1.1.0" && git push origin v1.1.0`

## Convention de nommage des commits (Conventional Commits)

Format : `type(portée): description`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `test` | Ajout ou modification de tests |
| `refactor` | Refonte du code sans changement de comportement |
| `chore` | Tâche technique (dépendances, configuration) |
| `ci` | Configuration de l'intégration continue |

### Exemples

```
feat(auth): ajout de la réinitialisation du mot de passe
fix(contents): correction de l'affichage des brouillons côté public
docs(readme): mise à jour du guide d'installation
test(presets): ajout des tests unitaires de validation
ci(api): ajout du workflow de tests automatiques
```

## Versioning sémantique

Les versions suivent le format `MAJEUR.MINEUR.CORRECTIF` (ex. `v1.2.3`) :

- **MAJEUR** : changement incompatible avec les versions précédentes.
- **MINEUR** : ajout de fonctionnalité rétrocompatible.
- **CORRECTIF** : correction de bug rétrocompatible.
