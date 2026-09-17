# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the app (Vite produces static files in dist/)
# VITE_BASE44_APP_ID is required at build time
ARG VITE_BASE44_APP_ID
ENV VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID

ARG VITE_BASE44_FUNCTIONS_VERSION
ENV VITE_BASE44_FUNCTIONS_VERSION=$VITE_BASE44_FUNCTIONS_VERSION

ARG VITE_BASE44_APP_BASE_URL
ENV VITE_BASE44_APP_BASE_URL=$VITE_BASE44_APP_BASE_URL

RUN npm run build

# ===== Stage 2: Serve =====
FROM nginx:alpine

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]