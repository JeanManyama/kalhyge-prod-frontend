# Je définis une image de base pour mon conteneur
FROM node:20-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Je définis le dossier racine où seront stockés les fichiers de mon application
WORKDIR /app

# Je vais vouloir installer les dépendences, je vais donc copier les fichiers package.json et package-lock.json
COPY package*.json ./

# J'installe les dépendences
RUN pnpm install

# Je copie le reste des fichiers de mon application
COPY . .

# Je définis le port sur lequel mon application va tourner
EXPOSE 5173

# Je définis la commande qui sera exécutée lorsque le conteneur sera lancé
CMD ["pnpm", "run", "dev"]
