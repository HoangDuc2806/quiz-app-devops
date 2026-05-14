# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root .env.example for build context
COPY .env.example .env.example

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Build args for Vite env vars
ARG VITE_API_BASE_URL=http://localhost:3001
ARG VITE_SUPABASE_URL=""
ARG VITE_SUPABASE_ANON_KEY=""

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# nginx config for SPA routing
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { try_files $uri $uri/ /index.html; } \
  location /api/ { proxy_pass http://backend:3001; proxy_http_version 1.1; proxy_set_header Host $host; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
