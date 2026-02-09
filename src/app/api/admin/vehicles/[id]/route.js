import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

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
                status,
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

        // Check if vehicle has bookings
        const vehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { bookings: true },
                },
            },
        });

        if (vehicle._count.bookings > 0) {
            return NextResponse.json(
                { message: `Kendaraan memiliki ${vehicle._count.bookings} pemesanan. Hapus pemesanan terlebih dahulu.` },
                { status: 400 }
            );
        }

        await prisma.vehicle.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        console.error("Delete Vehicle error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
