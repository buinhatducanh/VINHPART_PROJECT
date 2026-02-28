# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY backend/prisma ./backend/prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema backend/prisma/schema.prisma

# Build the frontend application
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets and necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/uploads ./uploads

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 3001

# Run the backend server
CMD ["npm", "run", "db:api"]
