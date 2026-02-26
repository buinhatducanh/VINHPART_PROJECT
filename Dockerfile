# Stage 1: Builder
# Use a specific node version for reproducibility
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build tools like vite and tsx)
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the frontend application
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built assets and necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/uploads ./uploads

# Ensure uploads directory exists (if not copied)
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
# We use 'npm run db:api' which maps to 'tsx server.ts'
# Ensure tsx is available (it is in devDependencies, so we kept node_modules from builder)
CMD ["npm", "run", "db:api"]
