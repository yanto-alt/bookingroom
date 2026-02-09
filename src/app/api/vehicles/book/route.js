import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { vehicleId, startTime, endTime, purpose, destination, driverRequired } = body;

        // Create booking
        const booking = await prisma.vehicleBooking.create({
            data: {
                userId: session.user.id,
                vehicleId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                purpose,
                destination,
                driverRequired: driverRequired || false,
                status: 'PENDING',
            },
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Vehicle booking error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
