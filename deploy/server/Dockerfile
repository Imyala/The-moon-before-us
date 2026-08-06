# Multi-stage build for @moon/server, run from the REPO ROOT:
#   docker build -f deploy/server/Dockerfile -t moon-server .
#
# This must be built from the repo root (not deploy/server/) because it's an
# npm workspaces project: @moon/server depends on @moon/shared via "*".
#
# NOTE on @moon/shared resolution: packages/shared/package.json points
# "main"/"types" at src/index.ts on purpose, so `npm run dev:server` (which
# runs under tsx, a TS-aware loader) picks up live edits with no build step.
# Plain `node` can't resolve a .ts main field though, so this Dockerfile
# patches a *copy* of that package.json to point at dist/ for the runtime
# image only — the source file in the repo (and your local dev workflow)
# is untouched. Verified locally: without this patch, `node dist/index.js`
# fails with ERR_MODULE_NOT_FOUND resolving "@moon/shared".

# ---- deps + build ----------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# better-sqlite3 compiles a native addon; python3/make/g++ are required.
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/client/package.json packages/client/package.json
RUN npm ci

COPY packages/shared packages/shared
COPY packages/server packages/server
RUN npm run build -w @moon/shared
RUN npm run build -w @moon/server

# Point @moon/shared's package.json at its compiled output for this image
# only (see note above) — must happen AFTER both builds, which rely on the
# original src-pointing package.json for TypeScript's type resolution.
RUN node -e " \
  const fs = require('fs'); \
  const p = 'packages/shared/package.json'; \
  const j = JSON.parse(fs.readFileSync(p)); \
  j.main = 'dist/index.js'; \
  j.types = 'dist/index.d.ts'; \
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n'); \
"

# Prune to production-only node_modules (keeps the native better-sqlite3 build).
RUN npm prune --omit=dev

# ---- runtime ----------------------------------------------------------------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ENV MOON_DB_PATH=/data/moon.sqlite

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/server/dist ./packages/server/dist
COPY --from=build /app/packages/server/package.json ./packages/server/package.json

# SQLite lives on a mounted volume so character data survives redeploys.
VOLUME ["/data"]
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "packages/server/dist/index.js"]
