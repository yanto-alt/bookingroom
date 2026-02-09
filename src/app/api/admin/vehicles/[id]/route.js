import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;
        const body = await request.json();
        const { name, type, licensePlate, capacity, driverName, description, status } = body;

        // Validate
        if (!name || !type || !licensePlate || !capacity) {
            return NextResponse.json(
                { message: "Nama, Tipe, Plat Nomor, dan Kapasitas harus diisi" },
                { status: 400 }
            );
        }

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                name,
                type,
                licensePlate,
                capacity,
                driverName,
                description,
                status: status || "AVAILABLE",
            },
        });

        return NextResponse.json(vehicle);
    } catch (error) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { message: "Plat nomor sudah terdaftar" },
                { status: 409 }
            );
        }
        console.error("Update Vehicle error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;

        // Check for existing bookings
        const bookingsCount = await prisma.vehicleBooking.count({
            where: { vehicleId: id }
        });

        if (bookingsCount > 0) {
            return NextResponse.json(
                { message: "Kendaraan tidak bisa dihapus karena memiliki riwayat pemesanan" },
                { status: 400 }
            );
        }

        await prisma.vehicle.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Vehicle deleted" });
    } catch (error) {
        console.error("Delete Vehicle error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
