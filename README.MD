# README API — CESIZen

## Stack

- Node.js
- Express
- PostgreSQL
- Docker

## Fonctionnalités gérées

- inscription
- connexion / déconnexion
- récupération du profil courant
- mot de passe oublié
- réinitialisation du mot de passe
- gestion des contenus
- gestion des comptes
- récupération des presets de respiration

## Prérequis

- Docker Desktop
- Node.js LTS
- npm

## Installation

```bash
cd api
npm install
```

Créer un fichier `.env` :

```env
PORT=3546
DB_HOST=db
DB_PORT=5432
DB_NAME=cesizen
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-me
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-pass
MAIL_FROM=no-reply@cesizen.local
RESET_PASSWORD_URL=exp://IP_DU_PC:8081/--/reset-password
```

## Lancement avec Docker

```bash
docker compose up --build
```

## Structure conseillée

```txt
src/
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  data/
  app.js
  server.js
```

## Endpoints principaux attendus

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Contenus

- `GET /api/contents/public`
- `GET /api/contents/public/:id`
- `POST /api/admin/contents`
- `PUT /api/admin/contents/:id`
- `PATCH /api/admin/contents/:id/status`

### Comptes admin

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `DELETE /api/admin/users/:id`

### Respiration

- `GET /api/breathing/presets`

## Bonnes pratiques retenues

- mot de passe stocké hashé
- token de reset hashé en base
- invalidation des anciens tokens de reset
- séparation claire routes / contrôleurs / services
- middleware d’authentification et middleware admin
- variables sensibles via `.env`

## Vérifications rapides

- l’API répond sur le port exposé
- la base PostgreSQL est joignable
- la route `forgot-password` envoie bien un email Mailtrap
- les routes admin refusent les comptes non administrateurs
