# CESIZen API

API REST du projet CESIZen — application de santé mentale et de gestion du stress.

## Stack

- **Node.js 22** (image Docker `node:22-bookworm-slim`)
- **Express 5**
- **PostgreSQL 16** (conteneur Docker)
- **Docker Compose** (API + BDD + Adminer)
- **bcryptjs** — hachage des mots de passe (12 rounds)
- **jsonwebtoken** — authentification JWT
- **Joi** — validation des entrées
- **Nodemailer** — envoi d'emails (Mailtrap en dev)
- **pg** — driver PostgreSQL (requêtes SQL brutes, pas d'ORM)

## Fonctionnalités

- Inscription / connexion / déconnexion (JWT)
- Récupération du profil courant (`/api/auth/me`)
- Mot de passe oublié + réinitialisation (token hashé SHA-256, envoi email)
- CRUD utilisateurs (admin)
- Désactivation logique des comptes (statut ACTIF / DESACTIVE)
- CRUD contenus d'information avec statut BROUILLON / PUBLIE
- CRUD catégories + association N:N avec les contenus
- CRUD presets de respiration (admin) + consultation publique des presets actifs

## Prérequis

- Docker Desktop (avec Docker Compose)
- Node.js 22 LTS
- npm

## Installation

```bash
git clone https://github.com/AmauryCESIZen/cesizen-api.git
cd cesizen-api
cp .env.example .env
```

Remplir le fichier `.env` :

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=cesizen
DB_HOST=database
DB_PORT=5432
PORT=3001
JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
RESET_TOKEN_EXPIRES_MINUTES=60
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-pass
MAIL_FROM=no-reply@cesizen.local
RESET_PASSWORD_URL=exp://IP_DU_PC:8081/--/reset-password
```

## Lancement

```bash
docker compose up --build
```

Cela démarre 3 conteneurs :

| Service | Port | Description |
|---------|------|-------------|
| `cesizen-api` | `3546` | API Express |
| `cesizen-db` | `5432` | PostgreSQL 16 |
| `cesizen-adminer` | `8080` | Interface Adminer |

Au premier lancement, `schema.sql` crée automatiquement les tables via `initDb()`.

Pour charger les données de test :

```bash
npm run db:seed
```

Comptes de seed : `admin@cesizen.fr` (ADMIN) et `user@cesizen.fr` (USER).

## Tests

```bash
npm install --save-dev jest @jest/globals
npm test
```

16 tests unitaires (Jest) couvrant la validation Joi, le hachage bcrypt et la génération JWT.

```bash
npm test -- --coverage
```

## Structure du projet

```
src/
├── config/          # Connexion PostgreSQL (pg Pool)
├── controllers/     # Logique métier (auth, user, content, category, preset)
├── data/            # schema.sql, seed.sql, initDb.js, seedDb.js
├── middlewares/      # auth (JWT), validators (Joi), errorHandler
├── models/          # Requêtes SQL (services par entité)
├── routes/          # Définition des endpoints Express
├── services/        # Envoi d'emails (Nodemailer)
└── index.js         # Point d'entrée
```

## Endpoints

### Auth

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Inscription |
| POST | `/api/auth/login` | — | Connexion |
| GET | `/api/auth/me` | JWT | Profil courant |
| POST | `/api/auth/logout` | JWT | Déconnexion |
| POST | `/api/auth/forgot-password` | — | Demande de reset |
| POST | `/api/auth/reset-password` | — | Réinitialisation MDP |

### Utilisateurs

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/users` | — | Créer un utilisateur |
| GET | `/api/users` | Admin | Lister tous les utilisateurs |
| GET | `/api/users/:id` | — | Détail d'un utilisateur |
| PUT | `/api/users/:id` | Admin | Modifier un utilisateur |
| PATCH | `/api/users/:id/disable` | Admin | Désactiver un compte |
| DELETE | `/api/users/:id` | Admin | Supprimer un compte |

### Contenus

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/contents` | — | Contenus publiés (public) |
| GET | `/api/contents/:id` | — | Détail d'un contenu publié |
| GET | `/api/admin/contents` | Admin | Tous les contenus |
| GET | `/api/admin/contents/:id` | Admin | Détail (admin) |
| POST | `/api/admin/contents` | Admin | Créer un contenu |
| PUT | `/api/admin/contents/:id` | Admin | Modifier un contenu |
| DELETE | `/api/admin/contents/:id` | Admin | Supprimer un contenu |

### Catégories

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/categories` | — | Lister les catégories |
| GET | `/api/categories/:id` | — | Détail d'une catégorie |
| POST | `/api/admin/categories` | Admin | Créer une catégorie |
| PUT | `/api/admin/categories/:id` | Admin | Modifier une catégorie |
| DELETE | `/api/admin/categories/:id` | Admin | Supprimer une catégorie |

### Presets de respiration

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/presets` | — | Presets actifs (public) |
| GET | `/api/presets/:id` | — | Détail d'un preset actif |
| GET | `/api/admin/presets` | Admin | Tous les presets |
| GET | `/api/admin/presets/:id` | Admin | Détail (admin) |
| POST | `/api/admin/presets` | Admin | Créer un preset |
| PUT | `/api/admin/presets/:id` | Admin | Modifier un preset |
| DELETE | `/api/admin/presets/:id` | Admin | Supprimer un preset |

## Sécurité

- Mots de passe hashés avec bcryptjs (12 rounds)
- Tokens de réinitialisation hashés en SHA-256 (le token brut n'est jamais stocké)
- Invalidation des anciens tokens avant chaque nouvelle demande de reset
- Authentification par JWT (Bearer token)
- Middleware `requireAdmin` pour les routes d'administration
- Validation des entrées avec Joi sur chaque route
- Variables sensibles dans `.env` (jamais versionnées)
