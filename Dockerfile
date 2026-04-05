# --- Frontend Build Stage ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Backend Build Stage ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# --- Final Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl

# Copy backend files
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build results
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

# Use a direct shell command to ensure everything is found and executed
CMD sh -c "cd /app/backend && npx prisma db push --accept-data-loss && node dist/index.js"
