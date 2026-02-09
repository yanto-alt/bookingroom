import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;

        await prisma.booking.update({
            where: { id },
            data: { status: 'APPROVED' }
        });

        return NextResponse.json({ message: "Booking approved" });
    } catch (error) {
        console.error("Approve booking error:", error);
        return NextResponse.json({ message: "Failed to approve booking" }, { status: 500 });
    }
}
