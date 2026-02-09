import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { bookingId } = awaitedParams;
        const body = await request.json().catch(() => ({}));
        const { adminNotes, vehicleId } = body;

        if (!bookingId) {
            return NextResponse.json({ message: "Booking ID is missing" }, { status: 400 });
        }

        const updateData = { status: "APPROVED" };
        if (adminNotes) updateData.adminNotes = adminNotes;
        if (vehicleId) updateData.vehicleId = vehicleId;

        await prisma.vehicleBooking.update({
            where: { id: bookingId },
            data: updateData,
        });

        return NextResponse.json({ message: "Approved" });
    } catch (error) {
        console.error("Vehicle Approval error:", error);
        return NextResponse.json({ message: "Failed to approve" }, { status: 500 });
    }
}
