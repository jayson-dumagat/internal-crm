# syntax=docker/dockerfile:1

# ------------------------------------
# Build the Vite application
# ------------------------------------
FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=/api

ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build


# ------------------------------------
# Serve the built frontend internally
# ------------------------------------
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

RUN npm install --global serve@14

COPY --from=build /app/dist ./dist

USER node

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]