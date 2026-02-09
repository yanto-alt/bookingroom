#!/bin/bash

# Script untuk menerapkan tabel kendaraan ke database di Docker
# Pastikan kontainer db (BookingRoom_db) sedang berjalan

echo "Terapkan skema tabel kendaraan ke BookingRoom_db..."

docker exec -i BookingRoom_db psql -U admin -d bookingroom < add-vehicle-tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Berhasil menambahkan tabel kendaraan!"
else
    echo "❌ Gagal menambahkan tabel. Pastikan kontainer db sedang berjalan."
fi
