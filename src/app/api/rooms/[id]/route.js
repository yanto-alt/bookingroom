import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;
        const body = await request.json();
        const { name, description, capacity, facilities } = body;

        const room = await prisma.room.update({
            where: { id },
            data: {
                name,
                description,
                capacity,
                facilities,
            },
        });

        return NextResponse.json(room);
    } catch (error) {
        console.error("Room update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const awaitedParams = await params;
        const { id } = awaitedParams;

        await prisma.room.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Room deleted" });
    } catch (error) {
        console.error("Room deletion error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
