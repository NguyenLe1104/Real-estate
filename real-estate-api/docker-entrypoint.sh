#!/bin/sh
set -e

echo "??? Running Prisma migrations..."
npx prisma migrate deploy

echo "???? Seeding database..."
npx prisma db seed || echo "Seed skipped (may already exist)"

echo "???? Starting NestJS in watch mode..."
exec npm run start:dev
