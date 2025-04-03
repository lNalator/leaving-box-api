# Etape 1 : construction de l'application
FROM node:16-alpine AS builder
WORKDIR /usr/src/app

# Copier les fichiers de dépendances et installer les packages
COPY package*.json ./
RUN npm install

# Copier le reste de l'application et construire (compiler) l'application NestJS
COPY . .
RUN npm run build

# Etape 2 : image finale en production
FROM node:16-alpine
WORKDIR /usr/src/app

# Copier uniquement les fichiers de dépendances pour installer les packages en production
COPY package*.json ./
RUN npm install --only=production

# Copier le répertoire dist (résultat de la compilation) depuis l'étape builder
COPY --from=builder /usr/src/app/dist ./dist
# COPY ./environment/.env.prod ./environment/.env.dev 

# Exposer le port sur lequel l'application écoute
EXPOSE 3030

# Démarrer l'application
CMD ["node", "dist/main.js"]
