# syntax=docker/dockerfile:1

FROM node:18-slim AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
