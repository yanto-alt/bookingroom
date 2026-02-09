import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_VEHICLE')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { bookingId } = awaitedParams;
        const body = await request.json().catch(() => ({}));
        const { adminNotes } = body;

        if (!bookingId) {
            return NextResponse.json({ message: "Booking ID is missing" }, { status: 400 });
        }

        const updateData = { status: "CANCELLED" };
        if (adminNotes) updateData.adminNotes = adminNotes;

        await prisma.vehicleBooking.update({
            where: { id: bookingId },
            data: updateData,
        });

        return NextResponse.json({ message: "Cancelled" });
    } catch (error) {
        console.error("Vehicle Cancellation error:", error);
        return NextResponse.json({ message: "Failed to cancel" }, { status: 500 });
    }
}
