#!/bin/bash

# Script untuk menjalankan aplikasi dengan Docker (Production)

echo "🚀 Starting BP TAPERA Meeting Room Booking System (Production)"
echo "=================================================="

# Build dan start semua services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Tunggu database siap
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
docker-compose exec app npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
docker-compose exec app npx prisma db seed

echo ""
echo "✅ Application is ready!"
echo "=================================================="
echo "🌐 Application: http://localhost:4000"
echo ""
echo "📝 Login credentials:"
echo "   Email: admin@bptapera.go.id"
echo "   Password: admin123"
echo ""
echo "To stop: docker-compose down"
echo "To view logs: docker-compose logs -f app"
