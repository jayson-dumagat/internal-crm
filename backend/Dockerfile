# syntax=docker/dockerfile:1

# ------------------------------------
# Install all dependencies
# ------------------------------------
FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci


# ------------------------------------
# Compile TypeScript
# ------------------------------------
FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

RUN npm run build

RUN npm prune --omit=dev


# ------------------------------------
# Run the compiled backend
# ------------------------------------
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nodeapp

COPY --from=build --chown=nodeapp:nodejs /app/package*.json ./
COPY --from=build --chown=nodeapp:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodeapp:nodejs /app/dist ./dist

USER nodeapp

EXPOSE 5000

CMD ["node", "dist/index.js"]