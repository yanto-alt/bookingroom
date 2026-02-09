#!/bin/bash

# Script to add PENGELOLA role to database enum in Docker
# and mark the migration as applied in Prisma.

echo "🐘 Adding PENGELOLA role to database enum in Docker container..."

# 1. Add variant to enum directly in Postgres 
docker exec BookingRoom_db psql -U admin -d bookingroom -c "ALTER TYPE \"Role\" ADD VALUE 'PENGELOLA';" 2>/dev/null || echo "   (Note: 'PENGELOLA' might already exist in enum)"

# 2. Mark migration as applied in Prisma
echo "📌 Marking migration as applied in Prisma history..."
docker exec BookingRoom_app npx prisma migrate resolve --applied 20260206120000_add_pengelola_role 2>/dev/null || echo "   (Note: Migration might already be marked as applied)"

# 3. Create/Update Pengelola user using seed
echo "🌱 Seeding database (including Pengelola user)..."
# Copy updated seed.js to container
docker cp prisma/seed.js BookingRoom_app:/app/prisma/seed.js
# Run the seed script directly with node
docker exec BookingRoom_app node prisma/seed.js

echo ""
echo "✅ PENGELOLA role and user setup complete in Docker!"
echo "=================================================="
echo "📝 Login credentials:"
echo "   Email: pengelola@bptapera.go.id"
echo "   Password: pengelola123"
