#!/bin/sh

# Jalankan migrasi Prisma (deploy) sebelum memulai aplikasi
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Jika ada seeder yang perlu dijalankan (opsional)
# echo "Running seed data..."
# npx prisma db seed

# Memulai aplikasi
echo "Starting application..."
exec "$@"
