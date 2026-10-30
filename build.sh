#!/bin/bash
# Build script for Railway deployment
export DATABASE_URL="file:./prisma/prod.db"
npx prisma@5 db push --schema=./prisma/schema.prisma --skip-generate
npx prisma@5 generate --schema=./prisma/schema.prisma
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run build
