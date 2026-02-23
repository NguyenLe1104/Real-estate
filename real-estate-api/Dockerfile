FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy prisma schema for generate
COPY prisma ./prisma
RUN npx prisma generate

# Copy source (will be overridden by volume mount in dev)
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./docker-entrypoint.sh"]
