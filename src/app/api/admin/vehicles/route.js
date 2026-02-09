import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, licensePlate, capacity, driverName, description, status } = body;

        // Validate
        if (!name || !type || !licensePlate || !capacity) {
            return NextResponse.json(
                { message: "Nama, Tipe, Plat Nomor, dan Kapasitas harus diisi" },
                { status: 400 }
            );
        }

        // Create Vehicle
        const vehicle = await prisma.vehicle.create({
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

        return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
        // Unique constraint violation for license plate
        if (error.code === 'P2002') {
            return NextResponse.json(
                { message: "Plat nomor sudah terdaftar" },
                { status: 409 }
            );
        }

        console.error("Create Vehicle error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
