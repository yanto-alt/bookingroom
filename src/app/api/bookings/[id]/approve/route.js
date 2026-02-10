import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA_ROOM')) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;

        const body = await request.json();
        const { status, notes, roomId } = body;

        // Validation
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        const updateData = {
            status,
            notes: notes || undefined,
        };

        if (roomId && status === 'APPROVED') {
            updateData.roomId = roomId;
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: updateData,
            include: { user: true, room: true }
        });

        return NextResponse.json({
            message: `Booking ${status.toLowerCase()}`,
            booking
        });
    } catch (error) {
        console.error("Update booking status error:", error);
        return NextResponse.json({ message: "Failed to update booking" }, { status: 500 });
    }
}
