import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, username, email, password, role, isLdap } = body;

        // Check if email or username already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username: username || undefined }
                ]
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email atau Username sudah digunakan" },
                { status: 400 }
            );
        }

        // Hash password if provided and not LDAP user
        let hashedPassword = null;
        if (password && !isLdap) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.create({
            data: {
                name,
                username: username || null,
                email,
                password: hashedPassword,
                role,
                isLdap: isLdap || false,
            },
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("User creation error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
