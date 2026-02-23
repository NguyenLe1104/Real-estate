echo ">>> Running Prisma migrations..."
npx prisma migrate deploy || true

echo ">>> Seeding database..."
npx prisma db seed || echo "Seed skipped (may already exist)"

echo ">>> Starting NestJS in watch mode..."
exec npm run start:dev
