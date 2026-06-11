# CESIZen — API

API REST de l'application CESIZen, dédiée à la santé mentale et à la gestion du stress. Elle expose les ressources consommées par l'application mobile (grand public) et le back-office web (administration).

## Stack technique

- **Node.js 22** / **Express 5**
- **TypeScript**
- **Prisma ORM** (PostgreSQL 16)
- **JWT** pour l'authentification (jsonwebtoken)
- **bcryptjs** pour le hachage des mots de passe
- **Joi** pour la validation des entrées
- **Nodemailer** pour l'envoi d'e-mails (réinitialisation de mot de passe)
- **Docker Compose** pour l'orchestration

## Architecture

```
src/
├── config/
│   └── prisma.ts          Client Prisma (singleton)
├── controllers/           Logique métier des routes
├── middlewares/           Authentification, autorisation, validation Joi
├── models/                Accès aux données via Prisma
├── routes/                Définition des endpoints
├── services/              Services externes (e-mail)
├── utils/                 Helpers (conversion snake_case, types)
└── index.ts               Point d'entrée
prisma/
├── schema.prisma          Modèle de données
└── seed.ts                Jeu de données initial
```

## Modèle de données

L'API repose sur six tables :

| Table | Rôle |
|---|---|
| `users` | Comptes utilisateurs (rôle USER/ADMIN, statut ACTIF/DESACTIVE) |
| `reset_tokens` | Jetons de réinitialisation de mot de passe (hachés en SHA-256) |
| `categories` | Catégories de contenus |
| `contents` | Contenus informatifs (statut BROUILLON/PUBLIE) |
| `contents_categories` | Table de jonction (relation N:N contenus ↔ catégories) |
| `breathing_presets` | Exercices de respiration configurables |

## Prérequis

- Docker et Docker Compose
- Node.js 22 (uniquement pour le développement hors conteneur)

## Configuration

Créer un fichier `.env` à la racine à partir du modèle fourni :

```bash
cp .env.example .env
```

Variables principales :

| Variable | Description |
|---|---|
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Identifiants PostgreSQL |
| `DATABASE_URL` | URL de connexion Prisma |
| `JWT_SECRET` | Clé secrète de signature des tokens |
| `JWT_EXPIRES_IN` | Durée de validité des tokens (ex. `1h`) |
| `RESET_TOKEN_EXPIRES_MINUTES` | Durée de validité d'un jeton de réinitialisation |
| `RESET_PASSWORD_URL` | Lien (deep link) inclus dans l'e-mail de réinitialisation |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Configuration SMTP (Mailtrap) |

## Démarrage

### Avec Docker (recommandé)

```bash
docker compose up --build
```

Au démarrage, le conteneur applique le schéma à la base (`prisma db push`), insère le jeu de données initial, puis lance l'API.

L'API est exposée sur **http://localhost:3546**.
L'interface Adminer est disponible sur **http://localhost:8080**.

### En développement local

```bash
npm install
docker compose up -d database     # démarre uniquement PostgreSQL
npm run db:push                   # crée les tables
npm run db:seed                   # insère les données de démonstration
npm run dev                       # API en rechargement à chaud
```

## Scripts disponibles

| Script | Description |
|---|---|
| `npm run dev` | Démarrage en mode développement (rechargement à chaud) |
| `npm run build` | Compilation TypeScript vers `dist/` |
| `npm start` | Démarrage de la version compilée |
| `npm run db:push` | Synchronisation du schéma Prisma avec la base |
| `npm run db:seed` | Insertion du jeu de données initial |
| `npm run db:reset` | Réinitialisation complète de la base puis seed |
| `npm run prisma:studio` | Interface visuelle d'exploration de la base |
| `npm test` | Exécution de la suite de tests |

## Comptes de démonstration

Créés automatiquement par le seed :

| E-mail | Mot de passe | Rôle |
|---|---|---|
| admin@cesizen.fr | Admin1234! | ADMIN |
| user@cesizen.fr | User1234! | USER |

## Points d'entrée principaux

### Authentification

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Inscription |
| POST | `/api/auth/login` | Public | Connexion (retourne un JWT) |
| GET | `/api/auth/me` | Authentifié | Profil de l'utilisateur courant |
| POST | `/api/auth/logout` | Authentifié | Déconnexion |
| POST | `/api/auth/forgot-password` | Public | Demande de réinitialisation |
| POST | `/api/auth/reset-password` | Public | Réinitialisation via jeton |

### Utilisateurs

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/users` | Admin |
| GET | `/api/users/:id` | Authentifié |
| PUT | `/api/users/:id` | Admin |
| PATCH | `/api/users/:id/disable` | Admin |
| DELETE | `/api/users/:id` | Admin |

### Contenus

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/contents` | Public (contenus publiés) |
| GET | `/api/contents/:id` | Public (contenus publiés) |
| GET | `/api/admin/contents` | Admin |
| POST | `/api/admin/contents` | Admin |
| PUT | `/api/admin/contents/:id` | Admin |
| DELETE | `/api/admin/contents/:id` | Admin |

### Catégories

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/categories` | Public |
| GET | `/api/categories/:id` | Public |
| POST | `/api/admin/categories` | Admin |
| PUT | `/api/admin/categories/:id` | Admin |
| DELETE | `/api/admin/categories/:id` | Admin |

### Exercices de respiration

| Méthode | Endpoint | Accès |
|---|---|---|
| GET | `/api/presets` | Public (presets actifs) |
| GET | `/api/presets/:id` | Public (presets actifs) |
| GET | `/api/admin/presets` | Admin |
| POST | `/api/admin/presets` | Admin |
| PUT | `/api/admin/presets/:id` | Admin |
| DELETE | `/api/admin/presets/:id` | Admin |

## Sécurité

- Les mots de passe sont hachés avec bcrypt (coût 12).
- Les jetons de réinitialisation sont stockés sous forme de hachage SHA-256 ; le jeton en clair n'est jamais conservé en base.
- Les routes protégées vérifient un JWT signé via un middleware d'authentification ; les routes d'administration exigent en plus le rôle ADMIN.
- Toutes les requêtes sont paramétrées par Prisma, ce qui prévient les injections SQL.

## Tests

La suite de tests (Jest) couvre la validation Joi, le hachage, la génération de jetons et le comportement des middlewares.

```bash
npm test
```

## Licence

Projet réalisé dans le cadre de la formation Concepteur Développeur d'Applications (CESI).
