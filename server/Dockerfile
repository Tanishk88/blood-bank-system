# Stage 1: Build & Dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=base /app/node_modules ./node_modules
COPY . .

USER nodejs

# Cloud Run defaults to PORT 8080 or process.env.PORT
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "src/index.js"]
