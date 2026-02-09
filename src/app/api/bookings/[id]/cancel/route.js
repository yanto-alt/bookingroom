import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;

        // Check if user owns the booking or is admin
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!booking) {
            return NextResponse.json({ message: "Booking not found" }, { status: 404 });
        }

        if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });

        return NextResponse.json({ message: "Booking cancelled" });
    } catch (error) {
        console.error("Cancel booking error:", error);
        return NextResponse.json({ message: "Failed to cancel booking" }, { status: 500 });
    }
}
