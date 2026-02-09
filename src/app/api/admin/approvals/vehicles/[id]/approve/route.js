import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request, { params }) {
    try {
        const session = await auth();
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PENGELOLA')) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        const { id } = params;

        await prisma.vehicleBooking.update({
            where: { id },
            data: { status: "APPROVED" },
        });

        return NextResponse.redirect(new URL("/admin/approvals/vehicles", request.url), { status: 303 });
    } catch (error) {
        console.error("Vehicle Approval error:", error);
        return NextResponse.redirect(new URL("/admin/approvals/vehicles?error=failed", request.url), { status: 303 });
    }
}
