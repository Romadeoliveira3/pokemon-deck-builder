# Estágio de build principal
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de produção (Full Stack)
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o necessário para rodar o servidor
COPY package*.json ./
RUN npm install --omit=dev

# Copia o build do frontend e o código do servidor
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3000 3001

# No modo produção, rodamos apenas o servidor node que deve servir o frontend ou a API
CMD ["npm", "run", "server"]
