# ---------- Build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Variáveis Vite são "bakeadas" no build — defina estas no Coolify
# em Build Variables (não Runtime Environment Variables):
#   VITE_BASE44_APP_ID
#   VITE_BASE44_APP_BASE_URL  (ex.: https://entrevista.seu-dominio.com)
#   VITE_BASE44_FUNCTIONS_VERSION  (opcional)
ARG VITE_BASE44_APP_ID
ARG VITE_BASE44_APP_BASE_URL
ARG VITE_BASE44_FUNCTIONS_VERSION
ENV VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID
ENV VITE_BASE44_APP_BASE_URL=$VITE_BASE44_APP_BASE_URL
ENV VITE_BASE44_FUNCTIONS_VERSION=$VITE_BASE44_FUNCTIONS_VERSION

RUN npm run build

# ---------- Serve ----------
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]