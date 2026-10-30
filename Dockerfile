# Build context: the repo root (docker build -t ai-agent-sso-cms .)
# Node is only needed to build. The runtime image is nginx serving the static build,
# so each frontend pins its own Node version here without anything installed on the server.
# CI passes NODE_VERSION from source/.nvmrc; keep the default below in sync with it.
ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine AS builder
# Which source/env/.<name> file the build bakes in (dev | beta | staging | production)
ARG BUILD_ENV=dev
# No git hooks inside the image
ENV HUSKY=0
WORKDIR /app

COPY source/package.json source/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY source/ ./
RUN npm run build:${BUILD_ENV}

FROM nginx:1.27-alpine
COPY dev-ops/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
