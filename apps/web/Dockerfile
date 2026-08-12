# Build from the monorepo root: `docker build -f apps/web/Dockerfile .`
# ---------- Base ----------
FROM node:20-bookworm-slim AS base
WORKDIR /repo
ENV CI=true

# ---------- Development ----------
FROM base AS development
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN --mount=type=cache,target=/root/.npm npm install --workspaces --include-workspace-root --no-audit --fund=false
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "-w", "apps/web", "--", "--host"]

# ---------- Build ----------
FROM base AS build
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN --mount=type=cache,target=/root/.npm npm install --workspaces --include-workspace-root --no-audit --fund=false
COPY packages/typescript-config ./packages/typescript-config
COPY apps/web ./apps/web
RUN npm run build -w apps/web

# ---------- Production (static via nginx) ----------
FROM nginx:1.27-alpine AS production
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
