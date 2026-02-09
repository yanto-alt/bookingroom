import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { vehicleId, startTime, endTime, purpose, destination, driverRequired } = body;

        // Validate input
        if (!vehicleId || !startTime || !endTime || !purpose || !destination) {
            return NextResponse.json(
                { message: "Semua field harus diisi" },
                { status: 400 }
            );
        }

        // Check availability
        const conflictingBooking = await prisma.vehicleBooking.findFirst({
            where: {
                vehicleId,
                status: "APPROVED",
                OR: [
                    {
                        startTime: { lte: new Date(endTime) },
                        endTime: { gte: new Date(startTime) },
                    },
                ],
            },
        });

        if (conflictingBooking) {
            return NextResponse.json(
                { message: "Kendaraan tidak tersedia pada jam tersebut" },
                { status: 409 }
            );
        }

        // Create Booking
        const booking = await prisma.vehicleBooking.create({
            data: {
                userId: session.user.id,
                vehicleId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                purpose,
                destination,
                driverRequired,
                status: "PENDING",
            },
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Vehicle Booking error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
