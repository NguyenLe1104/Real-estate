FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy prisma schema for generate
COPY prisma ./prisma
RUN npx prisma generate

# Copy source (will be overridden by volume mount in dev)
COPY . .

COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh
# CRLF (Windows) làm shebang lỗi → "no such file or directory"
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
