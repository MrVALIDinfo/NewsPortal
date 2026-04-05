# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# Script to run migrations and start the server
RUN echo '#!/bin/sh\nnpx prisma db push --accept-data-loss\nnode dist/index.js' > start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]
