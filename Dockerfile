# Estágio de desenvolvimento / build
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Estágio de desenvolvimento
FROM base AS development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Estágio de build para produção
FROM base AS build
RUN npm run build

# Estágio de produção final
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
