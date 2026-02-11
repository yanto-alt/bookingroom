#!/bin/bash

# Script to manually run database migrations for the Docker environment

echo "🔄 Running database migrations on Docker container..."
echo "=================================================="

# Check if the container is running
if [ "$(docker ps -q -f name=BookingRoom_app)" ]; then
    echo "📦 Application container is running. Executing migration internally..."
    docker-compose exec app npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration successful!"
    else
        echo "❌ Migration failed!"
        exit 1
    fi
else
    echo "⚠️ Application container is NOT running."
    echo "📦 Attempting to run migration from host via mapped port (5454)..."
    
    # Use the mapped port 5454 to localhost
    export DATABASE_URL="postgresql://admin:password123@localhost:5454/bookingroom?schema=public"
    
    npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ Migration successful!"
    else
        echo "❌ Migration failed! Make sure the database container is running and port 5454 is mapped."
        exit 1
    fi
fi
