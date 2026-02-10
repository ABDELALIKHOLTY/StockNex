FROM node:22-alpine

WORKDIR /app

# Mettre à jour les index Alpine et installer les dépendances OpenSSL
RUN for i in 1 2 3; do apk update && apk add --no-cache openssl && break || sleep 2; done

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le reste du code source
COPY src ./src/

# Générer le client Prisma et compiler TypeScript
RUN npx prisma generate
RUN npm run build

# Exposer le port
EXPOSE 4000

# Commande pour démarrer l'application avec les migrations
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]