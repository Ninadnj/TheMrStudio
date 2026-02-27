FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build client + server
RUN npm run build

# --- Production stage ---
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built output
COPY --from=builder /app/dist ./dist

# Copy shared schema (needed at runtime by drizzle)
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle.config.ts ./

# Create storage directory
RUN mkdir -p .local/storage/uploads

EXPOSE 5002

ENV NODE_ENV=production
ENV PORT=5002

CMD ["node", "dist/index.js"]
