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
        const { roomId, title, description, startTime, endTime } = body;

        // Validate times
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return NextResponse.json(
                { message: "Waktu selesai harus setelah waktu mulai" },
                { status: 400 }
            );
        }

        // Check for conflicts
        const conflicts = await prisma.booking.findMany({
            where: {
                roomId,
                status: { in: ['PENDING', 'APPROVED'] },
                OR: [
                    {
                        AND: [
                            { startTime: { lte: start } },
                            { endTime: { gt: start } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: end } },
                            { endTime: { gte: end } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { gte: start } },
                            { endTime: { lte: end } },
                        ],
                    },
                ],
            },
        });

        if (conflicts.length > 0) {
            return NextResponse.json(
                { message: "Ruang meeting sudah dipesan pada waktu tersebut" },
                { status: 400 }
            );
        }

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                userId: session.user.id,
                roomId,
                title,
                description,
                startTime: start,
                endTime: end,
                status: 'PENDING',
            },
        });

        return NextResponse.json(booking, { status: 201 });
    } catch (error) {
        console.error("Booking error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
