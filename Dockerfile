# ── Frontend build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ .
RUN yarn build

# ── Backend ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS backend
WORKDIR /app

RUN addgroup app && adduser -S -G app app

COPY backend/package.json backend/yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --chown=app:app backend/ .

# Serve the built frontend from the backend's static directory
COPY --from=frontend-build --chown=app:app /app/frontend/dist ./public

USER app

EXPOSE 5000

CMD ["yarn", "start"]
