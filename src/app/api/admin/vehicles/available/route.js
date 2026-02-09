import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startTime = searchParams.get("startTime");
        const endTime = searchParams.get("endTime");
        const excludeBookingId = searchParams.get("excludeBookingId");

        if (!startTime || !endTime) {
            return NextResponse.json({ message: "StartTime and EndTime are required" }, { status: 400 });
        }

        // Find vehicles that have conflicting approved bookings
        const conflictingBookings = await prisma.vehicleBooking.findMany({
            where: {
                status: "APPROVED",
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                OR: [
                    {
                        startTime: { lte: new Date(endTime) },
                        endTime: { gte: new Date(startTime) },
                    },
                ],
            },
            select: { vehicleId: true }
        });

        const conflictingVehicleIds = conflictingBookings.map(b => b.vehicleId);

        // Get all vehicles not in the conflicting list
        const availableVehicles = await prisma.vehicle.findMany({
            where: {
                id: { notIn: conflictingVehicleIds },
                status: "AVAILABLE",
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(availableVehicles);
    } catch (error) {
        console.error("Available Vehicles API error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
