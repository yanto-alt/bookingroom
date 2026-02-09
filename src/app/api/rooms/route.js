import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, capacity, facilities } = body;

        const room = await prisma.room.create({
            data: {
                name,
                description,
                capacity,
                facilities,
            },
        });

        return NextResponse.json(room, { status: 201 });
    } catch (error) {
        console.error("Room creation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
