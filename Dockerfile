# Build stage (use ECR Public to avoid Docker Hub rate limits in CodeBuild)
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Env for build: all /admin/* SSM params are written to admin-build.env by buildspec;
# Next.js loads .env.production at build time.
COPY admin-build.env .env.production

# Build Next.js app (bakes NEXT_PUBLIC_* from .env.production into the bundle)
RUN npm run build

# Production stage
FROM public.ecr.aws/docker/library/node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8083
ENV HOSTNAME="0.0.0.0"

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port 8083 (internal and external, same as API/Frontend pattern)
EXPOSE 8083

# Start the application
CMD ["node", "server.js"]

