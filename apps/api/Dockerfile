# Build from the monorepo root: `docker build -f apps/api/Dockerfile .`
# ---------- Base ----------
FROM node:20-bookworm-slim AS base
WORKDIR /repo
ENV CI=true
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

# ---------- Development ----------
FROM base AS development
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN --mount=type=cache,target=/root/.npm npm install --workspaces --include-workspace-root --no-audit --fund=false
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev", "-w", "apps/api"]

# ---------- Production deps ----------
FROM base AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN --mount=type=cache,target=/root/.npm npm install --workspaces --include-workspace-root --no-audit --fund=false
COPY apps/api ./apps/api
RUN npm prune --omit=dev --workspaces

# ---------- Production ----------
FROM node:20-bookworm-slim AS production
WORKDIR /repo
ENV NODE_ENV=production
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=build /repo/package*.json ./
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build --chown=app:app /repo/apps/api ./apps/api
USER app
EXPOSE 5000
WORKDIR /repo/apps/api
CMD ["node", "index.js"]
