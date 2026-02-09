#!/bin/bash

# Script to fix the "PENGELOLA" enum value drift in Docker
# Run this BEFORE start-production.sh if you see Role_new errors.

echo "🧹 Cleaning up PENGELOLA role data in Docker..."

# 1. Force update any users with the old role to PENGELOLA_ROOM
docker exec BookingRoom_db psql -U admin -d bookingroom -c "UPDATE \"User\" SET role = 'PENGELOLA_ROOM' WHERE role::text = 'PENGELOLA';"

echo "✅ Data cleanup complete. You can now run ./start-production.sh"
