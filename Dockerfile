# syntax=docker/dockerfile:1

# ---- Build stage -----------------------------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first so the layer is cached across source changes.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Source maps are not needed in the shipped image and would leak source.
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production

RUN npm run build

# ---- Runtime stage ---------------------------------------------------------
FROM nginxinc/nginx-unprivileged:1.25-alpine AS runtime

# The unprivileged image runs as uid 101 and listens on 8080.
COPY --from=builder /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
