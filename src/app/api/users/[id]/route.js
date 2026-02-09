import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

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
        const { name, username, email, password, role, isLdap } = body;

        const updateData = {
            name,
            username: username || null,
            email,
            role,
            isLdap: isLdap || false,
        };

        if (password && !isLdap) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("User update error:", error);
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

        // Prevent deleting self
        if (id === session.user.id) {
            return NextResponse.json({ message: "Cannot delete self" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ message: "User deleted" });
    } catch (error) {
        console.error("User deletion error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
