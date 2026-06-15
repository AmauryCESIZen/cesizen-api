FROM node:22-bookworm-slim

# OpenSSL nécessaire pour Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Package + Prisma schema d'abord (cache npm si pas de change)
COPY package*.json ./
COPY prisma ./prisma

# Installation des dépendances
RUN npm ci

# Génération du client Prisma
RUN npx prisma generate

# Source TypeScript
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript → dist/
RUN npm run build

# Vérification stricte que le build a produit le bon fichier
RUN ls -la dist/ \
 && test -f dist/index.js \
 || (echo "ERROR: dist/index.js not generated" && exit 1)

EXPOSE 3001

# Au démarrage :
# 1. db push : crée/met à jour les tables sans migration formelle
# 2. db seed : insère les comptes admin/user, catégories, contenus, presets (|| true si déjà fait)
# 3. lance l'app compilée
CMD ["sh", "-c", "npx prisma migrate deploy && (npx prisma db seed || true) && node dist/index.js"]
